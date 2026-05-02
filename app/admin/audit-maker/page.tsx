"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, AlertCircle, UploadCloud, Link as LinkIcon, 
  ExternalLink, Trash2, FileJson, Sparkles, Globe, Zap, 
  ShieldCheck, Search, BarChart3, ArrowRight, X, Layout, Plus,
  Activity, Leaf, Lock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { extractWappalyzerData } from '@/lib/csvParser';
import { TechnicalAudit } from '../../types/audit';

export default function AuditMakerPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
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
    language: 'EN',
    legacy_stack: '',
    hero_image: '',
    ai_summary: '',
    perf: 0, a11y: 0, bp: 0, seo: 0,
    fcp: '', lcp: '', tbt: '', cls: '', speed_index: '',
    carbon: '', ssl: ''
  });

  useEffect(() => { fetchAudits(); }, []);

  const fetchAudits = async () => {
    const { data } = await supabase.from('audits').select('*').order('created_at', { ascending: false });
    if (data) setAudits(data);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- THE SECURE SERVER-SIDE FETCHER ---
  const handleAutoFetch = async () => {
      if (!formData.target_url || formData.target_url.length < 4) {
          return showToast("Please enter a valid Target URL first.", "error");
      }
      
      setIsFetching(true);
      showToast("Scanning domain in background...");
      
      let url = formData.target_url.trim();
      if (!url.startsWith('http')) url = `https://${url}`;

      try {
          const res = await fetch('/api/admin/audit-scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url })
          });
          
          const result = await res.json();
          if (result.error) throw new Error(result.error);

          // Update form with found data
          setFormData(prev => ({
              ...prev,
              perf: result.data.perf || prev.perf,
              a11y: result.data.a11y || prev.a11y,
              bp: result.data.bp || prev.bp,
              seo: result.data.seo || prev.seo,
              fcp: result.data.fcp || prev.fcp,
              lcp: result.data.lcp || prev.lcp,
              tbt: result.data.tbt || prev.tbt,
              cls: result.data.cls || prev.cls,
              speed_index: result.data.speed_index || prev.speed_index,
              carbon: result.data.carbon || prev.carbon,
              ssl: result.data.ssl || prev.ssl
          }));

          showToast("Data Auto-Fetched Successfully!");
      } catch (err: any) {
          showToast(err.message, "error");
      } finally {
          setIsFetching(false);
      }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploadingHero(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_hero.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('vault').upload(`audits/${fileName}`, file);
      
      if (!uploadError) {
          const { data } = supabase.storage.from('vault').getPublicUrl(`audits/${fileName}`);
          setFormData({ ...formData, hero_image: data.publicUrl });
          showToast("Visual Capture uploaded.");
      }
      setUploadingHero(false);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const text = await file.text();
      const techStack = extractWappalyzerData(text);
      const formattedStack = Array.isArray(techStack) ? techStack.join(', ') : techStack;
      setFormData({ ...formData, legacy_stack: formattedStack });
      showToast("Tech Stack imported from CSV!");
  };

  const handleGenerateAI = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/admin/audit-ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFormData({ ...formData, ai_summary: data.summary });
      showToast("AI Summary Generated!");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('audits').upsert([{ ...formData }]);
    if (error) {
      showToast(error.message, "error");
    } else {
      showToast("Audit Vaulted Successfully!");
      fetchAudits();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('audits').delete().eq('id', id);
    setAudits(audits.filter(a => a.id !== id));
    setDeleteModalId(null);
    showToast("Audit permanently erased.");
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700 font-sans">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-black text-white'}`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="mb-12 flex justify-between items-end border-b border-zinc-200 pb-8">
        <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900 mb-2">Audit Maker</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Manual Entry & Auto-Detect Engine</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-8 space-y-8">
            <form onSubmit={handleSaveAudit} className="space-y-8">
                
                {/* 1. Base Setup */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2"><Globe size={14}/> Base Setup</span>
                        <button type="button" onClick={handleAutoFetch} disabled={isFetching} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors disabled:opacity-50">
                            {isFetching ? <Activity size={12} className="animate-spin"/> : <Zap size={12}/>} Auto-Fetch Data
                        </button>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Target URL</label>
                            <input required value={formData.target_url} onChange={e => setFormData({...formData, target_url: e.target.value})} placeholder="tesla.com" className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-mono outline-none focus:border-black transition-all" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Client Name</label>
                            <input required value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-bold outline-none focus:border-black" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Access Slug (e.g. tesla-motors)</label>
                            <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-mono outline-none focus:border-black" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Audit Language</label>
                            <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-bold outline-none focus:border-black cursor-pointer">
                                <option value="EN">English</option>
                                <option value="FR">French</option>
                                <option value="NL">Dutch</option>
                                <option value="TR">Turkish</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Manual Scores & Tech */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><Zap size={14}/> Lighthouse & Core Vitals</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {['perf', 'a11y', 'bp', 'seo'].map((key) => (
                            <div key={key}>
                                <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">{key}</label>
                                <input type="number" value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: parseInt(e.target.value) || 0})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-mono outline-none focus:border-black" />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-zinc-100 mb-6">
                        {['fcp', 'lcp', 'tbt', 'cls', 'speed_index'].map((key) => (
                            <div key={key}>
                                <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">{key.replace('_', ' ')}</label>
                                <input value={(formData as any)[key]} onChange={e => setFormData({...formData, [key]: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-xs font-mono outline-none focus:border-black" />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-zinc-100">
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Tech Stack (Manual or CSV)</label>
                            <div className="flex gap-2">
                                <input value={formData.legacy_stack} onChange={e => setFormData({...formData, legacy_stack: e.target.value})} className="flex-1 bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-xs font-mono outline-none" />
                                <button type="button" onClick={() => csvFileRef.current?.click()} className="px-3 bg-zinc-100 rounded-xl text-zinc-600 hover:bg-zinc-200"><FileJson size={16}/></button>
                                <input type="file" accept=".csv" ref={csvFileRef} onChange={handleCsvUpload} className="hidden" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Visual Hero Image</label>
                            <button type="button" onClick={() => heroFileRef.current?.click()} className="w-full h-10 border border-dashed border-zinc-300 rounded-xl text-xs text-zinc-500 flex items-center justify-center gap-2 hover:bg-zinc-50">
                                {uploadingHero ? <Activity size={14} className="animate-spin"/> : <UploadCloud size={14}/>} 
                                {formData.hero_image ? "Image Uploaded - Click to Change" : "Upload Screenshot"}
                            </button>
                            <input type="file" accept="image/*" ref={heroFileRef} onChange={handleHeroUpload} className="hidden" />
                        </div>
                    </div>
                </div>

                {/* 3. New Section: Auto-Detected Extras & AI */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><ShieldCheck size={14}/> Auto-Detected Extras & AI</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1"><Leaf size={12}/> Carbon Footprint</label>
                            <input value={formData.carbon} onChange={e => setFormData({...formData, carbon: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-xs font-mono outline-none focus:border-black" placeholder="Will auto-fill on click" />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1"><Lock size={12}/> Security / SSL Grade</label>
                            <input value={formData.ssl} onChange={e => setFormData({...formData, ssl: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-xs font-mono outline-none focus:border-black" placeholder="Will auto-fill on click" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-[9px] font-bold uppercase text-zinc-500">AI Executive Summary</label>
                            <button type="button" onClick={handleGenerateAI} disabled={isAnalyzing} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-indigo-100 transition-colors disabled:opacity-50">
                                {isAnalyzing ? <Activity size={12} className="animate-spin"/> : <Sparkles size={12}/>} Generate AI
                            </button>
                        </div>
                        <textarea rows={6} value={formData.ai_summary} onChange={e => setFormData({...formData, ai_summary: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm outline-none resize-none focus:border-black" />
                    </div>
                </div>

                <button disabled={loading} className="w-full bg-black text-white py-6 rounded-[28px] text-[11px] font-bold uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                    {loading ? <Activity size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                    {loading ? "Vaulting..." : "Save to Vault"}
                </button>
            </form>
        </div>

        {/* RIGHT COLUMN: LIST */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-50 p-8 rounded-[32px] border border-zinc-200 h-full max-h-[800px] flex flex-col">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-4 mb-6 flex items-center gap-2"><BarChart3 size={14}/> Vault Records</h3>
                <div className="space-y-3 overflow-y-auto pr-2 flex-1">
                    {audits.length === 0 && <p className="text-[10px] text-zinc-400 italic text-center py-10">No audits found in vault.</p>}
                    {audits.map((a) => (
                        <div key={a.id} className="bg-white border border-zinc-200 p-5 rounded-[24px] shadow-sm hover:border-black transition-all group">
                            <div className="flex justify-between mb-2 items-center">
                                <span className="text-[8px] font-bold bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-md text-zinc-500 font-mono uppercase">{new Date(a.created_at).toLocaleDateString()}</span>
                                <button onClick={() => setDeleteModalId(a.id)} className="text-zinc-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                            </div>
                            <h3 className="font-bold text-sm truncate mb-1">{a.client_name}</h3>
                            <p className="text-[9px] text-zinc-400 font-mono mb-4 truncate">{a.target_url}</p>
                            <button onClick={() => window.open(`/v/${a.slug}`, '_blank')} className="w-full py-2.5 bg-black text-white rounded-xl text-[9px] font-bold uppercase tracking-widest flex justify-center items-center gap-1.5 hover:bg-zinc-800 transition-colors">
                                <ExternalLink size={12} /> Open Report
                            </button>
                        </div>
                    ))}
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
                    <p className="text-xs text-zinc-500 mb-8 leading-relaxed">This action will permanently erase the report node and the public link will be broken.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setDeleteModalId(null)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600 bg-zinc-100 rounded-2xl hover:bg-zinc-200 transition-colors">Cancel</button>
                        <button onClick={() => handleDelete(deleteModalId)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-white bg-red-600 rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">Delete</button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
      `}</style>
    </div>
  );
}