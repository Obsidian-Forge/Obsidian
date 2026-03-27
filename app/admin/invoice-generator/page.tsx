"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
}

const DEFAULT_NOTES = "Work commences upon receipt of the initial deposit. Final handover and source code transfer upon full payment.\n\nEXCLUSIONS: Third-party costs including domain registration, premium hosting, and external software subscriptions are explicitly excluded from this estimate and are to be maintained directly by the client.";

// Tarih formatlayıcı (YYYY-MM-DD -> DD/MM/YYYY)
const formatDateToDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
};

// KUSURSUZ TARİH KUTUSU
const SmartDateInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
    const displayValue = formatDateToDDMMYYYY(value);
    
    return (
        <div>
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">{label}</label>
            <div className="relative w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl focus-within:border-black transition-colors flex justify-between items-center group">
                <span className="text-xs font-bold text-zinc-900 select-none">{displayValue || 'DD/MM/YYYY'}</span>
                <svg className="w-4 h-4 text-zinc-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                {/* Görünmez gerçek tarih seçici */}
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
            </div>
        </div>
    );
};

export default function InvoiceGeneratorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const [clients, setClients] = useState<any[]>([]);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    
    const [selectedDiscoveryId, setSelectedDiscoveryId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [importType, setImportType] = useState<'project' | 'maintenance'>('project');
    
    // Custom Dropdown States
    const [isDiscDropdownOpen, setIsDiscDropdownOpen] = useState(false);
    const [discSearch, setDiscSearch] = useState('');
    
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');

    // BANKA SEÇİMİ VE YENİ BANKA EKLEME
    const [selectedBankId, setSelectedBankId] = useState<string>('');
    const [isAddingNewBank, setIsAddingNewBank] = useState(false);
    const [newBankForm, setNewBankForm] = useState({ bankName: '', accountName: '', iban: '', swift: '' });

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `INV-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        notes: DEFAULT_NOTES,
        installments: 1
    });

    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [pdfUrls, setPdfUrls] = useState<string[]>([]);
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [generationState, setGenerationState] = useState<'form' | 'preview'>('form');

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') return router.push('/client/login');
            setIsAdmin(true);
            
            const [clientsRes, discRes, banksRes] = await Promise.all([
                supabase.from('clients').select('*').is('archived_at', null).order('created_at', { ascending: false }),
                supabase.from('project_discovery').select('*').order('created_at', { ascending: false }),
                supabase.from('admin_bank_accounts').select('*').order('created_at', { ascending: true })
            ]);
            
            let loadedDisc = discRes.data || [];
            let loadedClients = clientsRes.data || [];

            const clientsWithDiscInfo = loadedClients.map(c => {
                const match = loadedDisc.find(d => d.client_email?.toLowerCase() === c.email?.toLowerCase());
                return { ...c, discovery_number: match?.discovery_number || '' };
            });

            setClients(clientsWithDiscInfo);
            setDiscoveries(loadedDisc);

            if (banksRes.data && banksRes.data.length > 0) {
                setBankAccounts(banksRes.data);
                setSelectedBankId(banksRes.data[0].id);
            }
            setLoading(false);
        };
        init();
    }, [router]);

    const filteredDiscoveries = discoveries.filter(d => {
        const term = discSearch.toLowerCase();
        return (d.client_name?.toLowerCase() || '').includes(term) || 
               (d.discovery_number?.toLowerCase() || '').includes(term);
    });

    const filteredClients = clients.filter(c => {
        const term = clientSearch.toLowerCase();
        return (c.full_name?.toLowerCase() || '').includes(term) || 
               (c.email?.toLowerCase() || '').includes(term) ||
               (c.discovery_number?.toLowerCase() || '').includes(term) ||
               (c.access_code?.toLowerCase() || '').includes(term);
    });

    const handleSaveNewBank = async () => {
        if (!newBankForm.bankName || !newBankForm.iban || !newBankForm.accountName) {
            return alert("Bank Name, Account Name and IBAN are required.");
        }
        
        try {
            const { data, error } = await supabase.from('admin_bank_accounts').insert({
                bank_name: newBankForm.bankName,
                account_name: newBankForm.accountName,
                iban: newBankForm.iban,
                swift: newBankForm.swift
            }).select().single();

            if (error) throw error;

            setBankAccounts([...bankAccounts, data]);
            setSelectedBankId(data.id);
            setIsAddingNewBank(false);
            setNewBankForm({ bankName: '', accountName: '', iban: '', swift: '' });
            alert("New bank account saved to database!");
        } catch (err: any) {
            alert("Error saving bank: " + err.message);
        }
    };

    const handleDeleteBank = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to permanently delete this bank account?")) return;
        
        try {
            const { error } = await supabase.from('admin_bank_accounts').delete().eq('id', id);
            if (error) throw error;
            
            const updatedBanks = bankAccounts.filter(b => b.id !== id);
            setBankAccounts(updatedBanks);
            if (selectedBankId === id) setSelectedBankId(updatedBanks.length > 0 ? updatedBanks[0].id : '');
        } catch (err: any) { alert("Error deleting bank: " + err.message); }
    };

    const handleLoadDiscovery = () => {
        const disc = discoveries.find(d => d.id === selectedDiscoveryId);
        if (!disc) return;

        let newItems: InvoiceItem[] = [];

        if (importType === 'project') {
            newItems = [{ id: '1', description: `Core Architecture: ${disc.project_type || 'Custom Software'}`, quantity: 1, rate: disc.estimated_price || 0 }];
            setInvoiceData(prev => ({ 
                ...prev, 
                notes: DEFAULT_NOTES, 
                installments: 1,
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }));
        } else {
            const maintString = disc.details?.Maintenance || '';
            let maintPrice = 0;
            if (maintString && maintString !== 'None') {
                const match = maintString.match(/€(\d+)/);
                if (match) maintPrice = parseInt(match[1]);
            }

            if (maintPrice === 0) {
                alert("This client does not have a Monthly Maintenance plan in their blueprint.");
                return;
            }

            newItems = [{ id: '1', description: `Continuous Engineering & Maintenance Retainer`, quantity: 1, rate: maintPrice }];
            
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            const futureDateString = futureDate.toISOString().split('T')[0];
            
            const futureDueDate = new Date(futureDate);
            futureDueDate.setDate(futureDueDate.getDate() + 14); 
            const futureDueDateString = futureDueDate.toISOString().split('T')[0];

            setInvoiceData(prev => ({ 
                ...prev, 
                notes: "This is a recurring monthly retainer invoice for ongoing engineering, server monitoring, and platform maintenance.", 
                installments: 1,
                date: futureDateString,
                dueDate: futureDueDateString
            }));
        }
        
        setInvoiceData(prev => ({
            ...prev,
            clientName: disc.client_name || '',
            clientEmail: disc.client_email || '',
            clientAddress: disc.details?.Company || 'N/A'
        }));
        setItems(newItems);

        const matchedClient = clients.find(c => c.email?.toLowerCase() === disc.client_email?.toLowerCase());
        if (matchedClient) setSelectedClientId(matchedClient.id);
        else setSelectedClientId('');
    };

    const handleLoadClient = () => {
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;
        setInvoiceData(prev => ({
            ...prev,
            clientName: client.full_name || '',
            clientEmail: client.email || '',
            clientAddress: client.address || ''
        }));
    };

    const addItem = () => setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, rate: 0 }]);
    const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
    };

    const calculateSubTotal = () => items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
    
    const createInvoicePDF = async (partNumber: number, totalParts: number): Promise<Blob> => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        const activeBank = bankAccounts.find(b => b.id === selectedBankId);

        const loadImage = (url: string): Promise<string> => {
            return new Promise((resolve) => {
                const img = new Image(); img.src = url;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width; canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png"));
                };
                img.onerror = () => resolve("");
            });
        };

        const logoData = await loadImage("/logo.png");
        if (logoData) {
            doc.addImage(logoData, 'PNG', 20, y, 16, 16);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text("NOVATRUM", 42, y + 12);
        } else {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(24);
            doc.text("NOVATRUM", 20, y + 12);
        }

        const isInstallment = totalParts > 1;
        const currentInvoiceNumber = isInstallment ? `${invoiceData.invoiceNumber}-P${partNumber}` : invoiceData.invoiceNumber;
        
        // GÜNCELLENDİ: Tarihleri "Ay + 1" mantığıyla hatasız atar
        const baseDueDate = new Date(invoiceData.dueDate);
        baseDueDate.setMonth(baseDueDate.getMonth() + (partNumber - 1));
        const currentDueDate = baseDueDate.toISOString().split('T')[0];

        const displayIssueDate = formatDateToDDMMYYYY(invoiceData.date);
        const displayDueDate = formatDateToDDMMYYYY(currentDueDate);

        const subTotal = calculateSubTotal();
        const amountDue = subTotal / totalParts;

        doc.setFontSize(20);
        doc.setTextColor(24, 24, 27);
        doc.text("INVOICE", pageWidth - 20, y + 8, { align: "right" });
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122);
        doc.text(`Ref Number: ${currentInvoiceNumber}`, pageWidth - 20, y + 15, { align: "right" });
        doc.text(`Issue Date: ${displayIssueDate}`, pageWidth - 20, y + 20, { align: "right" });
        doc.text(`Due Date: ${displayDueDate}`, pageWidth - 20, y + 25, { align: "right" });

        if (isInstallment) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(16, 185, 129);
            doc.text(`PART ${partNumber} OF ${totalParts}`, pageWidth - 20, y + 32, { align: "right" });
        }

        y += 45;

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(24, 24, 27);
        doc.text("BILLED TO:", 20, y);
        doc.text("PAYABLE TO:", pageWidth / 2 + 10, y);

        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        doc.text(invoiceData.clientName || 'Unknown Client', 20, y);
        doc.text(invoiceData.clientEmail || 'No email provided', 20, y + 5);
        const address = invoiceData.clientAddress || "Address not provided";
        const splitClientAddress = doc.splitTextToSize(address, (pageWidth / 2) - 30);
        doc.text(splitClientAddress, 20, y + 10);

        doc.text("Novatrum Systems", pageWidth / 2 + 10, y);
        doc.text("info@novatrum.eu", pageWidth / 2 + 10, y + 5);
        doc.text("Flanders, Belgium", pageWidth / 2 + 10, y + 10);

        y += Math.max(splitClientAddress.length * 5, 20) + 15;

        doc.setFillColor(24, 24, 27);
        doc.rect(20, y, pageWidth - 40, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.text("DESCRIPTION", 25, y + 7);
        doc.text("QTY", pageWidth - 80, y + 7, { align: "center" });
        doc.text("RATE", pageWidth - 50, y + 7, { align: "center" });
        doc.text("AMOUNT", pageWidth - 25, y + 7, { align: "right" });

        y += 10;
        doc.setTextColor(24, 24, 27);
        doc.setFont("helvetica", "normal");

        items.forEach((item) => {
            const amount = (item.quantity || 0) * (item.rate || 0);
            const desc = item.description || 'No description';
            const splitDesc = doc.splitTextToSize(desc, pageWidth - 110);
            const rowHeight = splitDesc.length * 5 + 5;

            if (y + rowHeight > 270) { doc.addPage(); y = 20; }

            doc.text(splitDesc, 25, y + 6);
            doc.text((item.quantity || 0).toString(), pageWidth - 80, y + 6, { align: "center" });
            doc.text(`€${(item.rate || 0).toLocaleString()}`, pageWidth - 50, y + 6, { align: "center" });
            doc.text(`€${amount.toLocaleString()}`, pageWidth - 25, y + 6, { align: "right" });

            y += rowHeight;
            doc.setDrawColor(228, 228, 231);
            doc.line(20, y, pageWidth - 20, y);
        });

        y += 10;

        doc.setFontSize(10);
        doc.text("Project Total:", pageWidth - 60, y);
        doc.setFont("helvetica", "bold");
        doc.text(`€${subTotal.toLocaleString()}`, pageWidth - 25, y, { align: "right" });

        y += 10;
        doc.setFillColor(244, 244, 245);
        doc.rect(pageWidth - 110, y, 90, 15, "F");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129);
        
        doc.text(isInstallment ? `AMOUNT DUE (PART ${partNumber}):` : "AMOUNT DUE NOW:", pageWidth - 105, y + 10);
        doc.text(`€${amountDue.toLocaleString()}`, pageWidth - 25, y + 10, { align: "right" });

        y += 30;

        doc.setTextColor(24, 24, 27);
        doc.setFontSize(10);
        doc.text("PAYMENT DETAILS", 20, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        
        if (activeBank) {
            doc.text(`Bank: ${activeBank.bank_name || 'N/A'}`, 20, y);
            doc.text(`Account Name: ${activeBank.account_name || 'N/A'}`, 20, y + 5);
            doc.text(`IBAN: ${activeBank.iban || 'N/A'}`, 20, y + 10);
            doc.text(`BIC/SWIFT: ${activeBank.swift || 'N/A'}`, 20, y + 15);
            doc.text(`Reference: ${currentInvoiceNumber}`, 20, y + 20);
        }

        y += 30;
        doc.setFont("helvetica", "bold");
        doc.text("TERMS & CONDITIONS", 20, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122);
        const notes = invoiceData.notes || '';
        const splitNotes = doc.splitTextToSize(notes, pageWidth - 40);
        doc.text(splitNotes, 20, y);

        doc.setFontSize(8);
        doc.text("Generated securely via Novatrum Core Infrastructure.", pageWidth / 2, 285, { align: "center" });

        return doc.output('blob');
    };

    const previewPDF = async () => {
        if (items.length === 0 || !invoiceData.clientName) return alert("Missing client or items.");
        if (!selectedBankId) return alert("Please select a bank account.");
        setGenerating(true);
        try {
            const urls: string[] = [];
            for (let i = 1; i <= invoiceData.installments; i++) {
                const blob = await createInvoicePDF(i, invoiceData.installments);
                urls.push(URL.createObjectURL(blob));
            }
            setPdfUrls(urls);
            setActivePreviewIndex(0);
            setGenerationState('preview');
        } catch (error: any) {
            alert("Error generating preview: " + error.message);
        } finally {
            setGenerating(false);
        }
    };

    const sendToClient = async () => {
        if (!selectedClientId) return alert("Please select an Active Entity to link this invoice.");

        setSending(true);
        try {
            for (let i = 1; i <= invoiceData.installments; i++) {
                const blob = await createInvoicePDF(i, invoiceData.installments);
                const isInstallment = invoiceData.installments > 1;
                const invName = isInstallment ? `${invoiceData.invoiceNumber}-P${i}` : invoiceData.invoiceNumber;
                
                const file = new File([blob], `${invName}.pdf`, { type: 'application/pdf' });
                const filePath = `invoices/${selectedClientId}/${invName}.pdf`;
                
                // Supabase Storage'a Yükle [cite: 429]
                const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
                const dbDesc = isInstallment ? `${invName} (Part ${i} of ${invoiceData.installments})` : invName;

                // Müşteri Ledger'ına kaydet [cite: 431, 432]
                const { error: dbError } = await supabase.from('client_invoices').insert({
                    client_id: selectedClientId,
                    file_name: dbDesc,
                    file_url: publicUrl,
                    status: 'unpaid'
                });

                if (dbError) throw dbError;

                // --- YENİ: RESEND API İLE E-POSTA GÖNDERİMİ ---
                await fetch('/api/send-invoice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientEmail: invoiceData.clientEmail,
                        clientName: invoiceData.clientName,
                        invoiceNumber: invName,
                        pdfUrl: publicUrl
                    }),
                });
            }

            // Admin profiline not düş [cite: 433, 438]
            const { data: clientData } = await supabase.from('clients').select('internal_notes').eq('id', selectedClientId).single();
            let existingNotes = clientData?.internal_notes || '';
            
            const today = new Date().toLocaleDateString();
            let newNote = '';
            
            if (invoiceData.installments > 1) {
                const perInstallment = (calculateSubTotal() / invoiceData.installments).toLocaleString();
                newNote = `\n[${today}] Financial Update: Project split into ${invoiceData.installments} installments of €${perInstallment}.`;
            } else if (importType === 'maintenance') {
                newNote = `\n[${today}] Financial Update: Monthly maintenance retainer invoice generated.`;
            }

            if (newNote) {
                await supabase.from('clients').update({ internal_notes: existingNotes + newNote }).eq('id', selectedClientId);
            }

            alert(`Successfully generated, uploaded, and emailed ${invoiceData.installments} invoice(s) to the client.`);
            router.push('/admin/dashboard');

        } catch (error: any) {
            alert("Failed to process: " + error.message);
        } finally {
            setSending(false);
        }
    };

    if (!isAdmin) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 text-black font-sans selection:bg-black selection:text-white p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                
                <button onClick={() => router.push('/admin/dashboard')} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Workspace
                </button>

                {generationState === 'form' ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Financial Ledger</h1>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Automated Invoice & Installment Generator</p>
                            </div>
                        </div>

                        {/* DATA IMPORT ACTIONS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Blueprint Combobox */}
                            <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Load from Blueprint</label>
                                    <div className="flex gap-2">
                                        <button onClick={() => setImportType('project')} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-colors ${importType === 'project' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>Core Project</button>
                                        <button onClick={() => setImportType('maintenance')} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-colors ${importType === 'maintenance' ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-400'}`}>Maintenance</button>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <div onClick={() => setIsDiscDropdownOpen(!isDiscDropdownOpen)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold outline-none flex justify-between items-center cursor-pointer transition-colors hover:border-black">
                                            <span className="truncate text-zinc-700">
                                                {selectedDiscoveryId ? 
                                                    (() => {
                                                        const d = discoveries.find(x => x.id === selectedDiscoveryId);
                                                        return d ? `${d.client_name} - €${d.estimated_price} (${d.discovery_number})` : 'Select Blueprint...';
                                                    })() 
                                                    : 'Select Blueprint...'}
                                            </span>
                                            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                        
                                        {isDiscDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsDiscDropdownOpen(false)}></div>
                                                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="p-2 border-b border-zinc-100">
                                                        <input type="text" placeholder="Search by name or code..." value={discSearch} onChange={(e) => setDiscSearch(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black" />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                        {filteredDiscoveries.length === 0 ? (
                                                            <div className="p-4 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No results found</div>
                                                        ) : (
                                                            filteredDiscoveries.map(d => (
                                                                <div key={d.id} onClick={() => { setSelectedDiscoveryId(d.id); setIsDiscDropdownOpen(false); setDiscSearch(''); }} className="px-4 py-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0 transition-colors">
                                                                    <p className="text-xs font-bold text-zinc-900">{d.client_name} - €{d.estimated_price}</p>
                                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{d.discovery_number}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button onClick={handleLoadDiscovery} disabled={!selectedDiscoveryId} className="bg-black text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 shrink-0 transition-colors">Pull Data</button>
                                </div>
                            </div>
                            
                            {/* Client Combobox (Choose Manual) */}
                            <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Link to Active Entity (Manual Link)</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <div onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold outline-none flex justify-between items-center cursor-pointer transition-colors hover:border-black">
                                            <span className="truncate text-zinc-700">
                                                {selectedClientId ? 
                                                    (() => {
                                                        const c = clients.find(x => x.id === selectedClientId);
                                                        return c ? `${c.full_name} (${c.discovery_number || c.access_code})` : 'Choose Manual...';
                                                    })() 
                                                    : 'Choose Manual...'}
                                            </span>
                                            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                        
                                        {isClientDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsClientDropdownOpen(false)}></div>
                                                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="p-2 border-b border-zinc-100">
                                                        <input type="text" placeholder="Search by name, email or code..." value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} onClick={(e) => e.stopPropagation()} autoFocus className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-black" />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                        {filteredClients.length === 0 ? (
                                                            <div className="p-4 text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No results found</div>
                                                        ) : (
                                                            filteredClients.map(c => (
                                                                <div key={c.id} onClick={() => { setSelectedClientId(c.id); setIsClientDropdownOpen(false); setClientSearch(''); }} className="px-4 py-3 hover:bg-zinc-50 cursor-pointer border-b border-zinc-50 last:border-0 transition-colors">
                                                                    <p className="text-xs font-bold text-zinc-900">{c.full_name}</p>
                                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{c.discovery_number || c.access_code}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button onClick={handleLoadClient} disabled={!selectedClientId} className="bg-black text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 shrink-0 transition-colors">Link</button>
                                </div>
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-4">Auto-linked if emails match.</p>
                            </div>
                        </div>

                        {/* INVOICE DETAILS */}
                        <div className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 shadow-sm space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Base Invoice No</label>
                                    <input type="text" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-xs font-mono font-bold outline-none focus:border-black" />
                                </div>
                                
                                <SmartDateInput 
                                    label="Issue Date" 
                                    value={invoiceData.date} 
                                    onChange={(val) => setInvoiceData({...invoiceData, date: val})} 
                                />
                                <SmartDateInput 
                                    label="First Due Date" 
                                    value={invoiceData.dueDate} 
                                    onChange={(val) => setInvoiceData({...invoiceData, dueDate: val})} 
                                />
                                
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500 block mb-2">Split Installments</label>
                                    <select value={invoiceData.installments} onChange={(e) => setInvoiceData({...invoiceData, installments: parseInt(e.target.value) || 1})} className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-[10px] font-black uppercase outline-none focus:border-emerald-500 cursor-pointer">
                                        <option value={1}>1 (Pay in Full)</option>
                                        <option value={2}>2 Installments</option>
                                        <option value={3}>3 Installments</option>
                                        <option value={4}>4 Installments</option>
                                        <option value={6}>6 Installments</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                                <div><label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Client Name</label><input type="text" value={invoiceData.clientName} onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-black" /></div>
                                <div><label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Client Email</label><input type="email" value={invoiceData.clientEmail} onChange={(e) => setInvoiceData({...invoiceData, clientEmail: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-black" /></div>
                                <div className="md:col-span-2"><label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Client Address</label><textarea value={invoiceData.clientAddress} onChange={(e) => setInvoiceData({...invoiceData, clientAddress: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-black h-20 resize-none" /></div>
                            </div>
                        </div>

                        {/* LINE ITEMS */}
                        <div className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Line Items</h3>
                                <button onClick={addItem} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg> Add Row</button>
                            </div>
                            
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex flex-col md:flex-row gap-3 items-center group bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                                        <div className="w-full md:w-auto text-[9px] font-black text-zinc-400 w-8 text-center hidden md:block">{index + 1}</div>
                                        <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="flex-1 w-full bg-white border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-black" />
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-black text-center" />
                                            <input type="number" placeholder="Rate (€)" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-32 bg-white border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none focus:border-black text-center" />
                                            <div className="w-32 bg-zinc-100 p-3 rounded-xl text-xs font-black font-mono text-center flex items-center justify-center border border-zinc-200">€{((item.quantity || 0) * (item.rate || 0)).toLocaleString()}</div>
                                            <button onClick={() => removeItem(item.id)} className="p-3 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && <p className="text-center text-[10px] font-bold uppercase text-zinc-400 tracking-widest py-8 border border-dashed rounded-2xl">No items added. Pull from Blueprint or add manually.</p>}
                            </div>

                            {items.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col items-end gap-2">
                                    <div className="flex justify-between w-full max-w-xs items-center px-4 py-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Project Total</span>
                                        <span className="text-lg font-black font-mono text-zinc-900">€{calculateSubTotal().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between w-full max-w-xs items-center px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Per Installment ({invoiceData.installments}x)</span>
                                        <span className="text-2xl font-black font-mono text-emerald-600">€{(calculateSubTotal() / invoiceData.installments).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BANK ACCOUNTS & NOTES */}
                        <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-[32px] grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Bank Accounts</h3>
                                    <button onClick={() => setIsAddingNewBank(!isAddingNewBank)} className="text-[9px] font-black uppercase text-blue-500 hover:underline tracking-widest">
                                        {isAddingNewBank ? 'Cancel' : '+ Add New Bank'}
                                    </button>
                                </div>

                                {isAddingNewBank ? (
                                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                                        <input type="text" placeholder="Bank Name (e.g. Wise)" value={newBankForm.bankName} onChange={e => setNewBankForm({...newBankForm, bankName: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none" />
                                        <input type="text" placeholder="Account Holder Name" value={newBankForm.accountName} onChange={e => setNewBankForm({...newBankForm, accountName: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none" />
                                        <input type="text" placeholder="IBAN" value={newBankForm.iban} onChange={e => setNewBankForm({...newBankForm, iban: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none uppercase" />
                                        <input type="text" placeholder="BIC / SWIFT (Optional)" value={newBankForm.swift} onChange={e => setNewBankForm({...newBankForm, swift: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-xs font-bold outline-none uppercase" />
                                        <button onClick={handleSaveNewBank} className="w-full bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">Save to Database</button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {bankAccounts.length === 0 && <p className="text-[10px] font-bold text-zinc-400">No bank accounts saved. Add one.</p>}
                                        {bankAccounts.map(b => (
                                            <div key={b.id} onClick={() => setSelectedBankId(b.id)} className={`p-4 rounded-xl border cursor-pointer transition-colors flex items-center justify-between group ${selectedBankId === b.id ? 'bg-black text-white border-black shadow-md' : 'bg-white border-zinc-200 hover:border-black text-zinc-700'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedBankId === b.id ? 'border-white' : 'border-zinc-300'}`}>
                                                        {selectedBankId === b.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest ${selectedBankId === b.id ? 'text-white' : 'text-black'}`}>{b.bank_name}</p>
                                                        <p className={`text-[9px] font-bold font-mono mt-0.5 ${selectedBankId === b.id ? 'text-zinc-300' : 'text-zinc-500'}`}>{b.iban}</p>
                                                    </div>
                                                </div>
                                                <button onClick={(e) => handleDeleteBank(e, b.id)} className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${selectedBankId === b.id ? 'hover:bg-red-500 text-red-300 hover:text-white' : 'hover:bg-red-50 text-red-400'}`}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Invoice Terms & Notes</h3>
                                <textarea value={invoiceData.notes} onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})} className="w-full bg-white border border-zinc-200 p-5 rounded-2xl text-xs font-bold outline-none focus:border-black h-40 resize-none leading-relaxed" />
                            </div>
                        </div>

                        <button onClick={previewPDF} disabled={generating || items.length === 0} className="w-full bg-black text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {generating ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Compile Document'}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col h-[calc(100vh-140px)] animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Document Preview</h2>
                                {invoiceData.installments > 1 && <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Reviewing {invoiceData.installments} Generated Invoices</p>}
                            </div>
                            <button onClick={() => setGenerationState('form')} className="text-[10px] font-black uppercase text-zinc-500 p-2 hover:bg-white rounded-lg">Edit Details</button>
                        </div>

                        {invoiceData.installments > 1 && (
                            <div className="flex gap-2 mb-4">
                                {pdfUrls.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActivePreviewIndex(idx)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${activePreviewIndex === idx ? 'bg-black text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="bg-white p-2 rounded-[30px] shadow-2xl border border-zinc-200 flex-1 overflow-hidden min-h-[500px]">
                            {pdfUrls.length > 0 && <iframe src={pdfUrls[activePreviewIndex]} className="w-full h-full rounded-[24px]" title={`Preview ${activePreviewIndex + 1}`} />}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-auto">
                            <button onClick={() => setGenerationState('form')} className="w-full sm:w-auto bg-white border border-zinc-200 text-black py-5 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-colors shadow-sm">
                                Edit Details
                            </button>
                            <button onClick={sendToClient} disabled={sending} className="flex-1 bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-3">
                                {sending ? 'Generating & Uploading...' : invoiceData.installments > 1 ? `Generate & Send ${invoiceData.installments} Invoices` : 'Send to Client Ledger'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
                input[type="date"]::-webkit-calendar-picker-indicator { width: 100%; height: 100%; margin: 0; padding: 0; cursor: pointer; }
            `}} />
        </div>
    );
}