"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LegalTermsClient() {
  const { t } = useLanguage();
  const l = t.legal;

  const fallbackSections = [
    { num: '01', title: 'Scope of Work', desc: 'Services are limited to the agreed blueprint.' },
    { num: '02', title: 'Payment Terms', desc: 'Invoices generated via automated system. Payments delayed >14 days pause development.' },
    { num: '03', title: 'Intellectual Property', desc: 'Source code remains Novatrum property until full payment.' },
    { num: '04', title: 'Maintenance & Hosting', desc: 'Client assumes responsibility without a maintenance plan.' },
    { num: '05', title: 'Client Responsibilities', desc: 'Client provides all necessary assets within requested timeframes.' },
    { num: '06', title: 'Limitation of Liability', desc: 'Maximum liability limited to total project amount paid.' },
  ];

  const activeSections = l?.sections?.length ? l.sections : fallbackSections;

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">{l.pageTitle}</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">{l.subtitle}</h1>
          <p className="text-sm text-zinc-400 font-light mt-3">{l.desc}</p>
        </motion.div>
        <div className="space-y-16">
          {activeSections.map((section: any, index: number) => (
            <motion.section key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} className="flex gap-5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0 mt-1">{section.num}</span>
              <div>
                <h2 className="text-base font-light tracking-tight text-black mb-2">{section.title}</h2>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">{section.desc}</p>
              </div>
            </motion.section>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-24 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">{l.footerInfo}</p>
          <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
            {l.footerLink} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}