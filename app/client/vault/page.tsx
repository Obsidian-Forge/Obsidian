"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Database, Layers, HardDrive, Download, ExternalLink, 
  X, HeartCrack, Image as ImageIcon, FileBox, Calendar, FileCheck,
  RefreshCw
} from 'lucide-react';

// Dosya Tipleri için Interface
interface VaultFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: string;
  created_at: string;
  category: 'invoice' | 'technical' | 'asset';
}

export default function ClientVaultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // Arka plan yenileme animasyonu için
  const [isDark, setIsDark] = useState(false);
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [activeTab, setActiveTab] = useState<'invoice' | 'technical' | 'asset'>('invoice');
  const [selectedFile, setSelectedFile] = useState<VaultFile | null>(null);

  // Veri çekme fonksiyonu (silent = true ise tam sayfa loading göstermez)
  const fetchData = useCallback(async (clientId: string, silent = false) => {
    if (!silent) setLoading(true);
    else setIsSyncing(true);

    try {
      // SADECE BU MÜŞTERİNİN DOSYALARINI ÇEK (GÜVENLİK)
      const [filesRes, invoicesRes] = await Promise.all([
        supabase.from('client_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
        supabase.from('client_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
      ]);

      const combinedFiles: VaultFile[] = [];

      if (invoicesRes.data) {
        invoicesRes.data.forEach(inv => combinedFiles.push({ ...inv, category: 'invoice' }));
      }
      if (filesRes.data) {
        filesRes.data.forEach(f => combinedFiles.push({ ...f, category: f.file_type as 'technical' | 'asset' }));
      }

      setFiles(combinedFiles);
    } catch (err) {
      console.error("Vault retrieval error", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem('novatrum_client_id');
    if (!storedId) return router.push('/client/login');
    
    // 1. Sayfa ilk açıldığında tam yükleme yap
    fetchData(storedId);

    // 2. Her 10 saniyede bir arka planda GİZLİ (silent) yenileme yap
    const interval = setInterval(() => {
        fetchData(storedId, true);
    }, 10000); // 10000 ms = 10 Saniye

    // Temizlik (Component kapanırsa interval'i durdur)
    return () => clearInterval(interval);
  }, [fetchData, router]);

  useEffect(() => {
    const checkTheme = () => setIsDark(localStorage.getItem('novatrum_theme') === 'dark');
    checkTheme();
    window.addEventListener('theme-changed', checkTheme);
    return () => window.removeEventListener('theme-changed', checkTheme);
  }, []);

  // Dosya Uzantısını Alma ve Önizleme Tipi Belirleme
  const getFilePreviewType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return 'image';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['txt'].includes(ext)) return 'text';
    return 'unsupported';
  };

  const getFileIcon = (fileName: string) => {
      const type = getFilePreviewType(fileName);
      if(type === 'image') return <ImageIcon size={24} />;
      if(type === 'pdf') return <FileCheck size={24} />;
      return <FileBox size={24} />;
  };

  const filteredFiles = files.filter(f => f.category === activeTab);

  const tabs = [
    { id: 'invoice', label: 'Invoices & Billing', icon: <FileText size={18} />, color: 'emerald' },
    { id: 'technical', label: 'Technical Architecture', icon: <Database size={18} />, color: 'zinc' },
    { id: 'asset', label: 'Client Assets & Media', icon: <Layers size={18} />, color: 'blue' }
  ] as const;

  if (loading) return <div className="h-[80vh] flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.5em] text-zinc-400">Decrypting Vault...</div>;

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-700 relative">
      
      <header className="mb-10 lg:mb-16">
        <div className="flex items-center justify-between mb-4">
            <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'} flex items-center gap-2`}>
                <HardDrive size={12} /> Secure Storage Node
            </p>
            
            {/* LIVE SYNC INDICATOR */}
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                {isSyncing ? <RefreshCw size={10} className="animate-spin" /> : <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                <span>Live Sync</span>
            </div>
        </div>

        <h1 className={`text-4xl lg:text-6xl font-light tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-black'}`}>
            Entity Vault.
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative items-start">
        
        {/* SOL MENÜ (SEKMELER) */}
        <div className={`w-full lg:w-1/4 shrink-0 flex flex-col gap-3 sticky top-28`}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setSelectedFile(null); }}
                    className={`flex items-center gap-4 p-5 rounded-[24px] transition-all duration-300 text-left border ${
                        activeTab === tab.id 
                            ? (isDark ? 'bg-zinc-800 border-zinc-700 text-white shadow-xl scale-[1.02]' : 'bg-black border-black text-white shadow-xl scale-[1.02]')
                            : (isDark ? 'bg-zinc-900/40 border-white/5 text-zinc-400 hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:shadow-sm')
                    }`}
                >
                    <div className={`p-3 rounded-xl ${activeTab === tab.id ? 'bg-white/20' : (isDark ? 'bg-white/5' : 'bg-zinc-100')}`}>
                        {tab.icon}
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest">{tab.label}</h3>
                        <p className={`text-[10px] mt-1 transition-all ${activeTab === tab.id ? 'opacity-70' : 'text-emerald-500 font-bold'}`}>
                            {files.filter(f => f.category === tab.id).length} Documents
                        </p>
                    </div>
                </button>
            ))}
        </div>

        {/* ORTA BÖLÜM (DOSYA LİSTESİ) */}
        <div className="w-full lg:flex-1 min-h-[500px]">
            {filteredFiles.length === 0 ? (
                <div className={`w-full p-20 rounded-[40px] border border-dashed flex flex-col items-center justify-center text-center ${isDark ? 'bg-zinc-900/20 border-white/10' : 'bg-zinc-50/50 border-zinc-200'}`}>
                    <HardDrive size={32} className={`mb-4 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
                    <p className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>This vault sector is currently empty.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredFiles.map((file, idx) => (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                            key={file.id}
                            onClick={() => setSelectedFile(file)}
                            className={`group flex flex-col text-left p-6 rounded-[28px] border transition-all duration-300 ${
                                selectedFile?.id === file.id
                                    ? (isDark ? 'bg-zinc-800 border-zinc-600 ring-1 ring-zinc-500' : 'bg-zinc-50 border-black ring-1 ring-black')
                                    : (isDark ? 'bg-zinc-900/40 border-white/5 hover:border-zinc-600' : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-md')
                            }`}
                        >
                            <div className={`p-4 rounded-[18px] mb-6 inline-flex ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                                {getFileIcon(file.file_name)}
                            </div>
                            <h4 className={`text-sm font-bold truncate w-full mb-3 ${isDark ? 'text-white' : 'text-black'}`} title={file.file_name}>
                                {file.file_name}
                            </h4>
                            <div className="mt-auto flex items-center justify-between w-full pt-4 border-t border-zinc-200/50 dark:border-white/5">
                                <span className={`text-[9px] font-bold font-mono px-2 py-1 rounded bg-zinc-500/10 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    {file.file_size}
                                </span>
                                <span className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                   <Calendar size={12}/> {new Date(file.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* SAĞ PANEL: SLIDE-OVER PREVIEW */}
      <AnimatePresence>
        {selectedFile && (
            <>
                {/* Arka Plan Karartma (Mobil İçin Faydalı) */}
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setSelectedFile(null)}
                    className="fixed inset-0 z-[80] bg-black/20 backdrop-blur-sm lg:hidden"
                />

                {/* Kayarak Açılan Panel */}
                <motion.div
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className={`fixed top-0 right-0 w-full md:w-[600px] h-full z-[90] shadow-2xl flex flex-col border-l ${isDark ? 'bg-[#0f0f0f] border-zinc-800' : 'bg-white border-zinc-200'}`}
                >
                    {/* Panel Header */}
                    <div className={`p-6 flex items-center justify-between border-b ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                        <div className="flex items-center gap-4 overflow-hidden pr-4">
                            <div className={`p-3 rounded-xl shrink-0 ${isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`}>
                                {getFileIcon(selectedFile.file_name)}
                            </div>
                            <div className="truncate">
                                <h3 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-black'}`}>{selectedFile.file_name}</h3>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{selectedFile.file_size} • Vault Node</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className={`p-3 rounded-full shrink-0 transition-colors ${isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-400 hover:text-black'}`}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Panel Content (PREVIEW) */}
                    <div className="flex-1 w-full h-full overflow-hidden bg-zinc-900 flex items-center justify-center relative p-6">
                        {getFilePreviewType(selectedFile.file_name) === 'image' ? (
                            <img src={selectedFile.file_url} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                        ) : getFilePreviewType(selectedFile.file_name) === 'pdf' ? (
                            <iframe src={`${selectedFile.file_url}#toolbar=0`} className="w-full h-full rounded-xl bg-white" />
                        ) : getFilePreviewType(selectedFile.file_name) === 'text' ? (
                            <iframe src={selectedFile.file_url} className="w-full h-full rounded-xl bg-white p-4" />
                        ) : (
                            // DESTEKLENMEYEN DOSYA (BROKEN HEART)
                            <div className="flex flex-col items-center justify-center text-center max-w-sm">
                                <div className="p-6 bg-red-500/10 rounded-full mb-6">
                                    <HeartCrack size={48} className="text-red-500" strokeWidth={1.5} />
                                </div>
                                <h4 className="text-white text-lg font-bold mb-2">Unable to Preview</h4>
                                <p className="text-zinc-400 text-xs leading-relaxed">
                                    Sorry, we cannot display a direct preview for this file type inside the browser. Please download it to view the contents.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Panel Footer (ACTIONS) */}
                    <div className={`p-6 flex items-center gap-4 border-t ${isDark ? 'bg-[#0f0f0f] border-zinc-800' : 'bg-white border-zinc-100'}`}>
                        <a 
                            href={selectedFile.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`flex-1 py-4 rounded-xl flex justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${isDark ? 'bg-transparent border-zinc-700 text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}
                        >
                            Open External <ExternalLink size={14}/>
                        </a>
                        <a 
                            href={selectedFile.file_url} 
                            download 
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-[2] py-4 rounded-xl flex justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
                        >
                            Download Asset <Download size={14}/>
                        </a>
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

    </div>
  );
}