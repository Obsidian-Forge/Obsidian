"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function ServicesPage() {
  const { t } = useLanguage();
  const s = t.servicesPage;

  const services = [
    {
      num: '01',
      title: s.s1.title,
      desc: s.s1.desc,
      features: s.s1.features,
    },
    {
      num: '02',
      title: s.s2.title,
      desc: s.s2.desc,
      features: s.s2.features,
    },
    {
      num: '03',
      title: s.s3.title,
      desc: s.s3.desc,
      features: s.s3.features,
    },
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
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            {s.badge}
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1] max-w-lg">
            {s.title}
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-md leading-relaxed">
            {s.subtitle}
          </p>
        </motion.div>

        <div className="space-y-24">
          {services.map((service, index) => (
            <motion.div
              key={service.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col md:flex-row gap-6 md:gap-12 items-start group"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-sm font-light text-zinc-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300">
                {service.num}
              </div>

              <div className="flex-1 space-y-4 pt-1">
                <h3 className="text-xl font-light tracking-tight text-black">
                  {service.title}
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
                  {service.desc}
                </p>
                <ul className="space-y-2 pt-2">
                  {service.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-500 font-light">
                      <CheckCircle2 size={13} className="text-zinc-300 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
            {s.ctaTitle}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all"
          >
            {s.ctaButton} <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}