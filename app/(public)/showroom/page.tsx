"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const demos = [
  {
    name: 'Quantum',
    desc: 'Cutting-edge research platform with immersive 3D visualizations and real-time data processing.',
    tech: 'Next.js • Three.js • WebGL',
    path: '/demo/quantum',
    image: '/showroom/quantum.png',
  },
  {
    name: 'Fintech',
    desc: 'Modern financial dashboard with live market data, portfolio tracking, and AI-powered insights.',
    tech: 'Next.js • D3.js • Supabase',
    path: '/demo/fintech',
    image: '/showroom/fintech.png',
  },
  {
    name: 'Logistics',
    desc: 'Real-time fleet tracking and route optimization for enterprise supply chain management.',
    tech: 'Next.js • Mapbox • WebSocket',
    path: '/demo/logistics',
    image: '/showroom/logistics.png',
  },
  {
    name: 'Creative',
    desc: 'Award-winning agency portfolio with stunning animations and seamless page transitions.',
    tech: 'Next.js • Framer Motion • GSAP',
    path: '/demo/creative',
    image: '/showroom/creative.png',
  },
];

export default function ShowroomPage() {
  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      <div className="max-w-6xl mx-auto px-6 pt-36 pb-32">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">
            Showroom
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1] max-w-lg">
            Selected work, crafted with precision.
          </h1>
          <p className="text-sm text-zinc-400 font-light mt-4 max-w-md leading-relaxed">
            Explore our demo projects — each built to showcase a different technical capability and design approach.
          </p>
        </motion.div>

        {/* Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {demos.map((demo, i) => (
            <motion.div
              key={demo.name}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={demo.path}
                className="group block rounded-3xl border border-zinc-100 overflow-hidden hover:border-zinc-200 transition-all hover:shadow-sm"
              >
                {/* Görsel */}
                <div className="aspect-[16/10] bg-zinc-50 relative overflow-hidden">
                  {demo.image ? (
                    <Image
                      src={demo.image}
                      alt={demo.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-6xl font-light tracking-tighter">
                      {demo.name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink size={14} className="text-zinc-500" />
                  </div>
                </div>

                {/* Bilgi */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-light tracking-tight text-black">{demo.name}</h3>
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed mb-3">
                    {demo.desc}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-300">
                    {demo.tech}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">
            Want something like this?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all"
          >
            Get in Touch <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}