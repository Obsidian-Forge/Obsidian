// app/components/audit/ScoreProjection.tsx
"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface Props {
  heroImage: string;
  legacyScores: { 
    performance: number; 
    legacyLcp?: string;
    novatrumLcp?: string;
  };
}

export default function ScoreProjection({ heroImage, legacyScores }: Props) {
  const [sliderPosition, setSliderPosition] = useState(50); 
  const containerRef = useRef<HTMLDivElement>(null);

  const legacyOpacity = Math.max(0, 1 - (sliderPosition / 50)); 
  const novaOpacity = Math.max(0, (sliderPosition - 50) / 50); 

  return (
    <div className="w-full flex flex-col items-center mt-12 mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-black mb-2">Engineering Projection</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Slide Right to View Novatrum Impact</p>
      </div>

      <div ref={containerRef} className="relative w-full max-w-5xl aspect-[4/3] md:aspect-[21/9] rounded-[40px] overflow-hidden border border-zinc-200 bg-zinc-100 shadow-2xl">
        
        {/* Arka Plan Site Görseli */}
        <div className="absolute inset-0 grayscale opacity-30 blur-[2px]">
          <img src={heroImage} alt="Site Analysis" className="w-full h-full object-cover object-top" />
        </div>

        {/* METRİKLER */}
        <div className="absolute inset-0 flex items-center justify-around px-6 md:px-12 pointer-events-none">
          
          {/* LEGACY VIEW */}
          <motion.div style={{ opacity: legacyOpacity }} className="flex flex-col items-center text-center bg-white/70 backdrop-blur-xl p-8 rounded-[32px] border border-white/50 shadow-xl">
             <div className="text-6xl md:text-8xl font-light text-red-500 mb-2">{legacyScores.performance}</div>
             <p className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-red-500 mb-4 bg-red-50 px-3 py-1 rounded-full border border-red-100">Legacy Architecture</p>
             <div className="space-y-1.5 text-zinc-600 font-mono text-[10px] md:text-xs">
                <p>LCP: {legacyScores.legacyLcp || '4.8s'} <span className="text-red-400 font-sans text-[10px]">(Critical)</span></p>
                <p>TTFB: 1200ms <span className="text-red-400 font-sans text-[10px]">(Slow)</span></p>
             </div>
          </motion.div>

          {/* NOVATRUM VIEW */}
          <motion.div style={{ opacity: novaOpacity }} className="flex flex-col items-center text-center bg-white/70 backdrop-blur-xl p-8 rounded-[32px] border border-white/50 shadow-xl">
             <div className="text-6xl md:text-8xl font-bold text-emerald-500 mb-2">99</div>
             <p className="text-[10px] md:text-[11px] font-bold tracking-widest uppercase text-emerald-600 mb-4 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Novatrum Engine</p>
             <div className="space-y-1.5 text-zinc-800 font-mono text-[10px] md:text-xs">
                <p>LCP: {legacyScores.novatrumLcp || '0.6s'} <span className="text-emerald-500 font-sans text-[10px]">(Fast)</span></p>
                <p>TTFB: 42ms <span className="text-emerald-500 font-sans text-[10px]">(Edge)</span></p>
             </div>
          </motion.div>
        </div>

        {/* SLIDER BAR */}
        <input 
          type="range" min="0" max="100" value={sliderPosition} 
          onChange={(e) => setSliderPosition(parseInt(e.target.value))}
          className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-48 md:w-80 h-2 bg-white/50 backdrop-blur-md appearance-none rounded-full cursor-pointer accent-black z-30 shadow-lg border border-zinc-200"
        />
      </div>
    </div>
  );
}