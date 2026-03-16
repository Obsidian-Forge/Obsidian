"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; // Kendi FadeUp bileşenini kullandığını varsayıyorum
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';
export default function ProcessPage() {
  const { t } = useLanguage();
  const pData = t.processPage;

  // Çeviriler yüklenene kadar sayfanın çökmesini önlemek için güvenlik kontrolü
  if (!pData) return <div className="pt-40 text-center text-zinc-500">Loading...</div>;

  return (
    <main className="w-full bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-40 overflow-hidden space-y-40">

        {/* Page Header */}
        <FadeUp>
          <div className="text-center space-y-8 max-w-4xl mx-auto mt-10">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-black leading-none">
              {pData.title} <br />
              <span className="text-zinc-400 italic font-light">{pData.subtitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              {pData.desc}
            </p>
          </div>
        </FadeUp>

        {/* Process Steps (Timeline) */}
        <div className="space-y-12 relative max-w-5xl mx-auto">
          {/* Sol taraftaki ince bağlantı çizgisi */}
          <div className="hidden md:block absolute left-[3.25rem] top-10 bottom-10 w-px bg-zinc-200 z-0" />

          {pData.steps.map((step: any, index: number) => (
            <FadeUp key={index} delay={index * 100}>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-16 items-start group">

                {/* Numara Dairesi */}
                <div className="flex-shrink-0 flex md:flex-col items-center gap-6 relative">
                  <div className="w-24 h-24 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-3xl font-black text-zinc-300 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-500 shadow-sm z-10">
                    {step.num}
                  </div>
                </div>

                {/* İçerik Kartı */}
                <div className="flex-1 p-10 md:p-14 rounded-[40px] bg-zinc-50 border border-zinc-100 hover:bg-zinc-100/50 transition-colors w-full">
                  <div className="space-y-4 text-left">
                    <span className="text-zinc-400 text-[10px] font-bold tracking-[0.2em] uppercase">
                      {step.subtitle}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
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
          <div className="text-center pt-20">
            <h3 className="text-3xl md:text-5xl font-medium text-black mb-10 tracking-tight">{pData.ctaTitle}</h3>
            <Link href="/calculator" className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 group cursor-none">
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