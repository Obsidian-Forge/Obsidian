"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

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

const DEFAULT_NOTES = "Work commences upon receipt of the initial deposit. \n\nINFRASTRUCTURE & SUPPORT: Monthly subscription fee is mandatory for node stability and security updates.\n\nPAYMENT INSTRUCTIONS:\nThis document serves as a technical service summary. The official tax invoice will be issued separately by TENTOO. Please process your payment strictly using the IBAN and structured reference provided in the official TENTOO document.";

// Strict DD/MM/YYYY formatter
const formatDateToDDMMYYYY = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('T')[0].split('-');
    if (parts.length !== 3) return isoDate;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
};

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const SmartDateInput = ({ label, value, onChange, quickActions }: { label: string, value: string, onChange: (val: string) => void, quickActions?: {label: string, addDays: number}[] }) => {
    const applyQuickAction = (days: number) => {
        const newDate = new Date();
        newDate.setDate(newDate.getDate() + days);
        onChange(newDate.toISOString().split('T')[0]);
    };

    return (
        <div className="flex flex-col">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">{label}</label>
            
            <div className="relative w-full bg-zinc-50 border border-zinc-200 rounded-xl focus-within:border-black transition-colors h-[50px] flex items-center px-4 cursor-pointer hover:bg-zinc-100 group overflow-hidden">
                <span className="text-xs font-bold text-zinc-900 z-10 pointer-events-none tracking-wider">
                    {formatDateToDDMMYYYY(value)}
                </span>
                
                <input 
                    type="date" 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                />
                
                <svg className="absolute right-4 w-4 h-4 text-zinc-400 group-hover:text-black transition-colors z-10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>

            {quickActions && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {quickActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.preventDefault(); applyQuickAction(action.addDays); }}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-500 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-colors active:scale-95"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function InvoiceGeneratorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

    const [clients, setClients] = useState<any[]>([]);
    const [discoveries, setDiscoveries] = useState<any[]>([]);

    const [selectedDiscoveryId, setSelectedDiscoveryId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [importType, setImportType] = useState<'project' | 'maintenance'>('project');

    const [isDiscDropdownOpen, setIsDiscDropdownOpen] = useState(false);
    const [discSearch, setDiscSearch] = useState('');

    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `INV-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        notes: DEFAULT_NOTES,
        installments: 1,
        maintMonths: 1,
        discountAmount: 0,
        discountType: 'amount' as 'amount' | 'percent'
    });

    const [items, setItems] = useState<InvoiceItem[]>([]);
    
    const [currentPreviewBatch, setCurrentPreviewBatch] = useState<BasketItem[]>([]);
    const [basket, setBasket] = useState<BasketItem[]>([]);
    const [activePreviewIndex, setActivePreviewIndex] = useState(0);
    const [generationState, setGenerationState] = useState<'form' | 'preview'>('form');

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') return router.push('/admin/login');

            setIsAdmin(true);

            const [clientsRes, discRes] = await Promise.all([
                supabase.from('clients').select('*').is('archived_at', null).order('created_at', { ascending: false }),
                supabase.from('project_discovery').select('*').order('created_at', { ascending: false })
            ]);

            let loadedDisc = discRes.data || [];
            let loadedClients = clientsRes.data || [];

            const clientsWithDiscInfo = loadedClients.map(c => {
                const match = loadedDisc.find(d => d.client_email?.toLowerCase() === c.email?.toLowerCase());
                return { ...c, discovery_number: match?.discovery_number || '' };
            });

            setClients(clientsWithDiscInfo);
            setDiscoveries(loadedDisc);
            setLoading(false);
        };
        init();
        return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
    }, [router]);

    const filteredDiscoveries = discoveries.filter(d => {
        const term = discSearch.toLowerCase();
        return (d.client_name?.toLowerCase() || '').includes(term) || (d.discovery_number?.toLowerCase() || '').includes(term);
    });

    const filteredClients = clients.filter(c => {
        const term = clientSearch.toLowerCase();
        return (c.full_name?.toLowerCase() || '').includes(term) ||
            (c.email?.toLowerCase() || '').includes(term) ||
            (c.discovery_number?.toLowerCase() || '').includes(term) ||
            (c.access_code?.toLowerCase() || '').includes(term);
    });

    const toggleImportType = (type: 'project' | 'maintenance') => {
        setImportType(type);
        setInvoiceData(prev => ({
            ...prev,
            invoiceNumber: type === 'project' 
                ? `INV-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}` 
                : `MAINT-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
        }));
    };

    const handleLoadDiscovery = () => {
        const disc = discoveries.find(d => d.id === selectedDiscoveryId);
        if (!disc) return;
        let newItems: InvoiceItem[] = [];

        if (importType === 'project') {
            newItems = [{ id: '1', description: `Core Architecture: ${disc.project_type || 'Custom Software'}`, quantity: 1, rate: disc.estimated_price || 0 }];
            setInvoiceData(prev => ({
                ...prev, 
                installments: 1, 
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                invoiceNumber: `INV-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
            }));
        } else {
            const maintString = disc.details?.Maintenance || '';
            let maintPrice = 0;
            if (maintString && maintString !== 'None') {
                const match = maintString.match(/€(\d+)/);
                if (match) maintPrice = parseInt(match[1]);
            }
            if (maintPrice === 0) return showToast("This client does not have a Monthly Maintenance plan.", 'error');
            
            const today = new Date();
            let startDate = new Date(today);
            
            if (today.getDate() > 15) {
                startDate.setMonth(startDate.getMonth() + 1);
                startDate.setDate(1);
                showToast("Smart Date: Shifted to next month (Grace period applied).", 'info');
            } else {
                startDate.setDate(1);
                showToast("Smart Date: Billed for current month.", 'info');
            }

            const currentMonthName = startDate.toLocaleString('en-US', { month: 'long' });
            const currentYear = startDate.getFullYear();

            newItems = [{ 
                id: '1', 
                description: `Infrastructure & Security Maintenance Retainer - ${currentMonthName} ${currentYear}`, 
                quantity: 1, 
                rate: maintPrice 
            }];
            
            const due = new Date(startDate);
            due.setDate(due.getDate() + 7);
            
            setInvoiceData(prev => ({
                ...prev, 
                maintMonths: 1,
                date: startDate.toISOString().split('T')[0], 
                dueDate: due.toISOString().split('T')[0],
                invoiceNumber: `MAINT-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
            }));
        }

        const matchedClient = clients.find(c => c.email?.toLowerCase() === disc.client_email?.toLowerCase());
        if (matchedClient) {
            setSelectedClientId(matchedClient.id);
            setInvoiceData(prev => ({
                ...prev,
                clientName: matchedClient.full_name || disc.client_name || '',
                clientEmail: matchedClient.email || disc.client_email || '',
                clientAddress: matchedClient.address || disc.details?.Company || 'N/A'
            }));
            showToast("Entity auto-linked successfully based on email match.", 'success');
        } else {
            setSelectedClientId('');
            setInvoiceData(prev => ({
                ...prev,
                clientName: disc.client_name || '',
                clientEmail: disc.client_email || '',
                clientAddress: disc.details?.Company || 'N/A'
            }));
            showToast("Blueprint pulled. No active entity matched this email.", 'info');
        }

        setItems(newItems);
    };

    const handleLoadClient = () => {
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;
        setInvoiceData(prev => ({
            ...prev, clientName: client.full_name || '', clientEmail: client.email || '', clientAddress: client.address || ''
        }));
        showToast("Client details loaded manually.", "success");
    };

    const addItem = () => setItems([...items, { id: Math.random().toString(), description: '', quantity: 1, rate: 0 }]);
    const removeItem = (id: string) => setItems(items.filter(i => i.id !== id));
    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));

    const calculateRawSubTotal = () => items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
    const calculateDiscountValue = () => {
        const raw = calculateRawSubTotal();
        return invoiceData.discountType === 'percent' ? raw * ((invoiceData.discountAmount || 0) / 100) : (invoiceData.discountAmount || 0);
    };
    const calculateFinalTotal = () => Math.max(0, calculateRawSubTotal() - calculateDiscountValue());

    const getMaintenanceEndDate = () => {
        const d = new Date(invoiceData.date);
        d.setMonth(d.getMonth() + invoiceData.maintMonths - 1);
        return d.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
    };

    const createInvoicePDF = async (config: { type: 'project' | 'maintenance', index: number, total: number }): Promise<Blob> => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;

        const loadImage = (url: string): Promise<string> => {
            return new Promise((resolve) => {
                const img = new Image(); img.src = url;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width; canvas.height = img.height;
                    const ctx = canvas.getContext("2d"); ctx?.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png"));
                };
                img.onerror = () => resolve("");
            });
        };

        const logoData = await loadImage("/logo.png");
        if (logoData) {
            doc.addImage(logoData, 'PNG', 20, y, 16, 16);
            doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text("NOVATRUM", 42, y + 12);
        } else {
            doc.setFont("helvetica", "bold"); doc.setFontSize(24); doc.text("NOVATRUM", 20, y + 12);
        }

        let currentIssueDate = new Date(invoiceData.date);
        let currentDueDate = new Date(invoiceData.dueDate);
        let currentInvoiceNumber = invoiceData.invoiceNumber;
        let currentDueDateText = "";
        let isInstallment = false;

        if (config.type === 'project') {
            isInstallment = config.total > 1;
            currentInvoiceNumber = isInstallment ? `${invoiceData.invoiceNumber}-P${config.index + 1}` : invoiceData.invoiceNumber;
            
            if (isInstallment && config.index === config.total - 1) {
                currentDueDateText = "UPON PROJECT COMPLETION";
            } else {
                currentDueDate.setMonth(currentDueDate.getMonth() + config.index);
                currentDueDateText = formatDateToDDMMYYYY(currentDueDate.toISOString().split('T')[0]);
            }
        } else {
            currentIssueDate.setMonth(currentIssueDate.getMonth() + config.index);
            currentDueDate.setMonth(currentDueDate.getMonth() + config.index);
            
            const monthStr = currentIssueDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
            currentInvoiceNumber = `${invoiceData.invoiceNumber}-${monthStr}`;
            currentDueDateText = formatDateToDDMMYYYY(currentDueDate.toISOString().split('T')[0]);
        }

        const rawTotal = calculateRawSubTotal();
        const discountVal = calculateDiscountValue();
        const finalTotal = calculateFinalTotal();
        const amountDue = (config.type === 'project' && isInstallment) ? (finalTotal / config.total) : finalTotal;

        doc.setFontSize(20); doc.setTextColor(24, 24, 27);
        doc.text("INVOICE SUMMARY", pageWidth - 20, y + 8, { align: "right" });
        
        doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(113, 113, 122);
        doc.text(`Ref Number: ${currentInvoiceNumber}`, pageWidth - 20, y + 15, { align: "right" });
        doc.text(`Issue Date: ${formatDateToDDMMYYYY(currentIssueDate.toISOString().split('T')[0])}`, pageWidth - 20, y + 20, { align: "right" });
        doc.text(`Due Date: ${currentDueDateText}`, pageWidth - 20, y + 25, { align: "right" });
        
        if (config.type === 'project' && isInstallment) {
            doc.setFont("helvetica", "bold"); doc.setTextColor(16, 185, 129);
            doc.text(`PART ${config.index + 1} OF ${config.total}`, pageWidth - 20, y + 32, { align: "right" });
        } else if (config.type === 'maintenance') {
            doc.setFont("helvetica", "bold"); doc.setTextColor(168, 85, 247);
            doc.text(`MONTHLY RETAINER`, pageWidth - 20, y + 32, { align: "right" });
        }

        y += 45;
        doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(24, 24, 27);
        doc.text("BILLED TO:", 20, y); doc.text("ISSUED BY:", pageWidth / 2 + 10, y);

        y += 6;
        doc.setFont("helvetica", "normal"); doc.setFontSize(9);
        doc.text(invoiceData.clientName || 'Unknown Client', 20, y);
        doc.text(invoiceData.clientEmail || 'No email provided', 20, y + 5);
        const address = invoiceData.clientAddress || "Address not provided";
        const splitClientAddress = doc.splitTextToSize(address, (pageWidth / 2) - 30);
        doc.text(splitClientAddress, 20, y + 10);
        
        doc.text("Novatrum Systems", pageWidth / 2 + 10, y);
        doc.text("info@novatrum.eu", pageWidth / 2 + 10, y + 5);
        doc.text("Flanders, Belgium", pageWidth / 2 + 10, y + 10);

        y += Math.max(splitClientAddress.length * 5, 20) + 15;
        
        doc.setFillColor(24, 24, 27); doc.rect(20, y, pageWidth - 40, 10, "F");
        doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold");
        doc.text("DESCRIPTION", 25, y + 7);
        doc.text("QTY", pageWidth - 80, y + 7, { align: "center" });
        doc.text("RATE", pageWidth - 50, y + 7, { align: "center" });
        doc.text("AMOUNT", pageWidth - 25, y + 7, { align: "right" });

        y += 10;
        doc.setTextColor(24, 24, 27); doc.setFont("helvetica", "normal");
        
        let renderItems = [...items];
        if (config.type === 'maintenance' && renderItems.length > 0) {
            const monthName = currentIssueDate.toLocaleString('en-US', { month: 'long' });
            const year = currentIssueDate.getFullYear();
            renderItems[0].description = `Infrastructure & Security Maintenance Retainer - ${monthName} ${year}`;
        }

        renderItems.forEach((item) => {
            const amount = (item.quantity || 0) * (item.rate || 0);
            const splitDesc = doc.splitTextToSize(item.description || 'No description', pageWidth - 110);
            const rowHeight = splitDesc.length * 5 + 5;
            
            if (y + rowHeight > 270) { doc.addPage(); y = 20; }

            doc.text(splitDesc, 25, y + 6);
            doc.text((item.quantity || 0).toString(), pageWidth - 80, y + 6, { align: "center" });
            doc.text(`€${formatCurrency(item.rate || 0)}`, pageWidth - 50, y + 6, { align: "center" });
            doc.text(`€${formatCurrency(amount)}`, pageWidth - 25, y + 6, { align: "right" });

            y += rowHeight;
            doc.setDrawColor(228, 228, 231); doc.line(20, y, pageWidth - 20, y);
        });

        y += 10;
        doc.setFontSize(10);
        
        if (discountVal > 0) {
            doc.text("Subtotal:", pageWidth - 75, y);
            doc.text(`€${formatCurrency(rawTotal)}`, pageWidth - 25, y, { align: "right" });
            y += 6;
            
            doc.setTextColor(239, 68, 68);
            const discountLabel = invoiceData.discountType === 'percent' ? `Discount (${invoiceData.discountAmount}%):` : `Discount:`;
            doc.text(discountLabel, pageWidth - 75, y);
            doc.text(`-€${formatCurrency(discountVal)}`, pageWidth - 25, y, { align: "right" });
            doc.setTextColor(24, 24, 27);
            y += 8;
        }

        if (config.type === 'project') {
            doc.setFont("helvetica", "bold");
            doc.text("Project Total:", pageWidth - 75, y);
            doc.text(`€${formatCurrency(finalTotal)}`, pageWidth - 25, y, { align: "right" });
            y += 10;
        }

        doc.setFillColor(244, 244, 245); doc.rect(pageWidth - 110, y, 15, 15, "F");
        doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(24, 24, 27);
        
        let dueLabel = "AMOUNT DUE NOW:";
        if (config.type === 'project' && isInstallment) dueLabel = `AMOUNT DUE (PART ${config.index + 1}):`;
        if (config.type === 'maintenance') dueLabel = "MONTHLY TOTAL:";

        doc.text(dueLabel, pageWidth - 105, y + 10);
        doc.text(`€${formatCurrency(amountDue)}`, pageWidth - 25, y + 10, { align: "right" });

        y += 30;
        
        doc.setFont("helvetica", "bold"); doc.text("TERMS & INSTRUCTIONS", 20, y);
        y += 6; doc.setFont("helvetica", "normal"); doc.setTextColor(113, 113, 122);
        const splitNotes = doc.splitTextToSize(invoiceData.notes || '', pageWidth - 40);
        doc.text(splitNotes, 20, y);

        doc.setFontSize(8); doc.text("Generated securely via Novatrum Core Infrastructure.", pageWidth / 2, 285, { align: "center" });

        return doc.output('blob');
    };

    const generatePDFs = async () => {
        if (items.length === 0 || !invoiceData.clientName) return showToast("Missing client or items.", 'error');
        setGenerating(true);
        
        try {
            const batch: BasketItem[] = [];
            const isProject = importType === 'project';
            const iterations = isProject ? invoiceData.installments : invoiceData.maintMonths;

            for (let i = 0; i < iterations; i++) {
                const blob = await createInvoicePDF({ type: importType, index: i, total: iterations });
                
                let invName = invoiceData.invoiceNumber;
                if (isProject && iterations > 1) {
                    invName = `${invoiceData.invoiceNumber}-P${i + 1}`;
                } else if (!isProject) {
                    const tempDate = new Date(invoiceData.date);
                    tempDate.setMonth(tempDate.getMonth() + i);
                    const monthStr = tempDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                    invName = `${invoiceData.invoiceNumber}-${monthStr}`;
                }

                const finalTotal = calculateFinalTotal();
                const amountDue = (isProject && iterations > 1) ? (finalTotal / iterations) : finalTotal;

                batch.push({
                    id: Math.random().toString(),
                    fileName: invName,
                    blob,
                    previewUrl: URL.createObjectURL(blob),
                    type: importType,
                    amountDue: amountDue,
                    clientId: selectedClientId,
                    clientEmail: invoiceData.clientEmail
                });
            }

            setCurrentPreviewBatch(batch);
            setActivePreviewIndex(0);
            setGenerationState('preview');
        } catch (error: any) { 
            showToast("Error generating preview: " + error.message, 'error'); 
        } finally { 
            setGenerating(false); 
        }
    };

    const addToBasket = () => {
        setBasket(prev => [...prev, ...currentPreviewBatch]);
        showToast(`${currentPreviewBatch.length} documents added to Ledger Batch.`, 'success');
        setCurrentPreviewBatch([]); 
    };

    const startNewInvoice = () => {
        setItems([]);
        setInvoiceData(prev => ({
            ...prev,
            invoiceNumber: importType === 'project' 
                ? `INV-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}` 
                : `MAINT-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`
        }));
        setGenerationState('form');
    };

    const submitBasketToLedger = async () => {
        if (basket.length === 0) return showToast("Ledger batch is empty.", 'error');
        
        const unlinkedItems = basket.filter(b => !b.clientId);
        if (unlinkedItems.length > 0) {
            return showToast("Error: Some items in the batch are not linked to an Active Entity.", 'error');
        }

        setSending(true);
        try {
            for (const item of basket) {
                const file = new File([item.blob], `${item.fileName}.pdf`, { type: 'application/pdf' });
                const filePath = `invoices/${item.clientId}/${item.fileName}.pdf`;
                
                const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
                if (uploadError) throw uploadError;
                
                const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
                
                let dbDesc = item.fileName;
                if (item.type === 'project' && item.fileName.includes('-P')) {
                    const partMatch = item.fileName.match(/-P(\d+)$/);
                    if (partMatch) dbDesc = `${item.fileName} (Part ${partMatch[1]})`;
                }

                const { error: dbError } = await supabase.from('client_invoices').insert({
                    client_id: item.clientId, 
                    file_name: dbDesc, 
                    file_url: publicUrl, 
                    status: 'unpaid'
                });
                if (dbError) throw dbError;

                // E-posta atma fonksiyonu tamamen KALDIRILDI.
                // Artık müşteriye sessizce Ledger'a yükleniyor.
            }

            const uniqueClients = Array.from(new Set(basket.map(b => b.clientId)));
            for (const cid of uniqueClients) {
                const { data: clientData } = await supabase.from('clients').select('internal_notes').eq('id', cid).single();
                const formattedDate = formatDateToDDMMYYYY(new Date().toISOString());
                const newNote = `\n[${formattedDate}] Financial Update: Processed batch of ${basket.length} invoice(s) via Generator.`;
                await supabase.from('clients').update({ internal_notes: (clientData?.internal_notes || '') + newNote }).eq('id', cid);
            }

            showToast(`Successfully processed ${basket.length} invoice(s). Returning to Ledger...`, 'success');
            setBasket([]);
            setTimeout(() => router.push('/admin/ledger'), 2000);
            
        } catch (error: any) { 
            showToast("Failed to process batch: " + error.message, 'error'); 
        } finally { 
            setSending(false); 
        }
    };

    const removeFromBasket = (id: string) => {
        setBasket(prev => prev.filter(item => item.id !== id));
    };

    if (!isAdmin) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 text-black font-sans selection:bg-black selection:text-white p-6 md:p-10 relative">
            <div className="max-w-6xl mx-auto">

                <div className="flex justify-between items-center mb-8">
                    <button onClick={() => router.push('/admin/dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Workspace
                    </button>

                    {basket.length > 0 && generationState === 'form' && (
                        <div className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-in slide-in-from-top-5">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{basket.length} Documents in Ledger Batch</span>
                        </div>
                    )}
                </div>

                {generationState === 'form' ? (
                    <div className="space-y-8 animate-in fade-in duration-500">
 
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200">
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Financial Ledger</h1>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Automated Invoice & Installment Generator</p>
                            </div>
                            {basket.length > 0 && (
                                <button onClick={() => setGenerationState('preview')} className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-sm">
                                    View Batch & Submit ({basket.length})
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Load from Blueprint</label>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.preventDefault(); toggleImportType('project'); }} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-colors ${importType === 'project' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}>Core Project</button>
                                        <button onClick={(e) => { e.preventDefault(); toggleImportType('maintenance'); }} className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-colors ${importType === 'maintenance' ? 'bg-purple-500 text-white' : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'}`}>Maintenance</button>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <div onClick={() => setIsDiscDropdownOpen(!isDiscDropdownOpen)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold outline-none flex justify-between items-center cursor-pointer transition-colors hover:border-black h-[50px]">
                                            <span className="truncate text-zinc-700">
                                                {selectedDiscoveryId ? (() => {
                                                    const d = discoveries.find(x => x.id === selectedDiscoveryId);
                                                    return d ? `${d.client_name} - €${formatCurrency(d.estimated_price)} (${d.discovery_number})` : 'Select Blueprint...';
                                                })() : 'Select Blueprint...'}
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
                                                                    <p className="text-xs font-bold text-zinc-900">{d.client_name} - €{formatCurrency(d.estimated_price)}</p>
                                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{d.discovery_number}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <button onClick={(e) => { e.preventDefault(); handleLoadDiscovery(); }} disabled={!selectedDiscoveryId} className="bg-black text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 shrink-0 transition-colors h-[50px]">Pull Data</button>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Link to Active Entity (Manual Link)</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <div onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold outline-none flex justify-between items-center cursor-pointer transition-colors hover:border-black h-[50px]">
                                            <span className="truncate text-zinc-700">
                                                {selectedClientId ? (() => {
                                                    const c = clients.find(x => x.id === selectedClientId);
                                                    return c ? `${c.full_name} (${c.discovery_number || c.access_code})` : 'Choose Manual...';
                                                })() : 'Choose Manual...'}
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
                                    <button onClick={(e) => { e.preventDefault(); handleLoadClient(); }} disabled={!selectedClientId} className="bg-black text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 shrink-0 transition-colors h-[50px]">Link</button>
                                </div>
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-4">Auto-linked if emails match.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 shadow-sm space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Base Invoice No</label>
                                    <input type="text" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-4 h-[50px] rounded-xl text-xs font-mono font-bold outline-none focus:border-black" />
                                </div>
                                
                                <SmartDateInput 
                                    label="Base Issue Date" 
                                    value={invoiceData.date} 
                                    onChange={(val) => setInvoiceData({ ...invoiceData, date: val })} 
                                    quickActions={[{label: "Today", addDays: 0}]}
                                />
                                
                                <SmartDateInput 
                                    label="Base Due Date" 
                                    value={invoiceData.dueDate} 
                                    onChange={(val) => setInvoiceData({ ...invoiceData, dueDate: val })} 
                                    quickActions={[
                                        {label: "Upon Receipt", addDays: 0},
                                        {label: "Net 7", addDays: 7},
                                        {label: "Net 14", addDays: 14}
                                    ]}
                                />
                                
                                <div>
                                    {importType === 'project' ? (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500 block">Split Installments</label>
                                            </div>
                                            <select value={invoiceData.installments} onChange={(e) => setInvoiceData({ ...invoiceData, installments: parseInt(e.target.value) || 1 })} className="w-full h-[50px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 rounded-xl text-[10px] font-black uppercase outline-none focus:border-emerald-500 cursor-pointer">
                                                <option value={1}>1 (Pay in Full)</option>
                                                <option value={2}>2 Installments</option>
                                                <option value={3}>3 Installments</option>
                                                <option value={4}>4 Installments</option>
                                                <option value={6}>6 Installments</option>
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-purple-500 block">Duration (Months)</label>
                                                <span className="text-[8px] font-bold text-zinc-400">Coverage until: {getMaintenanceEndDate()}</span>
                                            </div>
                                            <div className="flex h-[50px] bg-purple-50 border border-purple-200 rounded-xl overflow-hidden focus-within:border-purple-500 transition-colors">
                                                <input 
                                                    type="number" 
                                                    min="1" max="12" 
                                                    value={invoiceData.maintMonths} 
                                                    onChange={(e) => setInvoiceData({ ...invoiceData, maintMonths: parseInt(e.target.value) || 1 })} 
                                                    className="w-full bg-transparent px-4 text-xs font-bold text-purple-900 outline-none text-center" 
                                                />
                                                <div className="bg-purple-100 flex items-center px-4 text-[10px] font-black text-purple-600 uppercase border-l border-purple-200">Months</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                                <div><label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Client Name</label><input type="text" value={invoiceData.clientName} onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })} className="w-full h-[50px] bg-zinc-50 border border-zinc-200 px-4 rounded-xl text-xs font-bold outline-none focus:border-black" /></div>
                                <div><label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Client Email</label><input type="email" value={invoiceData.clientEmail} onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })} className="w-full h-[50px] bg-zinc-50 border border-zinc-200 px-4 rounded-xl text-xs font-bold outline-none focus:border-black" /></div>
                                <div className="md:col-span-2"><label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Client Address</label><textarea value={invoiceData.clientAddress} onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-black h-20 resize-none" /></div>
                            </div>
                        </div>

                        <div className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Line Items</h3>
                                <button onClick={(e) => { e.preventDefault(); addItem(); }} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-2"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg> Add Row</button>
                            </div>

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="flex flex-col md:flex-row gap-3 items-center group bg-zinc-50 p-3 rounded-2xl border border-zinc-200">
                                        <div className="w-full md:w-auto text-[9px] font-black text-zinc-400 w-8 text-center hidden md:block">{index + 1}</div>
                                        <input type="text" placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="flex-1 w-full bg-white border border-zinc-200 px-4 h-[50px] rounded-xl text-xs font-bold outline-none focus:border-black" />
                                        <div className="flex gap-3 w-full md:w-auto">
                                            <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-24 bg-white border border-zinc-200 px-4 h-[50px] rounded-xl text-xs font-bold outline-none focus:border-black text-center" />
                                            <input type="number" placeholder="Rate (€)" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-32 bg-white border border-zinc-200 px-4 h-[50px] rounded-xl text-xs font-bold outline-none focus:border-black text-center" />
                                            <div className="w-32 bg-zinc-100 px-4 h-[50px] rounded-xl text-xs font-black font-mono text-center flex items-center justify-center border border-zinc-200">€{formatCurrency((item.quantity || 0) * (item.rate || 0))}</div>
                                            <button onClick={(e) => { e.preventDefault(); removeItem(item.id); }} className="w-[50px] h-[50px] flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                        </div>
                                    </div>
                                ))}
                                {items.length === 0 && <p className="text-center text-[10px] font-bold uppercase text-zinc-400 tracking-widest py-8 border border-dashed rounded-2xl">No items added. Pull from Blueprint or add manually.</p>}
                            </div>

                            {items.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-col items-end gap-3">
                                    <div className="flex justify-between w-full max-w-sm items-center px-4 gap-4">
                                        <select value={invoiceData.discountType} onChange={(e) => setInvoiceData({ ...invoiceData, discountType: e.target.value as 'amount' | 'percent' })} className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-zinc-500 outline-none cursor-pointer">
                                            <option value="amount">Discount (€)</option>
                                            <option value="percent">Discount (%)</option>
                                        </select>
                                        <input type="number" min="0" placeholder="0" value={invoiceData.discountAmount || ''} onChange={(e) => setInvoiceData({ ...invoiceData, discountAmount: parseFloat(e.target.value) || 0 })} className="w-24 h-[40px] bg-zinc-50 border border-zinc-200 px-4 rounded-lg text-xs font-bold outline-none focus:border-red-400 text-right text-red-500" />
                                    </div>

                                    <div className="flex justify-between w-full max-w-sm items-center px-4 py-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{importType === 'project' ? 'Project Total' : 'Monthly Base Rate'}</span>
                                        <span className="text-lg font-black font-mono text-zinc-900">€{formatCurrency(calculateFinalTotal())}</span>
                                    </div>

                                    {importType === 'project' && invoiceData.installments > 1 && (
                                        <div className="flex justify-between w-full max-w-sm items-center px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl mt-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Per Installment ({invoiceData.installments}x)</span>
                                            <span className="text-xl font-black font-mono text-emerald-600">€{formatCurrency(calculateFinalTotal() / invoiceData.installments)}</span>
                                        </div>
                                    )}

                                    {importType === 'maintenance' && invoiceData.maintMonths > 1 && (
                                        <div className="flex justify-between w-full max-w-sm items-center px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl mt-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">Total Value ({invoiceData.maintMonths} Months)</span>
                                            <span className="text-xl font-black font-mono text-purple-600">€{formatCurrency(calculateFinalTotal() * invoiceData.maintMonths)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-[32px]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Invoice Terms & Notes</h3>
                            <textarea value={invoiceData.notes} onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })} className="w-full bg-white border border-zinc-200 p-5 rounded-2xl text-xs font-bold outline-none focus:border-black h-40 resize-none leading-relaxed" />
                        </div>

                        <button onClick={(e) => { e.preventDefault(); generatePDFs(); }} disabled={generating || items.length === 0} className="w-full bg-black text-white py-6 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3">
                            {generating ? <span className="w-5 h-5 border-2 border-white border-t-white/0 rounded-full animate-spin" /> : 'Compile Document(s)'}
                        </button>
                    </div>

                ) : (
                    
                    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-140px)] animate-in zoom-in-95 duration-500">
                        
                        <div className="flex-1 flex flex-col min-w-0">
                            {currentPreviewBatch.length > 0 ? (
                                <>
                                    <div className="flex justify-between items-center mb-6 shrink-0">
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tighter">Document Preview</h2>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Compiled {currentPreviewBatch.length} Document(s) for {invoiceData.clientName}</p>
                                        </div>
                                    </div>

                                    {currentPreviewBatch.length > 1 && (
                                        <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2 shrink-0">
                                            {currentPreviewBatch.map((_, idx) => (
                                                <button key={idx} onClick={() => setActivePreviewIndex(idx)} className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${activePreviewIndex === idx ? 'bg-black text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}>
                                                    {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="bg-white p-2 rounded-[30px] shadow-2xl border border-zinc-200 flex-1 overflow-hidden">
                                        <iframe src={currentPreviewBatch[activePreviewIndex]?.previewUrl} className="w-full h-full rounded-[24px]" title={`Preview ${activePreviewIndex + 1}`} />
                                    </div>

                                    <div className="pt-4 mt-auto shrink-0 flex gap-4">
                                        <button onClick={() => setGenerationState('form')} className="px-8 py-5 bg-white border border-zinc-200 text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-all shadow-sm">
                                            Back to Editor
                                        </button>
                                        <button onClick={addToBasket} className="flex-1 bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                            Add {currentPreviewBatch.length} Document(s) to Ledger Batch
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center bg-white border border-zinc-200 rounded-[32px] p-10 text-center shadow-sm">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 mb-2">Documents Added to Batch</h2>
                                    <p className="text-xs font-bold text-zinc-500 max-w-sm mb-10 leading-relaxed">
                                        The generated documents have been successfully added to your Ledger Batch on the right. You can submit them all at once.
                                    </p>
                                    <button onClick={startNewInvoice} className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 active:scale-95 transition-all shadow-xl flex items-center gap-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        Create Another Document
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="w-full xl:w-96 flex flex-col bg-white border border-zinc-200 rounded-[32px] shadow-sm overflow-hidden shrink-0">
                            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center shrink-0">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900">Ledger Batch</h3>
                                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{basket.length} Items Ready</p>
                                </div>
                                <div className="w-8 h-8 bg-zinc-100 text-zinc-500 rounded-full flex items-center justify-center text-[10px] font-black">{basket.length}</div>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-zinc-50/30">
                                {basket.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-60">
                                        <svg className="w-8 h-8 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                        <p className="text-[9px] font-black uppercase tracking-widest">Batch is empty</p>
                                    </div>
                                ) : (
                                    basket.map((item, i) => (
                                        <div key={item.id} className="bg-white border border-zinc-200 p-3 rounded-xl flex justify-between items-center group shadow-sm animate-in slide-in-from-right-5">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${item.type === 'maintenance' ? 'bg-purple-50 border-purple-200 text-purple-500' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
                                                    {item.type === 'maintenance' 
                                                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    }
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-bold text-zinc-900 truncate">{item.fileName}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate mt-0.5">€{formatCurrency(item.amountDue)}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromBasket(item.id)} className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            <div className="p-4 border-t border-zinc-100 bg-white shrink-0">
                                <button 
                                    onClick={submitBasketToLedger} 
                                    disabled={sending || basket.length === 0} 
                                    className="w-full bg-emerald-500 text-white py-5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>}
                                    {sending ? 'Processing Batch...' : 'Submit Batch to Ledger'}
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {toast && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-full shadow-2xl z-[9999] animate-in slide-in-from-bottom-5 duration-300 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' :
                            toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            'bg-zinc-900 text-white border-zinc-800'
                    }`}>
                    {toast.type === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                    {toast.type === 'error' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    {toast.message}
                </div>
             )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
            `}} />
        </div>
    );
}