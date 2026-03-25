"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function PriceCalculatorPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const cData = t.calculator;

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selections, setSelections] = useState({
        type: '',
        scale: '',
        design: '',
        content: '',
        timeline: '',
        email: ''
    });
    const [result, setResult] = useState<{ min: number, max: number } | null>(null);

    // Baz Fiyatlar (€)
    const PROJECT_TYPES = [
        { id: "landing", basePrice: 1500 },
        { id: "corporate", basePrice: 3500 },
        { id: "ecommerce", basePrice: 6000 },
        { id: "saas", basePrice: 12000 }
    ];

    const calculateEstimate = () => {
        const type = PROJECT_TYPES.find(opt => opt.id === selections.type);
        if (!type) return { min: 0, max: 0 };

        let multiplier = 1.0;
        if (selections.scale === "medium") multiplier *= 1.4;
        if (selections.scale === "large") multiplier *= 2.0;
        if (selections.design === "premium") multiplier *= 1.3;
        if (selections.design === "worldclass") multiplier *= 1.8;
        if (selections.content === "copywriting") multiplier *= 1.25;
        if (selections.content === "technical") multiplier *= 1.45;
        if (selections.timeline === "rush") multiplier *= 1.4;
        if (selections.timeline === "enterprise") multiplier *= 1.1;

        const base = type.basePrice * multiplier;
        const min = Math.floor(base * 0.9 / 100) * 100;
        const max = Math.floor(base * 1.15 / 100) * 100;
        return { min, max };
    };

    const handleCalculateAndSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const estimate = calculateEstimate();
        setResult(estimate);

        try {
            await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'calculator',
                    email: selections.email,
                    clientName: 'Client',
                    projectType: selections.type,
                    minPrice: estimate.min,
                    maxPrice: estimate.max,
                    currency: 'EUR'
                })
            });
            setCurrentStep(7);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error("Failed to send", error);
            setCurrentStep(7);
        } finally {
            setLoading(false);
        }
    };

    if (!cData) return <div className="pt-40 text-center text-zinc-400 font-mono text-xs uppercase tracking-widest">Loading Architecture...</div>;

    return (
        <div className="min-h-screen bg-white text-black font-sans pb-32 selection:bg-black selection:text-white relative">
            
            {/* SAF BEYAZ ARKA PLAN VE NOKTALI DOKU */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 -z-10" />

            {/* HEADER / NAVIGATION */}
            {currentStep < 7 && (
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100 p-4 md:p-6">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <button onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/gateway')} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full border border-zinc-100 transition-all text-zinc-400 hover:text-black">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </button>
                        <div className="flex-1 mx-4 max-w-xs">
                            <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-black transition-all duration-1000 ease-out" style={{ width: `${(currentStep / 6) * 100}%` }} />
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            STEP {currentStep} / 6
                        </span>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-16 md:pt-24 relative z-10">

                {/* STEP 1: PROJECT TYPE */}
                {currentStep === 1 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">{cData.stepsData[0].title}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed max-w-xl mx-auto">{cData.stepsData[0].subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cData.stepsData[0].options.slice(0, 4).map((opt: any, index: number) => {
                                const optIds = ["landing", "corporate", "ecommerce", "saas"];
                                const isSelected = selections.type === optIds[index];
                                return (
                                    <div key={index} onClick={() => setSelections({...selections, type: optIds[index]})} className={`p-8 rounded-[32px] border-2 transition-all duration-500 group ${isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-300 bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 mb-8 flex items-center justify-center transition-all ${isSelected ? 'border-black bg-black' : 'border-zinc-200 group-hover:border-zinc-400'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <h3 className="text-xl font-black uppercase mb-2 tracking-tight">{opt.label}</h3>
                                        <p className="text-xs font-bold text-zinc-500 leading-relaxed">{opt.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(2)} disabled={!selections.type} className="px-12 py-5 bg-black text-white rounded-full font-black uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 transition-all disabled:opacity-20 flex items-center gap-3 active:scale-95 shadow-xl">
                                {cData.btnNext} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: SCALE / USERS */}
                {currentStep === 2 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">{cData.stepsData[4].title}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">Select the expected user traffic or operational scale.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {["Small (MVP / < 1k users)", "Medium (Growing / < 10k users)", "Enterprise (Global / Unlimited)"].map((label, index) => {
                                const ids = ["small", "medium", "large"];
                                const isSelected = selections.scale === ids[index];
                                return (
                                    <div key={index} onClick={() => setSelections({...selections, scale: ids[index]})} className={`p-7 rounded-[24px] border-2 flex items-center gap-6 transition-all duration-500 ${isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-300 bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-200'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <h3 className="text-lg font-black uppercase tracking-tight">{label}</h3>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(3)} disabled={!selections.scale} className="px-12 py-5 bg-black text-white rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95 shadow-xl">
                                {cData.btnNext}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: CONTENT & SEO */}
                {currentStep === 3 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">{cData.stepsData[3].title}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{cData.stepsData[3].subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {cData.stepsData[3].options.map((opt: any, index: number) => {
                                const ids = ["standard", "copywriting", "technical"];
                                const isSelected = selections.content === ids[index];
                                return (
                                    <div key={index} onClick={() => setSelections({...selections, content: ids[index]})} className={`p-7 rounded-[24px] border-2 flex items-center gap-6 transition-all duration-500 ${isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-300 bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-200'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase tracking-tight">{opt.label}</h3>
                                            <p className="text-xs font-bold text-zinc-500 mt-1">{opt.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(4)} disabled={!selections.content} className="px-12 py-5 bg-black text-white rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95 shadow-xl">
                                {cData.btnNext}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: TIMELINE */}
                {currentStep === 4 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">{cData.stepsData[6].title}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{cData.stepsData[6].subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {cData.stepsData[6].options.map((opt: any, index: number) => {
                                const timelineIds = ["standard", "rush"];
                                const isSaaS = selections.type === "saas";
                                const isSelected = selections.timeline === timelineIds[index];
                                return (
                                    <div key={index} onClick={() => !isSaaS && setSelections({...selections, timeline: timelineIds[index]})} className={`p-7 rounded-[24px] border-2 flex items-center gap-6 transition-all duration-500 ${isSaaS ? 'opacity-20 cursor-not-allowed border-zinc-100 bg-zinc-50' : isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-200 cursor-pointer bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-200'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black uppercase tracking-tight">{opt.label}</h3>
                                            <p className="text-[11px] font-bold text-zinc-500 mt-1">{opt.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {selections.type === "saas" && (
                                <div onClick={() => setSelections({...selections, timeline: 'enterprise'})} className={`p-8 rounded-[32px] border-2 flex items-center gap-6 transition-all duration-500 cursor-pointer mt-4 ${selections.timeline === 'enterprise' ? 'border-rose-500 bg-white shadow-2xl shadow-rose-100' : 'border-zinc-100 bg-zinc-50 hover:border-zinc-900'}`}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selections.timeline === 'enterprise' ? 'border-rose-500 bg-rose-500' : 'border-zinc-200'}`}>
                                        {selections.timeline === 'enterprise' && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black uppercase tracking-tight text-zinc-900">8+ Months (Enterprise Scale)</h3>
                                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-1 italic">Mandatory for complex SaaS architectures</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(5)} disabled={!selections.timeline} className="px-12 py-5 bg-black text-white rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95 shadow-xl">
                                {cData.btnNext}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: DESIGN LEVEL */}
                {currentStep === 5 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">{cData.stepsData[1].title}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{cData.stepsData[1].subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {cData.palettes.slice(0,3).map((opt: any, index: number) => {
                                const designIds = ["standard", "premium", "worldclass"];
                                const isSelected = selections.design === designIds[index];
                                return (
                                    <div key={index} onClick={() => setSelections({...selections, design: designIds[index]})} className={`p-8 rounded-[32px] border-2 cursor-pointer transition-all duration-500 flex items-center gap-8 ${isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-300 bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-200'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase tracking-tight">{opt.name}</h3>
                                            <p className="text-xs font-bold text-zinc-500 mt-1 leading-relaxed">{opt.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(6)} disabled={!selections.design} className="px-12 py-5 bg-black text-white rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95 shadow-xl">
                                {cData.btnNext}
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 6: EMAIL */}
                {currentStep === 6 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">{cData.formEmailLabel}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{cData.formEmailPlace}</p>
                        </div>
                        <form onSubmit={handleCalculateAndSend} className="max-w-md mx-auto space-y-8 p-10 bg-white border-2 border-zinc-100 rounded-[40px] shadow-2xl shadow-zinc-100">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">Secure Transmission Address</label>
                                <input 
                                    type="email" required placeholder="name@company.com" 
                                    value={selections.email} 
                                    onChange={(e) => setSelections({...selections, email: e.target.value})} 
                                    className="w-full bg-zinc-50 border border-zinc-100 p-6 rounded-3xl outline-none text-sm font-bold focus:bg-white focus:border-black transition-all" 
                                />
                            </div>
                            <button 
                                type="submit" disabled={loading || !selections.email}
                                className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl active:scale-[0.98] disabled:opacity-20 flex justify-center items-center gap-3"
                            >
                                {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : cData.btnSend}
                            </button>
                            <p className="text-[9px] text-zinc-400 font-black text-center uppercase tracking-widest opacity-50 italic">{cData.notice}</p>
                        </form>
                    </div>
                )}

                {/* STEP 7: RESULT */}
                {currentStep === 7 && result && (
                    <div className="text-center space-y-12 animate-in zoom-in-95 duration-1000 py-10">
                        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{cData.totalInv}</h2>
                            <div className="p-10 md:p-16 rounded-[48px] bg-white border border-zinc-100 shadow-2xl shadow-zinc-100 max-w-xl mx-auto border-dashed">
                                <p className="text-5xl md:text-7xl font-black font-mono tracking-tighter text-black">
                                    €{result.min.toLocaleString()} <span className="text-zinc-200">-</span> €{result.max.toLocaleString()}
                                </p>
                            </div>
                            <p className="text-zinc-500 font-bold max-w-md mx-auto text-sm leading-relaxed italic">
                                {cData.successDesc} <span className="text-black font-black underline">{selections.email}</span>.
                            </p>
                        </div>
                        <div className="pt-16 max-w-md mx-auto flex flex-col gap-4">
                            <button onClick={() => router.push('/gateway')} className="bg-emerald-500 text-white w-full py-6 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95">
                                {cData.opt2Btn}
                            </button>
                            <button onClick={() => router.push('/')} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 hover:text-black transition-colors py-4">
                                ← {cData.returnHub}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}