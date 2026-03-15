"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 bg-white mix-blend-difference rounded-full pointer-events-none z-[1000] hide-on-mobile" />
      <div ref={ringRef} className="fixed top-0 left-0 w-8 h-8 border border-white mix-blend-difference rounded-full pointer-events-none z-[999] hide-on-mobile" />
    </>
  );
};

const ObsidianLogo = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Process", href: "/process" },
    { name: "Contact", href: "/contact" },
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col relative">
      <CustomCursor />

      {/* HEADER - No bottom line */}
      <header className="sticky top-0 w-full z-[100] bg-white">
        <div className="w-full px-6 md:px-16 h-20 md:h-24 flex items-center justify-between relative">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group relative z-[110]" onClick={() => setIsOpen(false)}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:scale-95 shadow-sm">
               <ObsidianLogo />
            </div>
            <span className="text-[11px] font-black tracking-[0.3em] text-black uppercase leading-none mt-0.5">
              Obsidian
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] hover:text-black transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Area */}
          <div className="flex items-center gap-4 relative z-[110]">
            <Link href="/calculator" className="hidden sm:inline-block px-8 py-3.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all">
              Start Project
            </Link>
            
            {/* Hamburger Button - 3 Lines Animated to X */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex md:hidden flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none relative"
              aria-label="Toggle Menu"
            >
              <motion.span 
                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-6 h-0.5 bg-black block origin-center" 
              />
              <motion.span 
                animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                className="w-6 h-0.5 bg-black block" 
              />
              <motion.span 
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-6 h-0.5 bg-black block origin-center" 
              />
            </button>
          </div>
        </div>

        {/* SIDEBAR PANEL - Solid White Background */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-[105] bg-white md:hidden flex flex-col pt-24"
            >
              <div className="flex-grow flex flex-col items-center justify-center gap-10 text-center px-8 pb-24">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="w-full"
                  >
                    <Link 
                      href={link.href} 
                      onClick={() => setIsOpen(false)}
                      className="text-4xl font-black uppercase tracking-tighter text-black hover:text-zinc-500 transition-colors block py-2"
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-10 w-full max-w-[280px]"
                >
                  <Link 
                    href="/calculator" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full py-6 bg-black text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full shadow-2xl active:scale-95 transition-transform"
                  >
                    Start Project
                  </Link>
                </motion.div>
              </div>

              {/* Panel Footer */}
              <div className="p-12 text-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Dilbeek, Belgium &bull; Obsidian Studio
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="w-full bg-white py-16 px-6 md:px-16 mt-12 border-t border-zinc-100/50">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
                <ObsidianLogo />
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
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">LinkedIn</a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">GitHub</a>
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