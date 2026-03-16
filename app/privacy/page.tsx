"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; // Kendi FadeUp bileşenini kullandığını varsayıyorum
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <main className="w-full bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-40 overflow-hidden">
        
        {/* Page Header */}
        <FadeUp>
          <div className="space-y-6 border-b border-zinc-100 pb-12">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black leading-none">
              {t.privacy.title} <br />
              <span className="text-zinc-400 italic font-light">{t.privacy.subtitle}</span>
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 {t.privacy.tag}
               </p>
               <span className="w-1 h-1 bg-zinc-300 rounded-full" />
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 {t.privacy.lastUpdated}
               </p>
            </div>
          </div>
        </FadeUp>

        <div className="mt-20 space-y-20 text-left">
          
          {/* 01. Veri Toplamama Sözü */}
          <FadeUp delay={100}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">{t.privacy.sec1Title}</h2>
              <div className="space-y-6 text-zinc-500 font-light leading-relaxed">
                <p className="text-lg">
                  {t.privacy.sec1Desc}
                </p>
                <div className="p-8 rounded-[24px] bg-zinc-50 border border-zinc-100 text-black text-sm font-medium">
                  {t.privacy.sec1Notice}
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 02. İletişim Formu ve Email */}
          <FadeUp delay={150}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">{t.privacy.sec2Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                {t.privacy.sec2Desc}
              </p>
              <ul className="space-y-4 text-zinc-500 font-light ml-2 border-l border-zinc-100 pl-6">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                  {t.privacy.rule1}
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                  {t.privacy.rule2}
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                  {t.privacy.rule3}
                </li>
              </ul>
            </section>
          </FadeUp>

          {/* 03. Çerez ve Takip Yok */}
          <FadeUp delay={200}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">{t.privacy.sec3Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                {t.privacy.sec3Desc}
              </p>
            </section>
          </FadeUp>

          {/* 04. Güvenlik */}
          <FadeUp delay={250}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">{t.privacy.sec4Title}</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                {t.privacy.sec4Desc}
              </p>
            </section>
          </FadeUp>

        </div>

        {/* Footer CTA */}
        <FadeUp delay={300}>
          <div className="mt-32 pt-16 border-t border-zinc-100 text-center space-y-8">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">{t.privacy.footerTag}</p>
            <Link href="/contact" className="inline-block px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-800 transition-colors shadow-lg">
              {t.privacy.cta}
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}