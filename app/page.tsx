"use client";

import React, { useState } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    formData.append("access_key", "0ca2b8a6-eeb6-4866-841b-ac00ee601416");
    formData.append("subject", "New Inquiry from Obsidian Homepage");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
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
    <div className="w-full bg-white selection:bg-black/10 pb-20">
      
      {/* 1. HERO BANNER SECTION (Referans Görseldeki Gibi İçeride Rounded Banner) */}
      <section className="px-4 md:px-8 pt-4 md:pt-8">
        <div className="relative w-full min-h-[85vh] rounded-[40px] md:rounded-[60px] bg-zinc-950 overflow-hidden flex flex-col items-center justify-center text-center px-6 py-20 shadow-2xl">
          
          {/* Obsidian Konseptli Koyu/Mor Arka Plan Efekti */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-8 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center px-5 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{t.hero.badge}</span>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-6xl md:text-[7rem] font-medium tracking-tighter text-white leading-[0.9]">
              {t.hero.title} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">{t.hero.subtitle}</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg text-zinc-300/80 max-w-xl mx-auto font-light leading-relaxed">
              {t.hero.desc}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link href="/calculator" className="px-8 py-4 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-transform shadow-xl shadow-white/10">
                {t.hero.ctaStart}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TECH STACK LOGOS (Logo Ribbon) */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-center text-[10px] text-zinc-400 uppercase tracking-widest mb-8">{t.tech.tag}</p>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale font-bold text-xl md:text-2xl tracking-tighter text-black">
          <span>{t.tech.items.next}</span>
          <span>{t.tech.items.ts}</span>
          <span>{t.tech.items.tailwind}</span>
          <span>{t.tech.items.supabase}</span>
          <span>{t.tech.items.vercel}</span>
        </div>
      </section>

      {/* 2. WHAT IS USD BLOOM KISMINA BENZEYEN SERVICES SECTION */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-20">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-12 items-end">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight text-black flex-1">{t.services.title}</h2>
            <p className="text-zinc-500 text-lg font-light flex-1 max-w-md lg:mb-2">{t.services.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Geniş, Açık Renk Gradient Kart */}
            <div className="lg:col-span-3 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-[40px] p-10 md:p-14 relative overflow-hidden group h-[400px] flex flex-col justify-between">
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-300 rounded-full blur-3xl opacity-30 transition-opacity duration-700 group-hover:opacity-60" />
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-900 mb-6"><LayoutIcon /></div>
                <h3 className="text-3xl font-bold tracking-tight text-black">{t.services.frontend.title}</h3>
              </div>
              <p className="text-zinc-600 font-light leading-relaxed max-w-sm relative z-10">{t.services.frontend.desc}</p>
            </div>
            
            {/* Dar, Koyu Obsidian Kart */}
            <div className="lg:col-span-2 bg-zinc-950 rounded-[40px] p-10 md:p-14 relative overflow-hidden group h-[400px] flex flex-col justify-between">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 transition-opacity duration-700 group-hover:opacity-40" />
              <div>
                <div className="w-12 h-12 bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center text-white mb-6"><CodeIcon /></div>
                <h3 className="text-3xl font-bold tracking-tight text-white">{t.services.fullstack.title}</h3>
              </div>
              <p className="text-zinc-400 font-light leading-relaxed relative z-10">{t.services.fullstack.desc}</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. PROCESS SECTION (3'lü Bento Grid) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[t.process.step1, t.process.step2, t.process.step3].map((step, i) => (
              <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-[32px] p-10 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex flex-col justify-between min-h-[300px]">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{step.label}</span>
                <div className="space-y-4 mt-8">
                  <h4 className="text-2xl font-bold text-black">{step.title}</h4>
                  <p className="text-zinc-500 font-light leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. USE CASES BENZERİ CALCULATOR CTA SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            
            <div className="flex-1 space-y-8 text-left">
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{t.pricing.tag}</span>
              <h2 className="text-4xl md:text-6xl font-medium text-black tracking-tight leading-[1.1]">{t.pricing.title}</h2>
              <p className="text-zinc-500 font-light leading-relaxed text-lg">{t.pricing.desc}</p>
              <ul className="space-y-4 pt-4 border-t border-zinc-100">
                {[t.pricing.check1, t.pricing.check2, t.pricing.check3].map((check, i) => (
                  <li key={i} className="flex items-center gap-3 text-zinc-800 font-medium">
                    <span className="text-indigo-500"><CheckIcon /></span> {check}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex-1 w-full bg-gradient-to-br from-zinc-900 to-black rounded-[40px] p-12 md:p-16 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[450px] shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/30 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 space-y-8">
                <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Ready to build?</h3>
                <Link href="/calculator" className="inline-flex items-center justify-center px-10 py-5 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-transform">
                  {t.pricing.cta}
                </Link>
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* 5. CONTACT FORM (Sadeleştirilmiş Bento Kart) */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="bg-zinc-50 border border-zinc-100 rounded-[40px] p-10 md:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">{t.contact.title}</h2>
              <p className="text-zinc-500 mt-4 font-light">{t.contact.subtitle}</p>
            </div>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="name" placeholder={t.contact.namePlaceholder} required className="w-full bg-white border border-zinc-200 shadow-sm rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors" suppressHydrationWarning />
                  <input type="email" name="email" placeholder={t.contact.emailPlaceholder} required className="w-full bg-white border border-zinc-200 shadow-sm rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors" suppressHydrationWarning />
                </div>
                <textarea name="message" rows={5} placeholder={t.contact.messagePlaceholder} required className="w-full bg-white border border-zinc-200 shadow-sm rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors resize-none" suppressHydrationWarning></textarea>
                <button type="submit" disabled={isSubmitting} className="w-full bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full py-5 hover:bg-zinc-800 transition-colors disabled:opacity-50" suppressHydrationWarning>
                  {isSubmitting ? "Sending..." : t.contact.button}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6 py-12 animate-in fade-in zoom-in duration-500 bg-white rounded-[32px] p-10 shadow-sm border border-zinc-100">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-3xl font-bold text-black tracking-tight">Message Sent.</h3>
                <p className="text-zinc-500 font-light leading-relaxed max-w-sm mx-auto">
                  Thank you for reaching out. I have received your message and will get back to you within 24 hours.
                </p>
                <button onClick={() => setIsSuccess(false)} className="mt-4 px-6 py-3 bg-zinc-50 border border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-full hover:border-black hover:text-black transition-colors">
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