"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // TOAST NOTIFICATION STATE
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

    // DATA STATES
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [supportTicketsCount, setSupportTicketsCount] = useState(0);
    const [quickNotes, setQuickNotes] = useState<any[]>([]);

    // FORM STATES
    const [newQuickNote, setNewQuickNote] = useState('');
    const [clientForm, setClientForm] = useState({ email: '', fullName: '', companyName: '', phone: '', address: '' });
    const [projectForm, setProjectForm] = useState({ clientId: '', name: '', budget: '', deadline: '', progress: 0, status: 'Planning' });

    // PROJECT UPDATE STATES
    const [updateMessage, setUpdateMessage] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [localProgress, setLocalProgress] = useState<{ [key: string]: number }>({});
    const [timers, setTimers] = useState<{ [key: string]: { active: boolean; sessionStart: number | null; totalElapsed: number; displayTime?: number } }>({});

    // NOTIFICATION STATES
    const [newDiscoveryCount, setNewDiscoveryCount] = useState(0);
    const [hasAnyUnread, setHasAnyUnread] = useState(false);

    // MODAL (PANEL) STATES
    const [selectedProjectDetails, setSelectedProjectDetails] = useState<any>(null);
    const [projectDiscoveryData, setProjectDiscoveryData] = useState<any>(null);
    const [projectFilesData, setProjectFilesData] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // TOAST GÖSTERİM FONKSİYONU
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    };

    // GÜVENLİ ÇIKIŞ FONKSİYONU
    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    // AUTO-LOGOFF SİSTEMİ
    useEffect(() => {
        const INACTIVITY_LIMIT = 15 * 60 * 1000; 
        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleLogout, INACTIVITY_LIMIT);
        };

        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer(); 

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            clearTimeout(timeoutId);
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, [router]);

    // AUTH & DATA FETCH & KUSURSUZ REALTIME
    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) { 
                router.push('/admin/login'); 
                return; 
            }

            const { data: { user } } = await supabase.auth.getUser();
            const { data: member } = await supabase
                .from('members')
                .select('role')
                .eq('id', user?.id)
                .single();

            if (member?.role !== 'admin') {
                await supabase.auth.signOut(); 
                router.push('/admin/login'); 
                return;
            } 
            
            setIsAdmin(true);
            
            fetchData();
            fetchQuickNotes();
            fetchDiscoveryCount();
            checkUnreadTickets();
        };
        
        checkAdmin();

        // GÜNCELLENMİŞ REALTIME YAKALAYICI (ANINDA TEPKİ VERİR)
        const channel = supabase.channel('admin-dashboard-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, () => fetchData())
            
            // YENİ BİLET GELDİĞİNDE ANINDA KIRMIZI YAP
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_tickets' }, () => { 
                setHasAnyUnread(true);
                fetchData(); 
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_tickets' }, () => { 
                checkUnreadTickets();
                fetchData(); 
            })
            
            // YENİ MESAJ GELDİĞİNDE (MÜŞTERİYSE) ANINDA KIRMIZI YAP
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_replies' }, (payload) => {
                if (payload.new && payload.new.sender_type === 'client') {
                    setHasAnyUnread(true); // Saniye bile beklemeden menüyü kırmızı yapar
                }
            })
            // MESAJ OKUNDUYSA (UPDATE OLDUYSA) TEKRAR KONTROL ET
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'support_replies' }, () => {
                checkUnreadTickets();
            })
            
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_quick_notes' }, () => fetchQuickNotes())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_discovery' }, () => fetchDiscoveryCount())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [router]);

    // SESSION TIMER LOGIC
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

    // --- DATA FETCHING ---
    const fetchData = async () => {
        const [clientsRes, projectsRes, statusRes, invRes, ticketsRes] = await Promise.all([
            supabase.from('clients').select('*').is('archived_at', null).order('created_at', { ascending: false }),
            supabase.from('projects').select('*, clients(full_name, email, archived_at)').order('created_at', { ascending: false }),
            supabase.from('system_status').select('*').order('label'),
            supabase.from('client_invoices').select('*'),
            supabase.from('support_tickets').select('status')
        ]);

        if (clientsRes.data) setClients(clientsRes.data);
        
        if (projectsRes.data) {
            const activeProjectsList = projectsRes.data.filter(p => p.clients && !p.clients.archived_at);
            setProjects(activeProjectsList);
            
            const progressMap: { [key: string]: number } = {};
            const newTimers: any = {};
            
            activeProjectsList.forEach(p => { 
                progressMap[p.id] = p.progress_percent; 
                const dbActive = p.last_timer_start !== null;
                const sessionStart = dbActive ? Math.floor(new Date(p.last_timer_start).getTime() / 1000) : null;
                const displayTime = dbActive ? (p.total_time_spent || 0) + (Math.floor(Date.now() / 1000) - sessionStart!) : p.total_time_spent || 0;
                newTimers[p.id] = { active: dbActive, sessionStart, totalElapsed: p.total_time_spent || 0, displayTime };
            });
            
            setLocalProgress(progressMap);
            setTimers(newTimers);
        }
        
        if (statusRes.data) setSystemStatuses(statusRes.data);
        
        if (invRes.data && clientsRes.data) {
            const activeClientIds = clientsRes.data.map(c => c.id);
            const activeInvoices = invRes.data.filter(inv => activeClientIds.includes(inv.client_id));
            setClientInvoices(activeInvoices);
        }
        
        if (ticketsRes.data) {
            setSupportTicketsCount(ticketsRes.data.filter(t => t.status === 'open' || t.status === 'new').length);
        }
    };

    const fetchQuickNotes = async () => {
        const { data } = await supabase.from('admin_quick_notes').select('*').order('created_at', { ascending: false }).limit(5);
        if (data) setQuickNotes(data);
    };

    const fetchDiscoveryCount = async () => {
        const { count } = await supabase.from('project_discovery').select('*', { count: 'exact', head: true }).in('status', ['pending', 'reviewed']);
        if (count !== null) setNewDiscoveryCount(count);
    };

    const checkUnreadTickets = async () => {
        const { count: ticketsCount } = await supabase
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new');

        const { count: repliesCount } = await supabase
            .from('support_replies')
            .select('*', { count: 'exact', head: true })
            .eq('sender_type', 'client')
            .neq('is_read', true);

        setHasAnyUnread((ticketsCount || 0) > 0 || (repliesCount || 0) > 0);
    };

    // MODAL AÇMA VE DETAYLARI ÇEKME
    const handleOpenProjectDetails = async (project: any) => {
        setSelectedProjectDetails(project);
        setLoadingDetails(true);
        setProjectDiscoveryData(null);
        setProjectFilesData([]);

        try {
            if (project.clients?.email) {
                const { data: discData } = await supabase
                    .from('project_discovery')
                    .select('*')
                    .eq('client_email', project.clients.email)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                if (discData) setProjectDiscoveryData(discData);
            }

            const { data: filesData } = await supabase
                .from('client_files')
                .select('*')
                .eq('client_id', project.client_id)
                .order('created_at', { ascending: false });
            
            if (filesData) setProjectFilesData(filesData);

        } catch (error) {
            console.error("Error fetching details", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    // --- QUICK NOTES ---
    const addQuickNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuickNote.trim()) return;
        try {
            await supabase.from('admin_quick_notes').insert({ note: newQuickNote });
            setNewQuickNote('');
            fetchQuickNotes();
        } catch (err) { 
            console.error(err); 
        }
    };

    const deleteQuickNote = async (id: string) => {
        await supabase.from('admin_quick_notes').delete().eq('id', id);
        fetchQuickNotes();
    };

    // --- TIMER & PROGRESS SYNC ---
    const toggleTimer = async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const timerState = timers[projectId];
        const isCurrentlyActive = timerState?.active;
        
        try {
            if (isCurrentlyActive) {
                const sessionDuration = (Math.floor(Date.now() / 1000)) - timerState.sessionStart!;
                const newTotalTime = (project.total_time_spent || 0) + sessionDuration;
                await supabase.from('projects').update({ total_time_spent: newTotalTime, last_timer_start: null }).eq('id', projectId);
                setTimers(prev => ({ ...prev, [projectId]: { active: false, sessionStart: null, totalElapsed: newTotalTime, displayTime: newTotalTime } }));
            } else {
                const nowIso = new Date().toISOString();
                const nowSec = Math.floor(Date.now() / 1000);
                await supabase.from('projects').update({ last_timer_start: nowIso }).eq('id', projectId);
                setTimers(prev => ({ ...prev, [projectId]: { active: true, sessionStart: nowSec, totalElapsed: timerState.totalElapsed, displayTime: timerState.totalElapsed } }));
            }
            fetchData();
        } catch (err: any) { 
            showToast("Timer error: " + err.message, 'error'); 
        }
    };
    
    const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
        try {
            await supabase.from('projects').update({ status: newStatus }).eq('id', projectId);
            fetchData();
        } catch (error) { 
            showToast("Failed to update status", 'error'); 
        }
    };
    
    const handleSyncProject = async (projectId: string) => {
        setLoading(true);
        try {
            const newProgress = localProgress[projectId];
            await supabase.from('projects').update({ progress_percent: newProgress }).eq('id', projectId);

            if (updateMessage.trim() && selectedProjectId === projectId) {
                await supabase.from('project_updates').insert({ project_id: projectId, message: updateMessage, progress_at_time: newProgress });
                setUpdateMessage('');
                setSelectedProjectId(null);
            }
            showToast("Deployment synced with main ledger.", 'success');
        } catch (err: any) { 
            showToast(err.message, 'error'); 
        } finally { 
            setLoading(false); 
        }
    };

    // --- ENTITY (CLIENT) MANUEL OLUŞTURMA ---
    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: existingClient } = await supabase.from('clients').select('id, archived_at').eq('email', clientForm.email).maybeSingle();
            
            if (existingClient) {
                if (existingClient.archived_at) {
                    showToast("This email belongs to an ARCHIVED entity. Please use the Archives page to Restore.", 'error');
                } else {
                    showToast("An active entity with this email already exists.", 'error');
                }
                setLoading(false);
                return;
            }

            const code = `NVTR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const insertData: any = {
                email: clientForm.email,
                full_name: clientForm.fullName,
                company_name: clientForm.companyName || null,
                phone_number: clientForm.phone || null,
                address: clientForm.address || null,
                access_code: code
            };
            
            const { error } = await supabase.from('clients').insert(insertData);
            if (error) throw error;
            
            setClientForm({ email: '', fullName: '', companyName: '', phone: '', address: '' });
            showToast(`Entity authorized successfully. Deployment Key: ${code}`, 'success');
            router.push('/admin/clients');
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- DEPLOY PROJECT ---
    const handleDeployProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('projects').insert({ 
                client_id: projectForm.clientId, 
                name: projectForm.name, 
                budget: projectForm.budget, 
                deadline: projectForm.deadline || null, 
                status: projectForm.status, 
                progress_percent: projectForm.progress 
            });
            
            if (error) throw error;

            setProjectForm({ clientId: '', name: '', budget: '', deadline: '', progress: 0, status: 'Planning' });
            showToast("Project deployment initiated.", 'success');
            setActiveTab('overview');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const activeProjects = projects.filter((p: any) => timers[p.id]?.active);
    const idleProjects = projects.filter((p: any) => !timers[p.id]?.active);

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">
                Authenticating...
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-zinc-50 text-black font-sans overflow-hidden selection:bg-black selection:text-white relative">

            {/* TOAST NOTIFICATION */}
            {toast && (
                <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-4 rounded-full shadow-2xl z-[9999] animate-in slide-in-from-bottom-5 duration-300 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border ${
                    toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' :
                    toast.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    'bg-zinc-900 text-white border-zinc-800'
                }`}>
                    {toast.type === 'success' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>}
                    {toast.type === 'error' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                    {toast.message}
                </div>
            )}

            {/* PROJE DETAY MODALI (PANEL) */}
            {selectedProjectDetails && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={() => setSelectedProjectDetails(null)}></div>
                    
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 p-6 sm:p-10 custom-scrollbar border border-zinc-200">
                        <button 
                            onClick={() => setSelectedProjectDetails(null)} 
                            className="absolute top-6 right-6 p-2 bg-zinc-100 hover:bg-red-50 hover:text-red-500 text-zinc-500 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <div className="mb-10 pb-6 border-b border-zinc-100 pr-12">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900">{selectedProjectDetails.name}</h2>
                                <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase">{selectedProjectDetails.status}</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                {selectedProjectDetails.clients?.full_name} • {selectedProjectDetails.clients?.email}
                            </p>
                        </div>

                        {loadingDetails ? (
                            <div className="py-20 flex flex-col items-center justify-center">
                                <span className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Blueprint...</p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                
                                {/* 1. Client Discovery Requirements */}
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                        Discovery Requirements
                                    </h3>
                                    {projectDiscoveryData ? (
                                        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                            {projectDiscoveryData.details && Object.entries(projectDiscoveryData.details).map(([key, value]) => {
                                                if (key === 'Assets') return null;
                                                return (
                                                    <div key={key} className="py-2 border-b border-zinc-200/60 last:border-0">
                                                        <span className="block text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">{key}</span>
                                                        <span className="text-xs font-bold text-zinc-800 whitespace-pre-wrap leading-relaxed">{String(value) || 'N/A'}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-6 text-center border border-zinc-200 border-dashed rounded-2xl">
                                            No discovery blueprint found for this client.
                                        </p>
                                    )}
                                </div>

                                {/* 2. Uploaded Assets & Files */}
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                        Client Assets & Vault
                                    </h3>
                                    <div className="grid gap-3">
                                        {projectDiscoveryData?.details?.Assets && projectDiscoveryData.details.Assets.split(' | ').filter(Boolean).map((url: string, i: number) => (
                                            <div key={`disc-${i}`} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl hover:border-black transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-900">Discovery Upload {i + 1}</p>
                                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-0.5">Initial Form Asset</p>
                                                    </div>
                                                </div>
                                                <a href={url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">
                                                    Download
                                                </a>
                                            </div>
                                        ))}

                                        {projectFilesData.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl hover:border-black transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
                                                        <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-900 truncate max-w-[200px] sm:max-w-xs">{file.file_name}</p>
                                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mt-0.5">Client Vault Asset</p>
                                                    </div>
                                                </div>
                                                <a href={file.file_url} target="_blank" rel="noreferrer" className="text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">
                                                    Download
                                                </a>
                                            </div>
                                        ))}

                                        {(!projectDiscoveryData?.details?.Assets && projectFilesData.length === 0) && (
                                            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-6 text-center border border-zinc-200 border-dashed rounded-2xl">
                                                No assets or files uploaded by this client.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-zinc-200 z-40 p-4 flex justify-between items-center text-black">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-xl font-black tracking-tighter uppercase">Novatrum</h2>
                </div>
                <div className="flex items-center gap-4">
                    {(hasAnyUnread || newDiscoveryCount > 0) && (
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    )}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-lg">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
            </div>

            {/* SIDEBAR NAVIGATION */}
            <aside className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 w-64 bg-white border-r border-zinc-200 p-6 flex flex-col h-full shadow-2xl`}>
                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-4 flex items-center justify-center bg-white border border-zinc-100 p-2 rounded-full shadow-sm">
                        <img src="/logo.png" alt="Novatrum Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter text-zinc-900">NOVATRUM</h2>
                    <div className="h-0.5 w-8 bg-zinc-200 mx-auto mt-3 rounded-full" />
                </div>
                
                <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'Command Center', action: null },
                        { id: 'discoveries', label: 'Discovery Logs', badgeText: newDiscoveryCount > 0 ? `${newDiscoveryCount} NEW` : null, action: () => router.push('/admin/discoveries') },
                        { id: 'tickets', label: 'Support Queue', badgeText: hasAnyUnread ? 'NEW' : null, action: () => router.push('/admin/support') },
                        { id: 'status', label: 'Infrastructure', action: () => router.push('/admin/status') },
                        { id: 'clients', label: 'Active Database', action: () => router.push('/admin/clients') },
                        { id: 'archive', label: 'Entity Archive', action: () => router.push('/admin/archive') }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.action) { 
                                    item.action(); 
                                } else { 
                                    setActiveTab(item.id); 
                                    setIsMobileMenuOpen(false); 
                                }
                            }}
                            className={`relative w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${
                                activeTab === item.id && !item.action ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'
                            }`}
                        >
                            <span>{item.label}</span>
                            {item.badgeText && (
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest shadow-sm">
                                    {item.badgeText}
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-zinc-100">
                        <button
                            onClick={() => router.push('/admin/invoice-generator')}
                            className="relative w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all text-zinc-500 hover:bg-zinc-50 hover:text-black border border-transparent hover:border-zinc-200"
                        >
                            Invoice Generator
                        </button>
                    </div>
                </nav>
                
                <div className="mt-auto flex flex-col pt-6 border-t border-zinc-100">
                    <button 
                        onClick={handleLogout} 
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        {loading ? 'Terminating...' : 'Terminate Session'}
                    </button>
                </div>
            </aside>

            {/* MAIN SCROLLABLE CONTENT */}
            <main className="flex-1 h-full overflow-y-auto md:pl-64 p-6 lg:p-10 relative z-0 mt-16 md:mt-0">

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500 space-y-10 pb-20">
                        
                        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-6 border-b border-zinc-200">
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Workspace</h1>
                                <button onClick={fetchData} className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-all active:scale-95 text-zinc-500 hover:text-zinc-900 shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Node Operational</span>
                            </div>
                        </div>

                        {/* QUICK ACTIONS BUTTONS */}
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => setActiveTab('add_client')} className="bg-black text-white px-6 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] shadow-lg hover:bg-zinc-800 active:scale-95 transition-all flex items-center gap-2 border border-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Register Entity Manually
                            </button>
                            <button onClick={() => setActiveTab('add_project')} className="bg-white border border-zinc-200 text-black px-6 py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-[10px] shadow-sm hover:bg-zinc-50 active:scale-95 transition-all flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Deploy Project
                            </button>
                        </div>

                        {/* GLOBAL METRICS */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { l: "Active Entities", v: clients.length, highlight: false },
                                { l: "Pending Approvals", v: newDiscoveryCount, highlight: newDiscoveryCount > 0 },
                                { l: "Queue Count", v: supportTicketsCount, highlight: supportTicketsCount > 0 },
                                { l: "Unpaid Ledgers", v: clientInvoices.filter(i => i.status === 'unpaid').length, highlight: false }
                            ].map((stat, i) => (
                                <div key={i} className={`p-6 md:p-8 rounded-2xl md:rounded-[32px] border shadow-sm transition-colors ${stat.highlight ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-black'}`}>
                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-2 ${stat.highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>{stat.l}</p>
                                    <p className="text-4xl md:text-5xl font-black font-mono">{stat.v}</p>
                                </div>
                            ))}
                        </div>

                        {/* LIVE SESSIONS */}
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-6">Active Engineering Sessions</h2>
                            {activeProjects.length === 0 ? (
                                <div className="bg-white border border-zinc-200 border-dashed rounded-[32px] p-10 flex items-center justify-center min-h-[200px] shadow-sm">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No active sessions. Initiate 'Resume Engineering' from deployment list.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                                    {activeProjects.map((p: any) => {
                                        const timer = timers[p.id];
                                        return (
                                            <div key={p.id} onClick={() => handleOpenProjectDetails(p)} className="bg-white p-6 md:p-8 rounded-[32px] border-2 border-zinc-900 shadow-md relative flex flex-col w-full cursor-pointer hover:bg-zinc-50/50 transition-colors group">
                                                
                                                <div className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-black bg-white rounded-full shadow-sm border border-zinc-100" title="View Project Specs">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                </div>

                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="pr-4">
                                                        <p className="font-black text-xl uppercase tracking-tight text-zinc-900 break-words group-hover:underline decoration-2 underline-offset-4">{p.name}</p>
                                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 break-words">{p.clients?.full_name}</p>
                                                    </div>
                                                    <select onClick={(e) => e.stopPropagation()} className="bg-zinc-100 border border-zinc-200 text-zinc-800 px-3 py-2 rounded-xl text-[9px] font-black uppercase outline-none cursor-pointer shrink-0" value={p.status || 'Planning'} onChange={(e) => handleUpdateProjectStatus(p.id, e.target.value)}>
                                                        <option value="Planning">Planning</option>
                                                        <option value="Development">Development</option>
                                                        <option value="Testing">Testing</option>
                                                        <option value="Live">Live</option>
                                                    </select>
                                                </div>

                                                <div className="bg-white rounded-[24px] p-6 mb-6 border border-zinc-200 shadow-sm">
                                                    <div className="flex flex-col gap-5">
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Session Duration</p>
                                                            <p className="text-3xl font-black font-mono text-emerald-600">{formatTime(timer.displayTime || 0)}</p>
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); toggleTimer(p.id); }} className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95 shadow-sm">
                                                            Terminate Session
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-4 pt-4 border-t border-zinc-100">
                                                    <input 
                                                        onClick={(e) => e.stopPropagation()} 
                                                        type="text" 
                                                        placeholder="Update development log..." 
                                                        className="w-full bg-white border border-zinc-200 p-4 rounded-xl text-xs outline-none focus:border-zinc-400 font-bold" 
                                                        value={selectedProjectId === p.id ? updateMessage : ''} 
                                                        onChange={(e) => { setSelectedProjectId(p.id); setUpdateMessage(e.target.value); }} 
                                                    />
                                                    <div className="flex gap-3 items-center">
                                                        <div className="flex items-center gap-3 flex-1 bg-zinc-50 border border-zinc-200 p-2 pl-4 rounded-xl">
                                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest shrink-0">Load:</span>
                                                            <input 
                                                                onClick={(e) => e.stopPropagation()} 
                                                                type="number" 
                                                                min="0" max="100" 
                                                                className="flex-1 bg-transparent text-xs font-bold outline-none" 
                                                                value={localProgress[p.id] ?? p.progress_percent} 
                                                                onFocus={(e) => e.target.select()} 
                                                                onChange={(e) => setLocalProgress({ ...localProgress, [p.id]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} 
                                                            />
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); handleSyncProject(p.id); }} disabled={loading} className="bg-zinc-900 text-white px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black disabled:opacity-50 shadow-sm active:scale-95">
                                                            Sync
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* QUICK NOTES */}
                                    <div className="flex flex-col bg-white border border-zinc-200 rounded-[32px] p-6 md:p-8 shadow-sm">
                                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-6 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                            Internal Memos
                                        </p>
                                        <form onSubmit={addQuickNote} className="mb-6 flex gap-2">
                                            <input 
                                                type="text" 
                                                value={newQuickNote} 
                                                onChange={(e) => setNewQuickNote(e.target.value)} 
                                                placeholder="Draft note..." 
                                                className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3.5 rounded-xl text-xs font-bold outline-none focus:border-zinc-400" 
                                            />
                                            <button type="submit" disabled={!newQuickNote.trim()} className="bg-zinc-900 text-white px-5 rounded-xl hover:bg-black disabled:opacity-50 transition-colors shadow-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                            </button>
                                        </form>
                                        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[180px] pr-1 custom-scrollbar">
                                            {quickNotes.map(note => (
                                                <div key={note.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-start group">
                                                    <p className="text-xs font-bold text-zinc-700 leading-relaxed pr-3">{note.note}</p>
                                                    <button onClick={() => deleteQuickNote(note.id)} className="text-zinc-400 hover:text-red-500 transition-opacity p-1 bg-white hover:bg-red-50 rounded-lg">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* IDLE DEPLOYMENTS */}
                        {idleProjects.length > 0 && (
                            <div className="pt-8 border-t border-zinc-200">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-6">Queue Status</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {idleProjects.map((p: any) => (
                                        <div key={p.id} onClick={() => handleOpenProjectDetails(p)} className="bg-white p-6 md:p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col w-full hover:border-black cursor-pointer transition-colors group relative">
                                            
                                            <div className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-black bg-zinc-50 rounded-full" title="View Project Specs">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            </div>

                                            <div className="flex justify-between items-start mb-6">
                                                <div className="pr-4">
                                                    <p className="font-black text-xl uppercase tracking-tight text-zinc-900 group-hover:underline decoration-2 underline-offset-4">{p.name}</p>
                                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{p.clients?.full_name}</p>
                                                </div>
                                                <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase">{p.status}</span>
                                            </div>
                                            
                                            <button onClick={(e) => { e.stopPropagation(); toggleTimer(p.id); }} className="mt-auto w-full py-4 rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest bg-zinc-900 text-white hover:bg-black transition-colors shadow-sm active:scale-95">
                                                Resume Engineering
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* REGISTER CLIENT MANUALLY TAB */}
                {activeTab === 'add_client' && (
                    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
                        <div className="flex items-center gap-4 pb-6 border-b border-zinc-200 mb-8">
                            <button onClick={() => setActiveTab('overview')} className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-all active:scale-95 text-zinc-500 hover:text-zinc-900 shadow-sm">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Authorize Entity</h1>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-[24px] mb-6">
                            <p className="text-xs font-bold text-blue-800 leading-relaxed">
                                <strong>Note:</strong> We recommend using the "Discovery Logs" page to automatically onboard clients via email. Use this form only if you need to manually register a client and share their Deployment Key yourself.
                            </p>
                        </div>
                        
                        <form onSubmit={handleCreateClient} className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Legal Identity *</label>
                                    <input type="text" required className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 focus:bg-white transition-colors" value={clientForm.fullName} onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Primary Email *</label>
                                    <input type="email" required className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 focus:bg-white transition-colors" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Company / Incorporation</label>
                                    <input type="text" className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 focus:bg-white transition-colors" value={clientForm.companyName} onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Phone</label>
                                    <input type="tel" className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 focus:bg-white transition-colors" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Billing Address</label>
                                    <input type="text" className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 focus:bg-white transition-colors" value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-black disabled:opacity-50 mt-4 shadow-md active:scale-95 transition-all">Initiate Authorization</button>
                        </form>
                    </div>
                )}

                {/* DEPLOY PROJECT TAB */}
                {activeTab === 'add_project' && (
                    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 pb-20">
                        <div className="flex items-center gap-4 pb-6 border-b border-zinc-200 mb-8">
                            <button onClick={() => setActiveTab('overview')} className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-all active:scale-95 text-zinc-500 hover:text-zinc-900 shadow-sm">
                               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Push Deployment</h1>
                        </div>
                        
                        <form onSubmit={handleDeployProject} className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                            <div>
                                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Select Entity *</label>
                                <select required className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold uppercase cursor-pointer focus:border-zinc-400 focus:bg-white transition-colors" value={projectForm.clientId} onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}>
                                    <option value="">Choose Binding...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Architecture Nomenclature *</label>
                                 <input type="text" required className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 focus:bg-white transition-colors" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between font-black uppercase text-[9px] text-zinc-500 tracking-widest"><span>Initial Load</span><span>%{projectForm.progress}</span></div>
                                <input type="range" min="0" max="100" value={projectForm.progress} onChange={(e) => setProjectForm({ ...projectForm, progress: parseInt(e.target.value) })} className="w-full accent-zinc-900 h-1.5 bg-zinc-200 appearance-none cursor-pointer rounded-full" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-black disabled:opacity-50 mt-4 shadow-md active:scale-95 transition-all">Initiate Deployment</button>
                        </form>
                    </div>
                )}
            </main>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
            `}} />
        </div>
    );
}