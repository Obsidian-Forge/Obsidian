// app/components/SharedLayout.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

export default function SharedLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const { language, setLanguage, t } = useLanguage();

    const navLinks = [
        { name: t.nav.home, href: "/" },
        { name: t.nav.services, href: "/services" },
        { name: t.nav.products, href: "/products" },
        { name: t.nav.process, href: "/process" },
        { name: t.nav.contact, href: "/contact" },
    ];

    // Mobil menü için ekstra linkler
    const mobileExtraLinks = [
        { name: t.footer.showroom, href: "/showroom" },
        { name: t.footer.documentation, href: "/docs" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen font-sans flex flex-col bg-white text-black selection:bg-black selection:text-white">

            {/* HEADER */}
            <header className="sticky top-0 w-full z-[100] bg-white">
                <div className="w-full px-6 md:px-12 h-16 md:h-20 flex items-center justify-between">
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
                        className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5"
                        aria-label="Toggle menu"
                    >
                        <span className={`w-6 h-[2px] bg-black rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
                        <span className={`w-6 h-[2px] bg-black rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-[2px] bg-black rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
                    </button>
                </div>
            </header>

            {/* MOBILE MENU - Nav linkleri + Showroom + Documentation */}
            <div className={`fixed inset-0 z-[90] bg-white md:hidden flex flex-col pt-20 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="flex flex-col items-center justify-center gap-6 px-8 pb-32">
                    {/* Ana nav linkleri */}
                    {navLinks.map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-4xl font-light uppercase tracking-tighter text-black hover:text-zinc-400 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    
                    {/* Ayraç */}
                    <div className="w-12 h-[1px] bg-zinc-200 my-4" />
                    
                    {/* Ekstra linkler - sadece mobilde */}
                    {mobileExtraLinks.map(link => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-2xl font-light uppercase tracking-tighter text-zinc-400 hover:text-black transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>

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
                                <Link key={link.name} href={link.href} className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">{link.name}</Link>
                            ))}
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-medium uppercase tracking-widest text-black">{t.footer.resources}</span>
                            <Link href="/showroom" className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">{t.footer.showroom}</Link>
                            <Link href="/docs" className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">{t.footer.documentation}</Link>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-[9px] font-medium uppercase tracking-widest text-black">{t.footer.connect}</span>
                            <a href="https://linkedin.com/company/novatrum" target="_blank" className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-black">{t.footer.linkedin}</a>
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

            {/* SCROLL TO TOP */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-50 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shadow-lg hover:bg-zinc-800 hover:scale-110 transition-all duration-500 ${
                    showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
                aria-label="Scroll to top"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
        </div>
    );
}