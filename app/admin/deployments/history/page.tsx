"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    Clock, Search, ArrowLeft, CheckCircle2, AlertCircle, 
    FileText, Calendar, Filter, Database, Hash
} from 'lucide-react';

export default function DeploymentHistoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // Sadece tamamlanmış (Active veya Failed) olanları geçmişe alıyoruz
            const { data, error } = await supabase
                .from('deployments')
                .select(`
                    *,
                    clients (
                        full_name,
                        company_name
                    )
                `)
                .or('status.eq.active,status.eq.failed')
                .order('completed_at', { ascending: false });

            if (error) throw error;
            setHistory(data || []);
        } catch (err) {
            console.error("History fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(item => 
        item.node_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.clients?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400 font-sans">Accessing Logs...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans pb-20">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 lg:px-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/admin/deployments')} className="p-3 bg-white border border-zinc-200 rounded-full text-zinc-400 hover:text-black transition-colors shadow-sm">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-light tracking-tighter text-zinc-900">Archive</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Historical Node Deployment Logs</p>
                    </div>
                </div>
            </div>

            {/* Arama ve Filtre */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-zinc-200 pb-4 px-2 lg:px-0">
                <div className="flex items-center gap-2 text-zinc-500">
                    <Filter size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Showing {filteredHistory.length} completed operations</span>
                </div>
                <div className="relative w-full xl:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input 
                        type="text" 
                        placeholder="Search by Node ID, Client or Name..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full bg-white border border-zinc-200 pl-10 pr-4 py-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-black transition-all text-zinc-900 shadow-sm" 
                    />
                </div>
            </div>

            {/* Geçmiş Tablosu */}
            <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-zinc-50/50 border-b border-zinc-100">
                            <tr>
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Deployment ID</th>
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Node & Entity</th>
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Completion</th>
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-right">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredHistory.length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold uppercase text-zinc-400">No archived deployments found.</td></tr>
                            ) : (
                                filteredHistory.map(item => (
                                    <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <Hash size={12} className="text-zinc-300"/>
                                                <span className="text-[10px] font-mono text-zinc-500 uppercase">{item.id.split('-')[0]}...</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-zinc-900">{item.node_name}</span>
                                                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tighter">{item.clients?.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                <Calendar size={12} />
                                                <span className="text-[10px] font-medium">
                                                    {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                    item.status === 'active' 
                                                    ? 'border-emerald-100 text-emerald-600 bg-emerald-50' 
                                                    : 'border-red-100 text-red-600 bg-red-50'
                                                }`}>
                                                    {item.status === 'active' ? 'SUCCESS' : 'FAILURE'}
                                                </span>
                                                <button onClick={() => router.push(`/admin/deployments/${item.id}`)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-black transition-colors">
                                                    <FileText size={14}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer Note */}
            <div className="flex items-center justify-center gap-2 text-zinc-400">
                <Database size={12} />
                <p className="text-[9px] font-bold uppercase tracking-[0.2em]">All telemetry data is cryptographically logged and stored for 365 days.</p>
            </div>
        </div>
    );
}