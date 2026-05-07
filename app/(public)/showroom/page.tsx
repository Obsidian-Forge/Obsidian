"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const demos = [
  { name: 'Quantum', descKey: 'demo1Desc', tech: 'Next.js • Three.js • WebGL', path: '/demo/quantum', image: '/showroom/quantum.png' },
  { name: 'Fintech', descKey: 'demo2Desc', tech: 'Next.js • D3.js • Supabase', path: '/demo/fintech', image: '/showroom/fintech.png' },
  { name: 'Logistics', descKey: 'demo3Desc', tech: 'Next.js • Mapbox • WebSocket', path: '/demo/logistics', image: '/showroom/logistics.png' },
  { name: 'Creative', descKey: 'demo4Desc', tech: 'Next.js • Framer Motion • GSAP', path: '/demo/creative', image: '/showroom/creative.png' },
];

export default function ShowroomPage() {
  const { t } = useLanguage();
  const s = t.showroom;

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto px-6 pt-36 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">{s.badge}</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1] max-w-lg">{s.title}</h1>
          <p className="text-sm text-zinc-400 font-light mt-4 max-w-md leading-relaxed">{s.subtitle}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demos.map((demo, i) => (
            <motion.div key={demo.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Link href={demo.path} className="group block rounded-3xl border border-zinc-100 overflow-hidden hover:border-zinc-200 transition-all hover:shadow-sm">
                <div className="aspect-[16/10] bg-zinc-50 relative overflow-hidden">
                  {demo.image ? (
                    <Image src={demo.image} alt={demo.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-6xl font-light tracking-tighter">{demo.name.charAt(0)}</div>
                  )}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={14} className="text-zinc-500" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-light tracking-tight text-black">{demo.name}</h3>
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed mb-3">
                    {(s as any)[demo.descKey]}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-300">{demo.tech}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-24 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">{s.ctaTitle}</p>
          <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
            {s.ctaButton} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}