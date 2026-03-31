"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function StatusPage() {
    const [systems, setSystems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        fetchStatus();

        const channel = supabase.channel('public-status-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_status' }, () => {
                fetchStatus();
            }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchStatus = async () => {
        const { data, error } = await supabase
            .from('system_status')
            .select('id, label, status, updated_at')
            .order('label', { ascending: true });

        if (data) {
            setSystems(data);
            setLastUpdated(new Date());
        }
        setLoading(false);
    };

    // SADECE CORE SİSTEMLERİ FİLTRELE (client- ile başlamayanlar)
    const coreNodes = systems.filter(node => !node.id.startsWith('client-'));

    // GENEL DURUMU SADECE CORE SİSTEMLERE GÖRE HESAPLA
    const isDown = coreNodes.some(s => s.status === 'down');
    const isDegraded = coreNodes.some(s => s.status === 'degraded');
    
    let globalStatus = 'All Systems Operational';
    let globalColor = 'text-emerald-500';
    let globalBg = 'bg-emerald-500';
    let globalBorder = 'border-emerald-200';
    let globalBox = 'bg-emerald-50';

    if (isDown) {
        globalStatus = 'Major System Outage';
        globalColor = 'text-red-600';
        globalBg = 'bg-red-500';
        globalBorder = 'border-red-200';
        globalBox = 'bg-red-50';
    } else if (isDegraded) {
        globalStatus = 'Partial System Degradation';
        globalColor = 'text-amber-600';
        globalBg = 'bg-amber-500';
        globalBorder = 'border-amber-200';
        globalBox = 'bg-amber-50';
    }

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white">
            <main className="max-w-3xl mx-auto px-6 py-20 md:py-32">
                
                <header className="mb-16 text-center animate-in fade-in duration-700 slide-in-from-bottom-4">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-black mb-4">
                        Novatrum <span className="text-zinc-400">Status</span>
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                        Real-time Core Infrastructure Availability
                    </p>
                </header>

                {loading ? (
                    <div className="py-20 flex justify-center">
                        <span className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-700 slide-in-from-bottom-8 delay-150 fill-mode-both">
                        
                        <div className={`p-6 md:p-8 rounded-[32px] border ${globalBorder} ${globalBox} mb-16 flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-500`}>
                            <div className="flex items-center gap-4">
                                <span className={`relative flex h-5 w-5`}>
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${globalBg}`}></span>
                                    <span className={`relative inline-flex rounded-full h-5 w-5 ${globalBg}`}></span>
                                </span>
                                <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${globalColor}`}>
                                    {globalStatus}
                                </h2>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {coreNodes.length > 0 && (
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 px-2">Core Infrastructure</h3>
                                    <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                                        {coreNodes.map((node, index) => (
                                            <div key={node.id} className={`p-5 flex items-center justify-between ${index !== coreNodes.length - 1 ? 'border-b border-zinc-100' : ''} hover:bg-zinc-50 transition-colors`}>
                                                <span className="font-bold text-sm text-zinc-800">{node.label}</span>
                                                <StatusBadge status={node.status} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-16 pt-8 border-t border-zinc-100 flex flex-col items-center justify-center gap-2 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                Automatically updated every 10 minutes
                            </p>
                            {lastUpdated && (
                                <p className="text-[9px] font-bold text-zinc-300">
                                    Last check: {lastUpdated.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                        
                    </div>
                )}
            </main>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'operational') {
        return <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">Operational</span>;
    }
    if (status === 'degraded') {
        return <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">Degraded</span>;
    }
    return <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1.5 rounded-full">Outage</span>;
}