"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ClientSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState('');
    
    // Form State (Müşterinin düzenleyebileceği alanlar)
    const [formData, setFormData] = useState({
        company_name: '',
        phone_number: '',
        address: ''
    });

    // Kilitli alanlar (Sadece adminin değiştirebileceği, burada sadece gösterilen alanlar)
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
            
            alert("Profile updated successfully.");
            router.push('/client/dashboard'); // Kaydettikten sonra otomatik olarak Hub'a geri döner
        } catch (error: any) {
            alert("Failed to update profile: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-black uppercase tracking-widest text-xs text-zinc-400">Accessing Secure Node...</div>;
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-black p-6 md:p-8 font-sans">
            <div className="max-w-2xl mx-auto pt-10 md:pt-16">
                
                {/* Geri Dönüş Butonu ve Başlık */}
                <div className="mb-12">
                    <button 
                        onClick={() => router.push('/client/dashboard')}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors mb-8"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Hub
                    </button>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Entity Settings</h1>
                    <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mt-2">Manage Profile Data</p>
                </div>

                <form onSubmit={handleSave} className="bg-white border border-zinc-200 p-8 md:p-12 rounded-[30px] md:rounded-[40px] shadow-sm space-y-8">
                    
                    {/* KİLİTLİ ALANLAR */}
                    <div className="space-y-6 pb-8 border-b border-zinc-100">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Identity Details (Locked)</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Full Name</label>
                                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <input type="text" disabled value={clientName} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-xs font-black uppercase text-zinc-400 cursor-not-allowed" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
                                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                </div>
                                <input type="email" disabled value={lockedData.email} className="w-full bg-zinc-50 border border-zinc-100 px-4 py-3 rounded-xl text-xs font-bold text-zinc-400 cursor-not-allowed" />
                            </div>
                        </div>
                        
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Deployment Key</label>
                                <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <input type="text" disabled value={lockedData.access_code} className="w-full bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-xl text-xs font-mono font-bold text-zinc-500 cursor-not-allowed" />
                            <p className="text-[9px] text-zinc-400 font-bold mt-2 uppercase tracking-widest">Contact infrastructure team to request identity changes.</p>
                        </div>
                    </div>

                    {/* DÜZENLENEBİLİR ALANLAR */}
                    <div className="space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Contact & Billing</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Company Name</label>
                                <input 
                                    type="text" 
                                    value={formData.company_name} 
                                    onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
                                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-zinc-400 transition-all" 
                                    placeholder="Enter company name"
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Phone Number</label>
                                <input 
                                    type="tel" 
                                    value={formData.phone_number} 
                                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
                                    className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-zinc-400 transition-all" 
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2 block">Billing Address</label>
                            <textarea 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-zinc-400 transition-all h-24 resize-none" 
                                placeholder="Enter full billing address"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={saving}
                        className="w-full bg-black text-white py-6 rounded-[20px] font-black uppercase tracking-[0.4em] text-xs shadow-xl active:scale-95 transition-all mt-8 disabled:opacity-50"
                    >
                        {saving ? 'UPDATING NODE...' : 'SAVE CHANGES'}
                    </button>
                </form>

            </div>
        </div>
    );
}