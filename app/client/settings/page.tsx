"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Lock, 
    User, 
    Mail, 
    Key, 
    Building2, 
    Phone, 
    MapPin, 
    AlertTriangle, 
    X,
    ShieldCheck
} from 'lucide-react';

export default function ClientSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    const [isDark, setIsDark] = useState(false);
    
    const [formData, setFormData] = useState({
        company_name: '',
        phone_number: '',
        address: ''
    });

    const [lockedData, setLockedData] = useState({
        email: '',
        access_code: ''
    });

    // Termination (İptal) State'leri
    const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
    const [terminationReason, setTerminationReason] = useState('');
    const [terminateConfirmText, setTerminateConfirmText] = useState('');
    const [isTerminating, setIsTerminating] = useState(false);

    // Toast Bildirim State'i
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

    const router = useRouter();

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        if (!storedId) return router.push('/client/login');
        
        setClientId(storedId);
        setClientName(localStorage.getItem('novatrum_client_name') || 'Authorized Entity');
        fetchClientData(storedId);

        const checkTheme = () => setIsDark(localStorage.getItem('novatrum_theme') === 'dark');
        checkTheme();
        window.addEventListener('theme-changed', checkTheme);
        return () => window.removeEventListener('theme-changed', checkTheme);
    }, [router]);

    const fetchClientData = async (id: string) => {
        const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
        if (data && !error) {
            setFormData({
                company_name: data.company_name || '',
                phone_number: data.phone_number || '',
                address: data.address || ''
            });
            setLockedData({
                email: data.email || '',
                access_code: data.access_code || ''
            });
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return;
        setSaving(true);

        const { error } = await supabase
            .from('clients')
            .update({
                company_name: formData.company_name,
                phone_number: formData.phone_number,
                address: formData.address
            })
            .eq('id', clientId);

        if (!error) {
            showToast("System records updated successfully.");
        } else {
            showToast("Update failed: " + error.message, "error");
        }
        setSaving(false);
    };

    const handleTerminationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (terminateConfirmText !== 'TERMINATE') return showToast("Type TERMINATE to confirm.", "error");
        if (!clientId) return;
        setIsTerminating(true);

        try {
            // 1. İptal talebi oluştur
            await supabase.from('termination_requests').insert({
                client_id: clientId,
                client_name: clientName,
                reason: terminationReason,
                status: 'pending'
            });

            // 2. Access Code'u devre dışı bırak
            await supabase.from('clients').update({ access_code: 'REVOKED-' + Date.now() }).eq('id', clientId);
            
            showToast("Project stopped securely. Logging out...");
            setTimeout(() => {
                localStorage.clear();
                router.push('/client/login');
            }, 3000);
        } catch (err: any) {
            showToast("Termination failed.", "error");
            setIsTerminating(false);
        }
    };

    if (loading) return null;

    return (
        <div className="w-full max-w-[1400px] mx-auto pb-24 animate-in fade-in duration-700">
            
            {/* HEADER */}
            <header className="mb-12 lg:mb-20">
                <p className={`text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.4em] mb-4 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    Node Configuration
                </p>
                <h1 className={`text-4xl lg:text-6xl font-light tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>
                    Entity Settings
                </h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                
                {/* SOL SÜTUN - KİLİTLİ BİLGİLER */}
                <div className="lg:col-span-4 space-y-8">
                    <section className={`p-8 lg:p-10 rounded-[40px] border transition-all duration-500
                        ${isDark ? 'bg-zinc-900/50 border-white/5 shadow-2xl' : 'bg-white border-black/[0.03] shadow-sm'}`}>
                        
                        <div className="flex items-center gap-3 mb-10 pb-4 border-b border-black/[0.02] dark:border-white/5">
                            <Lock size={14} className="text-red-500" />
                            <h2 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Identity (Locked)</h2>
                        </div>

                        <div className="space-y-8">
                            <LockedField label="Authorized Name" value={clientName} icon={<User size={16}/>} isDark={isDark} />
                            <LockedField label="Secure Email" value={lockedData.email} icon={<Mail size={16}/>} isDark={isDark} />
                            <LockedField label="Deployment Key" value={lockedData.access_code} icon={<Key size={16}/>} isDark={isDark} isMono />
                        </div>

                        <div className={`mt-10 p-5 rounded-2xl text-[11px] leading-relaxed font-medium ${isDark ? 'bg-white/5 text-zinc-500' : 'bg-zinc-50 text-zinc-400'}`}>
                            Identity parameters are managed by Novatrum HQ. To update authorized personnel, please initialize a support inquiry.
                        </div>
                    </section>
                </div>

                {/* SAĞ SÜTUN - DÜZENLENEBİLİR ALANLAR */}
                <div className="lg:col-span-8 space-y-10">
                    
                    <section className={`p-8 lg:p-12 rounded-[40px] border transition-all duration-500
                        ${isDark ? 'bg-zinc-900/50 border-white/5 shadow-2xl' : 'bg-white border-black/[0.03] shadow-sm'}`}>
                        
                        <form onSubmit={handleSave} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <InputField 
                                    label="Company / Entity Name" 
                                    value={formData.company_name} 
                                    onChange={(v: string) => setFormData({...formData, company_name: v})}
                                    icon={<Building2 size={16}/>}
                                    placeholder="Enter legal entity name"
                                    isDark={isDark}
                                />
                                <InputField 
                                    label="Phone Number" 
                                    value={formData.phone_number} 
                                    onChange={(v: string) => setFormData({...formData, phone_number: v})}
                                    icon={<Phone size={16}/>}
                                    placeholder="+31 --- --- ---"
                                    isDark={isDark}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">Registered Billing Address</label>
                                <div className="relative group">
                                    <MapPin size={16} className="absolute left-5 top-5 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                                    <textarea 
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        className={`w-full p-5 pl-14 rounded-3xl border outline-none h-32 resize-none transition-all
                                            ${isDark ? 'bg-black/40 border-white/5 focus:border-white/20' : 'bg-zinc-50 border-black/[0.02] focus:border-black/10'}`}
                                        placeholder="Enter full legal address for invoicing..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" disabled={saving}
                                    className={`px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-2xl active:scale-95 disabled:opacity-50
                                        ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                                    {saving ? "Syncing..." : "Update System Data"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* DANGER ZONE */}
                    <section className={`p-8 lg:p-12 rounded-[40px] border border-red-500/10 transition-all duration-500
                        ${isDark ? 'bg-red-500/5 shadow-2xl' : 'bg-red-50/30 shadow-sm'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="max-w-md">
                                <h3 className="text-xl font-medium text-red-600 mb-2">Danger Zone</h3>
                                <p className="text-[12px] text-red-500/70 leading-relaxed font-medium">
                                    Termination requests trigger immediate infrastructure takedown and data purging. This action cannot be reversed.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsTerminateModalOpen(true)}
                                className="px-8 py-4 rounded-2xl bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all active:scale-95">
                                Stop Project
                            </button>
                        </div>
                    </section>
                </div>
            </div>

            {/* TERMINATION MODAL */}
            <AnimatePresence>
                {isTerminateModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-10 backdrop-blur-2xl bg-black/40">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className={`w-full max-w-xl p-8 lg:p-12 rounded-[40px] border shadow-2xl relative ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/[0.05]'}`}>
                            
                            <button onClick={() => setIsTerminateModalOpen(false)} className="absolute top-8 right-8 text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
                                <X size={24} />
                            </button>

                            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mb-8">
                                <AlertTriangle size={32} className="text-red-600" />
                            </div>

                            <h2 className="text-3xl font-light tracking-tighter mb-4 text-red-600">Infrastructure Takedown</h2>
                            <p className={`text-sm mb-10 leading-relaxed font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                You are about to initiate a permanent shutdown. This will destroy all containers, databases, and deployment assets. 
                                <span className="block mt-2 font-bold text-red-600 underline">Irreversible Action.</span>
                            </p>

                            <form onSubmit={handleTerminationSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Reason for stopping</label>
                                    <textarea required value={terminationReason} onChange={e => setTerminationReason(e.target.value)} className={`w-full p-4 rounded-2xl border outline-none h-24 resize-none transition-all ${isDark ? 'bg-black border-white/5 focus:border-red-500' : 'bg-zinc-50 border-black/[0.05] focus:border-red-500'}`} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400 ml-1">Type <span className="text-red-600">TERMINATE</span> to confirm</label>
                                    <input 
                                        required value={terminateConfirmText} onChange={e => setTerminateConfirmText(e.target.value.toUpperCase())}
                                        className={`w-full p-5 rounded-2xl border outline-none font-bold tracking-widest text-center transition-all ${isDark ? 'bg-black border-red-500/20 focus:border-red-500' : 'bg-red-50 border-red-500/20 focus:border-red-500'}`} 
                                        placeholder="TERMINATE"
                                    />
                                </div>
                                <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
                                    <button type="button" onClick={() => setIsTerminateModalOpen(false)} className="flex-1 py-5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Cancel</button>
                                    <button 
                                        type="submit" disabled={isTerminating || terminateConfirmText !== 'TERMINATE'}
                                        className="flex-[2] py-5 rounded-2xl bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-2xl active:scale-95 disabled:opacity-30">
                                        {isTerminating ? "Stopping..." : "Confirm Destruction"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TOAST Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="fixed bottom-32 lg:bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-2xl z-[300]">
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// YARDIMCI BİLEŞENLER (TS HATALARI TEMİZLENMİŞ)

interface LockedFieldProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    isDark: boolean;
    isMono?: boolean;
}

function LockedField({ label, value, icon, isDark, isMono = false }: LockedFieldProps) {
    return (
        <div className="space-y-2 group">
            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 ml-1">{label}</label>
            <div className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-transparent'}`}>
                <div className="text-zinc-500">{icon}</div>
                <span className={`text-[13px] font-bold truncate ${isMono ? 'font-mono tracking-widest text-zinc-400' : ''} ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{value}</span>
            </div>
        </div>
    );
}

interface InputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    icon: React.ReactNode;
    placeholder: string;
    isDark: boolean;
}

function InputField({ label, value, onChange, icon, placeholder, isDark }: InputFieldProps) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors">{icon}</div>
                <input 
                    type="text" value={value} onChange={e => onChange(e.target.value)}
                    className={`w-full p-5 pl-14 rounded-[24px] border outline-none transition-all
                        ${isDark ? 'bg-black/40 border-white/5 focus:border-white/20' : 'bg-zinc-50 border-black/[0.02] focus:border-black/10'}`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}