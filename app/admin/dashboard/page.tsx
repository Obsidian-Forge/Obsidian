"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/app/components/LogoutButton';

interface Ticket {
    id: string;
    subject: string;
    message: string;
    status: string;
    priority: string;
    created_at: string;
    client_id: string;
    clients?: {
        full_name: string;
        email: string;
    };
}

interface Reply {
    id: string;
    ticket_id: string;
    sender_type: string;
    message: string;
    created_at: string;
}

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // VERİ STATELERİ
    const [clients, setClients] = useState<any[]>([]);
    const [archivedClients, setArchivedClients] = useState<any[]>([]);
    const [archiveSearch, setArchiveSearch] = useState('');
    const [projects, setProjects] = useState<any[]>([]);
    const [systemStatuses, setSystemStatuses] = useState<any[]>([]);
    const [supportTickets, setSupportTickets] = useState<Ticket[]>([]);

    // TICKET & CHAT STATELERİ
    const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [ticketFilter, setTicketFilter] = useState<'all' | 'new' | 'in-progress' | 'resolved'>('all');

    // MÜŞTERİ PROFİLİ, DOSYA VE NOT STATELERİ
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [internalNote, setInternalNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);

    // FATURA STATELERİ
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [uploadingInvoice, setUploadingInvoice] = useState(false);

    // PROJE GÜNCELLEME STATELERİ
    const [updateMessage, setUpdateMessage] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [localProgress, setLocalProgress] = useState<{ [key: string]: number }>({});

    // ZAMANLAYICI & DİĞER STATELER
    const [timers, setTimers] = useState<{ [key: string]: { active: boolean; sessionStart: number | null; displayTime: number } }>({});
    const [quickNotes, setQuickNotes] = useState<any[]>([]);
    const [newQuickNote, setNewQuickNote] = useState('');
    const [clientForm, setClientForm] = useState({ email: '', fullName: '', companyName: '', phone: '', address: '', billingAddress: '' });
    const [projectForm, setProjectForm] = useState({ clientId: '', name: '', budget: '', deadline: '', progress: 0, status: 'Planning' });
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    // YENİ EKLENEN: DISCOVERY NOTIFICATION STATE
    const [newDiscoveryCount, setNewDiscoveryCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        checkAdmin();
        fetchData();
        fetchSystemStatus();
        fetchSupportTickets();
        fetchQuickNotes(); 
        fetchDiscoveryCount();

        const storedUnreads = localStorage.getItem('novatrum_admin_unreads');
        if (storedUnreads) {
            setUnreadCounts(JSON.parse(storedUnreads));
        }

        const ticketChannel = supabase.channel('admin-support-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
                fetchSupportTickets();
            }).subscribe();

        const projectsChannel = supabase.channel('admin-projects-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                if (payload.eventType === 'UPDATE') {
                    setProjects(current => current.map(p => p.id === payload.new.id ? { ...payload.new, clients: p.clients } : p));
                    setTimers(prev => {
                        const dbActive = payload.new.last_timer_start !== null;
                        if (dbActive) {
                            const sessionStart = Math.floor(new Date(payload.new.last_timer_start).getTime() / 1000);
                            const displayTime = Math.floor(Date.now() / 1000) - sessionStart;
                            return { ...prev, [payload.new.id]: { active: true, sessionStart, displayTime } };
                        } else {
                            return { ...prev, [payload.new.id]: { active: false, sessionStart: null, displayTime: 0 } };
                        }
                    });
                } else {
                    fetchData();
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'project_updates' }, () => {
                fetchData(); 
            })
            .subscribe();

        const clientsChannel = supabase.channel('admin-clients-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
                fetchData();
            }).subscribe();

        const notesChannel = supabase.channel('admin-notes-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_quick_notes' }, () => {
                fetchQuickNotes();
            }).subscribe();

        const discoveryChannel = supabase.channel('admin-discovery-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_discovery' }, () => {
                fetchDiscoveryCount();
            }).subscribe();

        return () => {
            supabase.removeChannel(ticketChannel);
            supabase.removeChannel(projectsChannel);
            supabase.removeChannel(clientsChannel);
            supabase.removeChannel(notesChannel);
            supabase.removeChannel(discoveryChannel);
        };
    }, []); 

    useEffect(() => {
        if (selectedClient) {
            setInternalNote(selectedClient.internal_notes || '');
            fetchClientInvoices(selectedClient.id);
        }
    }, [selectedClient]);

    useEffect(() => {
        const globalChatChannel = supabase.channel('global-admin-chat')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ticket_replies' }, (payload) => {
                const newReply = payload.new as Reply;
                const oldReply = payload.old as { id: string };
                
                if (payload.eventType === 'DELETE') {
                    if(oldReply?.id) {
                        setReplies(current => current.filter(r => r.id !== oldReply.id));
                    }
                    return;
                }

                if (payload.eventType === 'INSERT' && newReply?.sender_type === 'client') {
                    if (selectedTicket && selectedTicket.id === newReply.ticket_id) {
                        setReplies(current => {
                            if (current.find(r => r.id === newReply.id)) return current;
                            return [...current, newReply];
                        });
                        fetchSupportTickets();
                    }
                    else if(newReply.ticket_id) {
                        setUnreadCounts(prev => {
                            const newCounts = { ...prev, [newReply.ticket_id]: (prev[newReply.ticket_id] || 0) + 1 };
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

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/admin/login');
        const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
        if (member?.role !== 'admin') router.push('/client/login');
        else setIsAdmin(true);
    };

    const fetchDiscoveryCount = async () => {
        const { count } = await supabase
            .from('project_discovery')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        
        if (count !== null) setNewDiscoveryCount(count);
    };

    const fetchData = async () => {
        const { data: clientsData } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        const { data: projectsData } = await supabase.from('projects').select('*, clients(*)').order('created_at', { ascending: false });
        
        if (clientsData) {
            setClients(clientsData.filter(c => !c.archived_at));
            setArchivedClients(clientsData.filter(c => c.archived_at));
        }
        
        if (projectsData) {
            setProjects(projectsData.filter(p => p.clients && !p.clients.archived_at));
            const progressMap: { [key: string]: number } = {};
            const newTimers: any = {};
            projectsData.forEach(p => { 
                progressMap[p.id] = p.progress_percent; 
                const dbActive = p.last_timer_start !== null;
                if (dbActive) {
                    const sessionStart = Math.floor(new Date(p.last_timer_start).getTime() / 1000);
                    const displayTime = Math.floor(Date.now() / 1000) - sessionStart;
                    newTimers[p.id] = { active: true, sessionStart, displayTime };
                } else {
                    newTimers[p.id] = { active: false, sessionStart: null, displayTime: 0 };
                }
            });
            setLocalProgress(progressMap);
            setTimers(newTimers);
        }
    };

    const fetchQuickNotes = async () => {
        const { data } = await supabase.from('admin_quick_notes').select('*').order('created_at', { ascending: false }).limit(5);
        if (data) setQuickNotes(data);
    };

    const addQuickNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuickNote.trim()) return;
        try {
            await supabase.from('admin_quick_notes').insert({ note: newQuickNote });
            setNewQuickNote('');
            fetchQuickNotes();
        } catch (err) { console.error(err); }
    };

    const deleteQuickNote = async (id: string) => {
        await supabase.from('admin_quick_notes').delete().eq('id', id);
        fetchQuickNotes();
    };

    const toggleTimer = async (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const timerState = timers[projectId];
        const isCurrentlyActive = timerState?.active;

        if (isCurrentlyActive) {
            const sessionDuration = timerState.displayTime;
            const newTotalTime = (project.total_time_spent || 0) + sessionDuration;
            setTimers(prev => ({ ...prev, [projectId]: { active: false, sessionStart: null, displayTime: 0 } }));
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, total_time_spent: newTotalTime, last_timer_start: null } : p));
            await supabase.from('projects').update({ total_time_spent: newTotalTime, last_timer_start: null }).eq('id', projectId);
        } else {
            const nowIso = new Date().toISOString();
            const nowSec = Math.floor(Date.now() / 1000);
            setTimers(prev => ({ ...prev, [projectId]: { active: true, sessionStart: nowSec, displayTime: 0 } }));
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, last_timer_start: nowIso } : p));
            await supabase.from('projects').update({ last_timer_start: nowIso }).eq('id', projectId);
        }
    };

    const formatTimeDisplay = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    const fetchSystemStatus = async () => {
        const { data } = await supabase.from('system_status').select('*').order('label');
        if (data) setSystemStatuses(data);
    };

    const fetchSupportTickets = async () => {
        const { data } = await supabase.from('support_tickets').select('*, clients(full_name, email)').order('created_at', { ascending: false });
        if (data) {
            const processedData = data.map((ticket: any) => ({
                ...ticket,
                status: ticket.status === 'open' ? 'new' : ticket.status
            }));
            setSupportTickets(processedData);
            if (selectedTicket) {
                const updatedTicket = processedData.find((t: any) => t.id === selectedTicket.id);
                if (updatedTicket) setSelectedTicket(updatedTicket);
            }
        }
    };

    const updateTicketStatus = async (id: string, newStatus: string) => {
        const dbStatus = newStatus === 'new' ? 'open' : newStatus;
        const { error } = await supabase.from('support_tickets').update({ status: dbStatus }).eq('id', id);
        if (!error) {
            fetchSupportTickets();
            if (selectedTicket && selectedTicket.id === id) setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
    };

    const openTicketChat = async (ticket: Ticket) => {
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
        const messageText = replyMessage;
        setReplyMessage('');
        try {
            const newReply = { ticket_id: selectedTicket.id, sender_type: 'admin', message: messageText };
            const { data, error } = await supabase.from('ticket_replies').insert(newReply).select().single();
            if (error) throw error;
            if (selectedTicket.status === 'new' || selectedTicket.status === 'open') {
                await supabase.from('support_tickets').update({ status: 'in-progress' }).eq('id', selectedTicket.id);
            }
            if(data) setReplies(current => [...current, data]);
            fetchSupportTickets();
        } catch (error: any) { 
            alert("Error sending reply: " + error.message);
            setReplyMessage(messageText); 
        } finally { 
            setSendingReply(false);
        }
    };

    const deleteChatMessage = async (replyId: string) => {
        if (!confirm("Are you sure you want to permanently delete this message?")) return;
        try {
            const { error } = await supabase.from('ticket_replies').delete().eq('id', replyId);
            if (error) throw error;
            setReplies(current => current.filter(r => r.id !== replyId));
        } catch (error: any) {
            alert("Error deleting message: " + error.message);
        }
    };

    const deleteEntireTicket = async (e: React.MouseEvent, ticketId: string) => {
        e.stopPropagation();
        if (!confirm("WARNING: Are you sure you want to delete this entire support ticket and all its messages permanently?")) return;
        try {
            await supabase.from('ticket_replies').delete().eq('ticket_id', ticketId);
            const { error } = await supabase.from('support_tickets').delete().eq('id', ticketId);
            if (error) throw error;
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(null);
            }
            fetchSupportTickets();
        } catch (error: any) {
            alert("Error deleting ticket: " + error.message);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

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
            await supabase.from('client_files').insert({ client_id: clientId, file_name: file.name, file_url: publicUrl, file_type: file.type.includes('pdf') ? 'pdf' : 'document' });
            fetchClientFiles(clientId);
        } catch (error: any) { alert(error.message); } finally { setUploading(false); }
    };

    const deleteClientFile = async (fileId: string, fileUrl: string, clientId: string) => {
        if (!confirm("Are you sure you want to delete this asset?")) return;
        try {
            const basePath = '/client-assets/';
            const pathIndex = fileUrl.indexOf(basePath);
            if (pathIndex !== -1) {
                const filePath = fileUrl.substring(pathIndex + basePath.length);
                await supabase.storage.from('client-assets').remove([filePath]);
            }
            const { error } = await supabase.from('client_files').delete().eq('id', fileId);
            if (error) throw error;
            fetchClientFiles(clientId);
        } catch (error: any) { alert("Error deleting file: " + error.message); }
    };

    const fetchClientInvoices = async (clientId: string) => {
        const { data } = await supabase.from('client_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (data) setClientInvoices(data);
    };

    const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>, clientId: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingInvoice(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `invoices/${clientId}/${Math.random()}.${fileExt}`;
        try {
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            await supabase.from('client_invoices').insert({ client_id: clientId, file_name: file.name, file_url: publicUrl, status: 'unpaid' });
            fetchClientInvoices(clientId);
        } catch (error: any) { alert(error.message); } finally { setUploadingInvoice(false); }
    };

    const toggleInvoiceStatus = async (invoiceId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
        const { error } = await supabase.from('client_invoices').update({ status: newStatus }).eq('id', invoiceId);
        if (!error) fetchClientInvoices(selectedClient.id);
    };

    const deleteInvoice = async (invoiceId: string, fileUrl: string, clientId: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;
        try {
            const basePath = '/client-assets/';
            const pathIndex = fileUrl.indexOf(basePath);
            if (pathIndex !== -1) await supabase.storage.from('client-assets').remove([fileUrl.substring(pathIndex + basePath.length)]);
            const { error } = await supabase.from('client_invoices').delete().eq('id', invoiceId);
            if (error) throw error;
            fetchClientInvoices(clientId);
        } catch (error: any) { alert("Error deleting invoice: " + error.message); }
    };

    const handleSaveNote = async () => {
        setSavingNote(true);
        try {
            const { error } = await supabase.from('clients').update({ internal_notes: internalNote }).eq('id', selectedClient.id);
            if (error) throw error;
            setSelectedClient({ ...selectedClient, internal_notes: internalNote });
            fetchData();
        } catch (err: any) { alert("Error saving note: " + err.message); } finally { setSavingNote(false); }
    };

    const updateServiceStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase.from('system_status').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
        if (!error) fetchSystemStatus();
    };

    const handleUpdateProjectStatus = async (projectId: string, newStatus: string) => {
        try {
            await supabase.from('projects').update({ status: newStatus }).eq('id', projectId);
        } catch (error) { console.error("Failed to update status", error); }
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const code = `NVTR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        try {
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
            setClientForm({ email: '', fullName: '', companyName: '', phone: '', address: '', billingAddress: '' });
            setActiveTab('clients'); fetchData();
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
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
        } catch (err: any) { alert(err.message); } finally { setLoading(false); }
    };

    const handleDeployProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await supabase.from('projects').insert({ client_id: projectForm.clientId, name: projectForm.name, budget: projectForm.budget, deadline: projectForm.deadline || null, status: projectForm.status, progress_percent: projectForm.progress });
        setProjectForm({ clientId: '', name: '', budget: '', deadline: '', progress: 0, status: 'Planning' });
        setActiveTab('overview'); fetchData();
        setLoading(false);
    };

    const archiveClient = async (id: string, accessCode: string) => {
        if (!confirm("TERMINATE ENTITY? This will revoke their access and move them to the Archive.")) return;
        try {
            const { error } = await supabase.from('clients')
                .update({ archived_at: new Date().toISOString(), access_code: `REVOKED-${accessCode}` })
                .eq('id', id);
            if (error) throw error;
            setSelectedClient(null); 
            await fetchData(); 
            alert("Entity successfully archived.");
        } catch (err: any) { alert("Failed to archive: " + err.message); }
    };

    const restoreClient = async (id: string) => {
        if (!confirm("RESTORE ENTITY? This will generate a new access code for them.")) return;
        try {
            const newCode = `NVTR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const { error } = await supabase.from('clients')
                .update({ archived_at: null, access_code: newCode })
                .eq('id', id);
            if (error) throw error;
            setSelectedClient(null); 
            await fetchData();
            alert("Entity Restored. Their new access code is: " + newCode);
        } catch (err: any) { alert("Failed to restore: " + err.message); }
    };

    const handleSendCode = async (email: string, code: string, clientName: string) => {
        if (!confirm(`Send key to ${email}?`)) return;
        try {
            const response = await fetch('/api/email', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'access_code', email: email, code: code, clientName: clientName, loginLink: `${window.location.origin}/client/login` })
            });
            if (!response.ok) throw new Error("Backend failed");
            alert("Sent successfully.");
        } catch (err) { alert("Failed to send."); }
    };

    const exportAsText = () => {
        if (!selectedTicket) return;
        let content = `Support Ticket: ${selectedTicket.subject}\nCreated At: ${formatDate(selectedTicket.created_at)}\nStatus: ${selectedTicket.status.toUpperCase()} | Priority: ${selectedTicket.priority.toUpperCase()}\n--------------------------------------------------\n\n[${formatDate(selectedTicket.created_at)}] INITIAL REQUEST:\n${selectedTicket.message}\n\n`;
        replies.forEach(reply => {
            const sender = reply.sender_type === 'client' ? 'CLIENT' : 'ADMIN';
            content += `[${formatDate(reply.created_at)}] ${sender}:\n${reply.message}\n\n`;
        });
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `Ticket_${selectedTicket.id.slice(0,8)}_Logs.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    const exportAsJSON = () => {
        if (!selectedTicket) return;
        const data = {
            ticket_details: { id: selectedTicket.id, subject: selectedTicket.subject, initial_message: selectedTicket.message, status: selectedTicket.status, priority: selectedTicket.priority, created_at: selectedTicket.created_at, client: selectedTicket.clients?.full_name },
            logs: replies.map(r => ({ sender: r.sender_type, message: r.message, timestamp: r.created_at }))
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Ticket_${selectedTicket.id.slice(0,8)}_Data.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        setShowExportMenu(false);
    };

    const handleCopyKey = (e: React.MouseEvent, key: string, id: string) => {
        e.stopPropagation(); 
        navigator.clipboard.writeText(key);
        setCopiedKeyId(id);
        setTimeout(() => setCopiedKeyId(null), 2000); 
    };

    const filteredArchivedClients = archivedClients.filter(c => 
        c.full_name.toLowerCase().includes(archiveSearch.toLowerCase()) || 
        c.email.toLowerCase().includes(archiveSearch.toLowerCase())
    );

    const filteredTickets = supportTickets.filter(ticket => {
        if (ticketFilter === 'all') return true;
        if (ticketFilter === 'new') return ticket.status === 'new' || ticket.status === 'open'; 
        return ticket.status === ticketFilter;
    });

    const activeProjects = projects.filter(p => timers[p.id]?.active);
    const idleProjects = projects.filter(p => !timers[p.id]?.active);

    if (!isAdmin) return null;
    const hasAnyUnread = Object.keys(unreadCounts).length > 0;

    const getTicketStatusStyle = (status: string) => {
        switch (status) {
            case 'new': 
            case 'open': return 'border-blue-200 text-blue-600 bg-blue-50/50';
            case 'in-progress': return 'border-amber-200 text-amber-600 bg-amber-50/50';
            case 'resolved': return 'border-emerald-200 text-emerald-600 bg-emerald-50/50';
            default: return 'border-zinc-200 text-zinc-600 bg-zinc-50';
        }
    };
    
    const getPriorityStyle = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'urgent': return 'text-red-500';
            case 'high': return 'text-amber-500';
            default: return 'text-zinc-400';
        }
    };

    return (
        <div className="flex min-h-screen bg-zinc-50 text-black font-sans relative overflow-x-hidden">

            {/* ENTITY PROFILE SLIDE-OVER */}
            {selectedClient && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
                    <aside className="relative w-full max-w-xl bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto border-l border-zinc-200 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-10 pb-6 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-zinc-900">Entity Profile</h2>
                                {selectedClient.archived_at && (
                                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-red-200">Archived</span>
                                )}
                            </div>
                            <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        <div className="space-y-8">
                            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-6">Identity Details</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Full Name</p><p className="text-sm font-black uppercase text-zinc-800 mt-1">{selectedClient.full_name}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Email Address</p><p className="text-xs font-bold text-zinc-600 break-all mt-1">{selectedClient.email}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Company</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.company_name || 'N/A'}</p></div>
                                    <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Phone</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.phone_number || 'N/A'}</p></div>
                                    <div className="sm:col-span-2"><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Address</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.address || 'N/A'}</p></div>
                                </div>

                                {selectedClient.archived_at ? (
                                    <div className="mt-8 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-red-50/50 p-4 rounded-xl border border-red-100">
                                        <div><p className="text-[9px] font-bold uppercase text-red-400 tracking-widest">Archived On</p><p className="text-xs font-bold text-red-600 mt-1">{formatDate(selectedClient.archived_at)}</p></div>
                                        <button onClick={() => restoreClient(selectedClient.id)} className="bg-white text-emerald-600 border border-emerald-200 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-sm">Restore Entity</button>
                                    </div>
                                ) : (
                                    <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Project Started</p>
                                            <p className="text-xs font-bold text-zinc-700 mt-1">{formatDate(selectedClient.created_at)}</p>
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); archiveClient(selectedClient.id, selectedClient.access_code); }} className="text-[9px] font-black text-red-500 bg-red-50 border border-red-100 uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">Terminate</button>
                                    </div>
                                )}
                            </section>

                            <section className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-4">Internal Notes</p>
                                <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Private notes..." className="w-full bg-white border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-zinc-400 resize-none h-24 mb-3 transition-colors" />
                                <button onClick={handleSaveNote} disabled={savingNote || internalNote === (selectedClient.internal_notes || '')} className="w-full bg-zinc-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-black transition-colors shadow-sm">{savingNote ? 'Saving...' : 'Save Note'}</button>
                            </section>

                            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Billing & Invoices</p>
                                    <label className={`cursor-pointer bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${selectedClient.archived_at ? 'opacity-50 pointer-events-none' : 'hover:bg-black'}`}>
                                        {uploadingInvoice ? '...' : 'Upload'}
                                        <input type="file" className="hidden" onChange={(e) => handleInvoiceUpload(e, selectedClient.id)} disabled={!!selectedClient.archived_at} />
                                    </label>
                                </div>
                                <div className="grid gap-3">
                                    {clientInvoices.length === 0 && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-4 text-center border border-zinc-100 border-dashed rounded-xl">No invoices found.</p>}
                                    {clientInvoices.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl group transition-all">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => toggleInvoiceStatus(inv.id, inv.status)} className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border transition-colors ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`} title="Click to toggle status" disabled={!!selectedClient.archived_at}>
                                                    {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                                                </button>
                                                <span className="text-xs font-bold text-zinc-700 truncate max-w-[120px]">{inv.file_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <a href={inv.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-800 transition-colors">Open</a>
                                                {!selectedClient.archived_at && <button onClick={() => deleteInvoice(inv.id, inv.file_url, selectedClient.id)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Asset Vault</p>
                                    <label className={`cursor-pointer bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-colors ${selectedClient.archived_at ? 'opacity-50 pointer-events-none' : 'hover:bg-black'}`}>
                                        {uploading ? '...' : 'Upload'}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, selectedClient.id)} disabled={selectedClient.archived_at !== null} />
                                    </label>
                                </div>
                                <div className="grid gap-3">
                                    {clientFiles.length === 0 && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-4 text-center border border-zinc-100 border-dashed rounded-xl">No assets found.</p>}
                                    {clientFiles.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-xl group transition-all">
                                            <span className="text-xs font-bold text-zinc-700 truncate max-w-[150px]">{file.file_name}</span>
                                            <div className="flex items-center gap-3">
                                                <a href={file.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-800 transition-colors">Open</a>
                                                {!selectedClient.archived_at && (
                                                    <button onClick={() => deleteClientFile(file.id, file.file_url, selectedClient.id)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">Delete</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            )}

            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 w-full bg-zinc-950 border-b border-zinc-800 z-40 p-4 flex justify-between items-center text-white">
                <h2 className="text-xl font-black tracking-tighter">NOVATRUM</h2>
                <div className="flex items-center gap-4">
                    {(hasAnyUnread || newDiscoveryCount > 0) && <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-zinc-800 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>

            {/* SIDEBAR NAVIGATION - YENİ KARANLIK TEMA */}
            <aside className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 w-64 bg-zinc-950 border-r border-zinc-800 p-6 flex flex-col h-full shadow-2xl`}>
                <div className="mb-10 text-center">
                    <h2 className="text-2xl font-black tracking-tighter text-white">NOVATRUM</h2>
                    <div className="h-0.5 w-8 bg-zinc-700 mx-auto mt-3 rounded-full" />
                </div>
                <nav className="flex-1 space-y-1.5">
                    {[
                        { id: 'overview', label: 'System Overview' },
                        { id: 'discoveries', label: 'Discovery Logs', notification: newDiscoveryCount > 0, badgeCount: newDiscoveryCount, action: () => router.push('/admin/discoveries') },
                        { id: 'tickets', label: 'Support Tickets', notification: hasAnyUnread },
                        { id: 'status', label: 'Infrastructure Control' },
                        { id: 'clients', label: 'Active Database' },
                        { id: 'archive', label: 'Entity Archive' },
                        { id: 'add_client', label: '+ Register Client' },
                        { id: 'add_project', label: '+ Deploy Project' }
                    ].map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => { 
                                if (item.action) { item.action(); } 
                                else { setActiveTab(item.id); setIsMobileMenuOpen(false); }
                            }} 
                            className={`relative w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-200 ${activeTab === item.id && !item.action ? 'bg-white text-zinc-900 shadow-md' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'}`}
                        >
                            <span>{item.label}</span>
                            {item.badgeCount ? (
                                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest">{item.badgeCount} NEW</span>
                            ) : item.notification ? (
                                <span className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_red] animate-pulse" />
                            ) : null}
                        </button>
                    ))}
                    
                    <div className="pt-4 mt-4 border-t border-zinc-800/50">
                        <button 
                            onClick={() => router.push('/admin/invoice-generator')} 
                            className="relative w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700"
                        >
                            Invoice Generator
                        </button>
                    </div>
                </nav>
                <div className="mt-auto flex flex-col items-center pt-6 border-t border-zinc-800"><LogoutButton /></div>
            </aside>

            {/* MAIN CONTENT AREA - YENİ TEMİZ TEMA */}
            <main className="flex-1 ml-0 md:ml-64 mt-16 md:mt-0 p-6 md:p-12 lg:p-16 w-full max-w-[100vw] overflow-x-hidden">
                
                {/* ARCHIVE TAB */}
                {activeTab === 'archive' && (
                    <div className="max-w-6xl animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Entity Archive</h1>
                            <input 
                                type="text" placeholder="Search archive..." value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)}
                                className="bg-white border border-zinc-200 px-5 py-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-400 w-full md:w-72 shadow-sm transition-colors" 
                            />
                        </div>
                        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-zinc-50 border-b border-zinc-200 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                    <tr><th className="px-8 py-5">Entity</th><th className="px-8 py-5">Timeline</th><th className="px-8 py-5 text-right">Action</th></tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredArchivedClients.map((c) => (
                                        <tr key={c.id} onClick={() => { setSelectedClient(c); fetchClientFiles(c.id); }} className="hover:bg-zinc-50 cursor-pointer group transition-colors">
                                            <td className="px-8 py-6">
                                                <p className="font-black text-sm uppercase text-zinc-400 line-through decoration-zinc-300">{c.full_name}</p>
                                                <p className="text-[10px] text-zinc-400 mt-1 font-bold">{c.email}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest">Started: {formatDate(c.created_at)}</p>
                                                <p className="text-[9px] font-bold uppercase text-red-500 tracking-widest mt-1">Archived: {formatDate(c.archived_at)}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); restoreClient(c.id); }} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-4 py-2 rounded-lg border border-transparent hover:border-emerald-200 transition-all">Restore</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredArchivedClients.length === 0 && <div className="p-16 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">No archived records found.</div>}
                        </div>
                    </div>
                )}

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="w-full animate-in fade-in duration-500 space-y-10">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-6 border-b border-zinc-200">
                            <div className="flex items-center gap-4">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Workspace</h1>
                                <button onClick={fetchData} className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-all active:scale-95 text-zinc-500 hover:text-zinc-900 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></button>
                            </div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Node Live</span></div>
                        </div>

                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-6">Active Sessions</h2>
                            {activeProjects.length === 0 ? (
                                <div className="bg-white border border-zinc-200 border-dashed rounded-2xl p-10 flex items-center justify-center min-h-[200px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No active project. Select 'Start Working' below.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {activeProjects.map(p => {
                                        const timer = timers[p.id];
                                        const totalProjectTime = (p.total_time_spent || 0) + timer.displayTime;

                                        return (
                                            <div key={p.id} className="bg-white p-6 rounded-2xl border-2 border-zinc-900 shadow-sm relative flex flex-col w-full">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="pr-4">
                                                        <p className="font-black text-xl uppercase tracking-tight text-zinc-900 break-words">{p.name}</p>
                                                        <button onClick={() => { setSelectedClient(p.clients); fetchClientFiles(p.client_id); }} className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 hover:text-zinc-900 transition-colors text-left break-words">{p.clients?.full_name}</button>
                                                    </div>
                                                    <select className="bg-zinc-100 border border-zinc-200 text-zinc-800 px-2 py-1.5 rounded-lg text-[9px] font-black uppercase outline-none cursor-pointer shrink-0 focus:border-zinc-400" value={p.status || 'Planning'} onChange={(e) => handleUpdateProjectStatus(p.id, e.target.value)}>
                                                        <option value="Planning">Planning</option><option value="Development">Development</option><option value="Testing">Testing</option><option value="Live">Live</option>
                                                    </select>
                                                </div>

                                                <div className="bg-zinc-50 rounded-xl p-5 mb-6 border border-zinc-200">
                                                    <div className="flex flex-col gap-5">
                                                        <div className="flex flex-row items-center justify-between">
                                                            <div>
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Current Session</p>
                                                                <p className="text-2xl font-black font-mono text-emerald-600">{formatTimeDisplay(timer.displayTime)}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">Total Logged</p>
                                                                <p className="text-lg font-black font-mono text-zinc-900">{formatTimeDisplay(totalProjectTime)}</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={() => toggleTimer(p.id)} className="w-full h-10 rounded-lg flex items-center justify-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 active:scale-95">
                                                            Stop Session
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="mt-auto space-y-3 pt-4 border-t border-zinc-100">
                                                    <input type="text" placeholder="Update log message..." className="w-full bg-white border border-zinc-200 p-3 rounded-lg text-[10px] outline-none focus:border-zinc-400 font-bold placeholder:text-zinc-400" value={selectedProjectId === p.id ? updateMessage : ''} onChange={(e) => { setSelectedProjectId(p.id); setUpdateMessage(e.target.value); }} />
                                                    <div className="flex gap-2 items-center">
                                                        <div className="flex items-center gap-2 flex-1">
                                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest shrink-0">Progress:</span>
                                                            <input type="number" min="0" max="100" className="flex-1 bg-white border border-zinc-200 p-3 rounded-lg text-[10px] font-bold outline-none focus:border-zinc-400" value={localProgress[p.id] ?? p.progress_percent} onFocus={(e) => e.target.select()} onChange={(e) => setLocalProgress({ ...localProgress, [p.id]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} />
                                                        </div>
                                                        <button onClick={() => handleSyncProject(p.id)} className="bg-zinc-900 text-white px-5 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors active:scale-95 shrink-0">Sync</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* YARDIMCI KARTLAR (Notlar & Sistem) */}
                                    <div className="flex flex-col bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                Quick Notes
                                            </p>
                                        </div>
                                        <form onSubmit={addQuickNote} className="mb-4 flex gap-2">
                                            <input type="text" value={newQuickNote} onChange={(e) => setNewQuickNote(e.target.value)} placeholder="Type note..." className="flex-1 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-[10px] font-bold outline-none focus:border-zinc-400" />
                                            <button type="submit" disabled={!newQuickNote.trim()} className="bg-zinc-900 text-white px-3 rounded-lg disabled:opacity-50 hover:bg-black"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></button>
                                        </form>
                                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[150px]">
                                            {quickNotes.map(note => (
                                                <div key={note.id} className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 flex justify-between items-start group">
                                                    <p className="text-[10px] font-bold text-zinc-700 leading-relaxed pr-2">{note.note}</p>
                                                    <button onClick={() => deleteQuickNote(note.id)} className="text-zinc-400 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-opacity p-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                                </div>
                                            ))}
                                            {quickNotes.length === 0 && <p className="text-[9px] font-bold uppercase text-zinc-400 text-center mt-4">No notes yet.</p>}
                                        </div>
                                    </div>

                                    <div className="flex flex-col bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path></svg>
                                            System Health
                                        </p>
                                        <div className="flex-1 space-y-2 max-h-[150px] overflow-y-auto pr-1">
                                            {systemStatuses.length === 0 ? (
                                                <p className="text-[9px] font-bold uppercase text-zinc-400 text-center mt-4">Loading stats...</p>
                                            ) : (
                                                systemStatuses.slice(0, 4).map(s => (
                                                    <div key={s.id} className="bg-zinc-50 p-3 rounded-lg flex items-center justify-between border border-zinc-100">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">{s.label}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[8px] font-black uppercase tracking-widest ${s.status === 'operational' ? 'text-emerald-600' : s.status === 'degraded' ? 'text-amber-600' : 'text-red-600'}`}>{s.status}</span>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'operational' ? 'bg-emerald-500' : s.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <button onClick={() => setActiveTab('status')} className="mt-4 w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors border border-zinc-200">Manage Infra</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {idleProjects.length > 0 && (
                            <div className="pt-6 border-t border-zinc-200">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-6">Idle Deployments</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {idleProjects.map(p => (
                                        <div key={p.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all flex flex-col w-full">
                                            <div className="flex justify-between items-start mb-5">
                                                <div className="pr-2">
                                                    <p className="font-black text-lg uppercase tracking-tight text-zinc-900 break-words">{p.name}</p>
                                                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 break-words">{p.clients?.full_name}</p>
                                                </div>
                                                <span className="bg-zinc-100 border border-zinc-200 text-zinc-700 px-2 py-1 rounded-md text-[8px] font-black uppercase shrink-0">{p.status}</span>
                                            </div>

                                            <div className="bg-zinc-50 rounded-xl p-4 mb-5 border border-zinc-100 flex justify-between items-center">
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Total Logged</p>
                                                    <p className="text-sm font-black font-mono text-zinc-900 mt-0.5">{formatTimeDisplay(p.total_time_spent || 0)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Progress</p>
                                                    <p className="text-sm font-black font-mono text-zinc-900 mt-0.5">%{p.progress_percent}</p>
                                                </div>
                                            </div>

                                            <button onClick={() => toggleTimer(p.id)} className="mt-auto w-full h-10 rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm font-black text-[9px] uppercase tracking-widest bg-zinc-900 text-white hover:bg-black active:scale-95">
                                                Start Working
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TICKETS TAB */}
                {activeTab === 'tickets' && (
                    <div className="w-full animate-in fade-in duration-500 space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-zinc-200">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Support Tickets</h1>
                            <button onClick={fetchSupportTickets} className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-all active:scale-95 text-zinc-500 hover:text-zinc-900 shadow-sm" title="Refresh">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-6 items-start w-full relative">
                            {/* SOL PANEL (LİSTE) */}
                            <div className={`w-full lg:w-1/3 bg-white border border-zinc-200 p-5 rounded-2xl shadow-sm flex flex-col h-[75vh] lg:sticky lg:top-8 ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                                <div className="flex flex-wrap gap-2 mb-4 border-b border-zinc-100 pb-4">
                                    {[{ id: 'all', label: 'All' }, { id: 'new', label: 'New' }, { id: 'in-progress', label: 'Progress' }, { id: 'resolved', label: 'Resolved' }].map(filter => (
                                        <button key={filter.id} onClick={() => setTicketFilter(filter.id as any)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${ticketFilter === filter.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 hover:bg-zinc-50 border-zinc-200'}`}>
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                                    {filteredTickets.length === 0 && <p className="text-zinc-400 font-bold uppercase text-[10px] text-center mt-4">No tickets found.</p>}
                                    {filteredTickets.map(ticket => (
                                        <div key={ticket.id} onClick={() => openTicketChat(ticket)} className={`relative p-4 rounded-xl cursor-pointer transition-colors border group ${selectedTicket?.id === ticket.id ? 'bg-zinc-50 border-zinc-300 shadow-sm' : 'bg-white hover:bg-zinc-50 border-zinc-200'}`}>
                                            <button onClick={(e) => deleteEntireTicket(e, ticket.id)} className="absolute top-3 right-3 p-1.5 rounded-md bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                            <div className="flex justify-between items-start mb-2 pr-6">
                                                <div className="flex gap-2 items-center">
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${getTicketStatusStyle(ticket.status)}`}>{ticket.status === 'open' ? 'NEW' : ticket.status}</span>
                                                    <span className={`text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 ${getPriorityStyle(ticket.priority)}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'urgent' ? 'bg-red-500' : ticket.priority === 'high' ? 'bg-amber-500' : 'bg-zinc-300'}`} />
                                                    </span>
                                                </div>
                                                {unreadCounts[ticket.id] > 0 && selectedTicket?.id !== ticket.id && (
                                                    <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md animate-pulse shadow-sm">{unreadCounts[ticket.id]} NEW</span>
                                                )}
                                            </div>
                                            <h3 className="text-xs font-black uppercase truncate text-zinc-900 pr-4 mt-1">{ticket.subject}</h3>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1.5 truncate">{ticket.clients?.full_name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SAĞ PANEL (SOHBET) */}
                            <div className={`w-full lg:w-2/3 bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col h-[75vh] overflow-hidden ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                                {!selectedTicket ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                        <svg className="w-10 h-10 text-zinc-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select a ticket</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-5 border-b border-zinc-200 flex justify-between items-start bg-zinc-50">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <button onClick={() => setSelectedTicket(null)} className="lg:hidden flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500 mb-3 hover:text-black"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg> Back</button>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase ${getTicketStatusStyle(selectedTicket.status)}`}>{selectedTicket.status === 'open' ? 'NEW' : selectedTicket.status}</span>
                                                    <span className={`text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 ${getPriorityStyle(selectedTicket.priority)}`}><div className={`w-1.5 h-1.5 rounded-full ${selectedTicket.priority === 'urgent' ? 'bg-red-500' : selectedTicket.priority === 'high' ? 'bg-amber-500' : 'bg-zinc-300'}`} />{selectedTicket.priority} Priority</span>
                                                </div>
                                                <h3 className="text-lg font-black uppercase tracking-tight text-zinc-900 truncate">{selectedTicket.subject}</h3>
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mt-1">{selectedTicket.clients?.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <div className="relative">
                                                    <button onClick={() => setShowExportMenu(!showExportMenu)} className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-600 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button>
                                                    {showExportMenu && (
                                                        <div className="absolute right-0 mt-2 w-32 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden text-left">
                                                            <button onClick={exportAsText} className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors">TXT Export</button>
                                                            <button onClick={exportAsJSON} className="w-full px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors border-t border-zinc-100">JSON Export</button>
                                                        </div>
                                                    )}
                                                </div>
                                                {selectedTicket.status !== 'resolved' && (
                                                    <button onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-sm">Resolve</button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-white">
                                            <div className="flex justify-start">
                                                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm">
                                                    <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap text-zinc-800">{selectedTicket.message}</p>
                                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-3 block">INITIAL • {formatDate(selectedTicket.created_at)}</span>
                                                </div>
                                            </div>
                                            {replies.map(reply => (
                                                <div key={reply.id} className={`flex group ${reply.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                    {reply.sender_type === 'admin' && (
                                                        <button onClick={() => deleteChatMessage(reply.id)} className="mr-2 self-center opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-300 hover:text-red-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                    )}
                                                    <div className={`p-4 rounded-2xl max-w-[85%] shadow-sm ${reply.sender_type === 'admin' ? 'bg-zinc-900 text-white rounded-tr-none' : 'bg-zinc-50 border border-zinc-200 rounded-tl-none text-zinc-800'}`}>
                                                        <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                                                        <span className={`text-[8px] font-bold tracking-widest uppercase mt-3 block ${reply.sender_type === 'admin' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                            {reply.sender_type === 'admin' ? 'You • ' : 'Client • '}{formatDate(reply.created_at)}
                                                        </span>
                                                    </div>
                                                    {reply.sender_type === 'client' && (
                                                        <button onClick={() => deleteChatMessage(reply.id)} className="ml-2 self-center opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-300 hover:text-red-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                                    )}
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
                                            {selectedTicket.status === 'resolved' && (
                                                <div className="mb-3 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center justify-center gap-2">
                                                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    <p className="text-[9px] font-black uppercase text-emerald-700 tracking-widest text-center">Ticket is resolved. Sending a reply will reopen it.</p>
                                                </div>
                                            )}
                                            <form onSubmit={sendChatReply} className="flex items-end gap-3">
                                                <textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Type reply..." className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold outline-none resize-none h-12 focus:border-zinc-400 transition-colors shadow-sm" />
                                                <button type="submit" disabled={sendingReply || !replyMessage.trim()} className="bg-zinc-900 text-white p-3 rounded-xl disabled:opacity-50 hover:bg-black active:scale-95 transition-all shadow-sm flex items-center justify-center h-12 w-12 shrink-0">
                                                    {sendingReply ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>}
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STATUS TAB */}
                {activeTab === 'status' && (
                    <div className="max-w-4xl animate-in fade-in duration-500">
                        <div className="pb-6 border-b border-zinc-200 mb-8">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Infrastructure</h1>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Modify real-time node accessibility</p>
                        </div>
                        <div className="grid gap-4">
                            {systemStatuses.map((s) => (
                                <div key={s.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-black uppercase text-zinc-900">{s.label}</h3>
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1 tracking-widest">STATUS: <span className={s.status !== 'operational' ? 'text-amber-500' : 'text-emerald-500'}>{s.status}</span></p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                        {['operational', 'degraded', 'partial', 'down'].map((val) => (
                                            <button key={val} onClick={() => updateServiceStatus(s.id, val)} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${s.status === val ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'}`}>
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ACTIVE CLIENTS TAB */}
                {activeTab === 'clients' && (
                    <div className="w-full animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 mb-8">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Active Database</h1>
                            <button onClick={fetchData} className="w-fit p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-all active:scale-95 text-zinc-500 shadow-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clients.map((c) => (
                                <div key={c.id} onClick={() => { setSelectedClient(c); fetchClientFiles(c.id); }} className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:border-zinc-400 cursor-pointer transition-all flex flex-col gap-5">
                                    <div className="flex justify-between items-start">
                                        <div className="pr-2">
                                            <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Entity</p>
                                            <p className="font-black text-base uppercase truncate text-zinc-900" title={c.full_name}>{c.full_name}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold mt-0.5 truncate" title={c.email}>{c.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50 rounded-xl p-3.5 flex items-center justify-between border border-zinc-200">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Key</p>
                                        <div className="flex items-center gap-2">
                                            <span onClick={(e) => handleCopyKey(e, c.access_code, c.id)} className="bg-white border border-zinc-200 px-2 py-1 rounded text-[9px] font-mono font-bold cursor-pointer hover:bg-zinc-100 transition-colors text-zinc-800">
                                                {copiedKeyId === c.id ? "COPIED" : c.access_code}
                                            </span>
                                            <button onClick={(e) => { e.stopPropagation(); handleSendCode(c.email, c.access_code, c.full_name); }} className="p-1 bg-zinc-900 text-white rounded hover:bg-black transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ADD CLIENT TAB */}
                {activeTab === 'add_client' && (
                    <div className="max-w-3xl animate-in fade-in duration-500">
                        <div className="pb-6 border-b border-zinc-200 mb-8">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">New Entity</h1>
                        </div>
                        <form onSubmit={handleCreateClient} className="bg-white p-8 md:p-10 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Full Name *</label>
                                    <input type="text" required className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 transition-colors" value={clientForm.fullName} onChange={(e) => setClientForm({ ...clientForm, fullName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Email Address *</label>
                                    <input type="email" required className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 transition-colors" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Company Name</label>
                                    <input type="text" className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 transition-colors" value={clientForm.companyName} onChange={(e) => setClientForm({ ...clientForm, companyName: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Phone Number</label>
                                    <input type="tel" className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 transition-colors" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Physical Address</label>
                                    <textarea className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold h-20 resize-none focus:border-zinc-400 transition-colors" value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Billing Address</label>
                                    <textarea className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold h-20 resize-none focus:border-zinc-400 transition-colors" value={clientForm.billingAddress} onChange={(e) => setClientForm({ ...clientForm, billingAddress: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-black active:scale-95 transition-all shadow-sm disabled:opacity-50">Register Entity</button>
                        </form>
                    </div>
                )}

                {/* ADD PROJECT TAB */}
                {activeTab === 'add_project' && (
                    <div className="max-w-3xl animate-in fade-in duration-500">
                        <div className="pb-6 border-b border-zinc-200 mb-8">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Deploy Project</h1>
                        </div>
                        <form onSubmit={handleDeployProject} className="bg-white p-8 md:p-10 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
                            <div>
                                <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Assign to Entity *</label>
                                <select required className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold uppercase cursor-pointer focus:border-zinc-400 transition-colors" value={projectForm.clientId} onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}>
                                    <option value="">Select Client...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Project Name *</label>
                                    <input type="text" required className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 transition-colors" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Budget Allocation</label>
                                    <input type="text" className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 transition-colors" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Deadline</label>
                                    <input type="date" className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold focus:border-zinc-400 transition-colors" value={projectForm.deadline} onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest block mb-2">Initial Status</label>
                                    <select className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none text-xs font-bold uppercase cursor-pointer focus:border-zinc-400 transition-colors" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                                        <option value="Planning">Planning</option><option value="Development">Development</option><option value="Testing">Testing</option><option value="Live">Live</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between font-black uppercase text-[9px] text-zinc-500 tracking-widest"><span>Initial Core Load</span><span>%{projectForm.progress}</span></div>
                                <input type="range" min="0" max="100" value={projectForm.progress} onChange={(e) => setProjectForm({ ...projectForm, progress: parseInt(e.target.value) })} className="w-full accent-zinc-900 h-1.5 bg-zinc-200 appearance-none cursor-pointer rounded-full" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] hover:bg-black active:scale-95 transition-all shadow-sm disabled:opacity-50">Initiate Deployment</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}