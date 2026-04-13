"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown } from 'lucide-react';

export default function CriticalWarning({ score }: { score: number }) {
  if (score >= 50) return null;
  const conversionLoss = Math.round((100 - score) * 0.45);

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-red-500/5 backdrop-blur-2xl border border-red-500/10 rounded-[32px]" />
      <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start gap-6">
        <div className="bg-red-500/10 p-5 rounded-2xl text-red-500 shrink-0 border border-red-500/20">
          <AlertTriangle size={28} />
        </div>
        <div className="flex-1">
          <h3 className="text-red-600 font-bold uppercase tracking-[0.2em] text-xs mb-3">Critical Business Impact</h3>
          <p className="text-zinc-700 text-sm leading-relaxed font-medium mb-4">
            The current legacy infrastructure is scoring critically low on Core Web Vitals (<span className="text-red-500 font-bold font-mono">{score}/100</span>).
          </p>
          <div className="bg-white/50 border border-red-100 rounded-xl p-4 flex items-center gap-4">
             <div className="bg-red-50 p-2 rounded-lg text-red-500"><TrendingDown size={20} /></div>
             <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Projected Revenue Leak</p>
                <p className="text-sm font-semibold text-zinc-900 mt-0.5">
                  You are likely losing <span className="text-red-600 font-mono">~{conversionLoss}%</span> of mobile conversions due to digital friction.
                </p>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}