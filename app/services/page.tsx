"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; 
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function ServicesPage() {
  const { t } = useLanguage();
  const sData = t.servicesPage;

  if (!sData) return <div className="pt-40 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px] min-h-screen">Loading Intelligence...</div>;

  return (
    <main className="w-full bg-white min-h-screen relative overflow-hidden selection:bg-black selection:text-white font-sans">
      
      {/* BACKGROUND (Saf Minimalizm, dot-grid ve çok hafif parıltı) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-20 -z-20" />
      <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-indigo-100/30 rounded-full blur-[180px] pointer-events-none -z-10 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-32 overflow-hidden relative z-10">
        
        {/* PAGE HEADER */}
        <FadeUp>
          <div className="text-center space-y-6 max-w-4xl mx-auto mt-10 mb-28 md:mb-32">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Bespoke Digital Engineering</p>
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.1]">
              {sData.title}
            </h1>
            <div className="w-16 h-[2px] bg-zinc-200 mx-auto mt-8 mb-6" />
            <p className="text-base md:text-lg text-zinc-500 font-medium leading-relaxed max-w-2xl mx-auto">
              {sData.subtitle}
            </p>
          </div>
        </FadeUp>

        {/* SERVICES GRID */}
        <div className="space-y-32 md:space-y-40">
          
          {/* SERVICE 1 - BESPOKE FRONTEND */}
          <FadeUp>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center group">
              <div className="order-2 lg:order-1 space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-3xl font-light text-black group-hover:border-indigo-100 transition-colors duration-500 shadow-sm shrink-0">
                    1
                  </div>
                  <h2 className="text-3xl md:text-5xl font-light text-black tracking-tighter group-hover:text-indigo-950 transition-colors duration-500">{sData.s1.title}</h2>
                </div>
                <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed">{sData.s1.desc}</p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-6 mt-6 border-t border-zinc-100">
                  {sData.s1.features?.map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 text-zinc-600 font-medium group-hover:bg-zinc-50 p-4 rounded-2xl transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0 transition-all duration-500" />
                      <span className="text-sm md:text-base">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Mühendislik Odaklı Görsel Kart (Temiz Mavi Parıltı) */}
              <div className="order-1 lg:order-2 bg-white rounded-[32px] h-[400px] md:h-[500px] flex items-center justify-center border border-zinc-200 transition-all duration-500 relative overflow-hidden group hover:border-zinc-300 hover:shadow-2xl hover:shadow-indigo-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/20 opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-x-8 bottom-8 flex flex-wrap gap-2 z-20">
                    {sData.s1.tech?.split('•').map((tech: string, i: number) => (
                        <span key={i} className="bg-black text-white px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-xl group-hover:bg-indigo-500 transition-colors transform">{tech.trim()}</span>
                    ))}
                </div>
                <div className="w-40 h-40 bg-zinc-50 rounded-2xl border border-zinc-200 shadow-sm group-hover:scale-110 transition-all duration-700 flex items-center justify-center">
                    <svg className="w-16 h-16 text-zinc-300 group-hover:text-indigo-300 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* SERVICE 2 - FULL-STACK (Siyah Konsept - Emerald Vurgu) */}
          <FadeUp>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center group">
              <div className="bg-zinc-950 rounded-[32px] h-[400px] md:h-[500px] flex items-center justify-center shadow-2xl transition-all duration-500 relative overflow-hidden hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)] border border-zinc-800">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-x-8 bottom-8 flex flex-wrap gap-2 z-20">
                    {sData.s2.tech?.split('•').map((tech: string, i: number) => (
                        <span key={i} className="bg-white text-black px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-xl group-hover:bg-emerald-400 transition-colors transform">{tech.trim()}</span>
                    ))}
                </div>
                <div className="w-40 h-40 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-all duration-700 flex items-center justify-center relative overflow-hidden">
                    <svg className="w-16 h-16 text-zinc-700 group-hover:text-emerald-400 transition-colors duration-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-3xl font-light text-black group-hover:border-indigo-100 transition-colors duration-500 shadow-sm shrink-0">
                    2
                  </div>
                  <h2 className="text-3xl md:text-5xl font-light text-black tracking-tighter group-hover:text-indigo-950 transition-colors duration-500">{sData.s2.title}</h2>
                </div>
                <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed">{sData.s2.desc}</p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-6 mt-6 border-t border-zinc-100">
                  {sData.s2.features?.map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 text-zinc-600 font-medium group-hover:bg-zinc-50 p-4 rounded-2xl transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0 transition-all duration-500" />
                      <span className="text-sm md:text-base">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeUp>

          {/* SERVICE 3 - E-COMMERCE */}
          <FadeUp>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center group">
              <div className="order-2 lg:order-1 space-y-6">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200 flex items-center justify-center text-3xl font-light text-black group-hover:border-indigo-100 transition-colors duration-500 shadow-sm shrink-0">
                    3
                  </div>
                  <h2 className="text-3xl md:text-5xl font-light text-black tracking-tighter group-hover:text-indigo-950 transition-colors duration-500">{sData.s3.title}</h2>
                </div>
                <p className="text-zinc-500 text-base md:text-lg font-medium leading-relaxed">{sData.s3.desc}</p>
                
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-6 mt-6 border-t border-zinc-100">
                  {sData.s3.features?.map((feat: string, i: number) => (
                    <li key={i} className="flex items-center gap-4 text-zinc-600 font-medium group-hover:bg-zinc-50 p-4 rounded-2xl transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0 transition-all duration-500" />
                      <span className="text-sm md:text-base">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Soyut Kart İkonu (Karanlık Tema - Indigo Vurgulu) */}
              <div className="order-1 lg:order-2 bg-zinc-950 rounded-[32px] h-[400px] md:h-[500px] flex items-center justify-center shadow-2xl transition-all duration-500 relative overflow-hidden hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)] border border-zinc-800">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-x-8 bottom-8 flex flex-wrap gap-2 z-20">
                    {sData.s3.tech?.split('•').map((tech: string, i: number) => (
                        <span key={i} className="bg-white text-black px-4 py-2 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-xl group-hover:bg-indigo-400 transition-colors transform">{tech.trim()}</span>
                    ))}
                </div>
                <div className="w-40 h-40 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-all duration-700 flex items-center justify-center relative overflow-hidden">
                    <svg className="w-16 h-16 text-zinc-700 group-hover:text-indigo-400 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
              </div>
            </div>
          </FadeUp>

        </div>

        {/* CTA SECTION */}
        <FadeUp>
          <div className="text-center pt-20 mt-28 border-t border-zinc-100">
            <h3 className="text-4xl md:text-6xl font-light tracking-tighter text-black mb-10 leading-[1.1] relative z-10">
              {sData.ctaTitle}
            </h3>
            
            <Link href="/gateway" className="inline-flex items-center gap-4 px-12 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full shadow-xl hover:shadow-indigo-900/20 transition-all group hover:scale-105 active:scale-95">
              {sData.ctaButton}
              <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}