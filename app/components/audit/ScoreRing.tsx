"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  legacyScore: number;
}

export default function ScoreRing({ legacyScore }: ScoreRingProps) {
  const [isDone, setIsDone] = useState(false);
  
  // Animasyon değerleri
  const count = useMotionValue(legacyScore);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  
  // Renk interpolasyonu: Kırmızıdan (Kötü Skor) -> Zümrüt Yeşiline (Novatrum Skoru)
  const color = useTransform(count, [0, 50, 99], ["#ef4444", "#f59e0b", "#10b981"]);

  useEffect(() => {
    // 1.2 saniye gerilimi artırmak için bekle, sonra 99'a tırman
    const timeout = setTimeout(() => {
      const controls = animate(count, 99, {
        duration: 2.5,
        ease: "circOut",
        onComplete: () => setIsDone(true)
      });
      return controls.stop;
    }, 1200);

    return () => clearTimeout(timeout);
  }, [count]);

  return (
    <div className="relative flex flex-col items-center justify-center p-10 bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem]">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Arka plan soluk halka */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r="74" stroke="#f4f4f5" strokeWidth="6" fill="none" />
        </svg>
        
        {/* İlerleyen renkli halka */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <motion.circle
            cx="80"
            cy="80"
            r="74"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray="465" // 2 * pi * r
            style={{ pathLength: useTransform(count, [0, 100], [0, 1]) }}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="text-center">
          <motion.span style={{ color }} className="text-5xl font-light tracking-tighter">
            {rounded}
          </motion.span>
        </div>
      </div>
      
      <motion.p 
        layout
        className={`mt-8 text-[10px] font-bold tracking-widest uppercase transition-colors duration-500 ${isDone ? 'text-emerald-500' : 'text-zinc-400'}`}
      >
        {isDone ? "Novatrum Target Score" : "Current Legacy Score"}
      </motion.p>
    </div>
  );
}