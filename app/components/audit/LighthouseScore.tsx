"use client";

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

export default function LighthouseScore({ title, score }: { title: string, score: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, score, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [score, count]);

  let colorClass = "text-emerald-500";
  let strokeClass = "stroke-emerald-500";
  if (score < 50) { colorClass = "text-red-500"; strokeClass = "stroke-red-500"; }
  else if (score < 90) { colorClass = "text-amber-500"; strokeClass = "stroke-amber-500"; }

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
      <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-100" />
          <motion.circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent"
            strokeDasharray="264"
            className={strokeClass}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 264 }}
            animate={{ strokeDashoffset: 264 - (264 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <motion.span className={`absolute text-2xl font-light tracking-tighter ${colorClass}`}>
          {rounded}
        </motion.span>
      </div>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">{title}</h3>
    </div>
  );
}