"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ProcessPage() {
  const { t } = useLanguage();
  const p = t.processPage;

  const steps = [
    { num: '01', title: p.step1Title, desc: p.step1Desc },
    { num: '02', title: p.step2Title, desc: p.step2Desc },
    { num: '03', title: p.step3Title, desc: p.step3Desc },
    { num: '04', title: p.step4Title, desc: p.step4Desc },
  ];

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-32">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 mb-24"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">{p.badge}</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1] max-w-lg">{p.title}</h1>
          <p className="text-sm text-zinc-400 font-light max-w-md leading-relaxed">{p.subtitle}</p>
        </motion.div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col md:flex-row gap-6 md:gap-12 items-start group"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-sm font-light text-zinc-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300">
                {step.num}
              </div>
              <div className="flex-1 space-y-2 pt-1">
                <h3 className="text-xl font-light tracking-tight text-black">{step.title}</h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-xl">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 pt-16 border-t border-zinc-100 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">{p.ctaTitle}</p>
          <Link href="/contact" className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all">
            {p.ctaButton} <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}