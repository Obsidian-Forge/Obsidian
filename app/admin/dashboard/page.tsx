"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPESCRIPT INTERFACES ---
interface Client {
    id: string;
    full_name: string;
    email: string;
    company_name?: string;
    phone_number?: string;
    address?: string;
    access_code: string;
    archived_at?: string;
    created_at: string;
}

interface Project {
    id: string;
    client_id: string;
    name: string;
    status: string;
    progress_percent: number;
    archived_at?: string;
    created_at: string;
    clients?: any; // <--- ÇÖZÜM: Katı kuralları kaldırdık, her şeyi kabul edecek.
}

interface Invoice {
    id: string;
    client_id: string;
    file_name: string;
    file_url: string;
    status: string;
    created_at: string;
    clients?: {
        full_name: string;
    };
}

interface SystemStatus {
    id: string;
    label: string;
    status: string;
}

interface QuickNote {
    id: string;
    content: string;
    created_at: string;
}

export default function AdminDashboardPage() {
    const router = useRouter();

    // AKTİF SEKME (Sadece dashboard'da kalan özellikler için)
    const [activeTab, setActiveTab] = useState('overview');

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // DİNAMİK SELAMLAMA STATE
    const [greeting, setGreeting] = useState('Good morning.');

    // TOAST NOTIFICATION
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // CORE DATA STATES
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<SystemStatus[]>([]);
    const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
    const [supportTicketsCount, setSupportTicketsCount] = useState(0);
    const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
    const [newQuickNote, setNewQuickNote] = useState('');
    const [discoveryCount, setDiscoveryCount] = useState(0);

    // FORMS
    const [clientForm, setClientForm] = useState({ email: '', fullName: '', companyName: '', phone: '', address: '' });
    const [projectForm, setProjectForm] = useState({ clientId: '', name: '', progress: 0 });

    // MODAL STATES 
    const [selectedProjectUpdates, setSelectedProjectUpdates] = useState<any>(null);
    const [newUpdateMessage, setNewUpdateMessage] = useState('');
    const [newUpdateProgress, setNewUpdateProgress] = useState(0);
    const [savingUpdate, setSavingUpdate] = useState(false);

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [adminPasswordForm, setAdminPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
    const [savingPassword, setSavingPassword] = useState(false);

    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning.');
        else if (hour < 18) setGreeting('Good afternoon.');
        else setGreeting('Good evening.');

        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');

            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') {
                router.push('/client/login');
            } else {
                setIsAdmin(true);
            }
        };
        checkAdmin();
        fetchData();

        const channel = supabase.channel('admin-dashboard-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'system_status' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_invoices' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'quick_notes' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_discovery' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_updates' }, () => {
                if (selectedProjectUpdates) fetchProjectUpdates(selectedProjectUpdates.id);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router, selectedProjectUpdates]);

    const fetchData = async () => {
        try {
            // 1. Clients
            const { data: cData } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
            if (cData) setClients(cData.filter(c => !c.archived_at));

            // 2. Projects (GÜNCELLENDİ: Foreign Key karmaşasını önlemek için '!inner' kullanıldı)
            // Supabase'e direkt olarak clients tablosundaki full_name ve access_code alanlarını getirmesini söylüyoruz.
            const { data: pData, error: pError } = await supabase
                .from('projects')
                .select(`
                    id, client_id, name, status, progress_percent, archived_at, created_at,
                    clients (full_name, access_code)
                `)
                .order('created_at', { ascending: false });

            if (pError) {
                console.warn("Projects relation error:", pError.message);
                showToast("Database Relation Error: " + pError.message, "error");
            }
            // [cite: 132]
            if (pData) {
                const active = pData.filter(p => (p.progress_percent < 100 && p.status !== 'deployed') && !p.archived_at);
                const completed = pData.filter(p => (p.progress_percent >= 100 || p.status === 'deployed') && !p.archived_at);

                setProjects(active as any); // "as any" ekleyerek tip kontrolünü esnettik
                setCompletedProjects(completed as any);
            }
            // 3. System Status 
            const { data: sData } = await supabase.from('system_status').select('*').order('label');
            if (sData) setSystemStatuses(sData);

            // 4. Invoices 
            const { data: iData } = await supabase.from('client_invoices').select('*, clients(full_name)').eq('status', 'unpaid').order('created_at', { ascending: false });
            if (iData) setClientInvoices(iData);

            // 5. Support Tickets
            const { data: tData } = await supabase.from('support_tickets').select('id').eq('status', 'open');
            if (tData) setSupportTicketsCount(tData.length);

            // 6. Quick Notes
            const { data: nData } = await supabase.from('quick_notes').select('*').order('created_at', { ascending: false });
            if (nData) setQuickNotes(nData);

            // 7. Discovery (Intelligence) 
            const { data: dData } = await supabase.from('project_discovery').select('id').eq('status', 'pending');
            if (dData) setDiscoveryCount(dData.length);

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // --- CRUD: CLIENTS ---
    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        try {
            const { error } = await supabase.from('clients').insert({
                email: clientForm.email,
                full_name: clientForm.fullName,
                company_name: clientForm.companyName,
                phone_number: clientForm.phone,
                address: clientForm.address,
                access_code: accessCode
            }).select().single();

            if (error) throw error;

            try {
                await fetch('/api/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: 'access_code',
                        email: clientForm.email,
                        code: accessCode,
                        clientName: clientForm.fullName,
                        loginLink: `${window.location.origin}/client/login`
                    })
                });
            } catch (mailErr) {
                console.error("Email API Error:", mailErr);
            }

            showToast('Entity registered securely.', 'success');
            setClientForm({ email: '', fullName: '', companyName: '', phone: '', address: '' });
            fetchData();
            router.push('/admin/clients');
        } catch (err: any) {
            showToast('Error registering entity: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // --- CRUD: PROJECTS ---
    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectForm.clientId) return showToast('Please select a client.', 'error');
        setLoading(true);

        try {
            const { data: project, error } = await supabase.from('projects').insert({
                client_id: projectForm.clientId,
                name: projectForm.name,
                status: 'planning',
                progress_percent: projectForm.progress
            }).select().single();

            if (error) throw error;

            await supabase.from('project_updates').insert({
                project_id: project.id,
                message: 'Architecture provisioning initiated.',
                progress_at_time: projectForm.progress
            });

            showToast('Deployment initialized.', 'success');
            setProjectForm({ clientId: '', name: '', progress: 0 });
            fetchData();
            setActiveTab('active_queue');
        } catch (err: any) {
            showToast('Error initiating deployment: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateProjectProgress = async (id: string, newProgress: number, newStatus: string, message: string) => {
        try {
            const { error } = await supabase.from('projects').update({
                progress_percent: newProgress,
                status: newStatus
            }).eq('id', id);
            if (error) throw error;

            if (message.trim()) {
                await supabase.from('project_updates').insert({
                    project_id: id,
                    message: message,
                    progress_at_time: newProgress
                });
            }
            showToast('Architecture load updated.', 'success');
            fetchData();
        } catch (err: any) {
            showToast('Error updating deployment: ' + err.message, 'error');
        }
    };

    const deleteProject = async (id: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this deployment?')) return;
        try {
            await supabase.from('project_updates').delete().eq('project_id', id);
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            showToast('Deployment deleted.', 'success');
            fetchData();
            if (selectedProjectUpdates?.id === id) setSelectedProjectUpdates(null);
        } catch (err: any) {
            showToast('Error deleting deployment: ' + err.message, 'error');
        }
    };

    const markProjectAsCompleted = async (project: any) => {
        if (!window.confirm('Mark this project as COMPLETED? It will be moved to Completed Builds.')) return;
        setSavingUpdate(true);
        try {
            const { error } = await supabase.from('projects').update({
                progress_percent: 100,
                status: 'deployed'
            }).eq('id', project.id);

            if (error) throw error;

            await supabase.from('project_updates').insert({
                project_id: project.id,
                message: 'System fully deployed and handed over to the client. Environment is now Operational.',
                progress_at_time: 100
            });

            showToast('Project moved to Completed Builds.', 'success');
            setSelectedProjectUpdates(null);
            fetchData();
            setActiveTab('completed_projects');
        } catch (err: any) {
            showToast('Error completing project: ' + err.message, 'error');
        } finally {
            setSavingUpdate(false);
        }
    };

    // --- PROJECT UPDATES (TIMELINE MODAL) ---
    const fetchProjectUpdates = async (projectId: string) => {
        try {
            const { data, error } = await supabase.from('project_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
            if (error) throw error;
            if (selectedProjectUpdates) {
                setSelectedProjectUpdates({ ...selectedProjectUpdates, updatesList: data || [] });
            }
        } catch (error) {
            console.error("Error fetching updates", error);
        }
    };

    const openProjectUpdatesModal = async (project: any) => {
        setSelectedProjectUpdates({ ...project, updatesList: [] });
        setNewUpdateProgress(project.progress_percent);
        try {
            const { data } = await supabase.from('project_updates').select('*').eq('project_id', project.id).order('created_at', { ascending: false });
            setSelectedProjectUpdates({ ...project, updatesList: data || [] });
        } catch (err) { }
    };

    const handleAddUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUpdateMessage.trim()) return;
        setSavingUpdate(true);
        try {
            await supabase.from('projects').update({ progress_percent: newUpdateProgress }).eq('id', selectedProjectUpdates.id);
            const { error } = await supabase.from('project_updates').insert({
                project_id: selectedProjectUpdates.id,
                message: newUpdateMessage,
                progress_at_time: newUpdateProgress
            });
            if (error) throw error;
            setNewUpdateMessage('');
            fetchProjectUpdates(selectedProjectUpdates.id);
            fetchData();
            showToast('Update pushed to timeline.', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setSavingUpdate(false);
        }
    };

    const deleteUpdate = async (updateId: string) => {
        if (!window.confirm('Delete this log entry?')) return;
        try {
            const { error } = await supabase.from('project_updates').delete().eq('id', updateId);
            if (error) throw error;
            fetchProjectUpdates(selectedProjectUpdates.id);
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    // --- SYSTEM STATUS & NOTES ---
    const updateSystemStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase.from('system_status').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            showToast('Core node updated.', 'success');
            fetchData();
        } catch (err: any) {
            showToast('Error: ' + err.message, 'error');
        }
    };

    const addQuickNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuickNote.trim()) return;
        try {
            const { error } = await supabase.from('quick_notes').insert({ content: newQuickNote });
            if (error) throw error;
            setNewQuickNote('');
            fetchData();
        } catch (err: any) {
            showToast('Error saving memo.', 'error');
        }
    };

    const deleteQuickNote = async (id: string) => {
        try {
            await supabase.from('quick_notes').delete().eq('id', id);
            fetchData();
        } catch (err) { }
    };

    // --- ADMIN SETTINGS ---
    const handleUpdateAdminPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword) {
            return showToast("Passwords do not match", "error");
        }
        if (adminPasswordForm.newPassword.length < 6) {
            return showToast("Password too short", "error");
        }

        setSavingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: adminPasswordForm.newPassword });
            if (error) throw error;
            showToast("Admin access updated successfully.", "success");
            setAdminPasswordForm({ newPassword: '', confirmPassword: '' });
            setIsSettingsModalOpen(false);
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setSavingPassword(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    if (!isAdmin) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-bold uppercase text-[10px] tracking-widest text-zinc-400">Authenticating Secure Node...</div>;

    return (
        <div className="h-screen overflow-hidden bg-[#FAFAFA] text-zinc-900 font-sans flex flex-col md:flex-row relative selection:bg-black selection:text-white">

            {/* GLOBAL TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                            }`}
                    >
                        {toast.type === 'success' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                        {toast.type === 'error' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                        {toast.type === 'info' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SAF BEYAZ & RASTER ARKA PLAN */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.25]">
                <div className="absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_50%,transparent_100%)] bg-[linear-gradient(#d4d4d8_1px,transparent_1px),linear-gradient(90deg,#d4d4d8_1px,transparent_1px)]" />
            </div>

            {/* MOBİL HEADER */}
            <div className="md:hidden flex items-center justify-between bg-white border-b border-zinc-200 p-4 sticky top-0 z-50 shadow-sm">
                <h1 className="text-xl font-light tracking-tight text-black">Novatrum Command</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-zinc-50 rounded-lg appearance-none">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path></svg>
                </button>
            </div>

            {/* SIDEBAR (Tüm Linkler Gerçek Route'lara Bağlandı) */}
            <aside className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-72 bg-white border-r border-zinc-200 flex-col h-full z-40 shadow-sm shrink-0`}>
                
                {/* 1. LOGO ALANI - shrink-0 (Sıkışmayı önler, yüksekliği sabitler) */}
                <div className="p-8 hidden md:block border-b border-zinc-100 shrink-0">
                    <h1 className="text-2xl font-light tracking-tight text-black">Novatrum<br /><span className="font-medium text-zinc-400 text-lg">Command</span></h1>
                </div>

                {/* 2. SCROLL LİNKLERİ - flex-1, overflow-y-auto ve min-h-0 (Kalan alanı doldurur ve scroll olur) */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar min-h-0">

                    {/* OVERVIEW */}
                    <button onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none ${activeTab === 'overview' ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        Overview
                    </button>

                    {/* SYSTEM STATUS */}
                    <button onClick={() => router.push('/admin/status')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none text-zinc-500 hover:bg-zinc-50 hover:text-black">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                        System Status
                    </button>

                    {/* EMAIL MAKER */}
                    <button onClick={() => router.push('/admin/email-maker')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none text-zinc-500 hover:bg-zinc-50 hover:text-black">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        Email Maker
                    </button>

                    <div className="pt-4 pb-2"><p className="px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Database</p></div>

                    {/* ACTIVE DATABASE */}
                    <button onClick={() => router.push('/admin/clients')} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none text-zinc-500 hover:bg-zinc-50 hover:text-black">
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path></svg>
                            Active Database
                        </div>
                        <span className="bg-black text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm">{clients.length}</span>
                    </button>

                    {/* INTELLIGENCE / DISCOVERIES */}
                    <button onClick={() => router.push('/admin/discoveries')} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none text-zinc-500 hover:bg-zinc-50 hover:text-black">
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                            Intelligence
                        </div>
                        {discoveryCount > 0 && <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm">{discoveryCount}</span>}
                    </button>

                    {/* REGISTER ENTITY */}
                    <button onClick={() => { setActiveTab('create_client'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none ${activeTab === 'create_client' ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        Register Entity
                    </button>

                    {/* ARCHIVED ENTITIES */}
                    <button onClick={() => router.push('/admin/archive')} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none text-zinc-500 hover:bg-zinc-50 hover:text-black">
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                            Archived Entities
                        </div>
                    </button>

                    <div className="pt-4 pb-2"><p className="px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Deployments</p></div>

                    {/* ACTIVE QUEUE */}
                    <button onClick={() => { setActiveTab('active_queue'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none ${activeTab === 'active_queue' ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}>
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                            Active Queue
                        </div>
                        <span className="bg-black text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm">{projects.length}</span>
                    </button>

                    {/* DEPLOY PROJECT */}
                    <button onClick={() => { setActiveTab('create_project'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none ${activeTab === 'create_project' ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                        Deploy Project
                    </button>

                    {/* COMPLETED BUILDS */}
                    <button onClick={() => { setActiveTab('completed_projects'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none ${activeTab === 'completed_projects' ? 'bg-zinc-100 text-black shadow-sm' : 'text-zinc-500 hover:bg-zinc-50 hover:text-black'}`}>
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Completed Builds
                        </div>
                        <span className="bg-zinc-200 text-zinc-600 text-[9px] px-2 py-0.5 rounded-full">{completedProjects.length}</span>
                    </button>

                    <div className="pt-4 pb-2"><p className="px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Financial</p></div>

                    {/* REVENUE LEDGER */}
                    <button onClick={() => router.push('/admin/ledger')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none text-zinc-500 hover:bg-zinc-50 hover:text-black">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
                        Revenue Ledger
                    </button>

                    {/* INVOICE GENERATOR */}
                    <button onClick={() => router.push('/admin/invoice-generator')} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none text-zinc-500 hover:bg-zinc-50 hover:text-black">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Invoice Generator
                    </button>

                    <div className="pt-4 pb-2"><p className="px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Internal</p></div>

                    {/* SUPPORT DESK */}
                    <button onClick={() => router.push('/admin/support')} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 hover:text-black transition-all appearance-none">
                        <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            Support Desk
                        </div>
                        {supportTicketsCount > 0 && <span className="bg-emerald-500 text-white text-[9px] px-2 py-0.5 rounded-full shadow-sm">{supportTicketsCount}</span>}
                    </button>

                    {/* ADMIN SETTINGS */}
                    <button onClick={() => setIsSettingsModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all appearance-none text-zinc-500 hover:bg-zinc-50 hover:text-black">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Admin Settings
                    </button>

                </nav>

                {/* 3. FOOTER ALANI - shrink-0 eklendi (Sıkışmayı önler, en altta sabit durmasını sağlar) */}
                <div className="p-4 border-t border-zinc-200 bg-zinc-50 shrink-0">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors shadow-sm appearance-none">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7"></path></svg>
                        Disconnect
                    </button>
                </div>
                
            </aside>

            {/* MAIN CONTENT YÖNETİMİ (Sekmelere Göre İçerik Değişir) */}
            <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto w-full relative z-10 custom-scrollbar">

                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-12 max-w-7xl mx-auto animate-in fade-in duration-500">

                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 pb-8">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-light tracking-tight text-black">{greeting}</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">System metrics are nominal. Ready for commands.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Core Online</span>
                                </span>
                            </div>
                        </header>

                        {/* NUMBERS GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { label: 'Active Entities', value: clients.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                                { label: 'Deployments', value: projects.length, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                                { label: 'Open Tickets', value: supportTicketsCount, icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
                                { label: 'Unpaid Invoices', value: clientInvoices.length, icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-[32px] border border-zinc-200 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-6">
                                        <svg className="w-4 h-4 text-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{stat.label}</p>
                                        <p className="text-3xl md:text-4xl font-light tracking-tight">{stat.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                            {/* SOL SÜTUN - OVERVIEW PROJECTS */}
                            <div className="xl:col-span-2 space-y-8">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-light tracking-tight mb-6">Active Overview</h2>
                                    {projects.length === 0 && clients.length === 0 ? (
                                        <div className="py-12 text-center border border-dashed border-zinc-200 rounded-[32px] bg-white">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Database is empty.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {projects.slice(0, 4).map((p) => {
                                                const isRevoked = (p.clients as any)?.[0]?.access_code?.startsWith('REVOKED');
                                                return (
                                                    <div key={p.id} className={`p-6 md:p-8 rounded-[32px] border shadow-sm transition-all relative group flex flex-col ${isRevoked ? 'bg-red-50/50 border-red-200' : 'bg-white border-zinc-200'}`}>

                                                        {/* YENİ: Edit Modal İkonu Eklendi */}
                                                        <button
                                                            onClick={() => openProjectUpdatesModal(p)}
                                                            className="absolute top-6 right-6 p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-10 appearance-none shadow-sm bg-zinc-50 text-zinc-400 hover:bg-zinc-200 hover:text-black"
                                                            title="Manage Timeline"
                                                        >
                                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                        </button>

                                                        <div className="flex flex-col mb-6">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                {isRevoked ? (
                                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest bg-red-100 text-red-600 border border-red-200 animate-pulse shadow-sm">Termination Requested</span>
                                                                ) : (
                                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-600 border border-zinc-200">{p.status}</span>
                                                                )}
                                                            </div>
                                                            <h3 className="text-xl font-light tracking-tight text-zinc-900 mb-1 truncate pr-8" title={p.name}>{p.name}</h3>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 truncate">{(p.clients as any)?.[0]?.full_name}</p>
                                                        </div>
                                                        <div className="mt-auto">
                                                            <div className="flex justify-between items-end mb-2">
                                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isRevoked ? 'text-red-500' : 'text-zinc-500'}`}>Load</span>
                                                                <span className={`text-lg font-light font-mono ${isRevoked ? 'text-red-600' : 'text-black'}`}>{p.progress_percent}%</span>
                                                            </div>
                                                            <div className={`w-full h-1 rounded-full overflow-hidden ${isRevoked ? 'bg-red-200/50' : 'bg-zinc-100'}`}>
                                                                <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress_percent}%` }} className={`h-full ${isRevoked ? 'bg-red-500' : 'bg-black'}`} transition={{ duration: 1 }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <button onClick={() => setActiveTab('active_queue')} className="mt-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors flex items-center gap-2">
                                        View all deployments <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4-4m4-4H3"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* SAĞ SÜTUN - SYSTEM & NOTES */}
                            <div className="xl:col-span-1 space-y-8">
                                {/* SYSTEM STATUS */}
                                <div>
                                    <h2 className="text-xl md:text-2xl font-light tracking-tight mb-6">System Core</h2>
                                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-4">
                                        {systemStatuses.length === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No nodes running.</p>}
                                        {systemStatuses.map(sys => (
                                            <div key={sys.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl group">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">{sys.label}</span>
                                                <select
                                                    value={sys.status}
                                                    onChange={(e) => updateSystemStatus(sys.id, e.target.value)}
                                                    className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg outline-none cursor-pointer border appearance-none transition-colors ${sys.status === 'operational' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                        sys.status === 'degraded' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                            'bg-red-50 text-red-600 border-red-200'
                                                        }`}
                                                >
                                                    <option value="operational">Operational</option>
                                                    <option value="degraded">Degraded</option>
                                                    <option value="down">Outage</option>
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* QUICK NOTES */}
                                <div>
                                    <h2 className="text-xl md:text-2xl font-light tracking-tight mb-6">Memo Pad</h2>
                                    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-zinc-200 shadow-sm">
                                        <form onSubmit={addQuickNote} className="mb-6 flex gap-2">
                                            <input type="text" value={newQuickNote} onChange={e => setNewQuickNote(e.target.value)} placeholder="Write a quick note..." className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-xs font-medium outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none" />
                                            <button type="submit" className="bg-black text-white px-4 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-sm appearance-none shrink-0">Add</button>
                                        </form>
                                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                            {quickNotes.length === 0 && <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-center py-4">No memos yet.</p>}
                                            {quickNotes.map(note => (
                                                <div key={note.id} className="group flex justify-between items-start p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                                                    <p className="text-sm font-medium text-zinc-800 pr-4 leading-relaxed">{note.content}</p>
                                                    <button onClick={() => deleteQuickNote(note.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 shrink-0 appearance-none">
                                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. ACTIVE QUEUE (PROJECTS) TAB */}
                {activeTab === 'active_queue' && (
                    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
                        <header className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-2">Active Queue</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Manage all ongoing infrastructure deployments.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {projects.length === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center py-10 w-full col-span-full">No active deployments.</p>}
                            {projects.map((p) => {
                                const isRevoked = (p.clients as any)?.[0]?.access_code?.startsWith('REVOKED');
                                return (
                                    <div key={p.id} className={`p-6 md:p-8 rounded-[32px] border shadow-sm transition-all relative group flex flex-col ${isRevoked ? 'bg-red-50/50 border-red-200' : 'bg-white border-zinc-200'}`}>

                                        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                                            <button onClick={() => openProjectUpdatesModal(p)} className={`p-2.5 rounded-xl appearance-none shadow-sm ${isRevoked ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-700' : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-200 hover:text-black'}`} title="Manage Timeline">
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            </button>
                                            <button onClick={() => deleteProject(p.id)} className={`p-2.5 rounded-xl appearance-none shadow-sm ${isRevoked ? 'bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-700' : 'bg-zinc-50 text-zinc-400 hover:bg-red-50 hover:text-red-500'}`} title="Delete Project">
                                                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        </div>

                                        <div className="flex flex-col mb-8 pr-20">
                                            <div className="flex items-center gap-2 mb-3">
                                                {isRevoked ? (
                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest bg-red-100 text-red-600 border border-red-200 animate-pulse shadow-sm">Termination Requested</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-600 border border-zinc-200">{p.status}</span>
                                                )}
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">ID: {p.id.split('-')[0].toUpperCase()}</span>
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-light tracking-tight text-zinc-900 mb-1 truncate" title={p.name}>{p.name}</h3>
                                            <p className="text-xs font-medium text-zinc-500 truncate" title={(p.clients as any)?.[0]?.full_name}>{(p.clients as any)?.[0]?.full_name}</p>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex justify-between items-end mb-3">
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isRevoked ? 'text-red-500' : 'text-zinc-500'}`}>Architecture Load</span>
                                                <span className={`text-2xl font-light font-mono ${isRevoked ? 'text-red-600' : 'text-black'}`}>{p.progress_percent}%</span>
                                            </div>
                                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isRevoked ? 'bg-red-200/50' : 'bg-zinc-100'}`}>
                                                <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress_percent}%` }} className={`h-full ${isRevoked ? 'bg-red-500' : 'bg-black'}`} transition={{ duration: 1 }} />
                                            </div>
                                        </div>

                                        <form onSubmit={(e) => { e.preventDefault(); updateProjectProgress(p.id, parseInt((e.target as any).progress.value), (e.target as any).status.value, (e.target as any).message.value); }} className={`mt-auto pt-6 border-t ${isRevoked ? 'border-red-100' : 'border-zinc-100'}`}>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                                                <div className="md:col-span-2">
                                                    <input type="text" name="message" required placeholder="Log entry / Update message..." className={`w-full p-3.5 rounded-xl text-xs font-medium outline-none focus:ring-1 appearance-none ${isRevoked ? 'bg-red-50/50 border border-red-200 focus:border-red-400 focus:ring-red-400 placeholder-red-300 text-red-900' : 'bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-black placeholder-zinc-400 text-black'}`} />
                                                </div>
                                                <div>
                                                    <select name="status" defaultValue={p.status} className={`w-full p-3.5 rounded-xl text-xs font-medium outline-none focus:ring-1 appearance-none cursor-pointer ${isRevoked ? 'bg-red-50/50 border border-red-200 focus:border-red-400 focus:ring-red-400 text-red-900' : 'bg-zinc-50 border border-zinc-200 focus:border-black focus:ring-black text-black'}`}>
                                                        <option value="planning">Planning</option>
                                                        <option value="building">Building</option>
                                                        <option value="review">Review</option>
                                                        <option value="deployed">Deployed</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 flex items-center gap-3">
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isRevoked ? 'text-red-400' : 'text-zinc-400'}`}>Load</span>
                                                    <input type="range" name="progress" min="0" max="100" defaultValue={p.progress_percent} className={`flex-1 h-1.5 appearance-none cursor-pointer rounded-full ${isRevoked ? 'bg-red-200 accent-red-600' : 'bg-zinc-200 accent-black'}`} />
                                                </div>
                                                <button type="submit" disabled={loading} className={`px-5 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest active:scale-95 transition-all shadow-sm appearance-none shrink-0 ${isRevoked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-black text-white hover:bg-zinc-800'}`}>
                                                    Push Update
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. COMPLETED BUILDS TAB */}
                {activeTab === 'completed_projects' && (
                    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
                        <header className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-2">Completed Builds</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fully deployed and operational environments.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {completedProjects.length === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center py-10 w-full col-span-full">No completed deployments.</p>}
                            {completedProjects.map((p) => {
                                return (
                                    <div key={p.id} className="p-6 md:p-8 rounded-[32px] border shadow-sm bg-zinc-50 border-zinc-200 flex flex-col relative group">
                                        <button onClick={() => deleteProject(p.id)} className="absolute top-4 right-4 p-2 rounded-xl appearance-none shadow-sm opacity-0 group-hover:opacity-100 bg-white text-zinc-400 hover:bg-red-50 hover:text-red-500 transition-all" title="Delete Project">
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Operational</p>
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-light tracking-tight text-zinc-900 mb-1 truncate">{p.name}</h3>
                                        <p className="text-xs font-medium text-zinc-500 truncate">{(p.clients as any)?.[0]?.full_name}</p>
                                        <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-between items-center">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Load: 100%</span>
                                            <button onClick={() => openProjectUpdatesModal(p)} className="text-[9px] font-bold uppercase tracking-widest text-black hover:underline appearance-none">View Logs</button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 4. CREATE CLIENT TAB */}
                {activeTab === 'create_client' && (
                    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
                        <header className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-2">New Entity</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Register a new client into the secure database.</p>
                        </header>
                        <form onSubmit={handleCreateClient} className="bg-white p-8 md:p-12 rounded-[40px] border border-zinc-200 shadow-sm space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Full Name</label>
                                    <input type="text" required value={clientForm.fullName} onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Email Address</label>
                                    <input type="email" required value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Company</label>
                                    <input type="text" value={clientForm.companyName} onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Phone</label>
                                    <input type="text" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Billing Address</label>
                                    <textarea value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all h-24 resize-none appearance-none" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 mt-4 shadow-md active:scale-95 transition-all appearance-none flex items-center justify-center gap-3">
                                {loading ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Register Entity'}
                            </button>
                        </form>
                    </div>
                )}

                {/* 5. CREATE PROJECT TAB */}
                {activeTab === 'create_project' && (
                    <div className="max-w-xl mx-auto animate-in fade-in duration-500">
                        <header className="mb-10">
                            <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-2">Deploy Project</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Initialize a new infrastructure environment for a client.</p>
                        </header>
                        <form onSubmit={handleCreateProject} className="bg-white p-8 md:p-12 rounded-[40px] border border-zinc-200 shadow-sm space-y-6">
                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Select Owner Entity</label>
                                <select required value={projectForm.clientId} onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none cursor-pointer">
                                    <option value="" disabled>Select a client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Project Name</label>
                                <input type="text" required placeholder="e.g. E-Commerce Backend" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                            </div>
                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                                    <span>Initial Load Architecture</span>
                                    <span className="text-black text-xs font-mono">{projectForm.progress}%</span>
                                </div>
                                <input type="range" min="0" max="100" value={projectForm.progress} onChange={(e) => setProjectForm({ ...projectForm, progress: parseInt(e.target.value) })} className="w-full accent-black h-1.5 bg-zinc-200 appearance-none cursor-pointer rounded-full" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 mt-4 shadow-md active:scale-95 transition-all appearance-none flex items-center justify-center gap-3">
                                {loading ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Initiate Deployment'}
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* ========================================================================= */}
            {/* ============================== MODALS ================================= */}
            {/* ========================================================================= */}

            {/* PROJECT TIMELINE MODAL */}
            <AnimatePresence>
                {selectedProjectUpdates && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white border border-zinc-200 shadow-2xl rounded-[40px] w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">

                            <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                <div>
                                    <h2 className="text-2xl font-light tracking-tight text-zinc-900 truncate max-w-sm">{selectedProjectUpdates.name}</h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Timeline Management</p>
                                </div>
                                <button onClick={() => setSelectedProjectUpdates(null)} className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100 appearance-none">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>

                            {/* PROJECT COMPLETION BUTTON (Yeni) */}
                            {selectedProjectUpdates.progress_percent < 100 && (
                                <div className="px-8 py-5 border-b border-zinc-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Ready for Production?</p>
                                    <button
                                        onClick={() => markProjectAsCompleted(selectedProjectUpdates)}
                                        className="px-6 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        Complete Deployment (100%)
                                    </button>
                                </div>
                            )}

                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-zinc-50/30">
                                <form onSubmit={handleAddUpdate} className="bg-white p-6 rounded-3xl border border-zinc-200 mb-8 shadow-sm">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Push New Update</h3>
                                    <textarea required value={newUpdateMessage} onChange={e => setNewUpdateMessage(e.target.value)} placeholder="Describe the deployment milestone..." className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3.5 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all h-24 resize-none mb-4 appearance-none" />
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 flex items-center gap-3">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Load</span>
                                            <input type="range" min="0" max="100" value={newUpdateProgress} onChange={e => setNewUpdateProgress(parseInt(e.target.value))} className="flex-1 h-1.5 bg-zinc-200 accent-black rounded-full appearance-none cursor-pointer" />
                                            <span className="text-xs font-mono font-bold w-8 text-right">{newUpdateProgress}%</span>
                                        </div>
                                        <button type="submit" disabled={savingUpdate} className="px-6 py-3 bg-black text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm appearance-none">{savingUpdate ? 'Pushing...' : 'Push Log'}</button>
                                    </div>
                                </form>
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 ml-1">Update History</h3>
                                    {selectedProjectUpdates.updatesList?.map((u: any) => (
                                        <div key={u.id} className="p-5 bg-white border border-zinc-200 rounded-2xl flex flex-col gap-3 group shadow-sm">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium text-zinc-800 leading-relaxed pr-8">{u.message}</p>
                                                <button onClick={() => deleteUpdate(u.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 appearance-none shrink-0" title="Delete Log">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-zinc-400 pt-3 border-t border-zinc-100">
                                                <span>Load: {u.progress_at_time}%</span>
                                                <span>•</span>
                                                <span>{new Date(u.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedProjectUpdates.updatesList || selectedProjectUpdates.updatesList.length === 0) && (
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center py-8">No updates recorded.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ADMIN SETTINGS MODAL */}
            <AnimatePresence>
                {isSettingsModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white border border-zinc-200 shadow-2xl rounded-[40px] w-full max-w-md overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                                <div>
                                    <h2 className="text-2xl font-light tracking-tight text-zinc-900">Admin Settings</h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Security Node</p>
                                </div>
                                <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100 appearance-none">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <div className="p-8">
                                <form onSubmit={handleUpdateAdminPassword} className="space-y-5">
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">New Password</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                required
                                                minLength={6}
                                                value={adminPasswordForm.newPassword}
                                                onChange={e => setAdminPasswordForm({ ...adminPasswordForm, newPassword: e.target.value })}
                                                className="w-full bg-zinc-50 border border-zinc-200 pl-4 pr-12 py-3.5 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors focus:outline-none"
                                            >
                                                {showNewPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Confirm Password</label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                required
                                                minLength={6}
                                                value={adminPasswordForm.confirmPassword}
                                                onChange={e => setAdminPasswordForm({ ...adminPasswordForm, confirmPassword: e.target.value })}
                                                className="w-full bg-zinc-50 border border-zinc-200 pl-4 pr-12 py-3.5 rounded-xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors focus:outline-none"
                                            >
                                                {showConfirmPassword ? (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={savingPassword} className="w-full bg-black text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 mt-4 shadow-md active:scale-95 transition-all appearance-none flex items-center justify-center gap-3">
                                        {savingPassword ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}