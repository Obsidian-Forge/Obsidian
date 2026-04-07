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

    // BAZ FİYATLAR (Yeni "High-Value" Fiyatları)
    const PROJECT_TYPES = [
        { id: "landing", basePrice: 1550 },
        { id: "corporate", basePrice: 2800 },
        { id: "ecommerce", basePrice: 4300 },
        { id: "saas", basePrice: 6300 }
    ];

    const calculateEstimate = () => {
        const type = PROJECT_TYPES.find(opt => opt.id === selections.type);
        if (!type) return { min: 0, max: 0 };

        let multiplier = 1.0;
        if (selections.scale === "medium") multiplier *= 1.3;
        if (selections.scale === "large") multiplier *= 1.7;
        
        if (selections.design === "premium") multiplier *= 1.25;
        if (selections.design === "worldclass") multiplier *= 1.6;
        
        if (selections.content === "copywriting") multiplier *= 1.2;
        if (selections.content === "technical") multiplier *= 1.4;
        
        if (selections.timeline === "rush") multiplier *= 1.3;
        if (selections.timeline === "enterprise") multiplier *= 1.1;

        const base = type.basePrice * multiplier;
        const min = Math.floor(base * 0.85 / 100) * 100;
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
            
            {/* ESKİ TASARIMIN İMZA DOKUSU: NOKTALI ARKA PLAN */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 -z-10" />

            {/* HEADER / NAVIGATION (Border-bottom silindi) */}
            {currentStep < 7 && (
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl p-4 md:p-6 transition-all">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <button onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/gateway')} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full border border-zinc-100 transition-all text-zinc-400 hover:text-black appearance-none shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </button>
                        <div className="flex-1 mx-4 max-w-xs">
                            <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-black transition-all duration-1000 ease-out" style={{ width: `${(currentStep / 6) * 100}%` }} />
                            </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 shrink-0">
                            STEP 0{currentStep} / 06
                        </span>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-16 md:pt-24 relative z-10">

                {/* STEP 1: PROJECT TYPE */}
                {currentStep === 1 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            {/* YENİ PREMIUM FONT KULLANILDI */}
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.1]">{cData.stepsData[0].title}</h1>
                            <p className="text-zinc-500 font-medium mt-4 text-sm md:text-base leading-relaxed max-w-xl mx-auto">{cData.stepsData[0].subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cData.stepsData[0].options.slice(0, 4).map((opt: any, index: number) => {
                                const optIds = ["landing", "corporate", "ecommerce", "saas"];
                                const isSelected = selections.type === optIds[index];
                                return (
                                    <div key={index} onClick={() => setSelections({...selections, type: optIds[index]})} className={`p-8 rounded-[32px] border-2 transition-all duration-500 group cursor-pointer ${isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-300 bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 mb-8 flex items-center justify-center transition-all ${isSelected ? 'border-black bg-black' : 'border-zinc-200 group-hover:border-zinc-400'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <h3 className="text-2xl font-light tracking-tight mb-2 text-black">{opt.label}</h3>
                                        <p className="text-sm font-medium text-zinc-500 leading-relaxed">{opt.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(2)} disabled={!selections.type} className="px-12 py-5 bg-black text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-800 transition-all disabled:opacity-20 flex items-center gap-3 active:scale-95 shadow-xl appearance-none">
                                {cData.btnNext} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: SCALE / USERS */}
                {currentStep === 2 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.1]">{cData.stepsData[4].title}</h1>
                            <p className="text-zinc-500 font-medium mt-4 text-sm md:text-base leading-relaxed">Select the expected user traffic or operational scale.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {["Small (MVP / < 1k users)", "Medium (Growing / < 10k users)", "Enterprise (Global / Unlimited)"].map((label, index) => {
                                const ids = ["small", "medium", "large"];
                                const isSelected = selections.scale === ids[index];
                                return (
                                    <div key={index} onClick={() => setSelections({...selections, scale: ids[index]})} className={`p-7 rounded-[24px] border-2 flex items-center gap-6 cursor-pointer transition-all duration-500 ${isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-300 bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-200'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <h3 className="text-xl font-light tracking-tight text-black">{label}</h3>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(3)} disabled={!selections.scale} className="px-12 py-5 bg-black text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-zinc-800 disabled:opacity-20 active:scale-95 shadow-xl appearance-none flex items-center gap-3">
                                {cData.btnNext} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: CONTENT & SEO */}
                {currentStep === 3 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.1]">{cData.stepsData[3].title}</h1>
                            <p className="text-zinc-500 font-medium mt-4 text-sm md:text-base leading-relaxed">{cData.stepsData[3].subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {cData.stepsData[3].options.map((opt: any, index: number) => {
                                const ids = ["standard", "copywriting", "technical"];
                                const isSelected = selections.content === ids[index];
                                return (
                                    <div key={index} onClick={() => setSelections({...selections, content: ids[index]})} className={`p-7 rounded-[24px] border-2 flex items-center gap-6 cursor-pointer transition-all duration-500 ${isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-300 bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-200'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-light tracking-tight text-black">{opt.label}</h3>
                                            <p className="text-sm font-medium text-zinc-500 mt-1">{opt.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(4)} disabled={!selections.content} className="px-12 py-5 bg-black text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-zinc-800 disabled:opacity-20 active:scale-95 shadow-xl appearance-none flex items-center gap-3">
                                {cData.btnNext} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: TIMELINE */}
                {currentStep === 4 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.1]">{cData.stepsData[6].title}</h1>
                            <p className="text-zinc-500 font-medium mt-4 text-sm md:text-base leading-relaxed">{cData.stepsData[6].subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {cData.stepsData[6].options.map((opt: any, index: number) => {
                                const timelineIds = ["standard", "rush"];
                                const isSaaS = selections.type === "saas";
                                const isSelected = selections.timeline === timelineIds[index];
                                return (
                                    <div key={index} onClick={() => !isSaaS && setSelections({...selections, timeline: timelineIds[index]})} className={`p-7 rounded-[24px] border-2 flex items-center gap-6 transition-all duration-500 ${isSaaS ? 'opacity-20 cursor-not-allowed border-zinc-100 bg-zinc-50 grayscale' : isSelected ? 'border-black bg-white shadow-2xl shadow-zinc-200' : 'border-zinc-100 hover:border-zinc-200 cursor-pointer bg-white/50'}`}>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-200'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-light tracking-tight text-black">{opt.label}</h3>
                                            <p className="text-sm font-medium text-zinc-500 mt-1">{opt.desc}</p>
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
                                        <h3 className="text-xl font-light tracking-tight text-zinc-900">8+ Months (Enterprise Scale)</h3>
                                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-2 italic">Mandatory for complex SaaS architectures</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(5)} disabled={!selections.timeline} className="px-12 py-5 bg-black text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-zinc-800 disabled:opacity-20 active:scale-95 shadow-xl appearance-none flex items-center gap-3">
                                {cData.btnNext} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 5: DESIGN LEVEL */}
                {currentStep === 5 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.1]">{cData.stepsData[1].title}</h1>
                            <p className="text-zinc-500 font-medium mt-4 text-sm md:text-base leading-relaxed">{cData.stepsData[1].subtitle}</p>
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
                                            <h3 className="text-2xl font-light tracking-tight text-black">{opt.name}</h3>
                                            <p className="text-sm font-medium text-zinc-500 mt-1 leading-relaxed">{opt.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-center pt-8">
                            <button onClick={() => setCurrentStep(6)} disabled={!selections.design} className="px-12 py-5 bg-black text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] transition-all hover:bg-zinc-800 disabled:opacity-20 active:scale-95 shadow-xl appearance-none flex items-center gap-3">
                                {cData.btnNext} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 6: EMAIL */}
                {currentStep === 6 && (
                    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.1]">{cData.formEmailLabel}</h1>
                            <p className="text-zinc-500 font-medium mt-4 text-sm md:text-base leading-relaxed">{cData.formEmailPlace}</p>
                        </div>
                        <form onSubmit={handleCalculateAndSend} className="max-w-md mx-auto space-y-8 p-10 bg-white border-2 border-zinc-100 rounded-[40px] shadow-2xl shadow-zinc-100">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-4">Secure Transmission Address</label>
                                <input 
                                    type="email" required placeholder="name@company.com" 
                                    value={selections.email} 
                                    onChange={(e) => setSelections({...selections, email: e.target.value})} 
                                    className="w-full bg-zinc-50 border border-zinc-100 p-6 rounded-3xl outline-none text-base font-medium focus:bg-white focus:border-black transition-all appearance-none" 
                                />
                            </div>
                            <button 
                                type="submit" disabled={loading || !selections.email}
                                className="w-full bg-black text-white py-6 rounded-3xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-20 flex justify-center items-center gap-3 appearance-none"
                            >
                                {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : cData.btnSend}
                            </button>
                            <p className="text-[9px] text-zinc-400 font-bold text-center uppercase tracking-widest opacity-50 italic">{cData.notice}</p>
                        </form>
                    </div>
                )}

                {/* STEP 7: RESULT (WITH BANCONTACT ANIMATION) */}
                {currentStep === 7 && result && (
                    <div className="text-center space-y-12 py-10">
                        
                        {/* Animated Green Checkmark (Sunburst effect) */}
                        <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                            <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0" className="animate-[scalePop_0.6s_ease-out_forwards]" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="animate-[circleDraw_0.6s_ease-out_forwards]" strokeDasharray="260" strokeDashoffset="260" />
                                <path d="M32 50 l12 12 l24 -24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="animate-[checkDraw_0.4s_ease-out_0.5s_forwards]" strokeDasharray="100" strokeDashoffset="100" />
                                <g className="animate-[burst_0.6s_ease-out_0.3s_forwards] opacity-0 origin-center" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                    <line x1="50" y1="2" x2="50" y2="12" />
                                    <line x1="50" y1="98" x2="50" y2="88" />
                                    <line x1="2" y1="50" x2="12" y2="50" />
                                    <line x1="98" y1="50" x2="88" y2="50" />
                                    <line x1="16" y1="16" x2="23" y2="23" />
                                    <line x1="84" y1="84" x2="77" y2="77" />
                                    <line x1="16" y1="84" x2="23" y2="77" />
                                    <line x1="84" y1="16" x2="77" y2="23" />
                                </g>
                            </svg>
                        </div>

                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">{cData.totalInv}</h2>
                            <div className="p-10 md:p-16 rounded-[48px] bg-white border-2 border-zinc-100 shadow-2xl shadow-zinc-100 max-w-xl mx-auto border-dashed">
                                <p className="text-5xl md:text-7xl font-light font-sans tracking-tighter text-black">
                                    €{result.min.toLocaleString()} <span className="text-zinc-200 mx-2">-</span> €{result.max.toLocaleString()}
                                </p>
                            </div>
                            <p className="text-zinc-500 font-medium max-w-md mx-auto text-sm leading-relaxed italic">
                                {cData.successDesc} <span className="text-black font-bold border-b border-black/20 pb-0.5">{selections.email}</span>.
                            </p>
                        </div>

                        <div className="pt-12 max-w-sm mx-auto flex flex-col gap-5 animate-in fade-in duration-700 delay-700">
                            <button onClick={() => router.push('/gateway')} className="bg-emerald-500 text-white w-full py-6 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 appearance-none flex items-center justify-center gap-3">
                                {cData.opt2Btn} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </button>
                            <button onClick={() => router.push('/')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors py-4 appearance-none">
                                ← {cData.returnHub}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Global Keyframes using dangerouslySetInnerHTML to prevent React errors */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes circleDraw {
                    0% { stroke-dashoffset: 260; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes checkDraw {
                    0% { stroke-dashoffset: 100; }
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes scalePop {
                    0% { transform: scale(0.5); opacity: 0; }
                    50% { opacity: 0.15; }
                    100% { transform: scale(1); opacity: 0.05; }
                }
                @keyframes burst {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(1.3); opacity: 0; }
                }
            `}} />
        </div>
    );
}