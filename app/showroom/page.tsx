'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// DEMO VERİLERİ 
const DEMOS = [
    {
        id: 'creative',
        title: 'Aura Creative',
        category: 'Architecture & Studio',
        description: 'Lüks, minimal ve görsel odaklı portfolyo mimarisi. Yumuşak kaydırma ve büyük tipografi içerir.',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
        hoverGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
        accentText: 'text-emerald-600',
        route: '/demo/creative'
    },
    {
        id: 'fintech',
        title: 'Aegis Finance',
        category: 'Neo-Banking & Wealth',
        description: 'Kurumsal seviye varlık yönetimi için tasarlanmış yüksek kontrastlı, İsviçre stili finansal arayüz.',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
        hoverGradient: 'from-[#D4FF00]/20 via-[#D4FF00]/5 to-transparent',
        accentText: 'text-yellow-600',
        route: '/demo/fintech'
    },
    {
        id: 'logistics',
        title: 'Node Logistics',
        category: 'Global Tracking & B2B',
        description: 'Hız, veri tabloları ve canlı harita takip odaklı operasyonel şirket kontrol paneli.',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
        hoverGradient: 'from-blue-600/10 via-blue-600/5 to-transparent',
        accentText: 'text-blue-600',
        route: '/demo/logistics'
    },
    {
        id: 'quantum',
        title: 'Quantum Engine',
        category: 'Spatial Computing & WebGL',
        description: 'Geliştiriciler ve Web3 girişimleri için karanlık mod ağırlıklı, 3D etkileşimli nöral API vitrini.',
        icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
        hoverGradient: 'from-fuchsia-600/10 via-fuchsia-600/5 to-transparent',
        accentText: 'text-fuchsia-600',
        route: '/demo/quantum'
    }
];

export default function ShowroomPage() {
    const router = useRouter();

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

        // 1. VERİ ÇEKME FONKSİYONU (Hem açılışta hem de Polling'de kullanılacak)
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
        
        // İlk açılışta hemen veriyi çek
        fetchShowroomSettings();

        // 2. FALLBACK (POLLING): Realtime bozulursa diye her 10 saniyede bir kontrol et
        const pollInterval = setInterval(() => {
            fetchShowroomSettings();
        }, 10000);

        // 3. GERÇEK ZAMANLI DİNLEME (Supabase Realtime WebSockets)
        const subscription = supabase
            .channel('showroom_live_updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'showroom_settings' },
                (payload) => {
                    // Admin panelinde "Sync" butonuna basıldığı anda burası tetiklenir!
                    console.log("Canlı güncelleme geldi!", payload.new);
                    const newData = payload.new;
                    
                    // State'leri anında güncelliyoruz
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

        // Temizlik: Sayfadan çıkınca hem Interval'i hem de Realtime'ı durdur
        return () => {
            clearInterval(pollInterval);
            supabase.removeChannel(subscription);
        };
    }, []);

    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } }
    };

    const handleDemoClick = (route: string, status: string) => {
        if (status === 'Offline' || status === 'Maintenance') return;
        router.push(route);
    };

    return (
        <div className="min-h-screen bg-[#FCFCFC] text-black font-sans overflow-x-hidden flex flex-col relative selection:bg-black selection:text-white">
            
            {/* FÜTÜRİSTİK BLUEPRINT (TEKNİK ÇİZİM) ARKA PLANI */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent_100%)] opacity-40" />
            </div>

            {/* HEADER */}
            <header className="w-full p-8 md:p-12 flex justify-between items-center relative z-50">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 flex items-center justify-center transition-transform group-hover:scale-95">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-[11px] font-black tracking-[0.3em] text-black uppercase mt-1">Novatrum</span>
                </Link>
                
                {/* DİNAMİK GLOBAL NETWORK DURUMU */}
                <div className={`flex items-center gap-3 bg-white border px-5 py-2.5 rounded-full shadow-sm transition-colors ${globalNetworkStatus === 'Active' ? 'border-zinc-200' : 'border-red-200 bg-red-50'}`}>
                    <span className={`w-2 h-2 rounded-full ${globalNetworkStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : globalNetworkStatus === 'Maintenance' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${globalNetworkStatus === 'Active' ? 'text-zinc-500' : 'text-red-600'}`}>
                        {globalNetworkStatus === 'Active' ? 'Showroom Active' : `Network ${globalNetworkStatus}`}
                    </span>
                </div>
            </header>

            {/* MAIN İÇERİK */}
            <main className="flex-1 relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-32 pt-10">
                
                {/* BAŞLIK BÖLÜMÜ */}
                <div className="mb-20">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 border border-zinc-200 text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-6">
                            Environment Selector
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-zinc-900 mb-6">
                            Simulation Hub.
                        </h1>
                        <p className="text-sm md:text-base font-medium text-zinc-500 max-w-xl leading-relaxed">
                            Novatrum altyapısı ile inşa edilmiş, sektöre özel prototipleri inceleyin. Her bir modül, endüstri standartlarını yeniden belirlemek üzere tasarlandı.
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
                                className={`group relative bg-white border border-zinc-200 rounded-[32px] p-8 md:p-10 overflow-hidden shadow-sm transition-all duration-500 ${isAvailable ? 'cursor-pointer hover:shadow-2xl' : 'cursor-not-allowed opacity-80'}`}
                            >
                                {/* Hover Arka Plan Gradienti (Sadece Online ise) */}
                                {isAvailable && (
                                    <div className={`absolute inset-0 bg-gradient-to-br ${demo.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                )}
                                
                                <div className="relative z-10 flex flex-col h-full">
                                    {/* Üst Kısım: İkon ve Modül Numarası */}
                                    <div className="flex justify-between items-start mb-16">
                                        <div className={`w-14 h-14 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-center transition-transform duration-500 shadow-sm bg-white ${isAvailable ? 'text-zinc-900 group-hover:scale-110 group-hover:shadow-md' : 'text-zinc-400'}`}>
                                            {demo.icon}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] transition-colors ${isAvailable ? 'text-zinc-400 group-hover:text-zinc-900' : 'text-zinc-400'}`}>
                                                Module 0{index + 1}
                                            </span>
                                            
                                            {/* DİNAMİK DURUM ETİKETİ */}
                                            <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 transition-opacity ${isAvailable ? `opacity-0 group-hover:opacity-100 ${demo.accentText}` : status === 'Maintenance' ? 'text-amber-500' : 'text-red-500'}`}>
                                                {status === 'Online' ? 'Ready' : status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Orta Kısım: Metinler */}
                                    <div>
                                        <h3 className={`text-3xl font-black tracking-tighter uppercase mb-3 transition-transform duration-300 ${isAvailable ? 'text-zinc-900 group-hover:translate-x-2' : 'text-zinc-400'}`}>
                                            {demo.title}
                                        </h3>
                                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-colors ${isAvailable ? demo.accentText : 'text-zinc-400'}`}>
                                            {demo.category}
                                        </p>
                                        <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-sm">
                                            {demo.description}
                                        </p>
                                    </div>

                                    {/* Alt Kısım: Deploy Butonu */}
                                    <div className={`mt-16 pt-6 border-t border-zinc-100 flex items-center justify-between transition-colors ${isAvailable ? 'group-hover:border-zinc-300' : ''}`}>
                                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isAvailable ? 'text-zinc-400 group-hover:text-zinc-900' : 'text-zinc-300'}`}>
                                            {isAvailable ? 'Initialize Protocol' : 'Access Restricted'}
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
        </div>
    );
}