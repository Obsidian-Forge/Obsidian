"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminInfrastructurePage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') router.push('/client/login');
            else setIsAdmin(true);
        };

        checkAdmin();
        fetchSystemStatus();

        const statusChannel = supabase.channel('admin-status-page-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, () => {
                fetchSystemStatus();
            }).subscribe();

        return () => {
            supabase.removeChannel(statusChannel);
        };
    }, [router]);

    const fetchSystemStatus = async () => {
        const { data, error } = await supabase.from('system_status').select('*').order('label', { ascending: true });
        if (data) setSystemStatuses(data);
        setLoading(false);
    };

    const initializeDefaultNodes = async () => {
        setInitializing(true);
        try {
            const defaultNodes = [
                { id: 'node-api', label: 'Novatrum API', status: 'operational', target_url: 'https://ndpokwlkcatwlwdzexah.supabase.co/rest/v1/' },
                { id: 'node-db', label: 'Database Cluster', status: 'operational', target_url: 'https://ndpokwlkcatwlwdzexah.supabase.co' }
            ];
            const { error } = await supabase.from('system_status').insert(defaultNodes);
            if (error) throw error;
            await fetchSystemStatus();
        } catch (err: any) {
            alert("Failed to initialize: " + err.message);
        } finally {
            setInitializing(false);
        }
    };

    const setNodeStatus = async (id: string, newStatus: string) => {
        try {
            setSystemStatuses(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            const { error } = await supabase.from('system_status').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
        } catch (err: any) {
            alert("Failed to update: " + err.message);
            fetchSystemStatus();
        }
    };

    const deleteNode = async (id: string) => {
        if (!confirm("Permanently delete this node?")) return;
        try {
            await supabase.from('system_status').delete().eq('id', id);
            setSystemStatuses(prev => prev.filter(s => s.id !== id));
        } catch (err: any) {
            alert("Failed to delete: " + err.message);
        }
    };

    // GÜNCELLENEN KISIM: İKİ FARKLI EKLEME MANTIĞI
    const addNewNode = async (isCore: boolean) => {
        const nodeName = prompt(isCore ? "Enter Core Node Name (e.g., Redis Cache):" : "Enter Client Name (e.g., Acme Corp):");
        if (!nodeName) return;
        
        let nodeUrl = prompt("Enter target URL to monitor (e.g., https://...):");
        
        if (nodeUrl && !nodeUrl.startsWith('http')) {
            nodeUrl = 'https://' + nodeUrl;
        }
        
        // Eğer Core ise 'node-' ile başlar (üst listeye gider), Client ise 'client-' ile başlar (alt listeye gider)
        const nodeId = (isCore ? "node-" : "client-") + Date.now(); 

        const { error } = await supabase.from('system_status').insert([{ 
            id: nodeId,
            label: nodeName.trim(), 
            status: 'operational',
            target_url: nodeUrl ? nodeUrl.trim() : null
        }]);
        
        if (!error) fetchSystemStatus();
        else alert("Error adding node: " + error.message);
    };

    const coreNodes = systemStatuses.filter(node => !node.id.startsWith('client-'));
    const clientNodes = systemStatuses.filter(node => node.id.startsWith('client-'));

    const StatusCard = ({ node }: { node: any }) => (
        <div className="group relative bg-white border border-zinc-200 p-6 md:p-8 rounded-[32px] shadow-sm transition-all hover:border-zinc-300 flex flex-col justify-between">
            <button onClick={() => deleteNode(node.id)} className="absolute top-6 right-6 p-2 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-white hover:bg-red-50 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
            </button>

            <div className="flex flex-col gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-zinc-900 mb-1">{node.label}</h3>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Protocol: <span className="text-zinc-600 font-mono">STABLE</span></p>
                </div>
                
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                    <p className="text-[9px] font-bold text-zinc-500 truncate mb-1">TARGET: <a href={node.target_url} target="_blank" className="text-emerald-600 hover:underline">{node.target_url || 'No URL Defined'}</a></p>
                    <p className="text-[9px] font-bold text-zinc-500">LAST PING: <span className="text-black">{node.updated_at ? new Date(node.updated_at).toLocaleString() : 'Waiting for GitHub Action...'}</span></p>
                </div>
            </div>

            <div className="bg-zinc-100 p-1.5 rounded-2xl flex items-center gap-1 mt-auto">
                {[
                    { id: 'operational', label: 'Online', activeClass: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' },
                    { id: 'degraded', label: 'Warn', activeClass: 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' },
                    { id: 'down', label: 'Down', activeClass: 'bg-red-500 text-white shadow-lg shadow-red-500/30' }
                ].map(btn => (
                    <button
                        key={btn.id}
                        onClick={() => setNodeStatus(node.id, btn.id)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${node.status === btn.id ? btn.activeClass : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
        </div>
    );

    if (!isAdmin) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 text-black font-sans relative overflow-x-hidden selection:bg-black selection:text-white">
            <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto max-w-7xl mx-auto w-full relative z-10">
                
                <button onClick={() => router.push('/admin/dashboard')} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Workspace
                </button>

                <div className="w-full animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 mb-10">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Infrastructure</h1>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live System Monitor
                            </p>
                        </div>
                        
                        {/* GÜNCELLENEN KISIM: İKİ BUTON */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <button onClick={() => addNewNode(true)} className="w-full sm:w-auto bg-white border border-zinc-200 hover:border-black text-zinc-900 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5v14"></path></svg>
                                Add Core Node
                            </button>
                            <button onClick={() => addNewNode(false)} className="w-full sm:w-auto bg-zinc-900 hover:bg-black text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                Register Client Endpoint
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center">
                            <span className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pinging Nodes...</p>
                        </div>
                    ) : systemStatuses.length === 0 ? (
                        <div className="py-20 border border-dashed border-zinc-200 rounded-[32px] bg-white flex flex-col items-center justify-center text-center p-8 shadow-sm">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">No infrastructure components configured yet.</p>
                            <button onClick={initializeDefaultNodes} disabled={initializing} className="bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-3 shadow-sm">
                                {initializing ? <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> : null}
                                {initializing ? 'INITIALIZING...' : 'INITIALIZE DEFAULT SYSTEM NODES'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            
                            {/* BÖLÜM 1: CORE INFRASTRUCTURE */}
                            {coreNodes.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Core Infrastructure</h2>
                                        <div className="h-px bg-zinc-200 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {coreNodes.map(node => <StatusCard key={node.id} node={node} />)}
                                    </div>
                                </section>
                            )}

                            {/* BÖLÜM 2: CLIENT ENDPOINTS */}
                            {clientNodes.length > 0 && (
                                <section>
                                    <div className="flex items-center gap-4 mb-6">
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Client Endpoints</h2>
                                        <div className="h-px bg-zinc-200 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {clientNodes.map(node => <StatusCard key={node.id} node={node} />)}
                                    </div>
                                </section>
                            )}

                        </div>
                    )}

                    <div className="mt-12 bg-white border border-zinc-200 p-6 md:p-8 rounded-[32px] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start gap-4 md:gap-6">
                        <div className="p-3 md:p-4 bg-zinc-50 rounded-2xl border border-zinc-100 shrink-0">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-sm md:text-base font-black uppercase tracking-widest text-zinc-900 mt-1">Global Node Override</h3>
                            <p className="text-zinc-500 text-xs md:text-sm font-bold mt-2 leading-relaxed max-w-3xl">
                                Changes made here bypass standard health checks. ONLINE indicates full service availability. WARN indicates increased latency or scheduled maintenance. DOWN triggers high-priority alerts across the client network.
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="mt-20 pb-10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">Novatrum // Infrastructure Systems</p>
                </footer>
            </main>
        </div>
    );
}