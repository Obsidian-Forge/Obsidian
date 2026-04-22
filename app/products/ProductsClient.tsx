"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Cpu, ShieldCheck, BrainCircuit, Network, 
    ArrowRight, Sparkles, CheckCircle2, ChevronRight, Activity, Clock, X, Send
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

const iconMap: Record<string, any> = {
    Network: Network,
    ShieldCheck: ShieldCheck,
    Cpu: Cpu,
    BrainCircuit: BrainCircuit
};

export default function ProductsPage() {
    const { language, t } = useLanguage();
    const pData = t.productsPage;

    const [isMounted, setIsMounted] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [dbProducts, setDbProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // WAITLIST MODAL STATELERİ
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchProducts();
        
        // 1. Açılış animasyonu süresi
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3000);

        // 2. HER 5 SANİYEDE BİR KONTROL (Polling)
        const interval = setInterval(() => {
            fetchProducts();
        }, 5000);

        // 3. SUPABASE REALTIME (Anında Güncelleme)
        const productsChannel = supabase.channel('public:modules')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'modules' }, () => {
                fetchProducts();
            })
            .subscribe();
        
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
            supabase.removeChannel(productsChannel);
        };
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('modules')
                .select('*')
                .order('display_order', { ascending: true });
            if (error) throw error;
            if (data) setDbProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    // WAITLIST KAYIT FONKSİYONU
    const handleJoinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const { error } = await supabase
                .from('waitlist')
                .insert([{ 
                    email: email, 
                    module_name: selectedModule, 
                    status: 'pending' 
                }]);
            
            if (error) throw error;
            
            setIsSuccess(true);
            
            // Başarı mesajından sonra modalı kapat ve formu temizle
            setTimeout(() => {
                setIsModalOpen(false);
                setIsSuccess(false);
                setEmail('');
            }, 2500);
            
        } catch (err: any) {
            alert("Error joining waitlist: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openWaitlistModal = (moduleName: string) => {
        setSelectedModule(moduleName);
        setIsModalOpen(true);
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-emerald-500 selection:text-white overflow-hidden relative">
            
            {/* 1. PREMIUM AÇILIŞ ANİMASYONU */}
            <AnimatePresence mode="wait">
                {showSplash && (
                    <motion.div 
                        key="splash"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: "blur(20px)", scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex flex-col items-center justify-center overflow-hidden"
                    >
                        <motion.div layout className="flex flex-col items-center gap-6">
                            <motion.div layout className="flex items-center gap-4">
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                    <img src="/logo-white.png" alt="Novatrum" className="w-14 h-14 md:w-16 md:h-16 object-contain" />
                                </motion.div>

                                <motion.div 
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "auto", opacity: 1 }}
                                    transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
                                    className="overflow-hidden whitespace-nowrap"
                                >
                                    <span className="text-2xl md:text-3xl font-bold tracking-[0.4em] text-white uppercase leading-none block mt-1.5 pr-2">
                                        Novatrum
                                    </span>
                                </motion.div>
                            </motion.div>
                            
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5, duration: 0.8 }}
                                className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 animate-pulse"
                            >
                                {pData?.splashInit || "Initializing Infrastructure..."}
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. ANA İÇERİK */}
            <div className={`transition-all duration-1000 ${showSplash ? 'opacity-0' : 'opacity-100'}`}>
                
                {/* HERO BAŞLIK ALANI */}
                <header className="relative pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
                    >
                        <Sparkles size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">{pData?.heroTag}</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-7xl font-light tracking-tighter mb-6"
                    >
                        {pData?.heroTitleLine1} <br className="hidden md:block" />
                        <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">{pData?.heroTitleLine2}</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm md:text-base text-zinc-400 max-w-2xl font-light leading-relaxed mb-12"
                    >
                        {pData?.heroDesc}
                    </motion.p>
                </header>

                {/* ÜRÜN LİSTESİ (DİNAMİK) */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-32 md:space-y-40 mt-10">
                    {dbProducts.length === 0 && !loading && (
                        <div className="text-center py-20 text-zinc-500 font-mono text-[10px] uppercase tracking-widest">
                            No modules deployed in current infrastructure.
                        </div>
                    )}

                    {dbProducts.map((product, index) => {
                        const isEven = index % 2 === 0;
                        const content = product.content[language] || product.content['en'];
                        const Icon = iconMap[product.icon_name] || Network;
                        const isComingSoon = product.status === 'coming-soon';

                        return (
                            <div key={product.id} className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24 relative`}>
                                
                                {/* Görsel Tarafı */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8 }}
                                    className="w-full lg:w-1/2"
                                >
                                    <div className={`w-full aspect-square md:aspect-[4/3] rounded-[40px] border border-white/10 backdrop-blur-3xl flex flex-col items-center justify-center p-12 relative overflow-hidden group`}>
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-700" />
                                        
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={content.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                                        ) : (
                                            <Icon size={80} strokeWidth={1} className="text-white/20 group-hover:scale-110 transition-transform duration-700" />
                                        )}
                                        
                                        {isComingSoon && (
                                            <div className="absolute top-8 right-8 z-20 px-5 py-2.5 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-2 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                                                <Clock size={14} /> Coming Soon
                                            </div>
                                        )}
                                        
                                        <div className="absolute bottom-8 left-8 text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">{pData?.visualInterface}</div>
                                    </div>
                                </motion.div>

                                {/* Metin Tarafı */}
                                <motion.div 
                                    initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="w-full lg:w-1/2 space-y-8"
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="p-2.5 rounded-xl bg-white/10 text-white">
                                                <Icon size={18} />
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{content.tagline}</span>
                                        </div>
                                        <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-6 leading-tight">{content.name}</h2>
                                        <p className="text-base text-zinc-400 leading-relaxed font-light">
                                            {content.description}
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        {(content.features || []).map((feature: string, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 text-sm text-zinc-300">
                                                <CheckCircle2 size={18} className="text-emerald-500/60 shrink-0" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-10 border-t border-white/10 flex items-center justify-between gap-6">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-2">{pData?.investment}</span>
                                            <div className="flex items-baseline gap-1">
                                                {/* TBA SİLİNDİ: Artık Coming Soon olsa bile Fiyat görünecek */}
                                                <span className="text-4xl font-light font-mono text-white">
                                                    {isNaN(Number(product.price)) ? product.price : `€${product.price}`}
                                                </span>
                                                {!isNaN(Number(product.price)) && (
                                                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest ml-1">{pData?.mo}</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* BUTON MANTIĞI */}
                                        {isComingSoon ? (
                                            <button 
                                                onClick={() => openWaitlistModal(content.name)}
                                                className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black hover:scale-105 transition-all shadow-xl"
                                            >
                                                Join Waitlist <ArrowRight size={14} />
                                            </button>
                                        ) : (
                                            <Link 
                                                href="/contact" 
                                                className="flex items-center gap-3 px-10 py-5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 shadow-xl hover:shadow-white/10 transition-all"
                                            >
                                                {pData?.btnRequest} <ArrowRight size={14} />
                                            </Link>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>

                {/* 3. WAITLIST MODAL PENCERESİ */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                            {/* Arkadaki karanlık bulanık fon */}
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            />
                            
                            {/* Modalın Kendisi */}
                            <motion.div 
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative bg-zinc-950 border border-white/10 p-8 md:p-12 rounded-[40px] shadow-2xl max-w-md w-full overflow-hidden"
                            >
                                {/* Üstteki yeşil parıltılı çizgi */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
                                
                                <button 
                                    onClick={() => setIsModalOpen(false)} 
                                    className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>

                                {!isSuccess ? (
                                    <div className="space-y-8">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                <Clock className="text-emerald-400" size={32} />
                                            </div>
                                            <h3 className="text-3xl font-light tracking-tight mb-2">Priority Access</h3>
                                            <p className="text-sm text-zinc-400">
                                                Join the waitlist for <span className="text-white font-medium">{selectedModule}</span>. We'll notify you as soon as deployment is stable.
                                            </p>
                                        </div>

                                        <form onSubmit={handleJoinWaitlist} className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 ml-2">Corporate Email</label>
                                                <input 
                                                    type="email" 
                                                    required 
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="name@company.com"
                                                    className="w-full bg-white/5 border border-white/10 rounded-[24px] px-6 py-4 text-white text-sm focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                            
                                            <button 
                                                type="submit" 
                                                disabled={isSubmitting}
                                                className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest text-[10px] rounded-full hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                                            >
                                                {isSubmitting ? (
                                                    <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Processing...</>
                                                ) : (
                                                    <>Secure My Spot <Send size={14}/></>
                                                )}
                                            </button>
                                            
                                            <button 
                                                type="button" 
                                                onClick={() => setIsModalOpen(false)}
                                                className="w-full py-3 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 animate-in zoom-in duration-500">
                                        <div className="w-20 h-20 bg-emerald-500 text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h3 className="text-2xl font-light tracking-tight mb-4">Node Synced.</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            You have been successfully added to the priority list. Your architectural spot is reserved.
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* FOOTER CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto mt-40 px-6 pb-20"
                >
                    <div className="bg-zinc-900 border border-white/10 p-12 md:p-16 rounded-[48px] text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                        <h2 className="text-3xl md:text-4xl font-light tracking-tighter mb-6">{pData?.ctaTitle}</h2>
                        <p className="text-sm text-zinc-400 mb-10 max-w-lg mx-auto font-light leading-relaxed">
                            {pData?.ctaDesc}
                        </p>
                        <Link href="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-emerald-500/20">
                            {pData?.btnConsult} <ChevronRight size={16} />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}