// app/admin/discoveries/new/page.tsx

"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, User, Mail, DollarSign, FileText, Building, Target, Palette, Users, Calendar, Search, Shield, Layout, Type, TrendingUp, PenTool, Globe, Wrench, Cpu, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function NewDiscoveryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    project_type: 'Web Application',
    estimated_price: 0,
    details: {
      goals: '',
      notes: '',
      assets: '',
      colors: '',
      company: '',
      audience: '',
      timeline: 'standard',
      seo_setup: 'standard',
      setup_fee: '',
      compliance: 'standard',
      page_count: '1',
      typography: 'sans-serif',
      competitors: '',
      copywriting: 'Client Provided',
      data_region: 'eu',
      maintenance: 'No Ongoing Support (€0/mo)',
      architecture: ''
    }
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const generateDiscoveryNumber = () => {
    return 'DS-' + Date.now().toString().slice(-6);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.from('project_discovery').insert({
        discovery_number: generateDiscoveryNumber(),
        client_name: form.client_name,
        client_email: form.client_email,
        project_type: form.project_type,
        estimated_price: form.estimated_price,
        details: form.details,
        status: 'pending'
      });

      if (error) throw error;

      showToast("Discovery Blueprint Created Successfully");
      setTimeout(() => router.push('/admin/discoveries'), 1500);
    } catch (err: any) {
      showToast(err.message || "Failed to create discovery", "error");
      setSaving(false);
    }
  };

  const updateDetail = (key: string, value: string) => {
    setForm(prev => ({
      ...prev,
      details: { ...prev.details, [key]: value }
    }));
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-5xl mx-auto bg-white min-h-screen rounded-[40px] shadow-sm border border-zinc-100 mt-6 overflow-hidden pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl border ${
              toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-black text-white'
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex items-center justify-between p-8 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 bg-white border border-zinc-200 rounded-full text-zinc-400 hover:text-black transition-colors shadow-sm">
            <ArrowLeft size={18}/>
          </button>
          <div>
            <h1 className="text-2xl font-light tracking-tight text-zinc-900">New Discovery Blueprint</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Manual Lead Intake & Architecture Planning</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* CORE IDENTITY */}
        <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2">
            <User size={14}/> Core Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <User size={10}/> Client Name *
              </label>
              <input 
                required 
                value={form.client_name} 
                onChange={e => setForm({...form, client_name: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors" 
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Mail size={10}/> Email Address *
              </label>
              <input 
                required 
                type="email"
                value={form.client_email} 
                onChange={e => setForm({...form, client_email: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors" 
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Building size={10}/> Company
              </label>
              <input 
                value={form.details.company} 
                onChange={e => updateDetail('company', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors" 
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Target size={10}/> Platform Type *
              </label>
              <select 
                required
                value={form.project_type} 
                onChange={e => setForm({...form, project_type: e.target.value})} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors"
              >
                <option>Web Application</option>
                <option>Landing Architecture</option>
                <option>E-Commerce Platform</option>
                <option>Mobile App (iOS/Android)</option>
                <option>AI & Neural Integration</option>
                <option>Custom SaaS Architecture</option>
              </select>
            </div>
          </div>
        </div>

        {/* SYSTEM REQUIREMENTS */}
        <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2">
            <Cpu size={14}/> System Requirements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Target size={10}/> Goals & Objectives
              </label>
              <textarea 
                value={form.details.goals} 
                onChange={e => updateDetail('goals', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors min-h-[80px]" 
                placeholder="What are the main goals for this project?"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <FileText size={10}/> Notes
              </label>
              <textarea 
                value={form.details.notes} 
                onChange={e => updateDetail('notes', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors min-h-[80px]" 
                placeholder="Additional notes..."
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Users size={10}/> Target Audience
              </label>
              <input 
                value={form.details.audience} 
                onChange={e => updateDetail('audience', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors" 
                placeholder="e.g. SMEs, Enterprise, Consumers"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <TrendingUp size={10}/> Competitors
              </label>
              <input 
                value={form.details.competitors} 
                onChange={e => updateDetail('competitors', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors" 
                placeholder="Main competitors..."
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Layout size={10}/> Page Count
              </label>
              <input 
                value={form.details.page_count} 
                onChange={e => updateDetail('page_count', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors" 
                placeholder="Number of pages"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Calendar size={10}/> Timeline
              </label>
              <select 
                value={form.details.timeline} 
                onChange={e => updateDetail('timeline', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors"
              >
                <option value="urgent">Urgent (1-2 weeks)</option>
                <option value="standard">Standard (3-6 weeks)</option>
                <option value="extended">Extended (2-3 months)</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Search size={10}/> SEO Setup
              </label>
              <select 
                value={form.details.seo_setup} 
                onChange={e => updateDetail('seo_setup', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <PenTool size={10}/> Copywriting
              </label>
              <select 
                value={form.details.copywriting} 
                onChange={e => updateDetail('copywriting', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors"
              >
                <option>Client Provided</option>
                <option>Professional Copywriter</option>
                <option>AI-Assisted</option>
                <option>Not Required</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Palette size={10}/> Colors
              </label>
              <input 
                value={form.details.colors} 
                onChange={e => updateDetail('colors', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors" 
                placeholder="Primary: #000000, Secondary: #ffffff"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Type size={10}/> Typography
              </label>
              <select 
                value={form.details.typography} 
                onChange={e => updateDetail('typography', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors"
              >
                <option value="sans-serif">Sans-Serif (Modern)</option>
                <option value="serif">Serif (Classic)</option>
                <option value="display">Display (Bold)</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Shield size={10}/> Compliance
              </label>
              <select 
                value={form.details.compliance} 
                onChange={e => updateDetail('compliance', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors"
              >
                <option value="standard">Standard</option>
                <option value="gdpr">GDPR Required</option>
                <option value="hipaa">HIPAA Required</option>
                <option value="other">Other Regulations</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Globe size={10}/> Data Region
              </label>
              <select 
                value={form.details.data_region} 
                onChange={e => updateDetail('data_region', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors"
              >
                <option value="eu">EU (Europe)</option>
                <option value="us">US (United States)</option>
                <option value="asia">Asia Pacific</option>
                <option value="global">Global Distribution</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <DollarSign size={10}/> Setup Fee
              </label>
              <input 
                value={form.details.setup_fee} 
                onChange={e => updateDetail('setup_fee', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors" 
                placeholder="€300"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Wrench size={10}/> Maintenance
              </label>
              <select 
                value={form.details.maintenance} 
                onChange={e => updateDetail('maintenance', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors"
              >
                <option>No Ongoing Support (€0/mo)</option>
                <option>Basic (€50/mo)</option>
                <option>Standard (€150/mo)</option>
                <option>Premium (€300/mo)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <Cpu size={10}/> Architecture Notes
              </label>
              <textarea 
                value={form.details.architecture} 
                onChange={e => updateDetail('architecture', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors min-h-[80px]" 
                placeholder="Technical architecture requirements..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <FileText size={10}/> Assets & Resources
              </label>
              <textarea 
                value={form.details.assets} 
                onChange={e => updateDetail('assets', e.target.value)} 
                className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors min-h-[80px]" 
                placeholder="Existing assets, logos, brand guidelines..."
              />
            </div>
          </div>
        </div>

        {/* ESTIMATED INVESTMENT */}
        <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
                <DollarSign size={14}/> Estimated Investment
              </h3>
              <p className="text-xs text-emerald-700">Total project value estimation</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-light text-emerald-600">€</span>
              <input 
                type="number"
                value={form.estimated_price} 
                onChange={e => setForm({...form, estimated_price: parseFloat(e.target.value) || 0})} 
                className="w-40 bg-white border border-emerald-200 px-4 py-2 rounded-xl text-right text-xl font-bold text-emerald-700 outline-none focus:border-emerald-400 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-end gap-4">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-zinc-100 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="bg-black text-white px-12 py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              "Creating..."
            ) : (
              <><CheckCircle2 size={14}/> Create Discovery Blueprint</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}