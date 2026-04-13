"use client";

import { motion } from "framer-motion";

export default function ComparisonTable() {
  const specs = [
    { label: "Architecture", legacy: "Monolithic & Coupled", nova: "Headless / Decoupled" },
    { label: "Rendering", legacy: "Server-Side (Heavy TTFB)", nova: "Static / Edge Hybrid" },
    { label: "Security Profile", legacy: "Database Exposed", nova: "Zero-Trust API" },
    { label: "Asset Delivery", legacy: "Manual Optimization", nova: "Next/Image Automated" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="w-full mt-24 border-t border-zinc-200"
    >
      <div className="grid grid-cols-3 py-6 border-b border-zinc-100">
        <div className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Core Metric</div>
        <div className="text-[9px] font-bold tracking-widest text-zinc-400 uppercase">Legacy System</div>
        <div className="text-[9px] font-bold tracking-widest text-black uppercase">Novatrum Engine</div>
      </div>

      {specs.map((spec, idx) => (
        <div key={idx} className="grid grid-cols-3 py-5 border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
          <div className="text-sm font-medium text-zinc-900 flex items-center">{spec.label}</div>
          <div className="text-sm text-zinc-500 flex items-center">{spec.legacy}</div>
          <div className="text-sm font-semibold text-emerald-600 flex items-center">{spec.nova}</div>
        </div>
      ))}
    </motion.div>
  );
}