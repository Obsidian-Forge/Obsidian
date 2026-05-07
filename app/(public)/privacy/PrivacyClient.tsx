"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export default function PrivacyPage() {
  const { t } = useLanguage();
  if (!t.privacy) return <div className="min-h-screen bg-white" />;

  const sections = [
    { title: t.privacy.sec1Title, desc: t.privacy.sec1Desc, notice: t.privacy.sec1Notice },
    { title: t.privacy.techAuthTitle, desc: t.privacy.techAuthDesc },
    { 
      title: t.privacy.sec2Title, 
      desc: t.privacy.sec2Desc,
      rules: [t.privacy.rule1, t.privacy.rule2, t.privacy.rule3],
    },
    { title: t.privacy.sec3Title, desc: t.privacy.sec3Desc },
  ];

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">

        {/* Başlık */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">
            {t.privacy.tag}
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">
            {t.privacy.title}
          </h1>
          <p className="text-sm text-zinc-400 font-light mt-3">
            {t.privacy.lastUpdated}
          </p>
        </motion.div>

        {/* İçerik */}
        <div className="space-y-16">
          {sections.map((section, i) => (
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
                <ul className="space-y-3 mt-4">
                  {section.rules.map((rule, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-zinc-500 font-light">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 shrink-0 mt-2" />
                      {rule}
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
            {t.privacy.footerTag}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all"
          >
            {t.privacy.cta || "Get in Touch"} <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}