import React from 'react';
import FadeUp from '../components/FadeUp';
import Link from 'next/link';

export default function ServicesPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 space-y-40 pb-32 overflow-hidden">
      
      {/* Page Header */}
      <FadeUp>
        <div className="text-center space-y-8 max-w-4xl mx-auto mt-10">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white">
            Specialized <span className="text-neutral-500">Solutions.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 font-light leading-relaxed">
            We leverage modern frameworks and scalable architectures to build digital products that perform effortlessly.
          </p>
        </div>
      </FadeUp>

      {/* Detailed Services Grid */}
      <div className="space-y-16">
        
        <FadeUp delay={100}>
          <div className="p-12 md:p-16 rounded-[3rem] bg-gradient-to-br from-neutral-900/50 to-neutral-950 border border-white/5 backdrop-blur-xl flex flex-col md:flex-row gap-12 items-center hover:bg-neutral-900/60 transition-colors">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium tracking-wider text-neutral-300 mb-2">
                01 // Frontend
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Modern Web Applications</h2>
              <p className="text-neutral-400 text-lg leading-relaxed font-light">
                We build blazing fast, interactive, and responsive user interfaces using Next.js and Tailwind CSS. Your users get a seamless experience, and your business gets better engagement metrics.
              </p>
            </div>
            <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[2rem] bg-black/50 border border-white/5 flex items-center justify-center shadow-inner">
              <span className="text-neutral-600 font-medium tracking-widest text-sm">NEXT.JS + TAILWIND</span>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={200}>
          <div className="p-12 md:p-16 rounded-[3rem] bg-gradient-to-bl from-neutral-900/50 to-neutral-950 border border-white/5 backdrop-blur-xl flex flex-col md:flex-row-reverse gap-12 items-center hover:bg-neutral-900/60 transition-colors">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium tracking-wider text-neutral-300 mb-2">
                02 // Backend
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Scalable Databases & Auth</h2>
              <p className="text-neutral-400 text-lg leading-relaxed font-light">
                Using Supabase, we create secure authentication systems and real-time databases. This ensures your data is protected and your application can scale smoothly as your user base grows.
              </p>
            </div>
            <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[2rem] bg-black/50 border border-white/5 flex items-center justify-center shadow-inner">
              <span className="text-neutral-600 font-medium tracking-widest text-sm">SUPABASE</span>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={300}>
          <div className="p-12 md:p-16 rounded-[3rem] bg-gradient-to-tr from-neutral-900/50 to-neutral-950 border border-white/5 backdrop-blur-xl flex flex-col md:flex-row gap-12 items-center hover:bg-neutral-900/60 transition-colors">
            <div className="flex-1 space-y-6">
              <div className="inline-block px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium tracking-wider text-neutral-300 mb-2">
                03 // Hosting & Deployment
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Zero-Downtime Infrastructure</h2>
              <p className="text-neutral-400 text-lg leading-relaxed font-light">
                We deploy your projects via Vercel and Netlify. This serverless approach guarantees maximum uptime, global CDN distribution, and efficient form handling without extra backend code.
              </p>
            </div>
            <div className="w-full md:w-5/12 h-64 md:h-80 rounded-[2rem] bg-black/50 border border-white/5 flex items-center justify-center shadow-inner">
              <span className="text-neutral-600 font-medium tracking-widest text-sm">VERCEL + NETLIFY</span>
            </div>
          </div>
        </FadeUp>

      </div>

      {/* CTA Section */}
      <FadeUp>
        <div className="text-center mt-32 mb-10">
          <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">Ready to build something great?</h3>
          <Link href="/calculator" className="px-12 py-5 bg-white text-black font-bold rounded-xl hover:bg-neutral-300 transition-colors inline-flex items-center gap-3 group cursor-none text-lg">
            Calculate Project Cost
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </FadeUp>

    </main>
  );
}