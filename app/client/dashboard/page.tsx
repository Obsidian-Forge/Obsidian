"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ClientDashboardPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);
    const [clientProfile, setClientProfile] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [clientName, setClientName] = useState('');
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        const storedName = localStorage.getItem('novatrum_client_name');
        if (!storedId) return router.push('/client/login');

        setClientName(storedName || 'Valued Client');

        Promise.all([
            fetchProjects(storedId),
            fetchSystemStatus(),
            fetchClientProfile(storedId),
            fetchClientFiles(storedId)
        ]).then(() => setLoading(false));

        // 1. Sistem Durumu Kanalı
        const statusChannel = supabase.channel('client-status-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'system_status' }, () => { fetchSystemStatus(); })
            .subscribe();

        // 2. Proje Logları Kanalı
        const logsChannel = supabase.channel('client-logs-sync')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_updates' }, () => { fetchProjects(storedId); })
            .subscribe();

        // 3. Proje Durum/Yüzde Kanalı (Filtre kaldırıldı, global dinliyor ama sadece kendi verisini çekiyor)
        const projectsChannel = supabase.channel('client-projects-sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, () => { fetchProjects(storedId); })
            .subscribe();

        // 4. Yetki Kanalı (Müşteri silinirse)
        const authChannel = supabase.channel('client-auth-sync')
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'clients', filter: `id=eq.${storedId}` }, () => {
                handleLogout();
                alert("Access key revoked.");
            })
            .subscribe();

        // 5. Dosya Kanalı
        const filesChannel = supabase.channel('client-files-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_files', filter: `client_id=eq.${storedId}` }, () => { fetchClientFiles(storedId); })
            .subscribe();

        return () => {
            supabase.removeChannel(statusChannel);
            supabase.removeChannel(logsChannel);
            supabase.removeChannel(projectsChannel);
            supabase.removeChannel(authChannel);
            supabase.removeChannel(filesChannel);
        };
    }, [router]);

    if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-black uppercase text-xs">Node Accessing...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-black p-6 md:p-8 font-sans overflow-x-hidden">
            <div className="max-w-4xl mx-auto pt-10 md:pt-16">

                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Deployment Hub</span>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Client Portal</h1>
                        <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mt-2">Identity: <span className="text-black">{clientName}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => router.push('/client/support')} className="text-[10px] font-black uppercase tracking-widest border border-zinc-200 bg-white px-5 py-3 rounded-xl hover:border-black transition-all">Support</button>
                        <button onClick={() => router.push('/client/settings')} className="text-[10px] font-black uppercase tracking-widest border border-zinc-200 bg-white px-5 py-3 rounded-xl hover:border-black transition-all">Settings</button>
                        <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-5 py-3 rounded-xl shadow-xl active:scale-95 transition-all">Disconnect</button>
                    </div>
                </div>

                {clientProfile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="bg-white border border-zinc-200 p-8 rounded-[30px] shadow-sm flex flex-col">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Entity Information</h2>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Full Name</p>
                                    <p className="text-sm font-black uppercase mt-1">{clientProfile.full_name}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Email</p>
                                    <p className="text-xs font-bold text-zinc-600 break-all mt-1">{clientProfile.email}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Company</p>
                                    <p className="text-xs font-bold text-zinc-600 mt-1">{clientProfile.company_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Phone</p>
                                    <p className="text-xs font-bold text-zinc-600 mt-1">{clientProfile.phone_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Address</p>
                                    <p className="text-xs font-bold text-zinc-600 mt-1">{clientProfile.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-200 p-8 rounded-[30px] shadow-sm flex flex-col h-full max-h-[400px]">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Secure Asset Vault</h2>
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                {clientFiles.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-50 py-10">
                                        <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">No documents found</p>
                                    </div>
                                ) : (
                                    clientFiles.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-white hover:border-zinc-300 transition-all group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center shrink-0">
                                                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <span className="text-xs font-bold truncate max-w-[150px]" title={file.file_name}>{file.file_name}</span>
                                            </div>
                                            <a href={file.file_url} target="_blank" rel="noreferrer" className="bg-black text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shrink-0">Open</a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {systemStatuses.map((s) => (
                        <div key={s.id} className="bg-white border border-zinc-100 p-5 rounded-[20px] flex items-center justify-between shadow-sm">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{s.label}</span>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(s.status)} ${s.status !== 'operational' ? 'animate-pulse shadow-[0_0_10px_red]' : ''}`} />
                        </div>
                    ))}
                </div>

                <div className="grid gap-12">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white border border-zinc-200 p-8 md:p-10 rounded-[30px] md:rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-500">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">{project.name}</h2>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-2 tracking-widest">Deployment ID: {project.id.slice(0, 8)}</p>
                                </div>
                                <span className="bg-black text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl tracking-widest">{project.status}</span>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-end font-mono">
                                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Infrastructure Core</span>
                                    {/* Yüzde texti de yeşil yapıldı */}
                                    <span className="text-2xl font-black text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                        %{project.progress_percent}
                                    </span>
                                </div>

                                {/* Barın Arka Planı (Koyu Gri/Siyahımsı) */}
                                <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700 shadow-inner">
                                    {/* Yeşil Parlayan Progress Bar */}
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(16,185,129,0.8)] relative"
                                        style={{ width: `${project.progress_percent}%` }}
                                    >
                                        {/* Üzerinde minik bir parıltı/şerit efekti */}
                                        <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-10 border-t border-zinc-50">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-8 text-center">System Logs</h3>
                                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-6">
                                    {project.project_updates?.map((u: any) => (
                                        <div key={u.id} className="relative pl-6 border-l border-zinc-100 py-1">
                                            <div className="absolute -left-[5px] top-3 w-2.5 h-2.5 bg-zinc-200 border-2 border-white rounded-full" />
                                            <div className="flex flex-col md:flex-row justify-between gap-2 md:items-center">
                                                <p className="text-xs font-bold text-zinc-700 leading-relaxed">{u.message}</p>
                                                <span className="text-[9px] font-black uppercase text-zinc-400 tracking-widest whitespace-nowrap">{formatDate(u.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!project.project_updates || project.project_updates.length === 0) && (
                                        <p className="text-[10px] text-zinc-300 italic text-center uppercase tracking-widest">Waiting for initial log entry...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="mt-32 pb-16 text-center text-[8px] font-black uppercase tracking-[0.5em] text-zinc-300">Novatrum Infrastructure // Secure Hub 2026</footer>
            </div>
        </div>
    );
}