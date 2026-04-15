"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, Terminal, Activity, Box, Trash2, Download, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function NeuralHubPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [localInput, setLocalInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialSync, setIsInitialSync] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const quickActions = [
        { label: "Status Report", prompt: "Give me a brief architectural summary of my project's status.", icon: <Box size={14}/> },
        { label: "Infrastructure", prompt: "Report on the infrastructure health and Sentinel status.", icon: <Activity size={14}/> }
    ];

    // 1. SYNC MEMORY
    useEffect(() => {
        async function loadHistory() {
            try {
                const res = await fetch('/api/chat');
                if (!res.ok) throw new Error('Failed to fetch history');
                
                const data = await res.json();
                if (data && data.length > 0) {
                    setMessages(data);
                }
            } catch (err) {
                console.error("Neural Node Sync Error:", err);
            } finally {
                setIsInitialSync(false);
            }
        }
        loadHistory();
    }, []);

    // 2. AUTO SCROLL
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: isInitialSync ? 'auto' : 'smooth' });
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;
        
        const userMsg: Message = { role: 'user', content: content.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setLocalInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updatedMessages }),
            });
            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantContent = "";
            
            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    assistantContent += decoder.decode(value, { stream: true });
                    setMessages(prev => {
                        const last = [...prev];
                        last[last.length - 1].content = assistantContent;
                        return last;
                    });
                }
            }
        } catch (err) { 
            console.error(err);
        } finally { 
            setIsLoading(false); 
        }
    };

    // MEMORY CLEAR FUNCTION
    const handleClearMemory = async () => {
        setIsDeleteModalOpen(false);
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat', { method: 'DELETE' });
            if (res.ok) {
                setMessages([]);
            }
        } catch (err) {
            console.error("Memory Wipe Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // PDF DOWNLOAD FUNCTION
    const handleDownloadPDF = () => {
        if (messages.length === 0) return;

        const chatHtml = messages.map(m => `
            <div style="margin-bottom: 24px; text-align: ${m.role === 'user' ? 'right' : 'left'};">
                <div style="display: inline-block; max-width: 80%; padding: 16px 20px; border-radius: 16px; background-color: ${m.role === 'user' ? '#000' : '#f4f4f5'}; color: ${m.role === 'user' ? '#fff' : '#000'}; text-align: left; font-family: -apple-system, sans-serif; font-size: 14px; line-height: 1.6;">
                    <strong style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; display: block; margin-bottom: 8px;">
                        ${m.role === 'user' ? 'Client Request' : 'Neural AI'}
                    </strong>
                    ${m.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')}
                </div>
            </div>
        `).join('');

        const htmlContent = `
            <html>
            <head><title>Novatrum - Classified Neural Log</title></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #18181b; max-width: 800px; margin: 0 auto; background: #fff;">
                <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7;">
                    <h1 style="font-size: 20px; letter-spacing: -0.05em; margin: 0; font-weight: 700; text-transform: uppercase;">Novatrum Engineering</h1>
                    <p style="color: #71717a; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px; font-weight: 600;">Classified Neural Session Log — ${new Date().toLocaleString()}</p>
                </div>
                ${chatHtml}
            </body>
            </html>
        `;

        const printWin = window.open('', '', 'width=800,height=800');
        if (printWin) {
            printWin.document.write(htmlContent);
            printWin.document.close();
            printWin.focus();
            setTimeout(() => {
                printWin.print();
                printWin.close();
            }, 250);
        }
    };

    if (isInitialSync) return <div className="h-full w-full flex items-center justify-center bg-white dark:bg-[#0A0A0A] text-[10px] font-bold tracking-[0.5em] text-zinc-400 animate-pulse uppercase">Neural Core Syncing...</div>;
    
    const showLanding = messages.length === 0;

    return (
        <div className="fixed inset-0 z-[110] lg:left-20 flex flex-col overflow-hidden bg-white dark:bg-[#0A0A0A] font-sans selection:bg-[#3390FF] selection:text-white">
            
            {/* DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-white/60 dark:bg-black/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden flex flex-col">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 mx-auto flex items-center justify-center mb-4">
                                    <Trash2 size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Wipe Neural Memory?</h3>
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">This action cannot be undone. It will permanently delete this conversation log.</p>
                            </div>
                            <div className="flex border-t border-zinc-100 dark:border-white/5">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-r border-zinc-100 dark:border-white/5">Cancel</button>
                                <button onClick={handleClearMemory} className="flex-1 py-4 text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Wipe</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MOBILE EXIT BUTTON */}
            <Link href="/client/dashboard" className="absolute top-[max(1.2rem,env(safe-area-inset-top))] left-4 z-40 lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-black border border-black/5 dark:border-white/5 shadow-sm text-zinc-500 hover:text-black dark:hover:text-white transition-all">
                <ChevronLeft size={18} />
            </Link>

            {/* DYNAMIC TOP ISLAND (NEURAL AI + ACTIONS) */}
            <div className="absolute top-[max(1.2rem,env(safe-area-inset-top))] lg:top-6 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
                <header className="px-5 py-2.5 rounded-full border border-black/[0.03] dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm flex items-center gap-4 lg:gap-5 pointer-events-auto transition-all">
                    <div className="flex items-center gap-2 lg:gap-3">
                        <Cpu className="text-black dark:text-white" size={14} />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Neural AI</span>
                    </div>
                    
                    <AnimatePresence>
                        {messages.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4 lg:gap-5">
                                <div className="h-3 w-px bg-black/10 dark:bg-white/10" />
                                <div className="flex items-center gap-1.5">
                                    <button 
                                        onClick={handleDownloadPDF} 
                                        className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all"
                                        title="Download Log"
                                    >
                                        <Download size={13} />
                                    </button>
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(true)} 
                                        className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-all"
                                        title="Wipe Memory"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>
            </div>

            {/* MESSAGES AREA */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-12 pt-28 lg:pt-32 pb-4 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence>
                        {showLanding && (
                            <motion.div 
                                initial={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0, overflow: 'hidden' }}
                                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                                className="py-10 lg:py-16 text-center"
                            >
                                 <h2 className="text-3xl lg:text-4xl font-light tracking-tighter mb-6 italic text-zinc-300 dark:text-zinc-800">Architectural Hub</h2>
                                 <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-3">
                                    {quickActions.map((action, i) => (
                                        <button key={i} onClick={() => handleSendMessage(action.prompt)}
                                            className="px-6 py-3 rounded-2xl border border-black/[0.03] bg-white text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:border-black/10 transition-all shadow-sm flex items-center justify-center gap-3">
                                            {action.icon} {action.label}
                                        </button>
                                    ))}
                                 </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-6 lg:space-y-10 pt-4">
                        {messages.map((m, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] lg:max-w-[80%] p-5 lg:p-6 rounded-[28px] lg:rounded-[32px] text-[13px] lg:text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap
                                    ${m.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-zinc-50 dark:bg-zinc-900 border border-black/[0.01] text-black dark:text-zinc-100 rounded-tl-none font-medium'}`}>
                                    <div className="markdown-content"><ReactMarkdown>{m.content}</ReactMarkdown></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {isLoading && (
                        <div className="flex justify-start mt-6 lg:mt-8 pl-4">
                            <div className="flex gap-1.5 opacity-40">
                                <span className="w-1 h-1 bg-black dark:bg-white rounded-full animate-bounce" />
                                <span className="w-1 h-1 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1 h-1 bg-black dark:bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* INPUT AREA */}
            <div className="shrink-0 px-4 lg:px-10 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-white dark:from-[#0A0A0A] via-white/95 dark:via-[#0A0A0A]/95 to-transparent relative z-20">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(localInput); }} className="relative flex items-center group">
                        <input
                            value={localInput}
                            onChange={(e) => setLocalInput(e.target.value)}
                            placeholder="Consult with Neural AI..."
                            className="w-full py-4 lg:py-4.5 pl-12 lg:pl-14 pr-12 lg:pr-14 rounded-full border border-black/[0.08] dark:border-white/10 bg-white dark:bg-[#0F0F0F] focus:outline-none focus:border-black dark:focus:border-white transition-all text-xs lg:text-sm shadow-2xl text-black dark:text-white"
                        />
                        <div className="absolute left-4 lg:left-5 text-zinc-300 group-focus-within:text-black transition-colors"><Terminal size={16} strokeWidth={2} /></div>
                        <button type="submit" disabled={isLoading || !localInput.trim()} className={`absolute right-2 lg:right-2.5 w-9 h-9 lg:w-10 lg:h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center transition-all ${(!localInput.trim() || isLoading) ? 'opacity-0 scale-75' : 'opacity-100 scale-100 hover:scale-105'}`}>
                            <Send size={14} />
                        </button>
                    </form>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
                .markdown-content p { margin-bottom: 0.5rem; line-height: 1.6; }
                .markdown-content strong { font-weight: 800; color: inherit; }
            `}</style>
        </div>
    );
}