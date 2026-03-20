"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ClientSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    
    // YENİ: Okunmamış mesaj sayılarını tutacağımız state { ticket_id: sayi }
    const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});

    const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' });
    const router = useRouter();

    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        if (!storedId) return router.push('/client/login');
        setClientId(storedId);
        
        // Önce okunmamış mesaj kayıtlarını local storage'dan alalım
        const storedUnreads = localStorage.getItem(`novatrum_unreads_${storedId}`);
        if (storedUnreads) {
            setUnreadCounts(JSON.parse(storedUnreads));
        }

        fetchTickets(storedId);

        // 1. TİCKET DURUM DEĞİŞİKLİKLERİNİ DİNLE (Genel)
        const channel = supabase.channel('support-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `client_id=eq.${storedId}` }, () => {
                fetchTickets(storedId);
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [router]);

    // 2. YENİ MESAJ GELDİ Mİ? (Global Dinleyici)
    useEffect(() => {
        if (!clientId) return;

        const globalChatChannel = supabase.channel('global-client-chat')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_replies' }, (payload) => {
                
                // Eğer mesajı admin gönderdiyse
                if (payload.new.sender_type === 'admin') {
                    const incomingTicketId = payload.new.ticket_id;

                    // Eğer bu ticket şu an AÇIKSA (sohbetteysek), mesajı ekrana yaz ve okunmamış sayma
                    if (selectedTicket && selectedTicket.id === incomingTicketId) {
                        setReplies(current => [...current, payload.new]);
                    } 
                    // Eğer ticket KAPALIYSA (veya başka ticket'taysak), okunmamış sayısını arttır
                    else {
                        setUnreadCounts(prev => {
                            const newCounts = { ...prev, [incomingTicketId]: (prev[incomingTicketId] || 0) + 1 };
                            localStorage.setItem(`novatrum_unreads_${clientId}`, JSON.stringify(newCounts));
                            return newCounts;
                        });
                    }
                }
            }).subscribe();

        return () => { supabase.removeChannel(globalChatChannel); };
    }, [clientId, selectedTicket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [replies]);

    const fetchTickets = async (id: string) => {
        const { data } = await supabase.from('support_tickets').select('*').eq('client_id', id).order('created_at', { ascending: false });
        if (data) {
            setTickets(data);
            if (selectedTicket) {
                const updatedTicket = data.find(t => t.id === selectedTicket.id);
                if (updatedTicket) setSelectedTicket(updatedTicket);
            }
        }
        setLoading(false);
    };

    const openTicket = async (ticket: any) => {
        setSelectedTicket(ticket);
        
        // YENİ: Ticket açıldığında okunmamış mesaj sayısını sıfırla
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[ticket.id];
            localStorage.setItem(`novatrum_unreads_${clientId}`, JSON.stringify(newCounts));
            return newCounts;
        });

        const { data } = await supabase.from('ticket_replies').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
        setReplies(data || []);
    };

    const handleSubmitNewTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !form.subject || !form.message) return;
        setSending(true);
        try {
            const { error } = await supabase.from('support_tickets').insert([{
                client_id: clientId, subject: form.subject, message: form.message, priority: form.priority, status: 'open'
            }]);
            if (error) throw error;
            setForm({ subject: '', message: '', priority: 'normal' });
            fetchTickets(clientId);
        } catch (error: any) { alert("Error: " + error.message); } 
        finally { setSending(false); }
    };

    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket) return;
        setSending(true);

        try {
            const newReply = { ticket_id: selectedTicket.id, sender_type: 'client', message: replyMessage };
            const { data, error } = await supabase.from('ticket_replies').insert(newReply).select().single();
            if (error) throw error;

            if (selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') {
                await supabase.from('support_tickets').update({ status: 'open' }).eq('id', selectedTicket.id);
            }

            setReplies(current => [...current, data]);
            setReplyMessage('');
            fetchTickets(clientId!);
        } catch (error: any) { 
            alert("Error: " + error.message); 
        } 
        finally { setSending(false); }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'in-progress': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
            case 'resolved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default: return 'bg-zinc-50 text-zinc-600 border-zinc-100';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-black uppercase text-xs">Connecting to Support...</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-black p-6 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto pt-10">
                <div className="mb-12">
                    <button onClick={() => router.push('/client/dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors mb-8">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Hub
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Support Center</h1>
                    <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mt-2">Submit a request to the infrastructure team</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {!selectedTicket ? (
                            <form onSubmit={handleSubmitNewTicket} className="bg-white border border-zinc-200 p-8 rounded-[30px] shadow-sm space-y-6 sticky top-8">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 pb-4 border-b border-zinc-100">Open New Ticket</h2>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2">Subject</label>
                                    <input type="text" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-zinc-300 transition-all" placeholder="e.g., API Connection Issue" required />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2">Priority Level</label>
                                    <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-xs font-bold outline-none cursor-pointer focus:bg-white focus:border-zinc-300 transition-all uppercase tracking-widest">
                                        <option value="low">LOW</option><option value="normal">NORMAL</option><option value="high">HIGH</option><option value="urgent">URGENT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2">Message</label>
                                    <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-zinc-300 transition-all h-32 resize-none" placeholder="Describe your issue in detail..." required />
                                </div>
                                <button type="submit" disabled={sending} className="w-full bg-black text-white py-5 rounded-[16px] font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all disabled:opacity-50 mt-4">
                                    {sending ? 'TRANSMITTING...' : 'SUBMIT TICKET'}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-white border border-zinc-200 p-6 rounded-[30px] shadow-sm flex flex-col h-[650px]">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Tickets</h2>
                                    <button onClick={() => setSelectedTicket(null)} className="text-[9px] font-black uppercase bg-zinc-100 text-black px-3 py-1.5 rounded-lg hover:bg-zinc-200 transition-colors">+ New</button>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                    {tickets.map(ticket => (
                                        <div key={ticket.id} onClick={() => openTicket(ticket)} className={`relative p-4 rounded-2xl cursor-pointer transition-all border ${selectedTicket?.id === ticket.id ? 'bg-black text-white border-black' : 'bg-zinc-50 hover:bg-white border-zinc-100 hover:border-zinc-300'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${selectedTicket?.id === ticket.id ? 'border-zinc-700 text-zinc-300' : getStatusStyle(ticket.status)}`}>{ticket.status}</span>
                                                
                                                {/* YENİ MESAJ BİLDİRİMİ (BUNU EKLEDİK) */}
                                                {unreadCounts[ticket.id] > 0 && selectedTicket?.id !== ticket.id && (
                                                    <span className="bg-red-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse">
                                                        {unreadCounts[ticket.id]} NEW
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`text-xs font-black uppercase truncate pr-8 ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-black'}`}>{ticket.subject}</h3>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        {!selectedTicket ? (
                            <div className="space-y-4">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 pl-2">Ticket History</h2>
                                {tickets.length === 0 ? (
                                    <div className="bg-white border border-zinc-100 p-16 rounded-[40px] text-center flex flex-col items-center justify-center space-y-4">
                                        <svg className="w-12 h-12 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">No support tickets found</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {tickets.map(ticket => (
                                            <div key={ticket.id} onClick={() => openTicket(ticket)} className="bg-white border border-zinc-200 p-6 md:p-8 rounded-[30px] shadow-sm hover:shadow-md hover:border-black cursor-pointer transition-all group relative">
                                                
                                                {/* YENİ MESAJ BİLDİRİMİ (BÜYÜK KART İÇİN) */}
                                                {unreadCounts[ticket.id] > 0 && (
                                                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-full border-2 border-white animate-bounce shadow-md">
                                                        {unreadCounts[ticket.id]} NEW MESSAGES
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${getStatusStyle(ticket.status)}`}>{ticket.status}</span>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'urgent' ? 'bg-red-500' : 'bg-zinc-300'}`} /> {ticket.priority}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1.5 rounded-lg">{formatDate(ticket.created_at)}</span>
                                                </div>
                                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 group-hover:text-zinc-700 pr-8">{ticket.subject}</h3>
                                                <p className="text-xs text-zinc-500 line-clamp-1">{ticket.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white border border-zinc-200 rounded-[30px] shadow-sm flex flex-col h-[650px] overflow-hidden">
                                <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-start bg-zinc-50/50">
                                    <div>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase border ${getStatusStyle(selectedTicket.status)}`}>{selectedTicket.status}</span>
                                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">{selectedTicket.priority} Priority</span>
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight">{selectedTicket.subject}</h3>
                                    </div>
                                    <button onClick={() => setSelectedTicket(null)} className="p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-full transition-colors active:scale-95">
                                        <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 bg-[#FBFBFB]">
                                    <div className="flex justify-end">
                                        <div className="bg-black text-white p-5 rounded-2xl rounded-tr-none max-w-[85%] md:max-w-[75%] shadow-sm">
                                            <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap">{selectedTicket.message}</p>
                                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-3 block">{formatDate(selectedTicket.created_at)}</span>
                                        </div>
                                    </div>
                                    {replies.map(reply => (
                                        <div key={reply.id} className={`flex ${reply.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-5 rounded-2xl max-w-[85%] md:max-w-[75%] shadow-sm ${reply.sender_type === 'client' ? 'bg-black text-white rounded-tr-none' : 'bg-white border border-zinc-200 rounded-tl-none'}`}>
                                                <p className={`text-xs font-bold leading-relaxed whitespace-pre-wrap ${reply.sender_type === 'client' ? 'text-white' : 'text-zinc-700'}`}>{reply.message}</p>
                                                <span className={`text-[8px] font-bold tracking-widest uppercase mt-3 block ${reply.sender_type === 'client' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                    {reply.sender_type === 'admin' ? 'Infrastructure Team • ' : ''}{formatDate(reply.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-6 bg-white border-t border-zinc-100">
                                    {selectedTicket.status === 'resolved' && (
                                        <div className="mb-4 bg-yellow-50 border border-yellow-100 p-3.5 rounded-xl flex items-center justify-center gap-3 animate-in slide-in-from-bottom-2">
                                            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            <p className="text-[9px] font-black uppercase text-yellow-700 tracking-widest">This ticket is resolved. Sending a reply will reopen it.</p>
                                        </div>
                                    )}
                                    <form onSubmit={sendReply} className="flex items-end gap-3">
                                        <textarea
                                            value={replyMessage}
                                            onChange={(e) => setReplyMessage(e.target.value)}
                                            placeholder="Type your reply..."
                                            className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none resize-none h-16 focus:bg-white focus:border-zinc-300 transition-all"
                                        />
                                        <button type="submit" disabled={sending || !replyMessage.trim()} className="bg-black text-white p-4 rounded-2xl disabled:opacity-50 hover:bg-zinc-800 active:scale-95 transition-all shadow-md flex items-center justify-center h-16 w-16">
                                            {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}