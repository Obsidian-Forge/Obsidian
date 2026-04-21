"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Layout, Zap, HardDrive, FileText, RefreshCw, Mail, X, Copy, Check } from 'lucide-react';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [liveLatency, setLiveLatency] = useState<number>(0);
  const [uptimePercentage, setUptimePercentage] = useState("100.00");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // SUPPORT MODAL STATE
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null); // Kopyalama efekti için state

  const measureRealLatency = useCallback(async () => {
    const start = performance.now();
    try { 
        await supabase.from('clients').select('id').limit(1); 
        setLiveLatency(Math.round(performance.now() - start)); 
    } catch (e) { 
        console.error("Latency check failed"); 
    }
  }, []);

  // SILENT POLLING MANTIĞI EKLENDİ (silent = true ise ekranı kaplamaz)
  const fetchData = useCallback(async (cId: string, silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [profileRes, deploymentsRes, logsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', cId).single(),
        supabase.from('deployments').select('*').eq('client_id', cId).order('created_at', { ascending: false }),
        supabase.from('incident_logs').select('*').order('created_at', { ascending: false }).limit(60)
      ]);
      
      if (profileRes.data) setClientProfile(profileRes.data);
      
      if (deploymentsRes.data) {
        const mapped = deploymentsRes.data.map(p => ({
          id: p.id, 
          name: p.project_name, 
          status: p.status, 
          progress_percent: p.progress || 0,
          updates: Array.isArray(p.client_logs) ? p.client_logs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []
        }));
        setProjects(mapped);
      }
      
      if (logsRes.data) {
        setSystemLogs(logsRes.data);
        const up = logsRes.data.filter((l: any) => l.status === 'operational').length;
        setUptimePercentage(((up / (logsRes.data.length || 1)) * 100).toFixed(2));
      }
      
      setLastUpdated(new Date());
    } catch (err) { 
        console.error(err);
    } finally { 
        if (!silent) setLoading(false);
        setIsRefreshing(false); 
    }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem('novatrum_client_id');
    if (!storedId) return router.push('/client/login');
    
    setClientId(storedId);
    
    // İlk yükleme (Tam sayfa loading)
    fetchData(storedId, false);
    measureRealLatency();
    
    // ARKAPLANDA CANLI SENKRONİZASYON (Her 10 Saniyede Bir)
    const interval = setInterval(() => { 
        fetchData(storedId, true); // silent = true
        measureRealLatency(); 
    }, 10000);
    
    const ping = setInterval(measureRealLatency, 5000);
    
    // Supabase Realtime (Eğer anlık bildirim gelirse)
    const channel = supabase.channel(`client_sync_${storedId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deployments', filter: `client_id=eq.${storedId}` }, () => fetchData(storedId, true))
      .subscribe();
      
    return () => { 
        clearInterval(ping); 
        clearInterval(interval); 
        supabase.removeChannel(channel); 
    };
  }, [fetchData, measureRealLatency, router]);

  useEffect(() => {
    const checkTheme = () => setIsDark(localStorage.getItem('novatrum_theme') === 'dark');
    checkTheme(); 
    window.addEventListener('theme-changed', checkTheme);
    return () => window.removeEventListener('theme-changed', checkTheme);
  }, []);

  // COPY FUNCTION
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000); // 2 saniye sonra tiki geri copy ikonuna çevir
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-400">Establishing Secure Link...</div>;

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-1000">
      
      {/* ---------------- SUPPORT MODAL (POPUP) ---------------- */}
      <AnimatePresence>
        {showSupportModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    className={`rounded-[32px] p-8 max-w-md w-full shadow-2xl border ${isDark ? 'bg-[#0A0A0A] border-zinc-800' : 'bg-white border-zinc-100'}`}
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className={`p-3 rounded-2xl ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`}>
                            <Mail size={24} />
                        </div>
                        <button onClick={() => setShowSupportModal(false)} className={`p-2 rounded-full transition-colors ${isDark ? 'text-zinc-500 hover:bg-zinc-800 hover:text-white' : 'text-zinc-400 hover:bg-zinc-100 hover:text-black'}`}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <h3 className={`text-xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        Engineering Support
                    </h3>
                    <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        Need assistance with your architecture, billing, or deployment nodes? Our engineering team is available to help. Please copy the relevant email address below to reach out.
                    </p>

                    <div className="space-y-3">
                        {/* TECHNICAL SUPPORT COPY BUTTON */}
                        <button 
                            onClick={() => handleCopyEmail('support@novatrum.eu')}
                            className={`w-full text-left group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'}`}
                        >
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Technical Support</span>
                                <span className={`text-[11px] font-mono mt-1 ${isDark ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-500 group-hover:text-zinc-700'}`}>support@novatrum.eu</span>
                            </div>
                            {copiedEmail === 'support@novatrum.eu' ? (
                                <Check size={16} className="text-emerald-500 transition-transform scale-110" />
                            ) : (
                                <Copy size={14} className={`transition-transform group-hover:scale-110 ${isDark ? 'text-zinc-600 group-hover:text-white' : 'text-zinc-400 group-hover:text-black'}`} />
                            )}
                        </button>
                        
                        {/* GENERAL & BILLING COPY BUTTON */}
                        <button 
                            onClick={() => handleCopyEmail('info@novatrum.eu')}
                            className={`w-full text-left group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-600' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'}`}
                        >
                            <div className="flex flex-col">
                                <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>General & Billing</span>
                                <span className={`text-[11px] font-mono mt-1 ${isDark ? 'text-zinc-500 group-hover:text-zinc-400' : 'text-zinc-500 group-hover:text-zinc-700'}`}>info@novatrum.eu</span>
                            </div>
                            {copiedEmail === 'info@novatrum.eu' ? (
                                <Check size={16} className="text-emerald-500 transition-transform scale-110" />
                            ) : (
                                <Copy size={14} className={`transition-transform group-hover:scale-110 ${isDark ? 'text-zinc-600 group-hover:text-white' : 'text-zinc-400 group-hover:text-black'}`} />
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
      {/* -------------------------------------------------------- */}

      <header className="mb-12 lg:mb-20">
        <div className="flex items-center justify-between mb-4">
          <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Authorization Node // {clientProfile?.company_name || 'Individual Entity'}
          </p>
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            {isRefreshing && <RefreshCw size={12} className="animate-spin text-emerald-500"/>}
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
        <h1 className={`text-4xl lg:text-7xl font-light tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Hello, <span className="font-medium">{clientProfile?.full_name?.split(' ')[0]}</span>.
        </h1>
      </header>

      <div className="grid grid-cols-12 gap-6 lg:gap-10">
        <div className="col-span-12 lg:col-span-8 space-y-12">
            
          <section className={`p-8 lg:p-12 rounded-[40px] border transition-all duration-500 relative overflow-hidden ${isDark ? 'bg-zinc-900/50 border-white/5 shadow-2xl' : 'bg-white border-black/[0.03] shadow-sm'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                    <ShieldCheck className="w-7 h-7" strokeWidth={1.5}/>
                </div>
                <div>
                    <h2 className={`text-2xl font-medium tracking-tight ${isDark ? 'text-white' : 'text-black'}`}>Sentinel Core</h2>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Real-time Infrastructure Guard</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                  <div className="flex items-baseline gap-2 justify-start md:justify-end">
                      <span className={`text-5xl font-light tracking-tighter font-mono ${isDark ? 'text-white' : 'text-black'}`}>{liveLatency}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">ms</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mt-1">Network Latency</p>
              </div>
            </div>
            
            <div className="flex items-end gap-1.5 h-20 w-full mb-10">
                {systemLogs.slice(0, 50).reverse().map((log, i) => (
                    <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${log.status === 'operational' ? (isDark ? 'bg-zinc-800 hover:bg-white' : 'bg-zinc-100 hover:bg-black') : 'bg-red-500 animate-pulse'}`} style={{ height: `${Math.max(15, (log.latency / 400) * 100)}%`}}/>
                ))}
            </div>
            
            <div className={`flex flex-col sm:flex-row justify-between items-center gap-6 pt-8 border-t ${isDark ? 'border-white/5' : 'border-black/[0.02]'}`}>
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">System Uptime</span>
                        <span className="text-xs font-bold text-emerald-500">{uptimePercentage}%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Security Layer</span>
                        <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-black'}`}>Active // Encrypted</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <Zap size={12} className="text-amber-500"/> Operational
                </div>
            </div>
          </section>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
                <h3 className={`text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Deployment Ledger 
                    {isRefreshing && <RefreshCw size={10} className="animate-spin text-emerald-500" />}
                </h3>
                <Layout size={16} className="text-zinc-300"/>
            </div>
            
            {projects.length === 0 ? (
                <div className={`p-16 rounded-[40px] border text-center border-dashed ${isDark ? 'bg-zinc-900/20 border-white/10' : 'bg-zinc-50/50 border-black/5'}`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No active project trajectories detected.</p>
                </div>
            ) : projects.map(project => (
              <section key={project.id} className={`p-8 lg:p-12 rounded-[40px] border transition-all duration-700 ${isDark ? 'bg-zinc-900/30 border-white/5 shadow-2xl' : 'bg-white border-black/[0.03] shadow-sm'}`}>
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <h4 className={`text-2xl lg:text-4xl font-light tracking-tighter mb-3 ${isDark ? 'text-white' : 'text-black'}`}>{project.name}</h4>
                         <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold font-mono tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>ID: {project.id.slice(0,8).toUpperCase()}</span>
                            <div className="w-1 h-1 rounded-full bg-zinc-300"/>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{project.status}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-3xl lg:text-5xl font-light font-mono ${isDark ? 'text-zinc-400' : 'text-black'}`}>{project.progress_percent}%</span>
                    </div>
                </div>
                
                <div className={`w-full h-[3px] rounded-full overflow-hidden mb-12 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress_percent}%` }} transition={{ duration: 2, ease: "circOut" }} className={`h-full ${isDark ? 'bg-emerald-400' : 'bg-black'}`} />
                </div>
                
                <div className="space-y-4">
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Recent Protocol Updates</p>
                    <div className="grid gap-3">
                        {project.updates.length > 0 ? project.updates.slice(0, 5).map((u: any, idx: number) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className={`p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDark ? 'bg-black/20 border-white/5' : 'bg-zinc-50/50 border-black/[0.01]'}`}>
                                 <p className={`text-[13px] font-medium leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{u.message}</p>
                                <span className="text-[9px] font-bold font-mono text-zinc-400 shrink-0 uppercase tracking-wider">{new Date(u.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                            </motion.div>
                        )) : (
                            <p className="text-xs text-zinc-500 italic px-2">Awaiting initial development logs...</p>
                        )}
                    </div>
                 </div>
              </section>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-10">
          
          {/* ENTITY VAULT KART */}
          <section className={`p-8 rounded-[32px] border transition-all duration-500 flex flex-col justify-between ${isDark ? 'bg-zinc-900/50 border-white/5 shadow-xl' : 'bg-white border-black/[0.03] shadow-sm'}`}>
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Entity Vault</h3>
                    <HardDrive size={16} className="text-zinc-400"/>
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    All your invoices, technical documents, and architectural assets are securely stored in your dedicated internal vault.
                </p>
            </div>
            
            <button 
                onClick={() => router.push('/client/vault')} 
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
            >
                Access Vault <HardDrive size={14}/>
            </button>
          </section>

          {/* SUPPORT TICKET KART */}
          <section className={`p-8 rounded-[32px] border transition-all duration-500 flex flex-col justify-between ${isDark ? 'bg-zinc-900/50 border-white/5 shadow-xl' : 'bg-white border-black/[0.03] shadow-sm'}`}>
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Support Ticket</h3>
                    <FileText size={16} className="text-zinc-400"/>
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Need assistance or have a billing inquiry? Reach out to our engineering team.
                </p>
            </div>
            
            <button 
                onClick={() => setShowSupportModal(true)} 
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all border ${isDark ? 'bg-transparent border-white/10 text-white hover:bg-white/5' : 'bg-zinc-50 border-zinc-200 text-zinc-900 hover:bg-zinc-100'}`}
            >
                Email Support
            </button>
          </section>

        </div>
      </div>
    </div>
  );
}