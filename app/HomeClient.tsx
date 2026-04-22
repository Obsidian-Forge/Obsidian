"use client";

import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import Image from 'next/image';
import AnnouncementBar from './components/AnnouncementBar';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const object = Object.fromEntries(formData);

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: 'contact',
          clientName: object.name,
          email: object.email,
          message: object.message
        })
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden bg-white selection:bg-black/10 pb-20 font-sans">

      <AnnouncementBar />
      {/* 1. HERO BANNER SECTION (PURE WHITE LIQUID GLASS) */}
      <section className="px-4 md:px-8 pt-4 md:pt-8">
        <div className="relative w-full min-h-[85vh] rounded-[40px] md:rounded-[60px] bg-zinc-50 border border-zinc-200 overflow-hidden flex flex-col items-center justify-center text-center px-6 py-20 shadow-[0_8px_40px_rgba(0,0,0,0.03)]">

          {/* Liquid animated blobs in the background - GPU Hızlandırmalı */}
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-zinc-200/60 blur-[100px] mix-blend-multiply opacity-50 animate-pulse transform-gpu translate-z-0 will-change-[opacity,transform]" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-zinc-100 blur-[120px] mix-blend-multiply opacity-70 animate-pulse transform-gpu translate-z-0 will-change-[opacity,transform]" style={{ animationDuration: '12s' }} />

          {/* Frosted Glass Overlay - GPU Hızlandırmalı */}
          <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl transform-gpu translate-z-0 will-change-transform"></div>

          <div className="relative z-10 max-w-4xl mx-auto space-y-8 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center px-5 py-2 rounded-full bg-white border border-zinc-200 shadow-sm backdrop-blur-md">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{t.hero.badge}</span>
            </motion.div>

            {/* LCP dostu Framer Motion başlığı */}
            <motion.h1
              initial={{ opacity: 0.9, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-6xl md:text-[7rem] font-light tracking-tighter text-black leading-[0.9]"
            >
              {t.hero.title} <br />
              <span className="text-zinc-300">{t.hero.subtitle}</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed">
              {t.hero.desc}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/gateway" className="px-8 py-4 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:scale-105 hover:bg-zinc-800 transition-all shadow-xl">
                Start Project Discovery
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TECH STACK LOGOS */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">{t.tech.tag}</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale font-light text-xl md:text-2xl tracking-tighter text-black">
          <span>{t.tech.items.next}</span>
          <span>{t.tech.items.ts}</span>
          <span>{t.tech.items.tailwind}</span>
          <span>{t.tech.items.supabase}</span>
          <span>{t.tech.items.vercel}</span>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-20">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12 items-end">
            <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-black flex-1">{t.services.title}</h2>
            <p className="text-zinc-500 text-lg font-medium flex-1 max-w-md lg:mb-2">{t.services.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* FRONTEND ARCHITECTURE: Banner gibi Blurred Glass */}
            <div className="lg:col-span-3 bg-white/60 backdrop-blur-xl border border-zinc-200/80 rounded-[40px] p-10 md:p-14 relative overflow-hidden group h-[400px] flex flex-col justify-between shadow-[0_8px_40px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all">
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-zinc-100 rounded-full blur-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-center text-black mb-6"><LayoutIcon /></div>
                <h3 className="text-4xl font-light tracking-tighter text-black">{t.services.frontend.title}</h3>
              </div>
              <p className="text-zinc-500 font-medium leading-relaxed max-w-sm relative z-10">{t.services.frontend.desc}</p>
            </div>

            {/* FULL-STACK SYSTEMS: Gece Moru & Siyah Gradient */}
            <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-[40px] p-10 md:p-14 relative overflow-hidden group h-[400px] flex flex-col justify-between shadow-2xl hover:shadow-indigo-950/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-indigo-950/80 pointer-events-none"></div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl transition-opacity duration-700 group-hover:opacity-40 pointer-events-none" />
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center text-white mb-6"><CodeIcon /></div>
                <h3 className="text-4xl font-light tracking-tighter text-white">{t.services.fullstack.title}</h3>
              </div>
              <p className="text-indigo-200/70 font-medium leading-relaxed relative z-10">{t.services.fullstack.desc}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. PROCESS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[t.process.step1, t.process.step2, t.process.step3].map((step, i) => (
              <div key={i} className="bg-white border border-zinc-200 rounded-[32px] p-10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-black transition-all flex flex-col justify-between min-h-[300px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{step.label}</span>
                <div className="space-y-4 mt-8">
                  <h4 className="text-3xl font-light tracking-tighter text-black">{step.title}</h4>
                  <p className="text-zinc-500 font-medium leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. CALCULATOR CTA SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

            <div className="flex-1 space-y-8 text-left">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t.pricing.tag}</span>
              <h2 className="text-5xl md:text-7xl font-light text-black tracking-tighter leading-[1.1]">{t.pricing.title}</h2>
              <p className="text-zinc-500 font-medium leading-relaxed text-lg">{t.pricing.desc}</p>
              <ul className="space-y-4 pt-4 border-t border-zinc-100">
                {[t.pricing.check1, t.pricing.check2, t.pricing.check3].map((check, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-800 font-medium">
                    <span className="text-black"><CheckIcon /></span> {check}
                  </li>
                ))}
              </ul>
            </div>

            {/* READY TO BUILD BOX: Gece Moru & Siyah Gradient */}
            <div className="flex-1 w-full bg-zinc-950 border border-zinc-800 rounded-[40px] p-12 md:p-16 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[450px] shadow-2xl group">

              {/* Image Optimizasyonu Eklendi */}
              <div className="absolute inset-0 w-full h-full opacity-10 mix-blend-overlay">
                <Image
                  src="https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2564&auto=format&fit=crop"
                  alt="Novatrum Build"
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/60 to-transparent pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-600/30 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-600/40 transition-colors duration-1000" />

              <div className="relative z-10 space-y-8">
                <h3 className="text-4xl md:text-6xl font-light text-white tracking-tighter">Ready to build?</h3>
                <Link href="/gateway" className="inline-flex items-center justify-center px-10 py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all">
                  Start Project Discovery
                </Link>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 5. CONTACT FORM (Siyah Mor Gradient - Contact Page Uyumu) */}
      <section className="max-w-4xl mx-auto px-6 py-20 relative">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="p-10 md:p-16 rounded-[40px] bg-zinc-950 border border-zinc-800 shadow-2xl min-h-[500px] flex flex-col justify-center relative overflow-hidden group">

            {/* Background Image Optimizasyonu Eklendi */}
            <div className="absolute inset-0 w-full h-full opacity-20 mix-blend-overlay transition-opacity duration-1000 group-hover:opacity-30">
              <Image
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                alt="Novatrum Contact Background"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-indigo-950/30 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />

            <div className="text-center mb-12 relative z-10">
              <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-white">{t.contact.title}</h2>
              <p className="text-zinc-400 mt-4 font-medium">{t.contact.subtitle}</p>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10" suppressHydrationWarning>

                <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold ml-2">{t.contact.namePlaceholder}</label>
                    <input type="text" name="name" required placeholder={t.contact.namePlaceholder} className="w-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm rounded-[24px] px-6 py-5 text-white text-sm focus:border-indigo-400 transition-all outline-none placeholder:text-zinc-500 appearance-none" suppressHydrationWarning />
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold ml-2">{t.contact.emailPlaceholder}</label>
                    <input type="email" name="email" required placeholder={t.contact.emailPlaceholder} className="w-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm rounded-[24px] px-6 py-5 text-white text-sm focus:border-indigo-400 transition-all outline-none placeholder:text-zinc-500 appearance-none" suppressHydrationWarning />
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold ml-2">{t.contact.messagePlaceholder}</label>
                  <textarea name="message" required rows={5} placeholder={t.contact.messagePlaceholder} className="w-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm rounded-[24px] px-6 py-5 text-white text-sm focus:border-indigo-400 transition-all outline-none resize-none placeholder:text-zinc-500 appearance-none" suppressHydrationWarning></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50 appearance-none flex justify-center items-center gap-3"
                  suppressHydrationWarning
                >
                  {isSubmitting ? <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Sending...</> : t.contact.button}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500 relative z-10">
                <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto shadow-xl shadow-white/10">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-4xl font-light tracking-tighter text-white">Message Sent.</h3>
                <p className="text-zinc-400 font-medium leading-relaxed max-w-sm mx-auto">
                  Thank you for reaching out. I have received your message and will get back to you within 24 hours.
                </p>
                <button onClick={() => setIsSuccess(false)} className="mt-8 px-8 py-4 bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-black hover:shadow-md transition-all appearance-none">
                  Send another message
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </section>
    </div>
  );
}