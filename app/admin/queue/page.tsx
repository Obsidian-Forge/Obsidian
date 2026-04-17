"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, Activity, Cpu, Server, CheckCircle2, XCircle, 
    Play, Square, RotateCw, Trash2, Terminal, AlertCircle, Zap
} from 'lucide-react';

export default function ActiveQueuePage() {
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [isQueuePaused, setIsQueuePaused] = useState(false);

    useEffect(() => {
        fetchData();
        // Gerçek zamanlı hissi vermek için her 5 saniyede bir veriyi yeniler (Opsiyonel)
        const interval = setInterval(() => {
            fetchData(false);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async (showLoader = true) => {
        if (showLoader) setLoading(true);
        try {
            const [jobsRes, clientsRes] = await Promise.all([
                // Müşteri isimlerini de tabloya join (bağlayarak) çekiyoruz
                supabase.from('system_jobs').select('*, clients(full_name, company_name)').order('created_at', { ascending: false }).limit(20),
                supabase.from('clients').select('id, full_name').is('archived_at', null)
            ]);

            if (jobsRes.data) setJobs(jobsRes.data);
            if (clientsRes.data) setClients(clientsRes.data);
        } catch (error) {
            console.error("Queue Sync Error:", error);
        } finally {
            if (showLoader) setLoading(false);
        }
    };

    // TEST AMAÇLI: Kuyruğa rastgele bir iş ekler
    const simulateNewJob = async () => {
        if (clients.length === 0) return alert("You need at least one active client to simulate a job.");
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const jobTypes = ['build', 'provision', 'migration', 'backup'];
        const jobNames = ['Deploying Neural Engine', 'Provisioning Sentinel Database', 'SSL Certificate Generation', 'Weekly Cold Backup'];
        const randIdx = Math.floor(Math.random() * jobTypes.length);

        await supabase.from('system_jobs').insert({
            client_id: randomClient.id,
            job_name: jobNames[randIdx],
            job_type: jobTypes[randIdx],
            status: 'pending',
            progress: 0
        });
        fetchData(false);
    };

    // JOB AKSİYONLARI
    const updateJobStatus = async (id: string, newStatus: string, progress: number = 0) => {
        const updateData: any = { status: newStatus, progress };
        if (newStatus === 'processing') updateData.started_at = new Date().toISOString();
        if (newStatus === 'completed' || newStatus === 'failed') updateData.completed_at = new Date().toISOString();

        // UI'ı anında güncelle (Optimistic UI)
        setJobs(jobs.map(j => j.id === id ? { ...j, ...updateData } : j));
        
        await supabase.from('system_jobs').update(updateData).eq('id', id);
    };

    const deleteJob = async (id: string) => {
        setJobs(jobs.filter(j => j.id !== id));
        await supabase.from('system_jobs').delete().eq('id', id);
    };

    // Metrikler
    const processingJobs = jobs.filter(j => j.status === 'processing');
    const pendingJobs = jobs.filter(j => j.status === 'pending');
    const completedJobs = jobs.filter(j => j.status === 'completed');

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-zinc-400 animate-pulse">Syncing Task Pipeline...</div>;

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20 font-sans">
            
            {/* HEADER */}
            <header className="mb-6 lg:mb-10 px-2 lg:px-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-light tracking-tighter text-zinc-900 dark:text-white mb-2">
                        Active Queue
                    </h1>
                    <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        Real-time task processing and deployment pipeline
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsQueuePaused(!isQueuePaused)} className={`px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${isQueuePaused ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' : 'bg-white text-zinc-600 border-zinc-200 dark:bg-transparent dark:border-white/10 dark:text-zinc-400'}`}>
                        {isQueuePaused ? <><Play size={12}/> Resume Pipeline</> : <><Square size={12}/> Pause Queue</>}
                    </button>
                    <button onClick={simulateNewJob} className="bg-black dark:bg-white text-white dark:text-black px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-md flex items-center gap-2">
                        <Zap size={12} /> Simulate Task
                    </button>
                </div>
            </header>

            {/* METRICS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 px-2 lg:px-0">
                <div className="bg-white dark:bg-[#111] p-6 rounded-[24px] lg:rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shrink-0">
                        <Activity size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Active Workers</p>
                        <p className="text-2xl font-light tracking-tight text-zinc-900 dark:text-white">{processingJobs.length} <span className="text-xs text-zinc-500">/ 4 Nodes</span></p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111] p-6 rounded-[24px] lg:rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Pending Tasks</p>
                        <p className="text-2xl font-light tracking-tight text-zinc-900 dark:text-white">{pendingJobs.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111] p-6 rounded-[24px] lg:rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/5 flex items-center justify-center text-zinc-500 shrink-0">
                        <Server size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Total Processed</p>
                        <p className="text-2xl font-light tracking-tight text-zinc-900 dark:text-white">{completedJobs.length}</p>
                    </div>
                </div>
            </div>

            {/* MAIN PIPELINE AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-2 lg:px-0">
                
                {/* LEFT: THE QUEUE LIST */}
                <div className="lg:col-span-8 bg-white dark:bg-[#111] rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="px-6 lg:px-8 py-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
                        <h2 className="text-lg font-light tracking-tight text-zinc-900 dark:text-white">Task Execution Line</h2>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isQueuePaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{isQueuePaused ? 'Halted' : 'Processing'}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-4">
                        {jobs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 pt-10">
                                <CheckCircle2 size={40} className="text-zinc-300 mb-4" strokeWidth={1} />
                                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Queue is empty.</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">All systems idle and operational.</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {jobs.map(job => (
                                    <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className={`p-5 rounded-[20px] border transition-all ${
                                            job.status === 'processing' ? 'bg-white dark:bg-[#151515] border-indigo-200 dark:border-indigo-900/50 shadow-md ring-4 ring-indigo-50 dark:ring-indigo-900/20' :
                                            job.status === 'failed' ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' :
                                            'bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                {/* STATUS ICON */}
                                                <div className="mt-1 shrink-0">
                                                    {job.status === 'processing' && <RotateCw size={18} className="text-indigo-500 animate-spin" />}
                                                    {job.status === 'pending' && <Clock size={18} className="text-zinc-400" />}
                                                    {job.status === 'completed' && <CheckCircle2 size={18} className="text-emerald-500" />}
                                                    {job.status === 'failed' && <XCircle size={18} className="text-red-500" />}
                                                </div>
                                                
                                                {/* JOB DETAILS */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 dark:border-white/10 px-2 py-0.5 rounded-md bg-white dark:bg-black">
                                                            {job.job_type}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500 font-mono">ID: {job.id.slice(0,8)}</span>
                                                    </div>
                                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">{job.job_name}</h3>
                                                    <p className="text-xs text-zinc-500 mt-1">Target: <span className="font-medium text-zinc-700 dark:text-zinc-300">{job.clients?.full_name || 'System'}</span> {job.clients?.company_name ? `(${job.clients.company_name})` : ''}</p>
                                                </div>
                                            </div>

                                            {/* ACTIONS & PROGRESS */}
                                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto">
                                                {job.status === 'processing' ? (
                                                    <div className="w-full sm:w-32 flex flex-col items-end gap-1">
                                                        <span className="text-[10px] font-bold text-indigo-500 font-mono">{job.progress}%</span>
                                                        <div className="w-full h-1.5 bg-indigo-100 dark:bg-indigo-950 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${job.progress}%` }} />
                                                        </div>
                                                        <button onClick={() => updateJobStatus(job.id, 'completed', 100)} className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 hover:text-emerald-500 mt-2">Force Complete</button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        {job.status === 'pending' && (
                                                            <button onClick={() => updateJobStatus(job.id, 'processing', 25)} className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-lg hover:scale-105 transition-transform">Run</button>
                                                        )}
                                                        {job.status === 'failed' && (
                                                            <button onClick={() => updateJobStatus(job.id, 'pending', 0)} className="px-3 py-1.5 bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition-colors">Retry</button>
                                                        )}
                                                        {(job.status === 'pending' || job.status === 'completed' || job.status === 'failed') && (
                                                            <button onClick={() => deleteJob(job.id)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14}/></button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                {/* RIGHT: SERVER LOGS & NODE STATUS */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Node Status Widget */}
                    <div className="bg-zinc-900 dark:bg-black p-6 lg:p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Cpu size={14}/> Compute Nodes</h2>
                        <div className="space-y-4 relative z-10">
                            {[1, 2, 3, 4].map((node) => (
                                <div key={node} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${node === 1 && processingJobs.length > 0 ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-600'}`} />
                                        <span className="text-xs font-mono text-zinc-300">Node_0{node}</span>
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                        {node === 1 && processingJobs.length > 0 ? 'Allocated' : 'Idle'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Terminal / Live Logs Widget */}
                    <div className="bg-zinc-50 dark:bg-[#111] p-6 lg:p-8 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[300px] flex flex-col">
                        <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2"><Terminal size={14}/> Execution Logs</h2>
                        <div className="flex-1 bg-black rounded-[20px] p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto custom-scrollbar leading-relaxed">
                            <p className="text-zinc-500 mb-2">Novatrum Daemon v2.1.4</p>
                            <p className="text-zinc-500 mb-4">Establishing secure connection...</p>
                            {jobs.slice(0,5).map(j => (
                                <div key={j.id} className="mb-2">
                                    <span className="text-zinc-500">[{new Date(j.created_at).toLocaleTimeString()}]</span> 
                                    <span className="text-indigo-400 ml-2">sys.{j.job_type}:</span> 
                                    <span className="ml-2 text-zinc-300">{j.status === 'processing' ? 'Executing' : j.status === 'completed' ? 'Success' : j.status === 'failed' ? 'ERR_HALTED' : 'Queued'}</span> 
                                    <span className="ml-2">({j.id.slice(0,6)})</span>
                                </div>
                            ))}
                            <div className="mt-4 flex items-center gap-2 opacity-50">
                                <span className="w-1.5 h-3 bg-emerald-400 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}