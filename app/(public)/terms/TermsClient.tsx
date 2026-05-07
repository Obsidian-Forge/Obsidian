"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function TermsPage() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !t.terms) return <div className="min-h-screen bg-white" />;

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">

        {/* Başlık */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">
            {t.terms.tag}
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">
            {t.terms.title}
          </h1>
          <p className="text-sm text-zinc-400 font-light mt-3">
            {t.terms.lastUpdated}
          </p>
        </motion.div>

        {/* İçerik */}
        <div className="space-y-16">
          {[
            { title: t.terms.sec1Title, desc: t.terms.sec1Desc, notice: t.terms.sec1Notice },
            { title: t.terms.sec2Title, desc: t.terms.sec2Desc, rules: [
              { title: t.terms.rule1Title, desc: t.terms.rule1Desc },
              { title: t.terms.rule2Title, desc: t.terms.rule2Desc },
              { title: t.terms.rule3Title, desc: t.terms.rule3Desc },
            ]},
            { title: t.terms.sec3Title, desc: t.terms.sec3Desc },
            { title: t.terms.sec4Title, desc: t.terms.sec4Desc },
          ].map((section, i) => (
            <motion.section
              key={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-lg font-light tracking-tight text-black mb-4">
                {section.title}
              </h2>
              <p className="text-sm text-zinc-500 font-light leading-relaxed mb-4">
                {section.desc}
              </p>

              {section.notice && (
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100 text-sm text-zinc-500 font-light leading-relaxed">
                  {section.notice}
                </div>
              )}

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

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">
            {t.terms.footerTag}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all"
          >
            Get in Touch <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}