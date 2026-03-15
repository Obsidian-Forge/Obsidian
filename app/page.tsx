"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const CodeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const LayoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>;

// Animasyon ayarları (tekrar tekrar yazmamak için)
const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

export default function HomePage() {
  return (
    <div className="w-full bg-white selection:bg-black/10">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl mx-auto space-y-8 mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-zinc-50 border border-zinc-100"
          >
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Digital Studio &bull; Dilbeek, Belgium
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-[7rem] font-medium tracking-tighter text-black leading-[0.9]"
          >
            Digital products. <br />
            <span className="text-zinc-400">Built right.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-lg text-zinc-500 max-w-xl mx-auto font-light leading-relaxed"
          >
            I engineer fast, scalable web applications using modern open-source tools. Clean code, functional design, and transparent pricing.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link href="/calculator" className="px-8 py-4 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-800 transition-colors">
              Start a Project
            </Link>
            <Link href="#services" className="px-8 py-4 bg-white text-black border border-zinc-200 font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-50 transition-colors">
              Explore Services
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-40">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black">Focused capabilities.</h2>
            <p className="text-zinc-500 mt-4 font-light">Everything you need to launch.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-50 rounded-[32px] p-10 hover:bg-zinc-100 transition-colors flex flex-col justify-between min-h-[350px]">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
                <LayoutIcon />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-black">Frontend Development</h3>
                <p className="text-zinc-500 font-light leading-relaxed">Fast, responsive interfaces built with React and Tailwind CSS. Designed for optimal user experience.</p>
              </div>
            </div>
            
            <div className="bg-zinc-50 rounded-[32px] p-10 hover:bg-zinc-100 transition-colors flex flex-col justify-between min-h-[350px]">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-black">
                <CodeIcon />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-black">Fullstack Systems</h3>
                <p className="text-zinc-500 font-light leading-relaxed">Robust architecture using Next.js. Secure, scalable, and easy to maintain.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. PROCESS SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black">How I work.</h2>
            <p className="text-zinc-500 mt-4 font-light">A simple, effective development process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">01. Discover</span>
              <h4 className="text-xl font-bold">Scope & Strategy</h4>
              <p className="text-zinc-500 font-light text-sm leading-relaxed">We define the project requirements, architecture, and select the right tech stack for your goals.</p>
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">02. Build</span>
              <h4 className="text-xl font-bold">Development</h4>
              <p className="text-zinc-500 font-light text-sm leading-relaxed">Writing clean, modular code. You get regular updates and access to a staging environment.</p>
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">03. Launch</span>
              <h4 className="text-xl font-bold">Deployment</h4>
              <p className="text-zinc-500 font-light text-sm leading-relaxed">Final testing, performance optimization, and pushing your product live to the world.</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. CALCULATOR CTA SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-40">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="rounded-[40px] bg-zinc-50 p-12 md:p-24 flex flex-col md:flex-row items-center justify-between gap-12 border border-zinc-100">
            <div className="max-w-xl space-y-6 text-left">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Transparent Pricing</span>
              <h2 className="text-4xl md:text-5xl font-medium text-black tracking-tight">
                Know your costs upfront.
              </h2>
              <p className="text-zinc-500 font-light leading-relaxed">
                Use the interactive configurator to define your project scope, features, and timeline to get an immediate estimate. No surprises.
              </p>
              <ul className="space-y-3 pt-4">
                <li className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                  <CheckIcon /> Itemized breakdown of costs
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                  <CheckIcon /> Modular feature selection
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-600 font-medium">
                  <CheckIcon /> Instant PDF proposal generation
                </li>
              </ul>
            </div>
            <div className="shrink-0">
              <Link href="/calculator" className="inline-flex items-center justify-center px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-transform">
                Open Configurator
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 5. TECH STACK */}
      <section className="max-w-7xl mx-auto px-6 py-40 border-t border-zinc-100">
        <motion.div variants={fadeUpVariant} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
          <div className="mb-16">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Performance First</span>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black mt-4">Powered by open source.</h2>
            <p className="text-zinc-500 mt-4 font-light max-w-xl">I rely on industry-standard, free, and open-source technologies to build resilient applications without vendor lock-in.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Next.js", desc: "The React Framework" },
              { name: "TypeScript", desc: "Type-safe JavaScript" },
              { name: "Tailwind CSS", desc: "Utility-first styling" },
              { name: "Supabase", desc: "Open source database" },
              { name: "Vercel", desc: "Global edge network" },
              { name: "Framer Motion", desc: "Smooth animations" }
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
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-black">Let's talk.</h2>
            <p className="text-zinc-500 mt-4 font-light">Send me a message and I'll get back to you within 24 hours.</p>
          </div>

          <form action="https://api.web3forms.com/submit" method="POST" className="space-y-6">
            <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                required 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors"
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Your Email" 
                required 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors"
              />
            </div>
            
            <textarea 
              name="message" 
              rows={5} 
              placeholder="Tell me about your project..." 
              required 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-[20px] px-6 py-4 text-sm outline-none focus:border-black transition-colors resize-none"
            ></textarea>

            <input type="hidden" name="redirect" value="https://web3forms.com/success" />

            <button 
              type="submit" 
              className="w-full bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full py-5 hover:bg-zinc-800 transition-colors"
            >
              Send Message
            </button>
          </form>
        </motion.div>
      </section>

    </div>
  );
}