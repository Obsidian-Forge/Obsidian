"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; 
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function ProcessPage() {
  const { t } = useLanguage();
  const pData = t.processPage;

  if (!pData) return <div className="pt-40 text-center text-zinc-500">Loading...</div>;

  return (
    <main className="w-full bg-white min-h-screen relative overflow-hidden">
      
      {/* BACKGROUND GLOWS (Derinlik ve premium his için) */}
      <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-40 overflow-hidden space-y-40 relative z-10">

        {/* Page Header */}
        <FadeUp>
          <div className="text-center space-y-8 max-w-4xl mx-auto mt-10">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-slate-800 to-indigo-900 leading-[1.1] pb-2">
              {pData.title} <br />
              <span className="text-zinc-400 italic font-light">{pData.subtitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              {pData.desc}
            </p>
          </div>
        </FadeUp>

        {/* Process Steps (Premium Timeline) */}
        <div className="space-y-12 relative max-w-5xl mx-auto">
          {/* Sol taraftaki ince bağlantı çizgisi (Renklendirildi) */}
          <div className="hidden md:block absolute left-[3.25rem] top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-indigo-200 to-transparent z-0 opacity-50" />

          {pData.steps.map((step: any, index: number) => (
            <FadeUp key={index} delay={index * 100}>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-16 items-start group">

                {/* Numara Dairesi */}
                <div className="flex-shrink-0 flex md:flex-col items-center gap-6 relative">
                  <div className="w-24 h-24 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 flex items-center justify-center text-3xl font-black text-zinc-300 group-hover:bg-gradient-to-br group-hover:from-zinc-900 group-hover:to-indigo-950 group-hover:text-white group-hover:border-transparent group-hover:shadow-[0_0_30px_rgba(49,46,129,0.3)] transition-all duration-500 shadow-sm z-10">
                    {step.num}
                  </div>
                </div>

                {/* İçerik Kartı (Glassmorphism & Hover Glow) */}
                <div className="flex-1 p-10 md:p-14 rounded-[40px] bg-white/60 backdrop-blur-xl border border-zinc-200/60 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-500 w-full relative overflow-hidden">
                  
                  {/* Kart içi gizli parıltı */}
                  <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="space-y-4 text-left relative z-10">
                    <span className="text-indigo-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                      {step.subtitle}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight group-hover:text-indigo-950 transition-colors">
                      {step.title}
                    </h2>
                    <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-2xl">
                      {step.desc}
                    </p>
                  </div>
                </div>

              </div>
            </FadeUp>
          ))}
        </div>

        {/* CTA Section */}
        <FadeUp>
          <div className="text-center pt-20 border-t border-zinc-100/50 mt-20">
            <h3 className="text-3xl md:text-5xl font-medium text-black mb-10 tracking-tight">{pData.ctaTitle}</h3>
            <Link href="/calculator" className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-zinc-900 to-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:shadow-lg hover:shadow-indigo-900/20 transition-all group cursor-none scale-100 hover:scale-[1.02]">
              {pData.ctaButton}
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}