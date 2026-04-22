"use client";

import React from 'react';
import FadeUp from '../components/FadeUp';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  if (!t.privacy) return <div className="min-h-screen bg-white"></div>;

  return (
    <main className="w-full bg-white min-h-screen relative overflow-hidden selection:bg-zinc-900 selection:text-white font-sans">
      
      {/* CLEAN BACKGROUND TEXTURE */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 -z-10" />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-40 relative z-10">
        
        {/* Page Header */}
        <FadeUp>
          <div className="space-y-6 pb-12 border-b border-zinc-100">
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-[1.1] text-black pb-2">
              {t.privacy.title} <br />
              <span className="text-zinc-400">{t.privacy.subtitle}</span>
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-black font-bold text-[10px] tracking-[0.2em] uppercase bg-zinc-100 px-4 py-2 rounded-full">
                 {t.privacy.tag}
               </p>
               <span className="w-1 h-1 bg-zinc-300 rounded-full" />
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 {t.privacy.lastUpdated}
               </p>
            </div>
          </div>
        </FadeUp>

        <div className="mt-20 space-y-8 text-left">
          
          {/* 01. Data Collection */}
          <FadeUp delay={100}>
            <section className="p-10 md:p-14 bg-white border border-zinc-200 hover:bg-zinc-950 hover:border-zinc-950 rounded-[32px] transition-all duration-500 ease-out group shadow-sm hover:shadow-2xl">
              <h2 className="text-3xl font-light text-black group-hover:text-white tracking-tight mb-6 transition-colors duration-500">{t.privacy.sec1Title}</h2>
              <div className="space-y-6">
                <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">
                  {t.privacy.sec1Desc}
                </p>
                <div className="p-6 md:p-8 rounded-[24px] bg-zinc-50 group-hover:bg-zinc-900 border border-zinc-200 group-hover:border-zinc-800 text-black group-hover:text-white text-sm font-medium leading-relaxed transition-all duration-500">
                  {t.privacy.sec1Notice}
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 02. Technical Authentication */}
          <FadeUp delay={125}>
            <section className="p-10 md:p-14 bg-white border border-zinc-200 hover:bg-zinc-950 hover:border-zinc-950 rounded-[32px] transition-all duration-500 ease-out group shadow-sm hover:shadow-2xl">
              <h2 className="text-3xl font-light text-black group-hover:text-white tracking-tight mb-6 transition-colors duration-500">
                {t.privacy.techAuthTitle}
              </h2>
              <div className="space-y-6">
                <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">
                  {t.privacy.techAuthDesc}
                </p>
              </div>
            </section>
          </FadeUp>

          {/* 03. Communication */}
          <FadeUp delay={150}>
            <section className="p-10 md:p-14 bg-white border border-zinc-200 hover:bg-zinc-950 hover:border-zinc-950 rounded-[32px] transition-all duration-500 ease-out group shadow-sm hover:shadow-2xl">
              <h2 className="text-3xl font-light text-black group-hover:text-white tracking-tight mb-6 transition-colors duration-500">
                {t.privacy.sec2Title}
              </h2>
              <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed mb-8 transition-colors duration-500">
                {t.privacy.sec2Desc}
              </p>
              
              <ul className="space-y-5 ml-2 border-l-2 border-zinc-100 group-hover:border-zinc-800 pl-8 transition-colors duration-500">
                <li className="flex items-center gap-4 relative">
                  <span className="absolute -left-[39px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-200 group-hover:bg-zinc-700 transition-colors duration-500" />
                  <span className="text-sm md:text-base text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">{t.privacy.rule1}</span>
                </li>
                <li className="flex items-center gap-4 relative">
                  <span className="absolute -left-[39px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-200 group-hover:bg-zinc-700 transition-colors duration-500" />
                  <span className="text-sm md:text-base text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">{t.privacy.rule2}</span>
                </li>
                <li className="flex items-center gap-4 relative">
                  <span className="absolute -left-[39px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-900 group-hover:bg-white transition-colors duration-500" />
                  <span className="text-sm md:text-base text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">{t.privacy.rule3}</span>
                </li>
              </ul>
            </section>
          </FadeUp>

          {/* 04. Security */}
          <FadeUp delay={200}>
            <section className="p-10 md:p-14 bg-white border border-zinc-200 hover:bg-zinc-950 hover:border-zinc-950 rounded-[32px] transition-all duration-500 ease-out group shadow-sm hover:shadow-2xl">
              <h2 className="text-3xl font-light text-black group-hover:text-white tracking-tight mb-6 transition-colors duration-500">
                {t.privacy.sec3Title}
              </h2>
              <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">
                {t.privacy.sec3Desc}
              </p>
            </section>
          </FadeUp>

        </div>

        {/* Footer CTA */}
        <FadeUp delay={250}>
          <div className="mt-32 pt-16 text-center space-y-8 relative z-10 border-t border-zinc-100">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">{t.privacy.footerTag}</p>
            <Link href="/contact" className="inline-block px-12 py-6 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-xl">
              {t.privacy.cta}
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}