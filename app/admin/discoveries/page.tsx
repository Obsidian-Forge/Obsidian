"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
            alert("Database Error (Check RLS Policies): " + error.message);
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
        } catch (err: any) {
            alert("Failed to update status: " + err.message);
            fetchDiscoveryLogs(); 
        }
    };

    const deleteLog = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this discovery log?")) return;
        try {
            const { error } = await supabase.from('project_discovery').delete().eq('id', id);
            if (error) throw error;
            setDiscoveryLogs(prev => prev.filter(log => log.id !== id));
            if (selectedLog?.id === id) setSelectedLog(null);
        } catch (err: any) {
            alert("Failed to delete log: " + err.message);
        }
    };

    const handleSendInvite = async (log: DiscoveryLog) => {
        if (!confirm(`Are you sure you want to send an onboarding invite to ${log.client_email}?`)) return;
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

            alert(`Onboarding invite sent successfully to ${log.client_email}!`);
        } catch (err: any) {
            alert("Error sending invite: " + err.message);
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

    // YENİ: Null korumalı (Safe) arama filtresi. Crash olmasını engeller.
    const filteredLogs = discoveryLogs.filter(log => {
        const name = log.client_name || '';
        const email = log.client_email || '';
        const num = log.discovery_number || '';
        const term = searchTerm.toLowerCase();

        return name.toLowerCase().includes(term) || 
               num.toLowerCase().includes(term) ||
               email.toLowerCase().includes(term);
    });

    if (!isAdmin) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 text-black font-sans relative overflow-x-hidden selection:bg-black selection:text-white">
            
            {selectedLog && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
                    <aside className="relative w-full max-w-2xl bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto border-l border-zinc-200 animate-in slide-in-from-right duration-300">
                        
                        <div className="flex justify-between items-start mb-8 pb-6 border-b border-zinc-100">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-zinc-900">Entity Blueprint</h2>
                                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusBadge(selectedLog.status)}`}>
                                        {STATUS_OPTIONS.find(o => o.id === selectedLog.status)?.label || selectedLog.status}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">{selectedLog.discovery_number} • {formatDate(selectedLog.created_at)}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>

                        <section className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm mb-8">
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4">Client Onboarding</p>
                            <div className="flex flex-col gap-4">
                                <p className="text-xs font-bold text-zinc-500 leading-relaxed">
                                    Initiate the automated onboarding sequence. This will email the client a secure link to complete their profile, set a password, and migrate their data to the Active Clients database.
                                </p>
                                <button 
                                    onClick={() => handleSendInvite(selectedLog)}
                                    disabled={sendingInvite || selectedLog.status === 'invited' || selectedLog.status === 'converted'}
                                    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2 shadow-sm 
                                    ${selectedLog.status === 'converted' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed' :
                                      selectedLog.status === 'invited' ? 'bg-purple-50 text-purple-600 border border-purple-200 cursor-not-allowed' :
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
                            <section className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-6">Core Identity</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Client Name</p><p className="text-sm font-black uppercase text-zinc-900 mt-1">{selectedLog.client_name}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Email Address</p><p className="text-xs font-bold text-zinc-600 mt-1 break-all">{selectedLog.client_email}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Platform Type</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedLog.project_type}</p></div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Estimated Investment</p>
                                        <p className="text-lg font-black font-mono text-emerald-600 mt-1">€{selectedLog.estimated_price?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-6">System Requirements</p>
                                <div className="space-y-4">
                                    {selectedLog.details && Object.entries(selectedLog.details).map(([key, value]) => (
                                        <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-zinc-100 last:border-0 last:pb-0">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 w-1/3 shrink-0">{key}</span>
                                            <span className="text-xs font-bold text-zinc-800 whitespace-pre-wrap leading-relaxed">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            )}

            <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto max-w-7xl mx-auto w-full relative z-0">
                
                <button onClick={() => router.push('/admin/dashboard')} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Workspace
                </button>

                <div className="w-full animate-in fade-in duration-500">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 mb-10">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Intelligence</h1>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Discovery Logs & Quote Estimates</p>
                        </div>
                        <input 
                            type="text" placeholder="Search by name, email, or ID..." 
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-zinc-200 px-5 py-3.5 rounded-xl text-xs font-bold outline-none focus:border-black w-full md:w-80 shadow-sm transition-colors" 
                        />
                    </div>

                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center">
                            <span className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Decrypting Logs...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[32px] border border-zinc-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-zinc-50 border-b border-zinc-200 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                        <tr>
                                            <th className="px-6 md:px-8 py-5">Ref ID</th>
                                            <th className="px-6 md:px-8 py-5">Identity</th>
                                            <th className="px-6 md:px-8 py-5">Architecture</th>
                                            <th className="px-6 md:px-8 py-5">Est. Value</th>
                                            <th className="px-6 md:px-8 py-5 text-right">Status Control</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {filteredLogs.length === 0 && (
                                            <tr><td colSpan={5} className="p-16 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">No discovery logs found.</td></tr>
                                        )}
                                        {filteredLogs.map((d) => (
                                            <tr key={d.id} onClick={() => setSelectedLog(d)} className="hover:bg-zinc-50 cursor-pointer group transition-colors">
                                                <td className="px-6 md:px-8 py-5">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 font-mono">{d.discovery_number}</p>
                                                    <p className="text-[8px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{formatDate(d.created_at).split(',')[0]}</p>
                                                </td>
                                                <td className="px-6 md:px-8 py-5">
                                                    <p className="font-black text-xs md:text-sm uppercase text-zinc-900 truncate max-w-[150px] md:max-w-[200px]">{d.client_name}</p>
                                                    <p className="text-[10px] text-zinc-500 mt-1 font-bold truncate max-w-[150px] md:max-w-[200px]">{d.client_email}</p>
                                                </td>
                                                <td className="px-6 md:px-8 py-5">
                                                    <p className="text-xs font-bold text-zinc-600">{d.project_type}</p>
                                                </td>
                                                <td className="px-6 md:px-8 py-5">
                                                    <p className="text-sm font-black font-mono text-emerald-600">€{d.estimated_price?.toLocaleString() || 0}</p>
                                                </td>
                                                <td className="px-6 md:px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-3">
                                                        <select 
                                                            value={d.status} 
                                                            onChange={(e) => updateStatus(d.id, e.target.value)}
                                                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-xl outline-none cursor-pointer border text-center shadow-sm transition-all ${getStatusBadge(d.status)}`}
                                                        >
                                                            {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                        </select>
                                                        <button 
                                                            onClick={() => deleteLog(d.id)}
                                                            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                                            title="Delete Log"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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

                <footer className="mt-20 pb-10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">Novatrum // Discovery Systems</p>
                </footer>
            </main>
        </div>
    );
}