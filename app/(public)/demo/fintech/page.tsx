'use client';

import React, { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

import { useRouter } from 'next/navigation';

export default function FintechDemoPage() {
    const router = useRouter();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] } }
    };

    const navItems = [
        { label: 'Cards', id: 'cards' },
        { label: 'Wealth', id: 'wealth' },
        { label: 'Crypto', id: 'crypto' }
    ];

    // YENİ: İlgili bölüme kaydırma fonksiyonu
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="flex min-h-screen bg-black text-black font-sans selection:bg-[#D4FF00] selection:text-black">

            {/* --- 1. SOL SABİT MENÜ --- */}
            <nav className="fixed top-0 left-0 w-[80px] md:w-[100px] h-screen bg-[#0A0A0A] border-r border-white/10 z-[100] flex flex-col justify-between py-10 items-center">
                {/* Logo */}
                <div onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-white cursor-pointer -rotate-90 origin-center text-2xl font-black tracking-tighter mt-10 hover:text-[#D4FF00] transition-colors">
                    AEGIS.
                </div>

                {/* Nav Links (Dikey) */}
                <div className="flex flex-col gap-16">
                    {navItems.map((item) => (
                        <div key={item.id} className="-rotate-90 origin-center">
                            <span
                                onClick={() => scrollToSection(item.id)}
                                className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 hover:text-[#D4FF00] transition-colors cursor-pointer whitespace-nowrap"
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Alt İkon */}
                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-[#D4FF00] hover:text-black hover:border-[#D4FF00] transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </div>
            </nav>

            {/* --- SAĞ İÇERİK ALANI (Sol menünün genişliği kadar sağa itilir) --- */}
            <div className="flex-1 ml-[80px] md:ml-[100px] relative w-full">

                {/* --- UPDATED VERTICAL FLOATING ISLAND (FINTECH THEME) --- */}
                <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-full py-8 px-3 flex flex-col items-center gap-6 transition-all duration-500">

                    {/* Node Status */}
                    <div className="relative group cursor-pointer flex flex-col items-center">
                        <span className="w-3 h-3 bg-[#D4FF00] rounded-full shadow-[0_0_15px_rgba(212,255,0,0.5)] animate-pulse" />
                        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-[#0A0A0A] border border-white/10 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-2 shadow-xl">
                            <span className="w-1.5 h-1.5 bg-[#D4FF00] rounded-full" />
                            Novatrum Node: Active
                        </div>
                    </div>

                    <div className="w-4 h-[1px] bg-black/10" />

                    {/* START PROJECT BUTTON - FINTECH MODE */}
                    <button
                        onClick={() => router.push('/get-quote?demo=fintech')}
                        className="group flex flex-col items-center gap-4 outline-none"
                    >
                        <div className="w-8 h-8 bg-black text-[#D4FF00] rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-[#D4FF00] group-hover:text-black transition-all duration-300 shadow-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black group-hover:text-[#D4FF00] transition-colors duration-300 pt-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            Start Project
                        </span>
                    </button>

                    <div className="w-4 h-[1px] bg-black/10" />

                    {/* CLOSE DEMO BUTTON */}
                    <button onClick={() => router.push('/showroom')} className="group flex flex-col items-center gap-4 outline-none">
                        <div className="w-8 h-8 bg-white text-black border border-black/10 rounded-full flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black group-hover:text-[#D4FF00] transition-colors duration-300 pt-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                            Close Demo
                        </span>
                    </button>
                </div>

                {/* --- ANA İÇERİK (Z-20, Footer'ın üstünde kayar) --- */}
                {/* YENİ: mb-[80vh] md:mb-[70vh] footer yüksekliğiyle birebir aynıdır, bu sayede hatasız perde efekti oluşur */}
                <main className="relative z-20 bg-[#FAFAFA] rounded-b-[40px] md:rounded-b-[80px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,1)] mb-[80vh] md:mb-[70vh]">

                    {/* SECTION 1: HERO (Cards) */}
                    <section id="cards" className="min-h-screen flex items-center px-8 md:px-20 relative overflow-hidden pt-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] font-black text-zinc-100 select-none pointer-events-none tracking-tighter">
                            ZERO.
                        </div>

                        <div className="w-full flex flex-col lg:flex-row justify-between items-center gap-20 relative z-10">
                            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex-1">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-widest mb-8">
                                    Private Wealth Management
                                </div>
                                <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] mb-8">
                                    Banking, <br />
                                    <span className="text-zinc-400">Unchained.</span>
                                </h1>
                                <p className="text-lg md:text-xl font-medium text-zinc-600 max-w-md mb-12">
                                    No borders. No hidden fees. Institutional-grade wealth management directly from your pocket.
                                </p>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                    <button className="bg-[#D4FF00] text-black px-10 py-5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform border border-black/10">
                                        Open Account
                                    </button>
                                    <span className="text-xs font-bold text-zinc-400">Takes 3 minutes.</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 100, rotateY: -30 }}
                                animate={{ opacity: 1, x: 0, rotateY: 0 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="flex-1 flex justify-center perspective-[1000px] w-full"
                            >
                                <motion.div
                                    animate={{ y: [-10, 10, -10], rotateX: [5, -5, 5], rotateZ: [-2, 2, -2] }}
                                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                    className="w-full max-w-[300px] h-[480px] bg-gradient-to-br from-zinc-800 to-black rounded-[30px] p-8 flex flex-col justify-between shadow-2xl border border-zinc-700 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-30" />
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
                                    <div className="relative z-10 flex justify-between items-center">
                                        <span className="text-white font-black text-xl tracking-tighter">AEGIS</span>
                                        <svg className="w-6 h-6 text-white/50" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M2 12h20M12 2v20"></path></svg>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Titanium Card</p>
                                        <p className="text-white font-mono text-lg tracking-widest">**** **** **** 9021</p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </section>

                    {/* METRİKLER */}
                    <section className="py-24 px-8 md:px-20 border-y border-zinc-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
                            <div className="flex flex-col pt-8 md:pt-0">
                                <h3 className="text-6xl md:text-7xl font-black tracking-tighter mb-2">$0<span className="text-2xl text-zinc-400">.00</span></h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Monthly Fees</p>
                            </div>
                            <div className="flex flex-col pt-8 md:pt-0 md:pl-12">
                                <h3 className="text-6xl md:text-7xl font-black tracking-tighter mb-2">4<span className="text-2xl text-zinc-400">.5%</span></h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">AER on Savings</p>
                            </div>
                            <div className="flex flex-col pt-8 md:pt-0 md:pl-12">
                                <h3 className="text-6xl md:text-7xl font-black tracking-tighter mb-2">160<span className="text-2xl text-zinc-400">+</span></h3>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Currencies Supported</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: WEALTH (YAPIŞAN KARTLAR) */}
                    <section id="wealth" className="py-32 px-8 md:px-20 bg-zinc-100">
                        <div className="max-w-2xl mb-20">
                            <h2 className="text-5xl font-black tracking-tighter mb-6">Built for the top 1%. <br /> Available to everyone.</h2>
                            <p className="text-zinc-500 font-medium text-lg">We stripped away the legacy banking infrastructure to give you direct access to institutional tools.</p>
                        </div>

                        <div className="flex flex-col gap-10">
                            {/* Sticky Kart 1 */}
                            <div className="sticky top-20 w-full min-h-[350px] bg-black text-white rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row justify-between shadow-xl">
                                <div className="flex-1 mb-8 md:mb-0">
                                    <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-8 font-bold">1</span>
                                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Global Transfers.</h3>
                                    <p className="text-zinc-400 max-w-sm text-sm md:text-base">Send money internationally at the interbank exchange rate with absolutely zero markup.</p>
                                </div>
                                <div className="flex-1 flex justify-center items-center">
                                    <div className="w-full max-w-[250px] bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 backdrop-blur-sm">
                                        <div className="flex justify-between items-center"><span className="text-zinc-500 font-mono text-sm">Send:</span><span className="text-white font-bold">$10,000</span></div>
                                        <div className="w-full h-[1px] bg-white/10" />
                                        <div className="flex justify-between items-center"><span className="text-zinc-500 font-mono text-sm">Fee:</span><span className="text-[#D4FF00] font-bold">$0.00</span></div>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Kart 2 */}
                            <div className="sticky top-28 w-full min-h-[350px] bg-[#D4FF00] text-black rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row justify-between shadow-xl border border-black/5">
                                <div className="flex-1 mb-8 md:mb-0">
                                    <span className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center mb-8 font-bold">2</span>
                                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Smart Vaults.</h3>
                                    <p className="text-black/60 max-w-sm text-sm md:text-base">Your idle cash automatically moves into high-yield treasury bills earning 4.5% daily.</p>
                                </div>
                                <div className="flex-1 flex justify-center items-center">
                                    <div className="text-7xl md:text-8xl font-black tracking-tighter opacity-20">4.5%</div>
                                </div>
                            </div>

                            {/* Sticky Kart 3 */}
                            <div className="sticky top-36 w-full min-h-[350px] bg-zinc-200 text-black rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row justify-between shadow-2xl border border-zinc-300">
                                <div className="flex-1 mb-8 md:mb-0">
                                    <span className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center mb-8 font-bold">3</span>
                                    <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">Crypto Native.</h3>
                                    <p className="text-zinc-600 max-w-sm text-sm md:text-base">Hold, swap, and spend Bitcoin, Ethereum, and USDC directly with your titanium card.</p>
                                </div>
                                <div className="flex-1 flex justify-center items-center">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500 rounded-full shadow-lg" />
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full shadow-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 4: CRYPTO / GÜVENLİK */}
                    <section id="crypto" className="py-24 md:py-32 px-6 md:px-20 bg-[#0A0A0A] text-white my-10 md:my-20 mx-4 md:mx-20 rounded-[30px] md:rounded-[40px] shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 mb-8 border border-white/20 rounded-full flex items-center justify-center bg-white/5">
                                <svg className="w-6 h-6 md:w-8 md:h-8 text-[#D4FF00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">Military-Grade Security.</h2>
                            <p className="text-zinc-400 max-w-lg mb-12 text-sm md:text-base">Your funds are safeguarded by biometric multi-sig authentication and held in tier-1 global banks.</p>

                            <div className="flex flex-col sm:flex-row gap-8 md:gap-12 text-left w-full max-w-2xl border-t border-white/10 pt-12">
                                <div className="flex-1">
                                    <h4 className="text-2xl font-black mb-2 text-[#D4FF00]">$250K</h4>
                                    <p className="text-xs text-zinc-500">FDIC Insured equivalent protection.</p>
                                </div>
                                <div className="flex-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-6 sm:pt-0 sm:pl-12">
                                    <h4 className="text-2xl font-black mb-2 text-[#D4FF00]">256-bit</h4>
                                    <p className="text-xs text-zinc-500">End-to-end data encryption.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: APP MOCKUP SHOWCASE */}
                    <section className="pt-20 pb-0 overflow-hidden px-8 md:px-20 flex justify-center border-t border-zinc-200">
                        <div className="text-center w-full">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-10">Your entire net worth.<br />One clean interface.</h2>
                            <div className="w-[280px] md:w-[320px] h-[400px] md:h-[500px] bg-black rounded-t-[40px] mx-auto border-[8px] border-zinc-300 border-b-0 relative overflow-hidden flex flex-col items-center pt-8 px-6 shadow-2xl">
                                <div className="w-20 h-6 bg-zinc-300 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl" />
                                <div className="w-full text-left mt-8 mb-6">
                                    <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Total Balance</span>
                                    <h3 className="text-3xl font-black text-white mt-1">$142,809.55</h3>
                                </div>
                                <div className="w-full space-y-3">
                                    <div className="h-14 md:h-16 w-full bg-zinc-900 rounded-2xl flex items-center px-4 justify-between">
                                        <div className="flex items-center gap-3"><div className="w-6 h-6 md:w-8 md:h-8 bg-zinc-800 rounded-full" /><span className="text-white text-xs md:text-sm font-bold">Apple</span></div>
                                        <span className="text-white text-xs md:text-sm font-medium">-$14.99</span>
                                    </div>
                                    <div className="h-14 md:h-16 w-full bg-zinc-900 rounded-2xl flex items-center px-4 justify-between">
                                        <div className="flex items-center gap-3"><div className="w-6 h-6 md:w-8 md:h-8 bg-[#D4FF00] rounded-full" /><span className="text-white text-xs md:text-sm font-bold">Salary</span></div>
                                        <span className="text-[#D4FF00] text-xs md:text-sm font-medium">+$8,200.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* --- 6. REVEAL FOOTER --- */}
                {/* YENİ: fixed bottom-0, left pozisyonu menüye göre ayarlandı, yükseklik mb ile aynı */}
                <footer className="fixed bottom-0 left-[80px] md:left-[100px] right-0 h-[80vh] md:h-[70vh] bg-[#050505] z-10 flex flex-col justify-between pt-24 pb-12 px-8 md:px-20 text-white">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 w-full max-w-[1400px] mx-auto">
                        <div className="max-w-lg">
                            <h2 className="text-5xl md:text-[80px] font-black tracking-tighter leading-[0.9] mb-8 text-[#D4FF00]">
                                Take Control.
                            </h2>
                            <p className="text-zinc-400 text-base md:text-lg mb-10 max-w-sm">
                                Join 200,000+ early adopters redefining how wealth is managed.
                            </p>
                            <button className="bg-white text-black px-10 py-4 md:py-5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-[#D4FF00] transition-colors">
                                Download Aegis App
                            </button>
                        </div>
                        <div className="flex gap-12 md:gap-24 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                            <div className="flex flex-col gap-4">
                                <span className="text-white mb-2">Company</span>
                                <span className="hover:text-[#D4FF00] cursor-pointer transition-colors">About</span>
                                <span className="hover:text-[#D4FF00] cursor-pointer transition-colors">Careers</span>
                                <span className="hover:text-[#D4FF00] cursor-pointer transition-colors">Legal</span>
                            </div>
                            <div className="flex flex-col gap-4">
                                <span className="text-white mb-2">Social</span>
                                <span className="hover:text-[#D4FF00] cursor-pointer transition-colors">Twitter X</span>
                                <span className="hover:text-[#D4FF00] cursor-pointer transition-colors">LinkedIn</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-[1400px] mx-auto flex justify-between items-end border-t border-white/10 pt-8 mt-auto">
                        <span className="text-[12vw] md:text-[8vw] font-black tracking-tighter leading-none text-white/5 select-none">
                            AEGIS.
                        </span>
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">
                            © 2026. A Novatrum Showcase.
                        </span>
                    </div>
                </footer>

            </div>
        </div>
    );
}