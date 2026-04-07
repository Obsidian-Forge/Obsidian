"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function GatewayPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const data = t.gateway;

    if (!data) return <div className="min-h-screen flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-white">Initializing Gateway...</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-rose-500 selection:text-white relative overflow-hidden">
            
            {/* TERTEMİZ SAF BEYAZ ARKA PLAN (Gri/Krem efektler tamamen silindi) */}

            {/* HEADER SECTION */}
            <div className="text-center max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10 pt-10">
                <div className="w-16 h-16 bg-white border border-zinc-200 text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.1] mb-6">
                    {data.title}
                </h1>
                <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-lg mx-auto">
                    {data.subtitle}
                </p>
            </div>

            {/* SELECTION CARDS */}
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 relative z-10">
                
                {/* CARD 1: QUICK ESTIMATE (Pure White / Minimal Style) */}
                <div className="bg-white border border-zinc-200 p-10 md:p-14 rounded-[40px] flex flex-col h-full shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-500 group animate-in fade-in slide-in-from-bottom-8 delay-150">
                    
                    <div className="flex justify-between items-start mb-10">
                        <div className="w-12 h-12 bg-white border border-zinc-200 text-black rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 bg-white border border-zinc-200 px-4 py-2 rounded-full">
                            3 - 5 MINUTES
                        </span>
                    </div>

                    <h2 className="text-3xl font-light tracking-tight mb-4 text-black">{data.opt1Title}</h2>
                    <p className="text-sm font-medium text-zinc-500 leading-relaxed mb-10 flex-1">
                         {data.opt1Desc}
                    </p>

                    <ul className="space-y-5 mb-12 text-xs font-medium text-zinc-600">
                        <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-black rounded-full" /> {data.opt1Feat1}</li>
                        <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-black rounded-full" /> {data.opt1Feat2}</li>
                        <li className="flex items-center gap-4 opacity-50"><span className="w-1.5 h-1.5 bg-transparent border border-zinc-400 rounded-full" /> {data.opt1Feat3}</li>
                    </ul>

                    <button 
                        onClick={() => router.push('/calculator')}
                        className="w-full py-5 rounded-full border border-zinc-200 text-black font-bold uppercase text-[10px] tracking-widest hover:border-black hover:bg-zinc-50 active:scale-[0.98] transition-all mt-auto"
                    >
                        {data.opt1Btn}
                    </button>
                </div>

                {/* CARD 2: DEFINITIVE DISCOVERY (Premium Dark & Rose/Red Style) */}
                <div className="bg-zinc-950 border border-zinc-800 p-10 md:p-14 rounded-[40px] flex flex-col h-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] hover:border-rose-500/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 delay-300 relative overflow-hidden group">
                    
                    {/* Subtle Rose/Red internal gradient orb */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />

                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-rose-300 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-full">
                            6 - 8 MINUTES
                        </span>
                    </div>
                    
                    <h2 className="text-3xl font-light tracking-tight text-white mb-4 relative z-10">{data.opt2Title}</h2>
                    <p className="text-sm font-medium text-zinc-400 leading-relaxed mb-10 flex-1 relative z-10">
                        {data.opt2Desc}
                    </p>

                    <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-6 mb-10 relative z-10">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-rose-400 flex items-center gap-3 mb-2">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {data.opt2NoticeTitle}
                        </p>
                        <p className="text-xs font-medium text-rose-200/60 leading-relaxed">
                            {data.opt2NoticeDesc}
                        </p>
                    </div>

                    <button 
                        onClick={() => router.push('/get-quote')}
                        className="relative z-10 w-full py-5 rounded-full bg-rose-600 text-white font-bold uppercase text-[10px] tracking-widest hover:bg-rose-500 transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(225,29,72,0.3)] mt-auto"
                    >
                        {data.opt2Btn}
                    </button>
                </div>

            </div>

            {/* RETURN HOME LINK */}
            <div className="mt-20 text-center animate-in fade-in duration-1000 delay-500 relative z-10">
                <button onClick={() => router.push('/')} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors px-8 py-3 rounded-full hover:bg-zinc-50 flex items-center gap-3 mx-auto">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    {data.returnHub}
                </button>
            </div>

        </div>
    );
}