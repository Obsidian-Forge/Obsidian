"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
    Users, Briefcase, Activity, 
    Mail, FileCheck, Box, Server, Zap, Globe
} from 'lucide-react';

// --- ALT BİLEŞEN: SITE HEALTH (Isolated State to prevent Dashboard refresh) ---
const SiteHealthWidget = () => {
    // Genişlediği için daha fazla veri noktası (60 nokta) ekledim
    const [pingHistory, setPingHistory] = useState<number[]>(new Array(60).fill(32));
    
    useEffect(() => {
        const interval = setInterval(() => {
            const newPing = Math.floor(Math.random() * (45 - 28) + 28);
            setPingHistory(prev => [...prev.slice(1), newPing]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white border border-zinc-100 p-8 rounded-[32px] shadow-sm flex flex-col h-[350px] col-span-1 lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Main Node Monitoring</h3>
                        <p className="text-xs font-bold text-zinc-900">novatrum.eu</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold uppercase text-emerald-600">Live Telemetry</span>
                </div>
            </div>
            
            <div className="flex-1 flex items-end gap-1 w-full pt-4">
                {pingHistory.map((h, i) => (
                    <div 
                        key={i} 
                        className="bg-emerald-500 w-full rounded-t-sm transition-all duration-700"
                        style={{ 
                            height: `${(h / 60) * 100}%`, 
                            opacity: 0.1 + (i / 60) 
                        }}
                    />
                ))}
            </div>
            <div className="mt-6 flex justify-between items-center border-t border-zinc-50 pt-4">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-mono font-light text-zinc-900">{pingHistory[pingHistory.length - 1]}</span>
                    <span className="text-xs font-bold text-zinc-400">ms</span>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Global Latency Average</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Status: Stable</p>
                </div>
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ clients: 0, projects: 0, revenue: 0, assets: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const [clientsRes, projectsRes, filesRes] = await Promise.all([
                supabase.from('clients').select('id, monthly_price, maintenance_fee'),
                supabase.from('deployments').select('id'),
                supabase.from('client_files').select('id')
            ]);
            const totalRev = clientsRes.data?.reduce((acc, curr) => acc + (Number(curr.monthly_price) || 0) + (Number(curr.maintenance_fee) || 0), 0) || 0;
            setStats({ clients: clientsRes.data?.length || 0, projects: projectsRes.data?.length || 0, revenue: totalRev, assets: filesRes.data?.length || 0 });
        };
        fetchStats();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-light tracking-tighter text-zinc-900 mb-2">Systems Overview</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Infrastructure Management Console</p>
                </div>
                <div className="hidden md:flex bg-zinc-100 px-4 py-2 rounded-full items-center gap-2 border border-zinc-200">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">All Nodes Online</span>
                </div>
            </header>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Entities', value: stats.clients, icon: Users },
                    { label: 'Trajectories', value: stats.projects, icon: Briefcase },
                    { label: 'Monthly MRR', value: `€${stats.revenue.toLocaleString()}`, icon: Activity },
                    { label: 'Vault Assets', value: stats.assets, icon: Box }
                ].map((s, i) => (
                    <div key={i} className="bg-zinc-50 border border-zinc-100 p-8 rounded-[32px] group hover:bg-white hover:border-black transition-all cursor-default">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover:text-black">{s.label}</p>
                            <s.icon size={14} className="text-zinc-300 group-hover:text-black" />
                        </div>
                        <p className="text-3xl font-light text-zinc-900">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Operational Nodes (Top 3) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => router.push('/admin/audit-maker')} className="group p-8 bg-black text-white rounded-[32px] hover:scale-[1.02] transition-all shadow-xl text-left relative overflow-hidden">
                    <Zap className="absolute right-[-10%] top-[-10%] opacity-10" size={120} />
                    <FileCheck className="mb-4 text-emerald-400" size={28} />
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Audit Maker</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Build blueprints</p>
                </button>
                <button onClick={() => router.push('/admin/email-maker')} className="group p-8 bg-white border border-zinc-200 rounded-[32px] hover:border-black transition-all text-left">
                    <Mail className="mb-4 text-zinc-900" size={28} />
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1 text-zinc-900">Email Maker</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Dispatch protocols</p>
                </button>
                <button onClick={() => router.push('/admin/status')} className="group p-8 bg-white border border-zinc-200 rounded-[32px] hover:border-black transition-all text-left">
                    <Server className="mb-4 text-zinc-900" size={28} />
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1 text-zinc-900">Infrastructure</h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Manage nodes</p>
                </button>
            </div>

            {/* Dynamic Telemetry Section - ARTIK TAM GENİŞLİK */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <SiteHealthWidget />
            </div>

            {/* Pipeline Actions */}
            <div className="bg-black p-10 rounded-[40px] flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-20 -bottom-20 bg-zinc-800/20 w-80 h-80 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-light tracking-tight text-white mb-2">Expansion Protocol</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Initiate a new client trajectory or deployment node.</p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button onClick={() => router.push('/admin/clients')} className="bg-zinc-800 text-white px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-700 transition-all">
                        New Entity
                    </button>
                    <button onClick={() => router.push('/admin/deployments/new')} className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                        Launch Project
                    </button>
                </div>
            </div>
        </div>
    );
}