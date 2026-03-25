"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext'; // Global tema kontrolü

export default function ClientSettingsPage() {
    const { theme, changeTheme } = useTheme(); // Context'ten gelen tema gücü
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    
    const [notifications, setNotifications] = useState(true);
    
    const [formData, setFormData] = useState({
        company_name: '',
        phone_number: '',
        address: ''
    });

    const [lockedData, setLockedData] = useState({
        email: '',
        access_code: ''
    });

    const router = useRouter();

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
            
            alert("Settings updated successfully.");
            router.push('/client/dashboard');
        } catch (error: any) {
            alert("Failed to update profile: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleTerminationRequest = () => {
        const confirm1 = confirm("WARNING: Are you absolutely sure you want to terminate your project?");
        if (confirm1) {
            const confirm2 = confirm("FINAL WARNING: This action cannot be undone. All infrastructure builds, data, and access will be permanently scheduled for deletion. Do you still wish to proceed?");
            if (confirm2) {
                alert("Termination request logged. The infrastructure team will contact you within 24 hours to confirm deletion.");
            }
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 flex items-center justify-center font-black uppercase tracking-widest text-xs text-zinc-400 dark:text-zinc-600 transition-colors duration-500">Accessing Secure Node...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-black dark:text-zinc-100 p-6 md:p-8 font-sans transition-colors duration-500">
            <div className="max-w-4xl mx-auto pt-10 md:pt-16 pb-24">
                
                {/* HEADER */}
                <div className="mb-12">
                    <button 
                        onClick={() => router.push('/client/dashboard')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-8"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Hub
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Entity Settings</h1>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-2">Manage Identity & Preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* SOL SÜTUN - KİLİTLİ BİLGİLER VE DASHBOARD PREFERENCES */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[30px] shadow-sm transition-colors duration-500">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-6">Identity (Locked)</h2>
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Full Name</label>
                                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <input type="text" disabled value={clientName} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 px-4 py-3 rounded-xl text-xs font-black uppercase text-zinc-400 dark:text-zinc-600 cursor-not-allowed transition-colors" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Email Address</label>
                                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <input type="email" disabled value={lockedData.email} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800/50 px-4 py-3 rounded-xl text-xs font-bold text-zinc-400 dark:text-zinc-600 cursor-not-allowed transition-colors" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Deployment Key</label>
                                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                    <input type="text" disabled value={lockedData.access_code} className="w-full bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-xs font-mono font-bold text-zinc-500 dark:text-zinc-600 cursor-not-allowed transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* PANEL TERCİHLERİ */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[30px] shadow-sm transition-colors duration-500">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-6">Dashboard Preferences</h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Interface Theme</p>
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-1">Light or Dark Mode</p>
                                    </div>
                                    <div className="flex bg-zinc-100 dark:bg-zinc-950 rounded-lg p-1 border border-transparent dark:border-zinc-800 transition-colors">
                                        <button 
                                            type="button"
                                            onClick={() => changeTheme('light')} 
                                            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600'}`}
                                        >
                                            Light
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => changeTheme('dark')} 
                                            className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all ${theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-600'}`}
                                        >
                                            Dark
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Email Alerts</p>
                                        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-1">Project & Invoice updates</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setNotifications(!notifications)}
                                        className={`w-10 h-5 rounded-full transition-colors relative flex items-center ${notifications ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-800'}`}
                                    >
                                        <div className={`w-3 h-3 bg-white rounded-full absolute transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* SAĞ SÜTUN - DÜZENLENEBİLİR ALANLAR & TEHLİKELİ BÖLGE */}
                    <div className="lg:col-span-2 space-y-8">
                        <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 md:p-12 rounded-[40px] shadow-sm transition-colors duration-500">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500 mb-8">Contact & Billing Information</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 block">Company Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.company_name} 
                                        onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white dark:focus:bg-black focus:border-zinc-400 dark:focus:border-zinc-600 transition-all" 
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 block">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        value={formData.phone_number} 
                                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white dark:focus:bg-black focus:border-zinc-400 dark:focus:border-zinc-600 transition-all" 
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 block">Billing Address</label>
                                <textarea 
                                    value={formData.address} 
                                    onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white dark:focus:bg-black focus:border-zinc-400 dark:focus:border-zinc-600 transition-all h-32 resize-none" 
                                    placeholder="Enter full billing address"
                                />
                            </div>

                            <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'UPDATING NODE...' : 'SAVE CHANGES'}
                                </button>
                            </div>
                        </form>

                        {/* DANGER ZONE */}
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-8 md:p-12 rounded-[40px] shadow-sm transition-colors duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tighter text-red-600 dark:text-red-500">Danger Zone</h2>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mt-2 leading-relaxed max-w-sm">
                                        Request permanent termination of your project. This action is irreversible and will delete all data.
                                    </p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={handleTerminationRequest}
                                    className="bg-red-600 text-white px-6 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] shadow-lg hover:bg-red-700 active:scale-95 transition-all shrink-0"
                                >
                                    REQUEST TERMINATION
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}