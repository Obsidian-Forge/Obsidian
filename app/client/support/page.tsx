"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ClientSupportPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({});
    const [form, setForm] = useState({ subject: '', message: '', priority: 'normal' });
    const router = useRouter();

    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replies, setReplies] = useState<any[]>([]);
    const [replyMessage, setReplyMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. İLK YÜKLEME VE KİMLİK KONTROLÜ
    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        const storedName = localStorage.getItem('novatrum_client_name');
        
        if (!storedId) return router.push('/client/login');
        
        setClientId(storedId);
        setClientName(storedName || 'Client');
        
        const storedUnreads = localStorage.getItem(`novatrum_unreads_${storedId}`);
        if (storedUnreads) setUnreadCounts(JSON.parse(storedUnreads));

        fetchTickets(storedId);

        // 2. REALTIME: TICKET LİSTESİ DİNLEYİCİSİ (Yeni ticket açılınca anında listeye düşer)
        const ticketChannel = supabase.channel('client-ticket-list')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `client_id=eq.${storedId}` }, () => {
                fetchTickets(storedId);
            }).subscribe();

        return () => { supabase.removeChannel(ticketChannel); };
    }, [router]);

    // 3. REALTIME: SOHBET (REPLIES) DİNLEYİCİSİ (Hem admin hem benim yazdıklarımı anında ekrana basar)
    useEffect(() => {
        if (!clientId) return;
        
        const chatChannel = supabase.channel('client-chat-sync')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_replies' }, (payload) => {
                const newReply = payload.new;
                
                // Eğer sohbet ekranı açıksa ve gelen mesaj o sohbete aitse
                if (selectedTicket && selectedTicket.id === newReply.ticket_id) {
                    setReplies(current => {
                        const exists = current.find(r => r.id === newReply.id);
                        if (exists) return current; // Kendi yazdığım mesaja çift eklemeyi engelle
                        return [...current, newReply];
                    });
                } 
                // Eğer sohbet kapalıysa ve mesaj Admin'den geldiyse bildirim (NEW) çıkart
                else if (newReply.sender_type === 'admin') {
                    setUnreadCounts(prev => {
                        const newCounts = { ...prev, [newReply.ticket_id]: (prev[newReply.ticket_id] || 0) + 1 };
                        localStorage.setItem(`novatrum_unreads_${clientId}`, JSON.stringify(newCounts));
                        return newCounts;
                    });
                }
            }).subscribe();
            
        return () => { supabase.removeChannel(chatChannel); };
    }, [clientId, selectedTicket]);

    useEffect(() => {
        // Yeni mesaj gelince sayfayı en alta kaydır
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [replies]);

    // BİLETLERİ GETİR
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

    // SOHBETİ AÇ
    const openTicket = async (ticket: any) => {
        setSelectedTicket(ticket);
        
        // Okunmamış (NEW) bildirimlerini sıfırla
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[ticket.id];
            localStorage.setItem(`novatrum_unreads_${clientId}`, JSON.stringify(newCounts));
            return newCounts;
        });
        
        const { data } = await supabase.from('ticket_replies').select('*').eq('ticket_id', ticket.id).order('created_at', { ascending: true });
        setReplies(data || []);
    };

    // YENİ TICKET OLUŞTUR (Sol Panel)
    const handleSubmitNewTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId || !form.subject || !form.message) return;
        setSending(true);
        try {
            const { error } = await supabase.from('support_tickets').insert([{ 
                client_id: clientId, 
                subject: form.subject, 
                message: form.message, 
                priority: form.priority, 
                status: 'open' 
            }]);
            
            if (error) throw error;
            
            setForm({ subject: '', message: '', priority: 'normal' });
            fetchTickets(clientId); // Listeyi hemen güncelle
            alert("Ticket successfully opened!");
        } catch (error: any) { 
            alert("Error: " + error.message); 
        } finally { 
            setSending(false); 
        }
    };

    // CEVAP GÖNDER (Sağ Panel)
    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !selectedTicket) return;
        setSending(true);
        
        const messageText = replyMessage;
        setReplyMessage(''); // Ekrandan hemen sil (Hızlı hissiyat)

        try {
            const { data, error } = await supabase.from('ticket_replies').insert({ 
                ticket_id: selectedTicket.id, 
                sender_type: 'client', 
                message: messageText 
            }).select().single();
            
            if (error) throw error;
            
            // Eğer ticket çözüldüyse tekrar aç
            if (selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') {
                await supabase.from('support_tickets').update({ status: 'open' }).eq('id', selectedTicket.id);
            }
            
            // Kendi mesajımı anında ekrana bas
            setReplies(current => [...current, data]);
            fetchTickets(clientId!); 

        } catch (error: any) { 
            alert("Error sending message: " + error.message); 
            setReplyMessage(messageText); // Hata olursa mesajı inputa geri koy
        } finally { 
            setSending(false); 
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'open': return 'border-blue-200 text-blue-600 bg-blue-50';
            case 'in-progress': return 'border-yellow-200 text-yellow-600 bg-yellow-50';
            case 'resolved': return 'border-emerald-200 text-emerald-600 bg-emerald-50';
            default: return 'border-zinc-200 text-zinc-600 bg-zinc-50';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-black uppercase text-xs text-zinc-400">Connecting to Support...</div>;

    return (
        <div className="flex min-h-screen bg-[#F8F9FA] text-black font-sans relative overflow-x-hidden">
            
            {/* MOBILE HEADER */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-zinc-200 z-40 p-4 flex justify-between items-center">
                <h2 className="text-xl font-black tracking-tighter uppercase">NOVATRUM</h2>
                <button onClick={() => router.push('/client/dashboard')} className="p-2 bg-zinc-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                </button>
            </div>

            {/* MAIN CONTENT */}
            <main className="flex-1 mt-16 md:mt-0 p-4 md:p-16 w-full max-w-[100vw]">
                <div className="max-w-6xl mx-auto space-y-6 md:space-y-12">
                    
                    {/* TITLE AREA (Masaüstü için) */}
                    <div className="hidden md:flex items-center gap-4 mb-4">
                        <button onClick={() => router.push('/client/dashboard')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            Back to Hub
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">Support Center</h1>
                            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Submit a request to the infrastructure team</p>
                        </div>
                        <button onClick={() => fetchTickets(clientId!)} className="hidden md:flex p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-full transition-all active:scale-95 text-zinc-400 hover:text-black shadow-sm" title="Refresh Tickets">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start w-full relative">
                        
                        {/* SOL PANEL (YENİ TİCKET & BİLET LİSTESİ) */}
                        {/* MOBİLDE CHAT AÇIKSA BU PANEL GİZLENİR */}
                        <div className={`w-full lg:w-1/3 bg-white border border-zinc-200 p-4 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm flex-col h-[80vh] md:h-[650px] lg:sticky lg:top-8 ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                            
                            {tickets.length === 0 ? (
                                // BİLET YOKSA - YENİ OLUŞTURMA FORMU GÖSTER
                                <form onSubmit={handleSubmitNewTicket} className="flex flex-col h-full space-y-6">
                                    <div className="border-b border-zinc-100 pb-4 mb-2">
                                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Open New Ticket</h2>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2">Subject</label>
                                        <input type="text" value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-zinc-300 transition-all" placeholder="e.g., API Connection Issue" required />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2">Priority Level</label>
                                        <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-xs font-bold outline-none cursor-pointer focus:bg-white transition-all uppercase tracking-widest">
                                            <option value="low">LOW</option><option value="normal">NORMAL</option><option value="high">HIGH</option><option value="urgent">URGENT</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2">Message</label>
                                        <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="w-full flex-1 bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-zinc-300 transition-all resize-none min-h-[100px]" placeholder="Describe your issue..." required />
                                    </div>
                                    <button type="submit" disabled={sending} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg active:scale-95 transition-all disabled:opacity-50 mt-auto shrink-0">
                                        {sending ? 'TRANSMITTING...' : 'SUBMIT TICKET'}
                                    </button>
                                </form>
                            ) : (
                                // BİLET VARSA - BİLET LİSTESİ VE KÜÇÜK YENİ BİLET BUTONU GÖSTER
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-4 md:mb-6 pb-4 border-b border-zinc-100 shrink-0">
                                        <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">All Tickets</h2>
                                        <button onClick={() => { setTickets([]); setForm({ subject: '', message: '', priority: 'normal' }); }} className="text-[9px] font-black uppercase bg-zinc-100 text-black px-3 py-1.5 rounded-lg hover:opacity-80 transition-colors">+ New</button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto pr-1 md:pr-2 space-y-3">
                                        {tickets.map(ticket => (
                                            <div key={ticket.id} onClick={() => openTicket(ticket)} className={`relative p-4 md:p-5 rounded-[20px] cursor-pointer transition-all border shadow-sm ${selectedTicket?.id === ticket.id ? 'bg-black text-white border-black' : 'bg-white hover:bg-zinc-50 border-zinc-100 hover:border-zinc-300'}`}>
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`text-[7px] md:text-[8px] font-black uppercase px-2 py-1 rounded-md border ${selectedTicket?.id === ticket.id ? 'border-zinc-700 text-zinc-300' : getStatusStyle(ticket.status)}`}>{ticket.status}</span>
                                                    {unreadCounts[ticket.id] > 0 && selectedTicket?.id !== ticket.id && (
                                                        <span className="bg-red-500 text-white text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_8px_red]">
                                                            {unreadCounts[ticket.id]} NEW
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`text-sm md:text-base font-black uppercase tracking-tighter truncate ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-black'}`}>{ticket.subject}</h3>
                                                <p className={`text-[8px] md:text-[9px] uppercase tracking-widest mt-1.5 truncate ${selectedTicket?.id === ticket.id ? 'text-zinc-400' : 'text-zinc-400'}`}>{ticket.clients?.full_name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SAĞ PANEL (SOHBET EKRANI) */}
                        {/* MOBİLDE SADECE TİCKET SEÇİLİYSE GÖSTER */}
                        <div className={`w-full lg:w-2/3 bg-white border border-zinc-200 rounded-[24px] md:rounded-[40px] shadow-sm flex-col h-[80vh] md:h-[650px] overflow-hidden ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                            {!selectedTicket ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                                    <svg className="w-12 h-12 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Select a ticket to view details</p>
                                </div>
                            ) : (
                                <>
                                    {/* SOHBET BAŞLIĞI */}
                                    <div className="p-4 md:p-6 lg:p-8 border-b border-zinc-100 flex flex-col md:flex-row md:justify-between md:items-start bg-zinc-50/50 shrink-0">
                                        <div className="flex-1 min-w-0 pr-4">
                                            {/* MOBİLDE GERİ DÖNÜŞ BUTONU */}
                                            <button onClick={() => setSelectedTicket(null)} className="lg:hidden flex items-center gap-1 text-[9px] font-black uppercase text-zinc-500 mb-4 hover:text-black bg-zinc-100 w-fit px-3 py-1.5 rounded-lg">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg> Back to Tickets
                                            </button>

                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                                <span className={`px-2 py-1 rounded-md text-[7px] md:text-[8px] font-black uppercase border ${getStatusStyle(selectedTicket.status)}`}>{selectedTicket.status}</span>
                                                <span className="text-[7px] md:text-[8px] font-bold text-zinc-400 uppercase tracking-widest shrink-0">{selectedTicket.priority} Priority</span>
                                                <span className="text-[7px] md:text-[8px] font-bold text-black bg-zinc-200 px-2 py-1 rounded-md uppercase tracking-widest truncate hidden sm:inline-block">Client: {selectedTicket.clients?.full_name}</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter truncate">{selectedTicket.subject}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-3 shrink-0 mt-4 md:mt-0 self-end md:self-start">
                                            <button onClick={() => setSelectedTicket(null)} className="hidden lg:flex p-2 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-full transition-colors active:scale-95">
                                                <svg className="w-4 h-4 md:w-5 md:h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* SOHBET İÇERİĞİ */}
                                    <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto space-y-4 md:space-y-6 bg-white">
                                        {/* İLK MESAJ (SOL) */}
                                        <div className="flex justify-end">
                                            <div className="bg-zinc-100 border border-zinc-200 p-4 md:p-5 rounded-2xl rounded-tr-none max-w-[90%] md:max-w-[75%] shadow-sm">
                                                <p className="text-[10px] md:text-xs font-bold leading-relaxed whitespace-pre-wrap text-black">{selectedTicket.message}</p>
                                                <span className="text-[7px] md:text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-2 md:mt-3 block">YOU • {formatDate(selectedTicket.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* CEVAPLAR */}
                                        {replies.map(reply => (
                                            <div key={reply.id} className={`flex ${reply.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-4 md:p-5 rounded-2xl max-w-[90%] md:max-w-[75%] shadow-sm ${reply.sender_type === 'client' ? 'bg-zinc-100 text-black border border-zinc-200 rounded-tr-none' : 'bg-black text-white rounded-tl-none'}`}>
                                                    <p className="text-[10px] md:text-xs font-bold leading-relaxed whitespace-pre-wrap">{reply.message}</p>
                                                    <span className={`text-[7px] md:text-[8px] font-bold tracking-widest uppercase mt-2 md:mt-3 block ${reply.sender_type === 'client' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                        {reply.sender_type === 'client' ? 'You • ' : `Admin Team • `}{formatDate(reply.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* MESAJ YAZMA ALANI */}
                                    <div className="p-4 md:p-6 bg-white border-t border-zinc-100 shrink-0">
                                        {selectedTicket.status === 'resolved' && (
                                            <div className="mb-3 md:mb-4 bg-emerald-50 border border-emerald-100 p-2 md:p-3.5 rounded-xl flex items-center justify-center gap-2 md:gap-3">
                                                <svg className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                <p className="text-[8px] md:text-[9px] font-black uppercase text-emerald-700 tracking-widest text-center">This ticket is resolved. Sending a reply will reopen it.</p>
                                            </div>
                                        )}
                                        <form onSubmit={sendReply} className="flex items-end gap-2 md:gap-3">
                                            <textarea
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Type your reply..."
                                                className="flex-1 bg-white border border-zinc-200 rounded-xl md:rounded-[20px] px-4 py-3 md:px-5 md:py-4 text-[10px] md:text-xs font-bold outline-none resize-none h-14 md:h-[70px] focus:border-black transition-all shadow-sm"
                                            />
                                            <button type="submit" disabled={sending || !replyMessage.trim()} className="bg-black text-white p-3 md:p-4 rounded-xl md:rounded-[20px] disabled:opacity-50 hover:bg-zinc-800 active:scale-95 transition-all shadow-md flex items-center justify-center h-14 w-14 md:h-[70px] md:w-[70px] shrink-0">
                                                {sending ? <span className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>}
                                            </button>
                                        </form>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}