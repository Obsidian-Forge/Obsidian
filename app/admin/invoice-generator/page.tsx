"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, Plus, Trash2, Save, User, Building, 
    Calendar, Euro, CheckCircle2, Wallet,
    Compass, MonitorSmartphone, Code, Sparkles, Database
} from 'lucide-react';

export default function InvoiceGeneratorPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [fetchingDiscovery, setFetchingDiscovery] = useState(false);
    
    const [clients, setClients] = useState<any[]>([]);
    
    // Fatura Form State
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [discoveryData, setDiscoveryData] = useState<any>(null);
    
    const [dueDate, setDueDate] = useState<string>('');
    const [tentooRef, setTentooRef] = useState<string>('');
    
    // Fatura Kalemleri (SADECE HİZMET BEDELİ)
    const [lineItems, setLineItems] = useState<{ id: string; desc: string; qty: number; price: number }[]>([]);
    
    // TENTOO NET YIELD (Tahmini Net Getiri)
    const [tentooYieldRate, setTentooYieldRate] = useState<number>(55); 

    // AJANS HİZMET ŞABLONLARI
    const servicePresets = [
        { icon: <Compass size={14} />, name: "Discovery & Strategy", defaultPrice: 0 },
        { icon: <MonitorSmartphone size={14} />, name: "Bespoke Web Design", defaultPrice: 0 },
        { icon: <Code size={14} />, name: "Custom Engineering", defaultPrice: 0 },
        { icon: <Sparkles size={14} />, name: "Brand Identity", defaultPrice: 0 }
    ];

    useEffect(() => {
        fetchActiveClients();
        const date = new Date();
        date.setDate(date.getDate() + 14);
        setDueDate(date.toISOString().split('T')[0]);
    }, []);

    const fetchActiveClients = async () => {
        try {
            const { data, error } = await supabase.from('clients').select('*').is('archived_at', null).order('full_name', { ascending: true });
            if (error) throw error;
            if (data) setClients(data);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const buildSmartInvoice = async () => {
            if (!selectedClientId) {
                setLineItems([]);
                setSelectedClient(null);
                setDiscoveryData(null);
                return;
            }

            setFetchingDiscovery(true);
            const client = clients.find(c => c.id === selectedClientId);
            setSelectedClient(client);

            let newItems: { id: string; desc: string; qty: number; price: number }[] = [];

            if (client) {
                // SAAS OTOMASYONU
                if (client.monthly_price && client.monthly_price > 0) {
                    newItems.push({
                        id: crypto.randomUUID(),
                        desc: `SaaS Infrastructure - ${client.subscription_plan ? client.subscription_plan.toUpperCase() : 'Custom'} Tier`,
                        qty: 1,
                        price: client.monthly_price
                    });
                }
                if (client.active_products && client.active_products.length > 0) {
                    client.active_products.forEach((prod: string) => {
                        const prodName = prod === 'nexus_cx' ? 'Nexus CX' : prod === 'sentinel' ? 'Sentinel Core' : prod === 'architect' ? 'Architect AI' : prod;
                        newItems.push({ id: crypto.randomUUID(), desc: `Active Module: ${prodName}`, qty: 1, price: 0 });
                    });
                }

                // DISCOVERY OTOMASYONU
                try {
                    const { data: discovery } = await supabase
                        .from('discoveries')
                        .select('*')
                        .eq('email', client.email)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (discovery) {
                        setDiscoveryData(discovery);
                        newItems.push({
                            id: crypto.randomUUID(),
                            desc: `Bespoke Development: ${discovery.project_type || 'Web Application'}`,
                            qty: 1,
                            price: discovery.budget ? parseFloat(discovery.budget.toString().replace(/[^0-9.]/g, '')) || 0 : 0
                        });
                        if (discovery.features && Array.isArray(discovery.features)) {
                            discovery.features.forEach((feature: string) => {
                                newItems.push({ id: crypto.randomUUID(), desc: `+ Feature: ${feature}`, qty: 1, price: 0 });
                            });
                        }
                    }
                } catch (err) {
                    console.error("Discovery fetch error:", err);
                }

                setLineItems(newItems);
            }
            setFetchingDiscovery(false);
        };

        buildSmartInvoice();
    }, [selectedClientId, clients]);

    const addLineItem = () => setLineItems([...lineItems, { id: crypto.randomUUID(), desc: '', qty: 1, price: 0 }]);
    const addPresetItem = (name: string, price: number) => setLineItems([...lineItems, { id: crypto.randomUUID(), desc: name, qty: 1, price }]);
    const removeLineItem = (id: string) => setLineItems(lineItems.filter(item => item.id !== id));
    const updateLineItem = (id: string, field: string, value: any) => setLineItems(lineItems.map(item => item.id === id ? { ...item, [field]: value } : item));

    // YALIN HESAPLAMA (Sadece Hizmet Bedeli ve Tahmini Net)
    const totalBilled = lineItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const estimatedNet = totalBilled * (tentooYieldRate / 100);

    const handleSaveInvoice = async () => {
        if (!selectedClientId || lineItems.length === 0 || totalBilled === 0) {
            alert("Please select a client and ensure invoice has a total amount.");
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.from('invoices').insert({
                client_id: selectedClientId,
                amount: totalBilled, // Sadece KDV'siz hizmet bedeli kaydedilir
                estimated_net: estimatedNet,
                status: 'unpaid',
                tentoo_id: tentooRef || null,
                due_date: new Date(dueDate).toISOString()
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setSelectedClientId('');
                setSelectedClient(null);
                setDiscoveryData(null);
                setLineItems([]);
                setTentooRef('');
            }, 3000);

        } catch (error: any) {
            alert(`Error saving invoice: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-zinc-400">Loading Billing Infrastructure...</div>;

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-700 pb-20 font-sans">
            <header className="mb-8 lg:mb-10 px-2 lg:px-0">
                <h1 className="text-3xl md:text-5xl font-light tracking-tighter text-zinc-900 dark:text-white mb-2">
                    Invoice Generator
                </h1>
                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Smart billing for SaaS subscriptions and Agency services
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* SOL: FATURA AYARLARI VE KALEMLER */}
                <div className="lg:col-span-8 space-y-6">
                    
                    <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <User size={16} className="text-zinc-400" />
                                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Bill To Entity</h2>
                            </div>
                            {fetchingDiscovery && <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 animate-pulse">Syncing Discovery Data...</span>}
                        </div>

                        <select 
                            value={selectedClientId} 
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 px-4 py-4 rounded-xl text-sm outline-none focus:border-black dark:focus:border-white transition-all text-zinc-900 dark:text-white cursor-pointer"
                        >
                            <option value="" disabled>Select an active client...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.company_name ? `${client.company_name} (${client.full_name})` : client.full_name}
                                </option>
                            ))}
                        </select>

                        {/* SaaS BILGI KARTI */}
                        {selectedClient && selectedClient.subscription_plan && selectedClient.subscription_plan !== 'none' && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-2xl flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 mb-1 flex items-center gap-1"><Database size={12}/> SaaS Architecture</p>
                                    <p className="text-sm font-medium text-indigo-900 dark:text-indigo-300">
                                        {selectedClient.subscription_plan.toUpperCase()} Tier • {selectedClient.monthly_limit || 0} Tokens
                                    </p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Contracted MRR</p>
                                    <p className="text-lg font-mono font-bold text-indigo-900 dark:text-indigo-300">€{selectedClient.monthly_price || 0}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* DISCOVERY BILGI KARTI */}
                        {discoveryData && (
                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                                 <div>
                                     <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mb-1 flex items-center gap-1"><Compass size={12}/> Discovery Matched</p>
                                     <p className="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                                         Project: {discoveryData.project_type || 'Custom App'}
                                     </p>
                                 </div>
                                 <div className="text-left sm:text-right">
                                     <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Stated Budget</p>
                                     <p className="text-lg font-mono font-bold text-emerald-900 dark:text-emerald-300">{discoveryData.budget ? `~€${discoveryData.budget}` : 'TBD'}</p>
                                 </div>
                             </motion.div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-[#111] p-6 lg:p-8 rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-zinc-400" />
                                <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Line Items</h2>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {servicePresets.map((preset, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => addPresetItem(preset.name, preset.defaultPrice)}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300 hover:border-black dark:hover:border-white transition-colors"
                                    >
                                        {preset.icon} {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {lineItems.length === 0 ? (
                                <div className="py-8 text-center border border-dashed border-zinc-200 dark:border-white/10 rounded-[20px] bg-zinc-50 dark:bg-white/[0.02]">
                                    <p className="text-xs text-zinc-500 mb-3">Invoice is empty. Select a client to trigger smart-fill.</p>
                                    <button onClick={addLineItem} className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center justify-center gap-1 mx-auto hover:underline">
                                        <Plus size={12} /> Add Custom Item
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {lineItems.map((item) => (
                                        <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                            <div className="flex-1 w-full relative">
                                                <input 
                                                    type="text" value={item.desc} onChange={(e) => updateLineItem(item.id, 'desc', e.target.value)} placeholder="Description of service..."
                                                    className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm outline-none focus:border-black dark:focus:border-white text-zinc-900 dark:text-white"
                                                />
                                            </div>
                                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                                <div className="w-20">
                                                    <input 
                                                        type="number" min="1" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value) || 1)} 
                                                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm outline-none text-center text-zinc-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="w-32 relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">€</span>
                                                    <input 
                                                        type="number" value={item.price} onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)} 
                                                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 pl-8 pr-4 py-3 rounded-xl text-sm outline-none font-mono text-zinc-900 dark:text-white"
                                                    />
                                                </div>
                                                <button onClick={() => removeLineItem(item.id)} className="p-3 text-zinc-400 hover:text-red-500 transition-colors bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 shrink-0">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-2">
                                        <button onClick={addLineItem} className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">
                                            <Plus size={12} /> Add Custom Item
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* SAĞ: İKİLİ DEFTER SİSTEMİ (DUAL-LEDGER) SADELEŞTİRİLDİ */}
                <div className="lg:col-span-4 space-y-6">
                    
                    <div className="bg-white dark:bg-[#111] p-6 rounded-[28px] border border-zinc-200 dark:border-white/5 shadow-sm space-y-5">
                        <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 flex items-center gap-1"><Calendar size={12}/> Due Date</label>
                            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm outline-none text-zinc-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 flex items-center gap-1"><Building size={12}/> Tentoo Reference ID (Optional)</label>
                            <input type="text" value={tentooRef} onChange={(e) => setTentooRef(e.target.value)} placeholder="e.g. TNT-2026-891" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 px-4 py-3 rounded-xl text-sm outline-none text-zinc-900 dark:text-white font-mono uppercase" />
                        </div>
                    </div>

                    <div className="bg-zinc-900 dark:bg-black p-6 rounded-[28px] border border-zinc-800 dark:border-white/10 shadow-xl text-white relative overflow-hidden">
                        {success && (
                            <div className="absolute inset-0 bg-emerald-500 z-10 flex flex-col items-center justify-center animate-in fade-in">
                                <CheckCircle2 size={32} className="text-white mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest text-white">Ledger Updated</p>
                            </div>
                        )}
                        
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Euro size={14}/> Financial Summary</h3>
                        
                        <div className="space-y-1 mb-6 border-b border-zinc-800 dark:border-white/10 pb-6">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2">1. Client Billed Amount</p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-zinc-300">Total Billed</span>
                                <span className="text-3xl font-light tracking-tighter">€{totalBilled.toFixed(2)}</span>
                            </div>
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest pt-2">Excludes VAT (Handled by Tentoo)</p>
                        </div>

                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1"><Wallet size={12}/> 2. Internal Payout (Net)</p>
                                <div className="flex items-center gap-2 bg-black/50 px-2 py-1 rounded-lg border border-emerald-500/30">
                                    <span className="text-[8px] uppercase tracking-widest text-zinc-400">Yield %</span>
                                    <input type="number" value={tentooYieldRate} onChange={(e) => setTentooYieldRate(parseFloat(e.target.value) || 0)} className="w-8 bg-transparent outline-none text-emerald-400 font-mono text-xs text-right" />
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-medium text-emerald-100/70">Estimated Earnings<br/><span className="text-[8px] text-zinc-500">After Tentoo & Taxes</span></span>
                                <span className="text-3xl font-light tracking-tighter text-emerald-400">€{estimatedNet.toFixed(2)}</span>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveInvoice}
                            disabled={saving || !selectedClientId || totalBilled === 0}
                            className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {saving ? <span className="w-4 h-4 border-2 border-t-transparent border-black rounded-full animate-spin" /> : <><Save size={14} /> Record to Ledger</>}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}