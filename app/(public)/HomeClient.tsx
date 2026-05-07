"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import AnnouncementBar from '@/app/components/AnnouncementBar';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const services = [
  {
    num: '01', title: 'Frontend Architecture',
    desc: 'We craft pixel-perfect interfaces with React, Next.js, and Tailwind CSS. Every component is designed for performance, accessibility, and beauty.',
    features: ['React & Next.js', 'Tailwind CSS', 'Motion & Framer', 'Responsive Design', 'SEO Optimized'],
  },
  {
    num: '02', title: 'Custom Software',
    desc: 'From internal tools to SaaS platforms, we build scalable backend systems, APIs, and database architectures that grow with your business.',
    features: ['API Development', 'Database Design', 'SaaS Platforms', 'Supabase & PostgreSQL', 'Maintenance'],
  },
  {
    num: '03', title: 'Technical Consulting',
    desc: 'Get clarity on your tech stack, architecture decisions, and digital strategy. We help startups and enterprises make the right technical moves.',
    features: ['Stack Advisory', 'Architecture Review', 'MVP Planning', 'Code Audit', 'Team Scaling'],
  },
];

const processSteps = [
  { step: '01', title: 'Discovery', desc: 'We dive deep into your business, users, and goals. No assumptions — just clarity.', timeline: 'Week 1' },
  { step: '02', title: 'Architecture', desc: 'We design the system blueprint, choose the tech stack, and create wireframes.', timeline: 'Week 2' },
  { step: '03', title: 'Development', desc: 'We build in transparent sprints with weekly demos. You see progress in real-time.', timeline: 'Weeks 3–8' },
  { step: '04', title: 'Launch & Support', desc: 'We deploy, test thoroughly, and provide 30-day warranty plus optional ongoing support.', timeline: 'Week 9+' },
];

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

  return (
    <div className="w-full bg-white font-sans selection:bg-black selection:text-white">
      <AnnouncementBar />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-40 md:pt-52 pb-32 md:pb-40">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="max-w-3xl space-y-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            {t.hero?.badge || "Premium Software Studio"}
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black leading-[1.05]">
            We engineer digital products that define brands.
          </h1>
          <p className="text-base md:text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
            From startups to enterprises, we build software that's fast, beautiful, and built to last — always with clean code and clear communication.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/services" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
              Explore Services <ArrowRight size={14} />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 border border-zinc-200 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-50 transition-all">
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </section>

      {/* TECH STACK */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 md:py-32"
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-12">
            Built with modern tools
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
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 md:py-32"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-black mb-3">What we do</h2>
            <p className="text-sm text-zinc-400 font-light">Three core services, endlessly adaptable.</p>
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
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 md:py-32"
      >
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-black mb-3">How we work</h2>
            <p className="text-sm text-zinc-400 font-light">Transparent, iterative, on your timeline.</p>
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
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 md:py-32"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-black mb-4">
              Ready to start your project?
            </h2>
            <p className="text-sm text-zinc-400 font-light mb-8 leading-relaxed">
              Tell us about your idea. We'll respond within 24 hours with a clear plan and timeline.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
              Get in Touch <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
