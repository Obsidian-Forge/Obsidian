"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, CheckCircle2, FileText, Database, 
    Mail, Building, Phone, MapPin, Receipt, Rocket, ArrowLeft, Link as LinkIcon
} from 'lucide-react';

function ProvisioningForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const discoveryId = searchParams.get('discovery_id');
    
    const [loading, setLoading] = useState(!!discoveryId);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [linkedDiscoveryId, setLinkedDiscoveryId] = useState<string | null>(discoveryId || null);
    
    const [form, setForm] = useState({
        full_name: '', email: '', company_name: '', phone: '', address: '', vat_number: '',
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
        { id: 'nexus_cx', name: 'Nexus CX', price: 49 },
        { id: 'sentinel', name: 'Sentinel Core', price: 99 },
        { id: 'architect', name: 'Architect AI', price: 79 }
    ];

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // AUTO-FILL FROM DISCOVERY (Eğer URL'den geliyorsa)
    useEffect(() => {
        if (!discoveryId) return;
        
        const fetchDiscovery = async () => {
            try {
                // Artık sadece project_discovery ana tablosuna bakıyoruz
                const { data, error } = await supabase.from('project_discovery').select('*').eq('id', discoveryId).single();
            
                if (data && !error) {
                    setForm(prev => ({
                        ...prev,
                        full_name: data.client_name || '',
                        email: data.client_email || '',
                        company_name: data.client_name || '',
                        monthly_price: data.estimated_price || 0
                    }));
                }
            } catch (err) {
                console.error("Discovery import failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDiscovery();
    }, [discoveryId]);

    // SMART EMAIL DETECTION: Yazılan e-posta ile eşleşen bir Discovery var mı?
    const checkDiscoveryByEmail = async (email: string) => {
        if (!email || linkedDiscoveryId) return;
        
        try {
            const { data, error } = await supabase
                .from('project_discovery')
                .select('*')
                .eq('client_email', email)
                .eq('status', 'pending') // Sadece pending olanları bul
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();
    
            if (error && error.code !== 'PGRST116') {
                console.error('Discovery lookup error:', error);
                return;
            }
    
            if (data) {
                setLinkedDiscoveryId(data.id);
                setForm(prev => ({
                    ...prev,
                    full_name: prev.full_name || data.client_name || '',
                    company_name: prev.company_name || data.client_name || '',
                    monthly_price: prev.monthly_price || data.estimated_price || 0
                }));
                showToast("Existing discovery blueprint found and linked!", "info");
            }
        } catch (err: any) {
            console.error('Unexpected error in checkDiscoveryByEmail:', err);
        }
    };

    const recalculateSaaS = (plan: string, products: string[]) => {
        let total = PLAN_METRICS[plan].price;
        products.forEach(pid => {
            const mod = availableModules.find(m => m.id === pid);
            if (mod) total += mod.price;
        });
        setForm(prev => ({ 
            ...prev, subscription_plan: plan, active_products: products, 
            monthly_price: total, monthly_limit: PLAN_METRICS[plan].limit 
        }));
    };

    const handlePlanSelect = (plan: string) => recalculateSaaS(plan, form.active_products);
    const toggleProduct = (pid: string) => {
        const newProducts = form.active_products.includes(pid) ?
            form.active_products.filter(x => x !== pid) : [...form.active_products, pid];
        recalculateSaaS(form.subscription_plan, newProducts);
    };

    const generate12DigitKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const getPart = () => Array.from({length: 4}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `${getPart()}-${getPart()}-${getPart()}`;
    };

    const handleProvision = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const accessCode = generate12DigitKey();

            // 1. CREATE GOOGLE DRIVE FOLDERS
            const driveRes = await fetch('/api/drive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'createClientFolders',
                    clientName: form.full_name,
                    clientEmail: form.email, // Bu satırın dolu gittiğinden emin ol
                })
            });
            const driveData = await driveRes.json();
            if (!driveRes.ok) throw new Error(`Drive Error: ${driveData.error || 'Unknown error'}`);

            // 2. INSERT CLIENT TO SUPABASE
            const { error } = await supabase.from('clients').insert({
                ...form,
                access_code: accessCode,
                used_messages: 0,
                subscription_status: form.subscription_plan === 'none' ? 'trial' : 'active',
                drive_folder_id: driveData.mainId,
                drive_invoice_folder_id: driveData.invoiceFolderId,
                google_drive_link: driveData.driveLink
            });
            if (error) throw error;

            // 3. UPDATE DISCOVERY STATUS TO CONVERTED (Eğer keşif dosyası varsa bağla)
            if (linkedDiscoveryId) {
                await supabase.from('project_discovery').update({ status: 'converted' }).eq('id', linkedDiscoveryId);
            }

            showToast("Entity & Drive Workspace Provisioned Successfully");
            setTimeout(() => router.push('/admin/clients'), 2000);

        } catch (err: any) {
            if (err.code === '23505' || err.message?.includes('duplicate key')) {
                showToast("This email is already registered to an active entity.", "error");
            } else {
                showToast(err.message || "Provisioning failed", "error");
            }
            setIsSaving(false);
        }
    };

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400">Importing Data...</div>;

    return (
        <div className="animate-in fade-in duration-700 max-w-4xl mx-auto bg-white min-h-screen rounded-[40px] shadow-sm border border-zinc-100 mt-6 overflow-hidden pb-20">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : toast.type === 'info' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-black text-white'}`}>
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-white border border-zinc-200 rounded-full text-zinc-500 hover:text-black transition-colors shadow-sm"><ArrowLeft size={18}/></button>
                    <div>
                        <h1 className="text-2xl font-light tracking-tight text-zinc-900">Provision New Entity</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1 flex items-center gap-2">
                            {linkedDiscoveryId ? <><LinkIcon size={10} className="text-blue-500"/> Linked to Discovery Blueprint</> : 'Manual Registration Pipeline'}
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleProvision} className="p-8 space-y-8">
                {/* IDENTITY & CONTACT */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><User size={14}/> Identity & Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5"><User size={10}/> Full Name *</label><input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-zinc-400 transition-colors" /></div>
                        <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5"><Mail size={10}/> Email Address *</label><input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} onBlur={e => checkDiscoveryByEmail(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-zinc-400 transition-colors" /></div>
                        <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5"><Building size={10}/> Company / Entity</label><input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="Optional" className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-zinc-400 transition-colors" /></div>
                        <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5"><Phone size={10}/> Phone Number</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 234 567 890" className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-zinc-400 transition-colors" /></div>
                        <div className="md:col-span-2"><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5"><MapPin size={10}/> Physical Address</label><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Street, City, Zip Code" className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-zinc-400 transition-colors" /></div>
                        <div className="md:col-span-2"><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5"><Receipt size={10}/> VAT / Tax ID</label><input value={form.vat_number} onChange={e => setForm({...form, vat_number: e.target.value})} placeholder="e.g. BE 0123.456.789" className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-mono outline-none focus:border-zinc-400 transition-colors" /></div>
                    </div>
                </div>

                {/* SAAS ALLOCATION ENGINE */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-8">
                    <div className="flex justify-between border-b border-zinc-100 pb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Database size={14}/> SaaS Allocation</h3>
                        <span className="text-[9px] font-bold bg-zinc-100 text-zinc-600 px-3 py-1 rounded-md uppercase border border-zinc-200">{form.subscription_plan} Tier</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['none', 'node', 'core', 'nexus'].map(p => (
                            <button key={p} type="button" onClick={() => handlePlanSelect(p)} className={`py-4 rounded-xl border text-[10px] font-bold uppercase transition-all ${form.subscription_plan === p ? 'bg-black text-white border-black' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'}`}>{p}</button>
                        ))}
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block ml-1">Add-on Neural Modules</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {availableModules.map(mod => (
                                <div key={mod.id} onClick={() => toggleProduct(mod.id)} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${form.active_products.includes(mod.id) ? 'bg-zinc-50 border-black' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${form.active_products.includes(mod.id) ? 'bg-black border-black text-white' : 'border-zinc-300'}`}>{form.active_products.includes(mod.id) && <CheckCircle2 size={10} strokeWidth={3}/>}</div>
                                        <p className={`text-xs font-bold ${form.active_products.includes(mod.id) ? 'text-black' : 'text-zinc-500'}`}>{mod.name}</p>
                                    </div>
                                    <span className="text-[9px] font-mono text-zinc-400">+€{mod.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-[24px] border border-zinc-200">
                        <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-2 block">Token Limit</label><input type="number" value={form.monthly_limit} onChange={e => setForm({...form, monthly_limit: parseInt(e.target.value)||0})} className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-mono outline-none focus:border-zinc-400 transition-colors" /></div>
                        <div><label className="text-[9px] font-bold uppercase text-zinc-900 mb-2 block">Calculated MRR (€)</label><input type="number" value={form.monthly_price} onChange={e => setForm({...form, monthly_price: parseFloat(e.target.value)||0})} className="w-full bg-white border border-zinc-300 px-4 py-3 rounded-xl text-sm font-mono font-bold outline-none text-black focus:border-black transition-colors" /></div>
                    </div>
                </div>

                {/* INTERNAL NOTES */}
                <div className="bg-zinc-50 p-6 rounded-[28px] border border-zinc-200 shadow-sm space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2"><FileText size={14}/> Internal Notes</h3>
                    <textarea value={form.internal_notes} onChange={e => setForm({...form, internal_notes: e.target.value})} placeholder="Add initial operational notes..." className="w-full bg-transparent text-xs text-zinc-700 outline-none min-h-[80px] resize-none" />
                </div>

                <div className="pt-4 border-t border-zinc-100 flex flex-col items-center">
                    <button type="submit" disabled={isSaving} className="w-full md:w-auto px-12 bg-black text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSaving ? "Provisioning..." : <><Rocket size={14}/> Provision Architecture</>}
                    </button>
                    <p className="text-[8px] text-zinc-400 uppercase tracking-widest mt-4">A unique 12-digit security key will be generated automatically upon creation.</p>
                </div>
            </form>
        </div>
    );
}

export default function NewClientPage() {
    return (
        <Suspense fallback={<div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400">Loading Pipeline...</div>}>
            <ProvisioningForm />
        </Suspense>
    );
}