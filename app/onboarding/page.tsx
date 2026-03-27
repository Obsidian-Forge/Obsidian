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

    // YÜKLEME DURUMU (Tam Ekran)
    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] bg-zinc-50 flex flex-col items-center justify-center font-sans">
                <span className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Verifying Identity Protocol...</p>
            </div>
        );
    }

    // HATA DURUMU (Tam Ekran)
    if (error) {
        return (
            <div className="fixed inset-0 z-[100] bg-zinc-50 flex items-center justify-center font-sans p-6">
                <div className="bg-white p-10 rounded-[32px] border border-red-100 max-w-md w-full text-center shadow-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-zinc-900 mb-2">Access Denied</h2>
                    <p className="text-xs font-bold text-zinc-500 leading-relaxed mb-8">{error}</p>
                    <button onClick={() => router.push('/')} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors w-full">Return Home</button>
                </div>
            </div>
        );
    }

    // ANA SAYFA (Global Header ve Footer'ı gizleyen tam ekran container)
    return (
        <div className="fixed inset-0 z-[100] bg-zinc-50 overflow-y-auto font-sans selection:bg-black selection:text-white">
            <div className="min-h-full flex flex-col items-center justify-center p-6 md:p-12">
                
                <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Novatrum</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">Client Integration Protocol</p>
                </div>

                {step === 2 && (
                    <div className="bg-white w-full max-w-2xl rounded-[40px] border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-zinc-900 p-8 md:p-10 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 relative z-10">Welcome, {discoveryData.client_name.split(' ')[0]}</h2>
                            <p className="text-xs font-bold text-zinc-400 max-w-md mx-auto relative z-10">Please complete your billing and contact profile to initialize your dedicated client environment.</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest block mb-2 ml-1 text-zinc-500">Full Legal Name</label>
                                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold focus:border-black focus:bg-white transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest block mb-2 ml-1 text-zinc-500">Contact Email</label>
                                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold focus:border-black focus:bg-white transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest block mb-2 ml-1 text-zinc-500">Company / Organization</label>
                                    <input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold focus:border-black focus:bg-white transition-colors" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest block mb-2 ml-1 text-zinc-500">Phone Number</label>
                                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold focus:border-black focus:bg-white transition-colors" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest block mb-2 ml-1 text-zinc-500">Full Billing Address</label>
                                    <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, City, Postal Code, Country" className="w-full p-4 rounded-2xl bg-zinc-50 border border-zinc-200 outline-none text-xs font-bold h-24 resize-none focus:border-black focus:bg-white transition-colors" />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-100 mt-8">
                                <button disabled={processing} className="w-full bg-black text-white py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                    {processing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Initialize Client Profile'}
                                </button>
                                <p className="text-[9px] font-bold text-center text-zinc-400 mt-4 uppercase tracking-widest">A unique Deployment Key will be generated upon completion.</p>
                            </div>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div className="bg-white w-full max-w-xl rounded-[40px] border border-zinc-200 shadow-2xl p-10 text-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-zinc-900">Integration Complete</h2>
                        <p className="text-xs font-bold text-zinc-500 leading-relaxed mb-8 max-w-sm mx-auto">
                            Your client profile is active. Please save your dedicated Deployment Key below. You will need this key to access your project dashboard, invoices, and support desk.
                        </p>

                        <div className="bg-zinc-50 border-2 border-zinc-200 p-6 rounded-[24px] mb-8 relative group">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">Your Secure Deployment Key</p>
                            <p className="text-2xl md:text-3xl font-black font-mono tracking-widest text-black select-all mb-4">{generatedKey}</p>
                            
                            <button onClick={copyToClipboard} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm mx-auto flex items-center justify-center gap-2 ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100 border'}`}>
                                {copied ? (
                                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Copied to Clipboard</>
                                ) : (
                                    <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg> Copy Key</>
                                )}
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 py-2 rounded-lg mb-2">⚠ Do not lose this key. Store it securely.</p>
                            <button onClick={() => router.push('/client/login')} className="w-full bg-black text-white py-5 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 active:scale-95 transition-all shadow-xl flex justify-center items-center gap-2">
                                Proceed to Client Portal <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
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
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">Loading Environment...</div>}>
            <OnboardingProcess />
        </Suspense>
    );
}