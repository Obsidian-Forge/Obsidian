import React from 'react';
import FadeUp from '../components/FadeUp';

export default function TermsPage() {
  const lastUpdated = "March 2026";

  return (
    <main className="max-w-4xl mx-auto px-6 pb-32 overflow-hidden">
      
      {/* Page Header */}
      <FadeUp>
        <div className="space-y-6 border-b border-white/5 pb-12">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic text-left">
            Project <span className="text-neutral-500 font-light">Guidelines.</span>
          </h1>
          <p className="text-neutral-500 font-mono text-xs tracking-widest uppercase text-left">
            Website Development Rules // Obsidian Studio
          </p>
        </div>
      </FadeUp>

      <div className="mt-20 space-y-20 text-left font-light">
        
        {/* 01. Tasarım ve İçerik Kopyalama Yasağı */}
        <FadeUp delay={100}>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">01. Originality & Anti-Clone</h2>
            <div className="space-y-4 text-neutral-400 leading-relaxed">
              <p>
                This website's design, layout, and unique animations are the original work of **Obsidian Studio**. 
              </p>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-neutral-400 text-sm italic">
                Notice: Cloning this site’s specific visual identity or copying its structure for your own commercial use is strictly prohibited. We protect our craft.
              </div>
            </div>
          </section>
        </FadeUp>

        {/* 02. Web Sitesi Kuralları */}
        <FadeUp delay={150}>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">02. Website Standards</h2>
            <p className="text-neutral-400 leading-relaxed">
              We focus exclusively on building high-performance, modern websites. To maintain our quality, we follow these simple rules:
            </p>
            <ul className="space-y-4 text-sm text-neutral-500 ml-4">
              <li className="flex gap-4">
                <span className="text-white font-bold tracking-tighter">#01</span> 
                Modern Tech Only: We build using Next.js and Tailwind CSS. We do not work with outdated builders or templates.
              </li>
              <li className="flex gap-4">
                <span className="text-white font-bold tracking-tighter">#02</span> 
                Content Readiness: The client must provide all necessary texts and branding assets before the build phase begins.
              </li>
              <li className="flex gap-4">
                <span className="text-white font-bold tracking-tighter">#03</span> 
                Fair Revisions: We include a specific number of design adjustments to ensure the project stays on track and launches fast.
              </li>
            </ul>
          </section>
        </FadeUp>

        {/* 03. Kullanım Koşulları */}
        <FadeUp delay={200}>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">03. Usage of this Site</h2>
            <p className="text-neutral-400 leading-relaxed">
              You are free to explore our portfolio and use the Price Calculator for your own project planning. Any attempt to disrupt the site's performance or use our contact forms for unsolicited spam will result in an immediate block from our network.
            </p>
          </section>
        </FadeUp>

        {/* 04. Mülkiyet Hakkı */}
        <FadeUp delay={250}>
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">04. Ownership</h2>
            <p className="text-neutral-400 leading-relaxed">
              Once the final invoice for your website is paid, you own the website entirely. Obsidian Studio retains the right to showcase the completed website in our portfolio as part of our professional history.
            </p>
          </section>
        </FadeUp>

      </div>

      {/* Footer CTA */}
      <FadeUp delay={300}>
        <div className="mt-32 pt-12 border-t border-white/5 text-center">
          <p className="text-neutral-500 text-sm mb-6 uppercase tracking-widest">Build fast. Build clean.</p>
          <a href="/contact" className="text-white font-bold hover:text-neutral-400 transition-colors uppercase tracking-widest text-xs">
            I understand and I'm ready
          </a>
        </div>
      </FadeUp>

    </main>
  );
}