"use client";

import React from 'react';
import Link from 'next/link';

export default function LegalTermsPage() {
    const sections = [
        { num: '01', title: 'Scope of Work (Scope Creep)', desc: 'The services provided by Novatrum are strictly limited to the specifications outlined in the agreed "Definitive Blueprint". Any additional features, pages, or integrations requested after the blueprint is approved will be subject to additional billing at our standard hourly rate.' },
        { num: '02', title: 'Payment Terms', desc: 'Invoices are generated via our automated system. Unless an installment plan is specifically agreed upon in the blueprint, payments are required as specified on the invoice. Development will pause if payments are delayed beyond 14 days of the due date.' },
        { num: '03', title: 'Intellectual Property (IP)', desc: 'All source code, design assets, and intellectual property remain the sole property of Novatrum until the final invoice is paid in full. Upon full payment, a perpetual license to use the product is automatically transferred to the client.' },
        { num: '04', title: 'Maintenance & Hosting', desc: 'Unless a "Continuous Engineering" (Monthly Retainer) package is selected, Novatrum is not responsible for server uptime, security patches, or content updates after the final handover. Clients without a maintenance plan assume full responsibility for their digital infrastructure.' },
        { num: '05', title: 'Client Responsibilities', desc: 'The client agrees to provide necessary materials (text, images, branding guidelines) in a timely manner. Delays in providing materials may result in timeline extensions.' },
        { num: '06', title: 'Limitation of Liability', desc: 'Novatrum implements industrial-grade security; however, client-managed servers and third-party integrations are the responsibility of the client. Novatrum is not liable for indirect or consequential losses.' }
    ];

    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white p-6 md:p-16 lg:p-24 relative overflow-hidden">
            
            {/* CLEAN BACKGROUND TEXTURE (Sadece çok hafif noktalar) */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40 -z-10" />

            <div className="max-w-4xl mx-auto space-y-24 relative z-10">
                
                {/* Header Section */}
                <div className="space-y-12 pb-16 border-b border-zinc-100">
                    <Link href="/" className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-sm group hover:scale-105 transition-transform">
                        <img src="/logo.png" alt="Novatrum" className="w-7 h-7 filter invert" />
                    </Link>
                    
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-8xl font-light tracking-tighter text-black leading-none">
                            Master Service <br/>
                            <span className="text-zinc-300 italic">Agreement.</span>
                        </h1>
                        <div className="flex items-center gap-6 pt-4">
                            <p className="text-[10px] font-bold text-black uppercase tracking-[0.3em] bg-zinc-100 px-4 py-2 rounded-full">Protocol V4.2</p>
                            <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Last Updated: March 2026</p>
                        </div>
                    </div>
                </div>

                {/* Vertical Text List Style */}
                <div className="space-y-20">
                    {sections.map((section, index) => (
                        <section key={index} className="group relative">
                            <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-16">
                                
                                {/* Section Number Column */}
                                <div className="shrink-0 pt-1.5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-black" />
                                        <span className="text-[10px] font-bold text-zinc-300 group-hover:text-black transition-colors uppercase tracking-widest">
                                            SEC-{section.num}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Column */}
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
                        Novatrum Core Infrastructure <br className="md:hidden" /> // Security & Compliance Division
                    </p>
                    <Link href="/terms" className="text-[10px] font-bold text-black hover:text-zinc-400 uppercase tracking-widest transition-colors underline underline-offset-8">
                        General Terms of Service
                    </Link>
                </div>
            </div>
        </div>
    );
}