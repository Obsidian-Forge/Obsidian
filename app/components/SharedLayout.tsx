"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function SharedLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [visible, setVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const { language, setLanguage, t } = useLanguage();

    const navLinks = [
        { name: t.nav.home, href: "/" },
        { name: t.nav.services, href: "/services" },
        { name: t.nav.products, href: "/products" },
        { name: t.nav.process, href: "/process" },
        { name: t.nav.contact, href: "/contact" },
    ];

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    }, [isOpen]);

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        if (currentScrollY < 20) setVisible(true);
        else if (currentScrollY > lastScrollY && currentScrollY > 80) setVisible(false);
        else setVisible(true);
        setLastScrollY(currentScrollY);
    }, [lastScrollY]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="min-h-screen font-sans flex flex-col bg-white text-black selection:bg-black selection:text-white">

            {/* HEADER */}
            <motion.header
                animate={{ y: visible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed top-0 w-full z-[100] bg-white border-b border-zinc-100"
            >
                <div className="w-full px-6 md:px-12 h-20 md:h-24 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
                        <img src="/logo.png" alt="Novatrum" className="w-7 h-7 object-contain" />
                        <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-black">Novatrum</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map(link => (
                            <Link key={link.name} href={link.href} className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex md:hidden flex-col justify-center items-center w-10 h-10 gap-1.5"
                    >
                        <motion.span animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} className="w-6 h-[2px] bg-black rounded-full" />
                        <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-[2px] bg-black rounded-full" />
                        <motion.span animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} className="w-6 h-[2px] bg-black rounded-full" />
                    </button>
                </div>
            </motion.header>

            {/* MOBILE MENU */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-[90] bg-white md:hidden flex flex-col pt-24"
                    >
                        <div className="flex flex-col items-center justify-center gap-6 px-8 pb-32">
                            {navLinks.map((link, i) => (
                                <motion.div key={link.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                                    <Link href={link.href} onClick={() => setIsOpen(false)} className="text-4xl font-light uppercase tracking-tighter text-black hover:text-zinc-400 transition-colors">
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-grow">{children}</main>

            {/* FOOTER */}
            <footer className="w-full py-20 px-6 md:px-12 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16">
                    
                    <div className="flex flex-col gap-6 max-w-sm">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="Novatrum" className="w-7 h-7 object-contain opacity-80" />
                            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-black">Novatrum</span>
                        </div>
                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
                            &copy;{new Date().getFullYear()} Novatrum. {t.footer.rights}
                        </p>
                        <div className="flex gap-6">
                            <Link href="/terms" className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">{t.footer.terms}</Link>
                            <Link href="/privacy" className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">{t.footer.privacy}</Link>
                        </div>
                    </div>

                    <div className="flex gap-12 md:gap-20">
                        
                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-medium uppercase tracking-widest text-black">{t.footer.company}</span>
                            {navLinks.map(link => (
                                <Link key={link.name} href={link.href} className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-medium uppercase tracking-widest text-black">{t.footer.resources}</span>
                            <Link href="/showroom" className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">{t.footer.showroom}</Link>
                            <Link href="/docs" className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">{t.footer.documentation}</Link>
                        </div>

                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-medium uppercase tracking-widest text-black">{t.footer.connect}</span>
                            <a href="https://linkedin.com/company/novatrum" target="_blank" className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">
                                {t.footer.linkedin}
                            </a>
                            <div className="mt-2">
                                <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="appearance-none rounded-full px-4 py-2 text-[9px] font-medium uppercase tracking-widest bg-zinc-50 border border-zinc-200 text-zinc-500 cursor-pointer">
                                    <option value="en">EN</option>
                                    <option value="nl">NL</option>
                                    <option value="fr">FR</option>
                                    <option value="tr">TR</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}