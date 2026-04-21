"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Briefcase, Building, User, Target, Zap, Server, Database, ArrowLeft, Rocket, LayoutList
} from 'lucide-react';

export default function NewDeploymentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    const [discoveryData, setDiscoveryData] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [form, setForm] = useState({
        client_id: '',
        project_name: '',
        project_type: 'Web Application',
        tech_stack: [] as string[],
        status: 'planning',
        progress: 0,
        due_date: ''
    });

    const stackOptions = ['React', 'Next.js', 'Node.js', 'Python', 'Supabase', 'AWS', 'Docker', 'Framer Motion'];

    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('id, full_name, company_name, email').is('deleted_at', null);
            if (data) setClients(data);
            setLoading(false);
        };
        fetchClients();
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // AKILLI EŞLEŞTİRME (Client -> Discovery)
    const handleClientChange = async (clientId: string) => {
        setForm(prev => ({ ...prev, client_id: clientId }));
        setDiscoveryData(null); 
        
        const client = clients.find(c => c.id === clientId);
        if (!client) return;

        // Müşterinin e-postasına bağlı bir Discovery dosyası var mı bul (Sadece ana tablo)
        const { data, error } = await supabase
            .from('project_discovery')
            .select('*')
            .eq('client_email', client.email)
            .limit(1)
            .maybeSingle();

        if (data && !error) {
            setDiscoveryData(data);
            setForm(prev => ({
                ...prev,
                project_name: `${client.company_name || client.full_name} - ${data.project_type || 'Core System'}`,
                project_type: data.project_type || 'Web Application',
                progress: 5 
            }));
            showToast("Discovery Blueprint Auto-Loaded!", "success");
        }
    };

    const toggleTech = (tech: string) => {
        setForm(prev => ({
            ...prev,
            tech_stack: prev.tech_stack.includes(tech) 
                ? prev.tech_stack.filter(t => t !== tech)
                : [...prev.tech_stack, tech]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Projeler varsayılan olarak "Waiting" tablosuna eklenir.
            const { data: project, error } = await supabase.from('deployments_waiting').insert([{
                client_id: form.client_id, // Client ID ile veritabanı bağlantısı kuruldu
                project_name: form.project_name,
                project_type: form.project_type,
                tech_stack: form.tech_stack,
                status: form.status,
                progress: form.progress,
                due_date: form.due_date || null,
                client_logs: [{ 
                    date: new Date().toISOString(), 
                    message: "Project repository initialized. Discovery blueprint applied." 
                }]
            }]).select().single();

            if (error) throw error;

            // Eğer projeye ait bir keşif bulunduysa, artık tamamen 'converted' oldu.
            if (discoveryData) {
                await supabase.from('project_discovery').update({ status: 'converted' }).eq('id', discoveryData.id);
            }

            showToast("Deployment Trajectory Launched to Waiting List!");
            setTimeout(() => router.push('/admin/deployments'), 1500);

        } catch (error: any) {
            showToast(error.message, "error");
            setSaving(false);
        }
    };

    if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400">Loading Arsenal...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl border flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit">
                <ArrowLeft size={14}/> Back to Hub
            </button>

            <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900 mb-2">Launch Deployment</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Initialize a new project trajectory for an active entity.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Building size={14}/> Target Entity</span>
                        {discoveryData && <span className="text-emerald-500 flex items-center gap-1 animate-pulse"><LayoutList size={12}/> Blueprint Loaded</span>}
                    </h3>
                    
                    <select required value={form.client_id} onChange={(e) => handleClientChange(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-xl text-sm outline-none focus:border-black cursor-pointer transition-colors">
                        <option value="" disabled>Select an entity...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.company_name ? `${c.company_name} (${c.full_name})` : c.full_name}</option>)}
                    </select>

                    {discoveryData && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[9px] font-bold uppercase text-emerald-600 mb-1">Requested Type</p>
                                <p className="text-sm font-medium text-emerald-900">{discoveryData.project_type}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold uppercase text-emerald-600 mb-1">Estimated Budget</p>
                                <p className="text-sm font-medium font-mono text-emerald-900">~€{discoveryData.estimated_price}</p>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><Target size={14}/> Core Architecture</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Project Alias / Codename *</label>
                            <input required value={form.project_name} onChange={e => setForm({...form, project_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-xl text-sm outline-none focus:border-black" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Platform Type *</label>
                            <select value={form.project_type} onChange={e => setForm({...form, project_type: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-xl text-sm outline-none focus:border-black cursor-pointer">
                                <option>Web Application</option>
                                <option>Mobile Application</option>
                                <option>E-Commerce System</option>
                                <option>AI Infrastructure</option>
                                <option>Landing Page</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Estimated Delivery (Optional)</label>
                            <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-xl text-sm outline-none focus:border-black" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-3 block">Technology Stack</label>
                        <div className="flex flex-wrap gap-2">
                            {stackOptions.map(tech => (
                                <button key={tech} type="button" onClick={() => toggleTech(tech)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${form.tech_stack.includes(tech) ? 'bg-black text-white border-black' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-black hover:text-black'}`}>
                                    {tech}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button type="submit" disabled={saving || !form.client_id} className="w-full bg-black text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                    {saving ? "Launching..." : <><Rocket size={14}/> Launch Deployment</>}
                </button>
            </form>
        </div>
    );
}