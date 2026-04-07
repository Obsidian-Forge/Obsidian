"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminArchivePage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [archivedClients, setArchivedClients] = useState<any[]>([]);
    const [archiveSearch, setArchiveSearch] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

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

        // Realtime Subscription for Archived Clients
        const channel = supabase.channel('admin-archive-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'archived_clients' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('archived_clients')
                .select('*')
                .order('archived_at', { ascending: false });
            
            if (error) throw error;
            if (data) setArchivedClients(data);
        } catch (error: any) {
            console.error("Error fetching archives:", error.message);
            showToast("Failed to load archive data.", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- FİZİKSEL GERİ YÜKLEME (ARCHIVE -> ACTIVE) ---
    const restoreClient = async (id: string) => {
        if (!window.confirm("Restore this entity back to the Active Database?")) return;
        try {
            // 1. Arşivden veriyi çek
            const { data: archData, error: fetchErr } = await supabase
                .from('archived_clients')
                .select('*')
                .eq('id', id)
                .single();
                
            if (fetchErr) throw fetchErr;

            // 2. Active tablosuna kopyala (REVOKED- tagını temizle)
            const restoredCode = archData.access_code?.replace('REVOKED-', '') || `RESTORED-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
            
            const { error: insertErr } = await supabase.from('clients').insert({
                id: archData.id,
                full_name: archData.full_name,
                email: archData.email,
                company_name: archData.company_name,
                phone_number: archData.phone_number,
                address: archData.address,
                access_code: restoredCode,
                internal_notes: archData.internal_notes,
                created_at: archData.created_at,
                archived_at: null // Arşivlenme tarihini temizliyoruz
            });
            
            if (insertErr) throw insertErr;

            // 3. Arşivden sil
            const { error: delErr } = await supabase.from('archived_clients').delete().eq('id', id);
            if (delErr) throw delErr;

            fetchData();
            showToast("Entity restored successfully.", 'success');
        } catch (err: any) {
            showToast("Restore failed: " + err.message, 'error');
        }
    };

    const deleteClient = async (id: string) => {
        if (!window.confirm("WARNING: PERMANENTLY destroy this entity from archives? All data will be lost and this cannot be undone.")) return;
        try {
            const { error } = await supabase.from('archived_clients').delete().eq('id', id);
            if (error) throw error;
            fetchData();
            showToast("Entity destroyed permanently.", 'success');
        } catch (err: any) {
            showToast("Error: " + err.message, 'error');
        }
    };

    const filteredArchivedClients = archivedClients.filter(c => {
        if (!archiveSearch) return true;
        const q = archiveSearch.toLowerCase();
        return (c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.company_name?.toLowerCase().includes(q));
    });

    if (!isAdmin) return <div className="min-h-screen bg-white flex items-center justify-center font-bold uppercase text-[10px] tracking-widest text-zinc-400">Authenticating Secure Node...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-white text-black font-sans relative overflow-x-hidden selection:bg-black selection:text-white">
            
            {/* SAF BEYAZ & SİYAH RASTER ARKA PLAN */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.15]">
                <div className="absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_60%,transparent_100%)] bg-[linear-gradient(rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.08)_1px,transparent_1px)]" />
            </div>

            {/* GLOBAL TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
                            toast.type === 'success' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                        }`}
                    >
                        {toast.type === 'success' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                        {toast.type === 'error' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                        {toast.type === 'info' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto max-w-7xl mx-auto w-full relative z-10 custom-scrollbar">
                
                <button 
                    onClick={() => router.push('/admin/dashboard')} 
                    className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors appearance-none"
                >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Workspace
                </button>

                <div className="w-full animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 mb-10">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Archive Database</h1>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Terminated and Suspended Entities</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="relative w-full sm:w-72">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input 
                                    type="text" 
                                    placeholder="Search archive..." 
                                    value={archiveSearch}
                                    onChange={(e) => setArchiveSearch(e.target.value)}
                                    className="w-full bg-white border border-zinc-200 pl-11 pr-4 py-3 rounded-full text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-sm"
                                />
                            </div>
                            <button onClick={fetchData} className="w-full sm:w-auto p-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-full transition-all active:scale-95 text-zinc-500 shadow-sm flex items-center justify-center appearance-none">
                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="py-20 text-center text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Accessing Archives...</div>
                    ) : filteredArchivedClients.length === 0 ? (
                        <div className="py-20 text-center text-[10px] font-bold uppercase text-zinc-400 tracking-widest border border-dashed border-zinc-200 bg-white/50 rounded-[32px]">Archive is empty.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {filteredArchivedClients.map((c) => (
                                <div key={c.id} className="p-6 md:p-8 rounded-[32px] shadow-sm flex flex-col justify-between relative group border bg-zinc-50/80 border-zinc-200 hover:bg-zinc-50 transition-colors">
                                    
                                    <div className="mb-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Archived Entity</p>
                                        </div>
                                        <h3 className="text-2xl font-light tracking-tight text-zinc-900 mb-1 truncate line-through decoration-zinc-300" title={c.full_name}>{c.full_name}</h3>
                                        <p className="text-xs font-medium text-zinc-500 truncate" title={c.email}>{c.email}</p>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button onClick={(e) => { e.stopPropagation(); restoreClient(c.id); }} className="flex-1 py-3.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all hover:bg-zinc-800 shadow-md active:scale-95 appearance-none">
                                            Restore
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteClient(c.id); }} className="p-3.5 bg-white text-red-500 border border-zinc-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 rounded-xl transition-colors shadow-sm appearance-none flex items-center justify-center shrink-0" title="Permanent Delete">
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <footer className="mt-20 pb-10 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-zinc-300">Novatrum // Archive Systems</p>
                </footer>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
            `}} />
        </div>
    );
}