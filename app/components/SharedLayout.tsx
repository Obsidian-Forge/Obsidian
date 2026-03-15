"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      const onMouseMove = (e: MouseEvent) => {
        mouse.current = { x: e.clientX, y: e.clientY };
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`;
        }
      };
      window.addEventListener("mousemove", onMouseMove);

      let animationFrameId: number;
      const render = () => {
        ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
        ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ring.current.x - 16}px, ${ring.current.y - 16}px, 0)`;
        }
        animationFrameId = requestAnimationFrame(render);
      };
      render();

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, []);

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 bg-white mix-blend-difference rounded-full pointer-events-none z-[100] hide-on-mobile" />
      <div ref={ringRef} className="fixed top-0 left-0 w-8 h-8 border border-white mix-blend-difference rounded-full pointer-events-none z-[99] hide-on-mobile" />
    </>
  );
};

// Orijinal Obsidian Logosu
const ObsidianLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <CustomCursor />

      {/* HEADER */}
      <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md">
        <div className="w-full px-6 md:px-16 h-24 flex items-center justify-between">
          
          {/* Logo Alanı */}
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-95">
               <ObsidianLogo />
            </div>
            <span className="text-[11px] font-black tracking-[0.3em] text-black uppercase leading-none mt-0.5">
              Obsidian
            </span>
          </Link>

          {/* Orta Navigasyon */}
          <nav className="hidden md:flex items-center gap-10">
            <Link href="/" className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] hover:text-black transition-colors">Home</Link>
            <Link href="/services" className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] hover:text-black transition-colors">Services</Link>
            <Link href="/process" className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] hover:text-black transition-colors">Process</Link>
            <Link href="/contact" className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] hover:text-black transition-colors">Contact</Link>
          </nav>

          {/* Aksiyon Butonu - Start Project olarak güncellendi */}
          <Link href="/calculator" className="px-8 py-3.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-colors">
            Start Project
          </Link>
        </div>
      </header>

      {/* İÇERİK */}
      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white py-16 px-6 md:px-16 mt-12 border-t border-zinc-100/50">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>
              </div>
              <span className="text-[11px] font-black tracking-[0.3em] text-black uppercase leading-none mt-0.5">
                Obsidian
              </span>
             </div>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
               &copy; {new Date().getFullYear()} Obsidian. All rights reserved. <br/> 
               Built in Dilbeek, Belgium.
             </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-x-12 gap-y-4">
             <div className="flex gap-8">
                <a href="#" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">LinkedIn</a>
                <a href="#" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">GitHub</a>
             </div>
             <div className="flex gap-8">
                <Link href="/privacy" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">Privacy</Link>
                <Link href="/terms" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">Terms</Link>
             </div>
          </div>

        </div>
      </footer>

    </div>
  );
}