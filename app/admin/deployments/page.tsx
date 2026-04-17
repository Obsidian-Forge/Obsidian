"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Rocket, Box, Terminal, Server, CheckCircle2, Clock, 
    Activity, XCircle, Play, Square, RotateCw, Trash2, 
    Zap, Plus, X, Search, ChevronRight
} from 'lucide-react';

type TabType = 'projects' | 'queue';

export default function DeploymentsHubPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('projects');
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Data States
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    
    // UI States
    const [isQueuePaused, setIsQueuePaused] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);

    // New Deployment Form
    const [deployForm, setDeployForm] = useState({
        clientId: '',
        projectName: '',
        status: 'Planning'
    });

    useEffect(() => {
        fetchAllData();
        // Kuyruk sekmesi için her 5 saniyede bir sessizce yenileme
        const interval = setInterval(() => {
            fetchJobsOnly();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [clientsRes, projectsRes, jobsRes] = await Promise.all([
                supabase.from('clients').select('id, full_name, company_name').is('archived_at', null).order('full_name'),
                supabase.from('projects').select('*, clients(full_name, company_name)').order('created_at', { ascending: false }),
                supabase.from('system_jobs').select('*, clients(full_name, company_name)').order('created_at', { ascending: false }).limit(20)
            ]);

            if (clientsRes.data) setClients(clientsRes.data);
            if (projectsRes.data) setProjects(projectsRes.data);
            if (jobsRes.data) setJobs(jobsRes.data);
            
            // Drawer için varsayılan müşteri
            if (clientsRes.data && clientsRes.data.length > 0) {
                setDeployForm(prev => ({ ...prev, clientId: clientsRes.data[0].id }));
            }
        } catch (error) {
            showToast("Failed to sync deployment data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchJobsOnly = async () => {
        const { data } = await supabase.from('system_jobs').select('*, clients(full_name, company_name)').order('created_at', { ascending: false }).limit(20);
        if (data) setJobs(data);
    };

    // YENİ PROJE BAŞLATMA (PROJE + KUYRUK ENTEGRASYONU)
    const handleInitializeDeployment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!deployForm.clientId || !deployForm.projectName) return;
        setIsDeploying(true);

        try {
            // 1. Projeyi Oluştur
            const { error: projError } = await supabase.from('projects').insert({
                client_id: deployForm.clientId,
                name: deployForm.projectName,
                status: deployForm.status,
                progress_percent: 0
            });
            if (projError) throw projError;

            // 2. Queue'ya (Kuyruğa) "Provisioning" görevi ekle (Sistemin canlı hissettirmesi için)
            await supabase.from('system_jobs').insert({
                client_id: deployForm.clientId,
                job_name: `Provisioning Base Architecture for ${deployForm.projectName}`,
                job_type: 'provision',
                status: 'pending',
                progress: 0
            });

            showToast("Deployment Initialized. Task added to Queue.", "success");
            setIsDrawerOpen(false);
            setDeployForm(prev => ({ ...prev, projectName: '', status: 'Planning' }));
            
            fetchAllData();
            setActiveTab('queue'); // Başarılı olunca Queue sekmesine at ki animasyonu görsün!
        } catch (err: any) {
            showToast(err.message, "error");
        } finally {
            setIsDeploying(false);
        }
    };

    // QUEUE (KUYRUK) AKSİYONLARI
    const updateJobStatus = async (id: string, newStatus: string, progress: number = 0) => {
        const updateData: any = { status: newStatus, progress };
        if (newStatus === 'processing') updateData.started_at = new Date().toISOString();
        if (newStatus === 'completed' || newStatus === 'failed') updateData.completed_at = new Date().toISOString();

        setJobs(jobs.map(j => j.id === id ? { ...j, ...updateData } : j)); // Optimistic UI update
        await supabase.from('system_jobs').update(updateData).eq('id', id);
    };

    const deleteJob = async (id: string) => {
        setJobs(jobs.filter(j => j.id !== id));
        await supabase.from('system_jobs').delete().eq('id', id);
    };

    const simulateNewJob = async () => {
        if (clients.length === 0) return alert("No active clients found.");
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        const jobTypes = ['build', 'migration', 'backup'];
        const jobNames = ['Deploying Neural Engine', 'SSL Certificate Generation', 'Weekly Cold Backup'];
        const randIdx = Math.floor(Math.random() * jobTypes.length);

        await supabase.from('system_jobs').insert({
            client_id: randomClient.id,
            job_name: jobNames[randIdx],
            job_type: jobTypes[randIdx],
            status: 'pending',
            progress: 0
        });
        fetchJobsOnly();
    };

    // Proje durumu güncelleme
    const updateProjectProgress = async (id: string, progress: number, status: string) => {
        setProjects(projects.map(p => p.id === id ? { ...p, progress_percent: progress, status } : p));
        await supabase.from('projects').update({ progress_percent: progress, status }).eq('id', id);
    };

    const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.clients?.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Queue Metrikleri
    const processingJobs = jobs.filter(j => j.status === 'processing');
    const pendingJobs = jobs.filter(j => j.status === 'pending');
    const completedJobs = jobs.filter(j => j.status === 'completed');

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-zinc-400 animate-pulse">Syncing Deployment Hub...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20 font-sans">
            
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-black text-white border-white/10 dark:bg-white dark:text-black'}`}>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 lg:px-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900 dark:text-white">Deployments Hub</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Projects and background task execution pipeline</p>
                </div>
                <button onClick={() => setIsDrawerOpen(true)} className="bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                    <Rocket size={16} /> New Deployment
                </button>
            </div>

            {/* TABS & SEARCH */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/5 pb-4 px-2 lg:px-0">
                <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl w-fit">
                    <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'projects' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                        <Box size={14}/> Active Projects
                    </button>
                    <button onClick={() => setActiveTab('queue')} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'queue' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                        <Terminal size={14}/> Live Queue {processingJobs.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"/>}
                    </button>
                </div>
                
                {activeTab === 'projects' && (
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                        <input type="text" placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-black dark:focus:border-white transition-all" />
                    </div>
                )}
                
                {activeTab === 'queue' && (
                    <div className="flex gap-2">
                        <button onClick={() => setIsQueuePaused(!isQueuePaused)} className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${isQueuePaused ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-zinc-600 border-zinc-200 dark:bg-transparent dark:border-white/10 dark:text-zinc-400'}`}>
                            {isQueuePaused ? <><Play size={12}/> Resume</> : <><Square size={12}/> Pause Queue</>}
                        </button>
                        <button onClick={simulateNewJob} className="bg-white dark:bg-[#111] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors flex items-center gap-2">
                            <Zap size={12} /> Simulate Task
                        </button>
                    </div>
                )}
            </div>

            {/* TAB CONTENT: PROJECTS */}
            {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2 lg:px-0">
                    {filteredProjects.length === 0 ? (
                        <div className="col-span-full py-20 text-center border border-dashed rounded-[32px] border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02]">
                            <Box size={40} className="mx-auto text-zinc-300 mb-4" strokeWidth={1}/>
                            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No active projects found.</p>
                        </div>
                    ) : (
                        filteredProjects.map(project => (
                            <div key={project.id} className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
                                <div className="mb-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400">
                                            <Rocket size={20} strokeWidth={1.5} />
                                        </div>
                                        <span className={`px-3 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest border ${
                                            project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20' : 
                                            project.status === 'Development' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20' : 
                                            'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-white/5 dark:text-zinc-400'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight mb-1">{project.name}</h3>
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{project.clients?.full_name} {project.clients?.company_name ? `(${project.clients.company_name})` : ''}</p>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Build Progress</span>
                                        <span className="text-sm font-mono font-bold dark:text-white">{project.progress_percent}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${project.progress_percent === 100 ? 'bg-emerald-500' : 'bg-black dark:bg-white'}`} style={{ width: `${project.progress_percent}%` }} />
                                    </div>
                                    
                                    {/* Hızlı Güncelleme Butonları (Hover olunca çıkar) */}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => updateProjectProgress(project.id, 50, 'Development')} className="flex-1 py-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 dark:bg-white/5 rounded-lg hover:text-black dark:hover:text-white transition-colors">Dev (50%)</button>
                                        <button onClick={() => updateProjectProgress(project.id, 100, 'Completed')} className="flex-1 py-2 text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors">Complete</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB CONTENT: LIVE QUEUE */}
            {activeTab === 'queue' && (
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
                                                    <div className="mt-1 shrink-0">
                                                        {job.status === 'processing' && <RotateCw size={18} className="text-indigo-500 animate-spin" />}
                                                        {job.status === 'pending' && <Clock size={18} className="text-zinc-400" />}
                                                        {job.status === 'completed' && <CheckCircle2 size={18} className="text-emerald-500" />}
                                                        {job.status === 'failed' && <XCircle size={18} className="text-red-500" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 dark:border-white/10 px-2 py-0.5 rounded-md bg-white dark:bg-black">{job.job_type}</span>
                                                            <span className="text-[10px] text-zinc-500 font-mono">ID: {job.id.slice(0,8)}</span>
                                                        </div>
                                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">{job.job_name}</h3>
                                                        <p className="text-xs text-zinc-500 mt-1">Target: <span className="font-medium text-zinc-700 dark:text-zinc-300">{job.clients?.full_name || 'System'}</span></p>
                                                    </div>
                                                </div>

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
                                                            {job.status === 'pending' && <button onClick={() => updateJobStatus(job.id, 'processing', 25)} className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-widest rounded-lg hover:scale-105 transition-transform">Run</button>}
                                                            {job.status === 'failed' && <button onClick={() => updateJobStatus(job.id, 'pending', 0)} className="px-3 py-1.5 bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-black hover:text-white transition-colors">Retry</button>}
                                                            {(job.status === 'pending' || job.status === 'completed' || job.status === 'failed') && <button onClick={() => deleteJob(job.id)} className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={14}/></button>}
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

                        <div className="bg-zinc-50 dark:bg-[#111] p-6 lg:p-8 rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[300px] flex flex-col">
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2"><Terminal size={14}/> Execution Logs</h2>
                            <div className="flex-1 bg-black rounded-[20px] p-4 font-mono text-[10px] text-emerald-400 overflow-y-auto custom-scrollbar leading-relaxed">
                                <p className="text-zinc-500 mb-2">Novatrum Daemon v2.1.4</p>
                                <p className="text-zinc-500 mb-4">Establishing secure connection...</p>
                                {jobs.slice(0,6).map(j => (
                                    <div key={j.id} className="mb-2">
                                        <span className="text-zinc-500">[{new Date(j.created_at).toLocaleTimeString()}]</span> 
                                        <span className="text-indigo-400 ml-2">sys.{j.job_type}:</span> 
                                        <span className="ml-2 text-zinc-300">{j.status === 'processing' ? 'Executing' : j.status === 'completed' ? 'Success' : j.status === 'failed' ? 'ERR_HALTED' : 'Queued'}</span> 
                                    </div>
                                ))}
                                <div className="mt-4 flex items-center gap-2 opacity-50">
                                    <span className="w-1.5 h-3 bg-emerald-400 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* NEW DEPLOYMENT DRAWER (SLIDE-OUT) */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#111] shadow-2xl z-[110] flex flex-col border-l border-zinc-200 dark:border-white/10">
                            <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-zinc-50/50 dark:bg-black/20">
                                <div>
                                    <h2 className="text-2xl font-light tracking-tight dark:text-white">Initialize Project</h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Setup architecture and enqueue task</p>
                                </div>
                                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"><X size={20}/></button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                                <form id="deployForm" onSubmit={handleInitializeDeployment} className="space-y-6">
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Target Entity (Client) *</label>
                                        <select required value={deployForm.clientId} onChange={e => setDeployForm({...deployForm, clientId: e.target.value})} className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-5 py-4 rounded-2xl text-sm outline-none focus:border-black dark:focus:border-white dark:text-white cursor-pointer">
                                            {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} {c.company_name ? `(${c.company_name})` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Deployment Name *</label>
                                        <input required value={deployForm.projectName} onChange={e => setDeployForm({...deployForm, projectName: e.target.value})} type="text" placeholder="e.g. Nexus E-Commerce" className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-5 py-4 rounded-2xl text-sm outline-none focus:border-black dark:focus:border-white dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Initial Phase</label>
                                        <div className="flex flex-col gap-2">
                                            {['Planning', 'Design', 'Development'].map(status => (
                                                <button key={status} type="button" onClick={() => setDeployForm({...deployForm, status})} className={`p-4 rounded-2xl border text-left transition-all flex justify-between items-center ${deployForm.status === status ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white' : 'border-zinc-200 dark:border-white/10 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5'}`}>
                                                    <span className="text-[11px] font-bold uppercase tracking-widest">{status}</span>
                                                    {deployForm.status === status && <CheckCircle2 size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1"><Server size={12}/> Auto-Provisioning</p>
                                        <p className="text-xs text-emerald-800 dark:text-emerald-500">Creating this project will automatically push an initialization task to the Live Queue.</p>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-6 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-black/20 flex justify-end gap-3 shrink-0">
                                <button type="submit" form="deployForm" disabled={isDeploying || clients.length === 0} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50 flex items-center justify-center gap-2">
                                    {isDeploying ? <span className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" /> : <><Rocket size={14}/> Execute Deployment</>}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </div>
    );
}