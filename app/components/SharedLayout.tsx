"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

// DAHA SAĞLAM, MODERN VE "CHAMELEON" (RENK DEĞİŞTİREN) CUSTOM CURSOR
const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false); // Sadece masaüstünde göster

    useEffect(() => {
        // Cihazın fare destekleyip desteklemediğini kontrol et
        const mediaQuery = window.matchMedia("(pointer: fine)");
        setIsDesktop(mediaQuery.matches);

        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Buton, link veya input üzerindeysek cursor'ı büyüt
            if (target.closest('a') || target.closest('button') || target.closest('input') || target.closest('.cursor-pointer')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        if (mediaQuery.matches) {
            window.addEventListener("mousemove", updateMousePosition);
            window.addEventListener("mouseover", handleMouseOver);
        }

        return () => {
            window.removeEventListener("mousemove", updateMousePosition);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, []);

    // Mobilde cursor gösterme
    if (!isDesktop) return null;

    return (
        <>
            {/* Küçük, hızlı takip eden nokta (mix-blend-difference eklendi ve beyaz yapıldı) */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 bg-white mix-blend-difference rounded-full pointer-events-none z-[9999]"
                animate={{
                    x: mousePosition.x - 4,
                    y: mousePosition.y - 4,
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            />

            {/* Büyük, yumuşak takip eden halka (mix-blend-difference eklendi ve beyaz yapıldı) */}
            <motion.div
                className="fixed top-0 left-0 border border-white mix-blend-difference rounded-full pointer-events-none z-[9998]"
                animate={{
                    x: mousePosition.x - (isHovering ? 24 : 16),
                    y: mousePosition.y - (isHovering ? 24 : 16),
                    width: isHovering ? 48 : 32,
                    height: isHovering ? 48 : 32,
                    opacity: isHovering ? 0.8 : 1,
                    backgroundColor: isHovering ? "rgba(255,255,255,0.2)" : "transparent"
                }}
                transition={{ type: "spring", stiffness: 150, damping: 20, mass: 1 }}
            />
        </>
    );
};

export default function SharedLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const { language, setLanguage, t } = useLanguage();
    const pathname = usePathname();

    // TEMİZ SAYFA KONTROLÜ (Header/Footer Gizlenecek Sayfalar)
    const isCleanPage = 
        pathname?.startsWith('/demo') || 
        pathname?.startsWith('/showroom') || 
        pathname?.startsWith('/admin') || 
        pathname?.startsWith('/client');

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

    // EĞER TEMİZ BİR SAYFADAYSAK SADECE ÇOCUKLARI VE CURSOR'U GÖSTER (İmleç her yerde açık)
    if (isCleanPage) {
        return (
            <div className="min-h-screen font-sans relative">
                <CustomCursor />
                {children}
            </div>
        );
    }

    // NORMAL WEB SİTESİ SAYFALARI İÇİN STANDART LAYOUT
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

            {/* FOOTER */}
            <footer className="w-full bg-white py-16 px-6 md:px-16 mt-12 border-t border-zinc-100/50">
                <div className="w-full flex flex-col md:flex-row items-start justify-between gap-12">

                    {/* Şirket Bilgileri */}
                    <div className="flex flex-col gap-4 max-w-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-7 h-7 flex items-center justify-center">
                                <img src="/logo.png" alt="Novatrum Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-[11px] font-black tracking-[0.3em] text-black uppercase leading-none mt-0.5">
                                Novatrum
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                            &copy; {new Date().getFullYear()} Novatrum. {t.footer.rights} <br />
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

                    {/* Link Sütunları */}
                    <div className="flex flex-col sm:flex-row gap-12 md:gap-24 w-full md:w-auto">

                        {/* Navigasyon (Company) */}
                        <div className="flex flex-col gap-5">
                            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Company</span>
                            <div className="flex flex-col gap-3">
                                {navLinks.map((link) => (
                                    <Link key={link.name} href={link.href} className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Dökümantasyonlar (Resources) */}
                        <div className="flex flex-col gap-5">
                            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Resources</span>
                            <div className="flex flex-col gap-3">
                                <Link href="/showroom" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    Showroom
                                </Link>
                                <Link href="/docs" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    Documentation Center
                                </Link>
                                <Link href="/status" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    Novatrum Status
                                </Link>
                                <Link href="/client/login" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    Client Portal
                                </Link>
                            </div>
                        </div>

                        {/* Ayarlar ve Sosyal (Connect) */}
                        <div className="flex flex-col gap-5">
                            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Connect</span>
                            <div className="flex flex-col gap-3">
                                <a href="https://www.linkedin.com/company/novatrum/about/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                                    LinkedIn
                                </a>
                            </div>

                            <div className="relative inline-block text-left mt-2">
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value as any)}
                                    className="appearance-none bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-[9px] font-bold uppercase tracking-widest outline-none cursor-pointer hover:border-black transition-colors w-full"
                                >
                                    <option value="en">English</option>
                                    <option value="nl">Nederlands</option>
                                    <option value="fr">Français</option>
                                    <option value="tr">Türkçe</option>
                                </select>
                            </div>
                        </div>

                    </div>
                </div>
            </footer>
        </div>
    );
}