"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ClientDashboardPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]); 
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState<string | null>(null); 
    const [timers, setTimers] = useState<{ [key: string]: { active: boolean; sessionStart: number | null; displayTime: number } }>({});

    const router = useRouter();

    const fetchSystemStatus = async () => {
        const { data } = await supabase.from('system_status').select('*').order('label');
        if (data) setSystemStatuses(data);
    };

    const fetchProjects = async (clientId: string) => {
        const { data, error } = await supabase
            .from('projects')
            .select('*, project_updates!project_updates_project_id_fkey (*)')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setProjects(data.map(p => ({
                ...p,
                project_updates: p.project_updates.sort((a: any, b: any) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
            })));

            const newTimers: any = {};
            data.forEach(p => {
                const dbActive = p.last_timer_start !== null;
                if (dbActive) {
                    const sessionStart = Math.floor(new Date(p.last_timer_start).getTime() / 1000);
                    const displayTime = Math.floor(Date.now() / 1000) - sessionStart;
                    newTimers[p.id] = { active: true, sessionStart, displayTime };
                } else {
                    newTimers[p.id] = { active: false, sessionStart: null, displayTime: 0 };
                }
            });
            setTimers(newTimers);
        }
    };

    const fetchClientProfile = async (clientId: string) => {
        const { data } = await supabase.from('clients').select('*').eq('id', clientId).single();
        if (data) setClientProfile(data);
    };

    const fetchClientFiles = async (clientId: string) => {
        const { data } = await supabase.from('client_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (data) setClientFiles(data);
    };

    const fetchClientInvoices = async (clientId: string) => {
        const { data } = await supabase.from('client_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (data) setClientInvoices(data);
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push('/client/login');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'operational': return 'bg-emerald-500';
            case 'degraded': return 'bg-yellow-400';
            case 'partial': return 'bg-orange-500';
            case 'down': return 'bg-red-600';
            default: return 'bg-zinc-300';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const formatTimeDisplay = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m ${s}s`;
    };

    const handleApproveProject = async (projectId: string, projectName: string) => {
        if (!confirm("Are you sure you want to approve this stage?")) return;
        setApproving(projectId);
        try {
            await supabase.from('project_updates').insert({
                project_id: projectId,
                message: `✅ CLIENT APPROVED: Stage reviewed and approved by ${clientName}.`,
                progress_at_time: projects.find(p => p.id === projectId)?.progress_percent || 0
            });
            alert("Stage approved successfully.");
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setApproving(null);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => {
                const next = { ...prev };
                let changed = false;
                for (const id in next) {
                    if (next[id].active && next[id].sessionStart) {
                        const now = Math.floor(Date.now() / 1000);
                        next[id].displayTime = now - next[id].sessionStart!;
                        changed = true;
                    }
                }
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        const storedName = localStorage.getItem('novatrum_client_name');
        if (!storedId) return router.push('/client/login');

        setClientName(storedName || 'Valued Client');

        Promise.all([
            fetchProjects(storedId),
            fetchSystemStatus(),
            fetchClientProfile(storedId),
            fetchClientFiles(storedId),
            fetchClientInvoices(storedId)
        ]).then(() => setLoading(false));

        const statusChannel = supabase.channel('client-status-sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_status' }, () => { fetchSystemStatus(); }).subscribe();
        const logsChannel = supabase.channel('client-logs-sync').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_updates' }, () => { fetchProjects(storedId); }).subscribe();
        const projectsChannel = supabase.channel('client-projects-sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, () => { fetchProjects(storedId); }).subscribe();
        
        const authChannel = supabase.channel('client-auth-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clients', filter: `id=eq.${storedId}` }, (payload) => {
                if (payload.new.archived_at !== null) { alert("⚠️ Access Revoked."); handleLogout(); }
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'clients', filter: `id=eq.${storedId}` }, () => { handleLogout(); })
            .subscribe();

        const filesChannel = supabase.channel('client-files-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'client_files', filter: `client_id=eq.${storedId}` }, () => { fetchClientFiles(storedId); }).subscribe();
        const invoicesChannel = supabase.channel('client-invoices-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'client_invoices', filter: `client_id=eq.${storedId}` }, () => { fetchClientInvoices(storedId); }).subscribe();

        return () => {
            supabase.removeChannel(statusChannel);
            supabase.removeChannel(logsChannel);
            supabase.removeChannel(projectsChannel);
            supabase.removeChannel(authChannel);
            supabase.removeChannel(filesChannel);
            supabase.removeChannel(invoicesChannel);
        };
    }, [router]);

    if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-black uppercase text-xs text-zinc-400">Node Accessing...</div>;

    const isAnyTimerActive = projects.some(p => timers[p.id]?.active);

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-black p-6 md:p-8 pt-10 md:pt-16 pb-24 font-sans overflow-x-hidden">
            <div className="max-w-6xl mx-auto">

                {/* HEADER */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 gap-6 w-full">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Deployment Hub</span>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Client Portal</h1>
                        <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mt-2">Identity: <span className="text-black">{clientName}</span></p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                        {isAnyTimerActive && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm mr-2 animate-in fade-in zoom-in duration-500">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <span className="text-[9px] font-black uppercase tracking-widest">Admin Working Now</span>
                            </div>
                        )}
                        <button onClick={() => router.push('/client/support')} className="bg-white border border-zinc-200 text-[10px] font-black uppercase tracking-widest px-5 py-3.5 rounded-xl hover:opacity-80 transition-all shadow-sm">Support</button>
                        <button onClick={() => router.push('/client/settings')} className="bg-white border border-zinc-200 text-[10px] font-black uppercase tracking-widest px-5 py-3.5 rounded-xl hover:opacity-80 transition-all shadow-sm">Settings</button>
                        <button onClick={handleLogout} className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-5 py-3.5 rounded-xl shadow-lg active:scale-95 transition-all">Disconnect</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* ENTITY INFO */}
                    <div className="bg-white border border-zinc-200 p-8 md:p-10 rounded-[40px] shadow-sm flex flex-col">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">Entity Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                            <div className="sm:col-span-2">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Full Name</p>
                                <p className="text-sm font-black uppercase mt-1">{clientProfile?.full_name}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Email</p>
                                <p className="text-xs font-bold break-all mt-1">{clientProfile?.email}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Company</p>
                                <p className="text-xs font-bold mt-1">{clientProfile?.company_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Phone</p>
                                <p className="text-xs font-bold mt-1">{clientProfile?.phone_number || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Address</p>
                                <p className="text-xs font-bold mt-1 line-clamp-2">{clientProfile?.address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* BILLING & ASSET VAULT */}
                    <div className="space-y-8 flex flex-col">
                        {/* INVOICES */}
                        <div className="bg-white border border-zinc-200 p-8 rounded-[40px] shadow-sm flex-1 flex flex-col min-h-[200px]">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Billing & Invoices</h2>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {clientInvoices.length === 0 ? (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center py-6">No invoices issued.</p>
                                ) : (
                                    clientInvoices.map(inv => (
                                        <div key={inv.id} className="bg-zinc-50 border border-zinc-100 flex items-center justify-between p-4 rounded-2xl group transition-all">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'}`}>
                                                    {inv.status}
                                                </span>
                                                <span className="text-xs font-bold truncate max-w-[120px]" title={inv.file_name}>{inv.file_name}</span>
                                            </div>
                                            <a href={inv.file_url} target="_blank" rel="noreferrer" className="bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shrink-0">Download</a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* ASSET VAULT */}
                        <div className="bg-white border border-zinc-200 p-8 rounded-[40px] shadow-sm flex-1 flex flex-col min-h-[200px]">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Secure Asset Vault</h2>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {clientFiles.length === 0 ? (
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center py-6">No documents found.</p>
                                ) : (
                                    clientFiles.map(file => (
                                        <div key={file.id} className="bg-zinc-50 border border-zinc-100 flex items-center justify-between p-4 rounded-2xl group transition-all">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="bg-white border border-zinc-200 w-8 h-8 rounded-xl flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <span className="text-xs font-bold truncate max-w-[150px]" title={file.file_name}>{file.file_name}</span>
                                            </div>
                                            <a href={file.file_url} target="_blank" rel="noreferrer" className="bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shrink-0">Open</a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SYSTEM STATUS */}
                <div className="flex flex-wrap gap-4 mb-16 justify-start">
                    {systemStatuses.map((s) => (
                        <div key={s.id} className="bg-white border border-zinc-200 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-sm">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{s.label}</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[8px] font-bold uppercase tracking-widest ${s.status === 'operational' ? 'text-emerald-500' : s.status === 'degraded' ? 'text-yellow-500' : 'text-red-500'}`}>{s.status}</span>
                                <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(s.status)} ${s.status !== 'operational' ? 'animate-pulse shadow-[0_0_8px_currentColor]' : ''}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* PROJECTS */}
                <div className="grid gap-10">
                    {projects.map((project) => {
                        const needsApproval = project.status === 'Testing' && project.progress_percent >= 90;
                        const timer = timers[project.id] || { active: false, displayTime: 0 };
                        const totalProjectTime = (project.total_time_spent || 0) + timer.displayTime;

                        return (
                            <div key={project.id} className={`bg-white border p-8 md:p-12 rounded-[40px] shadow-sm transition-all duration-500 relative overflow-hidden ${timer.active ? 'border-emerald-500' : 'border-zinc-200'}`}>
                                {timer.active && <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500 animate-pulse" />}
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                    <div>
                                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">{project.name}</h2>
                                        <p className="text-[10px] font-bold uppercase mt-2 tracking-widest text-zinc-400">Deployment ID: {project.id.slice(0, 8)}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="bg-black text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl tracking-widest">{project.status}</span>
                                        {needsApproval && (
                                            <button onClick={() => handleApproveProject(project.id, project.name)} className="bg-emerald-500 text-white text-[10px] font-black uppercase px-6 py-3 rounded-xl tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-600 transition-colors active:scale-95 disabled:opacity-50">Approve Stage</button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                                    <div className="flex-1 w-full space-y-4">
                                        <div className="flex justify-between items-end font-mono">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Infrastructure Core</span>
                                            <span className="text-4xl font-black text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">%{project.progress_percent}</span>
                                        </div>
                                        <div className="h-4 w-full bg-zinc-200 rounded-full overflow-hidden shadow-inner">
                                            <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out relative" style={{ width: `${project.progress_percent}%` }}>
                                                 <div className="absolute top-0 right-0 bottom-0 w-6 bg-white/30 blur-[2px]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-6 items-center">
                                        <div className="text-center sm:text-left">
                                            <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-zinc-400">Total Invested</p>
                                            <p className="text-2xl font-black font-mono">{formatTimeDisplay(totalProjectTime)}</p>
                                        </div>
                                        {timer.active ? (
                                            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-5">
                                                <div className="text-right">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 mb-1">Current Session</p>
                                                    <p className="text-xl font-black font-mono text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
                                                        {formatTimeDisplay(timer.displayTime)}
                                                    </p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse shrink-0">
                                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-right">
                                                <span className="bg-white border border-zinc-200 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm text-zinc-400">Status: Idle</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-12 pt-10 border-t border-zinc-100">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-zinc-400">System Logs</h3>
                                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-6">
                                        {project.project_updates?.map((u: any) => (
                                            <div key={u.id} className="border-l-2 border-zinc-100 relative pl-8 py-1">
                                                <div className={`absolute -left-[7px] top-2 w-3 h-3 border-2 border-white rounded-full ${u.message.includes('APPROVED') ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                                                <div className="flex flex-col md:flex-row justify-between gap-2 md:items-center">
                                                    <p className={`text-sm font-bold leading-relaxed ${u.message.includes('APPROVED') ? 'text-emerald-600' : 'text-zinc-800'}`}>
                                                        {u.message}
                                                    </p>
                                                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-zinc-400">{formatDate(u.created_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {(!project.project_updates || project.project_updates.length === 0) && (
                                            <p className="text-[10px] font-bold italic uppercase tracking-widest text-zinc-400">Waiting for initial log entry...</p>
                                        )}
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>

                <footer className="mt-32 text-center text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">
                    Novatrum // Secure Hub 2026
                </footer>
            </div>
        </div>
    );
}