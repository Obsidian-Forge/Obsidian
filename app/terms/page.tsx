"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; // Kendi FadeUp bileşenini kullandığını varsayıyorum
import Link from 'next/link';

export default function TermsPage() {
  const lastUpdated = "March 2026";

  return (
    <main className="w-full bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-40 overflow-hidden">
        
        {/* Page Header */}
        <FadeUp>
          <div className="space-y-6 border-b border-zinc-100 pb-12">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black leading-none">
              Project <br />
              <span className="text-zinc-400 italic font-light">Guidelines.</span>
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 Website Development Rules // Obsidian
               </p>
               <span className="w-1 h-1 bg-zinc-300 rounded-full" />
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 Last Updated: {lastUpdated}
               </p>
            </div>
          </div>
        </FadeUp>

        <div className="mt-20 space-y-20 text-left">
          
          {/* 01. Tasarım ve İçerik Kopyalama Yasağı */}
          <FadeUp delay={100}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">01. Originality & Anti-Clone</h2>
              <div className="space-y-6 text-zinc-500 font-light leading-relaxed">
                <p className="text-lg">
                  This website's design, layout, and unique animations are the original work of Obsidian. 
                </p>
                <div className="p-8 rounded-[24px] bg-zinc-50 border border-zinc-100 text-black text-sm font-medium">
                  Notice: Cloning this site’s specific visual identity or copying its structure for your own commercial use is strictly prohibited. We protect our craft.
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 02. Web Sitesi Kuralları */}
          <FadeUp delay={150}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">02. Website Standards</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                We focus exclusively on building high-performance, modern websites. To maintain our quality, we follow these simple rules:
              </p>
              <ul className="space-y-6 text-zinc-500 font-light ml-2 border-l border-zinc-100 pl-6">
                <li className="flex flex-col gap-1">
                  <span className="text-black font-bold uppercase tracking-widest text-[10px]">Rule #01 &mdash; Modern Tech Only</span> 
                  We build using Next.js and Tailwind CSS. We do not work with outdated builders, slow CMS platforms, or cheap templates.
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-black font-bold uppercase tracking-widest text-[10px]">Rule #02 &mdash; Content Readiness</span> 
                  The client must provide all necessary texts, high-resolution images, and branding assets before the build phase begins.
                </li>
                <li className="flex flex-col gap-1">
                  <span className="text-black font-bold uppercase tracking-widest text-[10px]">Rule #03 &mdash; Fair Revisions</span> 
                  We include a specific number of design adjustments to ensure the project stays on track and launches fast. Endless revisions destroy momentum.
                </li>
              </ul>
            </section>
          </FadeUp>

          {/* 03. Kullanım Koşulları */}
          <FadeUp delay={200}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">03. Usage of this Site</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                You are free to explore our portfolio and use the Price Calculator for your own project planning. Any attempt to disrupt the site's performance, scrape its data, or use our contact forms for unsolicited spam will result in an immediate block from our network.
              </p>
            </section>
          </FadeUp>

          {/* 04. Mülkiyet Hakkı */}
          <FadeUp delay={250}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">04. Ownership</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                Once the final invoice for your website is paid in full, you own the website entirely. Obsidian retains the right to showcase the completed website, design assets, and code snippets in our portfolio as part of our professional history.
              </p>
            </section>
          </FadeUp>

        </div>

        {/* Footer CTA */}
        <FadeUp delay={300}>
          <div className="mt-32 pt-16 border-t border-zinc-100 text-center space-y-8">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">Build fast. Build clean.</p>
            <Link href="/calculator" className="inline-block px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-800 transition-colors shadow-lg">
              I Understand. Start Project.
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}