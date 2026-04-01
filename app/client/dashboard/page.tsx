'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientDashboardPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [clientId, setClientId] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);
    const [systemLogs, setSystemLogs] = useState<any[]>([]);
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSlaExpanded, setIsSlaExpanded] = useState(false);
    const [timers, setTimers] = useState<{ [key: string]: any }>({});
    const [liveLatency, setLiveLatency] = useState<number>(0);

    const router = useRouter();
    const isDark = theme === 'dark';

    // 1. DATA FETCHING (MERKEZİ VERİ ÇEKME)
    const fetchData = useCallback(async (cId: string) => {
        try {
            const [profileRes, projectsRes, statusRes, filesRes, invRes, logsRes] = await Promise.all([
                supabase.from('clients').select('*').eq('id', cId).single(),
                supabase.from('projects').select('*, project_updates(*)').eq('client_id', cId).order('created_at', { ascending: false }),
                supabase.from('system_status').select('*').order('label'),
                supabase.from('client_files').select('*').eq('client_id', cId).order('created_at', { ascending: false }),
                supabase.from('client_invoices').select('*').eq('client_id', cId).order('created_at', { ascending: false }),
                supabase.from('incident_logs').select('*').order('created_at', { ascending: false }).limit(60)
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
            if (logsRes.data) {
                setSystemLogs(logsRes.data);
                const avg = Math.round(logsRes.data.reduce((acc: number, curr: any) => acc + (curr.latency || 0), 0) / logsRes.data.length);
                setLiveLatency(avg || 135);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. AUTH, POLLING & REALTIME ENTEGRASYONU
    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        if (!storedId) {
            router.push('/client/login');
            return;
        }
        setClientId(storedId);
        
        // İlk yükleme
        fetchData(storedId);

        // Arka plan yedeklemesi (Polling)
        const pollInterval = setInterval(() => {
            fetchData(storedId);
        }, 15000); 

        // --- YENİ: SUPABASE REALTIME (Anında Canlı Güncelleme) ---
        const channel = supabase
            .channel('client_live_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'projects', filter: `client_id=eq.${storedId}` },
                (payload) => {
                    console.log("Live Project Update Detected!", payload);
                    fetchData(storedId);
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'project_updates' },
                () => fetchData(storedId)
            )
            .subscribe();

        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(channel);
        };
    }, [fetchData, router]);

    // 3. SAYAÇ & CANLI GECİKME EFEKTİ
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

    useEffect(() => {
        const latencyInterval = setInterval(() => {
            setLiveLatency(prev => {
                if (prev === 0) return 0;
                const jitter = Math.floor(Math.random() * 5) - 2; 
                return Math.max(15, prev + jitter); 
            });
        }, 3000);
        return () => clearInterval(latencyInterval);
    }, []);

    const handleLogout = () => {
        document.cookie = "novatrum_client_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
        localStorage.removeItem('novatrum_client_id');
        localStorage.removeItem('novatrum_client_name');
        router.push('/client/login');
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('novatrum_theme', newTheme);
        document.documentElement.classList.toggle('dark');
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // İSTATİSTİKLER VE GRAFİK VERİLERİ
    const chartLogs = [...systemLogs].reverse().slice(-40);
    const maxLatency = chartLogs.length > 0 ? Math.max(...chartLogs.map(l => l.latency || 100), 200) : 200;
    const avgLatency = systemLogs.length > 0 ? Math.round(systemLogs.reduce((acc, curr) => acc + (curr.latency || 0), 0) / systemLogs.length) : 0;
    const uptimePercentage = systemLogs.length > 0 
        ? ((systemLogs.filter(l => l.status === 'operational').length / systemLogs.length) * 100).toFixed(2) 
        : "100.00";
    const isSystemDown = systemStatuses.some(s => s.status === 'down');

    // SLA PDF OLUŞTURUCU (Orijinal haliyle korundu)
    const generateSlaPdf = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Please allow pop-ups to generate the PDF report.");
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Novatrum SLA Report - ${clientProfile?.company_name || 'Client'}</title>
                <style>
                    body { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 40px; color: #000; max-width: 800px; margin: 0 auto; }
                    .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
                    .logo { font-size: 24px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; }
                    .title { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #666; margin-top: 10px; }
                    .metrics-grid { display: flex; justify-content: space-between; margin-bottom: 40px; border: 1px solid #eaeaea; border-radius: 16px; padding: 24px; }
                    .metric-box { text-align: left; }
                    .metric-value { font-size: 36px; font-weight: 900; color: #10b981; }
                    .metric-value.down { color: #ef4444; }
                    .metric-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #666; margin-top: 8px; }
                    .log-table { width: 100%; text-align: left; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                    .log-table th { padding: 12px 8px; border-bottom: 1px solid #000; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
                    .log-table td { padding: 12px 8px; border-bottom: 1px solid #eaeaea; }
                    .status-operational { color: #10b981; font-weight: 700; }
                    .status-degraded { color: #f59e0b; font-weight: 700; }
                    .status-down { color: #ef4444; font-weight: 700; }
                    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo">NOVATRUM</div>
                    <div class="title">Infrastructure Health & SLA Report // ${clientProfile?.company_name || 'Client Workspace'}</div>
                </div>

                <div class="metrics-grid">
                    <div class="metric-box">
                        <div class="metric-value ${parseFloat(uptimePercentage) < 99 ? 'down' : ''}">${uptimePercentage}%</div>
                        <div class="metric-label">SLA Uptime Guarantee</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value" style="color: #000;">${avgLatency}ms</div>
                        <div class="metric-label">Average Latency</div>
                    </div>
                    <div class="metric-box">
                        <div class="metric-value ${isSystemDown ? 'down' : ''}" style="font-size: 18px; margin-top: 12px;">
                            ${isSystemDown ? 'MAJOR OUTAGE' : 'STABLE'}
                        </div>
                        <div class="metric-label">Current Status</div>
                    </div>
                </div>

                <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Recent Incident Logs (Last 40 Checks)</h3>
                <table class="log-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Status</th>
                            <th>Latency</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${chartLogs.length > 0 ? chartLogs.map(log => `
                            <tr>
                                <td>${new Date(log.created_at).toLocaleString()}</td>
                                <td class="status-${log.status}">${log.status.toUpperCase()}</td>
                                <td>${log.latency}ms</td>
                            </tr>
                        `).join('') : '<tr><td colspan="3">No logs available.</td></tr>'}
                    </tbody>
                </table>

                <div class="footer">
                    Generated automatically by Novatrum Infrastructure Systems on ${new Date().toLocaleString()}
                </div>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    if (loading) return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-zinc-950 text-white' : 'bg-white text-black'}`}>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mt-6">Synchronizing Infrastructure...</p>
        </div>
    );

    return (
        <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-emerald-500/30 relative overflow-x-hidden ${isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-black'}`}>
            
            {/* YENİ: FÜTÜRİSTİK BLUEPRINT (TEKNİK ÇİZİM) ARKA PLANI */}
            <div className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-500 ${isDark ? 'opacity-10' : 'opacity-40'}`}>
                <div className={`absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent_100%)] ${isDark ? 'bg-[linear-gradient(#3f3f46_1px,transparent_1px),linear-gradient(90deg,#3f3f46_1px,transparent_1px)]' : 'bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)]'}`} />
            </div>

            {/* YENİ: VERTICAL FLOATING ISLAND (SABİT ADA) */}
            <div className={`fixed right-6 top-1/2 -translate-y-1/2 z-[100] backdrop-blur-xl border shadow-2xl rounded-full py-8 px-3 flex flex-col items-center gap-6 transition-all duration-500 ${isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-zinc-200'}`}>
                
                {/* Node Status */}
                <div className="relative group cursor-pointer flex flex-col items-center">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                    <div className={`absolute right-full mr-4 top-1/2 -translate-y-1/2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-2 shadow-xl ${isDark ? 'bg-white text-black' : 'bg-[#0A0A0A] text-white'}`}>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Connection: Secure
                    </div>
                </div>

                <div className={`w-4 h-[1px] ${isDark ? 'bg-zinc-800' : 'bg-black/10'}`} />

                {/* SUPPORT BUTONU */}
                <button onClick={() => router.push('/client/support')} className="group flex flex-col items-center gap-4 outline-none">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${isDark ? 'bg-zinc-800 text-zinc-300 group-hover:bg-white group-hover:text-black' : 'bg-white border border-zinc-200 text-black group-hover:bg-black group-hover:text-white'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 pt-2 ${isDark ? 'text-zinc-500 group-hover:text-white' : 'text-zinc-500 group-hover:text-black'}`} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Support
                    </span>
                </button>

                <div className={`w-4 h-[1px] ${isDark ? 'bg-zinc-800' : 'bg-black/10'}`} />

                {/* DISCONNECT BUTONU */}
                <button onClick={handleLogout} className="group flex flex-col items-center gap-4 outline-none">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${isDark ? 'bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white' : 'bg-red-50 text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7"></path></svg>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors duration-300 pt-2 ${isDark ? 'text-zinc-600 group-hover:text-red-500' : 'text-zinc-400 group-hover:text-red-600'}`} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Disconnect
                    </span>
                </button>
            </div>

            {/* ANA İÇERİK */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-10 md:py-16 mr-[80px] md:mr-auto">
                
                {/* HEADER BÖLÜMÜ */}
                <div className="flex items-center justify-between mb-20 gap-4">
                    <img src="/logo.png" alt="Logo" className={`h-8 w-auto object-contain transition-all duration-300 ${isDark ? 'invert' : ''}`} />
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className={`p-3 rounded-2xl transition-all shadow-sm border ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-500 hover:text-black'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isDark ? "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" : "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"}></path></svg>
                        </button>
                    </div>
                </div>

                <div className="mb-12">
                    <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Authorized Entity</p>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">{clientProfile?.full_name.split(' ')[0]}</h2>
                    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border transition-colors ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{clientProfile?.company_name || 'Secure Workspace'}</span>
                    </div>
                </div>

                {/* İSTATİSTİKLER VE SLA BÖLÜMÜ */}
                <div className={`transition-all duration-500 rounded-[32px] md:rounded-[40px] border mb-16 shadow-sm relative overflow-hidden ${isDark ? 'bg-zinc-900/90 backdrop-blur-xl border-zinc-800' : 'bg-white/90 backdrop-blur-xl border-zinc-200'} ${isSlaExpanded ? 'p-8 md:p-10' : 'p-0'}`}>
                    
                    {!isSlaExpanded && (
                        <div className="flex items-center justify-between gap-4 h-16 px-6 md:px-8 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors" onClick={() => setIsSlaExpanded(true)}>
                            <div className="flex items-center gap-3 shrink-0">
                                <div className={`w-2 h-2 rounded-full ${isSystemDown ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
                                <span className={`text-[11px] font-black uppercase tracking-widest ${parseFloat(uptimePercentage) < 99 ? 'text-amber-500' : 'text-emerald-500'}`}>{uptimePercentage}% UPTIME</span>
                            </div>
                            <div className="flex items-center gap-0.5 flex-1 h-3.5 relative hidden sm:flex">
                                {chartLogs.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold uppercase tracking-widest text-zinc-400">Loading Data...</div>
                                ) : (
                                    chartLogs.map((log, i) => (
                                        <div key={i} className={`h-full flex-1 rounded-sm ${log.status === 'down' ? 'bg-red-500' : log.status === 'degraded' || (log.latency && log.latency > 500) ? 'bg-amber-400' : 'bg-emerald-400'}`} title={`Latency: ${log.latency}ms`} />
                                    ))
                                )}
                            </div>
                            <button className={`flex items-center gap-2 p-2 rounded-xl transition-colors shrink-0 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
                                <span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Diagnostics</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                        </div>
                    )}

                    <AnimatePresence>
                        {isSlaExpanded && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} className="overflow-hidden">
                                <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-8 mb-10">
                                    <div>
                                        <div className="flex items-center gap-4 mb-4">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Infrastructure Health Report</h3>
                                            <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2.5 ${isSystemDown ? 'bg-red-500/10 border-red-500/20' : (isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100')}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${isSystemDown ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${isSystemDown ? 'text-red-500' : (isDark ? 'text-zinc-300' : 'text-zinc-700')}`}>{isSystemDown ? 'Major Outage' : 'Stable'}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
                                            <div>
                                                <span className={`text-5xl md:text-6xl font-black tracking-tighter ${parseFloat(uptimePercentage) < 99 ? 'text-amber-500' : 'text-emerald-500'}`}>{uptimePercentage}%</span>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">SLA Uptime Guarantee</p>
                                            </div>
                                            <div>
                                                <span className={`text-3xl md:text-4xl font-black tracking-tighter font-mono ${isDark ? 'text-white' : 'text-black'}`}>{liveLatency}ms</span>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Live Latency</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 items-end">
                                        <button onClick={generateSlaPdf} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-colors bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            Download SLA PDF
                                        </button>
                                        <button onClick={() => setIsSlaExpanded(false)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-colors ${isDark ? 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-400' : 'bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-500'}`}>
                                            Hide Details
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path></svg>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Network Latency & Incident Timeline (Last Checks)</p>
                                    <div className="flex items-end gap-1 md:gap-1.5 h-32 w-full pt-4 border-b border-dashed border-zinc-200 dark:border-zinc-800 relative">
                                        {chartLogs.length === 0 ? (
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">Awaiting Log Data...</div>
                                        ) : (
                                            chartLogs.map((log, i) => {
                                                const heightPercentage = Math.max(10, ((log.latency || 10) / maxLatency) * 100);
                                                let barColor = 'bg-emerald-400 dark:bg-emerald-500/80';
                                                if (log.status === 'degraded' || (log.latency && log.latency > 500)) barColor = 'bg-amber-400 dark:bg-amber-500/80';
                                                if (log.status === 'down') barColor = 'bg-red-500 dark:bg-red-500/80';
                                                return (
                                                    <div key={i} title={`Time: ${new Date(log.created_at).toLocaleTimeString()} | Latency: ${log.latency}ms | Status: ${log.status.toUpperCase()}`} className={`flex-1 rounded-t-sm hover:opacity-70 transition-opacity cursor-crosshair ${barColor}`} style={{ height: `${heightPercentage}%` }} />
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                    
                    {/* SOL SÜTUN: INVOICES & VAULT */}
                    <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
                        <div className={`p-8 rounded-[32px] border transition-colors ${isDark ? 'bg-zinc-900/90 backdrop-blur-xl border-zinc-800' : 'bg-white/90 backdrop-blur-xl border-zinc-200 shadow-sm'}`}>
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
                                                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest mr-3 border ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{inv.status}</span>
                                                <span className={`text-[10px] font-bold truncate max-w-[100px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{inv.file_name}</span>
                                            </div>
                                            <a href={inv.file_url} target="_blank" rel="noreferrer" className={`text-[9px] font-black uppercase hover:underline ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}>View</a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className={`p-8 rounded-[32px] border transition-colors ${isDark ? 'bg-zinc-900/90 backdrop-blur-xl border-zinc-800' : 'bg-white/90 backdrop-blur-xl border-zinc-200 shadow-sm'}`}>
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

                    {/* SAĞ SÜTUN: PROJECT TRACKING (REALTIME) */}
                    <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
                        {projects.length === 0 ? (
                            <div className={`p-10 md:p-14 rounded-[40px] border border-dashed text-center flex flex-col items-center justify-center min-h-[500px] ${isDark ? 'bg-zinc-900/30 backdrop-blur-xl border-zinc-800' : 'bg-white/50 backdrop-blur-xl border-zinc-200'}`}>
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
                                    <div key={project.id} className={`p-8 md:p-12 rounded-[40px] border transition-colors ${isDark ? 'bg-zinc-900/90 backdrop-blur-xl border-zinc-800' : 'bg-white/90 backdrop-blur-xl border-zinc-200 shadow-sm'}`}>
                                        
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12 border-b pb-8 border-zinc-200 dark:border-zinc-800">
                                            <div>
                                                <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{project.name}</h3>
                                                <p className={`text-[10px] font-black font-mono uppercase tracking-[0.3em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Ref: {project.id.split('-')[0].toUpperCase()}</p>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <div className={`inline-block px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest border mb-3 ${isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-black'}`}>
                                                    Phase: {project.status}
                                                </div>
                                                <p className={`text-3xl font-black font-mono tracking-tighter ${timer?.active ? 'text-emerald-500' : isDark ? 'text-white' : 'text-black'}`}>
                                                    {formatTime(timer?.displayTime || 0)}
                                                </p>
                                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-1">Engineering Time</p>
                                            </div>
                                        </div>

                                        <div className={`p-6 md:p-8 rounded-[32px] border mb-12 ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-100'}`}>
                                            <div className="flex justify-between mb-4 items-end">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Architecture Load</span>
                                                <span className="text-2xl font-black font-mono">{project.progress_percent}%</span>
                                            </div>
                                            <div className={`w-full h-1.5 rounded-full overflow-hidden mb-8 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress_percent}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`} />
                                            </div>
                                            
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Provisioning Servers & Initial Setup', threshold: 20 },
                                                    { label: 'Building Database & Core Architecture', threshold: 50 },
                                                    { label: 'Deploying SSL & Security Layers', threshold: 80 },
                                                    { label: 'Finalizing Operational Node', threshold: 100 }
                                                ].map((step, idx) => (
                                                    <div key={idx} className="flex items-center gap-4">
                                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-500 ${project.progress_percent >= step.threshold ? 'bg-emerald-500 border-emerald-500' : isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-300'}`}>
                                                            {project.progress_percent >= step.threshold && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                        </div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${project.progress_percent >= step.threshold ? isDark ? 'text-white' : 'text-black' : 'text-zinc-400'}`}>{step.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-8">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Deployment Ledger</h4>
                                                <span className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">System Logs</span>
                                            </div>
                                            <div className="space-y-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                                                {project.project_updates?.map((u: any, index: number) => (
                                                    <div key={u.id} className={`p-6 rounded-[24px] border transition-colors shrink-0 ${index === 0 ? (isDark ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-zinc-300 shadow-sm') : (isDark ? 'bg-zinc-950 border-zinc-800 opacity-60' : 'bg-zinc-50 border-zinc-100 opacity-70')}`}>
                                                        <div className="flex flex-col gap-3">
                                                            <p className={`text-sm font-bold leading-relaxed ${u.message.includes('APPROVED') ? 'text-emerald-500' : isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>{u.message}</p>
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

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${isDark ? '#3f3f46' : '#e4e4e7'}; border-radius: 20px; }
            `}} />
        </div>
    );
}