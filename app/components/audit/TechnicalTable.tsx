"use client";

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Minus } from 'lucide-react';

const COMPARISON_DATA = [
  { feature: 'Architecture', legacy: 'Monolithic (Coupled)', novatrum: 'Headless / Decoupled' },
  { feature: 'Rendering Strategy', legacy: 'Server-Side (Slow TTFB)', novatrum: 'Static / Edge / SSR Hybrid' },
  { feature: 'Security Profile', legacy: 'Vulnerable (Database exposed)', novatrum: 'Zero-Trust (API driven)' },
  { feature: 'Global CDN Distribution', legacy: false, novatrum: true },
  { feature: 'Asset Optimization', legacy: 'Manual / Plugins', novatrum: 'Automated (Next/Image)' },
];

export default function TechnicalTable() {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto w-full">
      <div className="bg-white border border-zinc-200 rounded-[32px] overflow-hidden shadow-sm mt-16">
        <div className="grid grid-cols-3 bg-zinc-50 border-b border-zinc-200">
          <div className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">Technical Metric</div>
          <div className="p-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-l border-zinc-200">Legacy Stack</div>
          <div className="p-6 text-[10px] font-bold uppercase tracking-widest text-black border-l border-zinc-200 bg-emerald-500/5">Novatrum Engine</div>
        </div>
        <div className="divide-y divide-zinc-100">
          {COMPARISON_DATA.map((row, idx) => (
            <div key={idx} className="grid grid-cols-3 hover:bg-zinc-50/50 transition-colors">
              <div className="p-6 flex items-center text-sm font-medium text-zinc-900">{row.feature}</div>
              <div className="p-6 flex items-center border-l border-zinc-100 text-sm text-zinc-500">
                {typeof row.legacy === 'boolean' ? (row.legacy ? <CheckCircle2 className="text-zinc-400" size={18} /> : <Minus className="text-zinc-300" size={18} />) : row.legacy}
              </div>
              <div className="p-6 flex items-center border-l border-zinc-100 text-sm font-bold text-zinc-900 bg-emerald-500/5">
                {typeof row.novatrum === 'boolean' ? (row.novatrum ? <CheckCircle2 className="text-emerald-500" size={18} /> : <XCircle className="text-red-500" size={18} />) : row.novatrum}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}