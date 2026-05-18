// app/(public)/demo/architecture/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ArrowRight, Award, Compass, Home, Layers, PenTool, Ruler } from 'lucide-react';

const projects = [
  {
    title: "Villa Horizon",
    category: "Residential",
    desc: "A cliffside residence embracing panoramic ocean views through cantilevered glass volumes.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "The Spire",
    category: "Commercial",
    desc: "A 42-story mixed-use tower redefining the city skyline with its parametric façade.",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Nordic Pavilion",
    category: "Cultural",
    desc: "A museum expansion blending Scandinavian minimalism with the existing historic structure.",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Eco-Loop Tower",
    category: "Sustainable",
    desc: "A net-zero office building with integrated vertical gardens and renewable energy systems.",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "The Glass House",
    category: "Residential",
    desc: "A minimalist retreat dissolving the boundary between interior and nature.",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Harbor Cultural Center",
    category: "Public",
    desc: "A waterfront performing arts venue with a sweeping timber roof structure.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop",
  },
];

const services = [
  { icon: PenTool, title: "Architectural Design", desc: "Full-service design from concept sketches to construction documentation. Every detail considered." },
  { icon: Compass, title: "Master Planning", desc: "Large-scale urban and campus planning. Integrating landscape, infrastructure, and built form." },
  { icon: Layers, title: "Interior Architecture", desc: "Spatial design that enhances human experience. Materiality, lighting, and flow in perfect harmony." },
  { icon: Ruler, title: "Heritage & Conservation", desc: "Sensitive restoration and adaptive reuse of historically significant structures." },
];

const stats = [
  { value: "35+", label: "Years of Practice" },
  { value: "200+", label: "Projects Completed" },
  { value: "18", label: "International Awards" },
  { value: "12", label: "Countries" },
];

export default function ArchitectureDemo() {
  return (
    <main className="w-full bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <Home size={16} className="text-white" />
            </div>
            <span className="text-sm font-light tracking-[0.3em] text-black">STUDIO V</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Projects', 'Services', 'Studio', 'Journal', 'Contact'].map(item => (
              <a key={item} href="#" className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest hover:text-black transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.4em]">Architecture & Design Studio</p>
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-[1.05] text-black">
              We design<br />
              <span className="text-zinc-300">spaces that inspire.</span>
            </h1>
            <p className="text-zinc-500 text-sm md:text-base font-light max-w-md leading-relaxed">
              An award-winning architecture practice creating thoughtful, context-driven designs for residential, commercial, and cultural projects worldwide.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all">
                View Projects <ArrowRight size={14} className="inline ml-1" />
              </a>
              <a href="#" className="px-8 py-4 border border-zinc-300 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:border-black transition-all">
                Our Services
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-100">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop"
              alt="Villa Horizon"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 border-y border-zinc-200 bg-zinc-50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-light text-black tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROJECTS */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Selected Work</p>
              <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Projects.</h2>
            </div>
            <a href="#" className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
              View All <ArrowRight size={14} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.title} className="group cursor-pointer">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 mb-4">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                      {project.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-light text-black mb-1">{project.title}</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">{project.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 md:py-32 px-6 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Expertise</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">What we do.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.title} className="group p-8 rounded-3xl bg-white border border-zinc-200 hover:border-black hover:shadow-lg transition-all duration-500 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mx-auto mb-5 group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-500">
                  <service.icon size={22} className="text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-sm font-light text-black mb-2">{service.title}</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-zinc-100 order-2 md:order-1">
            <Image
              src="https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=800&auto=format&fit=crop"
              alt="Architecture studio"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-8 order-1 md:order-2">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">The Studio</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">
              A philosophy of <span className="text-zinc-300">restraint.</span>
            </h2>
            <div className="space-y-4 text-zinc-500 text-sm font-light leading-relaxed">
              <p>
                Founded in 1988 by Victoria Strand, Studio V has grown from a two-person atelier into an internationally recognized practice with offices in Copenhagen, Berlin, and Tokyo.
              </p>
              <p>
                Our work is guided by a singular belief: that architecture should be quiet, considered, and deeply connected to its context. We don't chase trends — we chase timelessness.
              </p>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <Award size={32} className="text-zinc-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-black">Pritzker Prize Finalist</p>
                <p className="text-[10px] text-zinc-400 font-light">2022, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-24 md:py-32 px-6 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">Client Words</p>
          <blockquote className="text-2xl md:text-3xl font-light tracking-tighter text-black leading-relaxed">
            "Studio V didn't just design our home — they understood how we wanted to live. Every space feels intentional, every material perfectly chosen."
          </blockquote>
          <div>
            <p className="text-sm font-medium text-black">Henrik & Mette Larsen</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Villa Horizon Owners</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 text-center bg-black text-white">
        <div className="max-w-xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter">Let's build something beautiful.</h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">Tell us about your project. We'll respond within 24 hours with initial thoughts and next steps.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-200 transition-all shadow-lg">
              Start a Conversation <ArrowRight size={14} className="inline ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 bg-white border-t border-zinc-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black flex items-center justify-center">
              <Home size={14} className="text-white" />
            </div>
            <span className="text-sm font-light tracking-[0.3em] text-black">STUDIO V</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="hover:text-black transition-colors cursor-pointer">Instagram</span>
            <span className="hover:text-black transition-colors cursor-pointer">LinkedIn</span>
            <span className="hover:text-black transition-colors cursor-pointer">Journal</span>
            <span>© 2024 Studio V</span>
          </div>
        </div>
      </footer>
    </main>
  );
}