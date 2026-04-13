"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function SharedLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const pathname = usePathname();

    // TEMİZ SAYFA KONTROLÜ (Header/Footer Gizlenecek Sayfalar)
    const isCleanPage = 
        pathname?.startsWith('/demo') ||
        pathname?.startsWith('/showroom') || 
        pathname?.startsWith('/admin') || 
        pathname?.startsWith('/client') ||
        pathname?.startsWith('/v');

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

    // EĞER TEMİZ BİR SAYFADAYSAK SADECE ÇOCUKLARI GÖSTER
    if (isCleanPage) {
        return (
            <div className="min-h-screen font-sans relative bg-white">
                {children}
            </div>
        );
    }

    // NORMAL WEB SİTESİ SAYFALARI İÇİN ULTRA-PREMIUM LAYOUT
    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col relative selection:bg-black selection:text-white">

            {/* HEADER - PURE WHITE GLASS (Sınırlar kaldırıldı) */}
            <header className="sticky top-0 w-full z-[100] bg-white/90 backdrop-blur-xl transition-all duration-300">
                <div className="w-full px-6 md:px-12 h-20 md:h-24 flex items-center justify-between relative">

                    <Link href="/" className="flex items-center gap-3 group relative z-[110]" onClick={() => setIsOpen(false)}>
                        <div className="w-7 h-7 flex items-center justify-center transition-transform duration-500 group-hover:scale-95">
                            <img src="/logo.png" alt="Novatrum Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[11px] font-bold tracking-[0.3em] text-black uppercase leading-none mt-0.5">
                            Novatrum
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors duration-300">
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-5 relative z-[110]">
                        {/* YEŞİL NOKTALI MASAÜSTÜ BUTONU */}
                        <Link href="/client/login" className="hidden md:inline-flex items-center gap-2.5 px-8 py-3.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 hover:scale-105 transition-all shadow-sm">
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
                                className="w-6 h-[2px] bg-black block origin-center rounded-full"
                            />
                            <motion.span
                                animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                                className="w-6 h-[2px] bg-black block rounded-full"
                            />
                            <motion.span
                                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                className="w-6 h-[2px] bg-black block origin-center rounded-full"
                            />
                        </button>
                    </div>
                </div>
            </header>

            {/* MOBILE MENU OVERLAY - FROSTED GLASS */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed inset-0 z-[90] bg-white/95 backdrop-blur-3xl md:hidden flex flex-col pt-24"
                    >
                        <div className="flex-grow flex flex-col items-center justify-center gap-6 text-center px-8 pb-32">
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
                                        className="text-4xl sm:text-5xl font-light uppercase tracking-tighter text-black hover:text-zinc-400 transition-colors block py-2"
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
                                className="w-full mt-10 px-4"
                            >
                                <Link
                                    href="/client/login"
                                    onClick={() => setIsOpen(false)}
                                    className="inline-flex items-center justify-center gap-3 w-full max-w-[280px] py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-transform shadow-xl mx-auto"
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

            {/* ULTRA-PREMIUM FOOTER (Sınırlar kaldırıldı) */}
            <footer className="w-full bg-white py-20 px-6 md:px-12 mt-12">
                <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16">

                    {/* Şirket Bilgileri */}
                    <div className="flex flex-col gap-6 max-w-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 flex items-center justify-center">
                                <img src="/logo.png" alt="Novatrum Logo" className="w-full h-full object-contain grayscale opacity-80" />
                            </div>
                            <span className="text-[11px] font-bold tracking-[0.3em] text-black uppercase leading-none mt-0.5">
                                Novatrum
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                            &copy; {new Date().getFullYear()} Novatrum. {t.footer.rights} <br />
                            {t.footer.builtIn}
                        </p>

                        <div className="flex items-center gap-6 mt-4">
                            <Link href="/terms" className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                {t.nav.terms}
                            </Link>
                            <Link href="/privacy" className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                {t.nav.privacy}
                            </Link>
                        </div>
                    </div>

                    {/* Link Sütunları */}
                    <div className="flex flex-col sm:flex-row gap-12 md:gap-24 w-full md:w-auto">

                        {/* Navigasyon (Company) */}
                        <div className="flex flex-col gap-6">
                            <span className="text-[9px] font-bold text-black uppercase tracking-widest">Company</span>
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link key={link.name} href={link.href} className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Dökümantasyonlar (Resources) */}
                        <div className="flex flex-col gap-6">
                            <span className="text-[9px] font-bold text-black uppercase tracking-widest">Resources</span>
                            <div className="flex flex-col gap-4">
                                <Link href="/showroom" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    Showroom
                                </Link>
                                <Link href="/docs" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    Documentation
                                </Link>
                                <Link href="/status" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    System Status
                                </Link>
                                <Link href="/client/login" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    Client Portal
                                </Link>
                            </div>
                        </div>

                        {/* Ayarlar ve Sosyal (Connect) */}
                        <div className="flex flex-col gap-6">
                            <span className="text-[9px] font-bold text-black uppercase tracking-widest">Connect</span>
                            <div className="flex flex-col gap-4">
                                <a href="https://www.linkedin.com/company/novatrum/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    LinkedIn
                                </a>
                            </div>

                            {/* PREMIUM DİL SEÇİCİ */}
                            <div className="relative inline-block text-left mt-4 group">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="appearance-none bg-white border border-zinc-200 rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500 outline-none cursor-pointer group-hover:border-black group-hover:text-black transition-all w-full shadow-sm"
                                >
                                    <option value="en">English</option>
                                    <option value="nl">Nederlands</option>
                                    <option value="fr">Français</option>
                                    <option value="tr">Türkçe</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-3 h-3 text-zinc-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </footer>
        </div>
    );
}