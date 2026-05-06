'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CreativeDemoPage() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });

    const x1 = useTransform(scrollYProgress, [0, 1], [0, -500]);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [carouselWidth, setCarouselWidth] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (carouselRef.current) {
            setCarouselWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
        }
        const handleResize = () => {
            if (carouselRef.current) {
                setCarouselWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMenuOpen]);

    const fadeUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
};

    const demoLinks = [
        { id: 'projects', label: 'Projects' },
        { id: 'philosophy', label: 'Philosophy' },
        { id: 'studio', label: 'Studio' },
        { id: 'contact', label: 'Contact' }
    ];

    // YENİ: Smooth Scroll Fonksiyonu
    const scrollToSection = (sectionId: string) => {
        setIsMenuOpen(false); // Mobil menü açıksa kapat
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F4F4] text-black font-sans selection:bg-black selection:text-white relative" ref={containerRef}>

            {/* --- UPDATED VERTICAL FLOATING ISLAND --- */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] bg-white/80 backdrop-blur-xl border border-zinc-200 shadow-[0_20px_40px_rgba(0,0,0,0.05)] rounded-full py-8 px-3 flex flex-col items-center gap-6">

                {/* Status Indicator */}
                <div className="relative group cursor-pointer flex flex-col items-center">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-zinc-950 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-2 shadow-xl">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Novatrum Node: Operational
                    </div>
                </div>

                <div className="w-4 h-[1px] bg-zinc-200" />

                {/* YENİ: START PROJECT BUTONU (Teklif Formuna Gider) */}
                {/* Buradaki 'demo_id' kısmını her sayfa için o demonun adıyla (quantum, fintech vb.) değiştirmeyi unutma */}
                <button
                    onClick={() => router.push('/get-quote?demo=quantum')}
                    className="group flex flex-col items-center gap-4 outline-none"
                >
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 transition-all shadow-md">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 group-hover:text-emerald-700 transition-colors pt-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Start Project
                    </span>
                </button>

                <div className="w-4 h-[1px] bg-zinc-200" />

                {/* CLOSE DEMO BUTONU */}
                <button onClick={() => router.push('/showroom')} className="group flex flex-col items-center gap-4 outline-none">
                    <div className="w-8 h-8 bg-zinc-950 text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-950 group-hover:text-zinc-500 transition-colors pt-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Close Demo
                    </span>
                </button>
            </div>

            {/* MOBİL MENÜ OVERLAY */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: '-100%' }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: '-100%' }}
                        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                        className="fixed inset-0 z-[120] bg-zinc-950 text-white flex flex-col justify-center items-center px-8"
                    >
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-12 right-8 md:right-16 text-[10px] font-black uppercase tracking-widest hover:text-zinc-400 transition-colors">
                            Close [X]
                        </button>

                        <div className="flex flex-col gap-6 text-center w-full max-w-md">
                            {demoLinks.map((link, index) => (
                                <motion.div key={link.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }} className="overflow-hidden">
                                    <span onClick={() => scrollToSection(link.id)} className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter cursor-pointer hover:text-zinc-500 transition-colors block py-2">
                                        {link.label}
                                    </span>
                                </motion.div>
                            ))}
                            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} onClick={() => scrollToSection('contact')} className="mt-12 bg-white text-black py-4 px-8 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform w-full sm:w-auto mx-auto">
                                Start a Project
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AURA CREATIVE DEMO */}
            <div className="pt-8 relative z-10">

                {/* Navbar */}
                <nav className="px-8 md:px-16 pb-8 flex justify-between items-center relative z-[110]">
                    <h1 className="text-2xl font-black tracking-tighter uppercase cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Aura.</h1>
                    <div className="hidden md:flex gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        {demoLinks.map(link => (
                            <span key={link.id} onClick={() => scrollToSection(link.id)} className="cursor-pointer hover:text-black transition-colors">{link.label}</span>
                        ))}
                    </div>
                    <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-[10px] font-black uppercase tracking-widest hover:text-zinc-600 transition-colors py-2 px-4 border border-black/10 rounded-full">Menu</button>
                </nav>

                <main>
                    {/* HERO */}
                    <section className="px-8 md:px-16 pt-12 pb-24 overflow-hidden">
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-6xl">
                            <h2 className="text-[12vw] font-black tracking-tighter uppercase leading-[0.85] text-zinc-900">
                                Shaping <br />
                                <span className="text-zinc-400">Tomorrow's</span> <br />
                                Spaces.
                            </h2>
                        </motion.div>

                        {/* DRAGGABLE GALLERY */}
                        <motion.div ref={carouselRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2, ease: [0.23, 1, 0.32, 1] }} className="mt-20 w-full h-[60vh] md:h-[80vh] overflow-hidden relative group cursor-grab active:cursor-grabbing rounded-3xl">
                            <motion.div drag="x" dragConstraints={{ right: 0, left: -carouselWidth }} dragElastic={0.1} className="flex h-full w-max gap-4">
                                {[
                                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=2070&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
                                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
                                ].map((imgUrl, i) => (
                                    <div key={i} className="h-full w-[85vw] md:w-[70vw] shrink-0">
                                        <img src={imgUrl} alt={`Project ${i}`} className="w-full h-full object-cover rounded-3xl grayscale hover:grayscale-0 transition-all duration-700 pointer-events-none" />
                                    </div>
                                ))}
                            </motion.div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                <span className="bg-black/50 backdrop-blur-md text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">Hold & Drag</span>
                            </div>
                        </motion.div>
                    </section>

                    {/* MARQUEE */}
                    <section className="py-24 overflow-hidden border-y border-zinc-200 bg-white">
                        <motion.div style={{ x: x1 }} className="whitespace-nowrap flex items-center gap-10">
                            <h2 className="text-[10vw] font-black uppercase tracking-tighter text-zinc-100 shrink-0">Aura Creative Studio — Minimalist Engineering — </h2>
                            <h2 className="text-[10vw] font-black uppercase tracking-tighter text-zinc-100 shrink-0">Aura Creative Studio — Minimalist Engineering — </h2>
                        </motion.div>
                    </section>

                    {/* PHILOSOPHY SECTION */}
                    <section id="philosophy" className="px-8 md:px-16 py-32 bg-white">
                        <div className="max-w-4xl mx-auto text-center">
                            <motion.h3 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-12">Our Philosophy</motion.h3>
                            <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.2]">
                                We believe that true luxury lies in <span className="text-zinc-400 italic font-medium">simplicity</span>. By stripping away the unnecessary, we engineer environments that speak louder through their silence.
                            </motion.p>
                        </div>
                    </section>

                    {/* PROJECTS SECTION */}
                    <section id="projects" className="px-8 md:px-16 py-32 bg-[#F4F4F4] rounded-t-[40px] md:rounded-t-[80px] shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Selected Works</h3>
                                <p className="text-4xl font-black tracking-tighter uppercase text-zinc-900">Recent Projects</p>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest border-b-2 border-black pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors w-max">
                                View All Archives
                            </button>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="group cursor-pointer">
                                <div className="w-full aspect-[3/4] overflow-hidden mb-8 rounded-2xl relative">
                                    <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop" alt="Villa" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                </div>
                                <div className="flex justify-between items-end border-b border-zinc-200 pb-4 group-hover:border-black transition-colors">
                                    <div>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-1 text-zinc-900 group-hover:translate-x-2 transition-transform">The Glass House</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:translate-x-2 transition-transform delay-75">Antwerp // Residential</p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-black transition-colors">2026</span>
                                </div>
                            </motion.div>

                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="group cursor-pointer md:mt-40">
                                <div className="w-full aspect-[3/4] overflow-hidden mb-8 rounded-2xl relative">
                                    <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" alt="Office" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                                </div>
                                <div className="flex justify-between items-end border-b border-zinc-200 pb-4 group-hover:border-black transition-colors">
                                    <div>
                                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-1 text-zinc-900 group-hover:translate-x-2 transition-transform">Lumina HQ</h4>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:translate-x-2 transition-transform delay-75">Brussels // Commercial</p>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-black transition-colors">2025</span>
                                </div>
                            </motion.div>
                        </div>
                    </section>

                    {/* STUDIO (SERVICES) SECTION */}
                    <section id="studio" className="px-8 md:px-16 py-32 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                            <div className="md:col-span-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Expertise</h3>
                                <p className="text-3xl font-black tracking-tighter uppercase text-zinc-900 leading-none">Disciplines <br /> & Services.</p>
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-0 border-t border-zinc-900">
                                {[
                                    { title: 'Architectural Design', desc: 'Comprehensive blueprinting from concept to structural realization.' },
                                    { title: 'Interior Architecture', desc: 'Curating spatial experiences through light, material, and form.' },
                                    { title: 'Urban Planning', desc: 'Designing macro-environments that integrate seamlessly with nature.' }
                                ].map((service, i) => (
                                    <div key={i} className="group border-b border-zinc-200 py-8 hover:bg-[#F4F4F4] transition-colors cursor-pointer px-4 -mx-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h4 className="text-3xl font-black uppercase tracking-tighter text-zinc-400 group-hover:text-zinc-900 transition-colors">{service.title}</h4>
                                        <p className="text-xs font-bold text-zinc-500 max-w-sm group-hover:text-zinc-700 transition-colors">{service.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CONTACT (FOOTER) SECTION */}
                    <footer id="contact" className="bg-zinc-950 text-white px-8 md:px-16 pt-32 pb-16 flex flex-col justify-between min-h-[70vh] rounded-t-[40px] md:rounded-t-[80px]">
                        <div className="flex flex-col items-center justify-center text-center flex-1">
                            <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-10 leading-[0.9]">Let's Build <br /> The Future.</h2>
                            <button className="bg-white text-black px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:scale-105 transition-transform shadow-2xl">
                                Start a Conversation
                            </button>
                        </div>

                        <div className="mt-20 pt-8 border-t border-zinc-800 w-full flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                            <div className="flex gap-6">
                                <span className="hover:text-white transition-colors cursor-pointer">Instagram</span>
                                <span className="hover:text-white transition-colors cursor-pointer">LinkedIn</span>
                                <span className="hover:text-white transition-colors cursor-pointer">Behance</span>
                            </div>
                            <span className="text-zinc-600">© 2026 Aura Creative. Powered by <span className="text-zinc-300">Novatrum Infrastructure</span></span>
                        </div>
                    </footer>
                </main>

            </div>
        </div>
    );
}