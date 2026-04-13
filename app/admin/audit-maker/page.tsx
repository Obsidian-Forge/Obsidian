"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, UploadCloud, Link as LinkIcon, ExternalLink, Trash2, FileJson } from 'lucide-react';

// Relative imports
import { supabase } from '@/lib/supabase';
import { extractWappalyzerData } from '@/lib/csvParser';
import { TechnicalAudit } from '../../types/audit';

export default function AuditMakerPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
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
    seo: 85,
    legacyLcp: '4.5s',
    novatrumLcp: '0.8s',
    heroImage: ''
  });

  useEffect(() => {
    fetchAudits();
  }, []);

  async function fetchAudits() {
    const { data } = await supabase.from('technical_audits').select('*').order('created_at', { ascending: false });
    if (data) setAudits(data);
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // CSV Parser Handler
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const parsedData = await extractWappalyzerData(e.target.files[0]);
      setFormData(prev => ({ ...prev, legacy_stack: parsedData }));
      showToast("CSV Parsed Successfully!", "success");
    } catch (error: any) {
      showToast(error.message, "error");
    }
    // Inputu temizle ki aynı dosyayı tekrar seçebilsin
    if (csvFileRef.current) csvFileRef.current.value = '';
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingHero(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;
    const filePath = `audits/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, heroImage: publicUrl }));
      showToast(`Hero image secured!`, "success");
    } catch (error: any) {
      showToast(`Upload failed: ${error.message}`, 'error');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleSaveAudit = async () => {
    if (!formData.slug || !formData.client_name || !formData.heroImage) {
      return showToast("Slug, Client Name and Image are required!", "error");
    }
    setLoading(true);
    const stackArray = formData.legacy_stack.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
      client_name: formData.client_name,
      target_url: formData.target_url,
      legacy_stack: stackArray,
      scores: {
        performance: Number(formData.perf),
        accessibility: Number(formData.a11y),
        bestPractices: Number(formData.bp),
        seo: Number(formData.seo),
        legacyLcp: formData.legacyLcp,
        novatrumLcp: formData.novatrumLcp
      },
      images: {
        heroImage: formData.heroImage
      }
    };

    const { error } = await supabase.from('technical_audits').insert([payload]);

    if (error) {
      if (error.code === '23505') showToast(`Error: This slug already exists.`, "error");
      else showToast(`DB Error: ${error.message}`, "error");
    } else {
      showToast("Vault generated successfully!", "success");
      setFormData({ slug: '', client_name: '', target_url: '', legacy_stack: '', perf: 50, a11y: 80, bp: 70, seo: 85, legacyLcp: '4.5s', novatrumLcp: '0.8s', heroImage: '' });
      fetchAudits(); 
    }
    setLoading(false);
  };

  const confirmDelete = async () => {
      if (!deleteModalId) return;
      const { error } = await supabase.from('technical_audits').delete().eq('id', deleteModalId);
      if (!error) {
          setAudits(audits.filter(a => a.id !== deleteModalId));
          showToast("Vault revoked.", "success");
      } else {
          showToast(`Error: ${error.message}`, "error");
      }
      setDeleteModalId(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans relative pb-20">
      
      {/* Toast & Modals (Same as before) */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
          {deleteModalId && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
                  <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="bg-white border border-zinc-200 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden flex flex-col">
                      <div className="p-6 text-center">
                          <h3 className="text-lg font-bold text-zinc-900 mb-2">Revoke Access?</h3>
                      </div>
                      <div className="flex border-t border-zinc-100">
                          <button onClick={() => setDeleteModalId(null)} className="flex-1 py-4 text-xs font-bold text-zinc-500 uppercase">Cancel</button>
                          <button onClick={confirmDelete} className="flex-1 py-4 text-xs font-bold text-red-500 uppercase">Delete</button>
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-200 pb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Audit Maker</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Engineering Projection Setup</p>
          </div>
          <button onClick={() => router.push('/admin/dashboard')} className="px-6 py-3 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 shadow-sm">
            Workspace
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            {/* Form */}
            <div className="lg:col-span-3 space-y-8">
                <div className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-200 shadow-sm space-y-8">
                
                {/* Wappalyzer CSV Upload */}
                <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-3xl flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2"><FileJson size={18} className="text-emerald-500"/> Wappalyzer Extractor</h3>
                        <p className="text-xs text-zinc-500 mt-1">Upload CSV to auto-fill the legacy stack.</p>
                    </div>
                    <input type="file" accept=".csv" ref={csvFileRef} onChange={handleCSVUpload} className="hidden" />
                    <button onClick={() => csvFileRef.current?.click()} className="px-5 py-2.5 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md">Get Data</button>
                </div>

                {/* Client Details */}
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Client Name</label>
                        <input value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none" />
                    </div>
                    <div>
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">URL Slug</label>
                        <input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Target Website URL</label>
                        <input value={formData.target_url} onChange={e => setFormData({...formData, target_url: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Legacy Stack (Auto-filled by CSV)</label>
                        <input value={formData.legacy_stack} onChange={e => setFormData({...formData, legacy_stack: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none" />
                    </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-800 mb-6 flex items-center gap-2">Legacy Metrics</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {['perf', 'a11y', 'bp', 'seo'].map((metric) => (
                            <div key={metric}>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">{metric}</label>
                                <input type="number" value={(formData as any)[metric]} onChange={e => setFormData({...formData, [metric]: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-mono text-center outline-none" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-100">
                    <div className="space-y-3">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block ml-1">Hero Image (Slider Background)</label>
                        <div onClick={() => heroFileRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${formData.heroImage ? 'bg-emerald-50 border-emerald-500' : 'bg-zinc-50 border-zinc-200'}`}>
                        <input type="file" ref={heroFileRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        {uploadingHero ? (
                            <div className="w-6 h-6 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin mx-auto" />
                        ) : formData.heroImage ? (
                            <span className="text-[10px] font-bold uppercase text-emerald-600">Image Secured</span>
                        ) : (
                            <span className="text-[10px] font-bold uppercase text-zinc-400">Upload Image</span>
                        )}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-100">
                    <button onClick={handleSaveAudit} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-3">
                    {loading ? "Generating..." : "Generate Vault Link"}
                    </button>
                </div>

                </div>
            </div>

            {/* Active Vaults */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-200 shadow-sm h-full max-h-[1000px] flex flex-col">
                    <div className="flex items-center justify-between mb-8 border-b border-zinc-100 pb-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-black flex items-center gap-2">Active Vaults</h3>
                    </div>
                    <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                        {audits.map((audit) => (
                            <motion.div key={audit.id} className="group bg-zinc-50 border border-zinc-100 p-5 rounded-3xl relative">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[9px] font-bold bg-white border border-zinc-200 px-2 py-1 rounded-md text-zinc-500">{new Date(audit.created_at).toLocaleDateString()}</span>
                                    <button onClick={() => setDeleteModalId(audit.id)} className="text-zinc-300 hover:text-red-500 bg-white p-1.5 rounded-lg border border-zinc-200"><Trash2 size={14} /></button>
                                </div>
                                <h3 className="font-bold text-sm text-zinc-900 mb-1">{audit.client_name}</h3>
                                <button onClick={() => window.open(`/v/${audit.slug}`, '_blank')} className="w-full flex items-center justify-center gap-2 py-2.5 mt-4 bg-white border border-zinc-200 rounded-xl text-[9px] font-bold uppercase text-zinc-600 shadow-sm">
                                    <ExternalLink size={14} /> Open
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}