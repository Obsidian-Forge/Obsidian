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

    // 1. TEMİZ SAYFA KONTROLÜ (Header/Footer Gizlenecek Sayfalar)
    const isCleanPage = 
        pathname?.startsWith('/demo') ||
        pathname?.startsWith('/showroom') || 
        pathname?.startsWith('/admin') || 
        pathname?.startsWith('/client') ||
        pathname?.startsWith('/v');

    // 2. TEMA KONTROLÜ (Products sayfası karanlık mı olsun?)
    const isProductsPage = pathname === '/products';

    // NAVİGASYON LİNKLERİ (Tamamen Dinamik)
    const navLinks = [
        { name: t.nav.home, href: "/" },
        { name: t.nav.services, href: "/services" },
        { name: t.nav.products || "Products", href: "/products" },
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

    // NORMAL WEB SİTESİ SAYFALARI İÇİN DİNAMİK LAYOUT
    return (
        <div className={`min-h-screen font-sans flex flex-col relative transition-colors duration-500 selection:bg-emerald-500 selection:text-white ${isProductsPage ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black selection:bg-black'}`}>

            {/* HEADER - DİNAMİK (Dark/Light) */}
            <header className={`sticky top-0 w-full z-[100] backdrop-blur-xl transition-all duration-300 ${isProductsPage ? 'bg-[#0A0A0A]/90 border-b border-white/5' : 'bg-white/90'}`}>
                <div className="w-full px-6 md:px-12 h-20 md:h-24 flex items-center justify-between relative">

                    <Link href="/" className="flex items-center gap-3 group relative z-[110]" onClick={() => setIsOpen(false)}>
                        <div className="w-7 h-7 flex items-center justify-center transition-transform duration-500 group-hover:scale-95">
                            <img src={isProductsPage ? "/logo-white.png" : "/logo.png"} alt="Novatrum Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className={`text-[11px] font-bold tracking-[0.3em] uppercase leading-none mt-0.5 ${isProductsPage ? 'text-white' : 'text-black'}`}>
                            Novatrum
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors duration-300 ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-5 relative z-[110]">
                        {/* DİNAMİK MASAÜSTÜ BUTONU */}
                        <Link href="/client/login" className={`hidden md:inline-flex items-center gap-2.5 px-8 py-3.5 text-[9px] font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-sm ${isProductsPage ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            {t.nav.gateway}
                        </Link>

                        {/* HAMBURGER MENÜ */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex md:hidden flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none relative"
                            aria-label="Toggle Menu"
                        >
                            <motion.span
                                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                                className={`w-6 h-[2px] block origin-center rounded-full ${isProductsPage ? 'bg-white' : 'bg-black'}`}
                            />
                            <motion.span
                                animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                                className={`w-6 h-[2px] block rounded-full ${isProductsPage ? 'bg-white' : 'bg-black'}`}
                            />
                            <motion.span
                                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                                className={`w-6 h-[2px] block origin-center rounded-full ${isProductsPage ? 'bg-white' : 'bg-black'}`}
                            />
                        </button>
                    </div>
                </div>
            </header>

            {/* MOBILE MENU OVERLAY */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={`fixed inset-0 z-[90] backdrop-blur-3xl md:hidden flex flex-col pt-24 ${isProductsPage ? 'bg-[#0A0A0A]/95' : 'bg-white/95'}`}
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
                                        className={`text-4xl sm:text-5xl font-light uppercase tracking-tighter transition-colors block py-2 ${isProductsPage ? 'text-white hover:text-zinc-400' : 'text-black hover:text-zinc-400'}`}
                                    >
                                        {link.name}
                                    </Link>
                                </motion.div>
                            ))}

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + navLinks.length * 0.05 }}
                                className="w-full mt-10 px-4"
                            >
                                <Link
                                    href="/client/login"
                                    onClick={() => setIsOpen(false)}
                                    className={`inline-flex items-center justify-center gap-3 w-full max-w-[280px] py-5 font-bold uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-transform shadow-xl mx-auto ${isProductsPage ? 'bg-white text-black' : 'bg-black text-white'}`}
                                >
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    {t.nav.gateway}
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-grow">
                {children}
            </main>

            {/* FOOTER - DİNAMİK */}
            <footer className={`w-full py-20 px-6 md:px-12 mt-12 transition-colors duration-500 ${isProductsPage ? 'bg-[#0A0A0A] border-t border-white/5' : 'bg-white'}`}>
                <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16">

                    {/* Şirket Bilgileri */}
                    <div className="flex flex-col gap-6 max-w-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 flex items-center justify-center">
                                <img src={isProductsPage ? "/logo-white.png" : "/logo.png"} alt="Novatrum Logo" className={`w-full h-full object-contain grayscale ${isProductsPage ? 'opacity-100' : 'opacity-80'}`} />
                            </div>
                            <span className={`text-[11px] font-bold tracking-[0.3em] uppercase leading-none mt-0.5 ${isProductsPage ? 'text-white' : 'text-black'}`}>
                                Novatrum
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                            &copy;{new Date().getFullYear()} Novatrum. {t.footer.rights} <br />
                            {t.footer.builtIn}
                        </p>

                        <div className="flex items-center gap-6 mt-4">
                            <Link href="/terms" className={`text-[9px] font-bold text-zinc-400 uppercase tracking-widest transition-colors ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                {t.nav.terms}
                            </Link>
                            <Link href="/privacy" className={`text-[9px] font-bold text-zinc-400 uppercase tracking-widest transition-colors ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                {t.nav.privacy}
                            </Link>
                        </div>
                    </div>

                    {/* Link Sütunları */}
                    <div className="flex flex-col sm:flex-row gap-12 md:gap-24 w-full md:w-auto">

                        {/* Navigasyon (Company) */}
                        <div className="flex flex-col gap-6">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isProductsPage ? 'text-white' : 'text-black'}`}>{t.footer.company || "Company"}</span>
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link key={link.name} href={link.href} className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Dökümantasyonlar (Resources) */}
                        <div className="flex flex-col gap-6">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isProductsPage ? 'text-white' : 'text-black'}`}>{t.footer.resources || "Resources"}</span>
                            <div className="flex flex-col gap-4">
                                <Link href="/showroom" className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                    {t.nav.showroom || "Showroom"}
                                </Link>
                                <Link href="/docs" className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                    {t.nav.documentation || "Documentation"}
                                </Link>
                                <Link href="/status" className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                    {t.nav.systemStatus || "System Status"}
                                </Link>
                                <Link href="/client/login" className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                    {t.nav.gateway}
                                </Link>
                            </div>
                        </div>

                        {/* Ayarlar ve Sosyal (Connect) */}
                        <div className="flex flex-col gap-6">
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${isProductsPage ? 'text-white' : 'text-black'}`}>{t.footer.connect || "Connect"}</span>
                            <div className="flex flex-col gap-4">
                                <a href="https://www.linkedin.com/company/novatrum/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className={`text-[10px] font-bold text-zinc-400 uppercase tracking-widest transition-colors ${isProductsPage ? 'hover:text-white' : 'hover:text-black'}`}>
                                    LinkedIn
                                </a>
                            </div>

                            {/* DİNAMİK DİL SEÇİCİ */}
                            <div className="relative inline-block text-left mt-4 group">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className={`appearance-none rounded-full px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest outline-none cursor-pointer transition-all w-full shadow-sm ${isProductsPage ? 'bg-[#0A0A0A] border border-white/10 text-zinc-400 group-hover:border-white group-hover:text-white' : 'bg-white border border-zinc-200 text-zinc-500 group-hover:border-black group-hover:text-black'}`}
                                >
                                    <option value="en" className={isProductsPage ? 'bg-[#0A0A0A]' : 'bg-white'}>English</option>
                                    <option value="nl" className={isProductsPage ? 'bg-[#0A0A0A]' : 'bg-white'}>Nederlands</option>
                                    <option value="fr" className={isProductsPage ? 'bg-[#0A0A0A]' : 'bg-white'}>Français</option>
                                    <option value="tr" className={isProductsPage ? 'bg-[#0A0A0A]' : 'bg-white'}>Türkçe</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className={`w-3 h-3 transition-colors ${isProductsPage ? 'text-zinc-500 group-hover:text-white' : 'text-zinc-400 group-hover:text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </footer>
        </div>
    );
}