"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, Users, Mail, Trash2, Tag, Copy, CheckCircle2
} from 'lucide-react';

export default function WaitlistPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('All');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    
    // YENİ: Özel silme modalı için state
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

    useEffect(() => {
        const checkAdminAndFetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') return router.push('/client/login');
            
            setIsAdmin(true);
            fetchWaitlist();
        };
        
        checkAdminAndFetch();

        // Gerçek Zamanlı Güncelleme
        const waitlistChannel = supabase.channel('waitlist-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'waitlist' }, () => fetchWaitlist())
            .subscribe();

        return () => { supabase.removeChannel(waitlistChannel); };
    }, [router]);

    const fetchWaitlist = async () => {
        setLoading(true);
        const { data } = await supabase.from('waitlist').select('*').order('created_at', { ascending: false });
        if (data) setWaitlist(data);
        setLoading(false);
    };

    // YENİ: Sadece veritabanından silme işlemini yapar
    const confirmDelete = async () => {
        if (!entryToDelete) return;
        const id = entryToDelete;
        
        // Modalı hemen kapat
        setEntryToDelete(null);
        
        // UI'dan hızlıca sil (Optimistic update)
        setWaitlist(prev => prev.filter(item => item.id !== id));
        
        // Veritabanından sil
        await supabase.from('waitlist').delete().eq('id', id);
    };

    const copyToClipboard = (email: string, id: string) => {
        navigator.clipboard.writeText(email);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000); 
    };

    const productTabs = ['All', ...Array.from(new Set(waitlist.map(w => w.module_name)))];
    
    const filteredWaitlist = activeTab === 'All' 
        ? waitlist 
        : waitlist.filter(w => w.module_name === activeTab);

    if (!isAdmin) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans pb-32 relative">
            <div className="max-w-6xl mx-auto p-6 md:p-12 relative animate-in fade-in duration-700">
                
                {/* HEADER */}
                <header className="flex items-center gap-6 mb-12 border-b border-zinc-200 pb-8">
                    <button 
                        onClick={() => router.push('/admin/status')} 
                        className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-full hover:border-black text-zinc-400 hover:text-black transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-black">Waitlist Matrix</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2 flex items-center gap-2">
                            <Users size={12} /> {waitlist.length} Total Prospects
                        </p>
                    </div>
                </header>

                {/* PRODUCT TABS */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {productTabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all border ${
                                activeTab === tab 
                                ? 'bg-black text-white border-black shadow-lg' 
                                : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:text-zinc-600'
                            }`}
                        >
                            {tab} {tab !== 'All' && <span className="ml-1 opacity-60">({waitlist.filter(w => w.module_name === tab).length})</span>}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="py-20 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 animate-pulse">
                        Syncing Prospects...
                    </div>
                ) : (
                    <div className="bg-white border border-zinc-200 rounded-[40px] shadow-sm overflow-hidden">
                        {filteredWaitlist.length === 0 ? (
                            <div className="p-20 flex flex-col items-center justify-center text-center">
                                <Users size={32} className="text-zinc-300 mb-4" />
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No requests found in this category.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100">
                                {filteredWaitlist.map((entry) => (
                                    <div key={entry.id} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-50 transition-colors group">
                                        
                                        {/* KULLANICI BİLGİLERİ */}
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shrink-0">
                                                <Mail size={18} className="text-zinc-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-base md:text-lg font-medium text-black mb-1">{entry.email}</h3>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 flex items-center gap-1.5">
                                                        <Tag size={10} /> {entry.module_name}
                                                    </span>
                                                    <span className="text-[9px] font-mono text-zinc-400">
                                                        {new Date(entry.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AKSİYON BUTONLARI */}
                                        <div className="flex items-center gap-3 md:ml-auto">
                                            <button 
                                                onClick={() => copyToClipboard(entry.email, entry.id)}
                                                className={`px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${
                                                    copiedId === entry.id 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                                                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black shadow-sm'
                                                }`}
                                            >
                                                {copiedId === entry.id ? (
                                                    <><CheckCircle2 size={14} /> Copied!</>
                                                ) : (
                                                    <><Copy size={14} /> Copy Email</>
                                                )}
                                            </button>
                                            
                                            <button 
                                                // YENİ: Sil butonuna basınca modalı açar
                                                onClick={() => setEntryToDelete(entry.id)}
                                                className="p-2.5 text-zinc-300 border border-transparent rounded-xl hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                                title="Delete Prospect"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* YENİ: SİLME ONAY MODALI */}
            <AnimatePresence>
                {entryToDelete && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                        {/* Bulanık Arka Plan */}
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setEntryToDelete(null)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        
                        {/* Modalın Kendisi */}
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="relative bg-white border border-zinc-200 p-8 md:p-10 rounded-[32px] shadow-2xl max-w-sm w-full text-center"
                        >
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 shadow-sm">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Remove Prospect?</h3>
                            <p className="text-xs text-zinc-500 mb-8 leading-relaxed">
                                This action cannot be undone. The email address will be permanently removed from the waitlist database.
                            </p>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setEntryToDelete(null)}
                                    className="flex-1 py-3.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="flex-1 py-3.5 text-[9px] font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all shadow-md shadow-red-500/20"
                                >
                                    Remove
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}