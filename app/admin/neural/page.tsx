"use client";

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, Trash2, ChevronLeft, Plus, MessageSquare, Menu, Activity, BrainCircuit, X, Paperclip, Home, Target } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

interface Message { role: 'user' | 'assistant'; content: string; }
interface ChatSession { id: string; title: string; created_at: string; }

function AdminNeuralContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const entityId = searchParams.get('entity');

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [targetClientName, setTargetClientName] = useState<string | null>(null);
    
    const [localInput, setLocalInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (entityId) {
            supabase.from('clients').select('full_name, company_name').eq('id', entityId).single()
                .then(({ data }) => setTargetClientName(data?.company_name || data?.full_name || 'Loading...'));
        } else {
            setTargetClientName(null);
        }
    }, [entityId]);

    useEffect(() => { fetchSessions(); }, []);

    const fetchSessions = async () => {
        const { data } = await supabase.from('admin_chat_sessions').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
            setSessions(data);
            if (!activeSessionId) loadSession(data[0].id); 
        } else {
            handleNewChat(); 
        }
    };

    const loadSession = async (sessionId: string) => {
        setActiveSessionId(sessionId);
        setMessages([]); 
        const { data } = await supabase.from('admin_chat_messages').select('role, content').eq('session_id', sessionId).order('created_at', { ascending: true });
        if (data) setMessages(data as Message[]);

        if (entityId && data && data.length === 0) {
            setLocalInput(`Analyze client profile: ${entityId}. Focus on monthly maintenance and total SaaS balance.`);
            router.replace('/admin/neural');
        }
    };

    const handleNewChat = async () => {
        const defaultTitle = entityId ? `Audit: ${entityId.split('-')[0]}` : `New Analysis`;
        const { data } = await supabase.from('admin_chat_sessions').insert([{ title: defaultTitle }]).select().single();
        if (data) {
            setSessions(prev => [data, ...prev]);
            setActiveSessionId(data.id);
            setMessages([]);
            if (window.innerWidth < 1024) setIsSidebarOpen(false); 
        }
    };

    const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        await supabase.from('admin_chat_sessions').delete().eq('id', sessionId);
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        if (activeSessionId === sessionId) {
            setMessages([]);
            setActiveSessionId(null);
            if (sessions.length > 1) loadSession(sessions.find(s => s.id !== sessionId)!.id);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // YENİ: DOSYA OKUYUCU FONKSİYON (Metin tabanlı dosyaların içini okur)
    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => resolve(`[Error reading file: ${file.name}]`);
            reader.readAsText(file);
        });
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim() && selectedFiles.length === 0 || isLoading || !activeSessionId) return;
        
        let finalContent = content.trim();

        // EĞER DOSYA VARSA İÇERİKLERİNİ MESAJIN SONUNA EKLE
        if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
                const fileText = await readFileAsText(file);
                finalContent += `\n\n--- [FILE CONTENT: ${file.name}] ---\n${fileText.substring(0, 15000)}\n--- [END OF FILE] ---`;
            }
        }

        const userMsg: Message = { role: 'user', content: finalContent };
        // Ekranda sadece kullanıcının yazdığı metni göster, dosyanın tüm ham kodunu ekrana basıp kirletme
        setMessages(prev => [...prev, { role: 'user', content: content.trim() || `[Attached ${selectedFiles.length} file(s)]` }]);
        
        setLocalInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setSelectedFiles([]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/admin/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...messages, userMsg], sessionId: activeSessionId }),
            });
            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantContent = "";
            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // YAPAY ZEKA CEVABI BİTİRDİĞİNDE SOHBET İSİMLERİNİ YENİLE (Auto-Title için)
                        fetchSessions();
                        break;
                    }
                    assistantContent += decoder.decode(value, { stream: true });
                    setMessages(prev => {
                        const last = [...prev];
                        last[last.length - 1].content = assistantContent;
                        return last;
                    });
                }
            }
        } catch (err) { 
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ **SYSTEM ERROR:** Oracle link failure." }]);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-[999] lg:left-20 flex bg-white font-sans selection:bg-emerald-500 selection:text-white overflow-hidden">
            
            {/* SOL MENÜ - BEYAZ TEMA */}
            <div className={`absolute lg:static top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-zinc-100 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-5 border-b border-zinc-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BrainCircuit size={18} className="text-black" />
                        <span className="text-xs font-bold uppercase tracking-widest text-black">Neural AI</span>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-400 hover:text-black p-1"><X size={16}/></button>
                </div>
                
                <div className="p-4 space-y-2">
                    <Link href="/admin/dashboard" className="w-full bg-zinc-50 border border-zinc-100 text-zinc-600 hover:bg-zinc-100 transition-all py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        <Home size={14} /> Back Home
                    </Link>
                    <button onClick={handleNewChat} className="w-full bg-black text-white hover:bg-zinc-800 transition-all py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-lg">
                        <Plus size={14} /> New Session
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 custom-scrollbar">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 ml-2 mb-2 block mt-2">Recent Logs</span>
                    {sessions.map(s => (
                        <div key={s.id} onClick={() => { loadSession(s.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`group cursor-pointer p-3 rounded-xl flex items-center justify-between transition-all ${activeSessionId === s.id ? 'bg-zinc-100 text-black' : 'hover:bg-zinc-50 text-zinc-500'}`}>
                            <div className="flex items-center gap-2 truncate">
                                <MessageSquare size={14} className={activeSessionId === s.id ? 'text-black' : 'text-zinc-300'} />
                                <span className="text-[11px] font-bold truncate pr-2">{s.title}</span>
                            </div>
                            <button onClick={(e) => handleDeleteSession(e, s.id)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ANA ALAN */}
            <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
                
                <div className="absolute top-[max(1.2rem,env(safe-area-inset-top))] left-0 right-0 z-30 px-4 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 bg-white border border-zinc-100 shadow-sm rounded-full flex items-center justify-center text-zinc-600 lg:hidden">
                            <Menu size={16} />
                        </button>
                        
                        <header className="px-5 py-2.5 rounded-full border border-black/[0.03] bg-white/80 backdrop-blur-xl shadow-sm flex items-center gap-3">
                            <Cpu className="text-black" size={14} />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-900">Neural Admin</span>
                            
                            <AnimatePresence>
                                {targetClientName && (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 ml-2">
                                        <Target size={10} />
                                        <span className="text-[9px] font-bold uppercase tracking-widest">{targetClientName}</span>
                                        <button onClick={() => router.replace('/admin/neural')} className="hover:text-emerald-800"><X size={10} strokeWidth={3}/></button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </header>
                    </div>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-12 pt-28 lg:pt-32 pb-4 custom-scrollbar">
                    <div className="max-w-4xl mx-auto">
                        <AnimatePresence>
                            {messages.length === 0 && !isLoading && (
                                <motion.div initial={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="py-16 text-center">
                                    <div className="w-16 h-16 bg-black text-white rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-xl"><Activity size={28} /></div>
                                    <h2 className="text-3xl font-light tracking-tighter mb-4 text-zinc-800">Operational Audit Core</h2>
                                    <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">Neural AI is synced with the financial node. Ask about revenue, debt, or client status.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-8 pt-4">
                            {messages.map((m, idx) => (
                                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[90%] lg:max-w-[85%] p-6 rounded-[32px] text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-tl-none'}`}>
                                        <div className="markdown-content"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {isLoading && (
                            <div className="flex justify-start mt-8 pl-4">
                                <div className="flex gap-1.5 opacity-40">
                                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0 w-full px-4 lg:px-10 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white border-t border-zinc-100 relative z-20">
                    <div className="max-w-4xl mx-auto relative flex flex-col justify-end">
                        
                        <AnimatePresence>
                            {selectedFiles.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-wrap gap-2 mb-3 px-2">
                                    {selectedFiles.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-[12px] shadow-sm">
                                            <span className="text-[10px] font-bold text-zinc-600 truncate max-w-[150px]">{f.name}</span>
                                            <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-zinc-400 hover:text-red-500 transition-colors"><X size={12} strokeWidth={2.5}/></button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="relative flex items-end group w-full">
                            <textarea 
                                ref={textareaRef}
                                value={localInput} 
                                onChange={(e) => {
                                    setLocalInput(e.target.value);
                                    if (textareaRef.current) {
                                        textareaRef.current.style.height = 'auto';
                                        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                                    }
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(localInput); } }}
                                rows={1}
                                placeholder="Instruct Neural AI (Shift + Enter for new line)..." 
                                className="w-full py-[18px] pl-14 pr-14 rounded-[28px] border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-black transition-all text-sm shadow-inner text-zinc-900 resize-none overflow-y-auto custom-scrollbar leading-relaxed"
                                style={{ minHeight: '56px', maxHeight: '200px' }}
                                disabled={!activeSessionId}
                            />
                            
                            <div className="absolute left-4 bottom-[19px] text-zinc-400 group-focus-within:text-black transition-colors flex items-center">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-black transition-colors" title="Attach Files"><Paperclip size={18} strokeWidth={2} /></button>
                                {/* Sadece metin tabanlı belgeler okunabilir */}
                                <input type="file" multiple accept=".txt,.csv,.json,.md,.js,.ts,.tsx,.html,.css" className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} disabled={!activeSessionId}/>
                            </div>

                            <button onClick={() => handleSendMessage(localInput)} disabled={isLoading || (!localInput.trim() && selectedFiles.length === 0) || !activeSessionId} className={`absolute right-2 bottom-2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center transition-all ${(!localInput.trim() && selectedFiles.length === 0 || isLoading) ? 'opacity-0 scale-75' : 'opacity-100 scale-100 hover:scale-105 shadow-md shadow-black/30'}`}>
                                <Send size={14} className="ml-0.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
                .markdown-content p { margin-bottom: 0.75rem; line-height: 1.7; }
                .markdown-content strong { font-weight: 800; color: inherit; }
                .markdown-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1rem; }
                .markdown-content li { margin-bottom: 0.5rem; }
            `}</style>
        </div>
    );
}

export default function AdminNeuralPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-xs uppercase font-bold tracking-widest text-zinc-400 animate-pulse">Loading Neural Interface...</div>}>
            <AdminNeuralContent />
        </Suspense>
    );
}