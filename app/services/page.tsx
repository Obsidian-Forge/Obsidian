"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; // Kendi FadeUp bileşenini kullandığını varsayıyorum
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <main className="w-full bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-40 overflow-hidden space-y-40">
        
        {/* Page Header */}
        <FadeUp>
          <div className="text-center space-y-8 max-w-4xl mx-auto mt-10">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-black leading-none">
              Specialized <br/>
              <span className="text-zinc-400 italic font-light">Solutions.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              I leverage modern frameworks and scalable architectures to build digital products that perform effortlessly.
            </p>
          </div>
        </FadeUp>

        {/* Detailed Services Grid */}
        <div className="space-y-16">
          
          {/* Service 01 */}
          <FadeUp delay={100}>
            <div className="p-12 md:p-16 rounded-[48px] bg-zinc-50 border border-zinc-100 flex flex-col md:flex-row gap-12 items-center hover:bg-zinc-100/50 transition-colors group">
              <div className="flex-1 space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                  01 // Frontend
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">Modern Web Applications</h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-light">
                  I build blazing fast, interactive, and responsive user interfaces using Next.js and Tailwind CSS. Your users get a seamless experience, and your business gets better engagement metrics.
                </p>
              </div>
              <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[32px] bg-white border border-zinc-100 flex items-center justify-center shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                <span className="text-zinc-300 font-black tracking-[0.3em] uppercase text-sm">Next.js + Tailwind</span>
              </div>
            </div>
          </FadeUp>

          {/* Service 02 */}
          <FadeUp delay={200}>
            <div className="p-12 md:p-16 rounded-[48px] bg-zinc-50 border border-zinc-100 flex flex-col md:flex-row-reverse gap-12 items-center hover:bg-zinc-100/50 transition-colors group">
              <div className="flex-1 space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                  02 // Backend
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">Scalable Databases & Auth</h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-light">
                  Using Supabase, I create secure authentication systems and real-time databases. This ensures your data is protected and your application can scale smoothly as your user base grows.
                </p>
              </div>
              <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[32px] bg-white border border-zinc-100 flex items-center justify-center shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                <span className="text-zinc-300 font-black tracking-[0.3em] uppercase text-sm">Supabase</span>
              </div>
            </div>
          </FadeUp>

          {/* Service 03 */}
          <FadeUp delay={300}>
            <div className="p-12 md:p-16 rounded-[48px] bg-zinc-50 border border-zinc-100 flex flex-col md:flex-row gap-12 items-center hover:bg-zinc-100/50 transition-colors group">
              <div className="flex-1 space-y-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-zinc-200 text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-2">
                  03 // Deployment
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">Zero-Downtime Infrastructure</h2>
                <p className="text-zinc-500 text-lg leading-relaxed font-light">
                  I deploy your projects via Vercel. This serverless approach guarantees maximum uptime, global CDN distribution, and efficient form handling without extra backend code.
                </p>
              </div>
              <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[32px] bg-white border border-zinc-100 flex items-center justify-center shadow-sm group-hover:scale-[1.02] transition-transform duration-500">
                <span className="text-zinc-300 font-black tracking-[0.3em] uppercase text-sm">Vercel</span>
              </div>
            </div>
          </FadeUp>

        </div>

        {/* CTA Section */}
        <FadeUp>
          <div className="text-center pt-20">
            <h3 className="text-3xl md:text-5xl font-medium text-black mb-10 tracking-tight">Ready to build something great?</h3>
            <Link href="/calculator" className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-800 transition-all shadow-lg shadow-black/10 group cursor-none">
              Calculate Project Cost
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