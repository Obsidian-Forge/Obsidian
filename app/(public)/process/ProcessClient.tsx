"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Discovery',
    desc: 'We start with a deep dive into your business goals, user needs, and technical requirements. This phase sets the foundation for everything that follows.',
  },
  {
    num: '02',
    title: 'Architecture',
    desc: 'We design the system architecture, choose the right tech stack, and create wireframes. You get a clear blueprint before any code is written.',
  },
  {
    num: '03',
    title: 'Development',
    desc: 'We build your product in transparent sprints with weekly updates. You see progress in real-time and can provide feedback at every stage.',
  },
  {
    num: '04',
    title: 'Launch & Support',
    desc: 'We deploy, test thoroughly, and launch. Every project includes 30-day warranty and optional ongoing maintenance.',
  },
];

export default function ProcessPage() {
  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-32">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.42, 0, 0.58, 1] }}
          className="space-y-4 mb-24"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            How We Work
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1] max-w-lg">
            A process built for clarity and speed.
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-md leading-relaxed">
            From first contact to launch, every step is designed to keep you informed and your project moving forward.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-20">
          {steps.map((step, index) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col md:flex-row gap-6 md:gap-12 items-start group"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-sm font-light text-zinc-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300">
                {step.num}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2 pt-1">
                <h3 className="text-xl font-light tracking-tight text-black group-hover:text-black transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline line (mobile hidden) */}
        <div className="hidden md:block absolute left-[75px] top-[280px] bottom-32 w-px bg-zinc-100 -z-10" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 pt-16 border-t border-zinc-100 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
            Ready to start your project?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all"
          >
            Get in Touch <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}
