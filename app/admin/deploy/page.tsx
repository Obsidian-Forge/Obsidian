"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Rocket, Box, Terminal, Server, CheckCircle2 } from 'lucide-react';

export default function DeployProjectPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [clients, setClients] = useState<any[]>([]);
    
    const [formData, setFormData] = useState({
        clientId: '',
        projectName: '',
        status: 'Planning'
    });

    // Sayfa açıldığında aktif müşterileri getir
    useEffect(() => {
        const fetchClients = async () => {
            const { data } = await supabase.from('clients').select('id, full_name, company_name').is('archived_at', null).order('created_at', { ascending: false });
            if (data) {
                setClients(data);
                if (data.length > 0) setFormData(prev => ({ ...prev, clientId: data[0].id }));
            }
            setFetching(false);
        };
        fetchClients();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId || !formData.projectName) return;
        setLoading(true);

        try {
            const { error } = await supabase.from('projects').insert({
                client_id: formData.clientId,
                name: formData.projectName,
                status: formData.status,
                progress_percent: 0
            });

            if (error) throw error;
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setFormData(prev => ({ ...prev, projectName: '', status: 'Planning' }));
            }, 3000);

        } catch (err) {
            console.error("Deployment Error:", err);
            alert("Error initializing deployment.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase tracking-widest font-bold text-zinc-400 animate-pulse">Scanning Active Entities...</div>;

    return (
        <div className="max-w-4xl animate-in fade-in duration-700 pb-20 font-sans">
            <header className="mb-8 lg:mb-12 px-2 lg:px-0">
                <h1 className="text-3xl md:text-5xl font-light tracking-tighter text-zinc-900 dark:text-white mb-2">
                    Deploy Project
                </h1>
                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    Initialize a new deployment protocol for an active entity
                </p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-[#111] p-6 lg:p-10 rounded-[28px] lg:rounded-[32px] border border-zinc-200 dark:border-white/5 shadow-sm relative overflow-hidden">
                {success && (
                    <div className="absolute inset-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} />
                        </div>
                        <h2 className="text-2xl font-light tracking-tight mb-2">Deployment Initialized</h2>
                        <p className="text-xs text-zinc-500">Project architecture has been provisioned.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative z-10">
                    
                    {/* LEFT COL: Parameters */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                <Terminal size={14}/> Core Parameters
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Entity (Client)</label>
                                    <select required value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm outline-none focus:border-black dark:focus:border-white transition-colors appearance-none cursor-pointer">
                                        <option value="" disabled>Select a client...</option>
                                        {clients.map(c => (
                                            <option key={c.id} value={c.id}>{c.full_name} {c.company_name ? `(${c.company_name})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Deployment Name</label>
                                    <div className="relative">
                                        <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                        <input required value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} type="text" className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="e.g. Nexus E-Commerce" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COL: Status */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                                <Server size={14}/> Initial State
                            </h2>
                            
                            <div className="mb-6">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Project Phase</label>
                                <div className="flex flex-col gap-3">
                                    {['Planning', 'Design', 'Development'].map(status => (
                                        <button key={status} type="button" onClick={() => setFormData({...formData, status})} 
                                            className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${formData.status === status ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-black/30 dark:hover:border-white/30'}`}>
                                            <span className="text-[11px] font-bold uppercase tracking-widest">{status}</span>
                                            {formData.status === status && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-white/5 flex justify-end">
                    <button disabled={loading || clients.length === 0} type="submit" className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2">
                        {loading ? 'Initializing...' : <><Rocket size={16} /> Execute Deployment</>}
                    </button>
                </div>
            </form>
        </div>
    );
}