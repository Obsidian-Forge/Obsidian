"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    
    const [formData, setFormData] = useState({
        company_name: '',
        phone_number: '',
        address: ''
    });

    const [lockedData, setLockedData] = useState({
        email: '',
        access_code: ''
    });

    // İptal (Termination) Prosedürü için State'ler
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

    const handleLogout = () => {
        document.cookie = "novatrum_client_key=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict";
        localStorage.removeItem('novatrum_client_id');
        localStorage.removeItem('novatrum_client_name');
        router.push('/client/login');
    };

    useEffect(() => {
        const storedId = localStorage.getItem('novatrum_client_id');
        const storedName = localStorage.getItem('novatrum_client_name');
        
        if (!storedId) {
            router.push('/client/login');
            return;
        }

        setClientId(storedId);
        setClientName(storedName || 'Valued Client');
        fetchClientData(storedId);
    }, [router]);

    const fetchClientData = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
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
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('clients')
                .update({
                    company_name: formData.company_name,
                    phone_number: formData.phone_number,
                    address: formData.address
                })
                .eq('id', clientId);

            if (error) throw error;
            
            showToast("Settings and identity updated successfully.", "success");
        } catch (error: any) {
            showToast("Failed to update profile: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    // İptal İşlemini Veritabanına Yazma, Access Code Silme ve Mail Tetikleme
    const handleTerminationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (terminateConfirmText !== 'TERMINATE') {
            showToast("You must type TERMINATE exactly to confirm.", "error");
            return;
        }

        if (!clientId) return;
        setIsTerminating(true);

        try {
            // 1. İptal talebini veritabanına (termination_requests) yaz
            const { error: requestError } = await supabase
                .from('termination_requests')
                .insert({
                    client_id: clientId,
                    client_name: clientName,
                    reason: terminationReason,
                    status: 'pending'
                });

            if (requestError) throw requestError;

            // 2. Müşterinin Access Code'unu iptal et ki tekrar giriş yapamasın (Hesap DB'de kalır)
            const { error: revokeError } = await supabase
                .from('clients')
                .update({ access_code: 'REVOKED-' + Date.now() })
                .eq('id', clientId);

            if (revokeError) throw revokeError;

            // 3. Arka planda Email API'sine istek at
            // NOT: Bunu Next.js app/api/notify-termination/route.ts içinde Resend veya Nodemailer ile karşılaman gerekir.
            try {
                await fetch('/api/notify-termination', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientName,
                        clientId,
                        reason: terminationReason,
                        email: 'novatrum.hq@gmail.com'
                    })
                });
            } catch (err) {
                console.error("Email notification failed to send:", err);
            }

            // 4. İşlem bitti, müşteriyi bilgilendir ve sistemden at
            setIsTerminateModalOpen(false);
            showToast("Termination successful. Logging out securely...", "success");
            
            // 2 saniye sonra otomatik logout yap
            setTimeout(() => {
                handleLogout();
            }, 2500);

        } catch (error: any) {
            showToast("An error occurred: " + error.message, "error");
            setIsTerminating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mt-6">Accessing Secure Node...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-black font-sans relative overflow-x-hidden selection:bg-black selection:text-white">
            
            {/* GLOBAL TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
                            toast.type === 'success' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-red-50 border-red-200 text-red-600'
                        }`}
                    >
                        {toast.type === 'success' ? (
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FÜTÜRİSTİK BLUEPRINT (TEKNİK ÇİZİM) ARKA PLANI */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_50%,transparent_100%)] bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16">
                
                {/* HEADER */}
                <div className="flex flex-col items-start mb-16 md:mb-20">
                    <button 
                        onClick={() => router.push('/client/dashboard')}
                        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors mb-6 appearance-none"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Hub
                    </button>
                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-4">Configuration Node</p>
                    <h1 className="text-4xl md:text-6xl font-light uppercase tracking-tighter">Entity Settings</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                    
                    {/* SOL SÜTUN - KİLİTLİ BİLGİLER */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white/90 backdrop-blur-xl border border-zinc-200 p-8 rounded-[32px] shadow-sm">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8 border-b border-zinc-100 pb-4">Identity (Locked)</h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Authorized Name</label>
                                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <input type="text" disabled value={clientName} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3.5 rounded-xl text-xs font-bold text-zinc-400 cursor-not-allowed appearance-none" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Secure Email</label>
                                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <input type="email" disabled value={lockedData.email} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3.5 rounded-xl text-xs font-medium text-zinc-400 cursor-not-allowed appearance-none" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Deployment Key</label>
                                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <input type="text" disabled value={lockedData.access_code} className="w-full bg-zinc-100 border border-zinc-200 px-4 py-3.5 rounded-xl text-xs font-mono font-bold tracking-widest text-zinc-500 cursor-not-allowed appearance-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SAĞ SÜTUN - DÜZENLENEBİLİR ALANLAR & TEHLİKELİ BÖLGE */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        <form onSubmit={handleSave} className="bg-white/90 backdrop-blur-xl border border-zinc-200 p-8 md:p-12 rounded-[40px] shadow-sm">
                            <div className="flex justify-between items-center border-b border-zinc-100 pb-4 mb-8">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Contact & Billing Information</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1 block">Company / Entity Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.company_name} 
                                        onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                                        className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" 
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1 block">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone_number} 
                                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
                                        className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" 
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1 block">Registered Billing Address</label>
                                <textarea 
                                    value={formData.address} 
                                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                    className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all h-32 resize-none appearance-none" 
                                    placeholder="Enter full legal billing address..."
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-md active:scale-95 transition-all disabled:opacity-50 appearance-none flex items-center gap-3"
                                >
                                    {saving ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Update Data'}
                                </button>
                            </div>
                        </form>

                        {/* DANGER ZONE - TERMINATION */}
                        <div className="bg-red-50/50 border border-red-100 p-8 md:p-12 rounded-[40px]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h2 className="text-2xl font-light uppercase tracking-tighter text-red-600 mb-2">Danger Zone</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 leading-relaxed max-w-sm">
                                        Request permanent termination of your project. This action triggers immediate architectural takedown and data deletion.
                                    </p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsTerminateModalOpen(true)}
                                    className="bg-red-600 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg hover:bg-red-700 active:scale-95 transition-all shrink-0 appearance-none"
                                >
                                    Stop Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TERMINATION MODAL (POPUP) */}
            <AnimatePresence>
                {isTerminateModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-white/70 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white border border-red-100 shadow-2xl rounded-[32px] p-8 md:p-12 max-w-xl w-full relative"
                        >
                            <button 
                                onClick={() => setIsTerminateModalOpen(false)}
                                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-50 appearance-none"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                            </div>

                            <h2 className="text-3xl font-light tracking-tight text-red-600 mb-2">Project Termination</h2>
                            <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed">
                                You are about to request a permanent shutdown of your infrastructure. This will destroy all associated databases, deployments, and files. 
                                <strong className="text-black ml-1">This action cannot be undone.</strong>
                            </p>

                            <form onSubmit={handleTerminationSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1 block">Reason for Termination (Required)</label>
                                    <textarea 
                                        required
                                        value={terminationReason}
                                        onChange={(e) => setTerminationReason(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all h-24 resize-none appearance-none"
                                        placeholder="Please briefly explain why you are stopping the project..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1 block">
                                        Type <span className="text-red-600 font-black">TERMINATE</span> to confirm
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        value={terminateConfirmText}
                                        onChange={(e) => setTerminateConfirmText(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all appearance-none"
                                        placeholder="TERMINATE"
                                    />
                                </div>

                                <div className="flex flex-col-reverse md:flex-row gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setIsTerminateModalOpen(false)}
                                        className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] text-zinc-500 hover:bg-zinc-50 transition-colors appearance-none"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isTerminating || terminateConfirmText !== 'TERMINATE'}
                                        className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-md hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50 appearance-none flex items-center justify-center gap-3"
                                    >
                                        {isTerminating ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Confirm Termination'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}