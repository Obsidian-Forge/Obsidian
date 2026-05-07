"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const services = [
  {
    num: '01',
    title: 'Frontend Architecture',
    desc: 'We design and build high-performance user interfaces that are fast, accessible, and visually stunning. Every pixel is intentional.',
    features: [
      'React & Next.js Development',
      'Tailwind CSS & Custom Design Systems',
      'Framer Motion & Micro-interactions',
      'Responsive & Mobile-First Approach',
      'Performance Optimization & SEO',
    ],
  },
  {
    num: '02',
    title: 'Custom Software Engineering',
    desc: 'We build tailored software solutions — from internal tools to complex SaaS platforms. Your ideas become production-ready applications.',
    features: [
      'API Development & Integration',
      'Database Architecture & Supabase',
      'SaaS Platform Development',
      'Third-party Service Integration',
      'Maintenance & Long-term Support',
    ],
  },
  {
    num: '03',
    title: 'Technical Consulting',
    desc: 'Get expert guidance on your tech stack, architecture, and digital strategy. We help you make the right technical decisions.',
    features: [
      'Technology Stack Advisory',
      'System Architecture Review',
      'MVP Planning & Roadmapping',
      'Code Audit & Quality Assurance',
      'Digital Transformation Strategy',
    ],
  },
];

export default function ServicesPage() {
  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-32">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4 mb-24"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            What We Do
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1] max-w-lg">
            Digital products, engineered with precision.
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-md leading-relaxed">
            From frontend to full-stack, we build software that works — for you and your users.
          </p>
        </motion.div>

        {/* Services */}
        <div className="space-y-24">
          {services.map((service, index) => (
            <motion.div
              key={service.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col md:flex-row gap-6 md:gap-12 items-start group"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-sm font-light text-zinc-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-300">
                {service.num}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4 pt-1">
                <h3 className="text-xl font-light tracking-tight text-black">
                  {service.title}
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-xl">
                  {service.desc}
                </p>
                <ul className="space-y-2 pt-2">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-500 font-light">
                      <CheckCircle2 size={13} className="text-zinc-300 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 pt-16 border-t border-zinc-100 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
            Ready to start?
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