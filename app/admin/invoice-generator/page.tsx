"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';

interface Client {
    id: string;
    full_name: string;
    email: string;
    company_name?: string;
    address?: string;
}

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
}

interface BasketItem {
    id: string;
    fileName: string;
    blob: Blob;
    previewUrl: string;
    type: 'project' | 'maintenance';
    amountDue: number;
    clientId: string;
    clientEmail: string;
}

interface DiscoveryLog {
    id: string;
    discovery_number: string;
    client_name: string;
    client_email: string;
    project_type: string;
    details: any;
    estimated_price: number;
    created_at: string;
}

const PROFORMA_NOTES = "This is a proforma summary document.\nThe official tax invoice will be issued and sent separately by TENTOO.\n\nPlease process your payment strictly using the IBAN and structured reference provided in the official TENTOO document once received.";

const formatDateToDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
};

export default function AdminProjectSummaryGeneratorPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // WIZARD STATE (1: Generator Form, 2: Preview, 3: Success Screen / Basket)
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    
    // DATA STATES
    const [clients, setClients] = useState<Client[]>([]);
    const [discoveryLogs, setDiscoveryLogs] = useState<DiscoveryLog[]>([]);
    
    // FORM STATES
    const [selectedLogId, setSelectedLogId] = useState<string>('');
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [documentNumber, setDocumentNumber] = useState(`PRJ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-001`);
    const [projectName, setProjectName] = useState('Custom System Deployment');
    const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
    const [invoiceType, setInvoiceType] = useState<'project' | 'maintenance'>('project');
    
    const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: 'Infrastructure & Engineering Setup', quantity: 1, rate: 0 }]);
    const [discount, setDiscount] = useState<number>(0);
    const [notes, setNotes] = useState(PROFORMA_NOTES);

    // PREVIEW STATES
    const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
    const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // BASKET STATES
    const [basket, setBasket] = useState<BasketItem[]>([]);
    const [uploading, setUploading] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') {
                router.push('/client/login');
                return;
            }
            setIsAdmin(true);

            // Fetch Data
            const { data: cData } = await supabase.from('clients').select('*').is('archived_at', null).order('full_name');
            if (cData) setClients(cData);

            const { data: dData } = await supabase.from('project_discovery').select('*').order('created_at', { ascending: false });
            if (dData) setDiscoveryLogs(dData);

            setLoading(false);
        };
        init();
    }, [router]);

    // AUTO-LINK DISCOVERY TO CLIENT & POPULATE DETAILS
    useEffect(() => {
        if (!selectedLogId || invoiceType === 'maintenance') return;

        const log = discoveryLogs.find(l => l.id === selectedLogId);
        if (!log) return;

        // Auto Select Client
        const matchedClient = clients.find(c => c.email.toLowerCase() === log.client_email.toLowerCase());
        if (matchedClient) {
            setSelectedClientId(matchedClient.id);
        } else {
            setSelectedClientId('');
            showToast("Warning: Target entity not found in database. Select manually.", "info");
        }

        const resolvedProjectName = log.project_type || 'Custom System Deployment';
        setProjectName(resolvedProjectName);

        // Construct Detailed Description from Discovery Details
        let detailedDesc = `Project: ${resolvedProjectName}\n\nProject Specifications:\n`;
        if (log.details && typeof log.details === 'object') {
            Object.entries(log.details).forEach(([key, value]) => {
                const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                detailedDesc += `• ${readableKey}: ${value}\n`;
            });
        }

        setItems([{
            id: Math.random().toString(36).substring(7),
            description: detailedDesc.trim(),
            quantity: 1,
            rate: log.estimated_price || 0
        }]);
    }, [selectedLogId, discoveryLogs, clients]);

    // HANDLE INVOICE TYPE CHANGE (PROJECT VS MAINTENANCE)
    const handleInvoiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as 'project' | 'maintenance';
        setInvoiceType(newType);

        if (newType === 'maintenance') {
            setDocumentNumber(`SUB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
            setProjectName('Monthly Subscription Retainer');
            setItems([{
                id: Math.random().toString(36).substring(7),
                description: 'Essential Security & Maintenance Retainer (Monthly)\n• Real-time Security Monitoring\n• Database Backup & Stability\n• Cloud Infrastructure Load Balancing',
                quantity: 1,
                rate: 299
            }]);
        } else {
            setDocumentNumber(`PRJ-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
            if (selectedLogId) {
                const log = discoveryLogs.find(l => l.id === selectedLogId);
                if (log) {
                    const resolvedProjectName = log.project_type || 'Custom System Deployment';
                    setProjectName(resolvedProjectName);

                    let detailedDesc = `Project: ${resolvedProjectName}\n\nProject Specifications:\n`;
                    if (log.details && typeof log.details === 'object') {
                        Object.entries(log.details).forEach(([key, value]) => {
                            const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                            detailedDesc += `• ${readableKey}: ${value}\n`;
                        });
                    }

                    setItems([{
                        id: Math.random().toString(36).substring(7),
                        description: detailedDesc.trim(),
                        quantity: 1,
                        rate: log.estimated_price || 0
                    }]);
                }
            } else {
                setProjectName('Custom System Deployment');
                setItems([{
                    id: Math.random().toString(36).substring(7),
                    description: 'Infrastructure & Engineering Setup',
                    quantity: 1,
                    rate: 0
                }]);
            }
        }
    };

    const handleAddItem = () => setItems([...items, { id: Math.random().toString(36).substring(7), description: '', quantity: 1, rate: 0 }]);
    const handleRemoveItem = (id: string) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
    const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    
    const calculateTotal = () => {
        const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
        return Math.max(0, subtotal - discount);
    };

    const finalTotal = calculateTotal();
    
    const generatePDF = async () => {
        if (!selectedClientId) return showToast("Target Entity is required.", "error");
        if (items.length === 0 || !items[0].description) return showToast("At least one valid line item is required.", "error");
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;

        setIsGenerating(true);
        try {
            // Dinamik Yükseklik Simülasyonu
            const tempDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            let simulatedY = 105;

            tempDoc.setFontSize(10);
            items.forEach((item) => {
                const splitDesc = tempDoc.splitTextToSize(item.description, 110);
                const rowHeight = splitDesc.length * 4.5;
                simulatedY += rowHeight + 2 + 6;
            });
            simulatedY += 10 + 8 + (discount > 0 ? 6 : 0) + 12;

            tempDoc.setFontSize(8);
            const splitNotes = tempDoc.splitTextToSize(notes, tempDoc.internal.pageSize.getWidth() - 40);
            simulatedY += 15 + (splitNotes.length * 4);

            const margin = 20;
            const minHeight = 150;
            const a4Height = 297;

            let finalFormat: any = 'a4';
            if (simulatedY < a4Height) {
                const calculatedHeight = Math.max(minHeight, simulatedY + margin);
                finalFormat = [210, calculatedHeight];
            }

            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: finalFormat
            });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Pürüzsüz beyaz arka plan (Grid yok)
            doc.setFont("helvetica");

            // --- 1. HEADER (Logo & Brand) ---
            try {
                const img = new Image();
                img.src = '/logo.png';
                doc.addImage(img, 'PNG', margin, 15, 20, 20);

                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(30, 30, 30);
                doc.text("NOVATRUM INFRASTRUCTURE & ENGINEERING", margin, 42);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text("Belgium, Flanders", margin, 47);
                doc.text("info@novatrum.eu | novatrum.eu", margin, 52);

            } catch (e) {
                doc.setFontSize(28);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(10, 10, 10);
                doc.text("NOVATRUM", margin, 25);

                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(30, 30, 30);
                doc.text("INFRASTRUCTURE & ENGINEERING", margin, 38);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(100, 100, 100);
                doc.text("Belgium, Flanders", margin, 43);
                doc.text("info@novatrum.eu | novatrum.eu", margin, 48);
            }

            // --- 2. DOCUMENT TITLE & DETAILS ---
            const pdfTitle = invoiceType === 'maintenance' ? 'SUBSCRIPTION SUMMARY' : 'PROJECT SUMMARY';
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(10, 10, 10);
            doc.text(pdfTitle, pageWidth - margin, 25, { align: 'right' });
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);

            const detailsStartY = 38;
            doc.text("Document No:", pageWidth - margin - 45, detailsStartY);
            doc.text("Date of Issue:", pageWidth - margin - 45, detailsStartY + 6);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(10, 10, 10);
            doc.text(documentNumber, pageWidth - margin, detailsStartY, { align: 'right' });
            doc.text(formatDateToDDMMYYYY(documentDate), pageWidth - margin, detailsStartY + 6, { align: 'right' });
            
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.3);
            doc.line(margin, 58, pageWidth - margin, 58);

            // --- 3. CLIENT BOX ---
            const clientStartY = 68;
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(120, 120, 120);
            doc.text("PREPARED FOR:", margin, clientStartY);

            let currentClientY = clientStartY + 7;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(10, 10, 10);

            if (client.company_name) {
                doc.text(client.company_name, margin, currentClientY);
                currentClientY += 5;
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text(`Attn: ${client.full_name}`, margin, currentClientY);
                currentClientY += 5;
            } else {
                doc.text(client.full_name, margin, currentClientY);
                currentClientY += 5;
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
            }

            doc.setTextColor(80, 80, 80);
            if (client.address) {
                const splitAddress = doc.splitTextToSize(client.address, 80);
                doc.text(splitAddress, margin, currentClientY);
                currentClientY += (splitAddress.length * 5);
            }
            doc.text(client.email, margin, currentClientY);

            // --- 4. TABLE HEADER ---
            let currentY = 105;
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50, 50, 50);
            doc.text("DESCRIPTION", margin + 2, currentY);
            doc.text("QTY", pageWidth - 70, currentY, { align: 'center' });
            doc.text("PRICE", pageWidth - 45, currentY, { align: 'center' });
            doc.text("AMOUNT", pageWidth - margin - 2, currentY, { align: 'right' });
            
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, currentY + 3, pageWidth - margin, currentY + 3);

            // --- 5. TABLE ITEMS ---
            currentY += 12;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 30, 30);

            const subtotalAmount = items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
            
            items.forEach((item) => {
                const splitDesc = doc.splitTextToSize(item.description, 110);
                const rowHeight = splitDesc.length * 4.5;
                const amount = item.quantity * item.rate;

                if (finalFormat === 'a4' && currentY + rowHeight > pageHeight - 50) {
                    doc.addPage();
                    currentY = margin + 10;
                }

                doc.text(splitDesc, margin + 2, currentY);
                doc.text(item.quantity.toString(), pageWidth - 70, currentY, { align: 'center' });
                doc.text(item.rate.toString(), pageWidth - 45, currentY, { align: 'center' });
                doc.text(amount.toFixed(2), pageWidth - margin - 2, currentY, { align: 'right' });

                currentY += rowHeight + 2;

                doc.setDrawColor(245, 245, 245);
                doc.setLineWidth(0.3);
                doc.line(margin, currentY, pageWidth - margin, currentY);
                currentY += 6;
            });

            // --- 6. TOTALS SECTION ---
            if (finalFormat === 'a4' && currentY > pageHeight - 75) {
                doc.addPage();
                currentY = margin + 10;
            }

            const totalBoxWidth = 70;
            const totalBoxX = pageWidth - margin - totalBoxWidth;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80, 80, 80);

            doc.text("Subtotal", totalBoxX, currentY);
            doc.text(subtotalAmount.toFixed(2), pageWidth - margin - 2, currentY, { align: 'right' });
            
            if (discount > 0) {
                currentY += 6;
                doc.text("Discount", totalBoxX, currentY);
                doc.text(`-${discount.toFixed(2)}`, pageWidth - margin - 2, currentY, { align: 'right' });
            }

            currentY += 8;

            doc.setFillColor(248, 248, 248);
            doc.rect(totalBoxX - 5, currentY - 6, totalBoxWidth + 10, 12, 'F');

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(10, 10, 10);
            doc.text("TOTAL AMOUNT", totalBoxX, currentY + 2);
            doc.setFontSize(12);
            doc.text(formatCurrency(finalTotal), pageWidth - margin - 2, currentY + 2, { align: 'right' });

            // --- 7. FOOTER NOTICES ---
            const footerY = finalFormat === 'a4' ? pageHeight - 40 : currentY + 20;

            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50, 50, 50);
            doc.text("IMPORTANT NOTICES:", margin, footerY);
            
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text(splitNotes, margin, footerY + 5);

            // Output PDF
            const pdfBlob = doc.output('blob');
            const previewUrl = URL.createObjectURL(pdfBlob);

            setGeneratedPdfBlob(pdfBlob);
            setGeneratedPdfUrl(previewUrl);

            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error: any) {
            showToast("Failed to generate document: " + error.message, "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleBackToEdit = () => {
        setCurrentStep(1);
    };

    const addToBasket = () => {
        if (!generatedPdfBlob || !generatedPdfUrl || !selectedClientId) return;
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;

        const clientSafeName = client.company_name?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || client.full_name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const safeProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${documentNumber}_${safeProjectName}.pdf`;

        const newItem: BasketItem = {
            id: Math.random().toString(36).substring(7),
            fileName: fileName,
            blob: generatedPdfBlob,
            previewUrl: generatedPdfUrl,
            type: invoiceType,
            amountDue: finalTotal,
            clientId: client.id,
            clientEmail: client.email
        };
        
        setBasket([...basket, newItem]);
        showToast("Document added to Draft Basket.", "success");
        setCurrentStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetFormAndGoToStep1 = () => {
        const prefix = invoiceType === 'maintenance' ? 'SUB' : 'PRJ';
        const nextDocNum = parseInt(documentNumber.split('-').pop() || '0') + 1;
        setDocumentNumber(`${prefix}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(nextDocNum).padStart(3, '0')}`);

        setGeneratedPdfBlob(null);
        setGeneratedPdfUrl(null);
        setSelectedLogId('');

        if (invoiceType === 'maintenance') {
            setItems([{ id: Math.random().toString(), description: 'Essential Security & Maintenance Retainer (Monthly)\n• Real-time Security Monitoring\n• Database Backup & Stability\n• Cloud Infrastructure Load Balancing', quantity: 1, rate: 299 }]);
        } else {
            setItems([{ id: Math.random().toString(), description: 'Infrastructure & Engineering Setup', quantity: 1, rate: 0 }]);
        }

        setDiscount(0);
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const removeFromBasket = (id: string) => {
        setBasket(basket.filter(item => item.id !== id));
    };

    const uploadBasketToLedger = async () => {
        if (basket.length === 0) return;
        setUploading(true);

        try {
            for (const item of basket) {
                const filePath = `invoices/${item.clientId}/${item.fileName}`;
                const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, item.blob, {
                    contentType: 'application/pdf',
                    upsert: true
                });
                
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
                
                const { error: dbError } = await supabase.from('client_invoices').insert({
                    client_id: item.clientId,
                    file_name: item.fileName,
                    file_url: publicUrl,
                    status: 'draft'
                 });

                if (dbError) throw dbError;
            }

            showToast("All documents successfully pushed to Financial Ledger.", "success");
            setBasket([]);
            resetFormAndGoToStep1();
        } catch (error: any) {
            showToast("Upload failed: " + error.message, "error");
        } finally {
            setUploading(false);
        }
    };
    
    if (loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-bold uppercase text-[10px] tracking-widest text-zinc-400">Authenticating Secure Node...</div>;
    
    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans relative overflow-x-hidden selection:bg-black selection:text-white">

            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.25]">
                <div className="absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_50%,transparent_100%)] bg-[linear-gradient(#d4d4d8_1px,transparent_1px),linear-gradient(90deg,#d4d4d8_1px,transparent_1px)]" />
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl z-[9999] ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-zinc-50 text-zinc-900 border-zinc-200'}`}
                    >
                        {toast.type === 'success' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                        {toast.type === 'error' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        {toast.type === 'info' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 p-6 md:p-10 lg:p-14 max-w-5xl mx-auto w-full relative z-10 custom-scrollbar overflow-y-auto">

                <button onClick={() => router.push('/admin/dashboard')} className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit appearance-none">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Workspace
                </button>

                <div className="w-full animate-in fade-in duration-500">
                    <AnimatePresence mode="wait">
                        {/* ================= STEP 1: GENERATOR FORM ================= */}
                        {currentStep === 1 && (
                            <motion.div
                               key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Project Summary Generator</h1>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Create formal project agreements and link to entities.</p>
                                    </div>
                                    {/* BASKET BADGE BUTTON */}
                                    {basket.length > 0 && (
                                        <button
                                            onClick={() => setCurrentStep(3)}
                                            className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-zinc-200 shadow-sm animate-in fade-in slide-in-from-top-4 hover:border-black transition-colors appearance-none"
                                            title="View Basket"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Draft Basket:</span>
                                            <span className="bg-black text-white px-2 py-0.5 rounded-full text-[9px] font-mono">{basket.length}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-zinc-200">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6 border-b border-zinc-100 pb-4">Data Synchronization</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1 flex justify-between">
                                                <span>1. Pull from Discovery</span>
                                                {discoveryLogs.length === 0 && <span className="text-zinc-300">No logs found</span>}
                                            </label>
                                            <select value={selectedLogId} onChange={(e) => setSelectedLogId(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black transition-all appearance-none cursor-pointer">
                                                <option value="">Start from blank...</option>
                                                {discoveryLogs.map(log => (
                                                    <option key={log.id} value={log.id}>{log.discovery_number} - {log.client_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 block mb-2 ml-1">2. Target Verified Entity</label>
                                            <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full bg-emerald-50/50 border border-emerald-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-emerald-500 transition-all appearance-none cursor-pointer">
                                                <option value="" disabled>Select target client...</option>
                                                {clients.map(c => (
                                                    <option key={c.id} value={c.id}>{c.company_name ? `${c.company_name} (${c.full_name})` : c.full_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-zinc-200">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-6 border-b border-zinc-100 pb-4">Project Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        <div className="lg:col-span-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Document Number</label>
                                            <input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium font-mono outline-none focus:bg-white focus:border-black transition-all appearance-none" />
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Document Type</label>
                                            <select value={invoiceType} onChange={handleInvoiceTypeChange} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black transition-all appearance-none cursor-pointer">
                                                <option value="project">Project / Setup</option>
                                                <option value="maintenance">Subscription / Maintenance</option>
                                            </select>
                                        </div>
                                        <div className="lg:col-span-2">
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Project/Service Name</label>
                                            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black transition-all appearance-none" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Date of Issue</label>
                                            <input type="date" value={documentDate} onChange={(e) => setDocumentDate(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black transition-all appearance-none" />
                                        </div>
                                    </div>

                                    {/* LINE ITEMS */}
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Line Items & Scope</label>
                                            <button onClick={handleAddItem} className="text-[9px] font-bold uppercase tracking-widest text-black hover:bg-zinc-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 appearance-none border border-zinc-200">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Add Row
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {items.map((item, index) => (
                                                <div key={item.id} className="flex flex-col sm:flex-row items-start gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 group">
                                                    <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[9px] font-bold text-zinc-500 shrink-0 hidden sm:flex mt-3">{index + 1}</div>
                                                    <textarea
                                                        value={item.description}
                                                        onChange={e => handleItemChange(item.id, 'description', e.target.value)}
                                                        placeholder="Detailed description of service..."
                                                        className="flex-1 bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-black w-full min-h-[100px] resize-y"
                                                    />
                                                    <div className="flex w-full sm:w-auto items-center gap-3 sm:mt-3">
                                                        <div className="w-20">
                                                            <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)} className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-black text-center" />
                                                        </div>
                                                        <div className="w-28 relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">€</span>
                                                            <input type="number" min="0" value={item.rate} onChange={e => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-zinc-200 pl-8 pr-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-black font-mono" />
                                                        </div>
                                                        <button onClick={() => handleRemoveItem(item.id)} disabled={items.length === 1} className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 shrink-0">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-zinc-100 pt-8">
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Important Notices & Terms</label>
                                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-black transition-all h-32 resize-none appearance-none" />
                                        </div>
                                        <div className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-200 flex flex-col justify-center">
                                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-200">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Discount (Optional)</span>
                                                <input type="number" min="0" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-medium outline-none focus:border-black text-right font-mono" />
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase tracking-widest text-black">Total Payable</span>
                                                <span className="text-2xl font-light font-mono text-black">{formatCurrency(finalTotal)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={generatePDF} disabled={isGenerating} className="w-full bg-black text-white py-5 rounded-[20px] text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md active:scale-95 flex items-center justify-center gap-3 appearance-none">
                                    {isGenerating ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Generate Document & View Preview'}
                                    {!isGenerating && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                                </button>
                            </motion.div>
                        )}

                        {/* ================= STEP 2: PDF PREVIEW ================= */}
                        {currentStep === 2 && generatedPdfUrl && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <div className="bg-white p-6 md:p-8 rounded-[40px] border border-zinc-200 shadow-sm flex flex-col space-y-6">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-100 pb-6">
                                        <button onClick={handleBackToEdit} className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Back to Edit
                                        </button>
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Step 2: Verification</h3>
                                        <button onClick={addToBasket} className="bg-emerald-500 text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md hover:bg-emerald-600 active:scale-95 flex items-center gap-3 appearance-none">
                                            Confirm & Add to Basket <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        </button>
                                    </div>
                                    <div className="w-full h-[600px] md:h-[800px] bg-zinc-100 rounded-[24px] border border-zinc-200 overflow-hidden shadow-inner">
                                        <iframe src={generatedPdfUrl} className="w-full h-full border-none" title="PDF Preview" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ================= STEP 3: SUCCESS & BASKET VIEW ================= */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="w-full flex flex-col items-center justify-center pt-10"
                            >
                                <div className="text-center mb-16">
                                    <div className="w-24 h-24 bg-emerald-50 rounded-full border-8 border-emerald-100 flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h2 className="text-3xl font-light tracking-tight text-black mb-2">Document Queued</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Successfully added to Draft Basket.</p>

                                    <button onClick={resetFormAndGoToStep1} className="mt-8 px-8 py-3.5 bg-zinc-50 hover:bg-zinc-100 text-black border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm flex items-center gap-3 mx-auto">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Create New Document
                                    </button>
                                </div>

                                <div className="w-full max-w-4xl bg-white p-8 md:p-12 rounded-[40px] border border-zinc-200 shadow-sm flex flex-col">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-8 border-b border-zinc-100 pb-4 flex justify-between items-center">
                                        Draft Basket
                                        <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full">{basket.length} Documents</span>
                                    </h3>

                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-10 max-h-[400px]">
                                        <AnimatePresence>
                                            {basket.map(item => (
                                                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-800 truncate mb-1">{item.fileName}</p>
                                                        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                                            <span>{item.clientEmail}</span>
                                                            <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
                                                            <span className="text-black font-mono">{formatCurrency(item.amountDue)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <a href={item.previewUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl text-[9px] font-bold uppercase tracking-widest text-zinc-600 transition-colors">Preview</a>
                                                        <button onClick={() => removeFromBasket(item.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors bg-white border border-zinc-200">
                                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {basket.length === 0 && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">Basket is empty.</motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <button
                                        onClick={uploadBasketToLedger}
                                        disabled={basket.length === 0 || uploading}
                                        className="w-full bg-black text-white py-5 rounded-[20px] text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-md active:scale-95 flex justify-center items-center gap-3 appearance-none mt-auto"
                                    >
                                        {uploading ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Push All to Ledger Database'}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <footer className="mt-20 pb-10 text-center relative z-10">
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-zinc-300">Novatrum // Financial Systems</p>
                </footer>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
            `}} />
        </div>
    );
}