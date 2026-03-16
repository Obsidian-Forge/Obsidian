"use client";

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

const CodeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const LayoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white selection:bg-black/10">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8 mt-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-50 border border-zinc-100">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t.hero.badge}</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-[7rem] font-medium tracking-tighter text-black leading-[0.9]">
            {t.hero.title} <br />
            <span className="text-zinc-400">{t.hero.subtitle}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-zinc-500 max-w-xl mx-auto font-light leading-relaxed">
            {t.hero.desc}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/calculator" className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-800 transition-colors">
              {t.hero.ctaStart}
            </Link>
            <Link href="#services" className="px-8 py-4 bg-white text-black border border-zinc-200 font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-50 transition-colors">
              {t.hero.ctaExplore}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-40">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black">{t.services.title}</h2>
            <p className="text-zinc-500 mt-4 font-light">{t.services.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-50 rounded-[32px] p-10 hover:bg-zinc-100 transition-colors flex flex-col justify-between min-h-[350px]">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black"><LayoutIcon /></div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-black">{t.services.frontend.title}</h3>
                <p className="text-zinc-500 font-light leading-relaxed">{t.services.frontend.desc}</p>
              </div>
            </div>
            <div className="bg-zinc-50 rounded-[32px] p-10 hover:bg-zinc-100 transition-colors flex flex-col justify-between min-h-[350px]">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black"><CodeIcon /></div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-black">{t.services.fullstack.title}</h3>
                <p className="text-zinc-500 font-light leading-relaxed">{t.services.fullstack.desc}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. PROCESS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black">{t.process.title}</h2>
            <p className="text-zinc-500 mt-4 font-light">{t.process.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[t.process.step1, t.process.step2, t.process.step3].map((step, i) => (
              <div key={i} className="space-y-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{step.label}</span>
                <h4 className="text-xl font-bold">{step.title}</h4>
                <p className="text-zinc-500 font-light text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. CALCULATOR CTA SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="rounded-[40px] bg-zinc-50 p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 border border-zinc-100">
            <div className="max-w-xl space-y-6 text-left">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.pricing.tag}</span>
              <h2 className="text-4xl md:text-5xl font-medium text-black tracking-tight">{t.pricing.title}</h2>
              <p className="text-zinc-500 font-light leading-relaxed">{t.pricing.desc}</p>
              <ul className="space-y-3 pt-4">
                {[t.pricing.check1, t.pricing.check2, t.pricing.check3].map((check, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-600 font-medium"><CheckIcon /> {check}</li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <Link href="/calculator" className="inline-flex items-center justify-center px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-transform">
                {t.pricing.cta}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. TECH STACK */}
      <section className="max-w-7xl mx-auto px-6 py-40 border-t border-zinc-100">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="mb-16">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.tech.tag}</span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black mt-4">{t.tech.title}</h2>
            <p className="text-zinc-500 mt-4 font-light max-w-xl">{t.tech.desc}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Next.js", desc: t.tech.items.next },
              { name: "TypeScript", desc: t.tech.items.ts },
              { name: "Tailwind CSS", desc: t.tech.items.tailwind },
              { name: "Supabase", desc: t.tech.items.supabase },
              { name: "Vercel", desc: t.tech.items.vercel },
              { name: "Framer Motion", desc: t.tech.items.framer }
            ].map((tech) => (
              <div key={tech.name} className="p-6 rounded-[24px] border border-zinc-100 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <h4 className="font-bold text-black">{tech.name}</h4>
                <p className="text-xs text-zinc-500 mt-2">{tech.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 6. CONTACT FORM */}
      <section className="max-w-3xl mx-auto px-6 py-40">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black">{t.contact.title}</h2>
            <p className="text-zinc-500 mt-4 font-light">{t.contact.subtitle}</p>
          </div>
          <form action="https://api.web3forms.com/submit" method="POST" className="space-y-6">
            <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" name="name" placeholder={t.contact.namePlaceholder} required className="w-full bg-zinc-50 border border-zinc-200 rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors" />
              <input type="email" name="email" placeholder={t.contact.emailPlaceholder} required className="w-full bg-zinc-50 border border-zinc-200 rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors" />
            </div>
            <textarea name="message" rows={5} placeholder={t.contact.messagePlaceholder} required className="w-full bg-zinc-50 border border-zinc-200 rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors resize-none"></textarea>
            <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full py-5 hover:bg-zinc-800 transition-colors">
              {t.contact.button}
            </button>
          </form>
        </motion.div>
      </section>
    </div>
  );
}