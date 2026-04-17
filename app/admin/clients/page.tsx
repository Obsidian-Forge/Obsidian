"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Plus, Compass, ArrowRight, BrainCircuit, Trash2, ArchiveRestore, CheckCircle2
} from 'lucide-react';

type TabType = 'inbound' | 'active' | 'archived' | 'terminated';

export default function EntityCRMPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState<any[]>([]);
    const [discoveries, setDiscoveries] = useState<any[]>([]);

    useEffect(() => { fetchAllData(); }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [clientsRes, discoveriesRes] = await Promise.all([
                supabase.from('clients').select('*').order('created_at', { ascending: false }),
                supabase.from('discoveries').select('*').order('created_at', { ascending: false })
            ]);
            if (clientsRes.data) setClients(clientsRes.data);
            if (discoveriesRes.data) setDiscoveries(discoveriesRes.data);
        } catch (err) { console.error("Sync failed", err); } 
        finally { setLoading(false); }
    };

    const filteredClients = clients.filter(c => {
        const matchesSearch = c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.company_name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        if (activeTab === 'active') return !c.archived_at && !c.deleted_at && matchesSearch;
        if (activeTab === 'archived') return c.archived_at !== null && !c.deleted_at && matchesSearch;
        if (activeTab === 'terminated') return c.deleted_at !== null && matchesSearch;
        return false;
    });

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400 animate-pulse font-sans">Establishing Node Connection...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 lg:px-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900 dark:text-white">Entity Hub</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Unified CRM for leads & subscribers</p>
                </div>
                <button onClick={() => router.push('/admin/clients/new')} className="bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 w-fit">
                    <Plus size={16} /> Register New Entity
                </button>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/5 pb-4 px-2 lg:px-0">
                <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl w-fit overflow-x-auto">
                    {(['inbound', 'active', 'archived', 'terminated'] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                            {tab === 'inbound' ? `Inbound (${discoveries.length})` : tab === 'active' ? `Active (${clients.filter(c => !c.archived_at && !c.deleted_at).length})` : tab === 'archived' ? `Archived (${clients.filter(c => c.archived_at && !c.deleted_at).length})` : `Trash (${clients.filter(c => c.deleted_at).length})`}
                        </button>
                    ))}
                </div>
                <div className="relative w-full xl:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-black transition-all text-zinc-900" />
                </div>
            </div>

            <div className="bg-white dark:bg-[#111] rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-zinc-50/50 dark:bg-white/[0.02] border-b border-zinc-100 dark:border-white/5">
                            <tr>
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Identity Details</th>
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">{activeTab === 'inbound' ? 'Discovery Type' : 'SaaS Plan'}</th>
                                {activeTab !== 'inbound' && <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">API Quota</th>}
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                            {filteredClients.map(c => (
                                <tr key={c.id} onClick={() => router.push(`/admin/clients/${c.id}`)} className="group hover:bg-zinc-50 dark:hover:bg-white/[0.01] transition-colors cursor-pointer">
                                    <td className="px-8 py-5"><p className="text-sm font-medium text-zinc-900 dark:text-white">{c.full_name}</p><p className="text-[10px] text-zinc-500 font-bold uppercase">{c.company_name || 'Individual'}</p></td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest border ${activeTab === 'terminated' ? 'border-red-200 text-red-600 bg-red-50' : 'border-zinc-200 text-zinc-500'}`}>
                                            {activeTab === 'terminated' ? 'Terminated' : c.subscription_plan || 'Standard'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5"><div className="flex items-center gap-2"><BrainCircuit size={12} className="text-zinc-400" /><span className="text-[10px] font-mono text-zinc-500">{c.used_messages || 0} / {c.monthly_limit || 0}</span></div></td>
                                    <td className="px-8 py-5 text-right"><button className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors flex items-center gap-1 ml-auto">Manage <ArrowRight size={14}/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}