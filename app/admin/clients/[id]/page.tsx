"use client";
import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Wallet, BrainCircuit, ShieldAlert, Database, FileText, 
  Layers, CheckCircle2, Trash2, Archive, Rocket, RotateCcw, Ban, 
  HardDrive, Plus, Download, Loader2, Eye, Send, Calendar, AlertTriangle, Sparkles
} from 'lucide-react';

export default function EntityDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const clientType = searchParams.get('type') || 'active';

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  const [modal, setModal] = useState<{
    isOpen: boolean; title: string; message: string; type: 'confirm' | 'prompt'; confirmText: string; promptWord?: string; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', type: 'confirm', confirmText: 'Confirm', onConfirm: () => {} });

  const [promptInput, setPromptInput] = useState('');
  const [client, setClient] = useState<any>(null);
  const [currentTable, setCurrentTable] = useState('clients');
  const [linkedDiscovery, setLinkedDiscovery] = useState<any>(null);
  const [linkedProject, setLinkedProject] = useState<any>(null);
  const [vaultFiles, setVaultFiles] = useState<any[]>([]);
  const [invoiceFiles, setInvoiceFiles] = useState<any[]>([]);

  const [form, setForm] = useState({
    full_name: '', email: '', company_name: '', phone: '', address: '', vat_number: '',
    subscription_plan: 'none', monthly_limit: 0, monthly_price: 0,
    maintenance_fee: 0, project_total: 0,
    active_products: [] as string[], internal_notes: ''
  });

  const PLAN_METRICS: Record<string, { price: number, limit: number }> = {
    none: { price: 0, limit: 0 }, 
    node: { price: 39, limit: 50000 },       // 5k -> 50k
    core: { price: 129, limit: 250000 },     // 25k -> 250k
    nexus: { price: 399, limit: 1000000 }    // 100k -> 1 Milyon
  };

  const availableModules = [
    { id: 'nexus_cx', name: 'Nexus CX', price: 49 },
    { id: 'sentinel', name: 'Sentinel Core', price: 99 },
    { id: 'architect', name: 'Architect AI', price: 79 }
  ];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => { 
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); 
  };

  const fetchDossierData = async () => {
    try {
      let table = 'clients';
      if (clientType === 'archived') table = 'clients_archived';
      if (clientType === 'terminated') table = 'clients_terminated';
      setCurrentTable(table);

      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) throw error;
      
      setClient(data);
      
      // OTOMATİK ÇEKME (SMART SYNC) MANTIĞI
      let autoProjectTotal = data.project_total || 0;
      let autoMaintenanceFee = data.maintenance_fee || 0;
      let discData = null;

      if (data.email) {
          const { data: disc } = await supabase.from('project_discovery').select('*').eq('client_email', data.email).maybeSingle();
          if (disc) {
              discData = { ...disc, _sourceTable: 'project_discovery' };
              setLinkedDiscovery(discData);
              
              if (autoProjectTotal === 0 && disc.estimated_price) {
                  autoProjectTotal = Number(disc.estimated_price);
              }

              // DÜZELTME: Fatura Oluşturucudaki Akıllı Rakam Avcısı Birebir Eklendi
              if (autoMaintenanceFee === 0) {
                  const details = disc.details || {};
                  const maintKey = Object.keys(details).find(k => k.toLowerCase().includes('maintenance') || k.toLowerCase().includes('support'));
                  
                  if (maintKey && details[maintKey]) {
                      const rawVal = String(details[maintKey]);
                      const match = rawVal.match(/€\s*(\d+)/) || rawVal.match(/(\d+)/); 
                      if (match) {
                          autoMaintenanceFee = parseInt(match[1], 10);
                      } else if (rawVal.toLowerCase() === 'yes') {
                          autoMaintenanceFee = 99; // Fallback
                      }
                  }
              }
          }
      }

      const { data: proj } = await supabase.from('deployments').select('*').eq('client_id', data.id).maybeSingle();
      if (proj) setLinkedProject({ ...proj, _sourceTable: 'deployments' });

      setForm({
        full_name: data.full_name || '', email: data.email || '', company_name: data.company_name || '',
        phone: data.phone || '', address: data.address || '', vat_number: data.vat_number || '',
        subscription_plan: data.subscription_plan || 'none', monthly_limit: data.monthly_limit || 0,
        monthly_price: data.monthly_price || 0, 
        maintenance_fee: autoMaintenanceFee, 
        project_total: autoProjectTotal,     
        active_products: data.active_products || [],
        internal_notes: data.internal_notes || ''
      });

      const [filesRes, invoicesRes] = await Promise.all([
        supabase.from('client_files').select('*').eq('client_id', id).order('created_at', { ascending: false }),
        supabase.from('client_invoices').select('*').eq('client_id', id).order('created_at', { ascending: false })
      ]);

      if (filesRes.data) setVaultFiles(filesRes.data);
      if (invoicesRes.data) setInvoiceFiles(invoicesRes.data);

    } catch (err) {
      showToast("Node retrieval failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDossierData(); }, [id, clientType]);

  useEffect(() => {
    if (!id || currentTable !== 'clients') return;
    
    const fetchTokenStatus = async () => {
        try {
            const { data } = await supabase.from('clients').select('tokens_used').eq('id', id).single();
            if (data) {
                setClient((prev: any) => prev ? { ...prev, tokens_used: data.tokens_used } : null);
            }
        } catch (e) {}
    };

    const interval = setInterval(fetchTokenStatus, 5000);
    return () => clearInterval(interval);
  }, [id, currentTable]);

  const recalculateSaaS = (plan: string, products: string[]) => {
    let total = PLAN_METRICS[plan].price;
    products.forEach(pid => { const mod = availableModules.find(m => m.id === pid); if (mod) total += mod.price; });
    setForm(prev => ({ ...prev, subscription_plan: plan, active_products: products, monthly_price: total, monthly_limit: PLAN_METRICS[plan].limit }));
  };

  const handlePlanSelect = (plan: string) => recalculateSaaS(plan, form.active_products);
  
  const toggleProduct = (pid: string) => {
    const newProducts = form.active_products.includes(pid) ? form.active_products.filter(x => x !== pid) : [...form.active_products, pid];
    recalculateSaaS(form.subscription_plan, newProducts);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    const { error } = await supabase.from(currentTable).update(form).eq('id', id);
    if (!error) showToast("Architecture Synced"); else showToast("Sync failed.", "error");
    setIsSaving(false);
  };

  const handleResetTokens = async () => {
      setModal({
          isOpen: true, title: "Reset Neural Tokens", message: "Are you sure you want to reset this entity's consumed tokens back to zero?", type: 'confirm', confirmText: "Reset Tokens",
          onConfirm: async () => {
              setIsSaving(true);
              const { error } = await supabase.from(currentTable).update({ tokens_used: 0 }).eq('id', id);
              if (!error) {
                  setClient((prev: any) => ({ ...prev, tokens_used: 0 }));
                  showToast("Tokens reset successfully.");
              } else {
                  showToast("Token reset failed.", "error");
              }
              setIsSaving(false);
          }
      });
  };

  const cleanPayload = (obj: any) => { const { _sourceTable, archived_at, deleted_at, ...cleanObj } = obj; return cleanObj; };

  const executeArchive = async () => { 
      setIsSaving(true);
      try { 
          const archivedData = { ...client, ...form, archived_at: new Date().toISOString(), subscription_status: 'archived' };
          await supabase.from('clients_archived').insert([cleanPayload(archivedData)]); 
          await supabase.from(currentTable).delete().eq('id', id); 
          showToast("Entity Nodes Archived"); 
          setTimeout(() => router.push('/admin/clients?type=archived'), 1500);
      } catch (err: any) { showToast(err.message, "error"); } finally { setIsSaving(false); }
  };

  const executeTerminate = async () => { 
      setIsSaving(true);
      try { 
          const terminatedData = { ...client, ...form, deleted_at: new Date().toISOString(), subscription_status: 'terminated' };
          await supabase.from('clients_terminated').insert([cleanPayload(terminatedData)]); 
          await supabase.from(currentTable).delete().eq('id', id); 
          showToast("Entity Nodes Terminated"); 
          setTimeout(() => router.push('/admin/clients?type=terminated'), 1500);
      } catch (err: any) { showToast(err.message, "error"); } finally { setIsSaving(false); }
  };

  const executeHardDelete = async () => { 
      setIsSaving(true);
      try { 
          if (linkedDiscovery) await supabase.from(linkedDiscovery._sourceTable).delete().eq('id', linkedDiscovery.id);
          if (linkedProject) await supabase.from(linkedProject._sourceTable).delete().eq('id', linkedProject.id); 
          await supabase.from(currentTable).delete().eq('id', id); 
          showToast("Entity & Infrastructure Permanently Wiped!"); 
          setTimeout(() => router.push('/admin/clients'), 1500);
      } catch (err: any) { showToast(err.message, "error"); } finally { setIsSaving(false); }
  };

  const executeRestore = async () => { 
      setIsSaving(true);
      try { 
          const restoreData = { ...client, ...form, archived_at: null, deleted_at: null, subscription_status: 'active' };
          await supabase.from('clients').insert([cleanPayload(restoreData)]); 
          await supabase.from(currentTable).delete().eq('id', id); 
          showToast("Entity & Infrastructure Restored"); 
          setTimeout(() => router.push('/admin/clients'), 1500);
      } catch (err: any) { showToast(err.message, "error"); } finally { setIsSaving(false); }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, section: 'asset' | 'technical' | 'invoice') => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${id}/${section}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('vault').upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('vault').getPublicUrl(filePath);
        const fileUrl = publicUrlData.publicUrl;
        const fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';

        if (section === 'invoice') {
            await supabase.from('client_invoices').insert([{ client_id: id, file_name: file.name, file_url: fileUrl, file_size: fileSize, invoice_type: 'manual' }]);
        } else {
            await supabase.from('client_files').insert([{ client_id: id, file_name: file.name, file_url: fileUrl, file_type: section, file_size: fileSize, file_category: 'vault' }]);
        }

        showToast("File secured in Vault!", "success");
        fetchDossierData();
    } catch (error: any) { showToast(error.message, "error"); } finally { setIsUploading(false); }
  };

  const confirmDeleteFile = (fileId: string, table: 'client_files' | 'client_invoices', fileUrl: string) => {
      setModal({
          isOpen: true, title: "Delete File", message: "Permanently delete this file from the vault?", type: 'confirm', confirmText: "Delete",
          onConfirm: async () => {
              setIsUploading(true);
              try {
                  await supabase.from(table).delete().eq('id', fileId);
                  const pathPart = fileUrl.split('/vault/')[1];
                  if(pathPart) await supabase.storage.from('vault').remove([pathPart]);
                  showToast("File purged from vault.");
                  setSelectedFiles(prev => prev.filter(f => f.id !== fileId)); 
                  fetchDossierData();
              } catch(e: any) { showToast(e.message, "error"); } finally { setIsUploading(false); }
          }
      });
  };

  const toggleFileSelection = (file: any) => {
      setSelectedFiles(prev => {
          const isAlreadySelected = prev.find(f => f.id === file.id);
          if (isAlreadySelected) return prev.filter(f => f.id !== file.id);
          return [...prev, file];
      });
  };

  const handleSendAction = async (file: any) => {
      showToast(`Sending ${file.file_name} to client...`);
      try {
          const response = await fetch('/api/send-invoice', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  clientEmail: client.email, clientName: client.full_name || client.company_name,
                  fileName: file.file_name, fileUrl: file.file_url, isBatch: false
              })
          });
          if (!response.ok) throw new Error("Email delivery failed.");
          showToast(`Document "${file.file_name}" dispatched to client!`, "success");
      } catch (err: any) { showToast(err.message, "error"); }
  };

  const handleBatchSend = async () => {
      if (selectedFiles.length === 0) return;
      setIsSendingEmail(true);
      showToast(`Packaging ${selectedFiles.length} files...`);
      try {
          const response = await fetch('/api/send-invoice', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  clientEmail: client.email, clientName: client.full_name || client.company_name,
                  isBatch: true, attachments: selectedFiles.map(f => ({ fileName: f.file_name, fileUrl: f.file_url }))
              })
          });
          if (!response.ok) throw new Error("Email delivery failed.");
          showToast(`Package of ${selectedFiles.length} files dispatched!`, "success");
          setSelectedFiles([]);
      } catch (err: any) { showToast(err.message, "error"); } finally { setIsSendingEmail(false); }
  };

  const sendKeyByEmailAPI = async () => {
    setIsSendingEmail(true);
    try {
      const response = await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'access_code', email: client.email, clientName: client.full_name, code: client.access_code, loginLink: window.location.origin + '/client/login' }) });
      if (response.ok) showToast("Key dispatched.");
    } catch (err) { showToast("Email fail.", "error"); } finally { setIsSendingEmail(false); }
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400">Decrypting Dossier...</div>;
  const isReadOnly = currentTable !== 'clients';

  const renderFileList = (files: any[], typeMatch: string, table: 'client_files' | 'client_invoices') => {
      const filtered = table === 'client_invoices' ? files : files.filter(f => f.file_type === typeMatch);
      if(filtered.length === 0) return <p className="text-[11px] text-zinc-400 py-6 italic text-center bg-white rounded-2xl border border-dashed border-zinc-200">This vault sector is empty.</p>;
      return (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
            {filtered.map(f => {
                const isSelected = selectedFiles.some(selected => selected.id === f.id);
                return (
                <div key={f.id} className={`group flex flex-col xl:flex-row xl:items-center justify-between p-4 bg-white rounded-[20px] border shadow-sm transition-all gap-4 relative ${isSelected ? 'border-zinc-800 ring-1 ring-zinc-800 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                    <div className="flex items-center gap-4 overflow-hidden w-full xl:w-auto">
                        <button type="button" onClick={(e) => { e.preventDefault(); toggleFileSelection(f); }} className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-black border-black text-white' : 'bg-white border-zinc-300 text-transparent opacity-0 group-hover:opacity-100 hover:border-black'}`}>
                            <CheckCircle2 size={12} strokeWidth={3} />
                        </button>
                        <div className={`p-3.5 rounded-xl shrink-0 ${table === 'client_invoices' ? 'bg-emerald-50 text-emerald-500' : 'bg-zinc-100 text-zinc-500'}`}>
                            <FileText size={20} />
                        </div>
                        <div className="truncate flex flex-col justify-center">
                            <p className="text-sm font-bold text-zinc-800 truncate mb-1" title={f.file_name}>{f.file_name}</p>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[9px] font-mono font-bold text-zinc-500 bg-zinc-200/50 px-2 py-1 rounded-md tracking-wider">{f.file_size || '0.00 MB'}</span>
                                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-widest"><Calendar size={11}/> {new Date(f.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 transition-all w-full xl:w-auto justify-end border-t xl:border-t-0 pt-3 xl:pt-0 border-zinc-100">
                        {table === 'client_invoices' && (
                            <button type="button" onClick={() => handleSendAction(f)} className="flex items-center gap-1.5 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-white bg-black hover:bg-zinc-800 rounded-lg shadow-md transition-all hover:scale-105 active:scale-95"><Send size={12}/> Send</button>
                        )}
                        <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-600 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg shadow-sm transition-all active:scale-95"><Eye size={12}/> View</a>
                        <a href={f.file_url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-zinc-600 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-lg shadow-sm transition-all active:scale-95"><Download size={12}/> Down</a>
                        {!isReadOnly && (
                            <button type="button" onClick={() => confirmDeleteFile(f.id, table, f.file_url)} className="flex items-center gap-1.5 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-red-600 bg-white border border-red-100 hover:bg-red-50 rounded-lg shadow-sm transition-all active:scale-95"><Trash2 size={12}/> Del</button>
                        )}
                    </div>
                </div>
            )})}
        </div>
      );
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto bg-white min-h-screen rounded-[40px] shadow-sm border border-zinc-100 mt-6 overflow-hidden pb-20 font-sans">
      
      <AnimatePresence>
        {selectedFiles.length > 0 && (
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-black text-white px-6 py-4 rounded-[24px] shadow-2xl flex items-center gap-6 border border-zinc-800">
                <div className="flex items-center gap-3">
                    <span className="bg-white/20 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-white/10">{selectedFiles.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">Files Selected</span>
                </div>
                <div className="h-6 w-px bg-white/20"></div>
                <button onClick={handleBatchSend} disabled={isSendingEmail} className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-2 hover:scale-105 active:scale-95">
                    {isSendingEmail ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>}
                    {isSendingEmail ? 'Packaging...' : 'Send as Package'}
                </button>
                <button onClick={() => setSelectedFiles([])} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white" title="Clear Selection"><X size={14}/></button>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal.isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-zinc-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-full"><AlertTriangle size={24} /></div>
                        <h3 className="text-xl font-bold text-zinc-900">{modal.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-500 mb-6 leading-relaxed">{modal.message}</p>
                    {modal.type === 'prompt' && (
                        <input type="text" placeholder={`Type '${modal.promptWord}' to confirm`} value={promptInput} onChange={(e) => setPromptInput(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold outline-none focus:border-red-500 transition-colors mb-2 text-center" />
                    )}
                    <div className="flex gap-3 justify-end mt-8">
                        <button type="button" onClick={() => { setModal({ ...modal, isOpen: false }); setPromptInput(''); }} className="px-6 py-3 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors">Cancel</button>
                        <button type="button" onClick={() => {
                                if (modal.type === 'prompt' && promptInput !== modal.promptWord) { showToast(`Please type '${modal.promptWord}' correctly`, 'error'); return; }
                                modal.onConfirm(); setModal({ ...modal, isOpen: false }); setPromptInput('');
                            }}
                            className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                        >
                            {modal.confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{toast && (<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-black text-white'}`}>{toast.message}</motion.div>)}</AnimatePresence>
      
      <header className="flex justify-between items-center p-8 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-3 bg-zinc-50 rounded-full text-zinc-400 hover:text-black transition-colors"><X size={20} /></button>
          <div>
            <h1 className="text-3xl font-light tracking-tighter">{client?.full_name}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">● {client?.company_name || 'Secure Entity Node'}
              {currentTable === 'clients_archived' && <span className="ml-2 text-amber-500">(Archived)</span>}
              {currentTable === 'clients_terminated' && <span className="ml-2 text-red-500">(Terminated)</span>}
            </p>
          </div>
        </div>
        
        <button onClick={() => router.push(`/admin/neural?entity=${id}`)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm active:scale-95">
            <Sparkles size={14} /> Consult Admin AI
        </button>
      </header>
      
      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedDiscovery && (
              <div className="bg-blue-50 p-4 rounded-[24px] border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><FileText size={14} className="text-blue-600" /><span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">Linked Discovery</span></div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400 bg-white px-2 py-0.5 rounded-full shadow-sm">{linkedDiscovery.status}</span>
                </div>
                <p className="text-xs text-blue-900 mt-2">{linkedDiscovery.project_type} • €{linkedDiscovery.estimated_price}</p>
              </div>
            )}
            {linkedProject && (
              <div className="bg-emerald-50 p-4 rounded-[24px] border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Rocket size={14} className="text-emerald-600" /><span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Active Project</span></div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400 bg-white px-2 py-0.5 rounded-full shadow-sm">{linkedProject.status}</span>
                </div>
                <p className="text-xs text-emerald-900 mt-2 font-bold">{linkedProject.project_name}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><User size={14} /> Identity & Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                 <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Entity / Client Code</label>
                 <input disabled value={client?.id?.split('-')[0].toUpperCase() || '---'} className="w-full bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-mono font-bold text-zinc-500 outline-none cursor-not-allowed tracking-widest" />
              </div>
              <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Full Name</label><input disabled={isReadOnly} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black disabled:opacity-60" /></div>
              <div><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Email Address</label><input disabled={isReadOnly} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black disabled:opacity-60" /></div>
              <div className="md:col-span-2"><label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Physical Address</label><input disabled={isReadOnly} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black disabled:opacity-60" /></div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><Database size={14} /> SaaS Allocation & Neural Compute</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['none', 'node', 'core', 'nexus'].map(p => (<button key={p} type="button" disabled={isReadOnly} onClick={() => handlePlanSelect(p)} className={`py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all disabled:cursor-not-allowed ${form.subscription_plan === p ? 'bg-black text-white border-black shadow-md' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'}`}>{p}</button>))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {availableModules.map(mod => (<div key={mod.id} onClick={() => !isReadOnly && toggleProduct(mod.id)} className={`p-4 rounded-2xl border ${isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} flex justify-between items-center transition-all ${form.active_products.includes(mod.id) ? 'bg-zinc-50 border-black' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}>
                <div className="flex items-center gap-3"><div className={`w-4 h-4 rounded border flex items-center justify-center ${form.active_products.includes(mod.id) ? 'bg-black border-black text-white' : 'border-zinc-300'}`}>{form.active_products.includes(mod.id) && <CheckCircle2 size={10} strokeWidth={3} />}</div><p className={`text-[11px] font-bold ${form.active_products.includes(mod.id) ? 'text-black' : 'text-zinc-600'}`}>{mod.name}</p></div>
                <span className="text-[9px] font-mono font-bold text-zinc-400">+€{mod.price}</span>
              </div>))}
            </div>

            <div className="pt-6 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                  <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-2"><BrainCircuit size={12}/> Monthly Token Limit</label>
                  <p className="text-[10px] text-zinc-400 mb-3 leading-relaxed">Modify the maximum Neural AI computation tokens allowed for this entity.</p>
                  <input
                      type="number"
                      disabled={isReadOnly}
                      value={form.monthly_limit}
                      onChange={e => setForm({ ...form, monthly_limit: Number(e.target.value) })}
                      className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-mono font-bold outline-none focus:border-black transition-colors disabled:opacity-60"
                  />
              </div>
              <div className="bg-zinc-50 p-6 rounded-[20px] border border-zinc-200 flex flex-col justify-center items-center text-center h-full relative group">
                  {!isReadOnly && (
                      <button type="button" onClick={handleResetTokens} disabled={isSaving} className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110" title="Reset Tokens to 0">
                          <RotateCcw size={12} strokeWidth={2.5}/>
                      </button>
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Tokens Consumed</span>
                  <span className={`text-4xl font-light font-mono ${(client?.tokens_used || 0) >= form.monthly_limit ? 'text-red-500' : 'text-emerald-500'}`}>
                      {client?.tokens_used || 0}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-zinc-400 mt-2">/ {form.monthly_limit} Limit</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <HardDrive size={14} /> Entity Vault <span className="bg-zinc-100 px-2 py-0.5 rounded text-[8px] text-zinc-500">DMS</span>
              </h3>
              {isUploading && <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-black animate-pulse"><Loader2 size={12} className="animate-spin"/> Vaulting...</span>}
            </div>
            
            <div className="flex flex-col space-y-8">
                <div className="bg-emerald-50/50 rounded-[28px] p-6 border border-emerald-100">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-2"><FileText size={14}/> Invoices & Billing</h4>
                        {!isReadOnly && (
                            <label className="cursor-pointer text-emerald-600 bg-white border border-emerald-100 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest shadow-sm active:scale-95">
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'invoice')} disabled={isUploading} />
                                <Plus size={12}/> Upload Manually
                            </label>
                        )}
                    </div>
                    {renderFileList(invoiceFiles, 'invoice', 'client_invoices')}
                </div>

                <div className="bg-zinc-50 rounded-[28px] p-6 border border-zinc-200">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 flex items-center gap-2"><Database size={14}/> Technical Architecture Docs</h4>
                        {!isReadOnly && (
                            <label className="cursor-pointer text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest shadow-sm active:scale-95">
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'technical')} disabled={isUploading} />
                                <Plus size={12}/> Upload File
                            </label>
                        )}
                    </div>
                    {renderFileList(vaultFiles, 'technical', 'client_files')}
                </div>

                <div className="bg-zinc-50 rounded-[28px] p-6 border border-zinc-200">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-800 flex items-center gap-2"><Layers size={14}/> Client Assets & Media</h4>
                        {!isReadOnly && (
                            <label className="cursor-pointer text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest shadow-sm active:scale-95">
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'asset')} disabled={isUploading} />
                                <Plus size={12}/> Upload Media
                            </label>
                        )}
                    </div>
                    {renderFileList(vaultFiles, 'asset', 'client_files')}
                </div>
            </div>
          </div>

        </div>
        
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-black p-8 rounded-[32px] text-white shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
                <Wallet size={160} strokeWidth={0.5} />
            </div>
            
            <div className="relative z-10 flex-1">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2"><Wallet size={14} /> Revenue Node</h3>
              
              <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Project Value</span>
                      <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500 font-mono">€</span>
                          <input type="number" disabled={isReadOnly} value={form.project_total} onChange={e => setForm({...form, project_total: Number(e.target.value)})} className="bg-transparent text-white text-right text-sm font-mono font-bold outline-none w-20 placeholder:text-zinc-600 focus:border-b focus:border-zinc-500" placeholder="0" />
                      </div>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">SaaS & Modules</span>
                      <span className="text-sm font-mono font-bold">€{form.monthly_price} <span className="text-[9px] text-zinc-500 font-sans tracking-widest uppercase ml-1">/mo</span></span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Maintenance Fee</span>
                      <div className="flex items-center gap-1">
                          <span className="text-xs text-zinc-500 font-mono">€</span>
                          <input type="number" disabled={isReadOnly} value={form.maintenance_fee} onChange={e => setForm({...form, maintenance_fee: Number(e.target.value)})} className="bg-transparent text-white text-right text-sm font-mono font-bold outline-none w-16 placeholder:text-zinc-600 focus:border-b focus:border-zinc-500" placeholder="0" />
                          <span className="text-[9px] text-zinc-500 font-sans tracking-widest uppercase ml-1">/mo</span>
                      </div>
                  </div>
              </div>

              <div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Total Monthly MRR</span>
                  <div className="text-5xl font-light tracking-tighter text-emerald-400 mt-1">
                      €{(Number(form.monthly_price) + Number(form.maintenance_fee)).toLocaleString()}
                  </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-center mt-8 relative z-10">
              <span className="text-[10px] font-mono text-zinc-400">Tokens: {client?.tokens_used || 0} / {form.monthly_limit}</span>
              <BrainCircuit size={16} className={(client?.tokens_used || 0) >= form.monthly_limit ? 'text-red-500' : 'text-emerald-500'} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-zinc-200 shadow-sm space-y-5">
            <div className="flex justify-between border-b border-zinc-100 pb-3"><h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><ShieldAlert size={14} /> Access Key</h3>{!isReadOnly && <button type="button" onClick={sendKeyByEmailAPI} disabled={isSendingEmail} className="text-[9px] font-bold uppercase text-black hover:opacity-50">Email Key</button>}</div>
            <div className="p-4 rounded-xl border text-center font-mono font-bold bg-zinc-50 tracking-widest text-zinc-800">{client?.access_code}</div>
          </div>

          <div className="bg-zinc-50 p-6 rounded-[28px] border border-zinc-200 space-y-4 shadow-inner">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2"><Layers size={14} /> Internal Notes</h3>
            <textarea disabled={isReadOnly} value={form.internal_notes} onChange={e => setForm({ ...form, internal_notes: e.target.value })} placeholder="Developer or administrative notes..." className="w-full bg-transparent text-xs text-zinc-700 outline-none min-h-[120px] resize-none disabled:opacity-60" />
          </div>

          {!isReadOnly && (<button type="submit" disabled={isSaving} className="w-full bg-black text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">{isSaving ? "Syncing..." : "Sync Architecture"}</button>)}
          
          <div className="bg-red-50 p-6 rounded-[28px] border border-red-100 space-y-4 mt-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-2"><ShieldAlert size={14} /> Danger Zone</h3>
              
              {isReadOnly ? (
                <button type="button" onClick={() => setModal({ isOpen: true, title: "Restore Entity", message: "Reactivate this entity and its related Discovery/Project nodes?", type: 'confirm', confirmText: "Restore", onConfirm: executeRestore })} disabled={isSaving} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mb-3"><RotateCcw size={14} /> Restore Entity</button>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setModal({ isOpen: true, title: "Archive Entity", message: "Move this entity and related nodes to the archive?", type: 'confirm', confirmText: "Archive", onConfirm: executeArchive })} disabled={isSaving} className="flex-1 bg-white text-zinc-600 border border-zinc-200 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"><Archive size={12} /> Archive</button>
                  <button type="button" onClick={() => setModal({ isOpen: true, title: "Terminate Entity", message: "Terminate this entity? All projects will be halted.", type: 'confirm', confirmText: "Terminate", onConfirm: executeTerminate })} disabled={isSaving} className="flex-1 bg-white text-amber-600 border border-amber-200 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-amber-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"><Ban size={12} /> Terminate</button>
                </div>
              )}
              
              <button type="button" onClick={() => setModal({ isOpen: true, title: "Permanent Wipe", message: "This action cannot be undone. It will permanently erase the entity and all related infrastructure nodes.", type: 'prompt', promptWord: 'DELETE', confirmText: "Hard Delete", onConfirm: executeHardDelete })} disabled={isSaving} className="w-full bg-red-600 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2 shadow-sm"><Trash2 size={12} /> Hard Delete</button>
          </div>
        </div>
      </form>
    </div>
  );
}