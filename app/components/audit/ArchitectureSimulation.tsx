"use client";

import { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface SimulationProps {
  heroImage: string;
  clientName: string;
  legacyScore: number;
  targetRevenue?: number;
}

export default function ArchitectureSimulation({ 
  heroImage, 
  clientName, 
  legacyScore, 
  targetRevenue = 26 
}: SimulationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // SSR Hydration uyumsuzluğunu (rakam zıplamalarını) önlemek için mount kontrolü
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const rawSlider = useMotionValue(0); 
  const slider = useSpring(rawSlider, { stiffness: 300, damping: 30, bounce: 0 });

  // Dinamik Skor: Kaydırıcı 0 iken KESİNLİKLE legacyScore'dur.
  const scoreRaw = useTransform(slider, [0, 100], [legacyScore, 99]);
  const scoreRounded = useTransform(scoreRaw, Math.round);

  const scoreColor = useTransform(
    scoreRaw,
    [0, 49, 70, 100],
    ["#ef4444", "#ef4444", "#f59e0b", "#10b981"]
  );

  const borderColor = useTransform(
    scoreRaw,
    [0, 49, 70, 100],
    ['rgba(239,68,68,0.15)', 'rgba(239,68,68,0.15)', 'rgba(245,158,11,0.15)', 'rgba(16,185,129,0.2)']
  );

  const revenueRaw = useTransform(slider, [0, 100], [0, targetRevenue]);
  const revenueRounded = useTransform(revenueRaw, Math.round);

  const clipPath = useTransform(slider, (val) => `inset(0 ${100 - val}% 0 0)`);
  const legacyOpacity = useTransform(slider, [0, 40], [1, 0]);
  const novaOpacity = useTransform(slider, [60, 100], [0, 1]);

  // Sayfa yüklenene kadar boş bir iskelet (skeleton) gösteriyoruz ki rakamlar zıplamasın
  if (!isMounted) return <div className="w-full aspect-[21/9] mt-16 mb-20 animate-pulse bg-zinc-100 rounded-[40px]"></div>;

  return (
    <div className="w-full flex flex-col items-center mt-16 mb-20 relative font-sans">
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-30 mix-blend-multiply bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900 mb-3">Architecture Simulation</h2>
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-zinc-400">Drag to resolve digital friction</p>
      </div>

      <div ref={containerRef} className="relative w-full max-w-5xl aspect-[4/3] md:aspect-[21/9] rounded-[40px] overflow-hidden border border-zinc-200 bg-zinc-50 shadow-2xl group cursor-ew-resize">
        
        {/* === LEGACY LAYER === */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="Legacy Site" className="w-full h-full object-cover object-top filter blur-[5px] grayscale-[70%] opacity-50 pointer-events-none" />
          <motion.div style={{ opacity: legacyOpacity }} className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[10%] bg-white/90 backdrop-blur-md border border-red-100 px-5 py-2.5 rounded-full text-[10px] font-mono tracking-widest text-red-600 shadow-lg">Server Response: 2.4s</div>
            <div className="absolute top-[50%] left-[5%] bg-white/90 backdrop-blur-md border border-zinc-200 px-5 py-2.5 rounded-full text-[10px] font-mono tracking-widest text-zinc-500 shadow-lg">Legacy PHP Runtime</div>
          </motion.div>
        </div>

        {/* === NOVATRUM LAYER === */}
        <motion.div style={{ clipPath }} className="absolute inset-0 z-10 border-r border-white/50">
          <img src={heroImage} alt="Novatrum Site" className="w-full h-full object-cover object-top pointer-events-none" />
          <motion.div style={{ opacity: novaOpacity }} className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] right-[10%] bg-zinc-950/90 backdrop-blur-md border border-zinc-800 px-5 py-2.5 rounded-full text-[10px] font-mono tracking-widest text-emerald-400 shadow-2xl">Edge Delivery: 42ms</div>
            <div className="absolute top-[50%] right-[5%] bg-zinc-950/90 backdrop-blur-md border border-zinc-800 px-5 py-2.5 rounded-full text-[10px] font-mono tracking-widest text-zinc-300 shadow-2xl">React Server Components</div>
          </motion.div>
        </motion.div>

        {/* === DİNAMİK SKOR === */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
           <motion.div className="w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-white/80 backdrop-blur-3xl border shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center transition-transform group-hover:scale-105" style={{ borderColor }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Performance</p>
              <motion.div style={{ color: scoreColor }} className="text-8xl md:text-[8rem] font-light tracking-tighter leading-none">
                {scoreRounded}
              </motion.div>
           </motion.div>
        </div>

        <input type="range" min="0" max="100" defaultValue="0" onChange={(e) => rawSlider.set(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
      </div>

      {/* === DİNAMİK GELİR ROZETİ === */}
      <div className="mt-10 max-w-2xl text-center">
        <div className="inline-flex items-center gap-4 px-8 py-4 bg-zinc-950 rounded-2xl shadow-xl">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-300">
             Business Growth Opportunity: <motion.span className="text-emerald-400 text-sm ml-2 inline-block w-14 text-left">+<motion.span>{revenueRounded}</motion.span>%</motion.span>
           </p>
        </div>
      </div>
    </div>
  );
}