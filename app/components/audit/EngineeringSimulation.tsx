"use client";

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface SimulationProps {
  heroImage: string;
  clientName: string;
  legacyScore?: number; 
}

export default function EngineeringSimulation({ heroImage, clientName, legacyScore = 30 }: SimulationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Framer Motion Değerleri
  const rawSlider = useMotionValue(0); // 0 = Legacy, 100 = Novatrum
  const slider = useSpring(rawSlider, { stiffness: 300, damping: 30 });

  // 1. DİNAMİK SKOR HESAPLAMASI (Müşterinin Gerçek Skorundan -> 99'a)
  const scoreRaw = useTransform(slider, [0, 100], [legacyScore, 99]);
  const scoreRounded = useTransform(scoreRaw, Math.round);

  // 2. DİNAMİK RENK MANTIĞI (Skor değerine göre renk değişir, slider'a göre değil)
  // < 50 = Kırmızı, 50-70 = Turuncu, > 70 = Yeşil
  const scoreColor = useTransform(
    scoreRaw,
    [0, 49, 70, 100],
    ["#ef4444", "#ef4444", "#f59e0b", "#10b981"]
  );

  // Dinamik Çerçeve Rengi (Kutu gölgesi/çerçevesi için)
  const borderColor = useTransform(
    scoreRaw,
    [0, 49, 70, 100],
    ['rgba(239,68,68,0.2)', 'rgba(239,68,68,0.2)', 'rgba(245,158,11,0.2)', 'rgba(16,185,129,0.3)']
  );

  // 3. DİNAMİK CİRO (REVENUE) ARTIŞI
  // Eğer skor < 40 ise maksimum etki %25, 40-70 arası ise %15, 70+ ise %5.
  const maxRevenueImpact = legacyScore < 40 ? 25 : legacyScore <= 70 ? 15 : 5;
  const revenueRaw = useTransform(slider, [0, 100], [0, maxRevenueImpact]); // 0'dan başlar, max'a çıkar
  const revenueRounded = useTransform(revenueRaw, Math.round);

  const clipPath = useTransform(slider, (val) => `inset(0 ${100 - val}% 0 0)`);
  const legacyOpacity = useTransform(slider, [0, 40], [1, 0]);
  const novaOpacity = useTransform(slider, [60, 100], [0, 1]);

  return (
    <div className="w-full flex flex-col items-center mt-12 mb-16 relative">
      
      {/* Hareketli Blueprint Arka Planı */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-40 mix-blend-multiply bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] animate-[pulse_8s_ease-in-out_infinite]" />

      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black mb-2">Architecture Simulation</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Drag the slider to resolve digital friction</p>
      </div>

      <div 
        ref={containerRef} 
        className="relative w-full max-w-5xl aspect-[4/3] md:aspect-[21/9] rounded-[40px] overflow-hidden border border-zinc-200 bg-zinc-100 shadow-2xl group cursor-ew-resize"
      >
        {/* === LEGACY LAYER === */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="Legacy Site" className="w-full h-full object-cover object-top filter blur-[4px] grayscale-[60%] opacity-60" />
          
          <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-200/50 overflow-hidden">
            <motion.div className="h-full bg-red-500/50" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
          </div>

          <motion.div style={{ opacity: legacyOpacity }} className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[10%] bg-white/80 backdrop-blur-md border border-red-100 px-4 py-2 rounded-full text-[10px] font-mono tracking-widest text-red-600 shadow-lg">Server Response: 2.4s</div>
            <div className="absolute top-[50%] left-[5%] bg-white/80 backdrop-blur-md border border-zinc-200 px-4 py-2 rounded-full text-[10px] font-mono tracking-widest text-zinc-500 shadow-lg">Legacy PHP Runtime</div>
            <div className="absolute bottom-[20%] left-[15%] bg-white/80 backdrop-blur-md border border-amber-100 px-4 py-2 rounded-full text-[10px] font-mono tracking-widest text-amber-600 shadow-lg">Heavy DOM Tree</div>
          </motion.div>
        </div>

        {/* === NOVATRUM LAYER === */}
        <motion.div style={{ clipPath }} className="absolute inset-0 z-10 border-r border-white/50">
          <img src={heroImage} alt="Novatrum Site" className="w-full h-full object-cover object-top" />
          
          <motion.div style={{ opacity: novaOpacity }} className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] right-[10%] bg-black/80 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-full text-[10px] font-mono tracking-widest text-emerald-400 shadow-2xl">Edge Delivery: 42ms</div>
            <div className="absolute top-[50%] right-[5%] bg-black/80 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-full text-[10px] font-mono tracking-widest text-zinc-300 shadow-2xl">Next.js Edge Runtime</div>
            <div className="absolute bottom-[20%] right-[15%] bg-black/80 backdrop-blur-md border border-zinc-800 px-4 py-2 rounded-full text-[10px] font-mono tracking-widest text-zinc-300 shadow-2xl">React Server Components</div>
          </motion.div>
        </motion.div>

        {/* === GİANT SCORE === */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
           <motion.div 
             className="w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-white/70 backdrop-blur-3xl border shadow-[0_20px_60px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center transition-transform group-hover:scale-105"
             style={{ borderColor }}
           >
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Performance</p>
              <motion.div style={{ color: scoreColor }} className="text-8xl md:text-[8rem] font-light tracking-tighter leading-none">
                {scoreRounded}
              </motion.div>
           </motion.div>
        </div>

        {/* Slider Input */}
        <input 
          type="range" min="0" max="100" defaultValue="0"
          onChange={(e) => rawSlider.set(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
        />
      </div>

      {/* === BUSINESS LOGIC === */}
      <div className="mt-8 max-w-2xl text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-950 rounded-2xl shadow-xl">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
             Business Growth Opportunity: <motion.span className="text-emerald-400 text-sm inline-block w-12 text-left">+<motion.span>{revenueRounded}</motion.span>%</motion.span>
           </p>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium mt-4">
          *Estimated uplift based on resolving severe digital friction. High-ticket items (e.g., luxury goods) see exponential revenue returns from edge-native latency optimization.
        </p>
      </div>

    </div>
  );
}