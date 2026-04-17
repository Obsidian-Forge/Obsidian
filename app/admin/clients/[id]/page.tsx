"use client";

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, User, Cpu, Euro, CheckCircle2, FileText, Wallet, BrainCircuit, 
    Globe, Trash2, ShieldAlert, Database, RotateCcw, ArchiveRestore, Zap, Mail, RefreshCw, Ban
} from 'lucide-react';

export default function EntityDossierPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [client, setClient] = useState<any>(null);
    const [form, setForm] = useState({
        full_name: '', email: '', company_name: '', address: '',
        subscription_plan: 'none', monthly_limit: 0, monthly_price: 0,
        active_products: [] as string[], internal_notes: ''
    });

    const PLAN_METRICS: Record<string, { price: number, limit: number }> = {
        none: { price: 0, limit: 0 },
        node: { price: 39, limit: 500 },
        core: { price: 129, limit: 2500 },
        nexus: { price: 399, limit: 10000 }
    };

    const availableModules = [
        { id: 'nexus_cx', name: 'Nexus CX', desc: 'Support AI', price: 49 },
        { id: 'sentinel', name: 'Sentinel Core', desc: 'Analytics', price: 99 },
        { id: 'architect', name: 'Architect AI', desc: 'Proposals', price: 79 }
    ];

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const generate12DigitKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const getPart = () => Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `${getPart()}-${getPart()}-${getPart()}`;
    };

    const fetchFullDossier = async () => {
        try {
            const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
            if (error) throw error;
            if (data) {
                setClient(data);
                setForm({
                    full_name: data.full_name, email: data.email, company_name: data.company_name || '', address: data.address || '',
                    subscription_plan: data.subscription_plan || 'none', monthly_limit: data.monthly_limit || 0, monthly_price: data.monthly_price || 0,
                    active_products: data.active_products || [], internal_notes: data.internal_notes || ''
                });
            }
        } catch (err) { showToast("Node retrieval failed.", "error"); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchFullDossier(); }, [id]);

    const recalculateSaaS = (plan: string, products: string[]) => {
        let total = PLAN_METRICS[plan].price;
        products.forEach(pid => {
            const mod = availableModules.find(m => m.id === pid);
            if (mod) total += mod.price;
        });
        setForm(prev => ({ 
            ...prev, 
            subscription_plan: plan, 
            active_products: products, 
            monthly_price: total, 
            monthly_limit: PLAN_METRICS[plan].limit 
        }));
    };

    const handlePlanSelect = (plan: string) => recalculateSaaS(plan, form.active_products);
    const toggleProduct = (pid: string) => {
        const newProducts = form.active_products.includes(pid) ? form.active_products.filter(x => x !== pid) : [...form.active_products, pid];
        recalculateSaaS(form.subscription_plan, newProducts);
    };

    const sendKeyByEmail = () => {
        const mailto = `mailto:${client.email}?subject=Security Update&body=Your key: ${client.access_code}`;
        window.location.href = mailto;
        showToast("Mail client triggered.", "info");
    };

    const handleKeyAction = async (action: 'regenerate' | 'revoke') => {
        const newKey = action === 'revoke' ? `REVOKED-${Math.random().toString(36).substring(2,8).toUpperCase()}` : generate12DigitKey();
        const { error } = await supabase.from('clients').update({ access_code: newKey }).eq('id', id);
        if (!error) { showToast(`Key ${action}d.`); fetchFullDossier(); }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const { error } = await supabase.from('clients').update(form).eq('id', id);
        if (!error) showToast("Architecture Synced");
        setIsSaving(false);
    };

    const handleStatusChange = async (action: 'archive' | 'unarchive' | 'terminate' | 'restore') => {
        let updates: any = {};
        if (action === 'archive' || action === 'terminate') {
            updates = { 
                [action === 'archive' ? 'archived_at' : 'deleted_at']: new Date().toISOString(),
                access_code: `REVOKED-${Math.random().toString(36).substring(2,8).toUpperCase()}` 
            };
        } else {
            updates = { archived_at: null, deleted_at: null, access_code: generate12DigitKey() };
        }
        await supabase.from('clients').update(updates).eq('id', id);
        fetchFullDossier();
    };

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400">Decrypting Dossier...</div>;
    if (!client) return <div className="h-[50vh] flex items-center justify-center font-bold text-zinc-400">NODE NOT FOUND</div>;

    return (
        <div className="animate-in fade-in duration-700 max-w-6xl mx-auto bg-white min-h-screen rounded-[40px] shadow-sm border border-zinc-100 mt-6 overflow-hidden pb-20">
            <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-black text-white'}`}>{toast.message}</motion.div>}</AnimatePresence>

            <header className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 border-b border-zinc-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-zinc-50 rounded-full text-zinc-400 hover:text-black transition-colors"><X size={20}/></button>
                    <div><h1 className="text-3xl font-light tracking-tighter">{client.full_name}</h1><p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${client.deleted_at ? 'text-red-500' : 'text-emerald-500'}`}>● {client.deleted_at ? 'Terminated' : 'Secure Entity Node'}</p></div>
                </div>
                <div className="flex gap-2">
                    {client.deleted_at ? (
                        <button onClick={() => handleStatusChange('restore')} className="px-5 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><RotateCcw size={14}/> Restore</button>
                    ) : (
                        <>
                            <button onClick={() => handleStatusChange(client.archived_at ? 'unarchive' : 'archive')} className="px-5 py-3 bg-amber-50 text-amber-600 rounded-xl text-[9px] font-bold uppercase tracking-widest">{client.archived_at ? 'Unarchive' : 'Archive'}</button>
                            <button onClick={() => handleStatusChange('terminate')} className="px-5 py-3 bg-red-50 text-red-600 rounded-xl text-[9px] font-bold uppercase tracking-widest">Terminate</button>
                        </>
                    )}
                </div>
            </header>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-bold uppercase text-zinc-400 border-b pb-4 flex items-center gap-2"><User size={14}/> Identity & Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Full Name</label><input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-2xl text-sm outline-none" /></div>
                            <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Email</label><input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-2xl text-sm outline-none" /></div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-lg shadow-zinc-100 space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex justify-between border-b pb-4"><h3 className="text-[10px] font-bold uppercase text-zinc-500 flex items-center gap-2"><Database size={14}/> SaaS Allocation Engine</h3><span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">{form.subscription_plan} Tier</span></div>
                        <div className="grid grid-cols-4 gap-3">
                            {['none', 'node', 'core', 'nexus'].map(p => <button key={p} type="button" onClick={() => handlePlanSelect(p)} className={`py-4 rounded-2xl border text-[10px] font-bold uppercase transition-all ${form.subscription_plan === p ? 'bg-black text-white border-black shadow-xl scale-105' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}>{p}</button>)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {availableModules.map(mod => <div key={mod.id} onClick={() => toggleProduct(mod.id)} className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${form.active_products.includes(mod.id) ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white border-zinc-200 text-zinc-400'}`}><div className="flex items-center gap-3"><div className={`w-4 h-4 rounded border flex items-center justify-center ${form.active_products.includes(mod.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300'}`}>{form.active_products.includes(mod.id) && <CheckCircle2 size={10} strokeWidth={3}/>}</div><p className="text-xs font-bold">{mod.name}</p></div><span className="text-[9px] font-mono">+€{mod.price}</span></div>)}
                        </div>
                        <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-[28px] border border-zinc-200">
                            <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1 block">Token Limit</label><input type="number" value={form.monthly_limit} onChange={e => setForm({...form, monthly_limit: parseInt(e.target.value)||0})} className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-mono outline-none" /></div>
                            <div><label className="text-[9px] font-bold uppercase text-indigo-500 mb-1 block">Total MRR (€)</label><input type="number" value={form.monthly_price} onChange={e => setForm({...form, monthly_price: parseFloat(e.target.value)||0})} className="w-full bg-indigo-50 border border-indigo-200 px-4 py-3 rounded-xl text-sm font-mono font-bold outline-none text-indigo-900" /></div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-zinc-900 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl pointer-events-none"/>
                        <div><h3 className="text-[10px] font-bold uppercase text-zinc-400 mb-6 flex items-center gap-2"><Wallet size={14}/> Revenue Node</h3><span className="text-5xl font-light tracking-tighter">€{form.monthly_price}</span><p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Active Monthly Yield</p></div>
                        <div className="pt-6 border-t border-white/10 flex justify-between items-center"><span className="text-[10px] font-mono text-zinc-400">Tokens: {client.used_messages} / {form.monthly_limit}</span><BrainCircuit size={16} className="text-indigo-400"/></div>
                    </div>

                    <div className="bg-white p-6 rounded-[28px] border border-zinc-200 shadow-sm space-y-5">
                        <div className="flex justify-between border-b pb-3"><h3 className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-2"><ShieldAlert size={14}/> Access Key</h3><button type="button" onClick={sendKeyByEmail} className="text-[9px] font-bold uppercase text-indigo-500 flex items-center gap-1"><Mail size={12}/> Email Key</button></div>
                        <div className={`p-4 rounded-xl border text-center font-mono font-bold tracking-widest ${client.access_code.startsWith('REVOKED') ? 'bg-red-50 text-red-500 border-red-100' : 'bg-zinc-50 text-zinc-900 border-zinc-200'}`}>{client.access_code}</div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => handleKeyAction('regenerate')} className="flex-1 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-1.5"><RefreshCw size={12}/> New Key</button>
                            <button type="button" onClick={() => handleKeyAction('revoke')} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-1.5"><Ban size={12}/> Revoke</button>
                        </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-black text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">{isSaving ? "Syncing..." : <><Globe size={14}/> Sync Architecture</>}</button>
                </div>
            </form>
        </div>
    );
}