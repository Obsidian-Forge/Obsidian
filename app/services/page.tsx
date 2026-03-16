"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; 
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function ServicesPage() {
  const { t } = useLanguage();
  const sData = t.servicesPage;

  if (!sData) return <div className="pt-40 text-center text-zinc-500">Loading...</div>;

  return (
    <main className="w-full bg-white min-h-screen relative overflow-hidden">
      
      {/* BACKGROUND GLOWS (Derinlik ve premium his için) */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-40 overflow-hidden space-y-40 relative z-10">
        
        {/* Page Header */}
        <FadeUp>
          <div className="text-center space-y-8 max-w-4xl mx-auto mt-10">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-slate-800 to-indigo-900 leading-[1.1] pb-2">
              {sData.title} <br/>
              <span className="text-zinc-400 italic font-light">{sData.subtitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              {sData.desc}
            </p>
          </div>
        </FadeUp>

        {/* Detailed Services Grid */}
        <div className="space-y-16">
          
          {/* Service 01 */}
          <FadeUp delay={100}>
            <div className="p-10 md:p-16 rounded-[48px] bg-white/60 backdrop-blur-xl border border-zinc-200/60 flex flex-col md:flex-row gap-12 items-center hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="flex-1 space-y-6 relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/50 text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-500 mb-2">
                  {sData.s1.tag}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight group-hover:text-indigo-950 transition-colors">{sData.s1.title}</h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-light">
                  {sData.s1.desc}
                </p>
              </div>
              <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[32px] bg-zinc-950 flex items-center justify-center shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                <span className="text-zinc-300 font-black tracking-[0.3em] uppercase text-sm relative z-10 group-hover:text-white transition-colors">{sData.s1.tech}</span>
              </div>
            </div>
          </FadeUp>

          {/* Service 02 */}
          <FadeUp delay={200}>
            <div className="p-10 md:p-16 rounded-[48px] bg-white/60 backdrop-blur-xl border border-zinc-200/60 flex flex-col md:flex-row-reverse gap-12 items-center hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex-1 space-y-6 relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-purple-50 border border-purple-100/50 text-[10px] font-bold tracking-[0.2em] uppercase text-purple-500 mb-2">
                  {sData.s2.tag}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight group-hover:text-indigo-950 transition-colors">{sData.s2.title}</h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-light">
                  {sData.s2.desc}
                </p>
              </div>
              <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[32px] bg-zinc-950 flex items-center justify-center shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                <span className="text-zinc-300 font-black tracking-[0.3em] uppercase text-sm relative z-10 group-hover:text-white transition-colors">{sData.s2.tech}</span>
              </div>
            </div>
          </FadeUp>

          {/* Service 03 */}
          <FadeUp delay={300}>
            <div className="p-10 md:p-16 rounded-[48px] bg-white/60 backdrop-blur-xl border border-zinc-200/60 flex flex-col md:flex-row gap-12 items-center hover:bg-white hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="flex-1 space-y-6 relative z-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-[10px] font-bold tracking-[0.2em] uppercase text-blue-500 mb-2">
                  {sData.s3.tag}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight group-hover:text-indigo-950 transition-colors">{sData.s3.title}</h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-light">
                  {sData.s3.desc}
                </p>
              </div>
              <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[32px] bg-zinc-950 flex items-center justify-center shadow-2xl group-hover:scale-[1.02] transition-transform duration-500 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/20 opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                <span className="text-zinc-300 font-black tracking-[0.3em] uppercase text-sm relative z-10 group-hover:text-white transition-colors">{sData.s3.tech}</span>
              </div>
            </div>
          </FadeUp>

        </div>

        {/* CTA Section */}
        <FadeUp>
          <div className="text-center pt-20 border-t border-zinc-100/50 mt-20">
            <h3 className="text-3xl md:text-5xl font-medium text-black mb-10 tracking-tight">{sData.ctaTitle}</h3>
            <Link href="/calculator" className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-zinc-900 to-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:shadow-lg hover:shadow-indigo-900/20 transition-all group cursor-none scale-100 hover:scale-[1.02]">
              {sData.ctaButton}
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