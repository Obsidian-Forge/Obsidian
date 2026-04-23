"use client";

import React from 'react';
import Link from 'next/link';
// HATA BURADAYDI: Doğru yolu proje yapına göre ayarlamalısın.
// Eğer '@/context/LanguageContext' çalışmazsa, '../../context/LanguageContext' yapabilirsin.
import { useLanguage } from '@/context/LanguageContext';
export default function LegalTermsClient() {
    const { t } = useLanguage();

    // Çeviri gelmezse hata vermemesi için güvenli (fallback) İngilizce sürüm
    const fallbackSections = [
        { num: '01', title: 'Scope of Work (Scope Creep)', desc: 'The services provided by Novatrum are strictly limited to the specifications outlined in the agreed "Definitive Blueprint". Any additional features, pages, or integrations requested after the blueprint is approved will be subject to additional billing at our standard hourly rate.' },
        { num: '02', title: 'Payment Terms', desc: 'Invoices are generated via our automated system. Unless an installment plan is specifically agreed upon in the blueprint, payments are required as specified on the invoice. Development will pause if payments are delayed beyond 14 days of the due date.' },
        { num: '03', title: 'Intellectual Property (IP)', desc: 'All source code, design assets, and intellectual property remain the sole property of Novatrum until the final invoice is paid in full. Upon full payment, a perpetual license to use the product is automatically transferred to the client.' },
        { num: '04', title: 'Maintenance & Hosting', desc: 'Unless a "Continuous Engineering" (Monthly Retainer) package is selected, Novatrum is not responsible for server uptime, security patches, or content updates after the final handover. Clients without a maintenance plan assume full responsibility for their digital infrastructure.' },
        { num: '05', title: 'Client Responsibilities', desc: 'The client agrees to provide all necessary assets (copywriting, branding, API keys) within the requested timeframes. Project timelines are contingent upon prompt client feedback and approvals. Delays on the client\'s end will result in timeline extensions.' },
        { num: '06', title: 'Limitation of Liability', desc: 'Novatrum engineers high-performance systems, but we cannot guarantee zero downtime or absolute immunity from cyber threats due to the evolving nature of the web. Novatrum\'s maximum liability for any claim arising out of the project is limited to the total amount paid by the client for that specific project.' }
    ];

    const activeSections = t?.legal?.sections || fallbackSections;

    return (
        <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-black selection:text-white pb-32">
            
            {/* Header Area */}
            <div className="w-full bg-white border-b border-zinc-100 pt-32 pb-16 px-6 md:px-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                
                <div className="max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 mb-8">
                        <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                            {t?.legal?.pageTitle || "Legal Blueprint"}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-black mb-6 leading-tight">
                        {t?.legal?.subtitle || "General Terms & Conditions"}
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl leading-relaxed">
                        {t?.legal?.desc || "The foundational parameters governing our engineering partnerships."}
                    </p>
                </div>
            </div>

            {/* Terms List */}
            <div className="max-w-4xl mx-auto px-6 md:px-12 mt-20 md:mt-32">
                <div className="flex flex-col gap-16 md:gap-24">
                    {activeSections.map((section: any, index: number) => (
                        <section key={index} className="group relative">
                            {/* Section Connector Line (Desktop Only) */}
                            {index !== activeSections.length - 1 && (
                                <div className="hidden md:block absolute left-4 top-20 bottom-[-6rem] w-[1px] bg-zinc-100 group-hover:bg-zinc-300 transition-colors duration-500" />
                            )}
                            
                            <div className="flex flex-col md:flex-row gap-6 md:gap-16">
                                <div className="shrink-0 relative z-10">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-[10px] md:text-xs font-bold text-zinc-400 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all duration-500 shadow-sm">
                                        {section.num}
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h2 className="text-2xl md:text-3xl font-light tracking-tight text-black group-hover:translate-x-1 transition-transform duration-500">
                                        {section.title}
                                    </h2>
                                    <p className="text-base md:text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl">
                                        {section.desc}
                                    </p>
                                </div>
                            </div>
                        </section>
                    ))}
                </div>

                {/* Footer Section */}
                <div className="pt-24 border-t border-zinc-100 mt-24 pb-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-300 text-center md:text-left leading-relaxed">
                        {t?.legal?.footerInfo ? (
                            <span dangerouslySetInnerHTML={{ __html: t.legal.footerInfo.replace(' // ', ' <br className="md:hidden" /> // ') }} />
                        ) : (
                            <>Novatrum Core Infrastructure <br className="md:hidden" /> // Security & Compliance Division</>
                        )}
                    </p>
                    <Link href="/terms" className="text-[10px] font-bold text-black hover:text-zinc-400 uppercase tracking-widest transition-colors underline underline-offset-8">
                        {t?.legal?.footerLink || "General Terms of Service"}
                    </Link>
                </div>
            </div>
        </div>
    );
}