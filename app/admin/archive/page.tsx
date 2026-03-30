"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminArchivePage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // CLIENT STATES
    const [archivedClients, setArchivedClients] = useState<any[]>([]);
    const [archiveSearch, setArchiveSearch] = useState('');

    // SLIDE-OVER (ENTITY PROFILE) STATES
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [internalNote, setInternalNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    // 1. AUTH AND INITIAL DATA
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') router.push('/client/login');
            else setIsAdmin(true);
        };
        
        checkAdmin();
        fetchData();

        // REALTIME LISTENER
        const clientsChannel = supabase.channel('admin-clients-archive-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(clientsChannel);
        };
    }, [router]);

    useEffect(() => {
        if (selectedClient) {
            setInternalNote(selectedClient.internal_notes || '');
            fetchClientInvoices(selectedClient.id);
            fetchClientFiles(selectedClient.id);
        }
    }, [selectedClient]);

    // --- DATA FETCHING ---
    const fetchData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching archive:", error);
        }

        if (data) {
            const archived = data.filter(c => c.archived_at !== null && c.archived_at !== '');
            archived.sort((a, b) => new Date(b.archived_at).getTime() - new Date(a.archived_at).getTime());
            setArchivedClients(archived);
        }
        setLoading(false);
    };

    const fetchClientFiles = async (clientId: string) => {
        const { data } = await supabase.from('client_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (data) setClientFiles(data);
    };

    const fetchClientInvoices = async (clientId: string) => {
        const { data } = await supabase.from('client_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (data) setClientInvoices(data);
    };

    // --- ARCHIVE ACTIONS ---
    const deleteClient = async (id: string) => {
        if (!confirm("WARNING: Are you sure you want to PERMANENTLY delete this entity? All associated projects, files, and tickets will be destroyed. This action cannot be undone.")) return;
        try {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
            if (selectedClient?.id === id) setSelectedClient(null);
            fetchData();
        } catch (err: any) { alert("Error deleting client: " + err.message); }
    };

    const restoreClient = async (id: string) => {
        if (!confirm("RESTORE ENTITY? This will generate a new access code for them and move them back to the Active Database.")) return;
        try {
            const newCode = `NVTR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const { error } = await supabase.from('clients').update({ archived_at: null, access_code: newCode }).eq('id', id);
            if (error) throw error;
            setSelectedClient(null); 
            fetchData();
            alert("Entity Restored. Their new access code is: " + newCode);
        } catch (err: any) { alert("Failed to restore: " + err.message); }
    };

    // --- SLIDE-OVER FUNCTIONS (View & Limited Actions) ---
    const handleSaveNote = async () => {
        setSavingNote(true);
        try {
            const { error } = await supabase.from('clients').update({ internal_notes: internalNote }).eq('id', selectedClient.id);
            if (error) throw error;
            setSelectedClient({ ...selectedClient, internal_notes: internalNote });
            fetchData();
        } catch (err: any) { alert("Error saving note: " + err.message); } finally { setSavingNote(false); }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // YENİ: GÜVENLİ ARAMA FİLTRESİ (NULL HATASI ÇÖZÜLDÜ)
    const filteredArchivedClients = archivedClients.filter(c => {
        const searchTerm = archiveSearch.toLowerCase();
        const safeName = (c.full_name || '').toLowerCase();
        const safeEmail = (c.email || '').toLowerCase();
        
        return safeName.includes(searchTerm) || safeEmail.includes(searchTerm);
    });

    if (!isAdmin) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 text-black font-sans relative overflow-x-hidden selection:bg-black selection:text-white">
            
            {/* ENTITY PROFILE SLIDE-OVER */}
            {selectedClient && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
                    <aside className="relative w-full max-w-xl bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto border-l border-zinc-200 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-zinc-900">Entity Profile</h2>
                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-red-200">Archived</span>
                            </div>
                            <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
        
                        <div className="space-y-8">
                            
                            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-6">Identity Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Full Name</p><p className="text-sm font-black uppercase text-zinc-800 mt-1">{selectedClient.full_name || 'N/A'}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Email Address</p><p className="text-xs font-bold text-zinc-600 break-all mt-1">{selectedClient.email || 'N/A'}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Company</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.company_name || 'N/A'}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Phone</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.phone_number || 'N/A'}</p></div>
                                    <div className="sm:col-span-2"><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Address</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.address || 'N/A'}</p></div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-red-50/50 p-4 rounded-xl border border-red-100">
                                    <div><p className="text-[9px] font-bold uppercase text-red-400 tracking-widest">Archived On</p><p className="text-xs font-bold text-red-600 mt-1">{formatDate(selectedClient.archived_at)}</p></div>
                                    <button onClick={() => restoreClient(selectedClient.id)} className="bg-white text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-sm">Restore Entity</button>
                                </div>
                            </section>

                            <section className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-4">Internal Notes</p>
                                <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Private notes..." className="w-full bg-white border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-zinc-400 resize-none h-24 mb-3 transition-colors" />
                                <button onClick={handleSaveNote} disabled={savingNote || internalNote === (selectedClient.internal_notes || '')} className="w-full bg-zinc-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-black transition-colors shadow-sm">{savingNote ? 'Saving...' : 'Save Note'}</button>
                            </section>

                            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Billing & Invoices</p>
                                    <button disabled className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase opacity-50 cursor-not-allowed">Upload Disabled</button>
                                </div>
                                <div className="grid gap-3">
                                    {clientInvoices.length === 0 && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-4 text-center border border-zinc-100 border-dashed rounded-xl">No invoices found.</p>}
                                    {clientInvoices.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl group transition-all">
                                            <div className="flex items-center gap-3">
                                                <button disabled className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border transition-colors opacity-70 cursor-not-allowed ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                    {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                                                </button>
                                                <span className="text-xs font-bold text-zinc-700 truncate max-w-[120px]">{inv.file_name}</span>
                                            </div>
                                            <a href={inv.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-800 transition-colors">Open</a>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Asset Vault</p>
                                    <button disabled className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase opacity-50 cursor-not-allowed">Upload Disabled</button>
                                </div>
                                <div className="grid gap-3">
                                    {clientFiles.length === 0 && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-4 text-center border border-zinc-100 border-dashed rounded-xl">No assets found.</p>}
                                    {clientFiles.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl group transition-all">
                                            <span className="text-xs font-bold text-zinc-700 truncate max-w-[150px]">{file.file_name}</span>
                                            <a href={file.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-800 transition-colors">Open</a>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            )}

            {/* MAIN CONTENT AREA - NO SIDEBAR */}
            <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto max-w-7xl mx-auto w-full relative z-0">
                
                {/* TOP NAVIGATION & BACK BUTTON */}
                <button 
                    onClick={() => router.push('/admin/dashboard')} 
                    className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Workspace
                </button>

                <div className="w-full animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Entity Archive</h1>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Terminated and Inactive Records</p>
                        </div>
                        <input 
                            type="text" placeholder="Search archive..." value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)}
                            className="bg-white border border-zinc-200 px-5 py-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-400 w-full md:w-72 shadow-sm transition-colors" 
                        />
                    </div>
                    
                    {loading ? (
                        <div className="py-20 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">Loading Records...</div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 border-b border-zinc-200 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                    <tr>
                                        <th className="px-8 py-5">Entity</th>
                                        <th className="px-8 py-5">Timeline</th>
                                        <th className="px-8 py-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredArchivedClients.map((c) => (
                                        <tr key={c.id} onClick={() => { setSelectedClient(c); fetchClientFiles(c.id); }} className="hover:bg-zinc-50 cursor-pointer group transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-sm uppercase text-zinc-400 line-through decoration-zinc-300">{c.full_name || 'Unknown'}</p>
                                                <p className="text-[10px] text-zinc-400 mt-1 font-bold">{c.email || 'No email'}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Started: {formatDate(c.created_at)}</p>
                                                <p className="text-[9px] font-bold uppercase text-red-500 tracking-widest mt-1">Archived: {formatDate(c.archived_at)}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); restoreClient(c.id); }} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-4 py-2 rounded-lg border border-transparent hover:border-emerald-200 transition-all">Restore</button>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteClient(c.id); }} className="text-[9px] font-black text-red-600 uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-lg border border-transparent hover:border-red-200 transition-all">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredArchivedClients.length === 0 && <div className="p-16 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">No archived records found.</div>}
                        </div>
                    )}
                </div>
                
                <footer className="mt-20 pb-10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">Novatrum // Archive Systems 2026</p>
                </footer>
            </main>
        </div>
    );
}