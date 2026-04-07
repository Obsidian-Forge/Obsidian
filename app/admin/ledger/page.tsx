"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseState {
    gemini: number;
    vercel: number;
    wifi: number;
    room: number;
    other: number;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);
};

export default function FinancialLedgerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    
    const [clients, setClients] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    
    const [activeTab, setActiveTab] = useState<'action_needed' | 'drafts' | 'all'>('action_needed');

    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientDossier, setClientDossier] = useState<any>(null);
    const [installmentCount, setInstallmentCount] = useState<number>(2);

    const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
    const [expenses, setExpenses] = useState<ExpenseState>({ gemini: 0, vercel: 0, wifi: 0, room: 0, other: 0 });
    const [expenseMode, setExpenseMode] = useState<'inclusive' | 'exclusive'>('inclusive');

    const [generatingInvoiceId, setGeneratingInvoiceId] = useState<string | null>(null);
    const [sendingEmailId, setSendingEmailId] = useState<string | null>(null); 
    
    const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
    const [processingBatch, setProcessingBatch] = useState(false);
    const [processingEmailBatch, setProcessingEmailBatch] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedClient && discoveries.length > 0) {
            buildClientDossier(selectedClient, invoices, discoveries, installmentCount);
        }
    }, [installmentCount, invoices]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [invRes, clientsRes, discRes] = await Promise.all([
                supabase.from('client_invoices').select('*').order('created_at', { ascending: false }),
                supabase.from('clients').select('*'),
                supabase.from('project_discovery').select('*').order('created_at', { ascending: false })
            ]);

            if (invRes.error) throw invRes.error;
            setClients(clientsRes.data || []);
            setInvoices(invRes.data || []);
            setDiscoveries(discRes.data || []);

            if (selectedClient) {
                buildClientDossier(selectedClient, invRes.data || [], discRes.data || [], installmentCount);
            }
        } catch (error: any) {
            showToast("Sync Error: " + error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const extractMaintenanceFee = (details: any) => {
        if (!details || !details.Maintenance) return null;
        const maintStr = String(details.Maintenance);
        if (maintStr.toLowerCase() === 'none' || maintStr.toLowerCase() === 'no') return null;
        const match = maintStr.match(/€\s*(\d+)/);
        if (match) return parseInt(match[1]);
        return null; 
    };

    const addDays = (dateString: string, days: number) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return date;
    };

    const calculateDaysOverdue = (dueDate: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        if (today > due) {
            const diffTime = Math.abs(today.getTime() - due.getTime());
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        }
        return 0;
    };

    const buildClientDossier = (clientInfo: any, allInvoices: any[], allDiscoveries: any[], numInstallments: number) => {
        setSelectedClient(clientInfo);
        const clientInvs = allInvoices.filter(i => i.client_id === clientInfo.id);
        const clientDisc = allDiscoveries.find(d => d.client_email?.toLowerCase() === clientInfo.email?.toLowerCase());

        const projInvoices = clientInvs.filter(i => i.invoice_type === 'project');
        const maintInvoices = clientInvs.filter(i => i.invoice_type === 'maintenance');

        const projectPrice = clientDisc?.estimated_price || 0;
        const discDate = clientDisc?.created_at || new Date().toISOString();
        const baseAmount = Math.floor((projectPrice / numInstallments) * 100) / 100;
        let remainingAmount = projectPrice;

        const milestones = [];
        for (let i = 0; i < numInstallments; i++) {
            const currentStepNumber = i + 1;
            const isLast = i === numInstallments - 1;
            const stepAmount = isLast ? remainingAmount : baseAmount;
            remainingAmount -= stepAmount;

            const inv = projInvoices.find(invoice => invoice.installment_no === currentStepNumber);
            
            const stepDueDate = new Date(discDate);
            stepDueDate.setDate(stepDueDate.getDate() + (i * 14) + 1);

            let stepStatus = 'Pending';
            let stepColor = 'text-zinc-500 bg-zinc-100 border-zinc-200';
            let daysOverdue = 0;

            if (inv) {
                if (inv.status === 'draft') { stepStatus = 'Draft (Hidden)'; stepColor = 'text-blue-600 bg-blue-50 border-blue-200'; }
                else if (inv.status === 'unpaid') { stepStatus = 'Invoiced (Unpaid)'; stepColor = 'text-amber-600 bg-amber-50 border-amber-200'; daysOverdue = calculateDaysOverdue(stepDueDate); }
                else if (inv.status === 'paid') { stepStatus = 'Paid'; stepColor = 'text-emerald-600 bg-emerald-50 border-emerald-200'; }
            } else if (new Date() > stepDueDate) {
                daysOverdue = calculateDaysOverdue(stepDueDate);
                stepStatus = 'Overdue (No Invoice)'; 
                stepColor = 'text-red-600 bg-red-50 border-red-200 animate-pulse';
            }

            milestones.push({
                id: `step_${currentStepNumber}`,
                title: isLast ? 'Final Delivery' : i === 0 ? 'Project Deposit' : `Milestone ${currentStepNumber}`,
                percent: Math.round((stepAmount / projectPrice) * 100),
                amount: stepAmount,
                dueDate: stepDueDate,
                invoice: inv,
                status: stepStatus,
                color: stepColor,
                daysOverdue: daysOverdue,
                stepNumber: currentStepNumber 
            });
        }

        const maintMatch = clientDisc?.details?.Maintenance?.match(/€\s*(\d+)/);
        const maintFee = maintMatch ? parseInt(maintMatch[1]) : null;

        setClientDossier({
            discovery: clientDisc,
            milestones,
            projectPrice,
            maintenance: { active: maintFee !== null, fee: maintFee, invoices: maintInvoices }
        });
    };

    const groupedClients = clients.map(client => {
        const clientInvs = invoices.filter(i => i.client_id === client.id);
        const disc = discoveries.find(d => d.client_email?.toLowerCase() === client.email?.toLowerCase());
        
        const draftsCount = clientInvs.filter(i => i.status === 'draft').length;
        const unpaidCount = clientInvs.filter(i => i.status === 'unpaid').length;
        const maintFee = extractMaintenanceFee(disc?.details);
        
        const projPrice = disc?.estimated_price || 0;
        const hasMissingDeposit = projPrice > 0 && clientInvs.filter(i => i.invoice_type === 'project').length === 0;
        const isActionNeeded = draftsCount > 0 || unpaidCount > 0 || hasMissingDeposit;

        return {
            ...client,
            discovery_number: disc?.discovery_number || 'N/A',
            project_type: disc?.project_type || 'N/A',
            draftsCount,
            unpaidCount,
            hasMissingDeposit,
            isActionNeeded,
            hasMaintenance: maintFee !== null,
            totalInvoices: clientInvs.length
        };
    });

    const filteredClients = groupedClients.filter(c => {
        if (activeTab === 'action_needed') return c.isActionNeeded;
        if (activeTab === 'drafts') return c.draftsCount > 0;
        return true; 
    });

    const generateInvoiceViaAPI = async (amount: number, type: 'project' | 'maintenance', title: string, milestone: any) => {
        setGeneratingInvoiceId(milestone.id);
        try {
            const totalExp = Object.values(expenses).reduce((a, b) => a + b, 0);
            const response = await fetch('/api/invoice-generator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: selectedClient.id,
                    clientEmail: selectedClient.email,
                    clientName: selectedClient.full_name,
                    companyName: selectedClient.company_name,
                    clientAddress: selectedClient.address,
                    amount, type, title,
                    projectName: clientDossier.discovery?.project_type || 'Custom System',
                    expenseMode, totalExpenses: totalExp,
                    installmentNo: milestone.stepNumber || 1,
                    totalInstallments: type === 'maintenance' ? 1 : installmentCount
                })
            });

            if (!response.ok) throw new Error("API Route Failure");
            showToast("Document generated and saved as Draft.", "success");
            await fetchData(); 
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setGeneratingInvoiceId(null);
        }
    };

    const togglePublishStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'draft' ? 'unpaid' : 'draft';
            await supabase.from('client_invoices').update({ status: newStatus }).eq('id', id);
            showToast(newStatus === 'unpaid' ? "Published to Client Ledger." : "Hidden from Client Ledger.", "success");
            fetchData(); 
        } catch (error) {
            showToast("Error updating visibility", "error");
        }
    };

    const togglePaymentStatus = async (id: string, currentStatus: string) => {
        try {
            if (currentStatus === 'draft') return; 
            const newStatus = currentStatus === 'unpaid' ? 'paid' : 'unpaid';
            await supabase.from('client_invoices').update({ status: newStatus }).eq('id', id);
            showToast(`Status marked as ${newStatus.toUpperCase()}.`, "success");
            fetchData(); 
        } catch (error) {
            showToast("Error updating payment status", "error");
        }
    };

    // BURASI DÜZELTİLDİ: /api/send-invoice rotasına gider
    const dispatchInvoiceEmail = async (invoice: any) => {
        setSendingEmailId(invoice.id);
        try {
            if (invoice.status === 'draft') {
                await supabase.from('client_invoices').update({ status: 'unpaid' }).eq('id', invoice.id);
            }

            const response = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedClient.email,
                    clientName: selectedClient.full_name,
                    fileName: invoice.file_name,
                    fileUrl: invoice.file_url,
                    documentNo: invoice.file_name.split('_')[0]
                })
            });

            if (!response.ok) throw new Error("Email provider failed to send.");

            showToast("Invoice dispatched to client email successfully.", "success");
            fetchData();
        } catch (error: any) {
            showToast("Email Dispatch failed: " + error.message, "error");
        } finally {
            setSendingEmailId(null);
        }
    };

    const toggleInvoiceSelection = (id: string) => {
        if (selectedInvoices.includes(id)) {
            setSelectedInvoices(prev => prev.filter(item => item !== id));
        } else {
            setSelectedInvoices(prev => [...prev, id]);
        }
    };

    const handleBatchPublish = async () => {
        if (selectedInvoices.length === 0) return;
        setProcessingBatch(true);
        try {
            const { error } = await supabase.from('client_invoices')
                .update({ status: 'unpaid' })
                .in('id', selectedInvoices)
                .eq('status', 'draft'); 

            if (error) throw error;

            showToast(`${selectedInvoices.length} document(s) successfully added to Client Dashboard.`, "success");
            setSelectedInvoices([]);
            fetchData();
        } catch (error: any) {
            showToast("Failed to publish package.", "error");
        } finally {
            setProcessingBatch(false);
        }
    };

    // BURASI DÜZELTİLDİ: /api/send-invoice rotasına gider
    const handleBatchDispatch = async () => {
        if (selectedInvoices.length === 0) return;
        setProcessingEmailBatch(true);
        try {
            await supabase.from('client_invoices')
                .update({ status: 'unpaid' })
                .in('id', selectedInvoices)
                .eq('status', 'draft');

            const sentInvoices = invoices.filter(inv => selectedInvoices.includes(inv.id));
            const attachments = sentInvoices.map(inv => ({ fileName: inv.file_name, fileUrl: inv.file_url }));

            const response = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: selectedClient.email,
                    clientName: selectedClient.full_name,
                    isBatch: true,
                    attachments: attachments
                })
            });

            if (!response.ok) throw new Error("Batch Email provider failed.");

            showToast(`Package dispatched via Email successfully.`, "success");
            setSelectedInvoices([]);
            fetchData();
        } catch (error: any) {
            showToast("Failed to dispatch package: " + error.message, "error");
        } finally {
            setProcessingEmailBatch(false);
        }
    };

    const deleteInvoice = async (id: string, url: string) => {
        if (!confirm("Permanently erase this record?")) return;
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            const filePath = pathParts.slice(pathParts.indexOf('client-assets') + 1).join('/');
            
            await supabase.storage.from('client-assets').remove([filePath]);
            await supabase.from('client_invoices').delete().eq('id', id);
            
            showToast("Invoice purged.", "info");
            await fetchData();
        } catch (error) {
            showToast("Deletetion failed.", "error");
        }
    };

    const handleExpenseChange = (field: keyof ExpenseState, value: string) => {
        setExpenses(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const totalExpenses = Object.values(expenses).reduce((a, b) => a + b, 0);
    const finalGross = expenseMode === 'exclusive' ? (selectedMilestone?.amount || 0) + totalExpenses : (selectedMilestone?.amount || 0);
    const netTaxable = finalGross - totalExpenses;
    const profitMargin = finalGross > 0 ? ((netTaxable / finalGross) * 100).toFixed(1) : "0.0";

    const copyTentooData = () => {
        if (!selectedMilestone) return;
        const modeText = expenseMode === 'inclusive' ? '(Expenses Deducted)' : '(Expenses Added to Client)';
        const text = `AÇIKLAMA: ${selectedClient.full_name} - ${selectedMilestone.title}\nBRÜT FATURA TUTARI (Gross): €${finalGross.toFixed(2)} ${modeText}\nBİLDİRİLEN GİDER (Expenses): €${totalExpenses.toFixed(2)}\n-----------------------\nVERGİLENDİRİLECEK NET MATRAH: €${netTaxable.toFixed(2)}`;
        navigator.clipboard.writeText(text);
        showToast("Tentoo data copied to clipboard.", "success");
    };

    if (loading && invoices.length === 0) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-bold text-[10px] tracking-widest text-zinc-400">LOADING FINANCIAL NETWORK...</div>;

    const InvoiceControls = ({ invoice }: { invoice: any }) => (
        <div className="flex items-center gap-1.5 flex-wrap w-full mt-4 pt-4 border-t border-zinc-100">
            <button 
                onClick={(e) => { e.stopPropagation(); togglePublishStatus(invoice.id, invoice.status); }} 
                className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 border ${invoice.status === 'draft' ? 'bg-black text-white border-black hover:bg-zinc-800' : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-100 hover:text-black'}`}
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={invoice.status === 'draft' ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"}></path></svg>
                {invoice.status === 'draft' ? 'Publish' : 'Hide'}
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); dispatchInvoiceEmail(invoice); }} 
                disabled={sendingEmailId === invoice.id}
                className="flex-1 min-w-[120px] bg-white text-zinc-800 border border-zinc-200 hover:bg-zinc-50 hover:border-black py-2 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
                {sendingEmailId === invoice.id ? <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>}
                {sendingEmailId === invoice.id ? 'Sending...' : 'Send Mail'}
            </button>

            <button 
                onClick={(e) => { e.stopPropagation(); togglePaymentStatus(invoice.id, invoice.status); }} 
                disabled={invoice.status === 'draft'}
                className={`py-2 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors border flex items-center justify-center gap-1.5 disabled:opacity-30 ${invoice.status === 'paid' ? 'bg-white text-emerald-600 border-zinc-200 hover:bg-emerald-50 hover:border-emerald-200' : 'bg-white text-amber-600 border-zinc-200 hover:bg-amber-50 hover:border-amber-200'}`}
                title={invoice.status === 'paid' ? "Mark Unpaid" : "Mark Paid"}
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
            </button>

            <a href={invoice.file_url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="p-2 bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-100 hover:text-black rounded-lg transition-colors flex items-center justify-center" title="View PDF">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>
            
            <button onClick={(e) => { e.stopPropagation(); deleteInvoice(invoice.id, invoice.file_url); }} className="p-2 bg-white text-zinc-400 border border-zinc-200 hover:bg-red-50 hover:border-red-100 hover:text-red-500 rounded-lg transition-colors flex items-center justify-center" title="Delete Permanently">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-black selection:text-white relative overflow-x-hidden">
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
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="max-w-[1600px] mx-auto p-6 md:p-14 relative z-10 custom-scrollbar">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Financial Ledger</h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Server-Side PDF Generation & Tracking</p>
                    </div>
                    <button onClick={() => router.push('/admin/dashboard')} className="bg-white text-black border border-zinc-200 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors shadow-sm active:scale-95 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg> Workspace
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white border border-zinc-200 p-8 rounded-[32px] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Action Needed</p>
                        <p className="text-4xl font-light font-mono text-red-500">{groupedClients.filter(c => c.isActionNeeded).length}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-8 rounded-[32px] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Drafts (To Publish)</p>
                        <p className="text-4xl font-light font-mono text-blue-500">{invoices.filter(i => i.status === 'draft').length}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-8 rounded-[32px] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Awaiting Payment</p>
                        <p className="text-4xl font-light font-mono text-amber-500">{invoices.filter(i => i.status === 'unpaid').length}</p>
                    </div>
                    <div className="bg-black text-white border border-zinc-800 p-8 rounded-[32px] shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Active Maintenance</p>
                        <p className="text-4xl font-light font-mono">{groupedClients.filter(c => c.hasMaintenance).length}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {[{ id: 'action_needed', label: 'Needs Action (Pending/Overdue)' }, { id: 'drafts', label: 'Drafts Awaiting Publish' }, { id: 'all', label: 'All Entities' }].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors appearance-none ${activeTab === tab.id ? 'bg-black text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-500 hover:border-black hover:text-black'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                        <div key={client.id} onClick={() => buildClientDossier(client, invoices, discoveries, installmentCount)} className="p-8 rounded-[32px] border bg-white border-zinc-200 hover:border-black hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-light tracking-tight truncate pr-4 text-black">{client.full_name}</h3>
                                    {client.isActionNeeded && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-2 shrink-0" title="Action Needed" />}
                                </div>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-6 truncate">{client.project_type}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                                    <span className="text-zinc-500">Drafts to Publish</span><span className={client.draftsCount > 0 ? 'text-blue-600' : 'text-zinc-300'}>{client.draftsCount}</span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                                    <span className="text-zinc-500">Invoiced (Unpaid)</span><span className={client.unpaidCount > 0 ? 'text-amber-500' : 'text-zinc-300'}>{client.unpaidCount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            <AnimatePresence>
                {selectedClient && clientDossier && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-zinc-900/60 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#FAFAFA] rounded-[40px] w-full max-w-7xl h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-zinc-200">
                            
                            <div className="px-10 py-8 border-b border-zinc-200 flex items-center justify-between bg-white shrink-0">
                                <div>
                                    <h2 className="text-3xl font-light tracking-tight text-black mb-1">{selectedClient.full_name}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{clientDossier.discovery?.project_type || 'Project'}</span>
                                        <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-600">Total: {formatCurrency(clientDossier.projectPrice)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2">
                                        <span className="text-[9px] font-bold uppercase text-zinc-500">Split:</span>
                                        <select value={installmentCount} onChange={(e) => setInstallmentCount(Number(e.target.value))} className="bg-transparent border-none text-[10px] font-bold outline-none cursor-pointer text-black">
                                            {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Parts</option>)}
                                        </select>
                                    </div>
                                    <button onClick={() => { setSelectedClient(null); setSelectedMilestone(null); setSelectedInvoices([]); }} className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-full transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
                                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 border-r border-zinc-200 pb-32">
                                    
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Project Financial Lifecycle</h3>
                                    </div>
                                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
                                        {clientDossier.milestones.map((ms: any) => (
                                            <div key={ms.id} onClick={() => setSelectedMilestone(ms)} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#FAFAFA] bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                    <div className={`w-3 h-3 rounded-full ${ms.status.includes('Paid') ? 'bg-emerald-500' : ms.status.includes('Overdue') ? 'bg-red-500' : ms.status.includes('Invoiced') ? 'bg-amber-500' : 'bg-zinc-300'}`} />
                                                </div>
                                                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-[24px] border shadow-sm transition-all cursor-pointer relative ${selectedMilestone?.id === ms.id ? 'border-black ring-1 ring-black bg-zinc-50' : 'bg-white border-zinc-200 hover:border-zinc-400'}`}>
                                                    
                                                    {ms.invoice && ms.invoice.status === 'draft' && (
                                                        <div className="absolute top-4 right-4 z-20">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={selectedInvoices.includes(ms.invoice.id)}
                                                                onChange={(e) => { e.stopPropagation(); toggleInvoiceSelection(ms.invoice.id); }}
                                                                className="w-5 h-5 cursor-pointer accent-black"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex justify-between items-start mb-2 pr-8">
                                                        <h4 className="font-bold text-sm text-black">{ms.title}</h4>
                                                        <span className="font-light font-mono text-lg text-black">{formatCurrency(ms.amount)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{ms.percent}% of total</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                                                        <span className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border ${ms.color}`}>{ms.status}</span>
                                                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest">
                                                            {ms.daysOverdue > 0 && <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">{ms.daysOverdue} Days Late</span>}
                                                            <span className="text-zinc-400">{ms.dueDate.toLocaleDateString('en-GB')}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {!ms.invoice ? (
                                                        <div className="mt-5 pt-4 border-t border-zinc-100">
                                                            <button onClick={(e) => { e.stopPropagation(); generateInvoiceViaAPI(ms.amount, 'project', ms.title, ms); }} disabled={generatingInvoiceId === ms.id} className="w-full bg-black text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all hover:bg-zinc-800 disabled:opacity-50">
                                                                {generatingInvoiceId === ms.id ? "Generating PDF..." : "Generate Invoice"}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <InvoiceControls invoice={ms.invoice} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* MAINTENANCE SECTION */}
                                    {clientDossier.maintenance.active && (
                                        <div className="mt-10 pt-10 border-t border-zinc-200">
                                            <div className="flex items-center justify-between mb-6">
                                                <div>
                                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Maintenance Lifecycle</h3>
                                                    <p className="text-[9px] text-zinc-400 mt-1">Based on Discovery</p>
                                                </div>
                                                <span className="px-3 py-1.5 bg-black text-white rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> {formatCurrency(clientDossier.maintenance.fee)} / Mo
                                                </span>
                                            </div>
                                            
                                            <button onClick={() => generateInvoiceViaAPI(clientDossier.maintenance.fee, 'maintenance', 'Monthly Subscription', { id: 'maint_new', stepNumber: 1 })} disabled={generatingInvoiceId === 'maint_new'} className="mb-6 w-full border border-zinc-300 bg-white hover:bg-zinc-50 text-black py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-sm">
                                                {generatingInvoiceId === 'maint_new' ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> API: Issue Maintenance Invoice</>}
                                            </button>

                                            <div className="space-y-4">
                                                {clientDossier.maintenance.invoices.length === 0 ? (
                                                    <div className="p-6 text-center border border-dashed rounded-[24px] border-zinc-200 bg-white">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No maintenance invoices issued yet.</p>
                                                    </div>
                                                ) : (
                                                    clientDossier.maintenance.invoices.map((inv: any) => (
                                                        <div key={inv.id} className="p-6 rounded-[24px] border border-zinc-200 bg-white flex flex-col relative shadow-sm hover:border-black transition-colors">
                                                            
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-4">
                                                                    {inv.status === 'draft' && (
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={selectedInvoices.includes(inv.id)}
                                                                            onChange={() => toggleInvoiceSelection(inv.id)}
                                                                            className="w-5 h-5 cursor-pointer accent-black shrink-0"
                                                                        />
                                                                    )}
                                                                    <div>
                                                                        <p className="text-sm font-bold text-black">{inv.file_name}</p>
                                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{new Date(inv.created_at).toLocaleDateString('en-GB')}</p>
                                                                    </div>
                                                                </div>
                                                                <span className={`px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : inv.status === 'draft' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{inv.status === 'draft' ? 'Draft (Hidden)' : inv.status}</span>
                                                            </div>

                                                            <InvoiceControls invoice={inv} />
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT PANEL: TENTOO ASSISTANT */}
                                {selectedMilestone && (
                                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full lg:w-[450px] bg-white p-10 flex flex-col shrink-0 border-l border-zinc-200 z-10 relative">
                                        <div className="flex justify-between items-center mb-8">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Tentoo Assistant</h3>
                                            <button onClick={() => setSelectedMilestone(null)} className="p-2 hover:bg-zinc-100 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                        </div>

                                        <div className="mb-6">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Target Item</p>
                                            <h4 className="font-bold text-base text-black">{selectedMilestone.title}</h4>
                                            <p className="font-light font-mono text-xl text-black mt-1">{formatCurrency(selectedMilestone.amount)}</p>
                                        </div>

                                        <div className="bg-zinc-50 p-1.5 rounded-xl border border-zinc-200 flex mb-8">
                                            <button onClick={() => setExpenseMode('inclusive')} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${expenseMode === 'inclusive' ? 'bg-white text-black shadow-sm' : 'text-zinc-400'}`}>Inclusive</button>
                                            <button onClick={() => setExpenseMode('exclusive')} className={`flex-1 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${expenseMode === 'exclusive' ? 'bg-white text-black shadow-sm' : 'text-zinc-400'}`}>Exclusive</button>
                                        </div>

                                        <div className="space-y-4 mb-10 overflow-y-auto pr-2 custom-scrollbar">
                                            {['gemini', 'vercel', 'wifi', 'room', 'other'].map(id => (
                                                <div key={id} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl">
                                                    <label className="text-[10px] font-bold uppercase text-zinc-500">{id}</label>
                                                    <input type="number" value={(expenses as any)[id] || ''} onChange={(e) => handleExpenseChange(id as any, e.target.value)} className="w-24 text-right bg-transparent border-none text-xs font-mono font-bold outline-none" placeholder="0.00" />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto bg-black text-white p-8 rounded-[32px] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-emerald-500 px-4 py-2 text-[10px] font-bold uppercase tracking-widest font-mono text-white rounded-bl-xl">Margin: {profitMargin}%</div>
                                            <div className="space-y-4 mt-4">
                                                <div className="flex justify-between text-zinc-400 text-[10px] uppercase font-bold"><span>Gross Invoice</span><span className="font-mono text-white text-sm">{formatCurrency(finalGross)}</span></div>
                                                <div className="flex justify-between text-zinc-400 text-[10px] uppercase font-bold pb-4 border-b border-zinc-800"><span>Expenses</span><span className="font-mono text-red-400 text-sm">-{formatCurrency(totalExpenses)}</span></div>
                                                <div className="flex justify-between items-end text-zinc-400 text-[10px] uppercase font-bold"><span>Net Taxable</span><span className="font-mono text-emerald-400 text-2xl">{formatCurrency(netTaxable)}</span></div>
                                            </div>
                                            <button onClick={copyTentooData} className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest mt-8 hover:bg-zinc-200 transition-all">Copy Tentoo Payload</button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                            
                            {/* EMAIL BATCH SENDING FLOAT BAR */}
                            {selectedInvoices.length > 0 && (
                                <motion.div 
                                    initial={{ y: 100 }} 
                                    animate={{ y: 0 }} 
                                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black text-white p-4 pr-4 pl-6 rounded-[24px] shadow-2xl flex items-center gap-6 z-50 border border-zinc-800"
                                >
                                    <div>
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Batch Operation</span>
                                        <span className="font-mono font-medium text-sm">{selectedInvoices.length} Item(s)</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setSelectedInvoices([])} className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors px-4 py-2">Cancel</button>
                                        
                                        <button 
                                            onClick={handleBatchPublish} 
                                            disabled={processingBatch || processingEmailBatch}
                                            className="bg-zinc-800 text-white border border-zinc-700 px-6 py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                            title="Make visible in Dashboard without Email"
                                        >
                                            {processingBatch ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Publish to Ledger'}
                                        </button>
                                        
                                        <button 
                                            onClick={handleBatchDispatch} 
                                            disabled={processingBatch || processingEmailBatch}
                                            className="bg-white text-black px-6 py-3.5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {processingEmailBatch ? <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Dispatch Email</>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }` }} />
        </div>
    );
}