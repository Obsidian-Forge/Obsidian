"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

interface BankDetails {
    id: string;
    bank_name: string;
    iban: string;
    swift: string;
}

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    rate: number;
    detailsBody?: string[]; 
}

const DEFAULT_NOTES = "Work commences upon receipt of the initial deposit. Final handover and source code transfer upon full payment.\n\nEXCLUSIONS: Third-party costs including domain registration, premium hosting (e.g., Combell), and external software subscriptions are explicitly excluded from this estimate and are to be maintained directly by the client.";

export default function InvoiceGeneratorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [sending, setSending] = useState(false);
    
    const [clients, setClients] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankDetails[]>([]);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    
    const [selectedDiscoveryId, setSelectedDiscoveryId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedBankId, setSelectedBankId] = useState('');
    
    const [showBankForm, setShowBankForm] = useState(false);
    const [newBank, setNewBank] = useState({ name: '', iban: '', swift: '' });

    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: `PRO-${Math.floor(10000 + Math.random() * 90000)}`,
        issueDate: new Date().toISOString().split('T')[0],
        paymentPlan: '30-70-3', 
        currency: '€', 
        notes: DEFAULT_NOTES,
        items: [{ id: '1', description: 'Architectural Blueprint & Core Development', quantity: 1, rate: 0, detailsBody: [] }] as InvoiceItem[]
    });

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [generationState, setGenerationState] = useState<'form' | 'preview'>('form');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        const [clientsRes, banksRes, discoveryRes] = await Promise.all([
            supabase.from('clients').select('*').is('archived_at', null),
            supabase.from('admin_banks').select('*'),
            supabase.from('project_discovery').select('*').eq('status', 'pending')
        ]);

        if (clientsRes.data) setClients(clientsRes.data);
        if (banksRes.data) setBankAccounts(banksRes.data);
        if (discoveryRes.data) setDiscoveries(discoveryRes.data);
        
        if (banksRes.data && banksRes.data.length > 0) {
            setSelectedBankId(banksRes.data[0].id);
        }
        
        setLoading(false);
    };

    const handleSaveBank = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data, error } = await supabase.from('admin_banks')
                .insert([{ bank_name: newBank.name, iban: newBank.iban, swift: newBank.swift }])
                .select().single();
            if (error) throw error;
            setBankAccounts([...bankAccounts, data]);
            setSelectedBankId(data.id);
            setShowBankForm(false);
            setNewBank({ name: '', iban: '', swift: '' });
        } catch (error: any) { alert("Error saving bank: " + error.message); }
    };

    const deleteBank = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this bank account?")) return;
        try {
            const { error } = await supabase.from('admin_banks').delete().eq('id', id);
            if (error) throw error;
            setBankAccounts(prev => prev.filter(b => b.id !== id));
            if (selectedBankId === id) setSelectedBankId('');
        } catch (error: any) {
            alert("Error deleting bank: " + error.message);
        }
    };

    const handleImportDiscovery = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const discId = e.target.value;
        setSelectedDiscoveryId(discId);

        if (!discId) {
            setSelectedClientId('');
            setInvoiceData(prev => ({
                ...prev,
                items: [{ id: Math.random().toString(), description: '', quantity: 1, rate: 0, detailsBody: [] }],
                notes: DEFAULT_NOTES
            }));
            return;
        }

        const discovery = discoveries.find(d => d.id === discId);
        if (!discovery) return;

        // Müşteri zaten "Active Database" de yaratılmışsa otomatik seç
        const client = clients.find(c => c.email === discovery.client_email);
        if (client) setSelectedClientId(client.id);

        const discDetails = discovery.details;
        const detailsBody = [
            `Deployment Path: ${discDetails.Timeline === 'rush' ? 'Rush (< 3 Weeks)' : discDetails.Timeline === 'flexible' ? 'Flexible (2-3 Months)' : 'Standard (1-2 Months)'}`,
            `Core Architecture: ${discovery.project_type} (${discDetails['Page Count']} Pages)`,
            `Design UI/UX: ${discDetails['Design Style']} (Typography: ${discDetails.Typography})`,
            `Brand Colors: ${discDetails.Colors}`,
            `Copywriting: ${discDetails.Copywriting}`,
            `Technical Integrations: ${discDetails.Integrations || 'Standard Setup'}`,
            `SEO Optimization: ${discDetails['SEO Setup'] === 'advanced' ? 'Advanced Technical' : 'Standard Setup'}`
        ];

        if (discDetails.Maintenance && discDetails.Maintenance !== 'None') {
            detailsBody.push(`Support Package: ${discDetails.Maintenance}`);
        }

        setInvoiceData(prev => ({
            ...prev,
            items: [
                { 
                    id: Math.random().toString(), 
                    description: `Novatrum Architecture - ${discovery.project_type} (Ref: ${discovery.discovery_number})`, 
                    quantity: 1, 
                    rate: discovery.estimated_price,
                    detailsBody: detailsBody
                }
            ],
            notes: DEFAULT_NOTES
        }));
    };

    const addItem = () => {
        setInvoiceData(prev => ({ ...prev, items: [...prev.items, { id: Math.random().toString(), description: '', quantity: 1, rate: 0, detailsBody: [] }] }));
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setInvoiceData(prev => ({ ...prev, items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item) }));
    };

    const removeItem = (id: string) => {
        setInvoiceData(prev => {
            const newItems = prev.items.filter(item => item.id !== id);
            if (newItems.length === 0) {
                setSelectedDiscoveryId('');
                setSelectedClientId('');
                return {
                    ...prev,
                    items: [{ id: Math.random().toString(), description: '', quantity: 1, rate: 0, detailsBody: [] }],
                    notes: DEFAULT_NOTES
                };
            }
            return { ...prev, items: newItems };
        });
    };

    const calculateTotal = () => invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

    const getMilestones = (total: number) => {
        if (invoiceData.paymentPlan === '100') {
            return [{ desc: "100% Upfront (Project Kick-off)", amount: total }];
        }
        if (invoiceData.paymentPlan === '50-50') {
            return [
                { desc: "50% Upfront Deposit (To commence work)", amount: total * 0.5 },
                { desc: "50% Final Payment (Prior to source code handover)", amount: total * 0.5 }
            ];
        }
        if (invoiceData.paymentPlan === '30-70-2') {
            return [
                { desc: "30% Upfront Deposit (Project Kick-off)", amount: total * 0.3 },
                { desc: "35% Milestone 1 (Month 1 Progress)", amount: total * 0.35 },
                { desc: "35% Final Payment (Prior to handover)", amount: total * 0.35 }
            ];
        }
        if (invoiceData.paymentPlan === '30-70-3') {
            const p1 = total * 0.3;
            const p2 = total * (70/300); 
            const p3 = total * (70/300);
            const p4 = total - p1 - p2 - p3; 
            return [
                { desc: "30% Upfront Deposit (Project Kick-off)", amount: p1 },
                { desc: "23.33% Milestone 1 (Month 1 Progress)", amount: p2 },
                { desc: "23.33% Milestone 2 (Month 2 Progress)", amount: p3 },
                { desc: "23.34% Final Payment (Prior to handover)", amount: p4 }
            ];
        }
        return [];
    };

    const generatePDF = async () => {
        setGenerating(true);
        const client = clients.find(c => c.id === selectedClientId);
        const bank = bankAccounts.find(b => b.id === selectedBankId);
        
        if (!client || !bank) {
            alert("Please select a client and a bank account.");
            setGenerating(false);
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const cur = invoiceData.currency;

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

        // 1. HEADER 
        if (logoData) {
            doc.addImage(logoData, 'PNG', 20, 15, 25, 25);
        } else {
            doc.setFontSize(22); doc.setFont("helvetica", "bold");
            doc.text("NOVATRUM", 20, 25);
        }

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122);
        doc.text("Premium Software Studio", 20, 45);
        
        doc.setFontSize(9);
        doc.text("info@novatrum.eu  |  novatrum.eu", 20, 50);

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(24, 24, 27);
        doc.text("PROFORMA INVOICE & SOW", pageWidth - 20, 28, { align: "right" });

        // 2. BİLGİ BÖLÜMÜ
        let y = 65;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(113, 113, 122);
        doc.text("PREPARED FOR:", 20, y);
        doc.setTextColor(24, 24, 27);
        doc.text(client.full_name, 20, y + 6);
        doc.setFont("helvetica", "normal");
        if (client.company_name) doc.text(client.company_name, 20, y + 12);
        doc.text(client.email, 20, y + 18);
        if (client.address) {
            const splitAddress = doc.splitTextToSize(client.address, 70);
            doc.text(splitAddress, 20, y + 24);
        }

        doc.setFont("helvetica", "bold");
        doc.text(`Proforma No:`, pageWidth - 60, y);
        doc.setFont("helvetica", "normal");
        doc.text(invoiceData.invoiceNumber, pageWidth - 20, y, { align: "right" });
        
        doc.setFont("helvetica", "bold");
        doc.text(`Issue Date:`, pageWidth - 60, y + 8);
        doc.setFont("helvetica", "normal");
        doc.text(invoiceData.issueDate, pageWidth - 20, y + 8, { align: "right" });

        const validUntil = new Date(new Date(invoiceData.issueDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        doc.setFont("helvetica", "bold");
        doc.setTextColor(239, 68, 68); 
        doc.text(`Valid Until:`, pageWidth - 60, y + 16);
        doc.setFont("helvetica", "normal");
        doc.text(validUntil, pageWidth - 20, y + 16, { align: "right" });
        doc.setTextColor(24, 24, 27);

        // 3. TABLO BAŞLIĞI
        y = 110;
        doc.setFillColor(250, 250, 250); 
        doc.rect(20, y - 6, pageWidth - 40, 10, 'F');
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(113, 113, 122);
        doc.text("DESCRIPTION", 25, y);
        doc.text("QTY", pageWidth - 80, y, { align: "center" });
        doc.text("RATE", pageWidth - 50, y, { align: "right" });
        doc.text("AMOUNT", pageWidth - 25, y, { align: "right" });

        // 4. TABLO İÇERİĞİ
        y += 12;
        doc.setTextColor(24, 24, 27);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        invoiceData.items.forEach(item => {
            const splitDesc = doc.splitTextToSize(item.description || '-', 100);
            doc.text(splitDesc, 25, y);
            doc.text(item.quantity.toString(), pageWidth - 80, y, { align: "center" });
            doc.text(`${cur}${item.rate.toLocaleString()}`, pageWidth - 50, y, { align: "right" });
            doc.text(`${cur}${(item.quantity * item.rate).toLocaleString()}`, pageWidth - 25, y, { align: "right" });
            
            y += (splitDesc.length * 5) + 2;

            if (item.detailsBody && item.detailsBody.length > 0) {
                doc.setFontSize(8);
                doc.setTextColor(82, 82, 91); 
                doc.setFont("helvetica", "italic");
                
                item.detailsBody.forEach(detail => {
                    if (y > pageHeight - 50) { 
                        doc.addPage(); 
                        y = 20; 
                    }
                    
                    const splitDetail = doc.splitTextToSize(`> ${detail}`, pageWidth - 50);
                    doc.text(splitDetail, 28, y);
                    y += (splitDetail.length * 4) + 1;
                });
                
                doc.setFontSize(10);
                doc.setTextColor(24, 24, 27);
                doc.setFont("helvetica", "normal");
                y += 3;
            } else { 
                y += 2; 
            }
            
            doc.setDrawColor(228, 228, 231);
            doc.line(20, y - 1, pageWidth - 20, y - 1);
            y += 6; 
        });

        // 5. TOTAL
        if (y > pageHeight - 60) { doc.addPage(); y = 20; }
        
        y += 5;
        const total = calculateTotal();

        doc.setDrawColor(24, 24, 27);
        doc.setLineWidth(0.5);
        doc.rect(pageWidth - 90, y - 6, 70, 12);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL (EXCL. VAT):", pageWidth - 85, y+2);
        doc.text(`${cur}${total.toLocaleString()}`, pageWidth - 25, y+2, { align: "right" });
        doc.setLineWidth(0.1); 

        // 6. ÖDEME PLANI (MILESTONES)
        y += 25;
        if (y > pageHeight - 60) { doc.addPage(); y = 25; }

        doc.setFillColor(250, 250, 250); 
        doc.rect(20, y - 6, pageWidth - 40, 10, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(113, 113, 122);
        doc.text("PAYMENT SCHEDULE & MILESTONES", 25, y);

        y += 10;
        doc.setTextColor(24, 24, 27);
        const milestones = getMilestones(total);
        milestones.forEach((m, idx) => {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text(`${idx + 1}. ${m.desc}`, 25, y);
            doc.setFont("helvetica", "normal");
            doc.text(`${cur}${m.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, pageWidth - 25, y, { align: "right" });
            y += 8;
        });

        // 7. FOOTER 
        let footerY = pageHeight - 85; 
        
        if (y > footerY - 10) { 
            doc.addPage(); 
            footerY = pageHeight - 85; 
        }

        doc.setDrawColor(228, 228, 231);
        doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

        doc.setTextColor(24, 24, 27);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("PAYMENT INSTRUCTIONS", 20, footerY);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(82, 82, 91);
        doc.text(`Bank Name: ${bank.bank_name}`, 20, footerY + 6);
        doc.text(`IBAN: ${bank.iban}`, 20, footerY + 11);
        if (bank.swift) doc.text(`SWIFT/BIC: ${bank.swift}`, 20, footerY + 16);

        doc.setFont("helvetica", "bold");
        doc.setTextColor(24, 24, 27);
        doc.text("ACCEPTED & AGREED BY:", 20, footerY + 35);
        doc.setDrawColor(24, 24, 27);
        doc.line(20, footerY + 45, 80, footerY + 45); 
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122);
        doc.text("Authorized Signature & Date", 20, footerY + 50);

        let rightY = footerY;
        doc.setTextColor(24, 24, 27);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("TERMS & EXCLUSIONS", 110, rightY);
        
        rightY += 5;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122);
        
        const splitNotes = doc.splitTextToSize(invoiceData.notes, 85);
        doc.text(splitNotes, 110, rightY);
        
        rightY += (splitNotes.length * 3.5) + 4; 
        
        doc.setFont("helvetica", "bold");
        doc.text("ADMINISTRATIVE PARTNER (TENTOO):", 110, rightY);
        
        rightY += 4;
        doc.setFont("helvetica", "normal");
        const tentooNote = "Novatrum operates through its official administrative partner, Tentoo. Official tax invoices, including applicable VAT, will be issued by Tentoo based on the milestones agreed here.";
        const splitTentoo = doc.splitTextToSize(tentooNote, 85);
        doc.text(splitTentoo, 110, rightY);

        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setGenerationState('preview');
        setGenerating(false);
    };

    const sendToClient = async () => {
        if (!pdfUrl || !selectedClientId) return;
        setSending(true);
        const client = clients.find(c => c.id === selectedClientId);
        
        try {
            const pdfBlob = await fetch(pdfUrl).then(r => r.blob());
            const fileName = `invoices/${client.id}/${invoiceData.invoiceNumber}.pdf`;
            
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(fileName);

            await supabase.from('client_invoices').insert([{
                client_id: client.id,
                file_name: `${invoiceData.invoiceNumber}.pdf`,
                file_url: publicUrl,
                status: 'unpaid'
            }]);

            const response = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'invoice',
                    email: client.email,
                    clientName: client.full_name,
                    invoiceNumber: invoiceData.invoiceNumber,
                    invoiceLink: publicUrl,
                    amount: calculateTotal(),
                    currency: invoiceData.currency 
                })
            });

            if (!response.ok) throw new Error("Email sending failed");

            alert("Proforma securely saved and sent to client!");
            router.push('/admin/dashboard');
            
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setSending(false);
        }
    };

    if (loading) return <div className="p-20 text-center font-black uppercase tracking-widest text-zinc-400">Loading Billing Engine...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 font-sans flex flex-col md:flex-row pb-20 md:pb-0 relative overflow-x-hidden">
            
            <div className={`w-full md:w-1/2 p-6 md:p-12 lg:p-16 overflow-y-auto ${generationState === 'preview' ? 'hidden md:block' : 'block'}`}>
                <div className="mb-10">
                    <button onClick={() => router.push('/admin/dashboard')} className="text-[10px] font-black uppercase text-zinc-400 mb-6 flex items-center gap-2 hover:text-black transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Back to Hub
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 leading-tight">Billing Engine</h1>
                    <p className="text-zinc-500 font-bold text-sm mt-2 max-w-lg">Generate detailed, print-friendly financial documents from discovery blueprints.</p>
                </div>

                <div className="space-y-8">
                    
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl shadow-sm">
                        <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-2 block flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Auto-Fill from Discovery
                        </label>
                        <select value={selectedDiscoveryId} onChange={handleImportDiscovery} className="w-full bg-white border border-indigo-200 p-4 rounded-xl text-xs font-bold outline-none cursor-pointer text-indigo-900 focus:border-indigo-400 transition-colors">
                            <option value="">Select a pending discovery log...</option>
                            {discoveries.map(d => (
                                <option key={d.id} value={d.id}>{d.discovery_number} - {d.client_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Bill To (Client) *</label>
                            <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full bg-white border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-zinc-400 text-zinc-900 transition-colors">
                                <option value="">Select Client</option>
                                {/* DÜZELTİLDİ: Sadece e-mail adresi gösteriliyor */}
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Internal Reference Bank *</label>
                            <div className="flex gap-2">
                                <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)} className="w-full bg-white border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-zinc-400 text-zinc-900 transition-colors">
                                    <option value="">Select Bank Account</option>
                                    {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.bank_name}</option>)}
                                </select>
                                {selectedBankId && (
                                    <button type="button" onClick={() => deleteBank(selectedBankId)} className="bg-red-50 text-red-500 border border-red-100 px-4 rounded-xl hover:bg-red-100 transition-colors shrink-0" title="Delete Bank">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                )}
                            </div>
                            <button onClick={() => setShowBankForm(!showBankForm)} className="text-[9px] font-bold uppercase text-indigo-500 mt-2 hover:underline transition-all">+ Add New Bank</button>
                        </div>
                    </div>

                    {showBankForm && (
                        <form onSubmit={handleSaveBank} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4 animate-in fade-in">
                            <input type="text" placeholder="Bank Name" required className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-xs font-bold" value={newBank.name} onChange={e => setNewBank({...newBank, name: e.target.value})} />
                            <input type="text" placeholder="IBAN" required className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-xs font-bold" value={newBank.iban} onChange={e => setNewBank({...newBank, iban: e.target.value})} />
                            <input type="text" placeholder="SWIFT (Optional)" className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-lg text-xs font-bold" value={newBank.swift} onChange={e => setNewBank({...newBank, swift: e.target.value})} />
                            <div className="flex gap-2 justify-end">
                                <button type="button" onClick={() => setShowBankForm(false)} className="text-[9px] font-black uppercase text-zinc-500 px-4 py-2 hover:bg-zinc-100 rounded-lg">Cancel</button>
                                <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors">Save Account</button>
                            </div>
                        </form>
                    )}

                    <div className="pt-6 border-t border-zinc-200">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Line Items</label>
                        <div className="space-y-3">
                            {invoiceData.items.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-3 group animate-in fade-in">
                                    <div className="flex flex-col md:flex-row gap-3 relative">
                                        <button onClick={() => removeItem(item.id)} className="absolute -top-1 -right-1 bg-white border border-red-200 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm z-10 hover:bg-red-50">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                        <input type="text" placeholder="Description" className="flex-1 bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-xs font-bold outline-none" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                                        <div className="flex gap-3">
                                            <input type="number" placeholder="Qty" min="1" className="w-20 bg-zinc-50 border border-zinc-100 p-3 rounded-lg text-xs font-bold outline-none text-center" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} />
                                            <div className="relative w-32">
                                                <span className="absolute left-3 top-3 text-xs font-bold text-zinc-400">{invoiceData.currency}</span>
                                                <input type="number" placeholder="Rate" className="w-full bg-zinc-50 border border-zinc-100 p-3 pl-8 rounded-lg text-xs font-bold outline-none" value={item.rate || ''} onChange={(e) => updateItem(item.id, 'rate', parseInt(e.target.value) || 0)} />
                                            </div>
                                        </div>
                                    </div>
                                    {item.detailsBody && item.detailsBody.length > 0 && (
                                        <div className="p-3 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-lg text-[9px] text-zinc-600 font-bold space-y-1">
                                            {item.detailsBody.map((detail, idx) => (
                                                <p key={idx} className="truncate">• {detail}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={addItem} className="mt-4 text-[9px] font-black uppercase tracking-widest text-zinc-800 bg-white px-4 py-2.5 rounded-lg hover:bg-zinc-100 border border-zinc-200 shadow-sm transition-colors active:scale-95">+ Add Custom Item</button>
                    </div>

                    <div className="pt-6 border-t border-zinc-200">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 block">Payment Milestone Plan</label>
                        <div className="flex gap-4 mb-2">
                            <select value={invoiceData.currency} onChange={(e) => setInvoiceData({...invoiceData, currency: e.target.value})} className="w-1/3 bg-white border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-zinc-400 text-zinc-900 transition-colors">
                                <option value="€">EUR (€)</option>
                                <option value="$">USD ($)</option>
                                <option value="£">GBP (£)</option>
                            </select>
                            <select value={invoiceData.paymentPlan} onChange={(e) => setInvoiceData({...invoiceData, paymentPlan: e.target.value})} className="w-2/3 bg-white border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-zinc-400 text-zinc-900 transition-colors">
                                <option value="100">100% Upfront (Kick-off)</option>
                                <option value="50-50">50% Upfront / 50% Before Handover</option>
                                <option value="30-70-2">30% Upfront / 70% Over 2 Months</option>
                                <option value="30-70-3">30% Upfront / 70% Over 3 Months</option>
                            </select>
                        </div>
                        <p className="text-[9px] font-bold text-zinc-500">Select currency and how to divide the total (excl. VAT) into payable milestones.</p>
                    </div>

                    <button 
                        onClick={generatePDF} 
                        disabled={generating || !selectedClientId || !selectedBankId || invoiceData.items.length === 0}
                        className="w-full bg-zinc-950 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:bg-zinc-300 mt-8 shadow-black/20"
                    >
                        {generating ? 'Compiling Blueprint...' : 'Generate Proforma & SOW'}
                    </button>
                </div>
            </div>

            {/* SAĞ TARAF: PDF ÖNİZLEME */}
            <div className={`w-full md:w-1/2 bg-zinc-100 border-l border-zinc-200 p-6 md:p-12 lg:p-16 flex flex-col justify-center ${generationState === 'form' ? 'hidden md:flex' : 'flex'}`}>
                {generationState === 'form' ? (
                    <div className="text-center opacity-50 flex flex-col items-center animate-in fade-in duration-1000">
                        <svg className="w-16 h-16 text-zinc-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Configure parameters to preview document</p>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right duration-500 h-full flex flex-col">
                        <div className="flex justify-between items-center md:hidden pb-4 border-b border-zinc-200">
                            <h3 className="text-xl font-black uppercase">Blueprint Preview</h3>
                            <button onClick={() => setGenerationState('form')} className="text-[10px] font-black uppercase text-zinc-500 p-2 hover:bg-white rounded-lg">Edit Details</button>
                        </div>
                        <div className="bg-white p-2 rounded-[30px] shadow-2xl border border-zinc-200 flex-1 overflow-hidden min-h-[500px]">
                            {pdfUrl && <iframe src={pdfUrl} className="w-full h-full rounded-[24px]" title="Preview" />}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 mt-auto">
                            <button onClick={() => setGenerationState('form')} className="w-full sm:w-auto bg-white border border-zinc-200 text-black py-5 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-50 transition-colors shadow-sm">
                                Edit Details
                            </button>
                            <button onClick={sendToClient} disabled={sending} className="flex-1 bg-emerald-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-3">
                                {sending ? 'Transmitting...' : 'Send to Client'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}