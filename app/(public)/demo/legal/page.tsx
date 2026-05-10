// app/(public)/demo/legal/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Menu, Phone, Mail, MapPin, ChevronRight, ArrowRight, CheckCircle2, Award, Scale, Shield, Users, Building2 } from 'lucide-react';

const practiceAreas = [
  { icon: Scale, title: "Corporate Law", desc: "M&A, corporate governance, restructuring, compliance, and commercial contracts for multinational enterprises.", cases: "120+ cases" },
  { icon: Shield, title: "Litigation", desc: "Complex commercial litigation, international arbitration, white-collar defense, and regulatory investigations.", cases: "85+ cases" },
  { icon: Users, title: "Family Office", desc: "Private wealth management, succession planning, trusts, foundations, and cross-border estate planning.", cases: "60+ cases" },
  { icon: Building2, title: "Real Estate", desc: "Commercial property acquisitions, development projects, zoning, leasing, and real estate finance.", cases: "95+ cases" },
];

const team = [
  { name: "Alexander Lex", role: "Managing Partner", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" },
  { name: "Victoria Marchand", role: "Senior Partner", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" },
  { name: "Marcus Chen", role: "Partner — Litigation", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop" },
  { name: "Isabelle Laurent", role: "Partner — Corporate", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop" },
];

const stats = [
  { value: "25+", label: "Years of Excellence" },
  { value: "€2.4B", label: "In Transaction Value" },
  { value: "98%", label: "Client Retention" },
  { value: "350+", label: "Cases Won" },
];

export default function LegalDemo() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="w-full bg-[#fafaf9] text-[#1a1a1a] font-sans selection:bg-[#1a1a1a] selection:text-white">
      
      {/* Floating Close Bar */}
      <div className="fixed top-6 right-6 z-50">
        <Link 
          href="/showroom" 
          className="flex items-center gap-2 bg-white/90 backdrop-blur-xl border border-[#e5e5e0] rounded-full px-4 py-2.5 shadow-lg text-[10px] font-bold uppercase tracking-widest text-[#8a8a80] hover:text-[#1a1a1a] hover:border-[#1a1a1a] transition-all"
        >
          <X size={14} /> Close Demo
        </Link>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#fafaf9]/80 backdrop-blur-xl border-b border-[#e5e5e0]">
        <div className="max-w-6xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-[#1a1a1a]" />
            <span className="text-base font-light tracking-[0.2em] text-[#1a1a1a]">LEX <span className="text-[#8a8a80]">& PARTNERS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            {['Practice Areas', 'Our Team', 'Insights', 'Contact'].map(item => (
              <a key={item} href="#" className="text-[10px] font-medium text-[#8a8a80] uppercase tracking-widest hover:text-[#1a1a1a] transition-colors">{item}</a>
            ))}
            <a href="#" className="px-6 py-2.5 bg-[#1a1a1a] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#3a3a3a] transition-all">Consultation</a>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-[#1a1a1a]">
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-[#8a8a80] text-[10px] font-bold uppercase tracking-[0.4em]">Est. 1998 — Brussels</p>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-[1.05] text-[#1a1a1a]">
              Legal excellence<br />
              built on <span className="text-[#8a8a80]">trust.</span>
            </h1>
            <p className="text-[#6a6a60] text-sm md:text-base font-light max-w-lg leading-relaxed">
              A premier law firm providing strategic counsel to Fortune 500 companies, financial institutions, and high-net-worth individuals across Europe.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="px-8 py-4 bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#3a3a3a] transition-all">
                Schedule Consultation
              </a>
              <a href="#" className="px-8 py-4 border border-[#d5d5d0] text-[#1a1a1a] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:border-[#1a1a1a] transition-all">
                Our Expertise
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#e5e5e0]">
            <Image
              src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop"
              alt="Law firm office"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 border-y border-[#e5e5e0]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-light text-[#1a1a1a] tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a8a80] mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRACTICE AREAS */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#8a8a80] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Practice Areas</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-[#1a1a1a]">Areas of expertise.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {practiceAreas.map((area) => (
              <div key={area.title} className="group p-8 md:p-10 rounded-3xl border border-[#e5e5e0] hover:border-[#1a1a1a] hover:bg-[#f5f5f0] transition-all">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#f0f0eb] flex items-center justify-center shrink-0 group-hover:bg-[#1a1a1a] group-hover:text-white transition-all">
                    <area.icon size={20} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-light tracking-tight text-[#1a1a1a]">{area.title}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#8a8a80]">{area.cases}</span>
                    </div>
                    <p className="text-xs text-[#6a6a60] font-light leading-relaxed">{area.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="py-24 md:py-32 px-6 bg-[#f5f5f0]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#8a8a80] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Our Team</p>
            <h2 className="text-3xl md:text-4xl font-light tracking-tighter text-[#1a1a1a]">Meet the partners.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {team.map((member) => (
              <div key={member.name} className="group text-center">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[#e5e5e0] mb-5">
                  <Image src={member.image} alt={member.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <h3 className="text-sm font-light text-[#1a1a1a]">{member.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a8a80] mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <Award size={40} className="text-[#8a8a80] mx-auto" />
          <blockquote className="text-2xl md:text-3xl font-light tracking-tighter text-[#1a1a1a] leading-relaxed">
            "Lex & Partners handled our cross-border M&A with exceptional precision. Their strategic counsel was invaluable."
          </blockquote>
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">Michael von Stein</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8a8a80]">CEO, Von Stein Industries</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 bg-[#1a1a1a] text-white">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-light tracking-tighter">Ready to discuss your case?</h2>
          <p className="text-[#8a8a80] text-sm font-light leading-relaxed max-w-md mx-auto">
            Schedule a confidential consultation with one of our partners. We'll respond within 24 hours.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="px-8 py-4 bg-white text-[#1a1a1a] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#e5e5e0] transition-all">
              Book a Consultation
            </a>
            <a href="#" className="px-8 py-4 border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:border-white/50 transition-all">
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-[#e5e5e0] bg-[#fafaf9]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-xs text-[#8a8a80] font-light">
            <span className="flex items-center gap-2"><Phone size={12} /> +32 2 555 12 34</span>
            <span className="flex items-center gap-2"><Mail size={12} /> counsel@lex-partners.eu</span>
            <span className="flex items-center gap-2"><MapPin size={12} /> Rue de la Loi 200, Brussels</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Scale size={16} className="text-[#1a1a1a]" />
              <span className="text-sm font-light tracking-[0.2em] text-[#1a1a1a]">LEX & PARTNERS</span>
            </div>
            <span className="text-[9px] text-[#8a8a80]">© 2024 All rights reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}