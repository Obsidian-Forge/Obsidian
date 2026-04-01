"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function FinancialLedgerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    
    // Veritabanı State'leri
    const [clients, setClients] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    
    const [activeTab, setActiveTab] = useState<'all' | 'unpaid' | 'paid' | 'drafts' | 'subscriptions'>('all');

    // Detaylı Modal (Dossier) State'leri
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientDossier, setClientDossier] = useState<{
        invoices: any[],
        discovery: any | null,
        stats: any
    } | null>(null);

    // E-Posta Kombinasyon State'leri
    const [selectedInvoicesForEmail, setSelectedInvoicesForEmail] = useState<string[]>([]);
    const [sendingEmail, setSendingEmail] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: invData, error: invError } = await supabase
                .from('client_invoices')
                .select('*')
                .order('created_at', { ascending: false });
            if (invError) throw invError;

            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('id, full_name, email, access_code');
            if (clientsError) throw clientsError;

            const { data: discData } = await supabase
                .from('project_discovery')
                .select('*')
                .order('created_at', { ascending: false });

            const mergedInvoices = (invData || []).map(inv => {
                const matchedClient = (clientsData || []).find(c => c.id === inv.client_id);
                return {
                    ...inv,
                    clients: matchedClient || { id: inv.client_id, full_name: 'Unknown Client', email: '', access_code: '' }
                };
            });

            if (clientsData) setClients(clientsData);
            setInvoices(mergedInvoices);
            if (discData) setDiscoveries(discData);

            if (selectedClient && mergedInvoices) {
                updateDossierData(selectedClient, mergedInvoices, discData || discoveries);
            }
        } catch (error) {
            console.error("Error fetching ledger data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateInvoiceStatus = async (id: string, newStatus: string) => {
        try {
            await supabase.from('client_invoices').update({ status: newStatus }).eq('id', id);
            fetchData(); 
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const deleteInvoice = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this invoice?")) return;
        try {
            await supabase.from('client_invoices').delete().eq('id', id);
            fetchData();
        } catch (error) {
            console.error("Error deleting invoice:", error);
        }
    };

    // --- TEMİZ E-POSTA GÖNDERİM MOTORU (ARRAY PAYLOAD) ---
    const handleSendEmail = async (invoiceIds: string[]) => {
        if (invoiceIds.length === 0) return;
        setSendingEmail(true);

        try {
            const invoicesToSend = invoices.filter(inv => invoiceIds.includes(inv.id));
            
            // Temiz ve Doğru Payload: Backend bu diziyi (array) okuyup mailine 2 ayrı PDF olarak ekleyecek.
            const payload = {
                clientEmail: selectedClient.email,
                clientName: selectedClient.full_name,
                isCombined: invoiceIds.length > 1,
                invoices: invoicesToSend.map(inv => ({
                    invoiceNumber: inv.file_name,
                    pdfUrl: inv.file_url
                }))
            };

            const response = await fetch('/api/send-invoice', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            // Müşteri iç notlarına kayıt düş
            const fileNames = invoicesToSend.map(i => i.file_name).join(', ');
            const { data: clientData } = await supabase.from('clients').select('internal_notes').eq('id', selectedClient.id).single();
            const newNote = `\n[${new Date().toLocaleDateString()}] Automated Dispatch: Sent document(s) to client [${fileNames}].`;
            await supabase.from('clients').update({ internal_notes: (clientData?.internal_notes || '') + newNote }).eq('id', selectedClient.id);

            alert(`Successfully dispatched ${invoiceIds.length} document(s) to ${selectedClient.email}`);
            setSelectedInvoicesForEmail([]); 
            
        } catch (error: any) {
            alert("Failed to send email: " + error.message);
        } finally {
            setSendingEmail(false);
        }
    };

    const toggleInvoiceSelection = (id: string) => {
        setSelectedInvoicesForEmail(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // --- AKILLI FİNANSAL ASİSTAN (DOSSIER ENGINE) ---
    const openClientDossier = (clientInfo: any) => {
        if (!clientInfo) return;
        setSelectedClient(clientInfo);
        setSelectedInvoicesForEmail([]); 
        updateDossierData(clientInfo, invoices, discoveries);
    };

    const updateDossierData = (clientInfo: any, allInvoices: any[], allDiscoveries: any[]) => {
        const clientInvs = allInvoices.filter(i => i.client_id === clientInfo.id);
        const clientDisc = allDiscoveries.find(d => d.client_email?.toLowerCase() === clientInfo.email?.toLowerCase());

        const projectInvoices = clientInvs.filter(i => !i.file_name.includes('MAINT') && !i.file_name.toLowerCase().includes('maintenance'));
        const maintInvoices = clientInvs.filter(i => i.file_name.includes('MAINT') || i.file_name.toLowerCase().includes('maintenance'));
        
        const paidProjectInvs = projectInvoices.filter(i => i.status === 'paid');
        const unpaidProjectInvs = projectInvoices.filter(i => i.status === 'unpaid');
        
        const totalProjectValue = clientDisc?.estimated_price || 0;
        const totalParts = projectInvoices.length > 0 ? projectInvoices.length : 1;
        const valuePerPart = totalProjectValue / totalParts;

        const totalPaidEstimated = paidProjectInvs.length * valuePerPart;
        const totalPendingEstimated = unpaidProjectInvs.length * valuePerPart;

        const maintString = clientDisc?.details?.Maintenance || 'None';
        const isMaintActive = (maintString !== 'None') || (maintInvoices.length > 0);
        let maintPrice = "Custom"; 
        
        if (maintString !== 'None') {
            const match = maintString.match(/€(\d+)/);
            if (match) maintPrice = match[1];
        }

        let insightMessage = "";
        let insightColor = "text-blue-600 bg-blue-50 border-blue-200";

        if (unpaidProjectInvs.length > 0) {
            insightMessage = `Awaiting payment for ${unpaidProjectInvs.length} project installment(s) (€${totalPendingEstimated.toLocaleString()}). Do not proceed with major deployment steps until cleared.`;
            insightColor = "text-amber-600 bg-amber-50 border-amber-200";
        } else if (projectInvoices.length > 0 && unpaidProjectInvs.length === 0) {
            insightMessage = `All issued project invoices are paid and cleared. Financial health is optimal for deployment.`;
            insightColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
        } else if (projectInvoices.length === 0 && !clientDisc) {
            insightMessage = `No financial history or discovery blueprint found for this entity. Create an invoice to begin.`;
            insightColor = "text-zinc-600 bg-zinc-50 border-zinc-200";
        } else if (projectInvoices.length === 0 && clientDisc) {
            insightMessage = `Blueprint found (€${totalProjectValue.toLocaleString()}) but no invoices generated yet. Ready to issue initial deposit invoice.`;
        }

        if (isMaintActive) {
            const lastMaint = maintInvoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            if (lastMaint) {
                const daysSinceLastMaint = Math.floor((new Date().getTime() - new Date(lastMaint.created_at).getTime()) / (1000 * 3600 * 24));
                
                if (lastMaint.status === 'unpaid') {
                    insightMessage += ` \n\n🚨 URGENT: The latest maintenance invoice (${lastMaint.file_name}) is UNPAID. Follow up with the client to maintain node stability.`;
                    insightColor = "text-red-600 bg-red-50 border-red-200";
                } else if (daysSinceLastMaint >= 30) {
                    insightMessage += ` \n\n⚠️ Maintenance cycle alert: It has been ${daysSinceLastMaint} days since the last retainer. A new invoice is due.`;
                    if (insightColor !== "text-red-600 bg-red-50 border-red-200") insightColor = "text-amber-600 bg-amber-50 border-amber-200";
                } else {
                    insightMessage += ` \n\n✅ Maintenance is active and was recently billed (${daysSinceLastMaint} days ago).`;
                }
            } else {
                insightMessage += ` \n\n⚠️ Maintenance plan selected but NO retainer invoices have been issued yet.`;
            }
        }

        setClientDossier({
            invoices: clientInvs,
            discovery: clientDisc,
            stats: {
                projectInvoices,
                maintInvoices,
                paidProjectInvs,
                unpaidProjectInvs,
                totalProjectValue,
                totalPaidEstimated,
                totalPendingEstimated,
                isMaintActive,
                maintPrice,
                insightMessage,
                insightColor
            }
        });
    };

    // --- GRUPLANDIRILMIŞ ANA EKRAN MANTIĞI ---
    const groupedClients = Array.from(new Set(invoices.map(i => i.client_id))).map(clientId => {
        const clientInvs = invoices.filter(i => i.client_id === clientId);
        const clientRef = clientInvs[0]?.clients || { full_name: 'Unknown', email: '', access_code: '' };
        const disc = discoveries.find(d => d.client_email?.toLowerCase() === clientRef.email?.toLowerCase());
        
        const unpaidCount = clientInvs.filter(i => i.status === 'unpaid').length;
        const totalInvoices = clientInvs.length;
        
        return {
            id: clientId,
            full_name: clientRef.full_name,
            email: clientRef.email,
            access_code: clientRef.access_code,
            discovery_number: disc?.discovery_number || 'N/A',
            project_type: disc?.project_type || 'Custom Setup',
            unpaidCount,
            totalInvoices,
            hasMaintenance: clientInvs.some(i => i.file_name.includes('MAINT')) || (disc?.details?.Maintenance && disc.details.Maintenance !== 'None')
        };
    });

    const filteredGroupedClients = groupedClients.filter(client => {
        if (activeTab === 'all') return true;
        if (activeTab === 'unpaid') return client.unpaidCount > 0;
        if (activeTab === 'paid') return client.unpaidCount === 0 && client.totalInvoices > 0;
        if (activeTab === 'subscriptions') return client.hasMaintenance;
        return true;
    });

    if (loading && invoices.length === 0) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Ledger Core...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 text-black font-sans selection:bg-black selection:text-white p-6 md:p-10 relative">
            <div className="max-w-7xl mx-auto relative z-0">
                
                <button onClick={() => router.push('/admin/dashboard')} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Workspace
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 mb-10">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Financial Ledger</h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Client-Centric Revenue & Dispatch Control</p>
                    </div>
                    <button onClick={() => router.push('/admin/invoice-generator')} className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-sm active:scale-95">
                        + Create Invoice
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white border border-zinc-200 p-6 rounded-[24px] shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Entities with Unpaid</p>
                        <p className="text-3xl font-black font-mono text-amber-500">{groupedClients.filter(c => c.unpaidCount > 0).length}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-6 rounded-[24px] shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Total Invoices Issued</p>
                        <p className="text-3xl font-black font-mono text-emerald-500">{invoices.filter(i => i.status !== 'draft').length}</p>
                    </div>
                    <div className="bg-white border border-zinc-200 p-6 rounded-[24px] shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Automated Drafts</p>
                        <p className="text-3xl font-black font-mono text-blue-500">{invoices.filter(i => i.status === 'draft').length}</p>
                    </div>
                    <div className="bg-black text-white p-6 rounded-[24px] shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Active Subscriptions</p>
                        <p className="text-3xl font-black font-mono">{groupedClients.filter(c => c.hasMaintenance).length}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                    {['all', 'unpaid', 'paid', 'drafts', 'subscriptions'].map((tab) => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors ${activeTab === tab ? 'bg-black text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-500 hover:border-black hover:text-black'}`}
                        >
                            {tab === 'all' ? 'All Entities' : tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm">
                    {activeTab === 'drafts' ? (
                        <div className="p-2">
                            {invoices.filter(i => i.status === 'draft').length === 0 ? (
                                <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-20">No drafts awaiting approval.</p>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-100">
                                            <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Date</th>
                                            <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Draft Name</th>
                                            <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Client</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.filter(i => i.status === 'draft').map(inv => (
                                            <tr key={inv.id} onClick={() => router.push('/admin/invoice-generator')} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer group">
                                                <td className="p-6 text-[10px] font-mono text-zinc-500">{new Date(inv.created_at).toLocaleDateString('en-GB')}</td>
                                                <td className="p-6 font-bold text-xs text-blue-600">{inv.file_name}</td>
                                                <td className="p-6 text-xs text-zinc-600">{inv.clients?.full_name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ) : (
                        <div className="p-2">
                            {filteredGroupedClients.length === 0 ? (
                                <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-20">No entities found for this category.</p>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-100">
                                            <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Entity / Client</th>
                                            <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Project Type</th>
                                            <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-400">Ledger Status</th>
                                            <th className="p-6 text-[9px] font-black uppercase tracking-widest text-zinc-400 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredGroupedClients.map(client => (
                                            <tr key={client.id} onClick={() => openClientDossier(client)} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer group">
                                                <td className="p-6">
                                                    <p className="font-bold text-xs text-zinc-900">{client.full_name}</p>
                                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-1">{client.email}</p>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {client.access_code && (
                                                            <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                                                                {client.access_code}
                                                            </span>
                                                        )}
                                                        {client.discovery_number !== 'N/A' && (
                                                            <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                                                                {client.discovery_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-xs font-bold text-zinc-600">{client.project_type}</td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black font-mono text-zinc-500">{client.totalInvoices} Invoices</span>
                                                        {client.unpaidCount > 0 ? (
                                                            <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest animate-pulse">
                                                                {client.unpaidCount} Unpaid
                                                            </span>
                                                        ) : (
                                                            <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                                                                All Cleared
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <button className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors border border-zinc-200 px-4 py-2 rounded-xl bg-white shadow-sm flex items-center gap-2 ml-auto">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                        Open Dossier
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* =========================================
                DETAILED FINANCIAL DOSSIER MODAL 2.0 (SPLIT & COMBINE ENGINE)
               ========================================= */}
            {selectedClient && clientDossier && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedClient(null)}></div>
                    
                    <div className="bg-[#f8f9fa] w-full max-w-6xl h-[95vh] flex flex-col rounded-[40px] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-zinc-200 overflow-hidden">
                        
                        {/* MODAL HEADER */}
                        <div className="px-8 md:px-10 py-6 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-zinc-900 leading-none mb-1">
                                    {selectedClient.full_name}
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    {selectedClient.email} 
                                    {clientDossier.discovery && (
                                        <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md border border-zinc-200">
                                            {clientDossier.discovery.project_type}
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => router.push('/admin/invoice-generator')} className="hidden sm:flex items-center gap-2 bg-zinc-100 text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                                    + Add Document
                                </button>
                                <button onClick={() => setSelectedClient(null)} className="p-3 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-500 rounded-xl transition-colors shadow-sm">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* MODAL BODY (KAYDIRMA ALANI) */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar flex flex-col gap-8 pb-32">
                            
                            {/* SMART INSIGHTS ALERT */}
                            <div className={`p-5 rounded-2xl border flex gap-4 items-start shadow-sm shrink-0 ${clientDossier.stats.insightColor}`}>
                                <div className="mt-0.5">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1">Financial AI Insight</h4>
                                    <p className="text-xs font-bold whitespace-pre-line leading-relaxed opacity-90">
                                        {clientDossier.stats.insightMessage}
                                    </p>
                                </div>
                            </div>

                            {/* BÖLÜM 1: MAINTENANCE RETAINER LEDGER (Kendi içinde kaydırılabilir) */}
                            <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col w-full max-h-[350px]">
                                <div className="p-5 md:px-8 border-b border-zinc-100 flex justify-between items-center bg-purple-50/50 shrink-0">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-700 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                        Maintenance Subscriptions
                                    </h3>
                                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">{clientDossier.stats.maintInvoices.length} Documents</span>
                                </div>
                                
                                <div className="bg-white overflow-y-auto custom-scrollbar flex-1">
                                    {clientDossier.stats.maintInvoices.length === 0 ? (
                                        <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-10">No maintenance invoices found.</p>
                                    ) : (
                                        <div className="divide-y divide-zinc-100">
                                            {clientDossier.stats.maintInvoices.map((inv: any) => {
                                                const isSelected = selectedInvoicesForEmail.includes(inv.id);
                                                return (
                                                    <div key={inv.id} className={`p-4 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isSelected ? 'bg-purple-50/30' : 'hover:bg-zinc-50'}`}>
                                                        
                                                        <div className="flex items-center gap-4">
                                                            <div 
                                                                onClick={() => toggleInvoiceSelection(inv.id)}
                                                                className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition-all shrink-0 ${isSelected ? 'bg-black border-black text-white' : 'bg-white border-zinc-300 hover:border-black'}`}
                                                            >
                                                                {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-zinc-900">{inv.file_name}</p>
                                                                <p className="text-[9px] font-black font-mono uppercase tracking-widest text-zinc-400 mt-1">Issued: {new Date(inv.created_at).toLocaleDateString('en-GB')}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 mr-2">
                                                                <button onClick={() => updateInvoiceStatus(inv.id, 'unpaid')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${inv.status === 'unpaid' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>Unpaid</button>
                                                                <button onClick={() => updateInvoiceStatus(inv.id, 'paid')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${inv.status === 'paid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>Paid</button>
                                                            </div>
                                                            <a href={inv.file_url} target="_blank" rel="noreferrer" className="p-2 text-zinc-400 hover:text-black bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-sm" title="View PDF"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></a>
                                                            <button onClick={() => handleSendEmail([inv.id])} disabled={sendingEmail} className="p-2 text-blue-500 hover:text-white bg-blue-50 border border-blue-200 hover:border-blue-500 hover:bg-blue-500 rounded-lg transition-colors shadow-sm disabled:opacity-50" title="Send Email"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></button>
                                                            <button onClick={() => deleteInvoice(inv.id)} className="p-2 text-red-400 hover:text-white bg-white border border-red-100 hover:border-red-500 hover:bg-red-500 rounded-lg transition-colors shadow-sm" title="Delete Permanent"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* BÖLÜM 2: CORE PROJECT LEDGER (Kendi içinde kaydırılabilir) */}
                            <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col w-full max-h-[350px]">
                                <div className="p-5 md:px-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 shrink-0">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        Core Project Invoices
                                    </h3>
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{clientDossier.stats.projectInvoices.length} Documents</span>
                                </div>
                                
                                <div className="bg-white overflow-y-auto custom-scrollbar flex-1">
                                    {clientDossier.stats.projectInvoices.length === 0 ? (
                                        <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-10">No project invoices found.</p>
                                    ) : (
                                        <div className="divide-y divide-zinc-100">
                                            {clientDossier.stats.projectInvoices.map((inv: any) => {
                                                const isSelected = selectedInvoicesForEmail.includes(inv.id);
                                                return (
                                                    <div key={inv.id} className={`p-4 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isSelected ? 'bg-zinc-100/50' : 'hover:bg-zinc-50'}`}>
                                                        
                                                        <div className="flex items-center gap-4">
                                                            <div 
                                                                onClick={() => toggleInvoiceSelection(inv.id)}
                                                                className={`w-6 h-6 rounded-md border flex items-center justify-center cursor-pointer transition-all shrink-0 ${isSelected ? 'bg-black border-black text-white' : 'bg-white border-zinc-300 hover:border-black'}`}
                                                            >
                                                                {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-zinc-900">{inv.file_name}</p>
                                                                <p className="text-[9px] font-black font-mono uppercase tracking-widest text-zinc-400 mt-1">Issued: {new Date(inv.created_at).toLocaleDateString('en-GB')}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200 mr-2">
                                                                <button onClick={() => updateInvoiceStatus(inv.id, 'unpaid')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${inv.status === 'unpaid' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>Unpaid</button>
                                                                <button onClick={() => updateInvoiceStatus(inv.id, 'paid')} className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${inv.status === 'paid' ? 'bg-emerald-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}>Paid</button>
                                                            </div>
                                                            <a href={inv.file_url} target="_blank" rel="noreferrer" className="p-2 text-zinc-400 hover:text-black bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors shadow-sm" title="View PDF"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></a>
                                                            <button onClick={() => handleSendEmail([inv.id])} disabled={sendingEmail} className="p-2 text-blue-500 hover:text-white bg-blue-50 border border-blue-200 hover:border-blue-500 hover:bg-blue-500 rounded-lg transition-colors shadow-sm disabled:opacity-50" title="Send Email"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg></button>
                                                            <button onClick={() => deleteInvoice(inv.id)} className="p-2 text-red-400 hover:text-white bg-white border border-red-100 hover:border-red-500 hover:bg-red-500 rounded-lg transition-colors shadow-sm" title="Delete Permanent"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* STICKY COMBINE & SEND BAR */}
                        {selectedInvoicesForEmail.length > 1 && (
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-zinc-900 rounded-[24px] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-zinc-800 animate-in slide-in-from-bottom-10 z-50">
                                <div className="flex items-center gap-4 pl-4">
                                    <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-white text-xs font-bold">Combined Dispatch Ready</p>
                                        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest mt-0.5">{selectedInvoicesForEmail.length} Documents Selected</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedInvoicesForEmail([])} className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors px-4 py-2">Cancel</button>
                                    <button 
                                        onClick={() => handleSendEmail(selectedInvoicesForEmail)} 
                                        disabled={sendingEmail}
                                        className="bg-blue-600 text-white px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {sendingEmail ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Combined Package'}
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
            `}} />
        </div>
    );
}