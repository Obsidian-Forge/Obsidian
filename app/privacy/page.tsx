"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; // Kendi FadeUp bileşenini kullandığını varsayıyorum
import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = "March 2026";

  return (
    <main className="w-full bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-40 overflow-hidden">
        
        {/* Page Header */}
        <FadeUp>
          <div className="space-y-6 border-b border-zinc-100 pb-12">
            <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-black leading-none">
              Zero Data <br />
              <span className="text-zinc-400 italic font-light">Focus.</span>
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 Privacy First // Obsidian
               </p>
               <span className="w-1 h-1 bg-zinc-300 rounded-full" />
               <p className="text-zinc-400 font-bold text-[10px] tracking-[0.2em] uppercase">
                 Last Updated: {lastUpdated}
               </p>
            </div>
          </div>
        </FadeUp>

        <div className="mt-20 space-y-20 text-left">
          
          {/* 01. Veri Toplamama Sözü */}
          <FadeUp delay={100}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">01. No Personal Data</h2>
              <div className="space-y-6 text-zinc-500 font-light leading-relaxed">
                <p className="text-lg">
                  I do not collect your name, phone number, or physical address automatically. My business is building fast, high-quality websites, not trading user data.
                </p>
                <div className="p-8 rounded-[24px] bg-zinc-50 border border-zinc-100 text-black text-sm font-medium">
                  Notice: This site works without asking who you are. I believe your digital footprint belongs only to you.
                </div>
              </div>
            </section>
          </FadeUp>

          {/* 02. İletişim Formu ve Email */}
          <FadeUp delay={150}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">02. Minimal Contact</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                When you use my contact form or calculator, I only ask for project details and an email address so I can reply to you directly.
              </p>
              <ul className="space-y-4 text-zinc-500 font-light ml-2 border-l border-zinc-100 pl-6">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                  No newsletters.
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                  No marketing emails.
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full"></span>
                  No sharing your email with third parties.
                </li>
              </ul>
            </section>
          </FadeUp>

          {/* 03. Çerez ve Takip Yok */}
          <FadeUp delay={200}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">03. No Tracking</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                I do not use tracking pixels, Google Analytics, or invasive cookies. Website speed and user privacy are my top priorities, and removing tracking scripts is the best way to keep things fast and clean.
              </p>
            </section>
          </FadeUp>

          {/* 04. Güvenlik */}
          <FadeUp delay={250}>
            <section className="space-y-6">
              <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em]">04. Security</h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed">
                Every interaction on this site is encrypted via SSL. Your project ideas and communication are treated with the same level of security and confidentiality as my own internal code.
              </p>
            </section>
          </FadeUp>

        </div>

        {/* Footer CTA */}
        <FadeUp delay={300}>
          <div className="mt-32 pt-16 border-t border-zinc-100 text-center space-y-8">
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">Privacy is a right, not a feature.</p>
            <Link href="/contact" className="inline-block px-10 py-5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-full hover:bg-zinc-800 transition-colors shadow-lg">
              Start a Private Conversation
            </Link>
          </div>
        </FadeUp>

      </div>
    </main>
  );
}