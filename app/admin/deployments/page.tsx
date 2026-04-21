"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Play, Archive, Trash2, ChevronRight, Search, Plus, Database, Ban, RotateCcw, X, AlertTriangle } from 'lucide-react';

export default function AdminDeploymentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'waiting' | 'active' | 'archived' | 'terminated'>('active');
  const [subTab, setSubTab] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Tüm tablolar için ayrı state'ler
  const [activeList, setActiveList] = useState<any[]>([]);
  const [waitingList, setWaitingList] = useState<any[]>([]);
  const [archivedList, setArchivedList] = useState<any[]>([]);
  const [terminatedList, setTerminatedList] = useState<any[]>([]);

  // Custom Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'archive' | 'terminate' | 'delete' | 'restore' | 'activate' | null;
    payload: any;
  }>({ isOpen: false, type: null, payload: null });

  useEffect(() => { fetchAllDeployments(); }, []);

  const fetchAllDeployments = async () => {
    setLoading(true);
    // Entity email bilgisini de çekiyoruz ki Discovery cascade yapabilelim
    const queryStr = '*, clients(company_name, full_name, email)';
    
    try {
      const [activeRes, waitingRes, archivedRes, terminatedRes] = await Promise.all([
        supabase.from('deployments').select(queryStr).order('created_at', { ascending: false }),
        supabase.from('deployments_waiting').select(queryStr).order('created_at', { ascending: false }),
        supabase.from('deployments_archived').select(queryStr).order('created_at', { ascending: false }),
        supabase.from('deployments_terminated').select(queryStr).order('created_at', { ascending: false })
      ]);

      // Hangi tablodan geldiklerini ekliyoruz (_sourceTable)
      if (activeRes.data) setActiveList(activeRes.data.map(d => ({ ...d, _sourceTable: 'deployments' })));
      if (waitingRes.data) setWaitingList(waitingRes.data.map(d => ({ ...d, _sourceTable: 'deployments_waiting' })));
      if (archivedRes.data) setArchivedList(archivedRes.data.map(d => ({ ...d, _sourceTable: 'deployments_archived' })));
      if (terminatedRes.data) setTerminatedList(terminatedRes.data.map(d => ({ ...d, _sourceTable: 'deployments_terminated' })));
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Veritabanı uyumsuzluklarını önleyen Payload temizleyici
  const getCleanPayload = (obj: any) => {
    const { clients, cliets, _sourceTable, archived_at, deleted_at, ...cleanObj } = obj;
    return cleanObj;
  };

  // MODAL ONAY İŞLEMİ (Cascade & Move & Purge Logic)
  const executeModalAction = async () => {
    if (!modal.payload || !modal.type) return;
    const { type, payload } = modal;
    const cleanData = getCleanPayload(payload);
    
    setLoading(true);
    try {
      if (type === 'activate') {
        await supabase.from('deployments').insert([{ ...cleanData, status: 'planning' }]);
        await supabase.from(payload._sourceTable).delete().eq('id', payload.id);
        
        // Smart Cascade: Proje aktifleşince discovery blueprint'i de 'converted' yap
        if (payload.clients?.email) {
            await supabase.from('project_discovery').update({ status: 'converted' }).eq('client_email', payload.clients.email);
        }
      } 
      else if (type === 'archive') {
        await supabase.from('deployments_archived').insert([{ ...cleanData, status: 'archived', completed_at: new Date().toISOString() }]);
        await supabase.from(payload._sourceTable).delete().eq('id', payload.id);
      } 
      else if (type === 'terminate') {
        await supabase.from('deployments_terminated').insert([{ ...cleanData, status: 'terminated' }]);
        await supabase.from(payload._sourceTable).delete().eq('id', payload.id);
      } 
      else if (type === 'restore') {
        await supabase.from('deployments').insert([{ ...cleanData, status: 'development' }]);
        await supabase.from(payload._sourceTable).delete().eq('id', payload.id);
      } 
      else if (type === 'delete') {
        // Hard Delete: Tüm olası tablolardan kalıcı olarak sil
        const tables = ['deployments', 'deployments_waiting', 'deployments_archived', 'deployments_terminated'];
        for (const t of tables) {
            await supabase.from(t).delete().eq('id', payload.id);
        }
      }

      setModal({ isOpen: false, type: null, payload: null });
      fetchAllDeployments();
    } catch (error: any) {
      console.error("Action failed:", error);
      alert("Error processing action: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'active', label: 'Active Pipeline', icon: <Play size={12}/>, count: activeList.length },
    { key: 'waiting', label: 'Waiting', icon: <Clock size={12}/>, count: waitingList.length },
    { key: 'archived', label: 'Archived', icon: <Archive size={12}/>, count: archivedList.length },
    { key: 'terminated', label: 'Terminated', icon: <Trash2 size={12}/>, count: terminatedList.length }
  ];

  const subTabs = activeTab === 'active' ? ['all', 'planning', 'development', 'review', 'live'] : [];

  const getCurrentList = () => {
    let list = [];
    if (activeTab === 'active') list = activeList;
    else if (activeTab === 'waiting') list = waitingList;
    else if (activeTab === 'archived') list = archivedList;
    else if (activeTab === 'terminated') list = terminatedList;

    if (activeTab === 'active' && subTab !== 'all') {
      return list.filter(d => d.status === subTab);
    }
    return list;
  };

  const currentData = getCurrentList();
  const filteredData = currentData.filter(d => 
    d.project_name?.toLowerCase().includes(search.toLowerCase()) || 
    d.clients?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.clients?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans pb-20 relative">
      
      {/* CUSTOM CONFIRMATION MODAL */}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal({ isOpen: false, type: null, payload: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-zinc-100 overflow-hidden">
                
                {modal.type === 'delete' && <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />}
                {modal.type === 'terminate' && <div className="absolute top-0 left-0 w-full h-2 bg-amber-500" />}
                
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl ${modal.type === 'delete' ? 'bg-red-50 text-red-500' : modal.type === 'terminate' ? 'bg-amber-50 text-amber-500' : modal.type === 'activate' || modal.type === 'restore' ? 'bg-emerald-50 text-emerald-500' : 'bg-zinc-100 text-zinc-600'}`}>
                        {modal.type === 'delete' ? <Trash2 size={24} /> : modal.type === 'terminate' ? <Ban size={24} /> : modal.type === 'activate' ? <Play size={24}/> : modal.type === 'restore' ? <RotateCcw size={24}/> : <Archive size={24} />}
                    </div>
                    <button onClick={() => setModal({ isOpen: false, type: null, payload: null })} className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-50"><X size={18}/></button>
                </div>

                <h3 className="text-2xl font-light tracking-tight mb-2">
                    {modal.type === 'delete' ? 'Permanent Wipe' : modal.type === 'terminate' ? 'Terminate Project' : modal.type === 'archive' ? 'Archive Project' : modal.type === 'restore' ? 'Restore Project' : 'Activate Pipeline'}
                </h3>
                
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                    {modal.type === 'delete' ? ( <span className="text-red-500 font-medium flex items-center gap-1"><AlertTriangle size={14}/> This will permanently erase the deployment and all its logs. This action cannot be undone.</span> ) : 
                     modal.type === 'terminate' ? 'Are you sure you want to terminate this project? It will be moved to the terminated records.' :
                     modal.type === 'archive' ? 'Move this project to the archive? It will be removed from the active pipeline.' :
                     modal.type === 'restore' ? 'Restore this project back to the active development pipeline?' :
                     'Initialize this project and move it from the waiting list to active development?'}
                </p>

                <div className="flex gap-3">
                    <button onClick={() => setModal({ isOpen: false, type: null, payload: null })} className="flex-1 py-4 px-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-colors">Cancel</button>
                    <button onClick={executeModalAction} className={`flex-1 py-4 px-4 text-white rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-colors shadow-lg ${modal.type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : modal.type === 'terminate' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : modal.type === 'activate' || modal.type === 'restore' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-black hover:bg-zinc-800'}`}>
                        Confirm Action
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 lg:px-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900">Deployment Pipeline</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Engineering & Delivery Nodes</p>
        </div>
        <button onClick={() => router.push('/admin/deployments/new')} className="bg-black text-white px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 w-fit shadow-xl">
          <Plus size={16} /> Launch Deployment
        </button>
      </div>

      {/* MAIN TABS & SEARCH */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-zinc-200 pb-4 px-2 lg:px-0">
        <div className="flex bg-zinc-100 p-1 rounded-xl w-fit overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key as any); setSubTab('all'); }} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === t.key ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
              {t.icon} {t.label} ({t.count})
            </button>
          ))}
        </div>
        <div className="relative w-full xl:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white border border-zinc-200 pl-10 pr-4 py-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-black transition-all text-zinc-900 shadow-sm" />
        </div>
      </div>

      {/* SUB TABS (Active Only) */}
      {activeTab === 'active' && (
        <div className="flex gap-2 overflow-x-auto px-2 lg:px-0">
          {subTabs.map(st => {
            const subCount = st === 'all' ? activeList.length : activeList.filter(d => d.status === st).length;
            return (
              <button key={st} onClick={() => setSubTab(st)} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all ${subTab === st ? 'border-black text-black bg-white' : 'border-zinc-200 text-zinc-400 hover:border-zinc-400 bg-zinc-50'}`}>
                {st} ({subCount})
              </button>
            );
          })}
        </div>
      )}

      {/* PROJECT LIST */}
      <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden p-2">
         {loading ? (
            <div className="py-20 text-center text-[10px] uppercase font-bold text-zinc-400 animate-pulse">Syncing Database Nodes...</div>
         ) : filteredData.length === 0 ? (
            <p className="text-center text-[10px] uppercase font-bold text-zinc-400 py-20">No engineering records found.</p>
         ) : (
            <div className="space-y-2">
              {filteredData.map(dep => (
                <motion.div layout key={dep.id} onClick={() => router.push(`/admin/deployments/${dep.id}?type=${activeTab}`)} className="group bg-zinc-50 p-5 rounded-3xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium tracking-tight text-zinc-900">{dep.project_name}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <Database size={10} className="text-zinc-400" />
                      <span className="text-[9px] font-bold uppercase text-zinc-500">{dep.clients?.company_name || dep.clients?.full_name || 'Individual Entity'}</span>
                      <span className="text-[9px] font-mono text-zinc-400 bg-zinc-200/50 px-2 py-0.5 rounded">NODE: {dep.id.slice(0,8)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Progress Bar & Status (Hidden on very small screens) */}
                    <div className="hidden md:flex items-center gap-4 mr-2">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-bold uppercase text-zinc-400 mb-1">Status</span>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${dep.status === 'live' ? 'text-emerald-500' : 'text-black'}`}>{dep.status || 'Waiting'}</span>
                        </div>
                        <div className="w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                            <div className="h-full bg-black transition-all duration-500" style={{ width: `${dep.progress || 0}%` }}/>
                        </div>
                        <span className="text-xs font-bold font-mono text-zinc-500 w-8">{dep.progress || 0}%</span>
                    </div>

                    {/* QUICK ACTIONS (Hover Reveal) */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeTab === 'waiting' && (
                           <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'activate', payload: dep }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm" title="Activate"><Play size={14} className="fill-current"/></button>
                        )}
                        {(activeTab === 'active' || activeTab === 'waiting') && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'archive', payload: dep }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-black hover:border-black transition-all shadow-sm" title="Archive"><Archive size={14}/></button>
                              <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'terminate', payload: dep }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-amber-500 hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm" title="Terminate"><Ban size={14}/></button>
                            </>
                        )}
                        {(activeTab === 'archived' || activeTab === 'terminated') && (
                            <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'restore', payload: dep }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm" title="Restore"><RotateCcw size={14}/></button>
                        )}
                        
                        <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'delete', payload: dep }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm" title="Hard Delete"><Trash2 size={14}/></button>
                    </div>

                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-black transition-colors"/>
                  </div>
                </motion.div>
              ))}
            </div>
         )}
      </div>
    </div>
  );
}