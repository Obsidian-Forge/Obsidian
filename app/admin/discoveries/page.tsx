"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Mail, ChevronRight, Archive, Trash2, CheckCircle2, LayoutTemplate, Ban, AlertTriangle, X } from 'lucide-react';

type DiscoveryStatus = 'pending' | 'converted' | 'archived' | 'terminated';
type TabType = 'all' | DiscoveryStatus;

export default function DiscoveryIntelligencePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [discoveries, setDiscoveries] = useState<any[]>([]);

  // Modal State for Hard Deletion
  const [modal, setModal] = useState<{ isOpen: boolean; payload: any }>({ isOpen: false, payload: null });

  useEffect(() => { 
    fetchAllDiscoveries(); 

    // Realtime Subscription
    const channel = supabase.channel('discovery-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_discovery' }, () => {
        fetchAllDiscoveries();
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAllDiscoveries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_discovery')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setDiscoveries(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic UI Update
    setDiscoveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    
    try {
      const { error } = await supabase
        .from('project_discovery')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error: any) {
      alert("Failed to update status: " + error.message);
      fetchAllDiscoveries(); // Revert on failure
    }
  };

  const executeHardDelete = async () => {
    if (!modal.payload) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('project_discovery').delete().eq('id', modal.payload.id);
      if (error) throw error;
      setModal({ isOpen: false, payload: null });
      fetchAllDiscoveries();
    } catch (error: any) {
      alert("Error deleting record: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme Mantığı
  const filteredData = discoveries.filter(d => {
    const matchesTab = activeTab === 'all' || d.status === activeTab;
    const matchesSearch = 
      (d.client_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (d.client_email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (d.discovery_number?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'converted': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'archived': return 'bg-zinc-100 text-zinc-600 border-zinc-200';
      case 'terminated': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-zinc-50 text-zinc-500 border-zinc-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans pb-20 relative">
      
      {/* HARD DELETE MODAL */}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal({ isOpen: false, payload: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl border border-zinc-100 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
                <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-red-50 text-red-500"><Trash2 size={24} /></div>
                    <button onClick={() => setModal({ isOpen: false, payload: null })} className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-50"><X size={18}/></button>
                </div>
                <h3 className="text-2xl font-light tracking-tight mb-2">Permanent Wipe</h3>
                <p className="text-sm text-zinc-500 mb-8 leading-relaxed flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5"/> 
                    <span>This will permanently erase the discovery blueprint from the database. This action cannot be undone.</span>
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setModal({ isOpen: false, payload: null })} className="flex-1 py-4 px-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-colors">Cancel</button>
                    <button onClick={executeHardDelete} className="flex-1 py-4 px-4 text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-colors">Confirm Delete</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 lg:px-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900">Intelligence</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Discovery Logs & Quote Estimates</p>
        </div>
        <button onClick={() => router.push('/admin/discoveries/new')} className="bg-black text-white px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 w-fit shadow-xl">
          <Plus size={16} /> New Discovery
        </button>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-zinc-200 pb-4 px-2 lg:px-0">
        <div className="flex bg-zinc-100 p-1 rounded-xl w-fit overflow-x-auto">
          {(['all', 'pending', 'converted', 'archived', 'terminated'] as const).map(tab => {
            const count = tab === 'all' ? discoveries.length : discoveries.filter(d => d.status === tab).length;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                {tab === 'all' && <LayoutTemplate size={12}/>}
                {tab === 'pending' && <Mail size={12}/>}
                {tab === 'converted' && <CheckCircle2 size={12}/>}
                {tab === 'archived' && <Archive size={12}/>}
                {tab === 'terminated' && <Ban size={12}/>}
                {tab} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative w-full xl:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
          <input type="text" placeholder="Search blueprints..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-zinc-200 pl-10 pr-4 py-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-black transition-all text-zinc-900 shadow-sm" />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-white border-b border-zinc-100">
              <tr>
                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Blueprint ID</th>
                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Entity Details</th>
                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Architecture</th>
                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-right">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loading ? (
                 <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold uppercase text-zinc-400 animate-pulse">Syncing nodes...</td></tr>
              ) : filteredData.length === 0 ? (
                 <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold uppercase text-zinc-400">No blueprints found matching criteria.</td></tr>
              ) : (
                filteredData.map(d => (
                  <tr key={d.id} className="group hover:bg-zinc-50 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-md">{d.discovery_number}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-medium text-zinc-900">{d.client_name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">{d.client_email}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-zinc-700">{d.project_type}</p>
                      <p className="text-[10px] font-mono text-emerald-600 mt-0.5">Est: €{d.estimated_price}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        
                        {/* HIZLI STATUS DEĞİŞTİRİCİ (DROPDOWN) */}
                        <select 
                            value={d.status || 'pending'} 
                            onChange={(e) => handleStatusChange(d.id, e.target.value)}
                            className={`text-[9px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg outline-none cursor-pointer border shadow-sm transition-all appearance-none text-center ${getStatusColor(d.status)}`}
                        >
                            <option value="pending">Pending</option>
                            <option value="converted">Converted</option>
                            <option value="archived">Archived</option>
                            <option value="terminated">Terminated</option>
                        </select>

                        {/* MÜŞTERİYE ÇEVİR BUTONU (Sadece Pending olanlar için kısayol) */}
                        {d.status === 'pending' && (
                          <button onClick={() => router.push(`/admin/clients/new?discovery_id=${d.id}`)} className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors shadow-sm">
                              Convert Entity
                          </button>
                        )}

                        {/* HARD DELETE BUTONU */}
                        <button onClick={() => setModal({ isOpen: true, payload: d })} className="p-2 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm opacity-0 group-hover:opacity-100" title="Delete Permanently">
                            <Trash2 size={14}/>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}