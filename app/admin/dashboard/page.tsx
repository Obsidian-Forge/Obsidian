"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [localProgress, setLocalProgress] = useState<{ [key: string]: number }>({});
    const [projectInputs, setProjectInputs] = useState<{ [key: string]: { log: string, status: string } }>({});
    const [timers, setTimers] = useState<{ [key: string]: { active: boolean; sessionStart: number | null; totalElapsed: number; displayTime?: number } }>({});

    // NOTIFICATION STATES
    const [newDiscoveryCount, setNewDiscoveryCount] = useState(0);
    const [hasAnyUnread, setHasAnyUnread] = useState(false);

    // MODAL (PANEL) STATES
    const [selectedProjectDetails, setSelectedProjectDetails] = useState<any>(null);
    const [projectDiscoveryData, setProjectDiscoveryData] = useState<any>(null);
    const [projectFilesData, setProjectFilesData] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ message, type });
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    };

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

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

    // 1. POLLING & AUTH KONTROLÜ (GÖRÜNMEZ YENİLEME)
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
            
            // İlk Yükleme
            fetchData();
            fetchQuickNotes();
            fetchDiscoveryCount();
            checkUnreadTickets();
        };
        
        checkAdmin();

        // 15 Saniyede Bir Arka Planda Güncelle
        const pollInterval = setInterval(() => {
            fetchData();
            fetchQuickNotes();
            fetchDiscoveryCount();
            checkUnreadTickets();
        }, 15000);

        return () => clearInterval(pollInterval);
    }, [router]);

    // 2. SAYAÇ AKIŞI (HER 1 SANİYEDE UI GÜNCELLENİR)
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

    const fetchData = async () => {
        const [clientsRes, projectsRes, statusRes, invRes, ticketsRes] = await Promise.all([
            supabase.from('clients').select('*').is('archived_at', null).order('created_at', { ascending: false }),
            supabase.from('projects').select('*, clients(full_name, email, archived_at), project_updates(*)').order('created_at', { ascending: false }),
            supabase.from('system_status').select('*').order('label'),
            supabase.from('client_invoices').select('*'),
            supabase.from('support_tickets').select('status')
        ]);

        if (clientsRes.data) setClients(clientsRes.data);
        if (projectsRes.data) {
            const activeProjectsList = projectsRes.data.filter(p => p.clients && !p.clients.archived_at).map(p => ({
                ...p,
                project_updates: p.project_updates ? p.project_updates.sort((a:any, b:any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []
            }));
            
            setProjects(activeProjectsList);
            
            const progressMap: { [key: string]: number } = {};
            const inputsMap: { [key: string]: any } = {};
            const newTimers: any = {};
            
            activeProjectsList.forEach(p => { 
                // Local progress koruma mantığı
                progressMap[p.id] = localProgress[p.id] ?? p.progress_percent; 
                
                // Input koruma mantığı
                inputsMap[p.id] = projectInputs[p.id] || { log: '', status: p.status || 'Planning' };

                // Sayaç mantığı
                const dbActive = p.last_timer_start !== null;
                const sessionStart = dbActive ? Math.floor(new Date(p.last_timer_start).getTime() / 1000) : null;
                const displayTime = dbActive ? (p.total_time_spent || 0) + (Math.floor(Date.now() / 1000) - sessionStart!) : p.total_time_spent || 0;
                newTimers[p.id] = { active: dbActive, sessionStart, totalElapsed: p.total_time_spent || 0, displayTime };
            });

            setLocalProgress(progressMap);
            setProjectInputs(prev => ({ ...inputsMap, ...prev }));
            setTimers(newTimers);

            // Eğer modal açıksa, selectedProjectDetails içindeki güncel veriyi de tazele
            if (selectedProjectDetails) {
                const updatedSelectedProject = activeProjectsList.find(p => p.id === selectedProjectDetails.id);
                if (updatedSelectedProject) setSelectedProjectDetails(updatedSelectedProject);
            }
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
            .eq('is_read', false);
        setHasAnyUnread((ticketsCount || 0) > 0 || (repliesCount || 0) > 0);
    };

    // --- PROJE PANELİ (MODAL) YÖNETİMİ ---
    const handleOpenProjectDetails = async (project: any) => {
        setSelectedProjectDetails(project);
        setLoadingDetails(true);
        setProjectDiscoveryData(null);
        setProjectFilesData([]);
        
        // Modal açıldığında form statelerini güvenli şekilde eşitle
        if (localProgress[project.id] === undefined) {
            setLocalProgress(prev => ({...prev, [project.id]: project.progress_percent}));
        }
        if (!projectInputs[project.id]) {
            setProjectInputs(prev => ({...prev, [project.id]: { log: '', status: project.status || 'Planning' }}));
        }

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

    const handleDeleteProject = async (projectId: string) => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this project? This action cannot be undone.");
        if (!confirmDelete) return;

        setLoadingDetails(true);
        try {
            const { error } = await supabase.from('projects').delete().eq('id', projectId);
            if (error) throw error;

            showToast("Project successfully deleted.", 'success');
            setSelectedProjectDetails(null);
            fetchData();
        } catch (err: any) {
            showToast("Failed to delete project: " + err.message, 'error');
        } finally {
            setLoadingDetails(false);
        }
    };

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

    // --- MÜHENDİSLİK AKSİYONLARI (MODAL İÇİNDEN ÇAĞRILACAK) ---
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
    
    const handleSyncProject = async (projectId: string) => {
        setLoading(true);
        try {
            const newProgress = localProgress[projectId];
            const currentInputs = projectInputs[projectId];
            
            // Projeyi Güncelle (Yüzde ve Statü)
            await supabase.from('projects').update({ 
                progress_percent: newProgress,
                status: currentInputs?.status || 'Planning'
            }).eq('id', projectId);

            // Log yazıldıysa onu da ekle
            if (currentInputs?.log?.trim()) {
                await supabase.from('project_updates').insert({ 
                    project_id: projectId, 
                    message: currentInputs.log.trim(), 
                    progress_at_time: newProgress 
                });
                
                // İşlem bitince formdaki log inputunu temizle
                setProjectInputs(prev => ({...prev, [projectId]: {...currentInputs, log: ''}}));
            }
            
            showToast("Project synchronized perfectly.", 'success');
            fetchData(); // ANINDA UI YENİLEME
        } catch (err: any) { 
            showToast(err.message, 'error');
        } finally { 
            setLoading(false);
        }
    };

    // --- FORM İŞLEMLERİ ---
    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data: existingClient } = await supabase.from('clients').select('id, archived_at').eq('email', clientForm.email).maybeSingle();
            if (existingClient) {
                if (existingClient.archived_at) {
                    showToast("This email belongs to an ARCHIVED entity. Please use Archives.", 'error');
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
            setActiveTab('overview');
            fetchData();
        } catch (err: any) {
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

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

    // YARDIMCI FONKSİYONLAR
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

    const activeProjects = projects.filter((p: any) => timers[p.id]?.active);
    const idleProjects = projects.filter((p: any) => !timers[p.id]?.active);
    const isSystemDown = systemStatuses.some(s => s.status === 'down');

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">
                Authenticating...
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-zinc-50 text-black font-sans overflow-hidden selection:bg-black selection:text-white relative">

            {/* TOAST BİLDİRİMİ */}
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

            {/* DEV KONTROL PANELİ (MODAL) */}
            {selectedProjectDetails && (() => {
                const pId = selectedProjectDetails.id;
                const timer = timers[pId];
                const currentProg = localProgress[pId] ?? selectedProjectDetails.progress_percent;
                const inputs = projectInputs[pId] || { log: '', status: selectedProjectDetails.status || 'Planning' };

                return (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                        {/* Arka Plan Overlay */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProjectDetails(null)}></div>
                        
                        <div className="bg-[#f8f9fa] w-full max-w-6xl h-[90vh] flex flex-col rounded-[40px] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border border-zinc-200 overflow-hidden">
                            
                            {/* MODAL HEADER */}
                            <div className="px-8 md:px-12 py-8 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-zinc-900 leading-none">{selectedProjectDetails.name}</h2>
                                        <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase">{selectedProjectDetails.id.split('-')[0]}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                        {selectedProjectDetails.clients?.full_name} • {selectedProjectDetails.clients?.email}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <select 
                                        value={inputs.status}
                                        onChange={(e) => setProjectInputs(prev => ({...prev, [pId]: {...prev[pId], status: e.target.value}}))}
                                        className="bg-white border border-zinc-200 text-black px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer shadow-sm hover:border-black transition-colors"
                                    >
                                        <option value="Planning">PLANNING</option>
                                        <option value="Development">DEVELOPMENT</option>
                                        <option value="Testing">TESTING</option>
                                        <option value="Deployed">DEPLOYED</option>
                                    </select>
                                    <button onClick={() => setSelectedProjectDetails(null)} className="p-3 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-500 rounded-xl transition-colors shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* MODAL BODY (TWO COLUMNS) */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    
                                    {/* SOL SÜTUN: ENGINEERING & ARCHITECTURE LOAD */}
                                    <div className="space-y-8">
                                        {/* SAYAÇ & SESSION BÖLÜMÜ */}
                                        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">Engineering Time</span>
                                                    <span className={`text-5xl font-black font-mono tracking-tighter ${timer?.active ? 'text-emerald-500' : 'text-black'}`}>
                                                        {formatTime(timer?.displayTime || 0)}
                                                    </span>
                                                </div>
                                                {timer?.active && <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
                                            </div>
                                            <button 
                                                onClick={() => toggleTimer(pId)}
                                                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${timer?.active ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' : 'bg-black text-white hover:bg-zinc-800'}`}
                                            >
                                                {timer?.active ? 'TERMINATE SESSION' : 'START ENGINEERING SESSION'}
                                            </button>
                                        </div>

                                        {/* ARCHITECTURE LOAD & VERCEL STEPS */}
                                        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                                            <div className="flex justify-between items-end mb-4">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Architecture Load</span>
                                                <span className="text-3xl font-black font-mono text-black">{currentProg}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-6">
                                                <div className="h-full bg-black transition-all duration-300" style={{ width: `${currentProg}%` }} />
                                            </div>
                                            
                                            {/* STEPS PREVIEW */}
                                            <div className="space-y-3.5 mb-8">
                                                {[
                                                    { label: 'Provisioning Servers & Initial Setup', threshold: 20 },
                                                    { label: 'Building Database & Core Architecture', threshold: 50 },
                                                    { label: 'Deploying SSL & Security Layers', threshold: 80 },
                                                    { label: 'Finalizing Operational Node', threshold: 100 }
                                                ].map((step, idx) => {
                                                    const isPassed = currentProg >= step.threshold;
                                                    return (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors ${isPassed ? 'bg-emerald-500 border-emerald-500 shadow-sm' : 'border-zinc-200 bg-zinc-50'}`}>
                                                                {isPassed && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                            </div>
                                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'text-black' : 'text-zinc-400'}`}>{step.label}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            
                                            {/* LOAD CONTROLS */}
                                            <div className="pt-6 border-t border-zinc-100">
                                                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-4">Adjust Load Range</label>
                                                <input 
                                                    type="range" 
                                                    min="0" max="100" 
                                                    value={currentProg} 
                                                    onChange={(e) => setLocalProgress({ ...localProgress, [pId]: parseInt(e.target.value) })} 
                                                    className="w-full accent-black h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer mb-6" 
                                                />
                                                <div className="flex gap-3 items-center">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Update ledger/deployment log..." 
                                                        value={inputs.log}
                                                        onChange={(e) => setProjectInputs(prev => ({...prev, [pId]: {...prev[pId], log: e.target.value}}))}
                                                        className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-4 rounded-xl text-xs font-bold outline-none focus:border-zinc-400 transition-colors placeholder:text-zinc-400"
                                                    />
                                                    <button 
                                                        onClick={() => handleSyncProject(pId)} 
                                                        disabled={loading} 
                                                        className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-sm active:scale-95 whitespace-nowrap"
                                                    >
                                                        {loading ? 'SYNCING...' : 'SYNC LOAD'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SAĞ SÜTUN: DISCOVERY, ASSETS, LEDGER & DANGER ZONE */}
                                    <div className="space-y-8">
                                        
                                        {/* Deployment Ledger Preview */}
                                        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                                                Deployment Ledger
                                            </h3>
                                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                {selectedProjectDetails.project_updates?.map((u: any, idx: number) => (
                                                    <div key={u.id} className={`p-4 rounded-2xl border ${idx === 0 ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100 opacity-60'}`}>
                                                        <p className="text-xs font-bold text-zinc-800 mb-2">{u.message}</p>
                                                        <div className="flex justify-between items-center text-[9px] font-black font-mono uppercase tracking-widest text-zinc-400">
                                                            <span>{formatDate(u.created_at)}</span>
                                                            <span>LOAD: {u.progress_at_time}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!selectedProjectDetails.project_updates || selectedProjectDetails.project_updates.length === 0) && (
                                                    <div className="text-center py-6 text-zinc-400 text-[10px] font-bold uppercase tracking-widest border border-dashed border-zinc-200 rounded-2xl">No log entries.</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Discovery Requirements */}
                                        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                Discovery Requirements
                                            </h3>
                                            {loadingDetails ? (
                                                 <div className="flex justify-center py-4"><span className="w-5 h-5 border-2 border-zinc-200 border-t-black rounded-full animate-spin" /></div>
                                            ) : projectDiscoveryData ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                                    {projectDiscoveryData.details && Object.entries(projectDiscoveryData.details).map(([key, value]) => {
                                                        if (key === 'Assets') return null;
                                                        return (
                                                            <div key={key} className="py-2 border-b border-zinc-100 last:border-0">
                                                                <span className="block text-[8px] font-black uppercase text-zinc-400 tracking-widest mb-1">{key}</span>
                                                                <span className="text-xs font-bold text-zinc-800 leading-snug">{String(value) || 'N/A'}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-6 text-center border border-zinc-200 border-dashed rounded-2xl">No discovery blueprint.</p>
                                            )}
                                        </div>

                                        {/* Client Vault & Assets */}
                                        <div className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-sm">
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                Client Vault Assets
                                            </h3>
                                            <div className="grid gap-3">
                                                {projectDiscoveryData?.details?.Assets && projectDiscoveryData.details.Assets.split(' | ').filter(Boolean).map((url: string, i: number) => (
                                                    <div key={`disc-${i}`} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-black transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-zinc-900">Discovery Asset {i + 1}</p>
                                                            </div>
                                                        </div>
                                                        <a href={url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">DL</a>
                                                    </div>
                                                ))}

                                                {projectFilesData.map((file) => (
                                                    <div key={file.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl hover:border-black transition-colors group">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-white border border-zinc-200 rounded-lg flex items-center justify-center">
                                                                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-zinc-900 truncate max-w-[150px]">{file.file_name}</p>
                                                            </div>
                                                        </div>
                                                        <a href={file.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase tracking-widest bg-zinc-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">DL</a>
                                                    </div>
                                                ))}

                                                {(!projectDiscoveryData?.details?.Assets && projectFilesData.length === 0) && (
                                                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-4 text-center border border-zinc-200 border-dashed rounded-2xl">No assets uploaded.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Danger Zone */}
                                        <div className="pt-6">
                                            <button
                                                onClick={() => handleDeleteProject(pId)}
                                                disabled={loadingDetails}
                                                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                Permanently Delete Project
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* MOBİL HEADER */}
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

            {/* ANA SIDEBAR (GÜNCELLENDİ) */}
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
                                if (item.action) { item.action(); } 
                                else { setActiveTab(item.id); setIsMobileMenuOpen(false); }
                            }}
                            className={`relative w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${activeTab === item.id && !item.action ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}
                        >
                            <span>{item.label}</span>
                            {item.badgeText && (
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest shadow-sm">{item.badgeText}</span>
                            )}
                        </button>
                    ))}

                    <div className="pt-4 mt-4 border-t border-zinc-100 space-y-1.5">
                        <button
                            onClick={() => router.push('/admin/invoice-generator')}
                            className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all text-zinc-500 hover:bg-zinc-50 hover:text-black"
                        >
                            Invoice Generator
                        </button>
                        
                        {/* TAŞINAN ACTION BUTONLARI */}
                        <button
                            onClick={() => { setActiveTab('add_client'); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'add_client' ? 'bg-black text-white shadow-md' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200 hover:border-black hover:text-black'}`}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                            Register Entity
                        </button>
                        <button
                            onClick={() => { setActiveTab('add_project'); setIsMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === 'add_project' ? 'bg-black text-white shadow-md' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100 border border-zinc-200 hover:border-black hover:text-black'}`}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                            Deploy Project
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

            {/* ANA ÇALIŞMA ALANI */}
            <main className="flex-1 h-full overflow-y-auto md:pl-64 p-6 lg:p-10 relative z-0 mt-16 md:mt-0 bg-[#f8f9fa]">

                {activeTab === 'overview' && (
                    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-500 space-y-10 pb-20">
                        
                        {/* HEADER */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-6 border-b border-zinc-200">
                            <div className="flex items-center gap-4">
                                <h1 className="text-[40px] md:text-[50px] font-black tracking-tighter uppercase text-zinc-900 leading-none">Workspace</h1>
                                <button onClick={fetchData} className="p-2.5 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-all active:scale-95 text-zinc-500 hover:text-zinc-900 shadow-sm">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-4 py-2 border border-zinc-200 rounded-full shadow-sm">
                                <div className={`w-2 h-2 rounded-full ${isSystemDown ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isSystemDown ? 'text-red-500' : 'text-zinc-500'}`}>
                                    {isSystemDown ? 'SYSTEM OUTAGE' : 'Node Operational'}
                                </span>
                            </div>
                        </div>

                        {/* GÜNCELLENMİŞ KPI KUTULARI (Daha Anlaşılır) */}
                        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { l: "Total Registered Clients", v: clients.length, highlight: false },
                                { l: "Active Deployments", v: projects.filter(p => p.status === 'Development' || p.status === 'Testing').length, highlight: false },
                                { l: "Support Actions Needed", v: supportTicketsCount + newDiscoveryCount, highlight: (supportTicketsCount + newDiscoveryCount) > 0 },
                                { l: "Pending Invoices", v: clientInvoices.filter(i => i.status === 'unpaid').length, highlight: false }
                            ].map((stat, i) => (
                                <div key={i} className={`p-6 md:p-8 rounded-[32px] border shadow-sm transition-colors ${stat.highlight ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-black'}`}>
                                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 leading-tight ${stat.highlight ? 'text-zinc-400' : 'text-zinc-400'}`}>{stat.l}</p>
                                    <p className="text-5xl md:text-6xl font-black font-mono tracking-tighter">{stat.v}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            
                            {/* SOL/ORTA SÜTUN: PROJELER */}
                            <div className="xl:col-span-2 space-y-10">
                                
                                {/* ACTIVE ENGINEERING SESSIONS (SADELEŞTİRİLMİŞ ÖNİZLEME) */}
                                <div>
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-6 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        Active Engineering Sessions
                                    </h2>
                                    {activeProjects.length === 0 ? (
                                        <div className="bg-white border border-zinc-200 border-dashed rounded-[32px] p-10 flex flex-col items-center justify-center min-h-[150px] shadow-sm">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No active sessions.</p>
                                            <p className="text-[9px] font-bold text-zinc-400 mt-2">Click a project in the Queue to start a session.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {activeProjects.map((p: any) => {
                                                const timer = timers[p.id];
                                                const currentProg = localProgress[p.id] ?? p.progress_percent;
                                                return (
                                                    <div key={p.id} onClick={() => handleOpenProjectDetails(p)} className="bg-white p-8 rounded-[32px] border-2 border-zinc-900 shadow-md flex flex-col w-full hover:bg-zinc-50 transition-colors cursor-pointer group">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="pr-4">
                                                                <p className="font-black text-2xl uppercase tracking-tighter text-zinc-900 group-hover:underline decoration-2 underline-offset-4">{p.name}</p>
                                                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{p.clients?.full_name}</p>
                                                            </div>
                                                            <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 px-3 py-1 rounded-lg text-[8px] font-black uppercase">{p.status}</span>
                                                        </div>
                                                        <div className="mb-6">
                                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Session Time</span>
                                                            <span className="text-3xl font-black font-mono text-emerald-600">{formatTime(timer?.displayTime || 0)}</span>
                                                        </div>
                                                        <div className="mt-auto pt-4 border-t border-zinc-100">
                                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                                                <span>Load</span><span>{currentProg}%</span>
                                                            </div>
                                                            <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-black transition-all duration-300" style={{ width: `${currentProg}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* QUEUE STATUS (IDLE PROJECTS) */}
                                {idleProjects.length > 0 && (
                                    <div>
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-6">Queue Status (Idle)</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {idleProjects.map((p: any) => {
                                                const timer = timers[p.id];
                                                const currentProg = localProgress[p.id] ?? p.progress_percent;
                                                return (
                                                    <div key={p.id} onClick={() => handleOpenProjectDetails(p)} className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col w-full hover:border-black cursor-pointer transition-colors group">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="pr-4">
                                                                <p className="font-black text-2xl uppercase tracking-tighter text-zinc-900 group-hover:underline decoration-2 underline-offset-4">{p.name}</p>
                                                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 truncate">{p.clients?.full_name}</p>
                                                            </div>
                                                            <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase">{p.status}</span>
                                                        </div>
                                                        <div className="mb-6 opacity-60">
                                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Total Time</span>
                                                            <span className="text-3xl font-black font-mono text-zinc-900">{formatTime(timer?.displayTime || 0)}</span>
                                                        </div>
                                                        <div className="mt-auto pt-4 border-t border-zinc-100 opacity-60">
                                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                                                                <span>Load</span><span>{currentProg}%</span>
                                                            </div>
                                                            <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-black transition-all duration-300" style={{ width: `${currentProg}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SAĞ SÜTUN: INTERNAL MEMOS */}
                            <div className="xl:col-span-1">
                                <div className="flex flex-col bg-white border border-zinc-200 rounded-[32px] p-6 md:p-8 shadow-sm h-full max-h-[600px] sticky top-8">
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
                                            className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3.5 rounded-xl text-xs font-bold outline-none focus:border-zinc-400 placeholder:text-zinc-400 transition-colors" 
                                        />
                                        <button type="submit" disabled={!newQuickNote.trim()} className="bg-zinc-900 text-white w-12 h-12 flex items-center justify-center rounded-xl hover:bg-black disabled:opacity-50 transition-colors shadow-sm shrink-0">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        </button>
                                    </form>
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                        {quickNotes.map(note => (
                                            <div key={note.id} className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex justify-between items-start group transition-colors hover:border-zinc-200">
                                                <div>
                                                    <p className="text-xs font-bold text-zinc-700 leading-relaxed">{note.note}</p>
                                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-2 block">{new Date(note.created_at).toLocaleString()}</span>
                                                </div>
                                                <button onClick={() => deleteQuickNote(note.id)} className="text-zinc-300 hover:text-red-500 transition-colors p-1.5 bg-white hover:bg-red-50 border border-zinc-100 rounded-lg ml-3 shadow-sm">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADD CLIENT TAB */}
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

                {/* ADD PROJECT TAB */}
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