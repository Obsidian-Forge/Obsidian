"use client";

import React from 'react';
import FadeUp from '../components/FadeUp';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <main className="w-full bg-white min-h-screen relative overflow-hidden">
      
      {/* BACKGROUND GLOWS (Derinlik ve premium his için) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply" />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-40 relative z-10">
        
        {/* Page Header */}
        <FadeUp>
          <div className="space-y-6 border-b border-zinc-100/50 pb-12">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-slate-800 to-indigo-900 leading-tight pb-2">
              {t.terms.title} <br />
              <span className="text-zinc-400 italic font-light">{t.terms.subtitle}</span>
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-indigo-400 font-bold text-[10px] tracking-[0.2em] uppercase bg-indigo-50/50 px-4 py-2 rounded-full border border-indigo-100/50">
                 {t.terms.tag}
               </p>
               <span className="w-1 h-1 bg-zinc-300 rounded-full" />
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 {t.terms.lastUpdated}
               </p>
            </div>
          </div>
        </FadeUp>

        <div className="mt-20 space-y-12 text-left">
          
          {/* 01. Originality */}
          <FadeUp delay={100}>
            <section className="p-10 md:p-14 bg-white/60 backdrop-blur-xl border border-zinc-200/60 rounded-[40px] shadow-sm hover:shadow-lg hover:shadow-indigo-900/5 hover:bg-white transition-all relative overflow-hidden group">
              {/* Kart içi çok hafif hover efekti */}
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em] mb-6 relative z-10">{t.terms.sec1Title}</h2>
              <div className="space-y-6 text-zinc-500 font-light leading-relaxed relative z-10">
                <p className="text-lg">
                  {t.terms.sec1Desc}
                </p>
                <div className="p-8 rounded-[24px] bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/50 text-indigo-950 text-sm font-medium shadow-inner">
                  {t.terms.sec1Notice}
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 02. Standards */}
          <FadeUp delay={150}>
            <section className="p-10 md:p-14 bg-white/60 backdrop-blur-xl border border-zinc-200/60 rounded-[40px] shadow-sm hover:shadow-lg hover:shadow-indigo-900/5 hover:bg-white transition-all relative overflow-hidden group">
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-purple-50 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em] mb-6 relative z-10">{t.terms.sec2Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed relative z-10 mb-8">
                {t.terms.sec2Desc}
              </p>
              
              <ul className="space-y-8 text-zinc-500 font-light ml-2 border-l border-indigo-100 pl-8 relative z-10">
                <li className="flex flex-col gap-2 relative">
                  <span className="absolute -left-[37px] top-1 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <span className="text-black font-bold uppercase tracking-widest text-[10px] bg-zinc-50 px-3 py-1 rounded-md w-fit border border-zinc-100">{t.terms.rule1Title}</span> 
                  <span className="text-sm md:text-base leading-relaxed">{t.terms.rule1Desc}</span>
                </li>
                <li className="flex flex-col gap-2 relative">
                  <span className="absolute -left-[37px] top-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                  <span className="text-black font-bold uppercase tracking-widest text-[10px] bg-zinc-50 px-3 py-1 rounded-md w-fit border border-zinc-100">{t.terms.rule2Title}</span> 
                  <span className="text-sm md:text-base leading-relaxed">{t.terms.rule2Desc}</span>
                </li>
                <li className="flex flex-col gap-2 relative">
                  <span className="absolute -left-[37px] top-1 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                  <span className="text-black font-bold uppercase tracking-widest text-[10px] bg-zinc-50 px-3 py-1 rounded-md w-fit border border-zinc-100">{t.terms.rule3Title}</span> 
                  <span className="text-sm md:text-base leading-relaxed">{t.terms.rule3Desc}</span>
                </li>
              </ul>
            </section>
          </FadeUp>

          {/* 03. Usage */}
          <FadeUp delay={200}>
            <section className="p-10 md:p-14 bg-white/60 backdrop-blur-xl border border-zinc-200/60 rounded-[40px] shadow-sm hover:shadow-lg hover:shadow-indigo-900/5 hover:bg-white transition-all relative overflow-hidden group">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em] mb-6 relative z-10">{t.terms.sec3Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed relative z-10">
                {t.terms.sec3Desc}
              </p>
            </section>
          </FadeUp>

          {/* 04. Ownership */}
          <FadeUp delay={250}>
            <section className="p-10 md:p-14 bg-white/60 backdrop-blur-xl border border-zinc-200/60 rounded-[40px] shadow-sm hover:shadow-lg hover:shadow-indigo-900/5 hover:bg-white transition-all relative overflow-hidden group">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em] mb-6 relative z-10">{t.terms.sec4Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed relative z-10">
                {t.terms.sec4Desc}
              </p>
            </section>
          </FadeUp>

        </div>

        {/* Footer CTA */}
        <FadeUp delay={300}>
          <div className="mt-32 pt-16 border-t border-zinc-100/50 text-center space-y-8 relative z-10">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">{t.terms.footerTag}</p>
            <Link href="/calculator" className="inline-block px-10 py-5 bg-gradient-to-r from-zinc-900 to-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:shadow-lg hover:shadow-indigo-900/20 transition-all cursor-none scale-100 hover:scale-105">
              {t.terms.cta}
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}