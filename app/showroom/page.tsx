'use client';

import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

export default function ShowroomPage() {
    const router = useRouter();
    const { t } = useLanguage();
    
    // Translation fallbacks to ensure it works in English even if en.ts is not updated yet
    const sData = t?.showroom || {
        badge: "Environment Selector",
        title: "Simulation Hub.",
        subtitle: "Explore industry-specific prototypes engineered with Novatrum infrastructure. Each module is designed to redefine industry standards.",
        networkActive: "Showroom Active",
        networkMaintenance: "Network Maintenance",
        networkDegraded: "Network Degraded",
        moduleReady: "Ready",
        btnDeploy: "Initialize Protocol",
        btnRestricted: "Access Restricted",
        demos: {
            creative: {
                title: "Aura Creative",
                category: "Architecture & Studio",
                desc: "Luxury, minimal, and visually-driven portfolio architecture. Features smooth scrolling and large typography."
            },
            fintech: {
                title: "Aegis Finance",
                category: "Neo-Banking & Wealth",
                desc: "High-contrast, Swiss-style financial interface designed for enterprise-level wealth management."
            },
            logistics: {
                title: "Node Logistics",
                category: "Global Tracking & B2B",
                desc: "Operational company dashboard focused on speed, dense data tables, and live map tracking."
            },
            quantum: {
                title: "Quantum Engine",
                category: "Spatial Computing & WebGL",
                desc: "Dark-mode heavy, 3D interactive neural API showcase for developers and Web3 startups."
            }
        }
    };

    // DİNAMİK DEMO VERİLERİ (Çeviri Entegrasyonu ile)
    const DEMOS = [
        {
            id: 'creative',
            title: sData.demos?.creative?.title || 'Aura Creative',
            category: sData.demos?.creative?.category || 'Architecture & Studio',
            description: sData.demos?.creative?.desc || 'Luxury, minimal, and visually-driven portfolio architecture.',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
            hoverGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
            accentText: 'text-emerald-600',
            route: '/demo/creative'
        },
        {
            id: 'fintech',
            title: sData.demos?.fintech?.title || 'Aegis Finance',
            category: sData.demos?.fintech?.category || 'Neo-Banking & Wealth',
            description: sData.demos?.fintech?.desc || 'High-contrast, Swiss-style financial interface.',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
            hoverGradient: 'from-[#D4FF00]/20 via-[#D4FF00]/5 to-transparent',
            accentText: 'text-yellow-600',
            route: '/demo/fintech'
        },
        {
            id: 'logistics',
            title: sData.demos?.logistics?.title || 'Node Logistics',
            category: sData.demos?.logistics?.category || 'Global Tracking & B2B',
            description: sData.demos?.logistics?.desc || 'Operational company dashboard focused on speed.',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
            hoverGradient: 'from-blue-600/10 via-blue-600/5 to-transparent',
            accentText: 'text-blue-600',
            route: '/demo/logistics'
        },
        {
            id: 'quantum',
            title: sData.demos?.quantum?.title || 'Quantum Engine',
            category: sData.demos?.quantum?.category || 'Spatial Computing & WebGL',
            description: sData.demos?.quantum?.desc || 'Dark-mode heavy, 3D interactive neural API showcase.',
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
            hoverGradient: 'from-fuchsia-600/10 via-fuchsia-600/5 to-transparent',
            accentText: 'text-fuchsia-600',
            route: '/demo/quantum'
        }
    ];

    // ADMIN DASHBOARD ENTEGRASYONU İÇİN STATE'LER
    const [globalNetworkStatus, setGlobalNetworkStatus] = useState<'Active' | 'Maintenance' | 'Degraded'>('Active');
    const [moduleStatuses, setModuleStatuses] = useState<Record<string, 'Online' | 'Offline' | 'Maintenance'>>({
        creative: 'Online',
        fintech: 'Online',
        logistics: 'Online',
        quantum: 'Online'
    });

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchShowroomSettings = async () => {
            const { data, error } = await supabase.from('showroom_settings').select('*').eq('id', 1).single();
            if (data && !error) {
                setGlobalNetworkStatus(data.global_network);
                setModuleStatuses({
                    creative: data.creative,
                    fintech: data.fintech,
                    logistics: data.logistics,
                    quantum: data.quantum
                });
            }
        };

        fetchShowroomSettings();

        const pollInterval = setInterval(() => {
            fetchShowroomSettings();
        }, 10000);

        const subscription = supabase
            .channel('showroom_live_updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'showroom_settings' },
                (payload) => {
                    const newData = payload.new;
                    setGlobalNetworkStatus(newData.global_network);
                    setModuleStatuses({
                        creative: newData.creative,
                        fintech: newData.fintech,
                        logistics: newData.logistics,
                        quantum: newData.quantum
                    });
                }
            )
            .subscribe();

        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(subscription);
        };
    }, []);

    const fadeUp: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    const handleDemoClick = (route: string, status: string) => {
        if (status === 'Offline' || status === 'Maintenance') return;
        router.push(route);
    };

    return (
        <div className="min-h-screen bg-white text-black font-sans overflow-x-hidden flex flex-col relative selection:bg-black selection:text-white">

            {/* BEYAZ ZEMİN ÜZERİNE SİYAH/GRİ RASTER (BLUEPRINT) ARKA PLANI */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-white">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_60%,transparent_100%)]" />
            </div>

            {/* HEADER */}
            <header className="w-full p-8 md:p-12 flex justify-between items-center relative z-50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-95">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-bold tracking-[0.3em] text-black uppercase mt-1">Novatrum</span>
                </Link>

                {/* DİNAMİK GLOBAL NETWORK DURUMU */}
                <div className={`flex items-center gap-3 bg-white/80 backdrop-blur-md border px-5 py-2.5 rounded-full shadow-sm transition-colors ${globalNetworkStatus === 'Active' ? 'border-zinc-200' : 'border-red-200 bg-red-50'}`}>
                    <span className={`w-2 h-2 rounded-full ${globalNetworkStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : globalNetworkStatus === 'Maintenance' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${globalNetworkStatus === 'Active' ? 'text-zinc-500' : 'text-red-600'}`}>
                        {globalNetworkStatus === 'Active' ? sData.networkActive : `${sData.networkMaintenance}`}
                    </span>
                </div>
            </header>

            {/* MAIN İÇERİK */}
            <main className="flex-1 relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-24 pt-10">

                {/* BAŞLIK BÖLÜMÜ */}
                <div className="mb-20">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-6">
                            {sData.badge}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-zinc-900 mb-6 leading-[1.1]">
                            {sData.title}
                        </h1>
                        <p className="text-sm md:text-base font-medium text-zinc-500 max-w-xl leading-relaxed">
                            {sData.subtitle}
                        </p>
                    </motion.div>
                </div>

                {/* FÜTÜRİSTİK BENTO GRID EKRANI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {DEMOS.map((demo, index) => {
                        const status = moduleStatuses[demo.id];
                        const isAvailable = status === 'Online';

                        return (
                            <motion.div
                                key={demo.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                onClick={() => handleDemoClick(demo.route, status)}
                                className={`group relative bg-white border border-zinc-200 rounded-[32px] p-8 md:p-10 overflow-hidden shadow-sm transition-all duration-500 ${isAvailable ? 'cursor-pointer hover:shadow-2xl hover:border-zinc-300' : 'cursor-not-allowed opacity-70 grayscale'}`}
                            >
                                {/* Hover Arka Plan Gradienti (Sadece Online ise) */}
                                {isAvailable && (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${demo.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                )}

                                <div className="relative z-10 flex flex-col h-full">
                                    
                                    {/* Üst Kısım: İkon ve Modül Numarası */}
                                    <div className="flex justify-between items-start mb-16">
                                        <div className={`w-14 h-14 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center transition-transform duration-500 shadow-sm ${isAvailable ? 'text-zinc-900 group-hover:scale-110 group-hover:shadow-md' : 'text-zinc-400'}`}>
                                            {demo.icon}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[9px] font-bold uppercase tracking-[0.3em] transition-colors ${isAvailable ? 'text-zinc-400 group-hover:text-zinc-900' : 'text-zinc-400'}`}>
                                                Module 0{index + 1}
                                            </span>

                                            {/* DİNAMİK DURUM ETİKETİ */}
                                            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 transition-opacity ${isAvailable ? `opacity-0 group-hover:opacity-100 ${demo.accentText}` : status === 'Maintenance' ? 'text-amber-500' : 'text-red-500'}`}>
                                                {status === 'Online' ? sData.moduleReady : status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Orta Kısım: Metinler */}
                                    <div>
                                        <h3 className={`text-3xl md:text-4xl font-light tracking-tighter mb-3 transition-transform duration-300 ${isAvailable ? 'text-zinc-900 group-hover:translate-x-2' : 'text-zinc-400'}`}>
                                            {demo.title}
                                        </h3>
                                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-6 transition-colors ${isAvailable ? demo.accentText : 'text-zinc-400'}`}>
                                            {demo.category}
                                        </p>
                                        <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-sm">
                                            {demo.description}
                                        </p>
                                    </div>

                                    {/* Alt Kısım: Deploy Butonu */}
                                    <div className={`mt-16 pt-6 border-t border-zinc-100 flex items-center justify-between transition-colors ${isAvailable ? 'group-hover:border-zinc-300' : ''}`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isAvailable ? 'text-zinc-400 group-hover:text-zinc-900' : 'text-zinc-300'}`}>
                                            {isAvailable ? sData.btnDeploy : sData.btnRestricted}
                                        </span>
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isAvailable ? 'bg-zinc-100 text-zinc-400 group-hover:bg-black group-hover:text-white group-hover:rotate-45' : 'bg-zinc-50 text-zinc-300'}`}>
                                            {isAvailable ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>

            {/* MINIMALIST FOOTER */}
            <footer className="w-full border-t border-zinc-100 bg-white relative z-10 mt-auto">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} Novatrum. Simulation Environment.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                            Return to Hub
                        </Link>
                        <Link href="/gateway" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                            Start Protocol
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}