"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !t.terms) return <div className="min-h-screen bg-white" />;

  const tm = t.terms;

  const sections = [
    { title: tm.sec1Title, desc: tm.sec1Desc, notice: tm.sec1Notice },
    { title: tm.sec2Title, desc: tm.sec2Desc, rules: [
      { title: tm.rule1Title, desc: tm.rule1Desc },
      { title: tm.rule2Title, desc: tm.rule2Desc },
      { title: tm.rule3Title, desc: tm.rule3Desc },
    ]},
    { title: tm.sec3Title, desc: tm.sec3Desc },
    { title: tm.sec4Title, desc: tm.sec4Desc },
  ];

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">{tm.tag}</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">{tm.title}</h1>
          <p className="text-sm text-zinc-400 font-light mt-3">{tm.lastUpdated}</p>
        </motion.div>
        <div className="space-y-16">
          {sections.map((section, i) => (
            <motion.section key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <h2 className="text-lg font-light tracking-tight text-black mb-4">{section.title}</h2>
              <p className="text-sm text-zinc-500 font-light leading-relaxed mb-4">{section.desc}</p>
              {section.notice && <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm text-zinc-500 font-light leading-relaxed">{section.notice}</div>}
              {section.rules && (
                <ul className="space-y-4 mt-4">
                  {section.rules.map((rule, j) => (
                    <li key={j} className="pl-4 border-l-2 border-zinc-200">
                      <span className="text-xs font-medium text-black uppercase tracking-widest">{rule.title}</span>
                      <p className="text-sm text-zinc-400 font-light mt-1">{rule.desc}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-24 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">{tm.footerTag}</p>
          <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
            {tm.cta} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}