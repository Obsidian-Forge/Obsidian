// app/(public)/demo/saas/page.tsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ArrowRight, BarChart3, Cloud, Gauge, Layers, Shield, Users, Zap, CheckCircle2, Star, Workflow } from 'lucide-react';

const features = [
  { icon: BarChart3, title: "Real-Time Analytics", desc: "Live dashboards with sub-second data refresh. Track every metric that matters to your business." },
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2 Type II certified. End-to-end encryption, SSO, and role-based access control built in." },
  { icon: Workflow, title: "Workflow Automation", desc: "Create custom workflows with our drag-and-drop builder. Automate repetitive tasks in minutes." },
  { icon: Cloud, title: "Cloud-Native", desc: "Deploy across 15 regions worldwide. Auto-scaling ensures zero downtime during traffic spikes." },
  { icon: Layers, title: "API-First Design", desc: "RESTful and GraphQL APIs with comprehensive documentation. Integrate with your existing stack." },
  { icon: Zap, title: "Lightning Fast", desc: "Average response time under 50ms. Optimized queries and edge caching for maximum speed." },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "€29",
    desc: "Perfect for small teams getting started.",
    features: ["Up to 5 team members", "10GB storage", "Basic analytics", "Email support", "1 project"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Professional",
    price: "€79",
    desc: "For growing businesses that need more power.",
    features: ["Up to 20 team members", "100GB storage", "Advanced analytics", "Priority support", "Unlimited projects", "Custom workflows", "API access"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large organizations with advanced needs.",
    features: ["Unlimited team members", "Unlimited storage", "Custom analytics", "Dedicated support", "Unlimited projects", "Custom integrations", "SLA guarantee", "On-premise option"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO, TechScale",
    text: "Switching to MetricFlow reduced our infrastructure costs by 40% while giving us better insights. The team onboarding was seamless.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Marcus Eriksson",
    role: "VP Engineering, NordicPay",
    text: "The API-first approach meant we integrated with our existing stack in days, not months. Game-changing for our business.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Elena Rodriguez",
    role: "Founder, DataVista",
    text: "We evaluated 6 platforms before MetricFlow. None came close to the combination of speed, security, and ease of use.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
  },
];

const metrics = [
  { value: "99.99%", label: "Uptime SLA" },
  { value: "<50ms", label: "Avg Response Time" },
  { value: "15", label: "Global Regions" },
  { value: "10K+", label: "Active Teams" },
];

export default function SaaSDemo() {
  return (
    <main className="w-full bg-white text-black font-sans selection:bg-black selection:text-white">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <span className="text-sm font-light tracking-[0.3em] text-black">METRICFLOW</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Pricing', 'Docs', 'Blog'].map(item => (
              <a key={item} href="#" className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest hover:text-black transition-colors">{item}</a>
            ))}
            <a href="#" className="px-6 py-2.5 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-800 transition-all">Start Free Trial</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden bg-zinc-50 border-b border-zinc-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            v3.2 Now Available
          </div>
          <h1 className="text-5xl md:text-8xl font-light tracking-tighter leading-[0.95] text-black">
            Analytics that<br />
            <span className="text-zinc-300">move at your speed.</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed">
            A modern analytics platform for teams who need real-time insights without the complexity. Connect your data sources in minutes, not months.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a href="#" className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all shadow-lg">
              Start Free Trial <ArrowRight size={14} className="inline ml-1" />
            </a>
            <a href="#" className="px-8 py-4 border border-zinc-300 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:border-black transition-all">
              View Live Demo
            </a>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="py-16 px-6 border-b border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <p className="text-3xl md:text-4xl font-light text-black tracking-tighter">{metric.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 md:py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Features</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Everything you need.</h2>
            <p className="text-zinc-500 text-sm font-light mt-4 max-w-md mx-auto">Six pillars of our analytics platform, built for modern engineering teams.</p>
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

      {/* DASHBOARD PREVIEW */}
      <section className="py-24 md:py-32 px-6 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Beautiful dashboards, out of the box.</h2>
            <p className="text-zinc-500 text-sm font-light mt-4 max-w-md mx-auto">No SQL required. Connect your data and get stunning visualizations instantly.</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-lg p-6 md:p-10">
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Users", value: "24,892", change: "+12.5%", color: "text-green-500" },
                { label: "Active Sessions", value: "1,423", change: "+8.2%", color: "text-green-500" },
                { label: "Avg. Load Time", value: "42ms", change: "-15.3%", color: "text-green-500" },
                { label: "Error Rate", value: "0.12%", change: "+0.02%", color: "text-red-500" },
              ].map((card) => (
                <div key={card.label} className="p-5 rounded-xl border border-zinc-200 bg-zinc-50">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">{card.label}</p>
                  <p className="text-2xl font-light text-black mb-1">{card.value}</p>
                  <p className={`text-[10px] font-medium ${card.color}`}>{card.change}</p>
                </div>
              ))}
            </div>
            {/* Chart Placeholder */}
            <div className="h-48 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center">
              <BarChart3 size={48} className="text-zinc-300" />
              <span className="ml-4 text-sm text-zinc-400 font-light">Real-time data visualization</span>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-24 md:py-32 px-6 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Pricing</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Simple, transparent pricing.</h2>
            <p className="text-zinc-500 text-sm font-light mt-4">Start free. Upgrade when you need more power. No hidden fees.</p>
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
                      <CheckCircle2 size={12} className="text-green-500 shrink-0" /> {f}
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
      <section className="py-24 md:py-32 px-6 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Testimonials</p>
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-black">Trusted by engineering teams.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-8 rounded-3xl border border-zinc-200 bg-white">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-600 font-light leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-200">
                    <Image src={t.image} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">{t.name}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 text-center bg-black text-white">
        <div className="max-w-xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter">Ready to see your data differently?</h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">Start your free 14-day trial. No credit card required. Cancel anytime.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="#" className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-200 transition-all shadow-lg">
              Start Free Trial <ArrowRight size={14} className="inline ml-1" />
            </a>
            <a href="#" className="px-8 py-4 border border-white/30 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:border-white transition-all">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 bg-white border-t border-zinc-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <span className="text-sm font-light tracking-[0.3em] text-black">METRICFLOW</span>
          </div>
          <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
            <span className="hover:text-black transition-colors cursor-pointer">Docs</span>
            <span className="hover:text-black transition-colors cursor-pointer">API</span>
            <span className="hover:text-black transition-colors cursor-pointer">Status</span>
            <span>© 2024 MetricFlow</span>
          </div>
        </div>
      </footer>
    </main>
  );
}