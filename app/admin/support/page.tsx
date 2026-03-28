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
    is_read: boolean;
}

export default function AdminSupportPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    
    // VERİ STATE'LERİ
    const [supportTickets, setSupportTickets] = useState<Ticket[]>([]);
    const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    
    // UI STATE'LERİ
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'closed'>('all');

    // AKTİF BİLET REFERANSI
    const selectedTicketIdRef = useRef<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        selectedTicketIdRef.current = selectedTicket?.id || null;
    }, [selectedTicket]);

    // MESAJLARIN EN ALTINA KAYDIRMA
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [replies]);

    // GÜVENLİK VE VERİ ÇEKME
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
            fetchSupportData();
        };

        checkAdmin();

        // REALTIME SUBSCRIPTION (GERÇEK ZAMANLI DİNLEME)
        const channel = supabase.channel('admin-support-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
                fetchSupportData();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_replies' }, (payload) => {
                const newReply = payload.new as Reply;
                
                if (selectedTicketIdRef.current === newReply.ticket_id) {
                    fetchReplies(newReply.ticket_id);
                    if (newReply.sender_type === 'client') {
                        markTicketAsRead(newReply.ticket_id);
                    }
                } else {
                    fetchSupportData();
                }
            })
            .subscribe();

        return () => { 
            supabase.removeChannel(channel); 
        };
    }, [router]);

    // TÜM BİLETLERİ VE OKUNMAMIŞ MESAJ SAYILARINI ÇEK
    const fetchSupportData = async () => {
        const { data: ticketsData, error: ticketsError } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: clientsData } = await supabase
            .from('clients')
            .select('id, full_name, email');

        if (ticketsError) console.error("Ticket Fetch Error:", ticketsError);

        if (ticketsData && clientsData) {
            const mergedTickets = ticketsData.map(ticket => {
                const client = clientsData.find(c => c.id === ticket.client_id);
                return {
                    ...ticket,
                    clients: client ? { full_name: client.full_name, email: client.email } : { full_name: 'Unknown', email: 'N/A' }
                };
            });
            setSupportTickets(mergedTickets);
        }

        const { data: unreadReplies } = await supabase
            .from('support_replies')
            .select('ticket_id')
            .eq('sender_type', 'client')
            .neq('is_read', true);

        const counts: { [key: string]: number } = {};
        if (unreadReplies) {
            unreadReplies.forEach(reply => {
                counts[reply.ticket_id] = (counts[reply.ticket_id] || 0) + 1;
            });
        }
        setUnreadCounts(counts);
    };

    // BİR BİLETİN MESAJ GEÇMİŞİNİ ÇEK
    const fetchReplies = async (ticketId: string) => {
        const { data } = await supabase
            .from('support_replies')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (data) {
            setReplies(data);
        }
    };

    // BİLETİ OKUNDU OLARAK İŞARETLE
    const markTicketAsRead = async (ticketId: string) => {
        await supabase
            .from('support_replies')
            .update({ is_read: true })
            .eq('ticket_id', ticketId)
            .eq('sender_type', 'client');
        
        const ticket = supportTickets.find(t => t.id === ticketId);
        if (ticket?.status === 'new') {
            await supabase
                .from('support_tickets')
                .update({ status: 'open' })
                .eq('id', ticketId);
        }
        
        setUnreadCounts(prev => ({ ...prev, [ticketId]: 0 }));
        setSupportTickets(prev => prev.map(t => 
            (t.id === ticketId && t.status === 'new') ? { ...t, status: 'open' } : t
        ));
    };

    // BİR BİLETE TIKLANDIĞINDA
    const handleSelectTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        fetchReplies(ticket.id);
        
        if (ticket.status === 'new' || (unreadCounts[ticket.id] > 0)) {
            markTicketAsRead(ticket.id);
        }
    };

    // SADECE PENCEREYİ KAPAT (Veritabanını etkilemez)
    const closeChatWindow = () => {
        setSelectedTicket(null);
    };

    // BİLETİN STATÜSÜNÜ (IN PROGRESS, RESOLVED VB.) DEĞİŞTİR
    const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
        try {
            await supabase
                .from('support_tickets')
                .update({ status: newStatus })
                .eq('id', ticketId);
                
            setSupportTickets(prev => prev.map(t => 
                t.id === ticketId ? { ...t, status: newStatus } : t
            ));

            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error("Error updating ticket status", error);
        }
    };

    // MESAJ GÖNDER
    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket) return;

        setSendingReply(true);
        try {
            await supabase.from('support_replies').insert({
                ticket_id: selectedTicket.id,
                sender_type: 'admin',
                message: replyMessage,
                is_read: false
            });

            if (selectedTicket.status === 'new') {
                await supabase.from('support_tickets').update({ status: 'open' }).eq('id', selectedTicket.id);
                setSupportTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, status: 'open' } : t));
            }

            setReplyMessage('');
            fetchReplies(selectedTicket.id);
        } catch (error) {
            console.error("Error sending reply", error);
        } finally {
            setSendingReply(false);
        }
    };

    // CSV DIŞA AKTAR
    const handleExportCSV = () => {
        if (supportTickets.length === 0) return;
        
        const headers = ["Ticket ID", "Client Name", "Client Email", "Subject", "Status", "Priority", "Created At"];
        const csvRows = supportTickets.map(t => [
            t.id, 
            `"${t.clients?.full_name || 'N/A'}"`, 
            `"${t.clients?.email || 'N/A'}"`, 
            `"${t.subject.replace(/"/g, '""')}"`, 
            t.status, 
            t.priority, 
            new Date(t.created_at).toLocaleString()
        ].join(','));
        
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `novatrum_tickets_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    // YENİ STATÜLERE GÖRE LİSTE FİLTRELEME
    const filteredTickets = supportTickets.filter(t => {
        if (ticketFilter === 'all') return true;
        if (ticketFilter === 'open') return ['new', 'open', 'in-progress'].includes(t.status);
        if (ticketFilter === 'closed') return ['resolved', 'closed'].includes(t.status);
        return true;
    });

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">
                Authenticating...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-black font-sans selection:bg-black selection:text-white p-4 md:p-10 relative">
            
            {/* HEADER ALANI */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 mb-8 animate-in fade-in duration-500">
                <div>
                    <button 
                        onClick={() => router.push('/admin/dashboard')} 
                        className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Workspace
                    </button>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-zinc-900">Support Queue</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Client Communication & Issue Tracking</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white border border-zinc-200 rounded-xl p-1 flex shadow-sm">
                        <button 
                            onClick={() => setTicketFilter('all')} 
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${ticketFilter === 'all' ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-black'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => setTicketFilter('open')} 
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${ticketFilter === 'open' ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-black'}`}
                        >
                            Active
                        </button>
                        <button 
                            onClick={() => setTicketFilter('closed')} 
                            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${ticketFilter === 'closed' ? 'bg-zinc-100 text-black' : 'text-zinc-400 hover:text-black'}`}
                        >
                            Closed
                        </button>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)} 
                            className="bg-white border border-zinc-200 text-black px-4 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                            Export
                        </button>
                        {showExportMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <button 
                                        onClick={handleExportCSV} 
                                        className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors border-b border-zinc-100"
                                    >
                                        Export as CSV
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ANA İÇERİK ALANI */}
            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-220px)] min-h-[500px] animate-in slide-in-from-bottom-4 duration-500">
                
                {/* SOL PANEL (BİLET LİSTESİ) */}
                <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-[24px] md:rounded-[32px] overflow-hidden flex flex-col shadow-sm">
                    <div className="p-5 md:p-6 border-b border-zinc-200 bg-zinc-50">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Active Directory</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredTickets.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No tickets found.</p>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => {
                                const unreadCount = unreadCounts[ticket.id] || 0;
                                const hasUnread = unreadCount > 0 || ticket.status === 'new';
                                const isSelected = selectedTicket?.id === ticket.id;

                                return (
                                    <div 
                                        key={ticket.id} 
                                        onClick={() => handleSelectTicket(ticket)}
                                        className={`p-5 md:p-6 border-b border-zinc-100 cursor-pointer transition-all hover:bg-zinc-50 group relative ${
                                            isSelected ? 'bg-zinc-50 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-black' : ''
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-xs uppercase tracking-widest text-zinc-900 line-clamp-1 pr-2">
                                                {ticket.subject}
                                            </span>
                                            
                                            {/* KIRMIZI NEW (YENİ MESAJ) BİLDİRİMİ */}
                                            {hasUnread && (
                                                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest shrink-0 shadow-sm animate-pulse">
                                                    {unreadCount > 0 ? `${unreadCount} NEW` : 'NEW'}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 truncate">
                                            {ticket.clients?.full_name}
                                        </p>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                                ['closed', 'resolved'].includes(ticket.status) ? 'bg-zinc-100 text-zinc-400' : 
                                                ticket.status === 'in-progress' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                                                'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* SAĞ PANEL (SOHBET ALANI) */}
                <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-[24px] md:rounded-[32px] flex flex-col overflow-hidden shadow-sm h-[500px] lg:h-auto">
                    
                    {/* SOHBET HEADER */}
                    {selectedTicket ? (
                        <div className="p-5 md:p-8 border-b border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-zinc-900 mb-1">
                                    {selectedTicket.subject}
                                </h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    {selectedTicket.clients?.full_name} 
                                    <span className="w-1 h-1 rounded-full bg-zinc-300" /> 
                                    {selectedTicket.clients?.email}
                                </p>
                            </div>
                            
                            {/* YENİ: STATÜ DEĞİŞTİRİCİ VE KAPATMA (X) BUTONU */}
                            <div className="flex items-center gap-3">
                                <select 
                                    value={selectedTicket.status}
                                    onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border outline-none cursor-pointer ${
                                        ['closed', 'resolved'].includes(selectedTicket.status) ? 'bg-zinc-50 border-zinc-200 text-zinc-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                    }`}
                                >
                                    <option value="new">New</option>
                                    <option value="open">Open</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                                
                                <button 
                                    onClick={closeChatWindow} 
                                    className="bg-white border border-zinc-200 text-zinc-400 p-1.5 rounded-lg hover:bg-zinc-50 hover:text-black transition-colors shadow-sm"
                                    title="Close Chat"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 md:p-8 border-b border-zinc-200 bg-zinc-50">
                            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-300">No Ticket Selected</h2>
                        </div>
                    )}

                    {/* SOHBET GEÇMİŞİ */}
                    <div className="flex-1 overflow-y-auto p-5 md:p-8 bg-zinc-50/50 custom-scrollbar flex flex-col">
                        {!selectedTicket ? (
                            <div className="m-auto text-center">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                    Select a ticket from the queue to view details.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 md:space-y-8 flex-1 flex flex-col">
                                
                                {/* İLK BİLET MESAJI (Müşterinin Açtığı Mesaj) */}
                                <div className="flex flex-col gap-1 items-start">
                                    <div className="bg-white border border-zinc-200 text-zinc-800 p-4 md:p-5 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm">
                                        <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">
                                            {selectedTicket.message}
                                        </p>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                                        {new Date(selectedTicket.created_at).toLocaleString()}
                                    </span>
                                </div>

                                {/* YANITLAR (Döngü) */}
                                {replies.map((reply) => {
                                    const isAdminReply = reply.sender_type === 'admin';
                                    return (
                                        <div key={reply.id} className={`flex flex-col gap-1 ${isAdminReply ? 'items-end' : 'items-start'}`}>
                                            <div className={`p-4 md:p-5 max-w-[90%] shadow-sm ${
                                                isAdminReply ? 'bg-black text-white rounded-2xl rounded-tr-sm' : 'bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-sm'
                                            }`}>
                                                <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">
                                                    {reply.message}
                                                </p>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest text-zinc-400 ${isAdminReply ? 'mr-1' : 'ml-1'}`}>
                                                {new Date(reply.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}

                                {/* En alta kaydırma için görünmez div */}
                                <div ref={messagesEndRef} />

                                {/* MESAJ GÖNDERME ALANI */}
                                <div className="mt-auto pt-6 sticky bottom-0 bg-zinc-50/50 backdrop-blur-md pb-2">
                                    {['closed', 'resolved'].includes(selectedTicket.status) ? (
                                        <div className="bg-white border border-zinc-200 p-4 rounded-2xl text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                This ticket is {selectedTicket.status}. No further replies can be sent.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSendReply} className="flex gap-3">
                                            <textarea 
                                                placeholder="Type your response..." 
                                                value={replyMessage} 
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                onKeyDown={(e) => { 
                                                    if (e.key === 'Enter' && !e.shiftKey) { 
                                                        e.preventDefault(); 
                                                        handleSendReply(e); 
                                                    } 
                                                }}
                                                className="flex-1 bg-white border border-zinc-200 rounded-[16px] md:rounded-[20px] p-3 md:p-4 text-xs font-bold outline-none resize-none h-[50px] md:h-[60px] focus:border-black transition-colors custom-scrollbar" 
                                            />
                                            
                                            <button 
                                                type="submit" 
                                                disabled={sendingReply || !replyMessage.trim()} 
                                                className="bg-black text-white p-3 md:p-4 rounded-[16px] md:rounded-[20px] disabled:opacity-50 hover:bg-zinc-800 active:scale-95 transition-all w-[50px] md:w-[60px] h-[50px] md:h-[60px] flex items-center justify-center shrink-0 shadow-sm"
                                            >
                                                {sendingReply ? (
                                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                                )}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
            `}} />
        </div>
    );
}