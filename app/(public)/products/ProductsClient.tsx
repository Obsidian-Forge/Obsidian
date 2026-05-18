"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Globe, Building2, ShoppingCart, Store, Wrench, Search, Palette, Code2, Shield, Zap, Clock, Brain, Fingerprint, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductsClient() {
  const { t } = useLanguage();
  const p = t.productsPage;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const websites = [
    { key: 'landing', icon: Globe },
    { key: 'corporate', icon: Building2 },
    { key: 'ecommerce', icon: ShoppingCart },
    { key: 'saas', icon: Store },
  ];

  const maintenancePlans = [
    { key: 'basic', icon: Shield, highlight: false },
    { key: 'pro', icon: Wrench, highlight: true },
    { key: 'enterprise', icon: Zap, highlight: false },
  ];

  const upcomingSoftware = [
    {
      name: "NEXUS CRM",
      tagline: "AI-Powered Customer Intelligence",
      desc: "Predict customer behavior, detect churn risks, and automate follow-ups with AI-driven insights. Built on Groq AI.",
      tech: "Next.js • Groq API • Supabase",
      icon: Brain,
    },
    {
      name: "VAULT PASS",
      tagline: "Passwordless Authentication",
      desc: "Replace passwords with passkeys, biometrics, and QR-code login. Zero-knowledge architecture. Enterprise-grade security.",
      tech: "Next.js • WebAuthn • Supabase",
      icon: Fingerprint,
    },
    {
      name: "PULSE",
      tagline: "Real-Time Business Monitor",
      desc: "Live dashboard with real-time data streaming, AI anomaly detection, and instant alerts. Monitor your business from anywhere.",
      tech: "Next.js • Supabase Realtime • Groq API",
      icon: Activity,
    }
  ];

  const addOns = [
    { key: 'seo', icon: Search },
    { key: 'ui', icon: Palette },
    { key: 'custom', icon: Code2 },
  ];

  return (
    <>
      {/* ================================================================ */}
      {/* SPLASH SCREEN */}
      {/* ================================================================ */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-white flex items-center justify-center overflow-hidden"
          >
            <div className="relative flex items-center">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Image
                  src="/logo.png"
                  alt="Novatrum"
                  width={56}
                  height={56}
                  className="object-contain"
                  priority
                />
              </motion.div>

              {/* Novatrum text - expands to the right */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.7, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap"
              >
                <span className="text-2xl md:text-3xl font-bold tracking-[0.3em] uppercase text-black ml-4">
                  Novatrum
                </span>
              </motion.div>
            </div>

            {/* Bottom Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute bottom-12 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400"
            >
              {p.heroTag}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================ */}
      {/* MAIN CONTENT */}
      {/* ================================================================ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
          <div className="max-w-6xl mx-auto px-6 pt-32 pb-32">

            {/* HEADER */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mb-24"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">{p.heroTag}</p>
              <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-black leading-[1.05]">{p.heroTitleLine1}</h1>
              <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-zinc-300 leading-[1.05] mt-1">{p.heroTitleLine2}</h2>
              <p className="text-sm text-zinc-500 font-light mt-6 max-w-md mx-auto leading-relaxed">{p.heroDesc}</p>
            </motion.div>

            {/* SECTION 1: WEBSITE TYPES */}
            <section className="mb-24">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8 text-center">{p.websitesTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {websites.map((web, i) => {
                  const data = (p as any)[web.key];
                  return (
                    <motion.div
                      key={web.key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className="group relative p-5 rounded-3xl border border-zinc-100 hover:border-zinc-300 hover:shadow-lg transition-all duration-300 flex flex-col"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-black group-hover:text-white transition-all duration-300 mb-4">
                        <web.icon size={20} strokeWidth={1.5} />
                      </div>
                      <div className="mb-3">
                        <h3 className="text-sm font-light tracking-tight text-black">{data?.name}</h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">{data?.tagline}</p>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-light leading-relaxed mb-4 flex-1">{data?.description}</p>
                      <div className="pt-4 border-t border-zinc-100">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-light text-black leading-tight">{data?.price}</span>
                          <Link href="/contact" className="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all shrink-0">
                            {p.btnRequest} <ArrowRight size={11} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: MAINTENANCE PACKAGES */}
            <section className="mb-24 pt-8 border-t border-zinc-100">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8 text-center">{p.maintenanceTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {maintenancePlans.map((plan, i) => {
                  const data = (p as any)[plan.key];
                  const features = [data?.feature1, data?.feature2, data?.feature3, data?.feature4].filter(Boolean);
                  return (
                    <motion.div
                      key={plan.key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className={`relative p-6 rounded-3xl border transition-all duration-300 flex flex-col ${
                        plan.highlight ? 'border-black shadow-lg bg-zinc-50' : 'border-zinc-100 hover:border-zinc-300 hover:shadow-lg'
                      }`}
                    >
                      {plan.highlight && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                          {p.mostPopular}
                        </span>
                      )}
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-black group-hover:text-white transition-all duration-300 mb-4">
                        <plan.icon size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-light tracking-tight text-black mb-1">{data?.name}</h3>
                      <p className="text-2xl font-light text-black mb-1">{data?.price}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">{data?.tagline}</p>
                      <ul className="space-y-2 mb-6 flex-1">
                        {features.map((f: string, j: number) => (
                          <li key={j} className="flex items-center gap-2 text-[11px] text-zinc-500 font-light">
                            <CheckCircle2 size={12} className="text-zinc-300 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Link href="/contact" className={`block text-center py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                        plan.highlight ? 'bg-black text-white hover:bg-zinc-800' : 'border border-zinc-200 text-black hover:bg-zinc-50'
                      }`}>
                        {p.btnRequest}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: SOFTWARE & APPS (NEW SECTION) */}
            <section className="mb-24 pt-8 border-t border-zinc-100">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8 text-center">Software & Apps</h2>
              <div className="max-w-4xl mx-auto flex flex-col gap-4">
                {upcomingSoftware.map((software, i) => (
                  <motion.div
                    key={software.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 rounded-3xl border border-zinc-100 bg-white hover:border-zinc-300 hover:shadow-md transition-all duration-300"
                  >
                    {/* Left: Icon */}
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-black group-hover:text-white transition-all duration-300">
                      <software.icon size={22} strokeWidth={1.5} />
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3 mb-2">
                        <h3 className="text-base font-light tracking-tight text-black">{software.name}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hidden md:inline-block">—</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{software.tagline}</span>
                      </div>
                      <p className="text-xs text-zinc-500 font-light leading-relaxed mb-3 max-w-2xl">
                        {software.desc}
                      </p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                        {software.tech}
                      </p>
                    </div>

                    {/* Right: Badge */}
                    <div className="shrink-0 mt-4 md:mt-0">
                      <span className="inline-flex items-center justify-center px-4 py-2 bg-zinc-50 border border-zinc-200 text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full group-hover:bg-zinc-100 transition-colors">
                        Coming Soon
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* SECTION 4: ADD-ON SERVICES */}
            <section className="pt-8 border-t border-zinc-100">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-8 text-center">{p.servicesTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
                {addOns.map((svc, i) => {
                  const data = (p as any)[svc.key];
                  return (
                    <motion.div
                      key={svc.key}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className="group relative p-6 rounded-3xl border border-zinc-100 hover:border-zinc-300 hover:shadow-lg transition-all duration-300 text-center flex flex-col"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-black group-hover:text-white transition-all duration-300 mx-auto mb-4">
                        <svc.icon size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-sm font-light tracking-tight text-black mb-1">{data?.name}</h3>
                      <p className="text-[11px] text-zinc-500 font-light leading-relaxed mb-4 flex-1">{data?.description}</p>
                      <div className="flex items-center justify-center mt-auto pt-4 border-t border-zinc-100">
                        <span className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-zinc-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                          <Clock size={11} className="inline mr-1" />{p.comingSoon}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* FOOTER CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mt-24 pt-12 border-t border-zinc-100 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-light tracking-tight text-black mb-8">{p.ctaHeading}</h2>
              <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
                {p.btnConsult} <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </main>
      </motion.div>
    </>
  );
}