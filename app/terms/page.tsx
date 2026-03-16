"use client";

import React from 'react';
import FadeUp from '../components/FadeUp';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage(); // Tercüme verilerini çekiyoruz

  return (
    <main className="w-full bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-40 overflow-hidden">
        
        {/* Page Header */}
        <FadeUp>
          <div className="space-y-6 border-b border-zinc-100 pb-12">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black leading-none">
              {t.terms.title} <br />
              <span className="text-zinc-400 italic font-light">{t.terms.subtitle}</span>
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 {t.terms.tag}
               </p>
               <span className="w-1 h-1 bg-zinc-300 rounded-full" />
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 {t.terms.lastUpdated}
               </p>
            </div>
          </div>
        </FadeUp>

        <div className="mt-20 space-y-20 text-left">
          
          {/* 01. Originality */}
          <FadeUp delay={100}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">{t.terms.sec1Title}</h2>
              <div className="space-y-6 text-zinc-500 font-light leading-relaxed">
                <p className="text-lg">
                  {t.terms.sec1Desc}
                </p>
                <div className="p-8 rounded-[24px] bg-zinc-50 border border-zinc-100 text-black text-sm font-medium">
                  {t.terms.sec1Notice}
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 02. Standards */}
          <FadeUp delay={150}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">{t.terms.sec2Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                {t.terms.sec2Desc}
              </p>
              <ul className="space-y-6 text-zinc-500 font-light ml-2 border-l border-zinc-100 pl-6">
                <li className="flex flex-col gap-1">
                  <span className="text-black font-bold uppercase tracking-widest text-[10px]">{t.terms.rule1Title}</span> 
                  {t.terms.rule1Desc}
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-black font-bold uppercase tracking-widest text-[10px]">{t.terms.rule2Title}</span> 
                  {t.terms.rule2Desc}
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-black font-bold uppercase tracking-widest text-[10px]">{t.terms.rule3Title}</span> 
                  {t.terms.rule3Desc}
                </li>
              </ul>
            </section>
          </FadeUp>

          {/* 03. Usage */}
          <FadeUp delay={200}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">{t.terms.sec3Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                {t.terms.sec3Desc}
              </p>
            </section>
          </FadeUp>

          {/* 04. Ownership */}
          <FadeUp delay={250}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">{t.terms.sec4Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                {t.terms.sec4Desc}
              </p>
            </section>
          </FadeUp>

        </div>

        {/* Footer CTA */}
        <FadeUp delay={300}>
          <div className="mt-32 pt-16 border-t border-zinc-100 text-center space-y-8">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">{t.terms.footerTag}</p>
            <Link href="/calculator" className="inline-block px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-800 transition-colors shadow-lg">
              {t.terms.cta}
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}