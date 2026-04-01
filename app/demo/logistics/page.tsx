'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function LogisticsDemoPage() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Scroll animasyonları
    const { scrollYProgress } = useScroll();
    const yHero = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const xMarquee = useTransform(scrollYProgress, [0, 1], [0, -1000]);

    useEffect(() => {
        window.scrollTo(0, 0);
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
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
    };

    const demoLinks = [
        { id: 'tracking', label: 'Live Tracking' },
        { id: 'network', label: 'Global Map' },
        { id: 'features', label: 'AI Core' },
        { id: 'fleet', label: 'Fleet Assets' }
    ];

    const scrollToSection = (sectionId: string) => {
        setIsMenuOpen(false);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-cyan-500 selection:text-white relative overflow-hidden flex flex-col">

            {/* --- ARKA PLAN ORTAM IŞIĞI (AMBIENT GLOW) --- */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none" />

            {/* --- UPDATED VERTICAL FLOATING ISLAND (LOGISTICS THEME) --- */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-full py-8 px-3 flex flex-col items-center gap-6">

                {/* Node Status */}
                <div className="relative group cursor-pointer flex flex-col items-center">
                    <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-2 shadow-xl">
                        <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                        Novatrum Node: Active
                    </div>
                </div>

                <div className="w-4 h-[1px] bg-zinc-800" />

                {/* START PROJECT BUTTON - LOGISTICS MODE */}
                <button
                    onClick={() => router.push('/get-quote?demo=logistics')}
                    className="group flex flex-col items-center gap-4 outline-none"
                >
                    <div className="w-8 h-8 bg-cyan-500 text-black rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500 group-hover:text-cyan-400 transition-colors pt-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Start Project
                    </span>
                </button>

                <div className="w-4 h-[1px] bg-zinc-800" />

                {/* CLOSE DEMO BUTTON */}
                <button onClick={() => router.push('/showroom')} className="group flex flex-col items-center gap-4 outline-none">
                    <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center group-hover:bg-cyan-400 group-hover:scale-110 transition-all shadow-md">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-cyan-400 transition-colors pt-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Close Demo
                    </span>
                </button>
            </div>
            {/* --- MOBİL MENÜ OVERLAY --- */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-[120] bg-zinc-950/95 backdrop-blur-3xl text-white flex flex-col justify-center items-center px-8 border-l border-white/10"
                    >
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-12 right-8 md:right-16 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-cyan-400 transition-colors">
                            Close [X]
                        </button>
                        <div className="flex flex-col gap-6 text-center w-full max-w-md">
                            {demoLinks.map((link, index) => (
                                <motion.div key={link.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + (index * 0.1) }}>
                                    <span onClick={() => scrollToSection(link.id)} className="text-4xl md:text-5xl font-black tracking-tighter cursor-pointer hover:text-cyan-400 transition-colors block py-2">
                                        {link.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="pt-6 relative z-10 px-6 md:px-12 max-w-[1600px] mx-auto flex-1 w-full">

                {/* --- PREMIUM NAVBAR --- */}
                <nav className="bg-zinc-900/50 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-full px-8 py-4 flex justify-between items-center relative z-[110]">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-black">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h1 className="text-xl font-black tracking-tighter text-white">NEXUS.</h1>
                    </div>
                    <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                        {demoLinks.map(link => (
                            <span key={link.id} onClick={() => scrollToSection(link.id)} className="cursor-pointer hover:text-cyan-400 transition-colors">{link.label}</span>
                        ))}
                    </div>
                    <button onClick={() => setIsMenuOpen(true)} className="md:hidden w-10 h-10 bg-white/10 rounded-full flex flex-col items-center justify-center gap-1 border border-white/10">
                        <span className="w-4 h-0.5 bg-white rounded-full" />
                        <span className="w-4 h-0.5 bg-white rounded-full" />
                    </button>
                </nav>

                <main className="pb-16">

                    {/* --- SECTION 1: HERO (COMMAND CENTER) --- */}
                    <section id="tracking" className="pt-24 pb-20 md:pt-40 md:pb-32 text-center relative">
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-5xl mx-auto relative z-10">

                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(34,211,238,0.1)]">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                Satellite Uplink: Secure
                            </div>

                            <h2 className="text-5xl md:text-8xl lg:text-[100px] font-black tracking-tighter text-white leading-[0.9] mb-8">
                                Precision in <br /> Every Mile.
                            </h2>

                            <p className="text-zinc-400 font-medium text-lg md:text-xl max-w-2xl mx-auto mb-16">
                                The ultimate AI-driven logistics infrastructure. Track fleets, predict delays, and automate customs in real-time across the globe.
                            </p>

                            {/* Arama / Takip Çubuğu */}
                            <div className="bg-zinc-900/80 backdrop-blur-xl p-2 rounded-full shadow-2xl border border-white/10 flex items-center w-full max-w-2xl mx-auto transition-all focus-within:border-cyan-500/50 focus-within:shadow-[0_0_40px_rgba(34,211,238,0.15)] relative z-20">
                                <div className="pl-6 text-zinc-500">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <input type="text" placeholder="Enter Cargo ID (e.g. NX-992-B)" className="flex-1 bg-transparent border-none outline-none px-6 text-sm font-bold text-white placeholder:text-zinc-600" />
                                <button className="bg-white text-black px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors">
                                    Locate Freight
                                </button>
                            </div>

                        </motion.div>
                    </section>

                    {/* --- SECTION 2: LIVE RADAR MAP --- */}
                    <section id="network" className="py-20">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-4">Global Network</h3>
                                <p className="text-4xl font-black tracking-tighter text-white">Live Operations Map</p>
                            </div>
                            <div className="flex gap-4">
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Air</span>
                                <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400"><span className="w-2 h-2 bg-blue-500 rounded-full" /> Ocean</span>
                            </div>
                        </div>

                        <div className="w-full h-[60vh] md:h-[70vh] bg-zinc-900 rounded-[40px] border border-white/5 overflow-hidden relative shadow-2xl group">
                            {/* Koyu Dünya Haritası Görseli */}
                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" alt="Global Map" className="w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950 opacity-80" />

                            {/* Radar Efekti */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/20 rounded-full" />

                            {/* Nokta 1: New York */}
                            <div className="absolute top-[30%] left-[25%] flex flex-col items-center">
                                <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white mt-2 bg-black/50 px-2 py-1 rounded backdrop-blur-md">Node: NYC</span>
                            </div>

                            {/* Nokta 2: London */}
                            <div className="absolute top-[25%] left-[48%] flex flex-col items-center">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white mt-2 bg-black/50 px-2 py-1 rounded backdrop-blur-md">Node: LND</span>
                            </div>

                            {/* Nokta 3: Tokyo */}
                            <div className="absolute top-[35%] left-[80%] flex flex-col items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white mt-2 bg-black/50 px-2 py-1 rounded backdrop-blur-md">Node: TKY</span>
                            </div>

                            {/* Havada Duran UI Kartı */}
                            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="absolute bottom-8 left-8 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-6 rounded-3xl max-w-sm">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">System Status</p>
                                <h4 className="text-2xl font-black text-white mb-4">9,402 Active Shipments</h4>
                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-400 w-[92%]" />
                                </div>
                                <p className="text-xs text-zinc-400 font-bold mt-4">92% arriving ahead of schedule. Zero weather delays reported.</p>
                            </motion.div>
                        </div>
                    </section>

                    {/* --- SECTION 3: BENTO GRID (TECH FEATURES) --- */}
                    <section id="features" className="py-20">
                        <div className="mb-12 text-center md:text-left">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-4">Infrastructure</h3>
                            <p className="text-4xl font-black tracking-tighter text-white">The AI Logistics Core.</p>
                        </div>

                        {/* PINTEREST/BENTO STYLE GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[250px]">

                            {/* Kart 1: Geniş Harita Kutusu */}
                            <div className="md:col-span-2 lg:col-span-2 bg-zinc-900 rounded-[32px] p-8 border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-white/5">
                                        <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-white mb-2">Predictive Routing</h4>
                                        <p className="text-sm font-medium text-zinc-400">Our neural network analyzes weather, port traffic, and political events to reroute cargo in milliseconds.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Kart 2: İstatistik Kutusu */}
                            <div className="bg-zinc-900 rounded-[32px] p-8 border border-white/5 flex flex-col justify-between hover:-translate-y-2 transition-transform duration-500">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Fleet Efficiency</p>
                                <div>
                                    <h4 className="text-5xl font-black text-white">99<span className="text-2xl text-zinc-500">.8%</span></h4>
                                    <p className="text-xs font-bold text-emerald-400 mt-2">+2.4% vs Industry Avg</p>
                                </div>
                            </div>

                            {/* Kart 3: Uzun Görsel Kutusu */}
                            <div className="md:col-span-1 lg:col-span-1 md:row-span-2 bg-zinc-900 rounded-[32px] border border-white/5 relative overflow-hidden group">
                                <img src="https://images.unsplash.com/photo-1586528116311-ad8ed7a64a66?q=80&w=2070&auto=format&fit=crop" alt="Warehouse" className="w-full h-full object-cover opacity-50 mix-blend-luminosity group-hover:scale-110 transition-transform duration-1000" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8">
                                    <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10 mb-4 inline-block">Automation</span>
                                    <h4 className="text-xl font-black text-white">Robotic Sorting Nodes</h4>
                                </div>
                            </div>

                            {/* Kart 4: Uyarı Kutusu */}
                            <div className="bg-cyan-950 border border-cyan-500/30 rounded-[32px] p-8 text-cyan-50 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Customs Clearance</p>
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                </div>
                                <p className="text-sm font-medium text-cyan-100/70">Smart contracts pre-clear borders. Zero paperwork. Zero delays.</p>
                            </div>

                            {/* Kart 5: Geniş Yatay Kutu */}
                            <div className="md:col-span-2 lg:col-span-2 bg-zinc-900 rounded-[32px] p-8 border border-white/5 flex items-center justify-between">
                                <div>
                                    <h4 className="text-2xl font-black text-white mb-2">Cold Chain Protocol</h4>
                                    <p className="text-sm font-medium text-zinc-400 max-w-sm">IoT sensors monitor medical and food supplies with 0.1°C precision.</p>
                                </div>
                                <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500/30">
                                    <span className="text-xl font-black text-emerald-400">-18°</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- SECTION 4: FLEET ASSETS --- */}
                    <section id="fleet" className="py-20">
                        <div className="mb-12">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500 mb-4">Assets</h3>
                            <p className="text-4xl font-black tracking-tighter text-white">Multi-Modal Fleet.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Havacılık */}
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="group relative h-[400px] rounded-[40px] overflow-hidden border border-white/5">
                                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop" alt="Plane" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <h4 className="text-3xl font-black text-white mb-2">Aero Nexus</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">124 Cargo Jets • 24h Global Delivery</p>
                                </div>
                            </motion.div>

                            {/* Denizcilik */}
                            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="group relative h-[400px] rounded-[40px] overflow-hidden border border-white/5">
                                <img src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?q=80&w=2070&auto=format&fit=crop" alt="Ship" className="w-full h-full object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                                <div className="absolute bottom-10 left-10">
                                    <h4 className="text-3xl font-black text-white mb-2">Oceanic Core</h4>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">86 Ultra-Large Vessels • Zero-Carbon Ready</p>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                </main>
            </div>

            {/* --- MARQUEE --- */}
            <div className="py-12 border-y border-white/5 bg-zinc-900 overflow-hidden w-full relative z-20">
                <motion.div style={{ x: xMarquee }} className="whitespace-nowrap flex items-center gap-16">
                    {[1, 2, 3, 4].map((_, i) => (
                        <h2 key={i} className="text-[5vw] font-black uppercase tracking-tighter text-zinc-800 shrink-0">
                            ZERO LATENCY • GLOBAL REACH • PREDICTIVE AI • QUANTUM SECURITY •
                        </h2>
                    ))}
                </motion.div>
            </div>

            {/* --- FOOTER CTA --- */}
            <footer className="w-full bg-zinc-950 text-white pt-32 pb-16 px-6 relative z-20">
                <div className="max-w-4xl mx-auto text-center mb-32">
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9]">Start Moving <br /> The World.</h2>
                    <button className="bg-white text-black px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] hover:bg-cyan-400 hover:text-white transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]">
                        Initialize Contract
                    </button>
                </div>

                <div className="max-w-[1600px] mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-black">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <span className="text-zinc-400">NEXUS LOGISTICS</span>
                    </div>
                    <div className="flex gap-8">
                        <span className="hover:text-cyan-400 transition-colors cursor-pointer">API Docs</span>
                        <span className="hover:text-cyan-400 transition-colors cursor-pointer">Security Protocol</span>
                        <span className="hover:text-cyan-400 transition-colors cursor-pointer">System Status</span>
                    </div>
                    <span className="text-zinc-600">© 2026. Powered by <span className="text-zinc-400">Novatrum Infrastructure</span></span>
                </div>
            </footer>
        </div>
    );
}