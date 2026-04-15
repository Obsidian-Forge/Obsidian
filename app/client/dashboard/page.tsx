'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, ChevronRight, Download, FileText, Box, Clock } from 'lucide-react';

export default function ClientDashboardPage() {
    const [clientId, setClientId] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [systemLogs, setSystemLogs] = useState<any[]>([]);
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(false);
    const [liveLatency, setLiveLatency] = useState<number>(0);
    const [uptimePercentage, setUptimePercentage] = useState("100.00");

    const router = useRouter();

    const measureRealLatency = useCallback(async () => {
        const start = performance.now();
        try {
            await supabase.from('system_status').select('id').limit(1);
            const end = performance.now();
            setLiveLatency(Math.round(end - start));
        } catch (e) {
            console.error("Latency measurement failed");
        }
    }, []);

    const generateSlaPdf = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return alert("Please allow pop-ups for reports.");

        const htmlContent = `
            <html>
            <head>
                <title>Novatrum SLA Report - ${clientProfile?.company_name}</title>
                <style>
                    body { font-family: sans-serif; padding: 50px; color: #000; line-height: 1.6; }
                    .header { border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
                    .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                    .metric-box { border: 1px solid #eee; padding: 20px; border-radius: 12px; }
                    .value { font-size: 24px; font-weight: bold; color: #10b981; }
                </style>
            </head>
            <body>
                <div class="header"><h1>NOVATRUM</h1><p>Infrastructure Diagnostics // ${new Date().toLocaleString()}</p></div>
                <div class="metric-grid">
                    <div class="metric-box"><div class="value">${uptimePercentage}%</div><div>Uptime</div></div>
                    <div class="metric-box"><div class="value">${liveLatency}ms</div><div>Latency</div></div>
                    <div class="metric-box"><div class="value">Stable</div><div>Status</div></div>
                </div>
            </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 500);
    };

    const fetchData = useCallback(async (cId: string) => {
        try {
            const [profileRes, projectsRes, filesRes, invRes, logsRes] = await Promise.all([
                supabase.from('clients').select('*').eq('id', cId).single(),
                supabase.from('projects').select('*, project_updates(*)').eq('client_id', cId).order('created_at', { ascending: false }),
                supabase.from('client_files').select('*').eq('client_id', cId).order('created_at', { ascending: false }),
                supabase.from('client_invoices').select('*').eq('client_id', cId).neq('status', 'draft').order('created_at', { ascending: false }),
                supabase.from('incident_logs').select('*').order('created_at', { ascending: false }).limit(60)
            ]);

            if (profileRes.data) setClientProfile(profileRes.data);
            if (projectsRes.data) {
                setProjects(projectsRes.data.map(p => ({
                    ...p,
                    project_updates: p.project_updates ? p.project_updates.sort((a:any, b:any) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    ) : []
                })));
            }
            if (filesRes.data) setClientFiles(filesRes.data);
            if (invRes.data) setClientInvoices(invRes.data);
            if (logsRes.data) {
                setSystemLogs(logsRes.data);
                const upCount = logsRes.data.filter((l:any) => l.status === 'operational').length;
                setUptimePercentage(((upCount / logsRes.data.length) * 100).toFixed(2));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        if (!storedId) return router.push('/client/login');
        setClientId(storedId);
        fetchData(storedId);
        measureRealLatency();
        const pingInterval = setInterval(measureRealLatency, 5000);
        const channel = supabase.channel('dashboard_sync').on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates' }, () => fetchData(storedId)).subscribe();
        return () => { clearInterval(pingInterval); supabase.removeChannel(channel); };
    }, [fetchData, measureRealLatency, router]);

    useEffect(() => {
        const checkTheme = () => setIsDark(localStorage.getItem('novatrum_theme') === 'dark');
        checkTheme();
        window.addEventListener('theme-changed', checkTheme);
        return () => window.removeEventListener('theme-changed', checkTheme);
    }, []);

    if (loading) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-700">
            
            {/* WELCOME HEADER */}
            <header className="mb-10 lg:mb-16">
                <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.4em] mb-3 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Authorization Node // {clientProfile?.company_name}
                </p>
                <h1 className={`text-3xl lg:text-6xl font-light tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
                    Hello, <span className="font-medium">{clientProfile?.full_name.split(' ')[0]}</span>.
                </h1>
            </header>

            <div className="grid grid-cols-12 gap-6 lg:gap-10">
                
                {/* LEFT COLUMN: SENTINEL & LEDGER */}
                <div className="col-span-12 lg:col-span-8 space-y-8 lg:space-y-12">
                    
                    {/* SENTINEL PANEL */}
                    <section className={`p-6 lg:p-10 rounded-[32px] lg:rounded-[40px] border transition-all duration-500 relative overflow-hidden
                        ${isDark ? 'bg-zinc-900/50 border-white/5 shadow-2xl' : 'bg-white border-black/[0.03] shadow-sm'}`}>
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
                            <div className="flex items-center gap-4 lg:gap-5">
    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-xl
        ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
        {/* Responsive boyutu className ile verdik */}
        <ShieldCheck className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={1.5} />
    </div>
    <div>
        <h2 className={`text-xl lg:text-2xl font-medium tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Novatrum Sentinel
        </h2>
        <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
            Active Infrastructure Guard
        </p>
    </div>
</div>
                            <div className="text-left md:text-right">
                                <div className="flex items-baseline gap-2 justify-start md:justify-end">
                                    <span className={`text-3xl lg:text-5xl font-light tracking-tighter font-mono ${isDark ? 'text-white' : 'text-black'}`}>{liveLatency}</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase">ms</span>
                                </div>
                                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-emerald-500 mt-1">Real-time Ping</p>
                            </div>
                        </div>

                        {/* Canlı Grafik - Mobilde daha az bar gösterimi */}
                        <div className="flex items-end gap-1 h-16 lg:h-20 w-full mb-8">
                            {systemLogs.slice(0, typeof window !== 'undefined' && window.innerWidth < 768 ? 25 : 50).reverse().map((log, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 rounded-full ${log.status === 'operational' ? (isDark ? 'bg-zinc-800 hover:bg-emerald-500' : 'bg-zinc-100 hover:bg-emerald-400') : 'bg-red-500'} transition-all`}
                                    style={{ height: `${Math.max(10, (log.latency / 300) * 100)}%` }}
                                />
                            ))}
                        </div>

                        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6 border-t ${isDark ? 'border-white/5' : 'border-black/[0.02]'}`}>
                            <div className="flex items-center gap-4 lg:gap-6">
                                <div className="flex flex-col">
                                    <span className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Uptime</span>
                                    <span className="text-[10px] lg:text-[11px] font-bold text-emerald-500">{uptimePercentage}%</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Protocol</span>
                                    <span className={`text-[10px] lg:text-[11px] font-bold ${isDark ? 'text-white' : 'text-black'}`}>TLS 1.3 / Neural</span>
                                </div>
                            </div>
                            <button onClick={generateSlaPdf} className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group transition-all ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}>
                                Diagnostics Report <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </section>

                    {/* DEPLOYMENT LEDGER */}
                    <div className="space-y-6">
                        <h3 className={`text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.3em] px-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Deployment Ledger</h3>
                        {projects.map(project => (
                            <section key={project.id} className={`p-6 lg:p-10 rounded-[32px] lg:rounded-[40px] border transition-all duration-500
                                ${isDark ? 'bg-zinc-900/30 border-white/5' : 'bg-white border-black/[0.03] shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="max-w-[70%]">
                                        <h4 className={`text-2xl lg:text-3xl font-light tracking-tighter mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{project.name}</h4>
                                        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                                            <span className={`text-[8px] lg:text-[9px] font-bold font-mono tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>REF: {project.id.slice(0,8).toUpperCase()}</span>
                                            <span className="text-[9px] lg:text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{project.status}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-2xl lg:text-4xl font-light font-mono ${isDark ? 'text-zinc-300' : 'text-black'}`}>{project.progress_percent}%</span>
                                    </div>
                                </div>
                                <div className={`w-full h-[2px] rounded-full overflow-hidden mb-8 ${isDark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress_percent}%` }} transition={{ duration: 1.5 }} className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`} />
                                </div>
                                <div className="space-y-3 lg:space-y-4">
                                    <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Latest Activity</p>
                                    {project.project_updates?.slice(0, 3).map((u: any) => (
                                        <div key={u.id} className={`p-4 lg:p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3
                                            ${isDark ? 'bg-black/20 border-white/5' : 'bg-zinc-50/50 border-black/[0.01]'}`}>
                                            <p className={`text-[12px] lg:text-[13px] font-medium leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{u.message}</p>
                                            <span className="text-[9px] font-bold font-mono text-zinc-400 shrink-0 uppercase">{new Date(u.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: VAULT & BILLING (Mobilde en alta kayar) */}
                <div className="col-span-12 lg:col-span-4 space-y-6 lg:space-y-10">
                    <section className={`p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border transition-all duration-500
                        ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-black/[0.03] shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Secure Vault</h3>
                            <Box size={14} className="text-zinc-300" />
                        </div>
                        <div className="space-y-2 lg:space-y-3">
                            {clientFiles.map(file => (
                                <div key={file.id} className={`flex items-center justify-between p-3.5 lg:p-4 rounded-xl border group transition-all
                                    ${isDark ? 'bg-black/20 border-white/5' : 'bg-zinc-50/50 border-transparent hover:border-black/5'}`}>
                                    <span className={`text-[10px] lg:text-[11px] font-bold truncate max-w-[150px] ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>{file.file_name}</span>
                                    <a href={file.file_url} target="_blank" className={`p-2 rounded-lg ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-400 hover:text-black'}`}>
                                        <Download size={14} />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={`p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] border transition-all duration-500
                        ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-black/[0.03] shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Billing Node</h3>
                            <FileText size={14} className="text-zinc-300" />
                        </div>
                        <div className="space-y-2 lg:space-y-3">
                            {clientInvoices.map(inv => (
                                <div key={inv.id} className={`flex items-center justify-between p-3.5 lg:p-4 rounded-xl border group transition-all
                                    ${isDark ? 'bg-black/20 border-white/5' : 'bg-zinc-50/50 border-transparent hover:border-black/5'}`}>
                                    <div className="flex items-center gap-2 lg:gap-3">
                                        <div className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full ${inv.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span className={`text-[10px] lg:text-[11px] font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>{inv.file_name}</span>
                                    </div>
                                    <a href={inv.file_url} target="_blank" className={`text-[8px] lg:text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}>View</a>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}