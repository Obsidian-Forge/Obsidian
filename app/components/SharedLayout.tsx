"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

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

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navLinks = [
    { name: t.nav.home, href: "/" },
    { name: t.nav.services, href: "/services" },
    { name: t.nav.process, href: "/process" },
    { name: t.nav.contact, href: "/contact" },
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

      {/* HEADER */}
      <header className="sticky top-0 w-full z-[100] bg-white/80 backdrop-blur-md">
        <div className="w-full px-6 md:px-16 h-20 md:h-24 flex items-center justify-between relative border-b-0">
          
          <Link href="/" className="flex items-center gap-3 group relative z-[110]" onClick={() => setIsOpen(false)}>
            <div className="w-7 h-7 flex items-center justify-center transition-transform group-hover:scale-95">
               <img src="/logo.png" alt="Novatrum Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-[11px] font-black tracking-[0.3em] text-black uppercase leading-none mt-0.5">
              Novatrum
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] hover:text-black transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 relative z-[110]">
            {/* YEŞİL NOKTALI MASAÜSTÜ BUTONU */}
            <Link href="/client/login" className="hidden md:inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Client Portal
            </Link>
            
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
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[90] bg-white md:hidden flex flex-col pt-24"
          >
            <div className="flex-grow flex flex-col items-center justify-center gap-8 text-center px-8 pb-24">
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
              
              {/* YEŞİL NOKTALI MOBİL BUTON */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + navLinks.length * 0.05 }}
                className="w-full mt-8 px-4"
              >
                <Link 
                  href="/client/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-3 w-full max-w-[280px] py-5 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:scale-105 transition-transform shadow-xl mx-auto"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Client Portal
                </Link>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {children}
      </main>

      {/* FOOTER - DOKUNULMADI */}
      <footer className="w-full bg-white py-16 px-6 md:px-16 mt-12 border-t border-zinc-100/50">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-3">
              <div className="w-7 h-7 flex items-center justify-center">
                <img src="/logo.png" alt="Novatrum Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] font-black tracking-[0.3em] text-black uppercase leading-none mt-0.5">
                Novatrum
              </span>
             </div>
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
               &copy; {new Date().getFullYear()} Novatrum. {t.footer.rights} <br/> 
               {t.footer.builtIn}
             </p>
             
             <div className="flex items-center gap-4 mt-2">
               <Link href="/terms" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                 {t.nav.terms}
               </Link>
               <Link href="/privacy" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                 {t.nav.privacy}
               </Link>
             </div>

          </div>
          
          <div className="flex flex-col sm:flex-row gap-x-12 gap-y-4 items-center">
             <div className="relative inline-block text-left mb-4 sm:mb-0">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="appearance-none bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-[9px] font-bold uppercase tracking-widest outline-none cursor-pointer hover:border-black transition-colors"
                >
                  <option value="en">English</option>
                  <option value="nl">Nederlands</option>
                  <option value="fr">Français</option>
                  <option value="tr">Türkçe</option>
                </select>
             </div>

             <div className="flex gap-8">
                <a href="https://www.linkedin.com/company/novatrum/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">LinkedIn</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}