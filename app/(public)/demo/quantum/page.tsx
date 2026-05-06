'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';

// --- 3D TILT KART BİLEŞENİ (Fareyi takip eden 3D efekt) ---
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className={`relative ${className}`}
        >
            <div style={{ transform: "translateZ(50px)" }} className="w-full h-full absolute inset-0 pointer-events-none" />
            {children}
        </motion.div>
    );
};

export default function QuantumDemoPage() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const heroRef = useRef<HTMLElement>(null);

    // Parallax efektleri
    const { scrollYProgress } = useScroll();
    const heroContentY = useTransform(scrollYProgress, [0, 0.4], [0, 200]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const demoLinks = [
        { id: 'engine', label: 'Engine Core' },
        { id: 'metrics', label: 'Telemetry' },
        { id: 'developers', label: 'API Ref' },
        { id: 'network', label: 'Nodes' }
    ];

    const scrollToSection = (sectionId: string) => {
        setIsMenuOpen(false);
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-fuchsia-600 selection:text-white relative overflow-x-hidden">

            {/* --- UPDATED VERTICAL FLOATING ISLAND (QUANTUM THEME) --- */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] rounded-full py-8 px-3 flex flex-col items-center gap-6">

                {/* Status Indicator */}
                <div className="relative group cursor-pointer flex flex-col items-center">
                    <span className="w-3 h-3 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.6)]" />
                    <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-black opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-2 shadow-xl">
                        <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full" />
                        Quantum Engine: Live
                    </div>
                </div>

                <div className="w-4 h-[1px] bg-white/20" />

                {/* START PROJECT BUTTON - QUANTUM MODE */}
                <button
                    onClick={() => router.push('/get-quote?demo=quantum')}
                    className="group flex flex-col items-center gap-4 outline-none"
                >
                    <div className="w-8 h-8 bg-fuchsia-500 text-white rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-fuchsia-400 transition-all shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-fuchsia-500 group-hover:text-fuchsia-300 transition-colors pt-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Start Project
                    </span>
                </button>

                <div className="w-4 h-[1px] bg-white/20" />

                {/* CLOSE DEMO BUTTON */}
                <button onClick={() => router.push('/showroom')} className="group flex flex-col items-center gap-4 outline-none">
                    <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center group-hover:bg-fuchsia-500 group-hover:text-white transition-all shadow-md">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-fuchsia-400 transition-colors pt-2" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        Close Demo
                    </span>
                </button>
            </div>

            {/* --- HEADER: CAM ŞERİT --- */}
            <header className="fixed top-0 left-0 w-full z-[110] pointer-events-none">
                <div className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md pointer-events-auto">
                    <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                                <div className="w-6 h-6 bg-transparent border border-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                                <span className="text-sm font-black tracking-widest uppercase">Q_Core</span>
                            </div>

                            <nav className="hidden md:flex items-center gap-8 pl-8 border-l border-white/10 h-8">
                                {demoLinks.map(link => (
                                    <button key={link.id} onClick={() => scrollToSection(link.id)} className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors">
                                        {link.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="bg-white text-black px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-fuchsia-500 hover:text-white transition-colors hidden sm:block">
                                Initialize
                            </button>
                            <button onClick={() => setIsMenuOpen(true)} className="md:hidden text-[10px] font-black uppercase tracking-widest">
                                Menu
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* MOBİL MENÜ OVERLAY */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl text-white flex flex-col justify-center items-center">
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-6 right-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">Close [X]</button>
                        <div className="flex flex-col gap-8 text-center">
                            {demoLinks.map((link) => (
                                <span key={link.id} onClick={() => scrollToSection(link.id)} className="text-4xl font-black uppercase tracking-tighter hover:text-fuchsia-500 transition-colors cursor-pointer">{link.label}</span>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10 w-full">

                {/* --- SECTION 1: HERO (REDECORATED BANNER) --- */}
                <section ref={heroRef} id="engine" className="h-screen w-full flex items-center px-6 md:px-16 relative pt-20 overflow-hidden">

                    {/* YENİ: INTERAKTIF WEBGL SIVISI VE GRENLİ ARKA PLAN */}
                    {/* Bu iframe sadece Hero bölümünde görünecek */}
                    <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden">
                        <iframe
                            src="https://paveldogreat.github.io/WebGL-Fluid-Simulation/"
                            className="absolute top-0 left-0 h-full border-none max-w-none opacity-80 mix-blend-screen"
                            style={{ width: 'calc(100vw + 350px)' }}
                            title="Hero Fluid Background"
                        />
                        {/* Grenli ve Renkli Cam Efekti Katmanı */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-black to-fuchsia-950/20 mix-blend-multiply pointer-events-none" />
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                        {/* Sayfa Sonuna Doğru Koyu Gradient */}
                        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
                    </div>

                    <motion.div style={{ y: heroContentY, opacity: heroOpacity }} className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-24 pointer-events-none">

                        {/* Sol Taraf: Dev Tipografi */}
                        <div className="flex-1 text-left">
                            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/20 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] mb-8 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-pulse" />
                                Neural Compute Active
                            </div>
                            <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tighter leading-[0.9] mb-6">
                                Render <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-600">Reality.</span>
                            </h1>
                            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-xl">
                                Advanced WebGL spatial engine. Compile complex 3D physics directly on the edge. No servers required.
                            </p>
                        </div>

                        {/* Sağ Taraf: Floating Tech Card */}
                        <div className="flex-1 w-full max-w-lg lg:max-w-none relative pointer-events-auto">
                            <TiltCard className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-[0_0_80px_rgba(217,70,239,0.2)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/10 to-blue-600/10" />
                                <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-6 relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Telemetry</span>
                                    <span className="text-fuchsia-400 text-xs font-mono">OK</span>
                                </div>
                                <div className="space-y-6 relative z-10 font-mono">
                                    <div>
                                        <div className="flex justify-between text-xs text-zinc-500 mb-2"><span>GPU Acceleration</span><span>100%</span></div>
                                        <div className="w-full h-1 bg-zinc-800 rounded-full"><div className="w-full h-full bg-fuchsia-500 rounded-full" /></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-zinc-500 mb-2"><span>Neural Upscale</span><span>Active</span></div>
                                        <div className="w-full h-1 bg-zinc-800 rounded-full"><div className="w-[85%] h-full bg-cyan-500 rounded-full" /></div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs text-zinc-500 mb-2"><span>Ray Tracing Bounces</span><span>12.4M/s</span></div>
                                        <div className="w-full h-1 bg-zinc-800 rounded-full"><div className="w-[60%] h-full bg-blue-500 rounded-full" /></div>
                                    </div>
                                </div>
                            </TiltCard>
                        </div>
                    </motion.div>
                </section>

                {/* --- DİĞER BÖLÜMLER KOYU TASARIMI KORUYOR --- */}
                <div className="bg-[#050505] border-t border-white/5 relative z-20">

                    {/* SECTION 2: METRICS */}
                    <section id="metrics" className="py-20 border-b border-white/5">
                        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-white/5">
                            <div className="flex flex-col pt-8 md:pt-0 pl-0 md:pl-8">
                                <h3 className="text-6xl font-black tracking-tighter text-white mb-2">120<span className="text-2xl text-zinc-600">fps</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500">Guaranteed Target</p>
                            </div>
                            <div className="flex flex-col pt-8 md:pt-0 pl-0 md:pl-12">
                                <h3 className="text-6xl font-black tracking-tighter text-white mb-2">8<span className="text-2xl text-zinc-600">K</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500">Texture Resolution</p>
                            </div>
                            <div className="flex flex-col pt-8 md:pt-0 pl-0 md:pl-12">
                                <h3 className="text-6xl font-black tracking-tighter text-white mb-2">&lt;2<span className="text-2xl text-zinc-600">ms</span></h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-500">Edge Latency</p>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 3: FEATURES (TILT CARDS) */}
                    <section id="features" className="py-32 px-6 max-w-[1400px] mx-auto">
                        <div className="mb-16">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Hardware Level Access.</h2>
                            <p className="text-zinc-500 text-lg">Direct pipeline to the GPU from the browser.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'WebGPU Core', desc: 'Bypass WebGL limitations. Direct hardware acceleration for complex geometry.', color: 'bg-blue-600/10 border-blue-500/20' },
                                { title: 'Spatial AI', desc: 'Real-time environmental mapping and lighting estimation without LIDAR.', color: 'bg-fuchsia-600/10 border-fuchsia-500/20' },
                                { title: 'Lattice Physics', desc: 'Deterministic rigid-body dynamics running at 240 ticks per second.', color: 'bg-emerald-600/10 border-emerald-500/20' }
                            ].map((feat, i) => (
                                <TiltCard key={i} className={`bg-black border ${feat.color} rounded-[32px] p-10 h-[320px] flex flex-col justify-end group transition-colors overflow-hidden relative`}>
                                    <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
                                        <h3 className="text-2xl font-black mb-3">{feat.title}</h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
                                    </div>
                                </TiltCard>
                            ))}
                        </div>
                    </section>

                    {/* SECTION 4: CODE (IDE Görünümü) */}
                    <section id="developers" className="py-32 bg-black/50 border-y border-white/5">
                        <div className="max-w-[1400px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight">
                                    Build faster.<br />Render smarter.
                                </h2>
                                <p className="text-zinc-400 text-lg mb-8">
                                    Drop the boilerplate. Our React components wrap the entire WebGL context into a single, declarative tag.
                                </p>
                                <button className="bg-white text-black px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-500 hover:text-white transition-colors">
                                    View Documentation
                                </button>
                            </div>

                            <div className="flex-1 w-full">
                                <div className="bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 blur-[100px] pointer-events-none" />
                                    <div className="h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                        <span className="ml-4 text-[10px] text-zinc-500 font-mono">Scene.tsx</span>
                                    </div>
                                    <div className="p-8 font-mono text-sm leading-loose overflow-x-auto relative z-10">
                                        <p><span className="text-fuchsia-400">import</span> {`{ Canvas, Mesh }`} <span className="text-fuchsia-400">from</span> <span className="text-emerald-400">'@quantum/react'</span>;</p>
                                        <br />
                                        <p><span className="text-fuchsia-400">export default function</span> <span className="text-blue-400">Scene</span>() {`{`}</p>
                                        <p className="ml-4"><span className="text-fuchsia-400">return</span> (</p>
                                        <p className="ml-8"><span className="text-zinc-500">&lt;</span><span className="text-blue-400">Canvas</span> <span className="text-violet-300">engine</span><span className="text-white">=</span><span className="text-emerald-400">"v2"</span><span className="text-zinc-500">&gt;</span></p>
                                        <p className="ml-12"><span className="text-zinc-500">&lt;</span><span className="text-blue-400">Mesh</span> <span className="text-violet-300">material</span><span className="text-white">=</span><span className="text-emerald-400">"glassmorphism"</span> <span className="text-zinc-500">/&gt;</span></p>
                                        <p className="ml-8"><span className="text-zinc-500">&lt;/</span><span className="text-blue-400">Canvas</span><span className="text-zinc-500">&gt;</span></p>
                                        <p className="ml-4">);</p>
                                        <p>{`}`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 5: NETWORK (Global Düğümler) */}
                    <section id="network" className="py-32 px-6 max-w-[1400px] mx-auto text-center overflow-hidden">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">Global GPU Network</h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-16">
                            Your shaders compiled and cached across 120 edge locations.
                        </p>

                        <div className="w-full h-[300px] rounded-[40px] bg-black border border-white/5 relative overflow-hidden flex items-center justify-center group">
                            {/* Sahte İzometrik Izgara */}
                            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5" />
                            <div className="relative z-10 flex gap-4 items-center scale-110">
                                <div className="w-16 h-16 border border-zinc-700 rounded-full flex items-center justify-center animate-pulse"><span className="w-2 h-2 bg-zinc-500 rounded-full" /></div>
                                <div className="w-24 h-[1px] bg-gradient-to-r from-zinc-700 to-fuchsia-500" />
                                <div className="w-24 h-24 border border-fuchsia-500/50 bg-fuchsia-500/10 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.3)] group-hover:shadow-[0_0_80px_rgba(217,70,239,0.5)] transition-shadow">
                                    <span className="text-xs font-black text-fuchsia-400">CORE</span>
                                </div>
                                <div className="w-24 h-[1px] bg-gradient-to-l from-zinc-700 to-fuchsia-500" />
                                <div className="w-16 h-16 border border-zinc-700 rounded-full flex items-center justify-center animate-pulse"><span className="w-2 h-2 bg-zinc-500 rounded-full" /></div>
                            </div>
                        </div>
                    </section>

                    {/* --- FOOTER: TERMINAL STİLİ --- */}
                    <footer className="pt-24 pb-12 bg-black border-t border-white/10 relative z-20">
                        <div className="max-w-[1400px] mx-auto px-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-16 mb-8 gap-10">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter mb-4 text-white">Q_Core Engine.</h2>
                                    <p className="text-zinc-500 text-sm max-w-sm">The ultimate spatial compute layer. Stop worrying about device constraints and start rendering.</p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="bg-white text-black px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-500 hover:text-white transition-colors">
                                        Deploy Now
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[9px] font-black uppercase tracking-widest text-zinc-600 font-mono">
                                <div className="flex gap-8">
                                    <span className="hover:text-fuchsia-400 transition-colors cursor-pointer">SYS_STATUS</span>
                                    <span className="hover:text-fuchsia-400 transition-colors cursor-pointer">API_DOCS</span>
                                    <span className="hover:text-fuchsia-400 transition-colors cursor-pointer">GITHUB</span>
                                </div>
                                <span>[2026] NOVATRUM INFRASTRUCTURE Showcase</span>
                            </div>
                        </div>
                    </footer>

                </div>
            </div>
        </div>
    );
}