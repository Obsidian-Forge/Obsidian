"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ComparisonGrid({ images, legacyStack }: { images: any, legacyStack: string[] }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPosition((x / rect.width) * 100);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="w-full flex flex-col items-center">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-light tracking-tighter text-black mb-2">The Interactive Reveal</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Drag to clear the digital friction</p>
      </div>

      <div ref={containerRef} className="relative w-full max-w-5xl aspect-[16/9] rounded-[40px] overflow-hidden border border-zinc-200 shadow-2xl bg-zinc-100 cursor-ew-resize select-none"
        onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
        onMouseMove={(e) => isDragging && handleMove(e.clientX)}
      >
        <img src={images.legacy} alt="Legacy" className="absolute inset-0 w-full h-full object-cover grayscale opacity-80" />
        <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
           <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Legacy Architecture</span>
        </div>

        <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
          <img src={images.novatrum} alt="Novatrum" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
             <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Novatrum Engine</span>
          </div>
        </div>

        <div className="absolute top-0 bottom-0 w-1 bg-white z-20 shadow-xl" style={{ left: `${sliderPosition}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border border-zinc-200" />
        </div>
      </div>

      <div className="max-w-5xl w-full flex flex-col items-center mt-12 px-6">
         <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Detected Legacy Stack</h4>
         <div className="flex flex-wrap gap-2 justify-center">
            {legacyStack.map(tech => (
              <span key={tech} className="bg-zinc-100 text-zinc-500 text-[10px] px-3 py-1.5 rounded-lg border border-zinc-200 font-mono">{tech}</span>
            ))}
         </div>
      </div>
    </motion.div>
  );
}