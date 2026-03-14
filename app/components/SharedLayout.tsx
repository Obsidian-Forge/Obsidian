"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

// Pürüzsüz Takip Eden İmleç
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Sadece fare desteği olan cihazlarda event listener ekle
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
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[100] hide-on-mobile" />
      <div ref={ringRef} className="fixed top-0 left-0 w-8 h-8 border border-white/50 rounded-full pointer-events-none z-[99] hide-on-mobile" />
    </>
  );
};

// 4 Uçlu Yıldız Logo
const ObsidianLogo = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-white/20 flex flex-col">
      <CustomCursor />

      {/* FIXED HEADER */}
      <header className="fixed top-6 w-full z-50 px-8 md:px-12 pointer-events-none">
        <div className="flex items-center justify-between w-full pointer-events-auto relative">
          
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <ObsidianLogo />
            <span className="text-xl font-bold tracking-widest text-white uppercase">Obsidian</span>
          </Link>
          
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <nav className="flex items-center gap-8 px-8 py-3 bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-[50px] shadow-lg">
              <Link href="/services" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Services</Link>
              <Link href="/process" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Process</Link>
              <Link href="/contact" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Contact</Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-neutral-900/60 border border-white/10 rounded-[50px] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-medium text-neutral-300 uppercase tracking-widest">Available</span>
          </div>

        </div>
      </header>

      {/* SAYFA İÇERİĞİ */}
      <div className="flex-grow pt-32 md:pt-40">
        {children}
      </div>

      {/* FOOTER - KODUNUN KALAN KISMI AYNI KALACAK */}
      <footer className="border-t border-white/5 bg-black py-20 mt-20">
         {/* Footer içeriğini buraya olduğu gibi bırak */}
      </footer>
    </div>
  );
}