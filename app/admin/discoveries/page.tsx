"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface DiscoveryLog {
    id: string;
    discovery_number: string;
    client_name: string;
    client_email: string;
    project_type: string;
    details: any;
    estimated_price: number;
    status: string;
    created_at: string;
}

const STATUS_OPTIONS = [
    { id: 'pending', label: 'Pending', badge: 'bg-amber-50 text-amber-600 border-amber-200' },
    { id: 'reviewed', label: 'Reviewed', badge: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'invited', label: 'Invited (Pending Setup)', badge: 'bg-purple-50 text-purple-600 border-purple-200' },
    { id: 'converted', label: 'Converted (Active Client)', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { id: 'declined', label: 'Declined (Lost)', badge: 'bg-zinc-100 text-zinc-500 border-zinc-200' }
];

export default function DiscoveryIntelligencePage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [discoveryLogs, setDiscoveryLogs] = useState<DiscoveryLog[]>([]);
    const [selectedLog, setSelectedLog] = useState<DiscoveryLog | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sendingInvite, setSendingInvite] = useState(false);

    // TOAST NOTIFICATION STATE
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
        fetchDiscoveryLogs();

        const discoveryChannel = supabase.channel('admin-discovery-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_discovery' }, () => {
                fetchDiscoveryLogs();
            }).subscribe();

        return () => {
            supabase.removeChannel(discoveryChannel);
        };
    }, [router]);

    const fetchDiscoveryLogs = async () => {
        const { data, error } = await supabase
            .from('project_discovery')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching logs:", error);
            showToast("Database Error (Check RLS Policies): " + error.message, "error");
        }
        if (data) {
            // Veritabanında status 'null' gelirse otomatik 'pending' olarak kabul et
            const formattedData = data.map(log => ({
                ...log,
                status: log.status || 'pending'
            }));
            setDiscoveryLogs(formattedData);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            setDiscoveryLogs(prev => prev.map(log => log.id === id ? { ...log, status: newStatus } : log));
            if (selectedLog && selectedLog.id === id) setSelectedLog({ ...selectedLog, status: newStatus });
            
            const { error } = await supabase.from('project_discovery').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            
            showToast("Status updated successfully.", "success");
        } catch (err: any) {
            showToast("Failed to update status: " + err.message, "error");
            fetchDiscoveryLogs(); 
        }
    };

    const deleteLog = async (id: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this discovery log?")) return;
        try {
            const { error } = await supabase.from('project_discovery').delete().eq('id', id);
            if (error) throw error;
            setDiscoveryLogs(prev => prev.filter(log => log.id !== id));
            if (selectedLog?.id === id) setSelectedLog(null);
            showToast("Log deleted permanently.", "success");
        } catch (err: any) {
            showToast("Failed to delete log: " + err.message, "error");
        }
    };

    const handleSendInvite = async (log: DiscoveryLog) => {
        if (!window.confirm(`Are you sure you want to send an onboarding invite to ${log.client_email}?`)) return;
        setSendingInvite(true);
        try {
            const res = await fetch('/api/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: log.client_email, name: log.client_name, discoveryId: log.id })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Mail API failed");
            }

            const { error } = await supabase.from('project_discovery').update({ status: 'invited' }).eq('id', log.id);
            if (error) throw error;

            setDiscoveryLogs(prev => prev.map(d => d.id === log.id ? { ...d, status: 'invited' } : d));
            if (selectedLog?.id === log.id) setSelectedLog({ ...selectedLog, status: 'invited' });

            showToast(`Onboarding invite sent successfully to ${log.client_email}!`, "success");
        } catch (err: any) {
            showToast("Error sending invite: " + err.message, "error");
        } finally {
            setSendingInvite(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const option = STATUS_OPTIONS.find(o => o.id === status);
        return option ? option.badge : 'bg-zinc-100 text-zinc-500 border-zinc-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // Null korumalı (Safe) arama filtresi
    const filteredLogs = discoveryLogs.filter(log => {
        const name = log.client_name || '';
        const email = log.client_email || '';
        const num = log.discovery_number || '';
        const term = searchTerm.toLowerCase();

        return name.toLowerCase().includes(term) || 
               num.toLowerCase().includes(term) ||
               email.toLowerCase().includes(term);
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

            {/* SLIDE-OVER MODAL (ENTITY BLUEPRINT) */}
            <AnimatePresence>
                {selectedLog && (
                    <div className="fixed inset-0 z-[60] flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
                            onClick={() => setSelectedLog(null)} 
                        />
                        <motion.aside 
                            initial={{ x: '100%' }} 
                            animate={{ x: 0 }} 
                            exit={{ x: '100%' }} 
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto border-l border-zinc-200 custom-scrollbar"
                        >
                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-zinc-100">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900">Entity Blueprint</h2>
                                        <span className={`px-3 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-widest border shadow-sm ${getStatusBadge(selectedLog.status)}`}>
                                            {STATUS_OPTIONS.find(o => o.id === selectedLog.status)?.label || selectedLog.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">{selectedLog.discovery_number} • {formatDate(selectedLog.created_at)}</p>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors appearance-none">
                                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            <section className="bg-white p-6 md:p-8 rounded-[32px] border border-zinc-200 shadow-sm mb-8 transition-all">
                                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] mb-4">Client Onboarding</p>
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm font-medium text-zinc-500 leading-relaxed">
                                        Initiate the automated onboarding sequence. This will email the client a secure link to complete their profile, set a password, and migrate their data to the Active Database.
                                    </p>
                                    <button 
                                        onClick={() => handleSendInvite(selectedLog)}
                                        disabled={sendingInvite || selectedLog.status === 'invited' || selectedLog.status === 'converted'}
                                        className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 shadow-md appearance-none
                                        ${selectedLog.status === 'converted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed shadow-none' :
                                          selectedLog.status === 'invited' ? 'bg-purple-50 text-purple-600 border border-purple-200 cursor-not-allowed shadow-none' :
                                          'bg-black text-white hover:bg-zinc-800 active:scale-95'}`}
                                    >
                                        {sendingInvite ? (
                                            <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Transmitting...</>
                                        ) : selectedLog.status === 'converted' ? (
                                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Client Converted</>
                                        ) : selectedLog.status === 'invited' ? (
                                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg> Invite Pending</>
                                        ) : (
                                            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> Send Onboarding Invite</>
                                        )}
                                    </button>
                                </div>
                            </section>

                            <div className="space-y-8">
                                <section className="bg-zinc-50 p-6 md:p-8 rounded-[32px] border border-zinc-200 shadow-sm">
                                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] mb-6">Core Identity</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Client Name</p><p className="text-sm font-medium text-zinc-900 mt-1">{selectedLog.client_name}</p></div>
                                        <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Email Address</p><p className="text-sm font-medium text-zinc-900 mt-1 break-all">{selectedLog.client_email}</p></div>
                                        <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Platform Type</p><p className="text-sm font-medium text-zinc-900 mt-1">{selectedLog.project_type}</p></div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Estimated Investment</p>
                                            <p className="text-xl font-light font-mono text-emerald-600 mt-1">€{selectedLog.estimated_price?.toLocaleString() || 0}</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white p-6 md:p-8 rounded-[32px] border border-zinc-200 shadow-sm">
                                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em] mb-6">System Requirements</p>
                                    <div className="space-y-4">
                                        {selectedLog.details && Object.entries(selectedLog.details).map(([key, value]) => (
                                            <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-zinc-100 last:border-0 last:pb-0">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 w-1/3 shrink-0">{key}</span>
                                                <span className="text-sm font-medium text-zinc-800 whitespace-pre-wrap leading-relaxed">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>

            {/* MAIN DASHBOARD */}
            <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto max-w-7xl mx-auto w-full relative z-10 custom-scrollbar">
                
                <button onClick={() => router.push('/admin/dashboard')} className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit appearance-none">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Workspace
                </button>

                <div className="w-full animate-in fade-in duration-500">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 mb-10 relative z-10">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Intelligence</h1>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Discovery Logs & Quote Estimates</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input 
                                type="text" 
                                placeholder="Search logs..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-zinc-200 pl-11 pr-5 py-3.5 rounded-full text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black shadow-sm transition-all appearance-none" 
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center relative z-10">
                            <span className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Decrypting Logs...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[32px] border border-zinc-200 overflow-hidden shadow-sm relative z-10">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[900px]">
                                    <thead className="bg-zinc-50/80 border-b border-zinc-200 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                        <tr>
                                            <th className="px-6 md:px-8 py-5 font-bold">Ref ID</th>
                                            <th className="px-6 md:px-8 py-5 font-bold">Identity</th>
                                            <th className="px-6 md:px-8 py-5 font-bold">Architecture</th>
                                            <th className="px-6 md:px-8 py-5 font-bold">Est. Value</th>
                                            <th className="px-6 md:px-8 py-5 font-bold text-right">Status Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {filteredLogs.length === 0 && (
                                            <tr><td colSpan={5} className="p-16 text-center text-[10px] font-bold uppercase text-zinc-400 tracking-widest">No discovery logs found.</td></tr>
                                        )}
                                        {filteredLogs.map((d) => (
                                            <tr key={d.id} onClick={() => setSelectedLog(d)} className="hover:bg-zinc-50/80 cursor-pointer group transition-colors">
                                                <td className="px-6 md:px-8 py-5 align-middle">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">{d.discovery_number}</p>
                                                    <p className="text-[8px] font-bold text-zinc-400 mt-1.5 uppercase tracking-widest">{formatDate(d.created_at).split(',')[0]}</p>
                                                </td>
                                                <td className="px-6 md:px-8 py-5 align-middle">
                                                    <p className="font-medium text-sm text-zinc-900 truncate max-w-[150px] md:max-w-[200px]">{d.client_name}</p>
                                                    <p className="text-[10px] text-zinc-500 mt-1 font-medium truncate max-w-[150px] md:max-w-[200px]">{d.client_email}</p>
                                                </td>
                                                <td className="px-6 md:px-8 py-5 align-middle">
                                                    <p className="text-xs font-medium text-zinc-600">{d.project_type}</p>
                                                </td>
                                                <td className="px-6 md:px-8 py-5 align-middle">
                                                    <p className="text-sm font-light font-mono text-emerald-600">€{d.estimated_price?.toLocaleString() || 0}</p>
                                                </td>
                                                <td className="px-6 md:px-8 py-5 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-3">
                                                        <select 
                                                            value={d.status} 
                                                            onChange={(e) => updateStatus(d.id, e.target.value)}
                                                            className={`text-[8px] font-bold uppercase tracking-widest px-3 py-2 md:px-4 md:py-2.5 rounded-xl outline-none cursor-pointer border text-center shadow-sm transition-all appearance-none ${getStatusBadge(d.status)}`}
                                                        >
                                                            {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                        </select>
                                                        <button 
                                                            onClick={() => deleteLog(d.id)}
                                                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all appearance-none opacity-0 group-hover:opacity-100 shadow-sm"
                                                            title="Delete Log"
                                                        >
                                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <footer className="mt-20 pb-10 text-center relative z-10">
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-zinc-300">Novatrum // Discovery Systems</p>
                </footer>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
            `}} />
        </div>
    );
}