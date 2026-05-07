"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();
  const p = t.privacy;
  if (!p) return <div className="min-h-screen bg-white" />;

  const sections = [
    { title: p.sec1Title, desc: p.sec1Desc, notice: p.sec1Notice },
    { title: p.techAuthTitle, desc: p.techAuthDesc },
    { title: p.sec2Title, desc: p.sec2Desc, rules: [p.rule1, p.rule2, p.rule3] },
    { title: p.sec3Title, desc: p.sec3Desc },
  ];

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">{p.tag}</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">{p.title}</h1>
          <p className="text-sm text-zinc-400 font-light mt-3">{p.lastUpdated}</p>
        </motion.div>
        <div className="space-y-16">
          {sections.map((section, i) => (
            <motion.section key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <h2 className="text-lg font-light tracking-tight text-black mb-4">{section.title}</h2>
              <p className="text-sm text-zinc-500 font-light leading-relaxed mb-4">{section.desc}</p>
              {section.notice && <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm text-zinc-500 font-light leading-relaxed">{section.notice}</div>}
              {section.rules && (
                <ul className="space-y-3 mt-4">
                  {section.rules.map((rule, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-zinc-500 font-light">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0 mt-2" /> {rule}
                    </li>
                  ))}
                </ul>
              )}
            </motion.section>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-24 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">{p.footerTag}</p>
          <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
            {p.cta} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}