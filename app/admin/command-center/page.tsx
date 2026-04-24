"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
    Users, Zap, Terminal, Lock, Unlock, 
    Search, Settings2, Database, Save, X, Activity, CreditCard, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// GERÇEK VERİ TABANI ŞEMASI (Genişletilmiş)
interface Client {
    id: string;
    full_name: string;
    email_address: string;
    entity_type: string; // 'Personal', 'Small Company', 'Company'
    monthly_price: number;
    maintenance_fee: number;
    saas_plan: string; // 'NONE', 'NODE', 'CORE', 'NEXUS'
    addons: string[]; // ['Nexus CX', 'Sentinel Core', 'Architect AI']
    tokens_limit: number;
    is_active: boolean;
}

export default function CommandCenter() {
    const [clients, setClients] = useState<Client[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // ARAMA VE FİLTRELEME STATE'LERİ
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("All");

    // CONFIG MODAL STATE'LERİ
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // SISTEM LOG FONKSIYONU
    const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
        const time = new Date().toLocaleTimeString();
        let colorClass = "text-zinc-500";
        if (type === 'success') colorClass = "text-emerald-500";
        if (type === 'warning') colorClass = "text-yellow-500";
        if (type === 'error') colorClass = "text-red-500";
        
        setLogs(prev => [`[${time}] ${message}`, ...prev].slice(0, 15));
    };

    // VERİLERİ ÇEK
    const fetchClients = async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Veritabanından gelen verileri normalize et (Örn: null olan addons'u boş dizi yap)
            const normalizedData = (data || []).map(client => ({
                ...client,
                saas_plan: client.saas_plan ? client.saas_plan.toUpperCase() : 'NONE',
                addons: client.addons || [],
                entity_type: client.entity_type || 'Personal'
            }));

            setClients(normalizedData);
            addLog(`System connected. Fetched ${normalizedData.length} entities from secure vault.`, 'success');
        } catch (error: any) {
            addLog(`Database connection failed: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        addLog("Initializing Command Center Protocols...", "info");
        fetchClients();
    }, []);

    // ARAMA VE FİLTRELEME MANTIĞI
    const filteredClients = clients.filter(client => {
        // 1. Arama Kontrolü (İsim, Email veya ID)
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            (client.full_name || '').toLowerCase().includes(searchLower) ||
            (client.email_address || '').toLowerCase().includes(searchLower) ||
            (client.id || '').toLowerCase().includes(searchLower);

        // 2. Sekme (Entity Type) Kontrolü
        const matchesTab = activeTab === 'All' || client.entity_type === activeTab;

        return matchesSearch && matchesTab;
    });

    // KILL SWITCH (Sadece Durumu Değiştirir)
    const toggleKillSwitch = async (client: Client) => {
        const newStatus = !client.is_active;
        addLog(`Initiating status override for ${client.id}...`, 'warning');

        const { error } = await supabase
            .from('clients')
            .update({ is_active: newStatus })
            .eq('id', client.id);

        if (error) {
            addLog(`Override failed: ${error.message}`, 'error');
            return;
        }

        setClients(prev => prev.map(c => c.id === client.id ? { ...c, is_active: newStatus } : c));
        addLog(`[ACCESS ${newStatus ? 'GRANTED' : 'REVOKED'}] Entity: ${client.full_name}`, newStatus ? 'success' : 'error');
    };

    // MASTER CONFIG KAYDET
    const saveConfiguration = async () => {
        if (!selectedClient) return;
        setIsSaving(true);
        addLog(`Deploying new configuration for ${selectedClient.full_name}...`, 'info');

        const { error } = await supabase
            .from('clients')
            .update({
                saas_plan: selectedClient.saas_plan,
                addons: selectedClient.addons,
                monthly_price: selectedClient.monthly_price,
                maintenance_fee: selectedClient.maintenance_fee,
                tokens_limit: selectedClient.tokens_limit,
                entity_type: selectedClient.entity_type
            })
            .eq('id', selectedClient.id);

        if (error) {
            addLog(`Configuration deployment failed: ${error.message}`, 'error');
        } else {
            setClients(prev => prev.map(c => c.id === selectedClient.id ? selectedClient : c));
            addLog(`Configuration successfully deployed to node.`, 'success');
            setSelectedClient(null);
        }
        setIsSaving(false);
    };

    // Addon (Modül) Seçme Fonksiyonu
    const toggleAddon = (addonName: string) => {
        if (!selectedClient) return;
        const hasAddon = selectedClient.addons.includes(addonName);
        const newAddons = hasAddon 
            ? selectedClient.addons.filter(a => a !== addonName)
            : [...selectedClient.addons, addonName];
        
        setSelectedClient({ ...selectedClient, addons: newAddons });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 relative">
            
            {/* ÜST BAŞLIK */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Live System Monitor</span>
                    </div>
                    <h1 className="text-5xl font-light tracking-tighter text-black dark:text-white">Command Center</h1>
                </div>

                <div className="flex gap-4">
                    <div className="bg-black text-white p-4 rounded-2xl flex flex-col min-w-[140px] shadow-xl">
                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total MRR Flow</span>
                        <span className="text-xl font-mono font-bold tracking-tighter text-emerald-400">
                            €{clients.reduce((acc, curr) => acc + (Number(curr.monthly_price) || 0) + (Number(curr.maintenance_fee) || 0), 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* ANA PANEL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* SOL TARAF: MÜŞTERİ YÖNETİMİ TABLOSU */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[32px] shadow-sm overflow-hidden flex flex-col h-full">
                        
                        {/* ARAMA VE FİLTRELEME BÖLÜMÜ */}
                        <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} /> Registered Entities
                                </h2>
                                
                                {/* Arama Çubuğu */}
                                <div className="relative w-full md:w-72">
                                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="text" 
                                        placeholder="SEARCH ID, NAME OR EMAIL..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black dark:focus:border-white transition-colors text-black dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Entity Type Sekmeleri */}
                            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                                {['All', 'Personal', 'Small Company', 'Company'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                                            activeTab === tab
                                            ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* TABLO */}
                        <div className="overflow-x-auto flex-1 min-h-[400px]">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full text-[10px] uppercase font-bold tracking-widest text-zinc-400 min-h-[300px]">
                                    <span className="w-4 h-4 border-2 border-zinc-300 border-t-black rounded-full animate-spin mr-3" /> Fetching secure data...
                                </div>
                            ) : filteredClients.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400 min-h-[300px] gap-2">
                                    <ShieldAlert size={32} className="opacity-20" />
                                    <span className="text-[10px] uppercase font-bold tracking-widest">No entities found matching criteria</span>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50/50 dark:bg-white/5">
                                            <th className="px-8 py-4">Entity</th>
                                            <th className="px-8 py-4">SaaS Allocation</th>
                                            <th className="px-8 py-4 text-center">Config</th>
                                            <th className="px-8 py-4 text-right">Status / Kill Switch</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                        {filteredClients.map((client) => (
                                            <tr key={client.id} className="group hover:bg-zinc-50/30 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm tracking-tight text-black dark:text-white">{client.full_name || 'Unnamed'}</span>
                                                        <span className="text-[9px] font-mono text-zinc-400 uppercase mt-0.5">{client.id.split('-')[0] || client.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">
                                                            {client.saas_plan || 'NONE'}
                                                        </span>
                                                        {client.addons && client.addons.length > 0 && (
                                                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                                                                + {client.addons.length} Modules
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <button 
                                                        onClick={() => setSelectedClient({...client})}
                                                        className="p-2 inline-flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-black hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Settings2 size={16} />
                                                    </button>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => toggleKillSwitch(client)}
                                                        className={`px-4 py-2 rounded-xl transition-all duration-500 transform active:scale-95 shadow-sm inline-flex items-center gap-2
                                                            ${client.is_active 
                                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-red-500 hover:text-white' 
                                                                : 'bg-red-600 text-white shadow-red-600/20 hover:bg-emerald-500'}`}
                                                    >
                                                        {client.is_active ? <Unlock size={14} /> : <Lock size={14} />}
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">{client.is_active ? 'Active' : 'Locked'}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* SAĞ TARAF: KERNEL LOGS */}
                <div className="space-y-8">
                    <div className="bg-black rounded-[32px] p-8 shadow-2xl relative overflow-hidden border border-white/5 h-full min-h-[500px]">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Terminal size={40} className="text-white" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                            <Zap size={12} className="text-yellow-500" /> System Terminal
                        </h3>
                        
                        <div className="font-mono text-[10px] space-y-3">
                            {logs.map((log, i) => {
                                const isSuccess = log.includes('SUCCESS') || log.includes('GRANTED') || log.includes('connected');
                                const isError = log.includes('FAILED') || log.includes('REVOKED');
                                return (
                                    <div key={i} className={`flex gap-3 transition-all ${isSuccess ? 'text-emerald-400' : isError ? 'text-red-400' : 'text-zinc-500'}`}>
                                        <span className="shrink-0 opacity-50">&gt;</span>
                                        <span className="break-all">{log}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* MASTER CONFIGURATION MODAL */}
            <AnimatePresence>
                {selectedClient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedClient(null)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/50 dark:bg-white/[0.02]">
                                <div>
                                    <h2 className="text-2xl font-light tracking-tight text-black dark:text-white">Node Configuration</h2>
                                    <p className="text-[10px] font-mono text-zinc-400 uppercase mt-1">Entity: {selectedClient.full_name} | ID: {selectedClient.id}</p>
                                </div>
                                <button onClick={() => setSelectedClient(null)} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:scale-105 transition-transform text-black dark:text-white">
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                                
                                {/* 0. Entity Type Assignment */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <Users size={14} /> Entity Classification
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['Personal', 'Small Company', 'Company'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedClient({...selectedClient, entity_type: type})}
                                                className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border
                                                    ${selectedClient.entity_type === type 
                                                        ? 'bg-zinc-100 border-zinc-300 text-black dark:bg-zinc-800 dark:border-zinc-600 dark:text-white' 
                                                        : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-black dark:hover:border-white'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 1. SaaS Base Plan */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <Database size={14} /> Core Engine Allocation
                                    </h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {['NONE', 'NODE', 'CORE', 'NEXUS'].map(plan => (
                                            <button
                                                key={plan}
                                                onClick={() => setSelectedClient({...selectedClient, saas_plan: plan})}
                                                className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                                                    ${selectedClient.saas_plan === plan 
                                                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-md' 
                                                        : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-black dark:hover:border-white'}`}
                                            >
                                                {plan}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 1.5 SaaS Addons (Gerçek İsimler) */}
                                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Extra SaaS Modules</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {['Nexus CX', 'Sentinel Core', 'Architect AI'].map(addon => {
                                            const isActive = selectedClient.addons.includes(addon);
                                            return (
                                                <button
                                                    key={addon}
                                                    onClick={() => toggleAddon(addon)}
                                                    className={`py-3 px-4 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border flex items-center justify-between
                                                        ${isActive 
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400' 
                                                            : 'bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-black dark:hover:border-white'}`}
                                                >
                                                    {addon}
                                                    <div className={`w-3 h-3 rounded-full border ${isActive ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-300 dark:border-zinc-600'}`} />
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* 2. Financial Metrics */}
                                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <CreditCard size={14} /> Financial Architecture
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">SaaS Fee (€ / mo)</label>
                                            <input 
                                                type="number" 
                                                value={selectedClient.monthly_price || 0}
                                                onChange={(e) => setSelectedClient({...selectedClient, monthly_price: Number(e.target.value)})}
                                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-mono text-black dark:text-white focus:border-black dark:focus:border-white outline-none transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Maintenance (€ / mo)</label>
                                            <input 
                                                type="number" 
                                                value={selectedClient.maintenance_fee || 0}
                                                onChange={(e) => setSelectedClient({...selectedClient, maintenance_fee: Number(e.target.value)})}
                                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-mono text-black dark:text-white focus:border-black dark:focus:border-white outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 3. System Limits */}
                                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <Activity size={14} /> Neural Compute Limits
                                    </h3>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Monthly AI Tokens</label>
                                        <input 
                                            type="number" 
                                            value={selectedClient.tokens_limit || 0}
                                            onChange={(e) => setSelectedClient({...selectedClient, tokens_limit: Number(e.target.value)})}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm font-mono text-black dark:text-white focus:border-black dark:focus:border-white outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer / Actions */}
                            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-white/[0.02] flex justify-between items-center">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    Status: {selectedClient.is_active ? <span className="text-emerald-500">Live</span> : <span className="text-red-500">Suspended</span>}
                                </span>
                                
                                <button 
                                    onClick={saveConfiguration}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? <span className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" /> : <Save size={16} />}
                                    Deploy Config
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}