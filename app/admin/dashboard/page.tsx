"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/app/components/LogoutButton';
import emailjs from '@emailjs/browser';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);

    const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});

    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);

    const [updateMessage, setUpdateMessage] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [localProgress, setLocalProgress] = useState<{ [key: string]: number }>({});

    const [clientForm, setClientForm] = useState({ email: '', fullName: '', companyName: '', phone: '', address: '' });
    const [projectForm, setProjectForm] = useState({ clientId: '', name: '', budget: '', deadline: '', progress: 0, status: 'Planning' });

    const router = useRouter();

    useEffect(() => {
        checkAdmin();
        fetchData();
        fetchSystemStatus();
        fetchSupportTickets();

        const storedUnreads = localStorage.getItem('novatrum_admin_unreads');
        if (storedUnreads) {
            setUnreadCounts(JSON.parse(storedUnreads));
        }

        // 1. SUPPORT TICKETS SİNC.
        const ticketChannel = supabase.channel('admin-support-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
                fetchSupportTickets();
            }).subscribe();

        // 2. PROJELER VE LOGLAR İÇİN REALTIME (YENİ EKLENDİ)
        const projectsChannel = supabase.channel('admin-projects-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
                fetchData(); // Proje yüzdesi/durumu değiştiğinde veriyi tazeleyin
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_updates' }, () => {
                fetchData(); // Yeni bir log girildiğinde projeleri tazeleyin
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ticketChannel);
            supabase.removeChannel(projectsChannel);
        };
    }, [activeTab]);

    // CHAT (GLOBAL) DİNLEYİCİSİ
    useEffect(() => {
        const globalChatChannel = supabase.channel('global-admin-chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_replies' }, (payload) => {
                if (payload.new.sender_type === 'client') {
                    const incomingTicketId = payload.new.ticket_id;
                    if (selectedTicket && selectedTicket.id === incomingTicketId) {
                        setReplies(current => [...current, payload.new]);
                        fetchSupportTickets();
                    }
                    else {
                        setUnreadCounts(prev => {
                            const newCounts = { ...prev, [incomingTicketId]: (prev[incomingTicketId] || 0) + 1 };
                            localStorage.setItem('novatrum_admin_unreads', JSON.stringify(newCounts));
                            return newCounts;
                        });
                        fetchSupportTickets();
                    }
                }
            }).subscribe();

        return () => { supabase.removeChannel(globalChatChannel); };
    }, [selectedTicket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [replies]);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/admin/login');
        const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
        if (member?.role !== 'admin') router.push('/client/login');
        else setIsAdmin(true);
    };

    const fetchData = async () => {
        const { data: clientsData } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        const { data: projectsData } = await supabase.from('projects').select('*, clients(full_name)').order('created_at', { ascending: false });
        if (clientsData) setClients(clientsData);
        if (projectsData) {
            setProjects(projectsData);
            // Projeler çekilince local progress state'ini de doldur
            const progressMap: { [key: string]: number } = {};
            projectsData.forEach(p => { progressMap[p.id] = p.progress_percent; });
            setLocalProgress(progressMap);
        }
    };

    const fetchSystemStatus = async () => {
        const { data } = await supabase.from('system_status').select('*').order('label');
        if (data) setSystemStatuses(data);
    };

    const fetchSupportTickets = async () => {
        const { data } = await supabase.from('support_tickets').select('*, clients(full_name, email)').order('created_at', { ascending: false });
        if (data) {
            setSupportTickets(data);
            if (selectedTicket) {
                const updatedTicket = data.find(t => t.id === selectedTicket.id);
                if (updatedTicket) setSelectedTicket(updatedTicket);
            }
        }
    };

    const updateTicketStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', id);
        if (!error) {
            fetchSupportTickets();
            if (selectedTicket && selectedTicket.id === id) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        }
    };

    const openTicketChat = async (ticket: any) => {
        setSelectedTicket(ticket);

        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[ticket.id];
            localStorage.setItem('novatrum_admin_unreads', JSON.stringify(newCounts));
            return newCounts;
        });

        const { data } = await supabase.from('ticket_replies').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
        setReplies(data || []);
    };

    const sendChatReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket) return;
        setSendingReply(true);

        try {
            const newReply = {
                ticket_id: selectedTicket.id,
                sender_type: 'admin',
                message: replyMessage
            };

            const { data, error } = await supabase.from('ticket_replies').insert(newReply).select().single();
            if (error) throw error;

            if (selectedTicket.status === 'open') {
                await supabase.from('support_tickets').update({ status: 'in-progress' }).eq('id', selectedTicket.id);
            }

            setReplies(current => [...current, data]);
            setReplyMessage('');
            fetchSupportTickets();
        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setSendingReply(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    // --- DİĞER FONKSİYONLAR ---
    const fetchClientFiles = async (clientId: string) => {
        const { data } = await supabase.from('client_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (data) setClientFiles(data);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, clientId: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${clientId}/${Math.random()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            await supabase.from('client_files').insert({
                client_id: clientId, file_name: file.name, file_url: publicUrl, file_type: file.type.includes('pdf') ? 'pdf' : 'document'
            });
            fetchClientFiles(clientId);
        } catch (error: any) { alert(error.message); } finally { setUploading(false); }
    };

    const updateServiceStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('system_status').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
        if (!error) fetchSystemStatus();
    };

    const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
        try {
            await supabase.from('projects').update({ status: newStatus }).eq('id', projectId);
            // fetchData(); burda manuel çağırmaya gerek yok, realtime kanalı algılayacak.
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const generateCode = () => `NVTR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const code = generateCode();
        try {
            const { error } = await supabase.from('clients').insert({ email: clientForm.email, full_name: clientForm.fullName, company_name: clientForm.companyName || null, phone_number: clientForm.phone || null, address: clientForm.address || null, access_code: code });
            if (error) throw error;
            setClientForm({ email: '', fullName: '', companyName: '', phone: '', address: '' });
            setActiveTab('clients'); fetchData();
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };

    const handleSyncProject = async (projectId: string) => {
        setLoading(true);
        try {
            const newProgress = localProgress[projectId];

            // Yüzdeyi güncelle
            await supabase.from('projects').update({ progress_percent: newProgress }).eq('id', projectId);

            // EĞER mesaj yazılmışsa, veritabanına log olarak ekle
            if (updateMessage.trim() && selectedProjectId === projectId) {
                await supabase.from('project_updates').insert({
                    project_id: projectId,
                    message: updateMessage,
                    progress_at_time: newProgress
                });
                setUpdateMessage(''); // Mesajı temizle
                setSelectedProjectId(null);
            }
            // fetchData(); burda manuel çağırmaya gerek yok, realtime kanalı algılayacak.
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeployProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await supabase.from('projects').insert({ client_id: projectForm.clientId, name: projectForm.name, budget: projectForm.budget, deadline: projectForm.deadline || null, status: projectForm.status, progress_percent: projectForm.progress });
        setProjectForm({ clientId: '', name: '', budget: '', deadline: '', progress: 0, status: 'Planning' });
        setActiveTab('overview'); fetchData();
        setLoading(false);
    };

    const deleteClient = async (id: string) => {
        if (!confirm("TERMINATE ENTITY?")) return;
        await supabase.from('projects').delete().eq('client_id', id);
        await supabase.from('clients').delete().eq('id', id);
        fetchData();
    };

    const handleSendCode = async (email: string, code: string, clientName: string) => {
    if (!confirm(`Send key to ${email}?`)) return;
    try {
        await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!, 
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!, 
            { 
                to_email: email, 
                client_name: clientName, 
                access_code: code, 
                // BURAYI DEĞİŞTİRDİK (Vercel uzantısını gizliyoruz)
                login_link: `https://app.novatrum.com/login` 
            }, 
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
        );
        alert("Sent.");
    } catch (err) { alert("Failed."); console.error(err); }
};

    if (!isAdmin) return null;

    const hasAnyUnread = Object.keys(unreadCounts).length > 0;

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] text-black font-sans relative overflow-x-hidden">

            {/* Sağdan Açılan Müşteri Paneli */}
            {selectedClient && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
                    <aside className="relative w-full max-w-xl bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase">Entity Profile</h2>
                            <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        <div className="space-y-8">
                            <section className="bg-zinc-50 p-6 rounded-[30px] border border-zinc-100">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4">Core Identification</p>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black">{selectedClient.full_name}</h3>
                                    <p className="text-sm text-zinc-500 break-all">{selectedClient.email}</p>
                                    <p className="text-[11px] font-bold text-zinc-400 mt-2 uppercase tracking-widest">Company: {selectedClient.company_name || 'N/A'}</p>
                                </div>
                            </section>
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Asset Vault</p>
                                    <label className="cursor-pointer bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase">
                                        {uploading ? '...' : '+ Upload'}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, selectedClient.id)} />
                                    </label>
                                </div>
                                <div className="grid gap-3">
                                    {clientFiles.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl">
                                            <span className="text-xs font-bold truncate max-w-[150px]">{file.file_name}</span>
                                            <a href={file.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-zinc-400 hover:text-black">Open</a>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            )}

            <div className="md:hidden fixed top-0 w-full bg-white border-b border-zinc-200 z-40 p-4 flex justify-between items-center">
                <h2 className="text-xl font-black tracking-tighter">NOVATRUM OS</h2>
                <div className="flex items-center gap-4">
                    {hasAnyUnread && <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-zinc-100 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>

            <aside className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-all duration-300 w-72 bg-white border-r border-zinc-200 p-8 flex flex-col h-full shadow-sm`}>
                <div className="mb-12 text-center">
                    <h2 className="text-2xl font-black tracking-tighter">NOVATRUM OS</h2>
                    <div className="h-1 w-8 bg-black mx-auto mt-2 rounded-full" />
                </div>
                <nav className="flex-1 space-y-1">
                    {[
                        { id: 'overview', label: 'System Overview' },
                        { id: 'tickets', label: 'Support Tickets', notification: hasAnyUnread },
                        { id: 'status', label: 'Infrastructure Control' },
                        { id: 'clients', label: 'Global Database' },
                        { id: 'add_client', label: '+ Register Client' },
                        { id: 'add_project', label: '+ Deploy Project' }
                    ].map((item) => (
                        <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`relative w-full text-left px-6 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === item.id ? 'bg-black text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-50'}`}>
                            {item.label}
                            {item.notification && (
                                <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_red] animate-pulse" />
                            )}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto flex flex-col items-center pt-8 border-t border-zinc-50"><LogoutButton /></div>
            </aside>

            <main className="flex-1 ml-0 md:ml-72 mt-16 md:mt-0 p-6 md:p-16">

                {activeTab === 'tickets' && (
                    <div className="max-w-6xl animate-in fade-in duration-700 space-y-12">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Support Tickets</h1>

                        {!selectedTicket ? (
                            <div className="grid gap-6">
                                {supportTickets.length === 0 && <p className="text-zinc-400 font-bold uppercase text-xs">No active tickets.</p>}
                                {supportTickets.map(ticket => (
                                    <div key={ticket.id} onClick={() => openTicketChat(ticket)} className="relative cursor-pointer bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:shadow-md hover:border-black transition-all group">

                                        {unreadCounts[ticket.id] > 0 && (
                                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full border-2 border-white animate-bounce shadow-md">
                                                {unreadCounts[ticket.id]} NEW MESSAGES
                                            </div>
                                        )}

                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${ticket.status === 'open' ? 'border-blue-200 text-blue-600 bg-blue-50' : ticket.status === 'in-progress' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50'}`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'urgent' ? 'bg-red-500' : 'bg-zinc-300'}`} />
                                                    {ticket.priority} priority
                                                </span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight group-hover:text-zinc-700 transition-colors pr-8">{ticket.subject}</h3>
                                            <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-5 rounded-2xl border border-zinc-100 line-clamp-2">{ticket.message}</p>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase">From: <span className="text-black">{ticket.clients?.full_name}</span></p>
                                        </div>
                                        <div className="flex flex-row md:flex-col gap-3 shrink-0 items-center justify-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black flex items-center gap-2">
                                                Open Chat <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col lg:flex-row gap-8 items-start animate-in slide-in-from-right-8 duration-500">
                                <div className="w-full lg:w-1/3 bg-white border border-zinc-200 p-6 rounded-[30px] shadow-sm flex flex-col h-[650px] sticky top-8">
                                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">All Tickets</h2>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                        {supportTickets.map(ticket => (
                                            <div key={ticket.id} onClick={() => openTicketChat(ticket)} className={`relative p-4 rounded-2xl cursor-pointer transition-all border ${selectedTicket?.id === ticket.id ? 'bg-black text-white border-black' : 'bg-zinc-50 hover:bg-white border-zinc-100 hover:border-zinc-300'}`}>

                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${selectedTicket?.id === ticket.id ? 'border-zinc-700 text-zinc-300' : (ticket.status === 'open' ? 'border-blue-200 text-blue-600' : ticket.status === 'in-progress' ? 'border-yellow-200 text-yellow-600' : 'border-emerald-200 text-emerald-600')}`}>{ticket.status}</span>

                                                    {unreadCounts[ticket.id] > 0 && selectedTicket?.id !== ticket.id && (
                                                        <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                                            {unreadCounts[ticket.id]} NEW
                                                        </span>
                                                    )}

                                                </div>
                                                <h3 className={`text-xs font-black uppercase truncate pr-8 ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-black'}`}>{ticket.subject}</h3>
                                                <p className={`text-[9px] uppercase tracking-widest mt-2 truncate ${selectedTicket?.id === ticket.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{ticket.clients?.full_name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full lg:w-2/3 bg-white border border-zinc-200 rounded-[30px] shadow-sm flex flex-col h-[650px] overflow-hidden">
                                    <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border ${selectedTicket.status === 'open' ? 'border-blue-200 text-blue-600 bg-blue-50' : selectedTicket.status === 'in-progress' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50'}`}>{selectedTicket.status}</span>
                                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{selectedTicket.priority} Priority</span>
                                                <span className="text-[8px] font-bold text-black bg-zinc-200 px-2 py-1 rounded-md uppercase tracking-widest ml-2">Client: {selectedTicket.clients?.full_name}</span>
                                            </div>
                                            <h3 className="text-xl font-black uppercase tracking-tight">{selectedTicket.subject}</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {selectedTicket.status !== 'resolved' && (
                                                <button onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-sm">
                                                    Resolve
                                                </button>
                                            )}
                                            <button onClick={() => setSelectedTicket(null)} className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-full transition-colors active:scale-95">
                                                <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-[#FBFBFB]">
                                        <div className="flex justify-start">
                                            <div className="bg-white border border-zinc-200 p-5 rounded-2xl rounded-tl-none max-w-[85%] md:max-w-[75%] shadow-sm">
                                                <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap text-zinc-700">{selectedTicket.message}</p>
                                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-3 block">{selectedTicket.clients?.full_name} • {formatDate(selectedTicket.created_at)}</span>
                                            </div>
                                        </div>

                                        {replies.map(reply => (
                                            <div key={reply.id} className={`flex ${reply.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-5 rounded-2xl max-w-[85%] md:max-w-[75%] shadow-sm ${reply.sender_type === 'admin' ? 'bg-black text-white rounded-tr-none' : 'bg-white border border-zinc-200 rounded-tl-none'}`}>
                                                    <p className={`text-xs font-bold leading-relaxed whitespace-pre-wrap ${reply.sender_type === 'admin' ? 'text-white' : 'text-zinc-700'}`}>{reply.message}</p>
                                                    <span className={`text-[8px] font-bold tracking-widest uppercase mt-3 block ${reply.sender_type === 'admin' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                        {reply.sender_type === 'admin' ? 'You • ' : `${selectedTicket.clients?.full_name} • `}{formatDate(reply.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    <div className="p-6 bg-white border-t border-zinc-100">
                                        {selectedTicket.status === 'resolved' && (
                                            <div className="mb-4 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center justify-center gap-3">
                                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                <p className="text-[9px] font-black uppercase text-emerald-700 tracking-widest">This ticket is resolved. Sending a reply will reopen it.</p>
                                            </div>
                                        )}
                                        <form onSubmit={sendChatReply} className="flex items-end gap-3">
                                            <textarea
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Type your reply to client..."
                                                className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none resize-none h-16 focus:bg-white focus:border-zinc-300 transition-all"
                                            />
                                            <button type="submit" disabled={sendingReply || !replyMessage.trim()} className="bg-black text-white p-4 rounded-2xl disabled:opacity-50 hover:bg-zinc-800 active:scale-95 transition-all shadow-md flex items-center justify-center h-16 w-16">
                                                {sendingReply ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ...DİĞER BÜTÜN SEKMELER AYNI... */}
                {activeTab === 'status' && (
                    <div className="max-w-4xl animate-in fade-in duration-700">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-4">Infrastructure Control</h1>
                        <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-12">Modify real-time node accessibility</p>
                        <div className="grid gap-6">
                            {systemStatuses.map((s) => (
                                <div key={s.id} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-xl font-black uppercase">{s.label}</h3>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">STATUS: <span className={s.status !== 'operational' ? 'text-orange-500' : 'text-emerald-500'}>{s.status}</span></p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {['operational', 'degraded', 'partial', 'down'].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => updateServiceStatus(s.id, val)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${s.status === val ? 'bg-black text-white shadow-md scale-105' : 'bg-zinc-50 text-zinc-400 border-zinc-100'}`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* GÜNCELLENEN OVERVIEW SEKMESİ */}
                {activeTab === 'overview' && (
                    <div className="max-w-6xl animate-in fade-in duration-700 space-y-12">
                        <div className="flex justify-between items-end">
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Overview</h1>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest hidden md:inline-block">Master Node Live</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {projects.map(p => (
                                <div key={p.id} className="bg-white p-6 md:p-8 rounded-[30px] md:rounded-[40px] border border-zinc-200 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <p className="font-black text-2xl uppercase tracking-tighter">{p.name}</p>
                                            <button
                                                onClick={() => { setSelectedClient(p.clients); fetchClientFiles(p.client_id); }}
                                                className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1 italic hover:text-black transition-colors"
                                            >
                                                Client: {p.clients?.full_name}
                                            </button>
                                        </div>
                                        <select
                                            className="bg-black text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase outline-none cursor-pointer"
                                            value={p.status || 'Planning'}
                                            onChange={(e) => handleUpdateProjectStatus(p.id, e.target.value)}
                                        >
                                            <option value="Planning">Planning</option><option value="Development">Development</option><option value="Testing">Testing</option><option value="Live">Live</option>
                                        </select>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-zinc-50">
                                        <input
                                            type="text" placeholder="Optional log message..."
                                            className="w-full bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-xs outline-none focus:bg-white transition-all"
                                            value={selectedProjectId === p.id ? updateMessage : ''}
                                            onChange={(e) => { setSelectedProjectId(p.id); setUpdateMessage(e.target.value); }}
                                        />
                                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2 shrink-0">Progress:</span>
                                                {/* YENİ NESİL AKILLI PROGRESS INPUT */}
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="flex-1 bg-zinc-50 border border-zinc-100 p-4 rounded-2xl text-xs font-bold w-full"
                                                    value={localProgress[p.id] !== undefined ? localProgress[p.id] : p.progress_percent}
                                                    onFocus={(e) => e.target.select()} // Kutuya tıklanınca içindekini seç (hemen üstüne yazabilmek için)
                                                    onChange={(e) => {
                                                        const valStr = e.target.value;

                                                        // Eğer kutu tamamen silinirse (boş kalırsa) geçici olarak 0 atıyoruz
                                                        if (valStr === '') {
                                                            setLocalProgress({ ...localProgress, [p.id]: 0 });
                                                            return;
                                                        }

                                                        // Sayıyı temizle (Baştaki gereksiz 0'ları parseInt otomatik siler: "040" -> 40 olur)
                                                        let val = parseInt(valStr, 10);

                                                        // Güvenlik sınırları: Sayı değilse 0 yap, 100'den büyükse 100'e sabitle, 0'dan küçükse 0 yap
                                                        if (isNaN(val) || val < 0) val = 0;
                                                        if (val > 100) val = 100;

                                                        // Sınırlandırılmış ve temizlenmiş net sayıyı state'e kaydet
                                                        setLocalProgress({ ...localProgress, [p.id]: val });
                                                    }}
                                                />
                                            </div>
                                            <button onClick={() => handleSyncProject(p.id)} disabled={loading} className="w-full sm:w-auto bg-black text-white px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg active:scale-95 disabled:opacity-50">
                                                Sync Update
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'clients' && (
                    <div className="max-w-6xl animate-in fade-in duration-700">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-6 md:mb-12">Database</h1>
                        <div className="bg-white rounded-[30px] md:rounded-[40px] border border-zinc-200 overflow-hidden shadow-sm">
                            <div className="md:hidden divide-y divide-zinc-50">
                                {clients.map((c) => (
                                    <div key={c.id} onClick={() => { setSelectedClient(c); fetchClientFiles(c.id); }} className="p-6 cursor-pointer hover:bg-zinc-50 transition-all active:bg-zinc-100">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-black text-sm uppercase text-black">{c.full_name}</p>
                                                <p className="text-[10px] text-zinc-400 mt-1 break-all">{c.email}</p>
                                            </div>
                                            {c.last_login ? (
                                                <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase shrink-0">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Verified
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-amber-500 font-black text-[9px] uppercase shrink-0">
                                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />Idle
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-6">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-zinc-100 px-3 py-2 rounded-lg text-[10px] font-mono font-bold">{c.access_code}</span>
                                                <button onClick={(e) => { e.stopPropagation(); handleSendCode(c.email, c.access_code, c.full_name); }} className="p-2 bg-black text-white rounded-lg active:scale-95">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                                </button>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); deleteClient(c.id); }} className="text-[9px] font-black text-red-400 uppercase tracking-widest px-2 py-2">Terminate</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-zinc-50 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                        <tr><th className="px-10 py-6">User</th><th className="px-10 py-6">Key</th><th className="px-10 py-6">Activity</th><th className="px-10 py-6 text-right">Actions</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50 font-sans">
                                        {clients.map((c) => (
                                            <tr key={c.id} onClick={() => { setSelectedClient(c); fetchClientFiles(c.id); }} className="hover:bg-zinc-50/50 transition-all group cursor-pointer">
                                                <td className="px-10 py-8">
                                                    <p className="font-black text-sm uppercase group-hover:text-zinc-600 transition-colors">{c.full_name}</p>
                                                    <p className="text-[10px] text-zinc-400 mt-1">{c.email}</p>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-zinc-100 px-3 py-1.5 rounded-lg text-xs font-mono font-bold">{c.access_code}</span>
                                                        <button onClick={(e) => { e.stopPropagation(); handleSendCode(c.email, c.access_code, c.full_name); }} className="p-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition-colors">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    {c.last_login ? (
                                                        <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Verified
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase">
                                                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />Idle
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <button onClick={(e) => { e.stopPropagation(); deleteClient(c.id); }} className="text-[10px] font-black text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest">Terminate</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'add_client' && (
                    <div className="max-w-4xl animate-in slide-in-from-bottom-8 duration-700">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-12">New Entity</h1>
                        <form onSubmit={handleCreateClient} className="bg-white p-8 md:p-14 rounded-[30px] md:rounded-[50px] border border-zinc-200 shadow-xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" placeholder="Full Name *" required className="bg-zinc-50 p-5 rounded-[20px] outline-none text-sm" value={clientForm.fullName} onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })} />
                                <input type="email" placeholder="Email *" required className="bg-zinc-50 p-5 rounded-[20px] outline-none text-sm" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
                                <input type="text" placeholder="Company" className="bg-zinc-50 p-5 rounded-[20px] outline-none text-sm" value={clientForm.companyName} onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })} />
                                <input type="tel" placeholder="Phone" className="bg-zinc-50 p-5 rounded-[20px] outline-none text-sm" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
                                <textarea placeholder="Address" className="md:col-span-2 bg-zinc-50 p-5 rounded-[20px] outline-none text-sm h-24" value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full bg-black text-white py-6 md:py-8 rounded-[20px] md:rounded-[30px] font-black text-xs uppercase tracking-[0.4em]">Register Entity</button>
                        </form>
                    </div>
                )}

                {activeTab === 'add_project' && (
                    <div className="max-w-4xl animate-in slide-in-from-bottom-8 duration-700">
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase mb-12">Infrastructure Setup</h1>
                        <form onSubmit={handleDeployProject} className="bg-white p-8 md:p-14 rounded-[30px] md:rounded-[50px] border border-zinc-200 shadow-xl space-y-8">
                            <select required className="w-full bg-zinc-50 p-5 rounded-[20px] outline-none text-sm font-bold uppercase" value={projectForm.clientId} onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}>
                                <option value="">Link to Client Entity...</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                            </select>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input type="text" placeholder="Project Handle" required className="bg-zinc-50 p-5 rounded-[20px] outline-none text-sm" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
                                <input type="text" placeholder="Allocation" className="bg-zinc-50 p-5 rounded-[20px] outline-none text-sm" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })} />
                                <input type="date" className="bg-zinc-50 p-5 rounded-[20px] outline-none text-sm" value={projectForm.deadline} onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })} />
                                <select className="bg-zinc-50 p-5 rounded-[20px] outline-none text-sm font-bold uppercase" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                                    <option value="Planning">Planning</option><option value="Development">Development</option><option value="Testing">Testing</option><option value="Live">Live</option>
                                </select>
                            </div>
                            <div className="space-y-4 pt-4">
                                <div className="flex justify-between font-black uppercase text-[10px] text-zinc-400 tracking-widest"><span>Initial Core Load</span><span>%{projectForm.progress}</span></div>
                                <input type="range" min="0" max="100" value={projectForm.progress} onChange={(e) => setProjectForm({ ...projectForm, progress: parseInt(e.target.value) })} className="w-full accent-black h-1 bg-zinc-100 appearance-none cursor-pointer rounded-full" />
                            </div>
                            <button type="submit" className="w-full bg-black text-white py-6 md:py-8 rounded-[20px] md:rounded-[30px] font-black text-xs uppercase tracking-[0.4em]">Initiate Deployment</button>
                        </form>
                    </div>
                )}

            </main>
        </div>
    );
}