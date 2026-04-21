"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Server, Globe, Trash2, FileText, Copy, X, 
    CheckCircle2, AlertTriangle, XCircle, LayoutTemplate, 
    Zap, Box, MonitorPlay, Cloud, Database, Plus, Edit2, Users,
    Megaphone, ShieldAlert, Gift, Heart
} from 'lucide-react';

// --- 1. CANLI TELEMETRİ WIDGET'I (novatrum.eu Ping Simülasyonu) ---
const SiteHealthWidget = () => {
    const [pingHistory, setPingHistory] = useState<number[]>(new Array(60).fill(32));
    
    useEffect(() => {
        const interval = setInterval(() => {
            const newPing = Math.floor(Math.random() * (45 - 28) + 28);
            setPingHistory(prev => [...prev.slice(1), newPing]);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="mb-16">
            <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-[40px] shadow-2xl flex flex-col h-[280px] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent opacity-50" />
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <Globe size={20} />
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Main Node Telemetry</h3>
                            <p className="text-lg font-light tracking-tight text-white">novatrum.eu</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">Live Status: Stable</span>
                    </div>
                </div>
                
                <div className="flex-1 flex items-end gap-1 w-full pt-4 relative z-10">
                    {pingHistory.map((h, i) => (
                        <div 
                            key={i} 
                            className="bg-emerald-500 w-full rounded-t-sm transition-all duration-500"
                            style={{ height: `${(h / 60) * 100}%`, opacity: 0.3 + (i / 60) }}
                        />
                    ))}
                </div>
                <div className="mt-6 flex justify-between items-end border-t border-white/5 pt-4 relative z-10">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-mono font-light text-white">{pingHistory[pingHistory.length - 1]}</span>
                        <span className="text-xs font-bold text-zinc-500">ms</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Global Latency Average</p>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Routing: Optimal</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default function AdminInfrastructurePage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);
    
    // --- VERİTABANI STATELERİ ---
    const [showroomSettings, setShowroomSettings] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);
    const [announcement, setAnnouncement] = useState<any>(null);

    // --- MODAL STATELERİ ---
    const [selectedNode, setSelectedNode] = useState<any | null>(null);
    const [nodeLogs, setNodeLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // SİLME MODALI İÇİN STATELER
    const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
    const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') router.push('/client/login');
            else setIsAdmin(true);
        };

        checkAdmin();
        fetchAllData();

        // REAL-TIME
        const statusChannel = supabase.channel('admin-infra-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'showroom_settings' }, () => fetchShowroomSettings())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'modules' }, () => fetchModules())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, () => fetchSystemStatus())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => fetchAnnouncement())
            .subscribe();
            
        return () => { supabase.removeChannel(statusChannel); };
    }, [router]);

    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([fetchShowroomSettings(), fetchModules(), fetchSystemStatus(), fetchAnnouncement()]);
        setLoading(false);
    };

    const fetchAnnouncement = async () => {
        const { data } = await supabase.from('announcements').select('*').eq('id', 1).single();
        if (data) setAnnouncement(data);
    };

    const fetchShowroomSettings = async () => {
        const { data } = await supabase.from('showroom_settings').select('*').eq('id', 1).single();
        if (data) setShowroomSettings(data);
    };

    const fetchModules = async () => {
        const { data } = await supabase.from('modules').select('*').order('display_order', { ascending: true });
        if (data) setModules(data);
    };

    const fetchSystemStatus = async () => {
        const { data } = await supabase.from('system_status').select('*').order('label', { ascending: true });
        if (data) setSystemStatuses(data);
    };

    // --- GÜNCELLEME İŞLEMLERİ ---
    const updateAnnouncement = async (updates: any) => {
        setAnnouncement((prev: any) => ({ ...prev, ...updates }));
        const { error } = await supabase.from('announcements').update(updates).eq('id', 1);
        if (error) alert("Error updating announcement: " + error.message);
    };

    const updateShowroom = async (field: string, value: string) => {
        setShowroomSettings((prev: any) => ({ ...prev, [field]: value }));
        const { error } = await supabase.from('showroom_settings').update({ [field]: value }).eq('id', 1);
        if (error) alert("Error updating showroom: " + error.message);
    };

    const updateModuleStatus = async (id: string, newStatus: string) => {
        setModules(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
        const { error } = await supabase.from('modules').update({ status: newStatus }).eq('id', id);
        if (error) alert("Error updating module: " + error.message);
    };

    const setNodeStatus = async (id: string, newStatus: string) => {
        setSystemStatuses(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        const { error } = await supabase.from('system_status').update({ status: newStatus }).eq('id', id);
        if (error) alert("Error updating node: " + error.message);
    };

    // --- İLK KURULUM (INIT) İŞLEMLERİ ---
    const initShowroom = async () => {
        setInitializing(true);
        await supabase.from('showroom_settings').insert([{ id: 1, global_network: 'Active', creative: 'Online', fintech: 'Online', logistics: 'Online', quantum: 'Online' }]);
        await fetchShowroomSettings();
        setInitializing(false);
    };

    const seedDefaultModules = async () => {
        setInitializing(true);
        const defaultModules = [
            { slug: 'nexus-cx', price: '49', status: 'coming-soon', icon_name: 'Network', display_order: 1, content: { en: { name: 'Nexus CX Module', tagline: 'Client Experience Paradigm' } } },
            { slug: 'sentinel-core', price: '99', status: 'coming-soon', icon_name: 'ShieldCheck', display_order: 2, content: { en: { name: 'Sentinel Core Security', tagline: 'Military-Grade Infrastructure' } } },
            { slug: 'architect-ai', price: '79', status: 'coming-soon', icon_name: 'Cpu', display_order: 3, content: { en: { name: 'Architect AI Module', tagline: 'Automated Blueprint Generation' } } },
            { slug: 'neural-ai', price: 'Tiered', status: 'coming-soon', icon_name: 'BrainCircuit', display_order: 4, content: { en: { name: 'Neural AI Engine', tagline: 'The Ultimate Oracle' } } }
        ];
        await supabase.from('modules').insert(defaultModules);
        await fetchModules();
        setInitializing(false);
    };

    const initializeCoreNodes = async () => {
        setInitializing(true);
        const defaultNodes = [
            { id: 'node-storage', label: 'Cloud Storage', status: 'operational', target_url: 'https://ndpokwlkcatwlwdzexah.supabase.co/storage/v1/' },
            { id: 'node-db', label: 'Database', status: 'operational', target_url: 'https://ndpokwlkcatwlwdzexah.supabase.co' },
            { id: 'node-api', label: 'Novatrum API', status: 'operational', target_url: 'https://ndpokwlkcatwlwdzexah.supabase.co/rest/v1/' },
            { id: 'node-realtime', label: 'Realtime Node', status: 'operational', target_url: 'https://ndpokwlkcatwlwdzexah.supabase.co/realtime/v1/' }
        ];
        await supabase.from('system_status').insert(defaultNodes);
        await fetchSystemStatus();
        setInitializing(false);
    };

    // --- ÖZEL SİLME İŞLEMLERİ ---
    const confirmDeleteModule = async () => {
        if (!moduleToDelete) return;
        const id = moduleToDelete;
        setModuleToDelete(null);
        setModules(prev => prev.filter(m => m.id !== id));
        const { error } = await supabase.from('modules').delete().eq('id', id);
        if (error) alert("Error deleting module: " + error.message);
    };

    const confirmDeleteNode = async () => {
        if (!nodeToDelete) return;
        const id = nodeToDelete;
        setNodeToDelete(null);
        setSystemStatuses(prev => prev.filter(s => s.id !== id));
        const { error } = await supabase.from('system_status').delete().eq('id', id);
        if (error) alert("Error deleting node: " + error.message);
    };

    const openHealthReport = async (node: any) => {
        setSelectedNode(node);
        setLoadingLogs(true);
        const { data } = await supabase.from('incident_logs').select('*').eq('node_id', node.id).order('created_at', { ascending: false }).limit(10);
        if (data) setNodeLogs(data);
        setLoadingLogs(false);
    };

    const coreNodes = systemStatuses.filter(n => n.id.startsWith('node-'));
    const clientNodes = systemStatuses.filter(n => n.id.startsWith('client-'));

    const showroomProjects = [
        { id: 'creative', label: 'Aura Creative', module: 'MODULE 01' },
        { id: 'fintech', label: 'Aegis Finance', module: 'MODULE 02' },
        { id: 'logistics', label: 'Node Logistics', module: 'MODULE 03' },
        { id: 'quantum', label: 'Quantum Engine', module: 'MODULE 04' }
    ];

    if (!isAdmin) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-bold uppercase text-[10px] tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans pb-32 relative">
            <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10 animate-in fade-in duration-700">
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-200 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-light tracking-tight text-black">Infrastructure</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live System Monitor
                        </p>
                    </div>
                </header>

                <SiteHealthWidget />

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center">
                        <span className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Syncing Architecture...</p>
                    </div>
                ) : (
                    <div className="space-y-24">
                        
                        {/* 0. GLOBAL ANNOUNCEMENT BAR KONTROLÜ */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Megaphone size={14}/> Global Broadcast Bar</h2>
                                <div className="h-px bg-zinc-200 flex-1"></div>
                            </div>

                            {announcement && (
                                <div className="bg-white border border-zinc-200 p-8 rounded-[40px] shadow-sm space-y-8">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
                                        <div>
                                            <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-900 mb-1">Top Banner Settings</h3>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Push live updates, sales, or alerts to all public visitors.</p>
                                        </div>
                                        <button 
                                            onClick={() => updateAnnouncement({ is_active: !announcement.is_active })}
                                            className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${announcement.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-zinc-100 text-zinc-400 border-zinc-200 hover:text-black'}`}
                                        >
                                            {announcement.is_active ? <><CheckCircle2 size={14} /> Broadcasting Live</> : <><XCircle size={14} /> Broadcast Offline</>}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 space-y-2">
                                            {/* YENİ: Başlık ve Hazır Şablonlar (Dropdown) */}
                                            <div className="flex items-center justify-between ml-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Message Content</label>
                                                <select 
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            updateAnnouncement({ message: e.target.value });
                                                            e.target.value = ""; // Seçim yapıldıktan sonra sıfırla
                                                        }
                                                    }}
                                                    className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-transparent border-none outline-none cursor-pointer hover:text-emerald-700"
                                                >
                                                    <option value="">+ Load Preset</option>
                                                    <option value="We are currently upgrading our infrastructure. Some services might be slow.">⚙️ Maintenance</option>
                                                    <option value="🚨 Critical system outage detected. Our team is actively investigating.">🚨 Outage Alert</option>
                                                    <option value="🎉 Flash Sale! Enjoy priority deployment with 30% off today.">🎉 Flash Sale</option>
                                                    <option value="✨ New architecture deployed. Experience the updated capabilities.">✨ New Release</option>
                                                    <option value="Welcome to the Novatrum Command Center.">👋 Welcome</option>
                                                </select>
                                            </div>
                                            <input 
                                                type="text" 
                                                value={announcement.message} 
                                                onChange={(e) => updateAnnouncement({ message: e.target.value })}
                                                placeholder="Type your custom message or load a preset..."
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Broadcast Theme</label>
                                            <select 
                                                value={announcement.theme} 
                                                onChange={(e) => updateAnnouncement({ theme: e.target.value })}
                                                className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none appearance-none cursor-pointer"
                                            >
                                                <option value="info">Info (Indigo - Updates)</option>
                                                <option value="sale">Sale (Amber - Discounts)</option>
                                                <option value="holiday">Holiday (Rose - Special Days)</option>
                                                <option value="warning">Warning (Orange - Maintenance)</option>
                                                <option value="alert">Critical Alert (Red - Outage)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 1. SHOWROOM CONTROLS */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><MonitorPlay size={14}/> Showroom Controls</h2>
                                <div className="h-px bg-zinc-200 flex-1"></div>
                            </div>

                            {!showroomSettings ? (
                                <div className="py-12 border border-dashed border-zinc-200 rounded-[32px] bg-white flex flex-col items-center justify-center text-center p-8">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">Showroom parameters not found in database.</p>
                                    <button onClick={initShowroom} disabled={initializing} className="bg-black text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                                        {initializing ? 'Configuring...' : 'Initialize Showroom Table'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* GLOBAL NETWORK SWITCH */}
                                    <div className="bg-white border border-zinc-200 p-8 rounded-[32px] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-900 mb-1">Global Network Status</h3>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Master switch for the entire showroom page.</p>
                                        </div>
                                        <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
                                            {[ { id: 'Active', label: 'Active', active: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, { id: 'Maintenance', label: 'Maintenance', active: 'bg-amber-50 text-amber-700 border-amber-200' }, { id: 'Degraded', label: 'Degraded', active: 'bg-red-50 text-red-700 border-red-200' } ].map(btn => (
                                                <button key={btn.id} onClick={() => updateShowroom('global_network', btn.id)} className={`px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${showroomSettings.global_network === btn.id ? btn.active : 'border-transparent text-zinc-400 hover:text-black hover:bg-white'}`}>
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* INDIVIDUAL PROJECTS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {showroomProjects.map((project) => (
                                            <div key={project.id} className="bg-white border border-zinc-200 p-8 rounded-[32px] shadow-sm flex flex-col justify-between">
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-bold uppercase tracking-tight text-zinc-900 mb-1">{project.label}</h3>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{project.module}</p>
                                                </div>
                                                <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
                                                    {[ { id: 'Online', label: 'Online', active: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, { id: 'Offline', label: 'Offline', active: 'bg-red-50 text-red-700 border-red-200' }, { id: 'Maintenance', label: 'Maintenance', active: 'bg-amber-50 text-amber-700 border-amber-200' } ].map(btn => (
                                                        <button key={btn.id} onClick={() => updateShowroom(project.id, btn.id)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all ${showroomSettings[project.id] === btn.id ? btn.active : 'border-transparent text-zinc-400 hover:text-black hover:bg-white'}`}>
                                                            {btn.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* 2. SAAS MODULES STATUS (PRODUCTS) */}
                        <section>
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                    <LayoutTemplate size={14}/> SaaS Modules Status
                                </h2>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => router.push('/admin/status/waitlist')} 
                                        className="bg-white border border-zinc-200 text-zinc-900 px-5 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all hover:border-black flex items-center gap-2 shadow-sm"
                                    >
                                        <Users size={14}/> Waitlist
                                    </button>
                                    <button 
                                        onClick={() => router.push('/admin/status/new-saas')} 
                                        className="bg-black text-white px-5 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all hover:bg-zinc-800 flex items-center gap-2 shadow-lg"
                                    >
                                        <Plus size={14}/> New Module
                                    </button>
                                </div>
                            </div>
                            
                            <div className="bg-white border border-zinc-200 p-8 rounded-[40px] shadow-sm">
                                <div className="flex justify-between items-center mb-8 pb-6 border-b border-zinc-100">
                                    <div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Manage public availability of premium modules.</p>
                                    </div>
                                    <div className="p-3 bg-zinc-900 text-white rounded-2xl"><Zap size={20}/></div>
                                </div>

                                {modules.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-zinc-200 rounded-3xl bg-zinc-50">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">No SaaS modules configured yet.</p>
                                        <button onClick={seedDefaultModules} disabled={initializing} className="bg-black text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105">
                                            {initializing ? 'Configuring...' : 'Initialize Default Products'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {modules.map((mod) => {
                                            const modName = mod.content?.en?.name || mod.slug.toUpperCase();
                                            return (
                                                <div 
                                                    key={mod.id} 
                                                    className="p-6 bg-zinc-50 border border-zinc-100 rounded-[32px] space-y-6 hover:border-black transition-all group cursor-pointer"
                                                    onClick={(e) => {
                                                        if (!(e.target as HTMLElement).closest('button')) {
                                                            router.push(`/admin/status/edit-saas/${mod.id}`);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="p-3 bg-white rounded-2xl border border-zinc-100 shadow-sm text-zinc-900">
                                                            <Box size={24}/>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${mod.status === 'live' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                                                {mod.status}
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); router.push(`/admin/status/edit-saas/${mod.id}`); }}
                                                                className="p-1.5 bg-white rounded-lg border border-zinc-100 text-zinc-400 hover:text-black hover:border-zinc-300 transition-all"
                                                                title="Edit Module"
                                                            >
                                                                <Edit2 size={12}/>
                                                            </button>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setModuleToDelete(mod.id); }}
                                                                className="p-1.5 bg-white rounded-lg border border-zinc-100 text-zinc-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all"
                                                                title="Delete Module"
                                                            >
                                                                <Trash2 size={12}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-zinc-900 mb-1 truncate">{modName}</h4>
                                                        <p className="text-[10px] font-mono text-zinc-500">Price: {isNaN(Number(mod.price)) ? mod.price : `€${mod.price}`}</p>
                                                    </div>
                                                    <div className="bg-white p-1 rounded-xl flex items-center gap-1 border border-zinc-200">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); updateModuleStatus(mod.id, 'live'); }} 
                                                            className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${mod.status === 'live' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'bg-transparent text-zinc-400 hover:text-black'}`}
                                                        >
                                                            Live
                                                        </button>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); updateModuleStatus(mod.id, 'coming-soon'); }} 
                                                            className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${mod.status === 'coming-soon' ? 'bg-black text-white shadow-md' : 'bg-transparent text-zinc-400 hover:text-black'}`}
                                                        >
                                                            Soon
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 3. CORE INFRASTRUCTURE */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><Server size={14}/> Core Infrastructure</h2>
                                <div className="h-px bg-zinc-200 flex-1"></div>
                            </div>
                            
                            {coreNodes.length === 0 ? (
                                <div className="py-12 border border-dashed border-zinc-200 rounded-[32px] bg-white flex flex-col items-center justify-center text-center p-8">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">No core nodes configured.</p>
                                    <button onClick={initializeCoreNodes} disabled={initializing} className="bg-black text-white px-8 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-xl">
                                        Initialize Default Core Nodes
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {coreNodes.map(node => (
                                        <div key={node.id} className="bg-white border border-zinc-200 p-8 rounded-[32px] shadow-sm flex flex-col justify-between group relative">
                                            <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openHealthReport(node)} className="p-2 text-zinc-400 hover:text-black bg-zinc-50 rounded-lg transition-colors" title="View Health Report"><FileText size={16} /></button>
                                                <button onClick={() => setNodeToDelete(node.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-red-50/50 rounded-lg transition-colors" title="Delete Node"><Trash2 size={16} /></button>
                                            </div>

                                            <div className="flex flex-col gap-4 mb-8">
                                                <div>
                                                    <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-900 mb-1">{node.label}</h3>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Protocol: <span className="text-zinc-600 font-mono">STABLE</span></p>
                                                </div>
                                                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-1">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 truncate">TARGET: <a href={node.target_url} target="_blank" className="text-emerald-600 hover:text-emerald-700 hover:underline lowercase">{node.target_url || 'No URL Defined'}</a></p>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">LAST PING: <span className="text-black font-mono">{node.updated_at ? new Date(node.updated_at).toLocaleString() : 'Waiting...'}</span></p>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-50 p-1.5 rounded-2xl flex items-center gap-1 border border-zinc-100">
                                                {[ { id: 'operational', label: 'Online', activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, { id: 'degraded', label: 'Warn', activeClass: 'bg-amber-50 text-amber-700 border-amber-200' }, { id: 'down', label: 'Down', activeClass: 'bg-red-50 text-red-700 border-red-200' } ].map(btn => (
                                                    <button key={btn.id} onClick={() => setNodeStatus(node.id, btn.id)} className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 ${node.status === btn.id ? btn.activeClass : 'border-transparent text-zinc-400 hover:text-black hover:bg-white'}`}>
                                                        {btn.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 4. CLIENT ENDPOINTS */}
                        {clientNodes.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Globe size={14}/> Client Endpoints</h2>
                                    <div className="h-px bg-zinc-200 flex-1"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {clientNodes.map(node => (
                                         <div key={node.id} className="bg-white border border-zinc-200 p-8 rounded-[32px] shadow-sm flex flex-col justify-between group relative">
                                            <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openHealthReport(node)} className="p-2 text-zinc-400 hover:text-black bg-zinc-50 rounded-lg transition-colors"><FileText size={16} /></button>
                                                <button onClick={() => setNodeToDelete(node.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-red-50/50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                            <div className="flex flex-col gap-4 mb-8">
                                                <div>
                                                    <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-900 mb-1">{node.label}</h3>
                                                </div>
                                            </div>
                                            <div className="bg-zinc-50 p-1.5 rounded-2xl flex items-center gap-1 border border-zinc-100">
                                                {[ { id: 'operational', label: 'Online', activeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' }, { id: 'degraded', label: 'Warn', activeClass: 'bg-amber-50 text-amber-700 border-amber-200' }, { id: 'down', label: 'Down', activeClass: 'bg-red-50 text-red-700 border-red-200' } ].map(btn => (
                                                    <button key={btn.id} onClick={() => setNodeStatus(node.id, btn.id)} className={`flex-1 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 ${node.status === btn.id ? btn.activeClass : 'border-transparent text-zinc-400 hover:text-black hover:bg-white'}`}>
                                                        {btn.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* HEALTH REPORT MODAL */}
                {selectedNode && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-900">{selectedNode.label}</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Diagnostic Report & Logs</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setSelectedNode(null)} className="p-3 bg-white border border-zinc-200 rounded-full hover:border-black hover:text-black text-zinc-400 transition-colors">
                                        <X size={16}/>
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 overflow-y-auto flex-1 bg-white custom-scrollbar">
                                {loadingLogs ? (
                                    <div className="py-12 flex justify-center"><span className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin" /></div>
                                ) : nodeLogs.length === 0 ? (
                                    <div className="text-center py-12 border border-dashed border-zinc-200 rounded-3xl">
                                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">No incident logs recorded yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {nodeLogs.map((log) => (
                                            <div key={log.id} className="p-5 rounded-3xl border border-zinc-100 bg-zinc-50">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-2">
                                                        {log.status === 'operational' && <CheckCircle2 size={14} className="text-emerald-500"/>}
                                                        {log.status === 'degraded' && <AlertTriangle size={14} className="text-amber-500"/>}
                                                        {log.status === 'down' && <XCircle size={14} className="text-red-500"/>}
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">{log.status}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-400 bg-white px-2 py-1 rounded-md border border-zinc-200">{new Date(log.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* DELETE MODULE MODAL */}
                {moduleToDelete && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModuleToDelete(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative bg-white border border-zinc-200 p-8 md:p-10 rounded-[32px] shadow-2xl max-w-sm w-full text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete SaaS Module?</h3>
                            <p className="text-xs text-zinc-500 mb-8 leading-relaxed">This action cannot be undone. The module and all its data will be permanently removed from the infrastructure.</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setModuleToDelete(null)} className="flex-1 py-3.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 rounded-xl transition-all">Cancel</button>
                                <button onClick={confirmDeleteModule} className="flex-1 py-3.5 text-[9px] font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/20">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* DELETE NODE MODAL (Core/Client) */}
                {nodeToDelete && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setNodeToDelete(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="relative bg-white border border-zinc-200 p-8 md:p-10 rounded-[32px] shadow-2xl max-w-sm w-full text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
                                <Server size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Node?</h3>
                            <p className="text-xs text-zinc-500 mb-8 leading-relaxed">Are you sure you want to permanently delete this infrastructure node? This action cannot be reversed.</p>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setNodeToDelete(null)} className="flex-1 py-3.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 rounded-xl transition-all">Cancel</button>
                                <button onClick={confirmDeleteNode} className="flex-1 py-3.5 text-[9px] font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/20">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}