"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Search, 
    Paperclip, 
    Send, 
    ChevronLeft, 
    Download, 
    Trash2,
    ShieldCheck,
    MessageSquare,
    X
} from 'lucide-react';

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
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isDark, setIsDark] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        const storedName = localStorage.getItem('novatrum_client_name');
        if (!storedId) return router.push('/client/login');
        setClientId(storedId);
        setClientName(storedName || 'Client');
        fetchTickets(storedId);

        const checkTheme = () => setIsDark(localStorage.getItem('novatrum_theme') === 'dark');
        checkTheme();
        window.addEventListener('theme-changed', checkTheme);

        const ticketsChannel = supabase.channel('support-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets', filter: `client_id=eq.${storedId}` }, () => fetchTickets(storedId))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_replies' }, (payload) => {
                const newReply = payload.new;
                if (selectedTicketIdRef.current === newReply.ticket_id) {
                    setReplies(current => current.some(r => r.id === newReply.id) ? current : [...current, newReply]);
                } else if (newReply.sender_type === 'admin') {
                    fetchTickets(storedId);
                }
            }).subscribe();

        return () => { supabase.removeChannel(ticketsChannel); };
    }, []);

    useEffect(() => {
        selectedTicketIdRef.current = selectedTicket?.id || null;
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [replies, selectedTicket]);

    const fetchTickets = async (cId: string) => {
        const { data: ticketsData } = await supabase.from('support_tickets').select('*').eq('client_id', cId).order('created_at', { ascending: false });
        if (ticketsData) setTickets(ticketsData);
        setLoading(false);
    };

    const fetchReplies = async (ticketId: string) => {
        const { data } = await supabase.from('support_replies').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true });
        if (data) setReplies(data);
    };

    const handleSelectTicket = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsCreatingNew(false);
        fetchReplies(ticket.id);
    };

    const sendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || sending) return;
        setSending(true);
        const { data } = await supabase.from('support_replies').insert({ ticket_id: selectedTicket.id, sender_type: 'client', message: replyMessage }).select().single();
        if (data) setReplies(curr => [...curr, data]);
        setReplyMessage('');
        setSending(false);
    };

    const createTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        const { error } = await supabase.from('support_tickets').insert({ client_id: clientId, subject: form.subject, message: form.message, priority: form.priority, status: 'open' });
        if (!error) {
            setIsCreatingNew(false);
            fetchTickets(clientId!);
            showToast("Inquiry submitted.");
        }
        setSending(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !selectedTicket) return;
        setUploadingFile(true);
        const file = e.target.files[0];
        const filePath = `tickets/${clientId}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            await supabase.from('support_replies').insert({ ticket_id: selectedTicket.id, sender_type: 'client', message: `Attached file: [${file.name}](${publicUrl})` });
        }
        setUploadingFile(false);
    };

    const formatDate = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (loading) return null;

    return (
        <div className={`flex h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] -m-6 lg:-m-12 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
            
            {/* TICKET LIST - Mobilde bilet seçiliyse gizlenir */}
            <aside className={`${selectedTicket || isCreatingNew ? 'hidden lg:flex' : 'flex'} w-full lg:w-96 flex-col border-r transition-colors duration-500 ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-black/[0.02]'}`}>
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-light tracking-tighter">Support</h2>
                        <button onClick={() => setIsCreatingNew(true)} className={`p-2.5 rounded-xl ${isDark ? 'bg-white text-black' : 'bg-black text-white shadow-xl'}`}>
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? 'bg-black/40 border-white/10' : 'bg-zinc-50 border-black/[0.03]'}`}>
                        <Search size={14} className="text-zinc-400" />
                        <input type="text" placeholder="Search inquiries..." className="bg-transparent text-[13px] outline-none w-full" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-20">
                    {tickets.map(ticket => (
                        <div key={ticket.id} onClick={() => handleSelectTicket(ticket)} className={`p-6 rounded-[32px] cursor-pointer border transition-all ${selectedTicket?.id === ticket.id ? (isDark ? 'bg-white/10 border-white/10' : 'bg-white border-black/[0.05] shadow-sm') : 'border-transparent opacity-60 hover:opacity-100'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">REF: {ticket.id.slice(0,6).toUpperCase()}</span>
                                <span className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                            </div>
                            <h3 className="text-[15px] font-medium leading-tight">{ticket.subject}</h3>
                        </div>
                    ))}
                </div>
            </aside>

            {/* CHAT INTERFACE - Mobilde FULL SCREEN ve ALT BARI KAPATIR */}
            <main className={`${selectedTicket || isCreatingNew ? 'fixed inset-0 z-[110] lg:relative lg:z-0 lg:flex' : 'hidden lg:flex'} flex-1 flex-col h-full ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
                <AnimatePresence mode="wait">
                    {selectedTicket ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                            {/* Chat Header */}
                            <div className={`px-6 lg:px-10 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-black/[0.02]'}`}>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedTicket(null)} className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-full transition-colors">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <div>
                                        <h2 className="text-[15px] font-medium tracking-tight truncate max-w-[200px] lg:max-w-none">{selectedTicket.subject}</h2>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Engineering Node Active</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2.5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors"><Download size={18}/></button>
                                    <button className="p-2.5 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8 pb-32 custom-scrollbar">
                                {/* Inquiry */}
                                <div className="flex flex-col items-end">
                                    <div className={`max-w-[85%] lg:max-w-[70%] p-6 rounded-[32px] rounded-tr-none shadow-sm text-[14px] leading-relaxed ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                        {selectedTicket.message}
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-400 uppercase mt-2 mr-2">{formatDate(selectedTicket.created_at)}</span>
                                </div>

                                {replies.map(reply => {
                                    const isAdmin = reply.sender_type === 'admin';
                                    return (
                                        <div key={reply.id} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}>
                                            <div className={`max-w-[85%] lg:max-w-[70%] p-6 rounded-[32px] shadow-sm text-[14px] leading-relaxed
                                                ${isAdmin 
                                                    ? (isDark ? 'bg-zinc-900 border border-white/5 text-zinc-200 rounded-tl-none' : 'bg-zinc-100 text-black rounded-tl-none')
                                                    : (isDark ? 'bg-white text-black rounded-tr-none' : 'bg-black text-white rounded-tr-none')
                                                }`}>
                                                {reply.message}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 px-2">
                                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isAdmin ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                                    {isAdmin ? 'Novatrum Support' : 'You'}
                                                </span>
                                                <span className="text-[9px] text-zinc-300 uppercase">{formatDate(reply.created_at)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Input Area - Taskbar SAFE ZONE */}
                            <div className="p-6 lg:p-10 pb-[max(1.5rem,env(safe-area-inset-bottom)+1rem)] bg-gradient-to-t from-white dark:from-[#0A0A0A] via-white/80 dark:via-[#0A0A0A]/80 to-transparent">
                                <form onSubmit={sendReply} className={`flex items-center gap-3 p-2 lg:p-3 rounded-[32px] border shadow-2xl backdrop-blur-xl transition-all ${isDark ? 'bg-zinc-900/90 border-white/10' : 'bg-white/90 border-black/[0.05]'}`}>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3.5 text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                                        <Paperclip size={20} />
                                    </button>
                                    <input 
                                        type="text" value={replyMessage} onChange={e => setReplyMessage(e.target.value)}
                                        placeholder="Type your response..." 
                                        className="flex-1 bg-transparent px-2 text-[15px] outline-none"
                                    />
                                    <button type="submit" disabled={!replyMessage.trim() || sending} className={`p-3.5 rounded-full transition-all active:scale-95 ${!replyMessage.trim() ? 'opacity-20' : (isDark ? 'bg-white text-black' : 'bg-black text-white')}`}>
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    ) : isCreatingNew ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col p-8 lg:p-12 overflow-y-auto">
                            <div className="max-w-2xl mx-auto w-full">
                                <button onClick={() => setIsCreatingNew(false)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white mb-10">
                                    <ChevronLeft size={14}/> Back to inquiries
                                </button>
                                <h2 className="text-4xl font-light tracking-tighter mb-10">New Inquiry</h2>
                                <form onSubmit={createTicket} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Subject</label>
                                        <input required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className={`w-full p-5 rounded-3xl border outline-none ${isDark ? 'bg-zinc-900 border-white/5 focus:border-white/20' : 'bg-zinc-50 border-black/[0.03] focus:border-black/10'}`} placeholder="Infrastructure Query..." />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Message</label>
                                        <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className={`w-full p-5 rounded-3xl border outline-none h-40 resize-none ${isDark ? 'bg-zinc-900 border-white/5 focus:border-white/20' : 'bg-zinc-50 border-black/[0.03] focus:border-black/10'}`} placeholder="Describe technical requirements..." />
                                    </div>
                                    <button type="submit" disabled={sending} className={`w-full py-5 rounded-3xl text-[10px] font-bold uppercase tracking-widest shadow-2xl transition-all ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                                        Initialize Ticket
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-white/5' : 'bg-zinc-50'}`}>
                                <MessageSquare size={32} className="text-zinc-300" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-medium tracking-tight mb-2">Select an Inquiry</h3>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 max-w-xs">Authorized technical nodes will appear here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* TOAST Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 px-6 py-3 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-2xl z-[200]">
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? '#333' : '#eee'}; border-radius: 10px; }
            `}</style>
        </div>
    );
}