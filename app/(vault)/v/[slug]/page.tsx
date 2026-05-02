"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
    Globe, Activity, Layout, ArrowRight, Zap, ShieldCheck, 
    Server, Sun, Moon, Gauge, Leaf, Lock 
} from 'lucide-react';

// --- TRANSLATION DICTIONARY ---
const TRANSLATIONS: Record<string, any> = {
    EN: { 
        exec: "Executive Summary", 
        diag: "Lighthouse Diagnostics", 
        detailed: "Detailed Core Web Vitals", 
        infra: "Infrastructure Stack",
        visual: "Visual Capture",
        carbon: "Carbon Footprint", 
        ssl: "SSL Certificate Quality", 
        request: "Request Architecture Upgrade",
        perfDesc: "Overall site speed and resource optimization.",
        a11yDesc: "Usability for people with disabilities.",
        bpDesc: "Compliance with modern web security standards.",
        seoDesc: "Search engine visibility and ranking potential.",
        fcpDesc: "Time until the first text or image appears.",
        lcpDesc: "Time until the main content is fully visible.",
        tbtDesc: "Duration the page is unresponsive to input.",
        clsDesc: "Measures visual stability and layout jumps.",
        speedDesc: "Overall visual load speed of the viewport."
    },
    FR: { 
        exec: "Résumé Exécutif", 
        diag: "Diagnostics Lighthouse", 
        detailed: "Signaux Web Essentiels", 
        infra: "Pile d'Infrastructure",
        visual: "Capture Visuelle",
        carbon: "Empreinte Carbone", 
        ssl: "Qualité du Certificat SSL", 
        request: "Demander une mise à niveau",
        perfDesc: "Vitesse globale et optimisation des ressources.",
        a11yDesc: "Accessibilité pour les personnes handicapées.",
        bpDesc: "Conformité aux normes de sécurité modernes.",
        seoDesc: "Visibilité et potentiel de classement SEO.",
        fcpDesc: "Temps d'affichage du premier texte ou image.",
        lcpDesc: "Temps d'affichage du contenu principal.",
        tbtDesc: "Temps d'inactivité pendant le chargement.",
        clsDesc: "Stabilité visuelle et sauts de mise en page.",
        speedDesc: "Vitesse globale de chargement visuel."
    },
    NL: { 
        exec: "Managementsamenvatting", 
        diag: "Lighthouse Diagnostiek", 
        detailed: "Detailed Core Web Vitals", 
        infra: "Infrastructuur Stack",
        visual: "Visuele Weergave",
        carbon: "Ecologische Voetafdruk", 
        ssl: "SSL-Certificaatkwaliteit", 
        request: "Upgrade Aanvragen",
        perfDesc: "Algehele snelheid en optimalisatie.",
        a11yDesc: "Bruikbaarheid voor mensen met bir beperking.",
        bpDesc: "Naleving van moderne beveiligingsnormen.",
        seoDesc: "Zichtbaarheid in zoekmachines.",
        fcpDesc: "Tijd tot eerste tekst of afbeelding verschijnt.",
        lcpDesc: "Tijd tot hoofdinhoud volledig zichtbaar is.",
        tbtDesc: "Duur dat de pagina niet reageert op input.",
        clsDesc: "Meet visuele stabiliteit en lay-outverschuivingen.",
        speedDesc: "Algehele visuele laadsnelheid."
    },
    TR: { 
        exec: "Yönetici Özeti", 
        diag: "Lighthouse Analizi", 
        detailed: "Detaylı Temel Web Verileri", 
        infra: "Altyapı Teknolojileri",
        visual: "Görsel Yakalama",
        carbon: "Karbon Ayak İzi", 
        ssl: "SSL Sertifika Kalitesi", 
        request: "Mimari Yükseltme Talep Et",
        perfDesc: "Genel site hızı ve kaynak optimizasyonu.",
        a11yDesc: "Engelli bireyler için kullanım kolaylığı.",
        bpDesc: "Modern güvenlik standartlarına uygunluk.",
        seoDesc: "Arama motoru görünürlüğü ve sıralama gücü.",
        fcpDesc: "İlk metin veya görselin görünme süresi.",
        lcpDesc: "Ana içeriğin tam görünür olma süresi.",
        tbtDesc: "Sayfanın girişe tepki vermediği süre.",
        clsDesc: "Görsel kararlılık ve düzen kayması ölçümü.",
        speedDesc: "Sayfanın görsel olarak dolma hızı."
    }
};

const CircularGauge = ({ value, label, color, desc }: { value: number, label: string, color: string, desc: string }) => {
    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0; 
    const strokeDashoffset = circumference - (safeValue / 100) * circumference;

    return (
        <div className="flex flex-col items-center text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-zinc-200 dark:text-zinc-800 transition-colors duration-500" />
                    <circle 
                        cx="48" cy="48" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" 
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s ease-out' }}
                        className={color} strokeLinecap="round"
                    />
                </svg>
                <div className="absolute flex items-center justify-center text-zinc-900 dark:text-white text-xl font-bold font-mono transition-colors duration-500">
                    {safeValue}
                </div>
            </div>
            <span className="text-[11px] uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mt-4 font-bold">{label}</span>
            {/* INCREASED FONT SIZE & READABILITY */}
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 max-w-[140px] leading-tight font-medium">{desc}</p>
        </div>
    );
};

export default function VaultPage() {
    const params = useParams();
    const [isDark, setIsDark] = useState(false);
    const rawSlug = params?.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
    
    const [audit, setAudit] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        const fetchAudit = async () => {
            try {
                const { data, error } = await supabase.from('audits').select('*').eq('slug', slug).single();
                setAudit(data || null);
            } catch (err) {
                setAudit(null);
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
    }, [slug]);

    if (loading) return <div className={isDark ? "dark" : ""}><div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex items-center justify-center text-[10px] text-zinc-500 uppercase tracking-widest transition-colors duration-500"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-3"/> Decrypting...</div></div>;
    if (!audit) return <div className={isDark ? "dark" : ""}><div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col items-center justify-center text-zinc-900 dark:text-white transition-colors duration-500"><ShieldCheck size={48} className="text-red-500 mb-4" /><h1 className="text-2xl font-light tracking-tighter">404 | Vault Not Found</h1></div></div>;

    const t = TRANSLATIONS[audit.language || 'EN'] || TRANSLATIONS['EN'];
    const stackList = audit.legacy_stack?.split(',').filter(Boolean) || [];

    return (
        <div className={isDark ? "dark" : ""}>
            <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-zinc-900 dark:text-white font-sans pb-20 transition-colors duration-500 selection:bg-emerald-500 selection:text-white">
                
                <header className="border-b border-zinc-200 dark:border-white/10 px-6 py-4 md:px-8 md:py-6 flex justify-between items-center bg-white/80 dark:bg-black/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-500">
                    <div className="flex items-center gap-3">
                        <img src={isDark ? "/logo-white.png" : "/logo.png"} alt="Novatrum Logo" className="w-8 h-8 object-contain transition-opacity duration-300" />
                        <span className="hidden md:inline text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Novatrum Intelligence</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all">
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full transition-colors duration-500">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/>
                            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-500 tracking-widest uppercase">Encrypted</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 pt-16 space-y-12">
                    <div className="text-center space-y-4 mb-16">
                        <h1 className="text-5xl md:text-7xl font-light tracking-tighter transition-colors duration-500">Architecture Audit</h1>
                        <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 font-mono flex flex-wrap items-center justify-center gap-2 uppercase tracking-widest transition-colors duration-500">
                            <Globe size={14}/> {audit.target_url} <span className="text-zinc-300 dark:text-zinc-600 hidden md:inline">|</span> <span className="text-emerald-600 dark:text-emerald-400">Node: {audit.client_name}</span>
                        </p>
                    </div>

                    {audit.ai_summary && (
                        <div className="bg-indigo-50/50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 p-8 md:p-12 rounded-[32px] relative overflow-hidden shadow-sm dark:shadow-2xl transition-colors duration-500">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"/>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-6 flex items-center gap-2"><Activity size={14}/> {t.exec}</h3>
                            <div className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-light transition-colors duration-500">{audit.ai_summary}</div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none p-8 rounded-[32px] transition-colors duration-500">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 mb-8 flex items-center gap-2 border-b border-zinc-100 dark:border-white/5 pb-4"><Zap size={14}/> {t.diag}</h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                            <CircularGauge value={audit.perf} label="Performance" color={audit.perf >= 90 ? "text-emerald-500" : audit.perf >= 50 ? "text-amber-500" : "text-red-500"} desc={t.perfDesc} />
                            <CircularGauge value={audit.a11y} label="Accessibility" color={audit.a11y >= 90 ? "text-emerald-500" : audit.a11y >= 50 ? "text-amber-500" : "text-red-500"} desc={t.a11yDesc} />
                            <CircularGauge value={audit.bp} label="Best Practices" color={audit.bp >= 90 ? "text-emerald-500" : audit.bp >= 50 ? "text-amber-500" : "text-red-500"} desc={t.bpDesc} />
                            <CircularGauge value={audit.seo} label="SEO" color={audit.seo >= 90 ? "text-emerald-500" : audit.seo >= 50 ? "text-amber-500" : "text-red-500"} desc={t.seoDesc} />
                        </div>

                        <div className="pt-10 border-t border-zinc-100 dark:border-white/5">
                            <h4 className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-8 flex items-center gap-2"><Gauge size={12}/> {t.detailed}</h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                                {[
                                    { key: 'fcp', label: 'FCP', desc: t.fcpDesc },
                                    { key: 'lcp', label: 'LCP', desc: t.lcpDesc },
                                    { key: 'tbt', label: 'TBT', desc: t.tbtDesc },
                                    { key: 'cls', label: 'CLS', desc: t.clsDesc },
                                    { key: 'speed_index', label: 'Speed Index', desc: t.speedDesc }
                                ].map((item) => {
                                    const rawVal = audit[item.key] || 'N/A';
                                    const isBad = typeof rawVal === 'string' && (rawVal.includes('s') || rawVal.includes('ms')) && parseFloat(rawVal) > 3; 
                                    return (
                                        <div key={item.key} className="p-5 bg-zinc-50 dark:bg-black rounded-3xl border border-zinc-200 dark:border-white/10 text-center transition-all shadow-sm">
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2">{item.label}</p>
                                            <p className={`text-base md:text-xl font-mono font-bold transition-colors mb-2 ${rawVal === 'N/A' || !rawVal ? 'text-zinc-400 dark:text-zinc-700' : isBad ? 'text-amber-500' : 'text-zinc-900 dark:text-white'}`}>
                                                {rawVal || 'N/A'}
                                            </p>
                                            {/* READABLE DETAILED TEXT */}
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-tight font-medium">{item.desc}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none p-10 rounded-[40px] flex flex-col items-center justify-center text-center transition-colors duration-500">
                            <Leaf size={32} strokeWidth={1.5} className={audit.carbon ? "text-emerald-500 mb-5" : "text-zinc-300 dark:text-zinc-700 mb-5"} />
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 transition-colors duration-500">{t.carbon}</h4>
                            <p className="text-2xl md:text-3xl font-mono font-bold text-zinc-900 dark:text-white">{audit.carbon || 'N/A'}</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-3 max-w-[180px] leading-relaxed">The estimated ecological footprint generated by each page visit.</p>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none p-10 rounded-[40px] flex flex-col items-center justify-center text-center transition-colors duration-500">
                            <Lock size={32} strokeWidth={1.5} className={audit.ssl ? "text-emerald-500 mb-5" : "text-zinc-300 dark:text-zinc-700 mb-5"} />
                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 transition-colors duration-500">{t.ssl}</h4>
                            <p className="text-2xl md:text-3xl font-mono font-bold text-zinc-900 dark:text-white">{audit.ssl || 'N/A'}</p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 mt-3 max-w-[180px] leading-relaxed">Validation of encryption strength and security communication headers.</p>
                        </div>
                    </div>

                    <div className="pt-16 pb-12 text-center border-t border-zinc-200 dark:border-white/5 transition-colors duration-500">
                        <a href="mailto:info@novatrum.eu" className="inline-flex bg-black text-white dark:bg-white dark:text-black px-10 py-6 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all items-center justify-center gap-4 mx-auto shadow-xl dark:shadow-white/10">
                            {t.request} <ArrowRight size={16}/>
                        </a>
                    </div>
                </main>
            </div>
        </div>
    );
}