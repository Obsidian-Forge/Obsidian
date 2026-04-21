"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, AlertCircle, UploadCloud, Link as LinkIcon, 
  ExternalLink, Trash2, FileJson, Sparkles, Globe, Zap, 
  ShieldCheck, Search, BarChart3, ArrowRight, X, Layout, Plus
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { extractWappalyzerData } from '@/lib/csvParser';
import { TechnicalAudit } from '../../types/audit';

export default function AuditMakerPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [audits, setAudits] = useState<TechnicalAudit[]>([]);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  const heroFileRef = useRef<HTMLInputElement>(null);
  const csvFileRef = useRef<HTMLInputElement>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: '',
    client_name: '',
    target_url: '',
    legacy_stack: '', 
    perf: 50,
    a11y: 80,
    bp: 70,
    seo: 90,
    hero_image: '',
    ai_summary: '', 
  });

  useEffect(() => { fetchAudits(); }, []);

  const fetchAudits = async () => {
    const { data, error } = await supabase.from('audits').select('*').order('created_at', { ascending: false });
    if (!error && data) setAudits(data);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const techNames = extractWappalyzerData(text);
      setFormData(prev => ({ ...prev, legacy_stack: techNames.join(', ') }));
      showToast("Wappalyzer data parsed successfully!");
    } catch (err) {
      showToast("Error parsing CSV", "error");
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `audit-heroes/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('vault').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('vault').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, hero_image: data.publicUrl }));
      showToast("Hero image uploaded!");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setUploadingHero(false);
    }
  };

  // YENİ: YZ İLE ANALİZ FONKSİYONU
  const generateAiSummary = async () => {
      if (!formData.client_name || !formData.target_url) {
          showToast("Please enter Client Name and URL first.", "error");
          return;
      }
      setIsAnalyzing(true);
      try {
          const response = await fetch('/api/admin/audit-ai', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
          });
          
          if (!response.ok) throw new Error("AI Engine failed to generate summary.");
          
          const data = await response.json();
          setFormData(prev => ({ ...prev, ai_summary: data.summary }));
          showToast("Neural Analysis Complete!", "success");
      } catch (err: any) {
          showToast(err.message, "error");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('audits').insert([formData]);
      if (error) throw error;
      showToast("Technical Audit Created!");
      setFormData({ slug: '', client_name: '', target_url: '', legacy_stack: '', perf: 50, a11y: 80, bp: 70, seo: 90, hero_image: '', ai_summary: '' });
      fetchAudits();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('audits').delete().eq('id', id);
    if (!error) {
      setAudits(audits.filter(a => a.id !== id));
      setDeleteModalId(null);
      showToast("Audit deleted.");
    }
  };

  const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
      return 'text-red-500 bg-red-50 border-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700 font-sans">
      
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-black text-white'}`}>{toast.message}</motion.div>
        )}
      </AnimatePresence>

      <header className="mb-12 flex justify-between items-end">
        <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900 mb-2">Audit Maker</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Generate high-conversion technical architecture reports.</p>
        </div>
        <div className="flex gap-2 bg-zinc-100 p-1 rounded-2xl border border-zinc-200">
            <div className="px-4 py-2 bg-white rounded-xl shadow-sm text-[9px] font-bold uppercase tracking-widest">Builder</div>
            <div className="px-4 py-2 text-zinc-400 text-[9px] font-bold uppercase tracking-widest cursor-not-allowed">Templates</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><Globe size={14}/> Target Architecture Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Client / Project Name</label>
                            <input required value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} placeholder="e.g. Tesla Motors Europe" className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-bold outline-none focus:border-black transition-all" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Target URL</label>
                            <div className="relative">
                                <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input required value={formData.target_url} onChange={e => setFormData({...formData, target_url: e.target.value})} placeholder="https://client-site.com" className="w-full bg-zinc-50 border border-zinc-200 pl-11 pr-5 py-4 rounded-2xl text-sm outline-none focus:border-black transition-all" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Report Slug (Unique)</label>
                            <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} placeholder="tesla-performance-audit" className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-mono outline-none focus:border-black transition-all" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><Zap size={14}/> Core Web Vitals (PageSpeed)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'perf', label: 'Performance' },
                            { id: 'a11y', label: 'Accessibility' },
                            { id: 'bp', label: 'Best Practices' },
                            { id: 'seo', label: 'SEO Score' }
                        ].map((score) => (
                            <div key={score.id} className="space-y-2">
                                <label className="text-[9px] font-bold uppercase text-zinc-400 block text-center">{score.label}</label>
                                {/* DÜZELTME: NaN HATASI BURADA ÇÖZÜLDÜ */}
                                <input 
                                    type="number" min="0" max="100"
                                    value={formData[score.id as keyof typeof formData]} 
                                    onChange={e => {
                                        const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                                        setFormData({...formData, [score.id]: val});
                                    }}
                                    className={`w-full py-4 rounded-2xl border text-center text-xl font-mono font-bold outline-none transition-all ${getScoreColor(Number(formData[score.id as keyof typeof formData]))}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-black p-8 rounded-[32px] text-white shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none"><Sparkles size={160}/></div>
                    
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 relative z-10">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Sparkles size={14} className="text-amber-400"/> Neural AI Executive Summary</h3>
                        <button 
                            type="button" 
                            onClick={generateAiSummary}
                            disabled={isAnalyzing}
                            className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isAnalyzing ? <><Plus className="animate-spin" size={12}/> Analyzing...</> : <><Sparkles size={12}/> Generate Analysis</>}
                        </button>
                    </div>

                    <div className="relative z-10">
                        <textarea 
                            value={formData.ai_summary} 
                            onChange={e => setFormData({...formData, ai_summary: e.target.value})}
                            placeholder="Click 'Generate Analysis' to let Neural AI write a persuasive sales summary based on the performance scores..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm leading-relaxed text-zinc-300 outline-none focus:border-amber-500/50 min-h-[160px] resize-none transition-all"
                        />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><Layout size={14}/> Technical Stack & Visualization</h3>
                    
                    <div className="space-y-4">
                        <label className="text-[9px] font-bold uppercase text-zinc-500 block">Identified Legacy Stack (CSV or Manual)</label>
                        <div className="flex gap-3">
                            <input value={formData.legacy_stack} onChange={e => setFormData({...formData, legacy_stack: e.target.value})} placeholder="e.g. PHP, jQuery, Apache, WordPress" className="flex-1 bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm outline-none focus:border-black transition-all" />
                            <button type="button" onClick={() => csvFileRef.current?.click()} className="px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm">
                                <FileJson size={14}/> Parse CSV
                            </button>
                            <input type="file" ref={csvFileRef} onChange={handleCsvUpload} className="hidden" accept=".csv" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <label className="text-[9px] font-bold uppercase text-zinc-500 mb-3 block">Landing Hero Preview</label>
                        <div 
                            onClick={() => heroFileRef.current?.click()}
                            className="w-full aspect-video bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 hover:border-black transition-all overflow-hidden relative group"
                        >
                            {formData.hero_image ? (
                                <>
                                    <img src={formData.hero_image} className="w-full h-full object-cover" alt="Hero" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest transition-opacity">Change Image</div>
                                </>
                            ) : (
                                <>
                                    <div className={`p-4 bg-white rounded-2xl shadow-sm mb-3 ${uploadingHero ? 'animate-bounce' : ''}`}><UploadCloud size={24} className="text-zinc-400"/></div>
                                    <p className="text-[10px] font-bold uppercase text-zinc-400">{uploadingHero ? 'Vaulting...' : 'Upload Site Screenshot'}</p>
                                </>
                            )}
                            <input type="file" ref={heroFileRef} onChange={handleHeroUpload} className="hidden" accept="image/*" />
                        </div>
                    </div>
                </div>

                <button 
                    disabled={loading || !formData.slug} 
                    className="w-full bg-black text-white py-6 rounded-[28px] text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {loading ? <Plus className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>}
                    Construct Final Architecture Report
                </button>
            </form>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-50 p-8 rounded-[32px] border border-zinc-200">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-4 mb-6 flex items-center gap-2"><BarChart3 size={14}/> Recent Audit Nodes</h3>
                
                <div className="space-y-3">
                    {audits.length === 0 && <p className="text-[10px] text-zinc-400 italic text-center py-10">No audits found.</p>}
                    {audits.map((audit) => (
                        <motion.div key={audit.id} className="group bg-white border border-zinc-200 p-5 rounded-[24px] relative hover:border-black transition-all hover:shadow-lg">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[8px] font-bold bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md text-zinc-500 font-mono uppercase">{new Date(audit.created_at).toLocaleDateString()}</span>
                                <button onClick={() => setDeleteModalId(audit.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </div>
                            <h3 className="font-bold text-sm text-zinc-900 mb-1 truncate">{audit.client_name}</h3>
                            <p className="text-[9px] text-zinc-400 mb-4 font-mono truncate">{audit.target_url}</p>
                            
                            <div className="flex gap-2">
                                <button onClick={() => window.open(`/v/${audit.slug}`, '_blank')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-sm hover:bg-zinc-800 transition-all">
                                    <ExternalLink size={12} /> Open Report
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[32px] space-y-4">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl w-fit"><ShieldCheck size={20}/></div>
                <h4 className="text-sm font-bold text-emerald-900">Audit Strategy</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                    Always focus on <b>conversion loss</b>. Tell the client that every second of delay reduces revenue by 7%. Use the AI Summary to make it personal.
                </p>
                <div className="pt-2">
                    <button className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2 hover:gap-3 transition-all">Read Guide <ArrowRight size={12}/></button>
                </div>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {deleteModalId && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-zinc-100 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={28}/></div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Audit?</h3>
                    <p className="text-xs text-zinc-500 mb-8">This action will permanently erase the report node and the public link will be broken.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModalId(null)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition-colors">Cancel</button>
                        <button onClick={() => handleDelete(deleteModalId)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-white bg-red-500 rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200">Delete</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
      `}</style>
    </div>
  );
}