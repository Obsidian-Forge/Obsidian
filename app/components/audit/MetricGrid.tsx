"use client";

import { motion } from 'framer-motion';

interface MetricGridProps {
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
}

export default function MetricGrid({ scores }: MetricGridProps) {
  const metrics = [
    { label: "Performance", value: scores.performance, desc: "Core Web Vitals & Load Speed" },
    { label: "Accessibility", value: scores.accessibility, desc: "Screen Reader & Contrast" }, // A11Y kaldırıldı
    { label: "Best Practices", value: scores.bestPractices, desc: "Security & Modern Standards" },
    { label: "SEO", value: scores.seo, desc: "Search Engine Discoverability" }
  ];

  const getColor = (val: number) => {
    if (val < 50) return "text-red-500 border-red-500/20 bg-red-500/5";
    if (val < 90) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-emerald-500 border-emerald-500/20 bg-emerald-500/5";
  };

  return (
    <div className="w-full mt-12">
      <h3 className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-8 text-center">Comprehensive Audit Results</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            key={m.label} 
            className="p-8 border border-zinc-200 bg-white rounded-[32px] shadow-sm flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-40 ${m.value < 50 ? 'bg-red-400' : m.value < 90 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 mb-6 ${getColor(m.value)}`}>
               <span className="text-2xl font-light tracking-tighter">{m.value}</span>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900 mb-2">{m.label}</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{m.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}