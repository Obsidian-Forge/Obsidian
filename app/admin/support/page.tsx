"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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

export default function AdminSupportPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [supportTickets, setSupportTickets] = useState<Ticket[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    
    const selectedTicketIdRef = useRef<string | null>(null);
    
    const [replies, setReplies] = useState<Reply[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [ticketFilter, setTicketFilter] = useState<'all' | 'new' | 'in-progress' | 'resolved'>('all');
    
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        selectedTicketIdRef.current = selectedTicket?.id || null;
    }, [selectedTicket]);

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') router.push('/client/login');
            else setIsAdmin(true);
        };

        checkAdmin();
        fetchSupportTickets();

        const storedUnreads = localStorage.getItem('novatrum_admin_unreads');
        if (storedUnreads) {
            setUnreadCounts(JSON.parse(storedUnreads));
        }

        const ticketChannel = supabase.channel('admin-support-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
                fetchSupportTickets();
            }).subscribe();

        // WHATSAPP HIZINDA REALTIME MANTIĞI: Veritabanını beklemeden mesajı ekrana basar!
        const chatChannel = supabase.channel('admin-chat-sync')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_replies' }, (payload) => {
                const newReply = payload.new as Reply;
                
                if (selectedTicketIdRef.current === newReply.ticket_id) {
                    // Mesajı doğrudan ekrana (state'e) yapıştır
                    setReplies(current => {
                        if (current.some(r => r.id === newReply.id)) return current;
                        return [...current, newReply];
                    });
                    
                    if (newReply.sender_type === 'client') {
                        supabase.from('support_replies').update({ is_read: true }).eq('id', newReply.id).then();
                    }
                } else if (newReply.sender_type === 'client') {
                    setUnreadCounts(prev => {
                        const newCounts = { ...prev, [newReply.ticket_id]: (prev[newReply.ticket_id] || 0) + 1 };
                        localStorage.setItem('novatrum_admin_unreads', JSON.stringify(newCounts));
                        return newCounts;
                    });
                }
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'support_replies' }, (payload) => {
                const oldId = payload.old?.id;
                if (oldId) setReplies(current => current.filter(r => r.id !== oldId));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ticketChannel);
            supabase.removeChannel(chatChannel);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [replies]);

    const fetchReplies = async (ticketId: string) => {
        const { data } = await supabase
            .from('support_replies')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
        if (data) setReplies(data);
    };

    const fetchSupportTickets = async () => {
        const { data: ticketsData } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
        const { data: clientsData } = await supabase.from('clients').select('id, full_name, email');

        if (ticketsData && clientsData) {
            const processedData = ticketsData.map((ticket: any) => {
                const clientObj = clientsData.find(c => c.id === ticket.client_id);
                return {
                    ...ticket,
                    status: ticket.status === 'open' ? 'new' : ticket.status,
                    clients: clientObj ? { full_name: clientObj.full_name, email: clientObj.email } : { full_name: 'Unknown Client', email: '' }
                };
            });

            setSupportTickets(processedData);
            
            if (selectedTicketIdRef.current) {
                const updatedTicket = processedData.find((t: any) => t.id === selectedTicketIdRef.current);
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

        await supabase
            .from('support_replies')
            .update({ is_read: true })
            .eq('ticket_id', ticket.id)
            .eq('sender_type', 'client')
            .eq('is_read', false);

        fetchReplies(ticket.id);
    };

    const sendChatReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket || sendingReply) return;
        setSendingReply(true);
        const messageText = replyMessage;
        setReplyMessage('');

        try {
            const newReply = { 
                ticket_id: selectedTicket.id, 
                sender_type: 'admin', 
                message: messageText,
                is_read: false, 
                email_sent: false 
            };
            
            const { data, error } = await supabase.from('support_replies').insert(newReply).select().single();
            if (error) throw error;
            
            if (selectedTicket.status === 'new' || selectedTicket.status === 'open') {
                await supabase.from('support_tickets').update({ status: 'in-progress' }).eq('id', selectedTicket.id);
                fetchSupportTickets();
            }
            
            // Kendi mesajımızı anında ekrana ekliyoruz
            if (data) {
                setReplies(current => {
                    if (current.some(r => r.id === data.id)) return current;
                    return [...current, data];
                });
            }

        } catch (error: any) { 
            alert("Error sending reply: " + error.message);
            setReplyMessage(messageText); 
        } finally { 
            setSendingReply(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedTicket) return;
        setUploadingFile(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `tickets/${selectedTicket.client_id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        try {
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            const attachmentMessage = `Attached file: [${file.name}](${publicUrl})`;
            
            const { data, error: replyError } = await supabase.from('support_replies').insert({
                ticket_id: selectedTicket.id,
                sender_type: 'admin',
                message: attachmentMessage,
                is_read: false,
                email_sent: false
            }).select().single();

            if (replyError) throw replyError;
            
            if (selectedTicket.status === 'new' || selectedTicket.status === 'open') {
                await supabase.from('support_tickets').update({ status: 'in-progress' }).eq('id', selectedTicket.id);
                fetchSupportTickets();
            }
            
            // Kendi dosyamızı anında ekrana ekliyoruz
            if (data) {
                setReplies(current => {
                    if (current.some(r => r.id === data.id)) return current;
                    return [...current, data];
                });
            }

        } catch (error: any) {
            alert("File upload failed: " + error.message);
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const deleteChatMessage = async (replyId: string) => {
        if (!confirm("Are you sure you want to permanently delete this message?")) return;
        try {
            const { error } = await supabase.from('support_replies').delete().eq('id', replyId);
            if (error) throw error;
        } catch (error: any) {
            alert("Error deleting message: " + error.message);
        }
    };

    const deleteEntireTicket = async (e: React.MouseEvent, ticketId: string) => {
        e.stopPropagation();
        if (!confirm("WARNING: Are you sure you want to delete this entire support ticket and all its messages permanently?")) return;
        try {
            await supabase.from('support_replies').delete().eq('ticket_id', ticketId);
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

    const renderMessageText = (text: string) => {
        if (!text) return null;
        const regex = /\[([^\]]+)\]\((https?:\/\/[^\s]+)\)|(https?:\/\/[^\s]+)/g;
        const parts = [];
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(<span key={lastIndex}>{text.substring(lastIndex, match.index)}</span>);
            }

            if (match[3]) {
                parts.push(<a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 underline underline-offset-2 break-all">{match[3]}</a>);
            } else if (match[1] && match[2]) {
                parts.push(
                    <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 rounded-lg text-emerald-600 hover:bg-black/10 transition-colors break-all w-fit font-bold mt-1">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        {match[1]}
                    </a>
                );
            }
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            parts.push(<span key={lastIndex}>{text.substring(lastIndex)}</span>);
        }

        return parts.length > 0 ? parts : text;
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

    const filteredTickets = supportTickets.filter(ticket => {
        if (ticketFilter === 'all') return true;
        if (ticketFilter === 'new') return ticket.status === 'new' || ticket.status === 'open'; 
        return ticket.status === ticketFilter;
    });

    if (!isAdmin) return <div className="h-screen w-full bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="flex flex-col h-screen bg-zinc-50 text-black font-sans overflow-hidden selection:bg-black selection:text-white">
            <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full min-h-0 relative z-0">
                <div className="shrink-0">
                    <button onClick={() => router.push('/admin/dashboard')} className="mb-4 md:mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Workspace
                    </button>

                    <div className="flex items-center justify-between pb-4 md:pb-6 border-b border-zinc-200">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-zinc-900">Support Tickets</h1>
                            <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mt-1 md:mt-2">Manage Secure Communications</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 md:gap-6 flex-1 min-h-0 w-full mt-4 md:mt-6">
                    <div className={`w-full lg:w-1/3 bg-white border border-zinc-200 p-4 md:p-5 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="flex flex-wrap gap-2 mb-3 md:mb-4 border-b border-zinc-100 pb-3 md:pb-4 shrink-0">
                            {[{ id: 'all', label: 'All' }, { id: 'new', label: 'New' }, { id: 'in-progress', label: 'Progress' }, { id: 'resolved', label: 'Resolved' }].map(filter => (
                                <button key={filter.id} onClick={() => setTicketFilter(filter.id as any)} className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border ${ticketFilter === filter.id ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 hover:bg-zinc-50 border-zinc-200'}`}>
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {filteredTickets.length === 0 && <p className="text-zinc-400 font-bold uppercase text-[9px] text-center mt-4">No tickets found.</p>}
                            {filteredTickets.map(ticket => {
                                const displayId = ticket.id.split('-')[0].toUpperCase();
                                return (
                                    <div key={ticket.id} onClick={() => openTicketChat(ticket)} className={`relative p-3 md:p-4 rounded-xl cursor-pointer transition-colors border group ${selectedTicket?.id === ticket.id ? 'bg-zinc-50 border-zinc-300 shadow-sm' : 'bg-white hover:bg-zinc-50 border-zinc-200'}`}>
                                        <button onClick={(e) => deleteEntireTicket(e, ticket.id)} className="absolute top-2 right-2 md:top-3 md:right-3 p-1.5 rounded-md bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                        <div className="flex justify-between items-start mb-1.5 md:mb-2 pr-6">
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
                                        <h3 className="text-[11px] md:text-xs font-black uppercase truncate text-zinc-900 pr-4 mt-1">{ticket.subject}</h3>
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest truncate">{ticket.clients?.full_name}</p>
                                            <p className="text-[8px] font-bold text-zinc-400">{displayId}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`w-full lg:w-2/3 bg-white border border-zinc-200 rounded-2xl shadow-sm flex flex-col h-full overflow-hidden ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                        {!selectedTicket ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                <svg className="w-10 h-10 text-zinc-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                                </svg>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select a ticket</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
                                <div className="bg-white border-b border-zinc-200 p-4 md:p-5 flex justify-between items-center shrink-0 z-10">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <button onClick={() => setSelectedTicket(null)} className="lg:hidden flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500 mb-2 hover:text-black">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg> Back to Queue
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 mb-1.5 md:mb-2">
                                            <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase ${getTicketStatusStyle(selectedTicket.status)}`}>{selectedTicket.status === 'open' ? 'NEW' : selectedTicket.status}</span>
                                            <span className={`text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 ${getPriorityStyle(selectedTicket.priority)}`}><div className={`w-1.5 h-1.5 rounded-full ${selectedTicket.priority === 'urgent' ? 'bg-red-500' : selectedTicket.priority === 'high' ? 'bg-amber-500' : 'bg-zinc-300'}`} />{selectedTicket.priority} Priority</span>
                                            <span className="text-[8px] font-bold uppercase text-zinc-400">ID: {selectedTicket.id.split('-')[0].toUpperCase()}</span>
                                        </div>
                                        <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter truncate text-zinc-900">{selectedTicket.subject}</h2>
                                        <p className="text-[10px] md:text-xs font-bold text-zinc-500 mt-0.5 truncate">Client: {selectedTicket.clients?.full_name} ({selectedTicket.clients?.email})</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <button onClick={() => setShowExportMenu(!showExportMenu)} className="p-1.5 md:p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-600 shadow-sm"><svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg></button>
                                                {showExportMenu && (
                                                    <div className="absolute right-0 mt-2 w-32 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden text-left">
                                                        <button onClick={exportAsText} className="w-full px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors">TXT Export</button>
                                                        <button onClick={exportAsJSON} className="w-full px-4 py-2.5 md:py-3 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors border-t border-zinc-100">JSON Export</button>
                                                    </div>
                                                )}
                                            </div>
                                            <select value={selectedTicket.status} onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)} className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 md:px-4 md:py-2 rounded-xl outline-none cursor-pointer shadow-sm border ${selectedTicket.status === 'open' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : selectedTicket.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                                                <option value="open">Open</option><option value="pending">Pending</option><option value="closed">Closed</option><option value="resolved">Resolved</option>
                                            </select>
                                            <button onClick={() => setSelectedTicket(null)} className="px-3 py-1.5 md:py-2 bg-white border border-zinc-200 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:bg-zinc-50 hover:text-black hover:border-zinc-300 shadow-sm transition-all hidden md:block">
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 bg-zinc-50 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 custom-scrollbar">
                                    <div className="flex flex-col items-start">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 md:mb-2 ml-2">{selectedTicket.clients?.full_name} • Original Inquiry</span>
                                        <div className="bg-white border border-zinc-200 text-black max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-[20px] md:rounded-[24px] rounded-tl-sm text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-sm">
                                            {renderMessageText(selectedTicket.message)}
                                        </div>
                                    </div>
                                    {replies.map(reply => {
                                        const isAdmin = reply.sender_type === 'admin';
                                        return (
                                            <div key={reply.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} group`}>
                                                <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                                                    {isAdmin && <button onClick={() => deleteChatMessage(reply.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-300 hover:text-red-500"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>}
                                                    <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${isAdmin ? 'text-indigo-600 mr-2' : 'text-zinc-400 ml-2'}`}>{isAdmin ? 'You (Novatrum)' : selectedTicket.clients?.full_name}</span>
                                                </div>
                                                <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-[20px] md:rounded-[24px] text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-sm ${isAdmin ? 'bg-black text-white rounded-tr-sm' : 'bg-white border border-zinc-200 text-black rounded-tl-sm'}`}>
                                                    {renderMessageText(reply.message)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="bg-white border-t border-zinc-200 p-4 md:p-5 shrink-0 z-10">
                                    {selectedTicket.status === 'closed' || selectedTicket.status === 'resolved' ? (
                                        <div className="text-center p-4 rounded-2xl border bg-zinc-50 border-zinc-200">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">This ticket is {selectedTicket.status}. Change status to reopen communication.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={sendChatReply} className="flex gap-2 md:gap-4 items-center">
                                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                            <button 
                                                type="button" 
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingFile}
                                                className="p-3 md:p-4 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded-[16px] md:rounded-[20px] transition-all flex items-center justify-center shrink-0 w-[50px] md:w-[60px] h-[50px] md:h-[60px]"
                                                title="Attach a file"
                                            >
                                                {uploadingFile ? (
                                                    <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-zinc-400" />
                                                ) : (
                                                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                )}
                                            </button>

                                            <textarea 
                                                value={replyMessage} 
                                                onChange={e => setReplyMessage(e.target.value)} 
                                                placeholder="Type your response to the client..." 
                                                className="flex-1 bg-zinc-50 border border-zinc-200 rounded-[16px] md:rounded-[20px] p-3 md:p-4 text-xs font-bold outline-none resize-none h-[50px] md:h-[60px] focus:border-black transition-colors" 
                                            />
                                            
                                            <button 
                                                type="submit" 
                                                disabled={sendingReply || !replyMessage.trim()} 
                                                className="bg-black text-white p-3 md:p-4 rounded-[16px] md:rounded-[20px] disabled:opacity-50 hover:bg-zinc-800 active:scale-95 transition-all w-[50px] md:w-[60px] h-[50px] md:h-[60px] flex items-center justify-center shrink-0 shadow-sm"
                                            >
                                                {sendingReply ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}