// app/(public)/demo/quantum/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import { X, ArrowRight, Cpu, Zap, Globe, Layers, Code2, Network, Gauge, Shield, Cloud, BarChart3, Sparkles, Terminal, Workflow } from 'lucide-react';

const features = [
  { icon: Cpu, title: "WebGPU Core", desc: "Direct hardware acceleration bypassing WebGL limitations. Native-level performance in the browser." },
  { icon: Zap, title: "Real-Time Ray Tracing", desc: "Physically accurate lighting with 120fps target. Dynamic global illumination on consumer hardware." },
  { icon: Globe, title: "Edge Rendering", desc: "Shaders compiled and cached across 120 global edge locations. Sub-2ms latency worldwide." },
  { icon: Layers, title: "Procedural Generation", desc: "Infinite parametric worlds. Deterministic algorithms for perfect multiplayer sync." },
  { icon: Code2, title: "Declarative API", desc: "Drop the boilerplate. Wrap entire WebGL context into a single React component." },
  { icon: Network, title: "Multiplayer Sync", desc: "WebSocket-based state synchronization. 240 ticks per second with rollback netcode." },
];

const stats = [
  { value: "120", unit: "fps", label: "Guaranteed Target" },
  { value: "8", unit: "K", label: "Max Texture Resolution" },
  { value: "<2", unit: "ms", label: "Edge Latency" },
  { value: "99.9", unit: "%", label: "Uptime SLA" },
];

const techStack = [
  { icon: Cloud, title: "Cloud-Native", desc: "Deploy to 120 edge locations worldwide. Zero configuration required." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2 Type II certified. End-to-end encryption for all rendered assets." },
  { icon: Gauge, title: "Performance Profiling", desc: "Built-in GPU profiler. Identify bottlenecks in real-time with flame graphs." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track frame times, draw calls, and memory usage across all client sessions." },
];

const pricingPlans = [
  { name: "Starter", price: "Free", desc: "For hobbyists and small projects", features: ["WebGPU Core", "100k polys/scene", "Community support", "2GB asset storage"], cta: "Start Building", highlight: false },
  { name: "Pro", price: "€49", desc: "For professional developers", features: ["WebGPU Core + Ray Tracing", "1M polys/scene", "Priority support", "50GB asset storage", "Multiplayer sync"], cta: "Go Pro", highlight: true },
  { name: "Enterprise", price: "Custom", desc: "For large-scale deployments", features: ["Everything in Pro", "Unlimited polys", "Dedicated GPU nodes", "SLA guarantee", "Custom integrations"], cta: "Contact Sales", highlight: false },
];

const testimonials = [
  { name: "Alex Chen", role: "CTO, Spatial Dynamics", text: "Quantum Engine cut our render times by 60%. The declarative API is a game-changer." },
  { name: "Sarah Müller", role: "Lead Developer, MetaVersa", text: "We shipped our MVP in 3 weeks instead of 3 months. The edge rendering is incredibly fast." },
  { name: "Marcus Johansson", role: "Founder, PixelForge", text: "Finally, a WebGL framework that doesn't require a PhD to use. Clean, fast, beautiful." },
];

export default function QuantumDemo() {
  return (
    <main className="w-full bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* Vertical Floating Bar */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-6 bg-white/90 backdrop-blur-xl border border-zinc-200 rounded-full py-8 px-3 shadow-lg">
        <div className="relative group flex flex-col items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Quantum Live
          </div>
        </div>
        <div className="w-4 h-[1px] bg-zinc-300" />
        <button className="group flex flex-col items-center gap-3 outline-none">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-black transition-colors" style={{ writingMode: 'vertical-rl' }}>Start</span>
        </button>
        <div className="w-4 h-[1px] bg-zinc-300" />
        <Link href="/showroom" className="group flex flex-col items-center gap-3 outline-none">
          <div className="w-8 h-8 bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-full flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white transition-all">
            <X size={14} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover:text-red-500 transition-colors" style={{ writingMode: 'vertical-rl' }}>Close</span>
        </Link>
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-sm font-light tracking-[0.3em] text-black">QUANTUM</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Engine', 'Features', 'Pricing', 'Docs'].map(item => (
              <a key={item} href="#" className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest hover:text-black transition-colors">{item}</a>
            ))}
            <a href="#" className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all">Get Started</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden bg-zinc-50 border-b border-zinc-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Spatial Compute Engine
          </div>
          <h1 className="text-5xl md:text-8xl font-light tracking-tighter leading-[0.95] text-black">
            Render the<br />
            <span className="text-zinc-300">impossible.</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed">
            A next-generation WebGL engine for building immersive 3D experiences. Compile complex physics directly on the GPU.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a href="#" className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all shadow-lg">
              Start Building <ArrowRight size={14} className="inline ml-1" />
            </a>
            <a href="#" className="px-8 py-4 border border-zinc-300 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:border-black transition-all">
              Documentation
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 border-b border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-light text-black tracking-tighter">
                {stat.value}<span className="text-lg text-zinc-400">{stat.unit}</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Capabilities</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Built for performance.</h2>
            <p className="text-zinc-500 text-sm font-light mt-4 max-w-md mx-auto">Six pillars of our rendering architecture, designed for speed and scale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feat) => (
              <div key={feat.title} className="group p-8 rounded-3xl border border-zinc-200 bg-white hover:border-black hover:shadow-lg transition-all duration-500">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center mb-5 group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-500">
                  <feat.icon size={18} className="text-zinc-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-base font-light text-black mb-2">{feat.title}</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STACK / INFRA */}
      <section className="py-24 md:py-32 px-6 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Infrastructure</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Enterprise-ready from day one.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {techStack.map((tech) => (
              <div key={tech.title} className="p-6 rounded-2xl bg-white border border-zinc-200 text-center hover:border-black transition-all">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center mx-auto mb-4">
                  <tech.icon size={20} className="text-zinc-500" />
                </div>
                <h3 className="text-sm font-light text-black mb-2">{tech.title}</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CODE SECTION */}
      <section className="py-24 md:py-32 px-6 bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black mb-4">Simple by design.</h2>
            <p className="text-zinc-500 text-sm font-light max-w-md mx-auto">Drop the boilerplate. Our React components wrap the entire WebGL context into a single declarative tag.</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden shadow-lg">
            <div className="h-10 bg-white border-b border-zinc-200 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
              <div className="w-3 h-3 rounded-full bg-green-400/50" />
              <span className="ml-4 text-[10px] text-zinc-400 font-mono">Scene.tsx</span>
            </div>
            <div className="p-6 md:p-8 font-mono text-xs md:text-sm leading-relaxed overflow-x-auto text-zinc-700">
              <p><span className="text-blue-600">import</span> {`{ Canvas, Mesh }`} <span className="text-blue-600">from</span> <span className="text-green-600">'@quantum/react'</span>;</p>
              <br />
              <p><span className="text-blue-600">export default function</span> <span className="text-purple-600">Scene</span>() {`{`}</p>
              <p className="ml-4"><span className="text-blue-600">return</span> (</p>
              <p className="ml-8"><span className="text-zinc-400">&lt;</span><span className="text-purple-600">Canvas</span> <span className="text-orange-600">engine</span><span className="text-black">=</span><span className="text-green-600">"quantum-v2"</span><span className="text-zinc-400">&gt;</span></p>
              <p className="ml-12"><span className="text-zinc-400">&lt;</span><span className="text-purple-600">Mesh</span> <span className="text-orange-600">material</span><span className="text-black">=</span><span className="text-green-600">"glassmorphism"</span> <span className="text-zinc-400">/&gt;</span></p>
              <p className="ml-8"><span className="text-zinc-400">&lt;/</span><span className="text-purple-600">Canvas</span><span className="text-zinc-400">&gt;</span></p>
              <p className="ml-4">);</p>
              <p>{`}`}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 md:py-32 px-6 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Start free, scale up.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`p-8 rounded-3xl border-2 transition-all ${plan.highlight ? 'border-black bg-white shadow-xl scale-105' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                {plan.highlight && (
                  <span className="px-3 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full mb-4 inline-block">Most Popular</span>
                )}
                <h3 className="text-xl font-light text-black mb-1">{plan.name}</h3>
                <p className="text-3xl font-light text-black mb-2">{plan.price}<span className="text-sm text-zinc-400">/mo</span></p>
                <p className="text-xs text-zinc-500 font-light mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-zinc-600 font-light">
                      <span className="w-1 h-1 bg-green-500 rounded-full shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <a href="#" className={`block text-center py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${plan.highlight ? 'bg-black text-white hover:bg-zinc-800' : 'border border-zinc-300 text-black hover:bg-zinc-50'}`}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 px-6 bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Testimonials</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Loved by developers.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-8 rounded-3xl border border-zinc-200 bg-white">
                <p className="text-sm text-zinc-600 font-light leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <p className="text-sm font-medium text-black">{t.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-32 px-6 bg-white border-b border-zinc-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Frequently asked questions.</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Do I need WebGPU-compatible hardware?", a: "Quantum Engine automatically falls back to WebGL 2.0 on devices that don't support WebGPU. You get the best possible performance on any modern browser." },
              { q: "Can I use it with Next.js?", a: "Absolutely. Quantum Engine was built for React and works seamlessly with Next.js, Remix, Vite, or any React-based framework." },
              { q: "Is there a free tier?", a: "Yes! The Starter plan is completely free and includes WebGPU Core, 100k polygons per scene, and 2GB of asset storage." },
              { q: "How does pricing scale?", a: "Pro plan at €49/month covers most professional needs. Enterprise pricing is custom and includes dedicated GPU nodes and SLA guarantees." },
            ].map((faq, i) => (
              <details key={i} className="group border border-zinc-200 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer text-sm font-light text-black hover:bg-zinc-50 transition-colors">
                  {faq.q}
                  <svg className="w-4 h-4 text-zinc-400 group-open:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-zinc-500 font-light leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 text-center bg-black text-white">
        <div className="max-w-xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter">Ready to build the future?</h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">Start rendering with Quantum Engine today. Free for development.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-200 transition-all shadow-lg">
              Deploy Now <ArrowRight size={14} className="inline ml-1" />
            </a>
            <a href="#" className="px-8 py-4 border border-white/30 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:border-white transition-all">
              View GitHub
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-sm font-light tracking-[0.3em] text-black">QUANTUM</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="hover:text-black transition-colors cursor-pointer">Docs</span>
            <span className="hover:text-black transition-colors cursor-pointer">API</span>
            <span className="hover:text-black transition-colors cursor-pointer">GitHub</span>
            <span>© 2024 Quantum Engine</span>
          </div>
        </div>
      </footer>
    </main>
  );
}