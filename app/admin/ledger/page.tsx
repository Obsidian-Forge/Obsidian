"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, Search, Filter, ExternalLink, Trash2, CheckCircle2, Clock, XCircle, FileText, Send 
} from 'lucide-react';

export default function FinancialLedgerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid' | 'draft'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => { fetchLedgerData(); }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchLedgerData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('client_invoices')
                .select('*, clients(full_name, company_name, email)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setInvoices(data || []);
        } catch (error: any) {
            showToast("Ledger Sync Error: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string, targetStatus: string) => {
        if (currentStatus === targetStatus) return;
        try {
            await supabase.from('client_invoices').update({ status: targetStatus }).eq('id', id);
            showToast(`Status updated to ${targetStatus.toUpperCase()}`);
            fetchLedgerData();
        } catch (error: any) { showToast("Update failed: " + error.message, "error"); }
    };

    const deleteInvoice = async (id: string, url: string) => {
        if (!confirm("Are you sure you want to permanently erase this financial record?")) return;
        try {
            if (url && url !== '#') {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/');
                const bucketIndex = pathParts.findIndex(p => p === 'invoices' || p === 'vault' || p === 'client-assets');
                if (bucketIndex !== -1) {
                    await supabase.storage.from(pathParts[bucketIndex]).remove([pathParts.slice(bucketIndex + 1).join('/')]);
                }
            }
            await supabase.from('client_invoices').delete().eq('id', id);
            showToast("Financial record purged.");
            fetchLedgerData();
        } catch (error) { showToast("Purge failed.", "error"); }
    };

    const dispatchInvoiceEmail = async (invoice: any) => {
        if (!invoice.clients?.email) return showToast("Entity has no registered email.", "error");
        
        // PDF Yoksa Hata Ver: API çökeceği için önceden engelliyoruz.
        if (!invoice.file_url || invoice.file_url === '#') {
            return showToast("Error: This is a digital record without a generated PDF. Open it and Save as PDF first.", "error");
        }
        
        setSendingEmailId(invoice.id);
        try {
            if (invoice.status === 'draft') await supabase.from('client_invoices').update({ status: 'unpaid' }).eq('id', invoice.id);
            const response = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: invoice.clients.email, clientName: invoice.clients.full_name,
                    fileName: invoice.file_name, fileUrl: invoice.file_url,
                    documentNo: invoice.file_name.split('_')[0] || 'INV'
                })
            });

            if (!response.ok) throw new Error("Email provider dispatch failed.");
            showToast("Invoice dispatched securely to entity.");
            fetchLedgerData();
        } catch (error: any) { showToast(error.message, "error"); } 
        finally { setSendingEmailId(null); }
    };

    // GÜNCELLENEN KISIM: Dinamik Fatura Görüntüleyiciye Yönlendirir
    const handleViewDocument = (id: string, url: string) => {
        if (!url || url === '#') {
            // Dijital kayıtları yeni oluşturduğumuz dinamik faturada aç
            window.open(`/admin/ledger/${id}`, '_blank');
        } else {
            // Gerçek yüklenmiş PDF ise direkt URL'i aç
            window.open(url, '_blank');
        }
    };

    const searchLower = searchQuery.toLowerCase();
    const filteredInvoices = invoices.filter(inv => {
        const matchTab = activeTab === 'all' || inv.status === activeTab;
        const matchSearch = (inv.file_name?.toLowerCase() || '').includes(searchLower) || (inv.clients?.full_name?.toLowerCase() || '').includes(searchLower) || (inv.clients?.company_name?.toLowerCase() || '').includes(searchLower);
        return matchTab && matchSearch;
    });

    const metrics = {
        total: invoices.length, unpaid: invoices.filter(i => i.status === 'unpaid').length,
        paid: invoices.filter(i => i.status === 'paid').length, draft: invoices.filter(i => i.status === 'draft').length
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans pb-20 animate-in fade-in duration-700">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-zinc-200 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Financial Ledger</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Master Record of Issued Invoices & Transactions</p>
                    </div>
                    <button onClick={() => router.push('/admin/invoice-generator')} className="bg-black text-white px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-2">
                        <FileText size={14}/> Create New Invoice
                    </button>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white border border-zinc-200 p-6 rounded-[28px] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Total Issued</p>
                        <p className="text-3xl font-light font-mono text-black">{metrics.total}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-6 rounded-[28px] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Awaiting Payment</p>
                        <p className="text-3xl font-light font-mono text-red-500">{metrics.unpaid}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-6 rounded-[28px] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Settled (Paid)</p>
                        <p className="text-3xl font-light font-mono text-emerald-500">{metrics.paid}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-6 rounded-[28px] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Drafts (Hidden)</p>
                        <p className="text-3xl font-light font-mono text-zinc-500">{metrics.draft}</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 w-fit">
                        {[{ id: 'all', label: 'All Records' }, { id: 'unpaid', label: 'Unpaid' }, { id: 'paid', label: 'Paid' }, { id: 'draft', label: 'Drafts' }].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-black'}`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input type="text" placeholder="Search Entity or Document..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-zinc-200 pl-10 pr-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black transition-all shadow-sm" />
                    </div>
                </div>

                <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex justify-center"><span className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin" /></div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="py-20 text-center flex flex-col items-center">
                            <Wallet className="text-zinc-200 mb-4" size={32}/>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No financial records found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-zinc-50/80 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Document</th>
                                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Entity (Client)</th>
                                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Date Issued</th>
                                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Status</th>
                                        <th className="px-6 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-right">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredInvoices.map(inv => {
                                        const isDigitalOnly = !inv.file_url || inv.file_url === '#';
                                        return (
                                            <tr key={inv.id} className="hover:bg-zinc-50 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${inv.status === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : inv.status === 'draft' ? 'bg-zinc-100 border-zinc-200 text-zinc-500' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                                            <FileText size={16}/>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-zinc-900">{inv.file_name}</p>
                                                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">{isDigitalOnly ? 'DIGITAL RECORD' : 'PDF INVOICE'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-medium text-zinc-900">{inv.clients?.full_name || 'Unknown Entity'}</p>
                                                    {inv.clients?.company_name && <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">{inv.clients.company_name}</p>}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-xs font-mono text-zinc-600">{new Date(inv.created_at).toLocaleDateString('en-GB')}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : inv.status === 'draft' ? 'bg-zinc-100 text-zinc-600 border-zinc-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                                        {inv.status === 'paid' && <CheckCircle2 size={10}/>}
                                                        {inv.status === 'unpaid' && <Clock size={10}/>}
                                                        {inv.status === 'draft' && <XCircle size={10}/>}
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {inv.status !== 'draft' && (
                                                            <button onClick={() => toggleStatus(inv.id, inv.status, inv.status === 'paid' ? 'unpaid' : 'paid')} className={`p-2 rounded-lg border transition-colors ${inv.status === 'paid' ? 'text-amber-500 bg-amber-50 border-amber-200 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`} title={inv.status === 'paid' ? 'Mark as Unpaid' : 'Mark as Paid'}>
                                                                {inv.status === 'paid' ? <XCircle size={14}/> : <CheckCircle2 size={14}/>}
                                                            </button>
                                                        )}
                                                        {inv.status === 'draft' && (
                                                            <button onClick={() => toggleStatus(inv.id, 'draft', 'unpaid')} className="px-3 py-2 bg-black text-white rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors border border-black">Publish</button>
                                                        )}
                                                        <button onClick={() => dispatchInvoiceEmail(inv)} disabled={sendingEmailId === inv.id || isDigitalOnly} className={`p-2 rounded-lg border transition-colors ${isDigitalOnly ? 'bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed' : 'bg-white border-zinc-200 text-zinc-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50'}`} title={isDigitalOnly ? "Cannot email digital record without PDF" : "Dispatch via Email"}>
                                                            {sendingEmailId === inv.id ? <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin block" /> : <Send size={14}/>}
                                                        </button>
                                                        
                                                        {/* YENİ VIEW DOCUMENT FONKSİYONU BAĞLANDI */}
                                                        <button onClick={() => handleViewDocument(inv.id, inv.file_url)} className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-black hover:border-zinc-300 transition-colors" title="View Document">
                                                            <ExternalLink size={14}/>
                                                        </button>

                                                        <button onClick={() => deleteInvoice(inv.id, inv.file_url)} className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors" title="Purge Record">
                                                            <Trash2 size={14}/>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}