'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ClientDashboardPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Tema Ayarları
    useEffect(() => {
        const storedTheme = localStorage.getItem('novatrum_theme') as 'light' | 'dark';
        if (storedTheme === 'dark') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('novatrum_theme', newTheme);
        
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const isDark = theme === 'dark';

    // Veri Stateleri
    const [clientId, setClientId] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Sayaç State'i
    const [timers, setTimers] = useState<{ [key: string]: { active: boolean; sessionStart: number | null; totalElapsed: number; displayTime: number } }>({});
    
    const router = useRouter();

    // Güvenli Çıkış (Çerezi temizler)
    const handleLogout = () => {
        document.cookie = "novatrum_client_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
        localStorage.removeItem('novatrum_client_id');
        localStorage.removeItem('novatrum_client_name');
        router.push('/client/login');
    };

    // Auto-Logout
    useEffect(() => {
        let inactivityTimer: NodeJS.Timeout;
        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => handleLogout(), 15 * 60 * 1000);
        };
        const events = ['mousemove', 'keydown', 'scroll', 'click'];
        events.forEach(e => window.addEventListener(e, resetTimer));
        
        resetTimer();
        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, []);

    // Kimliği Al ve Veriyi Çek
    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        if (!storedId) {
            router.push('/client/login');
            return;
        }
        setClientId(storedId);
        fetchData(storedId);
    }, [router]);

    // Gerçek Zamanlı Dinleyici (Realtime)
    useEffect(() => {
        if (!clientId) return;

        const channel = supabase.channel('client-realtime-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData(clientId))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates' }, () => fetchData(clientId))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, () => fetchData(clientId))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_files' }, () => fetchData(clientId))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_invoices' }, () => fetchData(clientId))
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [clientId]);

    // Sayaç Senkronizasyonu
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => {
                const next = { ...prev };
                let changed = false;
                for (const id in next) {
                    if (next[id].active && next[id].sessionStart) {
                        const now = Math.floor(Date.now() / 1000);
                        next[id].displayTime = next[id].totalElapsed + (now - next[id].sessionStart!);
                        changed = true;
                    }
                }
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (cId: string) => {
        const [profileRes, projectsRes, statusRes, filesRes, invRes] = await Promise.all([
            supabase.from('clients').select('*').eq('id', cId).single(),
            supabase.from('projects').select('*, project_updates(*)').eq('client_id', cId).order('created_at', { ascending: false }),
            supabase.from('system_status').select('*').order('label'),
            supabase.from('client_files').select('*').eq('client_id', cId).order('created_at', { ascending: false }),
            supabase.from('client_invoices').select('*').eq('client_id', cId).order('created_at', { ascending: false })
        ]);

        if (profileRes.data) setClientProfile(profileRes.data);
        if (projectsRes.data) {
            const sortedProjects = projectsRes.data.map(p => ({
                ...p,
                project_updates: p.project_updates ? p.project_updates.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []
            }));
            setProjects(sortedProjects);

            const newTimers: any = {};
            sortedProjects.forEach(p => {
                const dbActive = p.last_timer_start !== null;
                const sessionStart = dbActive ? Math.floor(new Date(p.last_timer_start).getTime() / 1000) : null;
                const totalElapsed = p.total_time_spent || 0;
                const displayTime = dbActive ? totalElapsed + (Math.floor(Date.now() / 1000) - sessionStart!) : totalElapsed;
                newTimers[p.id] = { active: dbActive, sessionStart, totalElapsed, displayTime };
            });
            setTimers(newTimers);
        }

        if (statusRes.data) setSystemStatuses(statusRes.data);
        if (filesRes.data) setClientFiles(filesRes.data);
        if (invRes.data) setClientInvoices(invRes.data);
        
        setLoading(false);
    };

    const formatTime = (seconds: number) => {
        if (!seconds) return '0h 0m 0s';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'operational': return 'text-emerald-500';
            case 'degraded': return 'text-amber-500';
            case 'down': return 'text-red-500 animate-pulse';
            default: return 'text-zinc-500';
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center font-mono ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-black'}`}>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mb-6 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Synchronizing Infrastructure...</p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-emerald-500/30 ${isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-black'}`}>
            
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-16">
                
                {/* ÜST NAVİGASYON */}
                <div className="flex items-center justify-between mb-20 gap-4">
                    <img 
                        src="/logo.png" 
                        alt="Novatrum Logo" 
                        className={`h-8 w-auto object-contain transition-all duration-300 ${isDark ? 'invert' : 'invert-0'}`} 
                    />
                    
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme} 
                            aria-label="Toggle dark mode"
                            className={`p-3 rounded-2xl transition-all shadow-sm border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-black'}`}
                        >
                            {isDark ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                            )}
                        </button>
                        <button onClick={() => router.push('/client/support')} className={`hidden md:flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${isDark ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white' : 'bg-white border-zinc-200 hover:bg-zinc-100 text-black'}`}>
                            Support Desk
                        </button>
                        <button onClick={handleLogout} className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-xl ${isDark ? 'bg-white text-black hover:bg-zinc-200 shadow-white/10' : 'bg-black text-white hover:bg-zinc-800 shadow-black/20'}`}>
                            Disconnect
                        </button>
                    </div>
                </div>

                {/* KİMLİK BİLGİSİ */}
                <div className="mb-16">
                    <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Authorized Entity
                    </p>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">{clientProfile?.full_name.split(' ')[0]}</h2>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {clientProfile?.company_name || 'Secure Workspace'}
                        </span>
                    </div>
                </div>

                {/* SİSTEM DURUMLARI */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {systemStatuses.map(status => (
                        <div key={status.id} className={`p-6 rounded-[24px] border transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                            <p className={`text-[9px] font-black uppercase tracking-widest mb-3 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{status.label}</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${status.status === 'operational' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : status.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${getStatusStyle(status.status)}`}>{status.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                    
                    {/* SOL PANEL: DOSYALAR & FATURALAR */}
                    <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
                        
                        {/* FATURALAR */}
                        <div className={`p-8 rounded-[32px] border transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ledger & Invoices</h3>
                            </div>
                            <div className="space-y-3">
                                {clientInvoices.length === 0 ? (
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 py-8 text-center border border-dashed rounded-2xl border-zinc-200 dark:border-zinc-800">No invoices generated.</p>
                                ) : (
                                    clientInvoices.map(inv => (
                                        <div key={inv.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                                            <div className="flex items-center">
                                                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest mr-3 border ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                    {inv.status}
                                                </span>
                                                <span className={`text-[10px] font-bold truncate max-w-[100px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{inv.file_name}</span>
                                            </div>
                                            <a href={inv.file_url} target="_blank" rel="noreferrer" className={`text-[9px] font-black uppercase hover:underline ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}>View</a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* KASA (VAULT) */}
                        <div className={`p-8 rounded-[32px] border transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Secure Vault</h3>
                            </div>
                            <div className="space-y-3">
                                {clientFiles.length === 0 ? (
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 py-8 text-center border border-dashed rounded-2xl border-zinc-200 dark:border-zinc-800">Vault is empty.</p>
                                ) : (
                                    clientFiles.map(file => (
                                        <div key={file.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                                            <span className={`text-[10px] font-bold truncate max-w-[150px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{file.file_name}</span>
                                            <a href={file.file_url} target="_blank" rel="noreferrer" className={`text-[9px] font-black uppercase hover:underline ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}>Download</a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SAĞ PANEL: PROJELER (ARCHITECTURE) */}
                    <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
                        {projects.length === 0 ? (
                            <div className={`p-10 md:p-14 rounded-[40px] border border-dashed text-center flex flex-col items-center justify-center min-h-[500px] ${isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-zinc-50/50 border-zinc-200'}`}>
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mb-6" />
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Environment Initializing</h3>
                                <p className={`text-xs font-bold leading-relaxed max-w-sm ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    Your dedicated workspace has been authorized. Our engineering team is currently provisioning your project architecture. Updates will appear here shortly.
                                </p>
                            </div>
                        ) : (
                            projects.map(project => {
                                const timer = timers[project.id];
                                return (
                                    <div key={project.id} className={`p-8 md:p-12 rounded-[40px] border transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}>
                                        
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 border-b pb-8 border-zinc-200 dark:border-zinc-800">
                                            <div>
                                                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{project.name}</h3>
                                                <p className={`text-[10px] font-black font-mono uppercase tracking-[0.3em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Ref: {project.id.split('-')[0].toUpperCase()}</p>
                                            </div>
                                            <div className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-black'}`}>
                                                Phase: {project.status}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                            {/* YÜKLEME ÇUBUĞU */}
                                            <div className={`p-6 md:p-8 rounded-[32px] border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6">Architecture Load</p>
                                                <div className="flex items-end gap-3 mb-4">
                                                    <span className="text-4xl font-black font-mono">{project.progress_percent}%</span>
                                                </div>
                                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                                                    <motion.div 
                                                        initial={{ width: 0 }} 
                                                        animate={{ width: `${project.progress_percent}%` }} 
                                                        transition={{ duration: 1.5, ease: "easeOut" }} 
                                                        className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`} 
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* SAYAÇ */}
                                            <div className={`p-6 md:p-8 rounded-[32px] border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                                                <div className="flex justify-between items-start mb-6">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Engineering Time</p>
                                                    {timer?.active && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                                                </div>
                                                <p className={`text-4xl font-black font-mono tracking-tighter ${timer?.active ? 'text-emerald-500' : isDark ? 'text-white' : 'text-black'}`}>
                                                    {formatTime(timer?.displayTime || 0)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* GÜNLÜK (LEDGER) */}
                                        <div>
                                            <div className="flex items-center justify-between mb-8">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Deployment Ledger</h4>
                                                <span className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">System Logs</span>
                                            </div>
                                            
                                            <div className="space-y-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                                                {project.project_updates?.map((u: any, index: number) => (
                                                    <div key={u.id} className={`p-6 rounded-[24px] border transition-colors shrink-0 ${index === 0 ? (isDark ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-zinc-300 shadow-sm') : (isDark ? 'bg-zinc-950 border-zinc-800 opacity-60' : 'bg-zinc-50 border-zinc-100 opacity-70')}`}>
                                                        <div className="flex flex-col gap-3">
                                                            <p className={`text-sm font-bold leading-relaxed ${u.message.includes('APPROVED') ? 'text-emerald-500' : isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>
                                                                {u.message}
                                                            </p>
                                                            <div className="flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                                                <span className="text-[9px] font-black font-mono uppercase tracking-widest text-zinc-400">{formatDate(u.created_at)}</span>
                                                                <span className="text-[9px] font-black font-mono uppercase tracking-widest text-zinc-500">Load: {u.progress_at_time}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!project.project_updates || project.project_updates.length === 0) && (
                                                    <div className="py-10 text-center border border-dashed rounded-[24px] border-zinc-200 dark:border-zinc-800">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Waiting for initial log entry...</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                <footer className="mt-32 text-center text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">
                    Novatrum // Infrastructure Operational
                </footer>
            </motion.div>

        </div>
    );
}