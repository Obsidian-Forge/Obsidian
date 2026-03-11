import React from 'react';
import FadeUp from '../components/FadeUp';

export default function PrivacyPage() {
  const lastUpdated = "March 2026";

  return (
    <main className="max-w-4xl mx-auto px-6 pb-32 overflow-hidden">
      
      {/* Page Header */}
      <FadeUp>
        <div className="space-y-6 border-b border-white/5 pb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic text-left">
            Zero Data <span className="text-neutral-500 font-light">Focus.</span>
          </h1>
          <p className="text-neutral-500 font-mono text-xs tracking-widest uppercase text-left">
            Privacy First // Obsidian Studio
          </p>
        </div>
      </FadeUp>

      <div className="mt-20 space-y-20 text-left font-light">
        
        {/* 01. Veri Toplamama Sözü */}
        <FadeUp delay={100}>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">01. No Personal Data</h2>
            <div className="space-y-4 text-neutral-400 leading-relaxed">
              <p>
                We do not collect your name, phone number, or physical address. Our business is building fast, high-quality websites, not trading user data.
              </p>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-neutral-400 text-sm italic">
                Our site works without asking who you are. We believe your digital footprint belongs only to you.
              </div>
            </div>
          </section>
        </FadeUp>

        {/* 02. İletişim Formu ve Email */}
        <FadeUp delay={150}>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">02. Minimal Contact</h2>
            <p className="text-neutral-400 leading-relaxed">
              When you use our project form, we only ask for project details and an email address so we can reply to you.
            </p>
            <ul className="space-y-3 text-sm text-neutral-500 ml-4">
              <li>No newsletters.</li>
              <li>No marketing emails.</li>
              <li>No sharing your email with third parties.</li>
            </ul>
          </section>
        </FadeUp>

        {/* 03. Çerez ve Takip Yok */}
        <FadeUp delay={200}>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">03. No Tracking</h2>
            <p className="text-neutral-400 leading-relaxed">
              We do not use tracking pixels, Google Analytics, or invasive cookies. Our website speed is our priority, and removing tracking scripts is the best way to keep things fast.
            </p>
          </section>
        </FadeUp>

        {/* 04. Güvenlik */}
        <FadeUp delay={250}>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">04. Security</h2>
            <p className="text-neutral-400 leading-relaxed">
              Every interaction on this site is encrypted via SSL. Your project ideas are treated with the same level of security as our own internal code.
            </p>
          </section>
        </FadeUp>

      </div>

      {/* Footer CTA */}
      <FadeUp delay={300}>
        <div className="mt-32 pt-12 border-t border-white/5 text-center">
          <p className="text-neutral-500 text-sm mb-6 uppercase tracking-widest">Privacy is a right, not a feature.</p>
          <a href="/contact" className="text-white font-bold hover:text-neutral-400 transition-colors uppercase tracking-widest text-xs">
            Start a Private Conversation
          </a>
        </div>
      </FadeUp>

    </main>
  );
}