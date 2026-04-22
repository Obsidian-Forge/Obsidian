"use client";

import React from 'react';
import FadeUp from '../components/FadeUp';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();

  if (!t.terms) return <div className="min-h-screen bg-white"></div>;

  return (
    <main className="w-full bg-white min-h-screen relative overflow-hidden selection:bg-zinc-900 selection:text-white font-sans">
      
      {/* CLEAN BACKGROUND TEXTURE */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 -z-10" />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-40 relative z-10">
        
        {/* Page Header */}
        <FadeUp>
          <div className="space-y-6 pb-12 border-b border-zinc-100">
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter leading-[1.1] text-black pb-2">
              {t.terms.title} <br />
              <span className="text-zinc-400">{t.terms.subtitle}</span>
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-black font-bold text-[10px] tracking-[0.2em] uppercase bg-zinc-100 px-4 py-2 rounded-full">
                 {t.terms.tag}
               </p>
               <span className="w-1 h-1 bg-zinc-300 rounded-full" />
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 {t.terms.lastUpdated}
               </p>
            </div>
          </div>
        </FadeUp>

        <div className="mt-20 space-y-8 text-left">
          
          {/* 01. Originality */}
          <FadeUp delay={100}>
            <section className="p-10 md:p-14 bg-white border border-zinc-200 hover:bg-zinc-950 hover:border-zinc-950 rounded-[32px] transition-all duration-500 ease-out group shadow-sm hover:shadow-2xl">
              <h2 className="text-3xl font-light text-black group-hover:text-white tracking-tight mb-6 transition-colors duration-500">{t.terms.sec1Title}</h2>
              <div className="space-y-6">
                <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">
                  {t.terms.sec1Desc}
                </p>
                <div className="p-6 md:p-8 rounded-[24px] bg-zinc-50 group-hover:bg-zinc-900 border border-zinc-200 group-hover:border-zinc-800 text-black group-hover:text-white text-sm font-medium leading-relaxed transition-all duration-500">
                  {t.terms.sec1Notice}
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 02. Standards */}
          <FadeUp delay={150}>
            <section className="p-10 md:p-14 bg-white border border-zinc-200 hover:bg-zinc-950 hover:border-zinc-950 rounded-[32px] transition-all duration-500 ease-out group shadow-sm hover:shadow-2xl">
              <h2 className="text-3xl font-light text-black group-hover:text-white tracking-tight mb-6 transition-colors duration-500">{t.terms.sec2Title}</h2>
              <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed mb-8 transition-colors duration-500">
                {t.terms.sec2Desc}
              </p>
              
              <ul className="space-y-8 ml-2 border-l-2 border-zinc-100 group-hover:border-zinc-800 pl-8 transition-colors duration-500">
                <li className="flex flex-col gap-3 relative">
                  <span className="absolute -left-[39px] top-2 w-3 h-3 rounded-full bg-zinc-200 group-hover:bg-zinc-700 transition-colors duration-500" />
                  <span className="text-black group-hover:text-white font-bold uppercase tracking-widest text-[10px] bg-zinc-100 group-hover:bg-zinc-800 px-3 py-1.5 rounded-md w-fit transition-colors duration-500">{t.terms.rule1Title}</span> 
                  <span className="text-sm md:text-base text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">{t.terms.rule1Desc}</span>
                </li>
                <li className="flex flex-col gap-3 relative">
                  <span className="absolute -left-[39px] top-2 w-3 h-3 rounded-full bg-zinc-200 group-hover:bg-zinc-700 transition-colors duration-500" />
                  <span className="text-black group-hover:text-white font-bold uppercase tracking-widest text-[10px] bg-zinc-100 group-hover:bg-zinc-800 px-3 py-1.5 rounded-md w-fit transition-colors duration-500">{t.terms.rule2Title}</span> 
                  <span className="text-sm md:text-base text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">{t.terms.rule2Desc}</span>
                </li>
                <li className="flex flex-col gap-3 relative">
                  <span className="absolute -left-[39px] top-2 w-3 h-3 rounded-full bg-zinc-900 group-hover:bg-white transition-colors duration-500" />
                  <span className="text-black group-hover:text-white font-bold uppercase tracking-widest text-[10px] bg-zinc-100 group-hover:bg-zinc-800 px-3 py-1.5 rounded-md w-fit transition-colors duration-500">{t.terms.rule3Title}</span> 
                  <span className="text-sm md:text-base text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">{t.terms.rule3Desc}</span>
                </li>
              </ul>
            </section>
          </FadeUp>

          {/* 03. Usage */}
          <FadeUp delay={200}>
            <section className="p-10 md:p-14 bg-white border border-zinc-200 hover:bg-zinc-950 hover:border-zinc-950 rounded-[32px] transition-all duration-500 ease-out group shadow-sm hover:shadow-2xl">
              <h2 className="text-3xl font-light text-black group-hover:text-white tracking-tight mb-6 transition-colors duration-500">{t.terms.sec3Title}</h2>
              <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">
                {t.terms.sec3Desc}
              </p>
            </section>
          </FadeUp>

          {/* 04. Ownership */}
          <FadeUp delay={250}>
            <section className="p-10 md:p-14 bg-white border border-zinc-200 hover:bg-zinc-950 hover:border-zinc-950 rounded-[32px] transition-all duration-500 ease-out group shadow-sm hover:shadow-2xl">
              <h2 className="text-3xl font-light text-black group-hover:text-white tracking-tight mb-6 transition-colors duration-500">{t.terms.sec4Title}</h2>
              <p className="text-base md:text-lg text-zinc-500 group-hover:text-zinc-400 font-medium leading-relaxed transition-colors duration-500">
                {t.terms.sec4Desc}
              </p>
            </section>
          </FadeUp>

        </div>

        {/* Footer CTA */}
        <FadeUp delay={300}>
          <div className="mt-32 pt-16 text-center space-y-8 relative z-10 border-t border-zinc-100">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">{t.terms.footerTag}</p>
            <Link 
              href="/gateway"
              className="inline-flex items-center justify-center px-12 py-5 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              {t.terms.cta}
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}