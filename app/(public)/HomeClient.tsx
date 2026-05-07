"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import AnnouncementBar from '@/app/components/AnnouncementBar';

const techStack = [
  { name: 'Next.js', icon: '/icons/nextjs.svg' },
  { name: 'TypeScript', icon: '/icons/typescript.svg' },
  { name: 'Tailwind CSS', icon: '/icons/tailwind.svg' },
  { name: 'Supabase', icon: '/icons/supabase.svg' },
  { name: 'Vercel', icon: '/icons/vercel.svg' },
  { name: 'React', icon: '/icons/react.svg' },
  { name: 'Node.js', icon: '/icons/nodejs.svg' },
  { name: 'PostgreSQL', icon: '/icons/postgresql.svg' },
];

export default function HomePage() {
  const { t } = useLanguage();
  const h = t.home;

  const services = [
    {
      num: '01',
      title: h.service1Title,
      desc: h.service1Desc,
      features: [h.service1Feat1, h.service1Feat2, h.service1Feat3, h.service1Feat4, h.service1Feat5],
    },
    {
      num: '02',
      title: h.service2Title,
      desc: h.service2Desc,
      features: [h.service2Feat1, h.service2Feat2, h.service2Feat3, h.service2Feat4, h.service2Feat5],
    },
    {
      num: '03',
      title: h.service3Title,
      desc: h.service3Desc,
      features: [h.service3Feat1, h.service3Feat2, h.service3Feat3, h.service3Feat4, h.service3Feat5],
    },
  ];

  const processSteps = [
    { step: '01', title: h.processStep1Title, desc: h.processStep1Desc, timeline: h.processStep1Timeline },
    { step: '02', title: h.processStep2Title, desc: h.processStep2Desc, timeline: h.processStep2Timeline },
    { step: '03', title: h.processStep3Title, desc: h.processStep3Desc, timeline: h.processStep3Timeline },
    { step: '04', title: h.processStep4Title, desc: h.processStep4Desc, timeline: h.processStep4Timeline },
  ];

  return (
    <div className="w-full bg-white font-sans selection:bg-black selection:text-white">
      <AnnouncementBar />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-40 md:pt-52 pb-32 md:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl space-y-8"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            {h.heroBadge}
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.05]">
            {h.heroTitle}
          </h1>
          <p className="text-base md:text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
            {h.heroDesc}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/services" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
              {h.heroBtnServices} <ArrowRight size={14} />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-200 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-50 transition-all">
              {h.heroBtnContact}
            </Link>
          </div>
        </motion.div>
      </section>

      {/* TECH STACK */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-24 md:py-32"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-12">
            {h.techTitle}
          </p>
          <div className="flex flex-wrap justify-center gap-x-14 gap-y-8">
            {techStack.map(tech => (
              <div key={tech.name} className="flex items-center gap-3 text-sm text-zinc-400 font-light hover:text-black transition-colors opacity-60 hover:opacity-100">
                <Image src={tech.icon} alt={tech.name} width={18} height={18} className="shrink-0" />
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SERVICES */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-24 md:py-32"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-black mb-3">{h.servicesTitle}</h2>
            <p className="text-sm text-zinc-400 font-light">{h.servicesSubtitle}</p>
          </div>
          <div className="space-y-8">
            {services.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 md:p-12 rounded-3xl border border-zinc-100 hover:border-zinc-200 transition-all group"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{s.num}</span>
                  <h3 className="text-xl font-light tracking-tight text-black">{s.title}</h3>
                </div>
                <div>
                  <p className="text-sm text-zinc-500 font-light leading-relaxed">{s.desc}</p>
                </div>
                <div>
                  <ul className="space-y-2">
                    {s.features.map(f => (
                      <li key={f} className="text-xs text-zinc-400 font-light flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-zinc-300 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* PROCESS */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-24 md:py-32"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-black mb-3">{h.processTitle}</h2>
            <p className="text-sm text-zinc-400 font-light">{h.processSubtitle}</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-[19px] top-3 bottom-3 w-px bg-zinc-100" />
            <div className="space-y-16">
              {processSteps.map((p, i) => (
                <motion.div
                  key={p.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-white border-2 border-zinc-200 shrink-0 items-center justify-center text-[10px] font-bold text-zinc-400 relative z-10" />
                  <div className="flex-1 space-y-2 pt-0 md:pt-2">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{p.step}</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 bg-zinc-50 px-3 py-1 rounded-full">{p.timeline}</span>
                    </div>
                    <h3 className="text-lg font-light tracking-tight text-black">{p.title}</h3>
                    <p className="text-sm text-zinc-500 font-light leading-relaxed">{p.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-24 md:py-32"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-black mb-4">{h.ctaTitle}</h2>
            <p className="text-sm text-zinc-400 font-light mb-8 leading-relaxed">{h.ctaDesc}</p>
            <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
              {h.ctaBtn} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}