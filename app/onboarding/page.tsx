"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function OnboardingProcess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [discoveryData, setDiscoveryData] = useState<any>(null);
    const [generatedKey, setGeneratedKey] = useState('');
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        companyName: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setError("Invalid or missing invitation token.");
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('project_discovery')
                    .select('*')
                    .eq('id', token)
                    .eq('status', 'invited')
                    .single();

                if (error || !data) {
                    setError("This invitation is invalid, expired, or has already been used.");
                    setLoading(false);
                    return;
                }

                setDiscoveryData(data);
                
                setFormData({
                    fullName: data.client_name || '',
                    email: data.client_email || '',
                    companyName: data.details?.Company || '',
                    phone: '',
                    address: ''
                });

                setStep(2);
            } catch (err: any) {
                setError("System Error: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const newKey = `NVTR-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const { error: clientError } = await supabase.from('clients').insert({
                full_name: formData.fullName,
                email: formData.email,
                company_name: formData.companyName,
                phone_number: formData.phone,
                address: formData.address,
                access_code: newKey,
            });

            if (clientError) throw clientError;

            const { error: updateError } = await supabase
                .from('project_discovery')
                .update({ status: 'converted' })
                .eq('id', token);

            if (updateError) throw updateError;

            setGeneratedKey(newKey);
            setStep(3);

        } catch (err: any) {
            alert("Failed to create profile: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] bg-zinc-50 flex flex-col items-center justify-center font-sans">
                <span className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Verifying Identity Protocol...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-[100] bg-zinc-50 flex items-center justify-center font-sans p-6">
                <div className="bg-white p-10 rounded-[32px] border border-red-100 max-w-md w-full text-center shadow-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h2 className="text-xl font-light uppercase tracking-tighter text-zinc-900 mb-2">Access Denied</h2>
                    <p className="text-xs font-bold text-zinc-500 leading-relaxed mb-8">{error}</p>
                    <button onClick={() => router.push('/')} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors w-full appearance-none">Return Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-50 overflow-y-auto font-sans selection:bg-black selection:text-white">
            <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12">
                
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl md:text-5xl font-light tracking-tighter uppercase text-zinc-900 leading-none">Novatrum</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-4">Client Integration Protocol</p>
                </div>

                {step === 2 && (
                    <div className="bg-white w-full max-w-2xl rounded-[40px] border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-zinc-950 p-8 md:p-12 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
                            <h2 className="text-2xl md:text-3xl font-light uppercase tracking-tighter mb-2 relative z-10">Welcome, {discoveryData.client_name.split(' ')[0]}</h2>
                            <p className="text-xs font-bold text-zinc-500 max-w-md mx-auto relative z-10 uppercase tracking-widest">Complete profile initialization.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest block ml-1 text-zinc-400">Full Legal Name</label>
                                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-5 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold focus:border-black focus:bg-white transition-all appearance-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest block ml-1 text-zinc-400">Contact Email</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-5 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold focus:border-black focus:bg-white transition-all appearance-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest block ml-1 text-zinc-400">Company / Organization</label>
                                    <input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-5 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold focus:border-black focus:bg-white transition-all appearance-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest block ml-1 text-zinc-400">Phone Number</label>
                                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="w-full p-5 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold focus:border-black focus:bg-white transition-all appearance-none" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-bold uppercase tracking-widest block ml-1 text-zinc-400">Full Billing Address</label>
                                    <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, City, Postal Code, Country" className="w-full p-5 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold h-28 resize-none focus:border-black focus:bg-white transition-all appearance-none" />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-zinc-100">
                                <button disabled={processing} className="w-full bg-black text-white py-6 rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 appearance-none">
                                    {processing ? <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Initializing...</> : 'Initialize Client Profile'}
                                </button>
                                <p className="text-[9px] font-bold text-center text-zinc-400 mt-6 uppercase tracking-widest">A unique Deployment Key will be generated.</p>
                            </div>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-white w-full max-w-xl rounded-[40px] border border-zinc-200 shadow-2xl p-10 md:p-14 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-sm">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-light uppercase tracking-tighter mb-4 text-zinc-900 leading-none">Integration Complete</h2>
                        <p className="text-xs font-bold text-zinc-400 leading-relaxed mb-10 max-w-sm mx-auto uppercase tracking-widest">
                            Your client profile is now active within the Novatrum network.
                        </p>

                        <div className="bg-zinc-50 border-2 border-zinc-100 p-8 rounded-[32px] mb-10 relative group">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Secure Deployment Key</p>
                            <p className="text-xl md:text-2xl font-bold font-mono tracking-[0.2em] text-black select-all mb-6">{generatedKey}</p>
                            
                            <button onClick={copyToClipboard} className={`px-8 py-3.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm mx-auto flex items-center justify-center gap-2 appearance-none ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-zinc-200 text-zinc-500 hover:text-black hover:border-black border'}`}>
                                {copied ? 'Copied to Clipboard' : 'Copy Key'}
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 py-3 rounded-xl mb-2">⚠ Store this key securely. Access is restricted without it.</p>
                            <button onClick={() => router.push('/client/login')} className="w-full bg-black text-white py-6 rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 active:scale-95 transition-all shadow-xl flex justify-center items-center gap-3 appearance-none">
                                Proceed to Client Portal <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold uppercase text-xs tracking-widest text-zinc-400">Loading Environment...</div>}>
            <OnboardingProcess />
        </Suspense>
    );
}