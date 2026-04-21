"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, Activity, Box, Trash2, Download, ChevronLeft, Paperclip, X, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

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
    const textareaRef = useRef<HTMLTextAreaElement>(null); // YENİ: Textarea referansı
    
    const [clientPlan, setClientPlan] = useState<string>('checking'); 
    const [monthlyLimit, setMonthlyLimit] = useState<number>(0);
    const [tokensUsed, setTokensUsed] = useState<number>(0);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const quickActions = [
        { label: "Status Report", prompt: "Give me a brief architectural summary of my project's status.", icon: <Box size={14}/> },
        { label: "Infrastructure", prompt: "Report on the infrastructure health and Sentinel status.", icon: <Activity size={14}/> }
    ];

    // FONKSİYONU DIŞARI ÇIKARDIK Kİ HER YERDEN ÇAĞRILABİLSİN
    const syncClientStatus = async () => {
        const clientId = localStorage.getItem('novatrum_client_id');
        if (!clientId) {
            setClientPlan('none');
            return;
        }
        
        const { data: clientData, error: dbError } = await supabase
            .from('clients')
            .select('subscription_plan, monthly_limit, tokens_used')
            .eq('id', clientId)
            .single();
            
        if (dbError) {
            setClientPlan('none');
        } else if (clientData) {
            setClientPlan(clientData.subscription_plan || 'none');
            setMonthlyLimit(clientData.monthly_limit || 0);
            setTokensUsed(clientData.tokens_used || 0);
        }
    };

    useEffect(() => {
        async function loadData() {
            try {
                await syncClientStatus();
                const res = await fetch('/api/chat');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) setMessages(data);
                }
            } catch (err) {
                setClientPlan('none'); 
            } finally {
                setIsInitialSync(false);
            }
        }
        
        loadData();

        // 5 SANİYEDE BİR ARKAPLAN KONTROLÜ
        const interval = setInterval(() => { syncClientStatus(); }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: isInitialSync ? 'auto' : 'smooth' });
        }
    }, [messages, isLoading]);

    // TEXTAREA İÇİN DİNAMİK YÜKSEKLİK VE SHIFT+ENTER MANTIĞI
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalInput(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Sadece Enter ise yeni satıra geçmeyi engelle
            handleSendMessage(localInput); // Mesajı gönder
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        if (fileInputRef.current) fileInputRef.current.value = ''; 
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return;

        if (tokensUsed >= monthlyLimit && monthlyLimit > 0) {
            setMessages(prev => [
                ...prev, 
                { role: 'user', content: content.trim() },
                { role: 'assistant', content: "⚠️ **SYSTEM ALERT: Maximum Neural Token Allocation Reached.**\n\nYour current infrastructure node has depleted its computational token allowance. Please reach out to upgrade your SaaS allocation to continue utilizing the Neural Core." }
            ]);
            setLocalInput('');
            if (textareaRef.current) textareaRef.current.style.height = 'auto';
            setSelectedFiles([]); 
            return;
        }

        const userMsg: Message = { role: 'user', content: content.trim() };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setLocalInput('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto'; // Gönderince yüksekliği sıfırla
        setSelectedFiles([]); 
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updatedMessages }),
            });

            if (!response.ok) throw new Error("API failed");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantContent = "";

            setMessages(prev => [...prev, { role: 'assistant', content: "" }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // YAPAY ZEKA CEVABI BİTİRDİĞİ AN TOKEN'I GÜNCELLE
                        syncClientStatus();
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
            setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ **SYSTEM ERROR:** Neural link failure. Please check your connection." }]);
        } finally { 
            setIsLoading(false);
        }
    };

    const handleClearMemory = async () => {
        setIsDeleteModalOpen(false);
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat', { method: 'DELETE' });
            if (res.ok) setMessages([]);
        } finally {
            setIsLoading(false);
        }
    };

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

        const htmlContent = `<html><head><title>Novatrum - Classified Neural Log</title></head><body style="font-family: sans-serif; padding: 40px; color: #18181b; max-width: 800px; margin: 0 auto;">${chatHtml}</body></html>`;

        const printWin = window.open('', '', 'width=800,height=800');
        if (printWin) {
            printWin.document.write(htmlContent);
            printWin.document.close();
            printWin.focus();
            setTimeout(() => { printWin.print(); printWin.close(); }, 250);
        }
    };

    if (isInitialSync) return <div className="h-full w-full flex items-center justify-center bg-white dark:bg-[#0A0A0A] text-[10px] font-bold tracking-[0.5em] text-zinc-400 animate-pulse uppercase">Neural Core Syncing...</div>;

    const showLanding = messages.length === 0;

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 z-[999] lg:left-20 flex flex-col bg-white dark:bg-[#0A0A0A] font-sans selection:bg-[#3390FF] selection:text-white overflow-hidden">
            
            <AnimatePresence>
                {clientPlan === 'none' && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(16px)" }}
                        className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 font-sans"
                    >
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-3xl flex items-center justify-center mb-6 border border-red-100 dark:border-red-900/20 shadow-2xl">
                            <Lock size={32} className="text-red-500" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-3xl font-light tracking-tight text-black dark:text-white mb-3">Neural Core Locked</h2>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-md text-center mb-8 px-6 leading-relaxed">
                            Your current SaaS allocation does not include access to the Neural AI Engine. Upgrade your infrastructure node to activate this computational module.
                        </p>
                        
                        <a href="mailto:info@novatrum.eu?subject=Upgrade Request: Neural Core Architecture" className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
                            Request Architecture Upgrade
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-white/60 dark:bg-black/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="bg-white dark:bg-[#111] border border-zinc-200 dark:border-white/10 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden flex flex-col">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 mx-auto flex items-center justify-center mb-4"><Trash2 size={24} /></div>
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

            <div className="absolute top-[max(1.2rem,env(safe-area-inset-top))] lg:top-6 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
                <header className="px-5 py-2.5 rounded-full border border-black/[0.03] dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm flex items-center gap-4 lg:gap-5 pointer-events-auto transition-all">
                    
                    <Link href="/client/dashboard" className="lg:hidden flex items-center justify-center text-zinc-400 hover:text-black dark:hover:text-white transition-all mr-1">
                        <ChevronLeft size={16} />
                    </Link>

                    <div className="flex items-center gap-2 lg:gap-3">
                        <Cpu className="text-black dark:text-white" size={14} />
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Neural AI</span>
                    </div>
                    
                    <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                    
                    <div className="flex items-center gap-2" title="Available Neural Tokens">
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${tokensUsed >= monthlyLimit ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <div className="flex flex-col">
                            <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-zinc-400 leading-tight">Tokens</span>
                            <span className={`text-[9px] font-mono font-bold leading-tight ${tokensUsed >= monthlyLimit ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                {tokensUsed} / {monthlyLimit}
                            </span>
                        </div>
                    </div>

                    <AnimatePresence>
                        {messages.length > 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4 lg:gap-5">
                                <div className="h-4 w-px bg-black/10 dark:bg-white/10" />
                                <div className="flex items-center gap-1.5">
                                    <button onClick={handleDownloadPDF} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all"><Download size={13} /></button>
                                    <button onClick={() => setIsDeleteModalOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-all"><Trash2 size={13} /></button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </header>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-12 pt-28 lg:pt-32 pb-4 custom-scrollbar">
                <div className="max-w-3xl mx-auto">
                    <AnimatePresence>
                        {showLanding && (
                            <motion.div initial={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0, overflow: 'hidden' }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }} className="py-10 lg:py-16 text-center">
                                 <h2 className="text-3xl lg:text-4xl font-light tracking-tighter mb-6 italic text-zinc-300 dark:text-zinc-800">Architectural Hub</h2>
                                 <div className="flex flex-col lg:flex-row flex-wrap justify-center gap-3">
                                    {quickActions.map((action, i) => (
                                        <button key={i} onClick={() => handleSendMessage(action.prompt)} className="px-6 py-3 rounded-2xl border border-black/[0.03] bg-white text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black hover:border-black/10 transition-all shadow-sm flex items-center justify-center gap-3">
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
                                <div className={`max-w-[90%] lg:max-w-[80%] p-5 lg:p-6 rounded-[28px] lg:rounded-[32px] text-[13px] lg:text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-zinc-50 dark:bg-zinc-900 border border-black/[0.01] text-black dark:text-zinc-100 rounded-tl-none font-medium'}`}>
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

            {clientPlan !== 'none' && (
                <div className="shrink-0 w-full px-4 lg:px-10 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] bg-white dark:bg-[#0A0A0A] relative z-20">
                    <div className="max-w-3xl mx-auto">
                        
                        <AnimatePresence>
                            {selectedFiles.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-wrap gap-2 mb-3 px-2">
                                    {selectedFiles.map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-[12px] shadow-sm">
                                            <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 truncate max-w-[150px]">{f.name}</span>
                                            <button type="button" onClick={() => removeFile(i)} className="text-zinc-400 hover:text-red-500 transition-colors"><X size={12} strokeWidth={2.5}/></button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(localInput); }} className="relative flex items-end group">
                            
                            {/* DÜZELTME: AKILLI TEXTAREA KULLANILDI */}
                            <textarea 
                                ref={textareaRef}
                                value={localInput} 
                                onChange={handleInput}
                                onKeyDown={handleKeyDown}
                                rows={1}
                                placeholder="Consult with Neural AI..." 
                                className="w-full py-[18px] lg:py-5 pl-14 pr-12 lg:pr-14 rounded-[28px] border border-black/[0.08] dark:border-white/10 bg-zinc-50/50 dark:bg-[#0F0F0F] focus:outline-none focus:border-black dark:focus:border-white transition-all text-xs lg:text-sm shadow-inner text-black dark:text-white resize-none overflow-y-auto custom-scrollbar leading-relaxed"
                                style={{ minHeight: '56px', maxHeight: '160px' }}
                            />
                            
                            <div className="absolute left-4 lg:left-5 bottom-[19px] lg:bottom-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors flex items-center">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="hover:text-black dark:hover:text-white transition-colors" title="Attach Files"><Paperclip size={18} strokeWidth={2} /></button>
                                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                            </div>

                            <button type="submit" disabled={isLoading || (!localInput.trim() && selectedFiles.length === 0)} className={`absolute right-2 lg:right-2.5 bottom-2 lg:bottom-2.5 w-9 h-9 lg:w-10 lg:h-10 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center transition-all ${(!localInput.trim() && selectedFiles.length === 0 || isLoading) ? 'opacity-0 scale-75' : 'opacity-100 scale-100 hover:scale-105'}`}>
                                <Send size={14} className="ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
                .markdown-content p { margin-bottom: 0.5rem; line-height: 1.6; }
                .markdown-content strong { font-weight: 800; color: inherit; }
            `}</style>
        </div>
    );
}