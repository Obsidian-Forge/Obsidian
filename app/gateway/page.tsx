"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../context/LanguageContext';

export default function GatewayPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const data = t.gateway;

    if (!data) return <div className="min-h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Gateway...</div>;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-rose-500 selection:text-white relative overflow-hidden">
            
            {/* SAF BEYAZ ARKA PLAN VE NOKTALI DOKU */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 -z-10" />

            {/* ÜST BAŞLIK */}
            <div className="text-center max-w-2xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
                <div className="w-16 h-16 bg-zinc-950 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 leading-[1.1] mb-6 uppercase">
                    {data.title}
                </h1>
                <p className="text-lg text-zinc-500 font-bold leading-relaxed max-w-lg mx-auto">
                    {data.subtitle}
                </p>
            </div>

            {/* SEÇİM KARTLARI */}
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative z-10">
                
                {/* KART 1: QUICK ESTIMATE (Endüstriyel Siyah/Beyaz) */}
                <div className="bg-white border-2 border-zinc-100 p-10 md:p-14 rounded-[32px] flex flex-col h-full shadow-sm hover:shadow-xl hover:border-zinc-200 transition-all group animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                    
                    <div className="flex justify-between items-start mb-8">
                        <div className="w-14 h-14 bg-zinc-50 text-zinc-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300 border border-zinc-100">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-100">
                            3 - 5 MINUTES
                        </span>
                    </div>

                    <h2 className="text-3xl font-black tracking-tight mb-4 text-zinc-900 uppercase">{data.opt1Title}</h2>
                    <p className="text-base font-bold text-zinc-500 leading-relaxed mb-8 flex-1">
                        {data.opt1Desc}
                    </p>

                    <ul className="space-y-4 mb-10 text-sm font-bold text-zinc-700">
                        <li className="flex items-center gap-3"><span className="text-zinc-900 font-black">✓</span> {data.opt1Feat1}</li>
                        <li className="flex items-center gap-3"><span className="text-zinc-900 font-black">✓</span> {data.opt1Feat2}</li>
                        <li className="flex items-center gap-3"><span className="text-zinc-300 font-black">~</span> {data.opt1Feat3}</li>
                    </ul>

                    <button 
                        onClick={() => router.push('/calculator')}
                        className="w-full py-5 rounded-full border-2 border-zinc-200 text-zinc-900 font-black uppercase text-[10px] tracking-widest hover:bg-zinc-900 hover:text-white hover:border-zinc-900 active:scale-[0.98] transition-all mt-auto"
                    >
                        {data.opt1Btn}
                    </button>
                </div>

                {/* KART 2: DEFINITIVE DISCOVERY (Rose/Kırmızı Vurgulu) */}
                <div className="bg-zinc-950 border border-zinc-800 p-10 md:p-14 rounded-[32px] flex flex-col h-full shadow-2xl hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 delay-300 relative overflow-hidden group">
                    
                    {/* Arka Plan Kırmızı Işıma (Beyaz zeminde daha belirgin) */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-100 opacity-60" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center border border-rose-500/30 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-300 bg-rose-950/50 px-3 py-1.5 rounded-full border border-rose-500/20">
                            8 - 10 MINUTES
                        </span>
                    </div>
                    
                    <h2 className="text-3xl font-black tracking-tight text-white mb-4 relative z-10 uppercase">{data.opt2Title}</h2>
                    <p className="text-base font-bold text-zinc-400 leading-relaxed mb-8 flex-1 relative z-10">
                        {data.opt2Desc}
                    </p>

                    <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-5 mb-8 relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-400 flex items-center gap-2 mb-2">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {data.opt2NoticeTitle}
                        </p>
                        <p className="text-xs font-bold text-rose-200/70 leading-relaxed italic">
                            {data.opt2NoticeDesc}
                        </p>
                    </div>

                    <button 
                        onClick={() => router.push('/get-quote')}
                        className="relative z-10 w-full py-5 rounded-full bg-rose-500 text-white font-black uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all active:scale-[0.98] shadow-[0_10px_25px_rgba(244,63,94,0.4)]"
                    >
                        {data.opt2Btn}
                    </button>
                </div>

            </div>

            {/* ALT DÖNÜŞ BUTONU */}
            <div className="mt-16 text-center animate-in fade-in duration-1000 delay-500 relative z-10">
                <button onClick={() => router.push('/')} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-950 transition-colors px-8 py-3 rounded-full hover:bg-zinc-50 border border-transparent hover:border-zinc-100">
                    ← {data.returnHub}
                </button>
            </div>

        </div>
    );
}