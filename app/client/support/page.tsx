"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ClientSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
    const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' });
    const router = useRouter();
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const selectedTicketIdRef = useRef<string | null>(null);
    
    const [replies, setReplies] = useState<any[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDark, setIsDark] = useState(false);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/client/login');
    };

    useEffect(() => {
        selectedTicketIdRef.current = selectedTicket?.id || null;
    }, [selectedTicket]);

    useEffect(() => {
        const checkTheme = () => {
            const theme = localStorage.getItem('novatrum_theme');
            setIsDark(theme === 'dark');
        };
        checkTheme(); 
        window.addEventListener('storage', checkTheme);
        window.addEventListener('theme-changed', checkTheme);
        return () => {
            window.removeEventListener('storage', checkTheme);
            window.removeEventListener('theme-changed', checkTheme);
        };
    }, []);

    useEffect(() => {
        let inactivityTimer: NodeJS.Timeout;
        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => handleLogout(), 15 * 60 * 1000);
        };
        const events = ['mousemove', 'keydown', 'scroll', 'click'];
        events.forEach(e => window.addEventListener(e, resetTimer));
        resetTimer();
        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, []);

    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        const storedName = localStorage.getItem('novatrum_client_name');
        
        if (!storedId) return router.push('/client/login');
        
        setClientId(storedId);
        setClientName(storedName || 'Client');
        
        fetchTickets(storedId);

        const ticketsChannel = supabase.channel('support-tickets-client')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `client_id=eq.${storedId}` }, () => {
                fetchTickets(storedId);
            }).subscribe();

        // WHATSAPP HIZINDA REALTIME: Veritabanını beklemeden mesajı ekrana basar!
        const repliesChannel = supabase.channel('support-replies-client')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_replies' }, (payload) => {
                const newReply = payload.new;
                
                if (selectedTicketIdRef.current === newReply.ticket_id) {
                    // Mesajı doğrudan ekrana (state'e) yapıştır
                    setReplies(current => {
                        if (current.some(r => r.id === newReply.id)) return current;
                        return [...current, newReply];
                    });

                    if (newReply.sender_type === 'admin') {
                        supabase.from('support_replies').update({ is_read: true }).eq('id', newReply.id).then();
                    }
                } else if (newReply.sender_type === 'admin') {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [newReply.ticket_id]: (prev[newReply.ticket_id] || 0) + 1
                    }));
                }
            })
            // Admin mesaj silerse client ekranından da anında sil
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'support_replies' }, (payload) => {
                const oldId = payload.old?.id;
                if (oldId) setReplies(current => current.filter(r => r.id !== oldId));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ticketsChannel);
            supabase.removeChannel(repliesChannel);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [replies]);

    const fetchTickets = async (cId: string) => {
        const { data: ticketsData, error: tError } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('client_id', cId)
            .order('created_at', { ascending: false });

        if (!tError && ticketsData) {
            setTickets(ticketsData);
            const ticketIds = ticketsData.map(t => t.id);
            if (ticketIds.length > 0) {
                const { data: repliesData } = await supabase
                    .from('support_replies')
                    .select('ticket_id, is_read, sender_type')
                    .in('ticket_id', ticketIds);

                if (repliesData) {
                    const counts: {[key: string]: number} = {};
                    ticketsData.forEach(ticket => {
                        const unreadAdminReplies = repliesData.filter(r => r.ticket_id === ticket.id && r.sender_type === 'admin' && !r.is_read).length;
                        counts[ticket.id] = unreadAdminReplies;
                    });
                    setUnreadCounts(counts);
                }
            }

            if (selectedTicketIdRef.current) {
                const updatedSelected = ticketsData.find(t => t.id === selectedTicketIdRef.current);
                if (updatedSelected) setSelectedTicket((prev: any) => ({ ...prev, ...updatedSelected }));
            }
        }
        setLoading(false);
    };

    const fetchReplies = async (ticketId: string) => {
        const { data } = await supabase
            .from('support_replies')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
        if (data) setReplies(data);
    };

    const markAsRead = async (ticketId: string) => {
        await supabase
            .from('support_replies')
            .update({ is_read: true })
            .eq('ticket_id', ticketId)
            .eq('sender_type', 'admin')
            .eq('is_read', false);
            
        setUnreadCounts(prev => ({ ...prev, [ticketId]: 0 }));
    };

    const handleSelectTicket = (ticket: any) => {
        setSelectedTicket(ticket);
        fetchReplies(ticket.id);
        markAsRead(ticket.id);
        
        if (window.innerWidth < 768) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const downloadChat = () => {
        if (!selectedTicket) return;
        let content = `Support Ticket: ${selectedTicket.subject}\nTicket ID: ${selectedTicket.id}\nCreated At: ${formatDate(selectedTicket.created_at)}\nStatus: ${selectedTicket.status.toUpperCase()}\n--------------------------------------------------\n\n[${formatDate(selectedTicket.created_at)}] ${clientName} (Original Inquiry):\n${selectedTicket.message}\n\n`;
        replies.forEach(reply => {
            const sender = reply.sender_type === 'admin' ? 'Novatrum Support' : clientName;
            content += `[${formatDate(reply.created_at)}] ${sender}:\n${reply.message}\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url;
        a.download = `Novatrum_Ticket_${selectedTicket.id.split('-')[0]}.txt`;
        document.body.appendChild(a); 
        a.click(); 
        document.body.removeChild(a); 
        URL.revokeObjectURL(url);
    };

    const deleteTicket = async (e: React.MouseEvent, ticketId: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to permanently delete this ticket and all its messages?")) return;
        try {
            await supabase.from('support_replies').delete().eq('ticket_id', ticketId);
            const { error } = await supabase.from('support_tickets').delete().eq('id', ticketId);
            if (error) throw error;
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(null);
            }
            fetchTickets(clientId!);
        } catch (err: any) {
            alert("Error deleting ticket: " + err.message);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !selectedTicket) return;
        setUploadingFile(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `tickets/${clientId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        try {
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            
            const attachmentMessage = `Attached file: [${file.name}](${publicUrl})`;
            
            const { data, error: replyError } = await supabase.from('support_replies').insert({
                ticket_id: selectedTicket.id,
                sender_type: 'client',
                message: attachmentMessage,
                is_read: false,
                email_sent: false
            }).select().single();

            if (replyError) throw replyError;
            
            // Kendi dosyamızı anında ekrana ekliyoruz (Veritabanı Gecikmesini Aşmak İçin)
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
                    <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/10 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-black/10 dark:hover:bg-white/20 transition-colors break-all w-fit font-bold mt-1">
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

    const createTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (sending) return;
        setSending(true);
        try {
            const { error } = await supabase.from('support_tickets').insert({
                client_id: clientId,
                subject: form.subject,
                message: form.message,
                priority: form.priority,
                status: 'open'
            });

            if (error) throw error;
            setForm({ subject: '', message: '', priority: 'normal' });
            fetchTickets(clientId!); 
            alert("Ticket created successfully.");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSending(false);
        }
    };

    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket || sending) return;

        setSending(true);
        try {
            const { data, error } = await supabase.from('support_replies').insert({
                ticket_id: selectedTicket.id,
                sender_type: 'client',
                message: replyMessage,
                is_read: false,
                email_sent: false
            }).select().single();

            if (error) throw error;
            
            // Kendi mesajımızı anında ekrana ekliyoruz (Veritabanı Gecikmesini Aşmak İçin)
            if (data) {
                setReplies(current => {
                    if (current.some(r => r.id === data.id)) return current;
                    return [...current, data];
                });
            }

            setReplyMessage('');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className={`h-screen w-full flex items-center justify-center font-black uppercase text-xs tracking-widest ${isDark ? 'bg-zinc-950 text-zinc-500' : 'bg-zinc-50 text-zinc-400'}`}>Syncing Comms...</div>;

    return (
        <div className={`h-screen w-full flex flex-col font-sans overflow-hidden transition-colors duration-500 ${isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-black'}`}>
            
            <div className={`px-6 py-4 md:py-6 flex items-center justify-between shrink-0 z-10 transition-colors duration-500`}>
                <div className="flex items-center gap-4 md:gap-6">
                    <button onClick={() => router.push('/client/dashboard')} className={`${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-black'} p-2 -ml-2 rounded-full transition-colors`}>
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Support Desk</h1>
                    </div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className={`${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'} px-5 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md flex items-center gap-2`}>
                    <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>New Ticket</span>
                </button>
            </div>

            <div className="flex flex-1 min-h-0 relative px-0 md:px-6 lg:px-12 pb-0 md:pb-6 lg:pb-12 items-center justify-center">
                
                <div className={`w-full max-w-6xl h-full flex flex-col md:flex-row overflow-hidden relative md:rounded-[40px] md:border md:shadow-2xl transition-colors duration-500 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                    
                    <div className={`w-full md:w-[300px] lg:w-[350px] shrink-0 border-r flex flex-col h-full transition-all duration-500 z-10 
                        ${isDark ? 'bg-zinc-950/30 border-zinc-800' : 'bg-zinc-50/50 border-zinc-200'} 
                        ${selectedTicket ? 'hidden md:flex' : 'flex'}`}
                    >
                        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                            {tickets.length === 0 && (
                                <div className="text-center py-10">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>No active support tickets.</p>
                                </div>
                            )}
                            {tickets.map(ticket => {
                                const isSelected = selectedTicket?.id === ticket.id;
                                const unread = unreadCounts[ticket.id] > 0;
                                const displayId = ticket.id.split('-')[0].toUpperCase();
                                
                                const selectedClass = isSelected 
                                    ? (isDark ? 'bg-zinc-800 border-zinc-700 shadow-md' : 'bg-white border-zinc-200 shadow-md') 
                                    : (isDark ? 'hover:bg-zinc-800/50 border-transparent text-zinc-300' : 'hover:bg-white border-transparent hover:shadow-sm text-zinc-600');

                                return (
                                    <div 
                                        key={ticket.id} 
                                        onClick={() => handleSelectTicket(ticket)}
                                        className={`relative p-3 md:p-4 rounded-2xl md:rounded-3xl border cursor-pointer transition-all group ${selectedClass}`}
                                    >
                                        <button 
                                            onClick={(e) => deleteTicket(e, ticket.id)} 
                                            className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${isDark ? 'hover:bg-red-950/50 text-zinc-500 hover:text-red-400' : 'bg-white border border-zinc-200 text-zinc-400 hover:text-red-500 hover:border-red-200 shadow-sm'}`}
                                            title="Delete Ticket"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>

                                        <div className="flex justify-between items-start mb-2.5 pr-6">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'bg-emerald-500' : ticket.status === 'pending' ? 'bg-amber-500' : 'bg-zinc-300'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${isDark && !isSelected ? 'text-zinc-500' : 'text-zinc-400'}`}>{displayId}</span>
                                            </div>
                                            {unread && (
                                                <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-md animate-pulse shadow-sm">New</span>
                                            )}
                                        </div>
                                        <h3 className={`text-[11px] md:text-xs font-black truncate mb-1.5 pr-4 ${isSelected ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-zinc-200' : 'text-zinc-800')}`}>{ticket.subject}</h3>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                                ticket.priority === 'high' || ticket.priority === 'urgent' 
                                                ? (isDark ? 'bg-red-950/50 text-red-400' : 'bg-red-50 text-red-600') 
                                                : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500')
                                            }`}>
                                                {ticket.priority}
                                            </span>
                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{formatDate(ticket.created_at).split(',')[0]}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`flex-1 flex flex-col h-full bg-transparent relative overflow-hidden ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
                        
                        {!selectedTicket ? (
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col justify-center items-center">
                                <div className="max-w-md w-full">
                                    <div className="text-center mb-6 md:mb-8">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 ${isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-zinc-50 border border-zinc-200 shadow-sm'}`}>
                                            <svg className={`w-5 h-5 md:w-6 md:h-6 ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-1.5">New Inquiry</h2>
                                        <p className={`text-[10px] md:text-xs font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Create a secure ticket. Our engineers will respond shortly.</p>
                                    </div>

                                    <form onSubmit={createTicket} className={`p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm transition-colors duration-500 ${isDark ? 'bg-zinc-950/50 border border-zinc-800' : 'bg-zinc-50 border border-zinc-200'}`}>
                                        <div className="space-y-4">
                                            <div>
                                                <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Subject</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    value={form.subject}
                                                    onChange={e => setForm({...form, subject: e.target.value})}
                                                    placeholder="Brief description of the issue"
                                                    className={`w-full p-3 md:p-4 rounded-xl outline-none text-xs font-bold transition-colors ${isDark ? 'bg-zinc-900 border border-zinc-700 text-white focus:border-zinc-500' : 'bg-white border border-zinc-200 focus:border-black'}`}
                                                />
                                            </div>
                                            <div>
                                                <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Priority Level</label>
                                                <select 
                                                    value={form.priority}
                                                    onChange={e => setForm({...form, priority: e.target.value})}
                                                    className={`w-full p-3 md:p-4 rounded-xl outline-none text-xs font-bold cursor-pointer transition-colors ${isDark ? 'bg-zinc-900 border border-zinc-700 text-white focus:border-zinc-500' : 'bg-white border border-zinc-200 focus:border-black'}`}
                                                >
                                                    <option value="normal">Normal - Standard Response</option>
                                                    <option value="high">High - Needs Attention</option>
                                                    <option value="urgent">Urgent - System Critical</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={`text-[9px] font-black uppercase tracking-widest block mb-1.5 ml-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Message / Details</label>
                                                <textarea 
                                                    required
                                                    value={form.message}
                                                    onChange={e => setForm({...form, message: e.target.value})}
                                                    placeholder="Provide as much context as possible..."
                                                    className={`w-full p-3 md:p-4 rounded-xl outline-none text-xs font-bold h-24 md:h-28 resize-none transition-colors ${isDark ? 'bg-zinc-900 border border-zinc-700 text-white focus:border-zinc-500' : 'bg-white border border-zinc-200 focus:border-black'}`}
                                                />
                                            </div>
                                            <button disabled={sending} className={`w-full py-3.5 md:py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all shadow-md disabled:opacity-50 flex justify-center items-center gap-3 mt-2 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                                                {sending ? <span className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${isDark ? 'border-black' : 'border-white'}`} /> : 'Submit Inquiry'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full w-full">
                                
                                <div className={`p-4 md:p-6 border-b shrink-0 z-20 flex justify-between items-center transition-colors duration-500 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <button onClick={() => setSelectedTicket(null)} className={`md:hidden flex items-center gap-1 text-[9px] font-black uppercase mb-3 transition-colors ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}>
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg> Back to Queue
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded border text-[8px] font-black uppercase ${
                                                selectedTicket.status === 'open' || selectedTicket.status === 'new' ? 'border-blue-200 text-blue-600 bg-blue-50/50' :
                                                selectedTicket.status === 'in-progress' ? 'border-amber-200 text-amber-600 bg-amber-50/50' :
                                                selectedTicket.status === 'resolved' ? 'border-emerald-200 text-emerald-600 bg-emerald-50/50' :
                                                'border-zinc-200 text-zinc-600 bg-zinc-50'
                                            }`}>
                                                {selectedTicket.status === 'open' ? 'NEW' : selectedTicket.status}
                                            </span>
                                            <span className={`text-[8px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                                                selectedTicket.priority === 'urgent' ? 'text-red-500' : 
                                                selectedTicket.priority === 'high' ? 'text-amber-500' : 
                                                'text-zinc-400'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    selectedTicket.priority === 'urgent' ? 'bg-red-500' : 
                                                    selectedTicket.priority === 'high' ? 'bg-amber-500' : 
                                                    'bg-zinc-300'
                                                }`} />
                                                {selectedTicket.priority} Priority
                                            </span>
                                            <span className={`text-[8px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                ID: {selectedTicket.id.split('-')[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <h2 className={`text-lg md:text-xl font-black uppercase tracking-tighter truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {selectedTicket.subject}
                                        </h2>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button onClick={downloadChat} className={`p-2 rounded-lg transition-colors shadow-sm ${isDark ? 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`} title="Download Chat Log">
                                            <svg className="w-4 h-4 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        </button>
                                        <button onClick={() => setSelectedTicket(null)} className={`px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors shadow-sm border ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'}`}>
                                            Close
                                        </button>
                                    </div>
                                </div>

                                <div className={`flex-1 overflow-y-auto p-4 md:p-6 space-y-5 md:space-y-6 scroll-smooth custom-scrollbar ${isDark ? 'bg-zinc-950/50' : 'bg-zinc-50/50'}`}>
                                    
                                    <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{formatDate(selectedTicket.created_at)}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest">{clientName}</span>
                                        </div>
                                        <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-[20px] md:rounded-[24px] rounded-tr-sm text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-sm ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                            {renderMessageText(selectedTicket.message)}
                                        </div>
                                    </div>

                                    {replies.map(reply => {
                                        const isAdmin = reply.sender_type === 'admin';
                                        return (
                                            <div key={reply.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2`}>
                                                <div className={`flex items-center gap-2 mb-1.5 ${isAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isAdmin ? 'text-emerald-600' : (isDark ? 'text-white' : 'text-black')}`}>{isAdmin ? 'Novatrum Support' : clientName}</span>
                                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{formatDate(reply.created_at)}</span>
                                                </div>
                                                <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-[20px] md:rounded-[24px] text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-sm
                                                    ${isAdmin 
                                                        ? (isDark ? 'bg-zinc-900 border border-zinc-800 rounded-tl-sm text-zinc-300' : 'bg-white border border-zinc-200 rounded-tl-sm text-black') 
                                                        : (isDark ? 'bg-white text-black rounded-tr-sm' : 'bg-black text-white rounded-tr-sm')
                                                    }
                                                `}>
                                                    {renderMessageText(reply.message)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className={`p-3 md:p-5 border-t shrink-0 z-10 transition-colors duration-500 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                                    {selectedTicket.status === 'closed' || selectedTicket.status === 'resolved' ? (
                                        <div className={`text-center p-4 rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>This ticket is closed. Please open a new ticket for further assistance.</p>
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            <form onSubmit={sendReply} className="flex gap-2 md:gap-3 items-center">
                                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={uploadingFile}
                                                    className={`p-3 rounded-xl md:rounded-[20px] transition-all flex items-center justify-center h-12 w-12 md:h-[52px] md:w-[52px] shrink-0 border border-transparent hover:border-zinc-300 ${isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}
                                                    title="Attach a file"
                                                >
                                                    {uploadingFile ? (
                                                        <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-zinc-400" />
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                    )}
                                                </button>

                                                <textarea 
                                                    value={replyMessage}
                                                    onChange={e => setReplyMessage(e.target.value)}
                                                    placeholder="Type your response to the client..."
                                                    className={`flex-1 rounded-xl md:rounded-[20px] px-4 py-3 md:px-5 md:py-3.5 text-xs font-bold outline-none resize-none h-12 md:h-[52px] transition-all shadow-sm ${isDark ? 'bg-zinc-950 border border-zinc-800 text-white focus:border-zinc-500 placeholder-zinc-600' : 'bg-zinc-50 border border-zinc-200 text-black focus:border-black focus:bg-white placeholder-zinc-400'}`}
                                                />
                                                
                                                <button type="submit" disabled={sending || !replyMessage.trim()} className={`p-3 rounded-xl md:rounded-[20px] disabled:opacity-50 active:scale-95 transition-all shadow-md flex items-center justify-center h-12 w-12 md:h-[52px] md:w-[52px] shrink-0 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                                                    {sending ? <span className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${isDark ? 'border-black' : 'border-white'}`} /> : <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${isDark ? '#3f3f46' : '#e4e4e7'}; border-radius: 20px; }
            `}} />
        </div>
    );
}