"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Server, Activity, CreditCard, Box, Zap,
    CheckCircle2, Circle, ArrowUpRight, Plus, Mail,
    Terminal, ShieldCheck, BrainCircuit, MessageSquare, BookOpen, Clock
} from 'lucide-react';

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('Good morning.');
    const [newTask, setNewTask] = useState('');
    const [newMemo, setNewMemo] = useState('');

    // GERÇEK VERİTABANI STATE'LERİ (Sıfır Demo Veri)
    const [data, setData] = useState({
        clients: [] as any[],
        invoices: [] as any[],
        projects: [] as any[],
        tickets: [] as any[],
        tasks: [] as any[],
        memos: [] as any[],
        sentEmails: [] as any[],
        systemStatus: [] as any[],
        knowledge: [] as any[],
        mrr: 0,
        totalTokensUsed: 0,
        totalTokenLimit: 0
    });

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning.');
        else if (hour < 18) setGreeting('Good afternoon.');
        else setGreeting('Good evening.');

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Gerçek zamanlı olarak 9 farklı tablodan veri çekiyoruz
            const [
                { data: clients }, { data: invoices }, { data: projects },
                { data: tickets }, { data: tasks }, { data: memos },
                { data: emails }, { data: status }, { data: knowledge }
            ] = await Promise.all([
                supabase.from('clients').select('*').is('archived_at', null),
                supabase.from('invoices').select('*'),
                supabase.from('projects').select('*').is('archived_at', null).order('created_at', { ascending: false }).limit(4),
                supabase.from('support_tickets').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(4),
                supabase.from('admin_tasks').select('*').order('created_at', { ascending: false }),
                supabase.from('quick_notes').select('*').order('created_at', { ascending: false }).limit(3),
                supabase.from('sent_emails').select('*').order('created_at', { ascending: false }).limit(4),
                supabase.from('system_status').select('*').order('label'),
                supabase.from('admin_knowledge').select('*').limit(3)
            ]);

            const activeClients = clients || [];
            const allInvoices = invoices || [];

            // MRR Hesaplama (Ödenmiş faturaların toplamı)
            const calculatedMRR = allInvoices.filter(i => i.status === 'paid').reduce((sum, curr) => sum + Number(curr.amount || 0), 0);

            // API Kota Hesaplama
            const tokensUsed = activeClients.reduce((sum, curr) => sum + Number(curr.used_messages || 0), 0);
            const tokenLimit = activeClients.reduce((sum, curr) => sum + Number(curr.monthly_limit || 0), 0);

            setData({
                clients: activeClients,
                invoices: allInvoices,
                projects: projects || [],
                tickets: tickets || [],
                tasks: tasks || [],
                memos: memos || [],
                sentEmails: emails || [],
                systemStatus: status || [],
                knowledge: knowledge || [],
                mrr: calculatedMRR,
                totalTokensUsed: tokensUsed,
                totalTokenLimit: tokenLimit || 5000 // Fallback
            });

        } catch (error) {
            console.error("Core Sync Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // TASK İŞLEMLERİ
    const toggleTask = async (id: string, currentStatus: boolean) => {
        setData(prev => ({ ...prev, tasks: prev.tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t) }));
        await supabase.from('admin_tasks').update({ is_completed: !currentStatus }).eq('id', id);
    };

    const addTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const { data: inserted } = await supabase.from('admin_tasks').insert({ task: newTask, is_completed: false }).select().single();
        if (inserted) setData(prev => ({ ...prev, tasks: [inserted, ...prev.tasks] }));
        setNewTask('');
    };

    // MEMO İŞLEMLERİ
    const addMemo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemo.trim()) return;
        const { data: inserted } = await supabase.from('quick_notes').insert({ content: newMemo }).select().single();
        if (inserted) setData(prev => ({ ...prev, memos: [inserted, ...prev.memos] }));
        setNewMemo('');
    };

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-zinc-400 animate-pulse">Syncing Core...</div>;

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-700 pb-20 font-sans">

            {/* HEADER */}
            <header className="mb-6 lg:mb-10 px-2 lg:px-0">
                {/* İnce ve Zarif (Light & Tighter) Font Kullanımı */}
                <h1 className="text-3xl md:text-5xl font-light tracking-tighter text-zinc-900 dark:text-white mb-2">
                    {greeting}
                </h1>
                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    SaaS Infrastructure Active • Realtime Nodes Connected
                </p>
            </header>

            {/* BENTO GRID (Responsive Sütun Mimarisi) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">

                {/* WIDGET 1: THE EXECUTIVE HUB (Dark Card) */}
                <div className="md:col-span-12 xl:col-span-4 bg-zinc-900 dark:bg-black p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[250px] lg:min-h-[300px]">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                    <div>
                        <h2 className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4 lg:mb-6">Executive Hub</h2>
                        <div className="flex items-end gap-4 mb-6 lg:mb-8">
                            <span className="text-6xl lg:text-7xl font-light tracking-tighter">{data.clients.length}</span>
                            <span className="text-[10px] lg:text-xs text-zinc-400 font-medium mb-2 lg:mb-3 max-w-[80px] lg:max-w-[100px] leading-tight">Active Client Entities</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <div className="bg-white/10 p-4 lg:p-5 rounded-2xl backdrop-blur-md">
                            <p className="text-2xl lg:text-3xl font-light tracking-tight mb-1">{data.invoices.filter(i => i.status === 'unpaid').length}</p>
                            <p className="text-[8px] lg:text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Unpaid Inv.</p>
                        </div>
                        <div className="bg-white/10 p-4 lg:p-5 rounded-2xl backdrop-blur-md">
                            <p className="text-2xl lg:text-3xl font-light tracking-tight mb-1">{data.clients.filter(c => c.subscription_plan && c.subscription_plan !== 'none').length}</p>
                            <p className="text-[8px] lg:text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Subscribers</p>
                        </div>
                    </div>
                </div>

                {/* WIDGET 2: MRR PROGRESS */}
                <div className="md:col-span-6 xl:col-span-4 bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[250px] lg:min-h-[300px] flex flex-col justify-between text-center group">
                    <div>
                        <h2 className="text-xl lg:text-2xl font-light tracking-tighter text-zinc-900 dark:text-white">Revenue (MRR)</h2>
                        <p className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Based on Paid Invoices</p>
                    </div>
                    <div className="my-4 lg:my-6">
                        <span className="text-4xl lg:text-5xl font-light tracking-tighter text-black dark:text-white">€{data.mrr.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 lg:px-6 py-3 lg:py-4 bg-zinc-50 dark:bg-white/5 rounded-2xl">
                        <div className="text-left">
                            <p className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-zinc-400">Pending</p>
                            <p className="text-xs lg:text-sm font-bold text-amber-500">€{data.invoices.filter(i => i.status === 'unpaid').reduce((s, c) => s + Number(c.amount || 0), 0).toLocaleString()}</p>
                        </div>
                        <CreditCard className="text-zinc-300" strokeWidth={1.5} size={20} />
                    </div>
                </div>

                {/* WIDGET 3: NEURAL QUOTA */}
                <div className="md:col-span-6 xl:col-span-4 bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[250px] lg:min-h-[300px] flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <h2 className="text-xl lg:text-2xl font-light tracking-tighter text-zinc-900 dark:text-white">API Quota</h2>
                        <BrainCircuit className="text-indigo-500" strokeWidth={1.5} size={20} />
                    </div>
                    <p className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-6 lg:mb-8 relative z-10">Global Neural Tokens</p>

                    <div className="flex-1 flex flex-col justify-center relative z-10">
                        <div className="flex justify-between items-end mb-2 lg:mb-3">
                            <span className="text-3xl lg:text-4xl font-light tracking-tighter text-black dark:text-white">{data.totalTokensUsed}</span>
                            <span className="text-[10px] lg:text-xs font-bold text-zinc-400 mb-1">/ {data.totalTokenLimit}</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${Math.min(100, (data.totalTokensUsed / data.totalTokenLimit) * 100)}%` }} />
                        </div>
                        <p className="text-[9px] lg:text-[10px] text-zinc-500 font-medium mt-3 lg:mt-4 uppercase tracking-widest">Network bandwidth is stable.</p>
                    </div>
                    <Terminal className="absolute -bottom-6 -right-6 w-32 h-32 lg:w-48 lg:h-48 text-zinc-50 dark:text-white/[0.02] -z-0" strokeWidth={1} />
                </div>

                {/* WIDGET 4: ACTION ITEMS */}
                <div className="md:col-span-12 xl:col-span-4 bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[300px] lg:min-h-[350px] flex flex-col">
                    <div className="flex justify-between items-center mb-4 lg:mb-6">
                        <h2 className="text-lg lg:text-xl font-light tracking-tighter text-zinc-900 dark:text-white">Action Items</h2>
                        <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest px-2 lg:px-3 py-1 bg-zinc-100 dark:bg-white/10 rounded-full">
                            {data.tasks.filter(t => t.is_completed).length}/{data.tasks.length}
                        </span>
                    </div>
                    <div className="space-y-2 flex-1 overflow-y-auto max-h-[200px] lg:max-h-none custom-scrollbar pr-2">
                        {data.tasks.map(todo => (
                            <div key={todo.id} onClick={() => toggleTask(todo.id, todo.is_completed)} className="flex items-center gap-3 cursor-pointer group p-2 lg:p-3 hover:bg-zinc-50 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-zinc-100 dark:hover:border-white/5">                                {todo.is_completed ? <CheckCircle2 size={16} className="text-black dark:text-white shrink-0" strokeWidth={1.5} /> : <Circle size={16} className="text-zinc-300 group-hover:text-zinc-400 shrink-0" strokeWidth={1.5} />}
                                <span className={`text-xs lg:text-[13px] tracking-tight leading-snug ${todo.is_completed ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>{todo.task}</span>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={addTask} className="mt-4 flex items-center gap-2 border-t border-zinc-100 dark:border-white/5 pt-4">
                        <Plus size={14} className="text-zinc-400 shrink-0" />
                        <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add new task..." className="text-[11px] lg:text-xs bg-transparent outline-none w-full text-zinc-900 dark:text-white placeholder:text-zinc-400" />
                    </form>
                </div>

                {/* WIDGET 5: SUPPORT DESK */}
                <div className="md:col-span-6 xl:col-span-4 bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[300px] lg:min-h-[350px] flex flex-col">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <h2 className="text-lg lg:text-xl font-light tracking-tighter text-zinc-900 dark:text-white">Active Desk</h2>
                        <MessageSquare className="text-zinc-300" strokeWidth={1.5} size={18} />
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[200px] lg:max-h-none custom-scrollbar pr-1">
                        {data.tickets.length === 0 && <p className="text-[11px] lg:text-xs text-zinc-400 font-medium italic">No open tickets. Zero inbox achieved.</p>}
                        {data.tickets.map(ticket => (
                            <div key={ticket.id} className="p-3 lg:p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl group hover:border-black dark:hover:border-white/30 transition-all cursor-pointer">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-zinc-400">REF: {ticket.id.slice(0, 6)}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                </div>
                                <h3 className="text-xs lg:text-[13px] font-medium text-zinc-900 dark:text-white tracking-tight truncate">{ticket.subject}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WIDGET 6: DEPLOYMENTS (Projects) */}
                <div className="md:col-span-6 xl:col-span-4 bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[300px] lg:min-h-[350px] flex flex-col">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <h2 className="text-lg lg:text-xl font-light tracking-tighter text-zinc-900 dark:text-white">Deployments</h2>
                        <Box className="text-zinc-300" strokeWidth={1.5} size={18} />
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[200px] lg:max-h-none custom-scrollbar pr-1">
                        {data.projects.map(project => (
                            <div key={project.id} className="flex items-center justify-between p-3 lg:p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl">
                                <div>
                                    <h3 className="text-xs lg:text-[13px] font-medium text-zinc-900 dark:text-white tracking-tight">{project.name}</h3>
                                    <p className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{project.status}</p>
                                </div>
                                <div className="text-[10px] lg:text-xs font-bold font-mono bg-white dark:bg-black border border-zinc-200 dark:border-white/10 px-2 py-1 rounded-lg">
                                    {project.progress_percent}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WIDGET 7: OUTREACH LOG */}
                <div className="md:col-span-12 xl:col-span-4 bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[250px] lg:min-h-[300px] flex flex-col">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <h2 className="text-lg lg:text-xl font-light tracking-tighter text-zinc-900 dark:text-white">Outreach Log</h2>
                        <Mail className="text-zinc-300" strokeWidth={1.5} size={18} />
                    </div>
                    <div className="space-y-2 lg:space-y-3 flex-1 overflow-y-auto max-h-[200px] lg:max-h-none custom-scrollbar pr-1">
                        {data.sentEmails.length === 0 && <p className="text-[11px] lg:text-xs text-zinc-400 font-medium italic">No recent transmissions.</p>}
                        {data.sentEmails.map(email => (
                            <div key={email.id} className="p-3 lg:p-4 border-b border-zinc-100 dark:border-white/5 last:border-0">
                                <h3 className="text-xs lg:text-[13px] font-medium text-zinc-900 dark:text-white tracking-tight truncate">{email.subject}</h3>
                                <p className="text-[9px] lg:text-[10px] font-mono text-zinc-400 mt-1 truncate">{email.to_emails}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WIDGET 8: MEMO PAD */}
                <div className="md:col-span-6 xl:col-span-4 bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[250px] lg:min-h-[300px] flex flex-col">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <h2 className="text-lg lg:text-xl font-light tracking-tighter text-zinc-900 dark:text-white">Memo Pad</h2>
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[150px] lg:max-h-none custom-scrollbar pr-1">
                        {data.memos.map(memo => (
                            <div key={memo.id} className="p-3 lg:p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                                <p className="text-[11px] lg:text-[12px] text-zinc-800 dark:text-zinc-300 leading-relaxed tracking-tight">{memo.content}</p>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={addMemo} className="mt-4 flex items-center gap-2">
                        <input type="text" value={newMemo} onChange={e => setNewMemo(e.target.value)} placeholder="Scribble a note..." className="flex-1 text-[10px] lg:text-xs bg-zinc-50 dark:bg-white/5 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl outline-none border border-zinc-200 dark:border-white/10" />
                    </form>
                </div>

                {/* WIDGET 9: SYSTEM CORE */}
                <div className="md:col-span-6 xl:col-span-4 bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm min-h-[250px] lg:min-h-[300px] flex flex-col">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                        <h2 className="text-lg lg:text-xl font-light tracking-tighter text-zinc-900 dark:text-white">Core Status</h2>
                        <Server className="text-zinc-300" strokeWidth={1.5} size={18} />
                    </div>
                    <div className="space-y-2 lg:space-y-3 flex-1 overflow-y-auto max-h-[200px] lg:max-h-none custom-scrollbar pr-1">
                        {data.systemStatus.slice(0, 5).map((sys, i) => (
                            <div key={i} className="flex items-center justify-between p-3 lg:p-4 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 rounded-2xl">
                                <span className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400">{sys.label}</span>
                                <span className={`text-[7px] lg:text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${sys.status === 'operational' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600'}`}>
                                    {sys.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WIDGET 10: ADMIN KNOWLEDGE BASE */}
                <div className="md:col-span-12 xl:col-span-8 bg-zinc-900 p-6 lg:p-8 rounded-[28px] lg:rounded-[32px] text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-indigo-500 to-rose-500 opacity-50" />
                    <div className="flex items-center gap-3 mb-4 lg:mb-6 relative z-10">
                        <BookOpen size={18} strokeWidth={1.5} className="text-zinc-400" />
                        <h2 className="text-xl lg:text-2xl font-light tracking-tighter">Knowledge Base</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 relative z-10 flex-1">
                        {data.knowledge.map(k => (
                            <div key={k.id} className="p-4 lg:p-5 bg-white/10 border border-white/10 rounded-2xl backdrop-blur-md">
                                <span className="text-[8px] lg:text-[9px] font-bold uppercase tracking-widest text-emerald-400 mb-2 block">{k.category}</span>
                                <h3 className="font-medium text-[13px] lg:text-sm tracking-tight mb-1.5 lg:mb-2 truncate">{k.topic}</h3>
                                <p className="text-[10px] lg:text-[11px] text-zinc-400 leading-relaxed line-clamp-3">{k.content}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WIDGET 11: QUICK COMMANDS */}
                <div className="md:col-span-12 xl:col-span-4 grid grid-cols-2 gap-3 lg:gap-4">
                    <div className="col-span-1 bg-white dark:bg-[#111] p-4 lg:p-6 rounded-[24px] lg:rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 lg:gap-4 hover:border-black dark:hover:border-white/30 transition-all cursor-pointer group">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-zinc-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"><Plus size={18} strokeWidth={1.5} /></div>
                        <div>
                            <h3 className="font-bold text-[13px] lg:text-sm tracking-tight">Create Invoice</h3>
                            <p className="text-[9px] lg:text-[10px] text-zinc-500 mt-0.5">Tentoo Billing</p>
                        </div>
                    </div>
                    <div className="col-span-1 bg-white dark:bg-[#111] p-4 lg:p-6 rounded-[24px] lg:rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 lg:gap-4 hover:border-black dark:hover:border-white/30 transition-all cursor-pointer group">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-zinc-100 dark:bg-white/10 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0"><Users size={18} strokeWidth={1.5} /></div>
                        <div>
                            <h3 className="font-bold text-[13px] lg:text-sm tracking-tight">Register Entity</h3>
                            <p className="text-[9px] lg:text-[10px] text-zinc-500 mt-0.5">Onboard Client</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}