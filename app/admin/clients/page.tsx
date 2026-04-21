"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BrainCircuit, HardDrive, LayoutTemplate, Archive, Trash2, User, Ban, RotateCcw, X, AlertTriangle, ChevronRight } from 'lucide-react';

type TabType = 'inbound' | 'active' | 'archived' | 'terminated';

export default function EntityCRMPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('active');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    const [activeClients, setActiveClients] = useState<any[]>([]);
    const [archivedClients, setArchivedClients] = useState<any[]>([]);
    const [terminatedClients, setTerminatedClients] = useState<any[]>([]);

    // Custom Modal State
    const [modal, setModal] = useState<{
      isOpen: boolean;
      type: 'archive' | 'terminate' | 'delete' | 'restore' | null;
      payload: any;
    }>({ isOpen: false, type: null, payload: null });

    useEffect(() => { fetchAllData(); },[]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            // Converted & Pending tabloları silindi, Inbound verisi direkt project_discovery'den çekiliyor.
            const [inboundRes, activeRes, archivedRes, terminatedRes] = await Promise.all([
                supabase.from('project_discovery').select('*').order('created_at', { ascending: false }),
                supabase.from('clients').select('*').order('created_at', { ascending: false }),
                supabase.from('clients_archived').select('*').order('archived_at', { ascending: false }),
                supabase.from('clients_terminated').select('*').order('deleted_at', { ascending: false })
            ]);
            
            // İşlem yapılacak kaynak tabloyu (Source Table) belirlemek için dataya ekliyoruz
            if (inboundRes.data) setDiscoveries(inboundRes.data.map(d => ({ ...d, _sourceTable: 'project_discovery' })));
            if (activeRes.data) setActiveClients(activeRes.data.map(d => ({ ...d, _sourceTable: 'clients' })));
            if (archivedRes.data) setArchivedClients(archivedRes.data.map(d => ({ ...d, _sourceTable: 'clients_archived' })));
            if (terminatedRes.data) setTerminatedClients(terminatedRes.data.map(d => ({ ...d, _sourceTable: 'clients_terminated' })));
        } catch (err) { 
            console.error("Sync failed", err);
        } finally { 
            setLoading(false);
        }
    };

    // Tablolar arası veri taşırken uyumsuz sütunları temizler
    const cleanPayload = (obj: any) => {
        const { _sourceTable, archived_at, deleted_at, ...cleanObj } = obj;
        return cleanObj;
    };

    // MODAL ONAY İŞLEMİ (Cascade: Client -> Deployments & Discoveries)
    const executeModalAction = async () => {
        if (!modal.payload || !modal.type) return;
        const { type, payload } = modal;
        setLoading(true);

        try {
            if (activeTab === 'inbound') {
                // SADECE DISCOVERY İŞLEMİ (Inbound sekmesi)
                const cleanData = cleanPayload(payload);
                if (type === 'delete') {
                    await Promise.all(['project_discovery', 'project_discovery_archived', 'project_discovery_terminated']
                        .map(t => supabase.from(t).delete().eq('id', payload.id)));
                } else if (type === 'archive') {
                    await supabase.from('project_discovery_archived').insert([{ ...cleanData, status: 'archived' }]);
                    await supabase.from(payload._sourceTable).delete().eq('id', payload.id);
                } else if (type === 'terminate') {
                    await supabase.from('project_discovery_terminated').insert([{ ...cleanData, status: 'terminated' }]);
                    await supabase.from(payload._sourceTable).delete().eq('id', payload.id);
                } else if (type === 'restore') {
                    await supabase.from('project_discovery').insert([{ ...cleanData, status: 'pending' }]);
                    await supabase.from(payload._sourceTable).delete().eq('id', payload.id);
                }
            } else {
                // CLIENT İŞLEMİ + CASCADE ZİNCİRLEME (Projeler ve Keşifler Etkilenir)
                const cleanClient = cleanPayload(payload);
                const email = payload.email;
                const clientId = payload.id;

                // Dinamik Zincirleme Taşıma Fonksiyonu
                const cascadeMove = async (sourceTables: string[], destTable: string, matchCol: string, matchVal: string, newStatus: string) => {
                    for (const sTable of sourceTables) {
                        const { data } = await supabase.from(sTable).select('*').eq(matchCol, matchVal);
                        if (data && data.length > 0) {
                            for (const item of data) {
                                await supabase.from(destTable).insert([{ ...cleanPayload(item), status: newStatus }]);
                                await supabase.from(sTable).delete().eq('id', item.id);
                            }
                        }
                    }
                };

                // Dinamik Zincirleme Silme Fonksiyonu
                const hardDeleteCascade = async (tables: string[], matchCol: string, matchVal: string) => {
                    for (const t of tables) { await supabase.from(t).delete().eq(matchCol, matchVal); }
                };

                if (type === 'delete') {
                    await hardDeleteCascade(['project_discovery', 'project_discovery_archived', 'project_discovery_terminated'], 'client_email', email);
                    await hardDeleteCascade(['deployments', 'deployments_waiting', 'deployments_archived', 'deployments_terminated'], 'client_id', clientId);
                    await hardDeleteCascade(['clients', 'clients_archived', 'clients_terminated'], 'id', clientId);
                } 
                else if (type === 'archive') {
                    const archivedData = { 
                        ...cleanClient, 
                        google_drive_link: '#LOCKED_ARCHIVED',
                        internal_notes: `ORIGINAL_DRIVE_LINK: ${cleanClient.google_drive_link} | ` + (cleanClient.internal_notes || ''),
                        archived_at: new Date().toISOString(), subscription_status: 'archived'
                    };
                    await supabase.from('clients_archived').insert([archivedData]);
                    await supabase.from(payload._sourceTable).delete().eq('id', clientId);

                    await cascadeMove(['project_discovery'], 'project_discovery_archived', 'client_email', email, 'archived');
                    await cascadeMove(['deployments', 'deployments_waiting'], 'deployments_archived', 'client_id', clientId, 'archived');
                }
                else if (type === 'terminate') {
                    const terminatedData = { ...cleanClient, deleted_at: new Date().toISOString(), subscription_status: 'terminated' };
                    await supabase.from('clients_terminated').insert([terminatedData]);
                    await supabase.from(payload._sourceTable).delete().eq('id', clientId);

                    await cascadeMove(['project_discovery'], 'project_discovery_terminated', 'client_email', email, 'terminated');
                    await cascadeMove(['deployments', 'deployments_waiting'], 'deployments_terminated', 'client_id', clientId, 'terminated');
                }
                else if (type === 'restore') {
                    let restoredDriveLink = cleanClient.google_drive_link;
                    if (restoredDriveLink?.includes('#LOCKED')) {
                        const match = cleanClient.internal_notes?.match(/ORIGINAL_DRIVE_LINK: (https:\/\/[^\s|]+)/);
                        restoredDriveLink = match ? match[1] : cleanClient.google_drive_link;
                    }
                    const restoreData = { ...cleanClient, google_drive_link: restoredDriveLink, archived_at: null, deleted_at: null, subscription_status: 'active' };
                    await supabase.from('clients').insert([restoreData]);
                    await supabase.from(payload._sourceTable).delete().eq('id', clientId);

                    await cascadeMove(['project_discovery_archived', 'project_discovery_terminated'], 'project_discovery', 'client_email', email, 'pending');
                    await cascadeMove(['deployments_archived', 'deployments_terminated'], 'deployments', 'client_id', clientId, 'development');
                }
            }
            
            setModal({ isOpen: false, type: null, payload: null });
            fetchAllData();
        } catch (error: any) {
            console.error("Action failed:", error);
            alert("Error processing action: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const searchLower = searchQuery.toLowerCase();
    
    const getFilteredList = () => {
        if (activeTab === 'inbound') {
            return discoveries.filter(d => (d.client_name?.toLowerCase() || '').includes(searchLower) || (d.client_email?.toLowerCase() || '').includes(searchLower));
        }
        const targetArray = activeTab === 'active' ? activeClients : activeTab === 'archived' ? archivedClients : terminatedClients;
        return targetArray.filter(c => (c.full_name?.toLowerCase() || '').includes(searchLower) || (c.email?.toLowerCase() || '').includes(searchLower) || (c.company_name?.toLowerCase() || '').includes(searchLower));
    };

    const filteredList = getFilteredList();

    const handleRowClick = (item: any) => {
        if (activeTab === 'inbound') router.push(`/admin/clients/new?discovery_id=${item.id}`);
        else router.push(`/admin/clients/${item.id}?type=${activeTab}`);
    };

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
                            <div className={`p-3 rounded-2xl ${modal.type === 'delete' ? 'bg-red-50 text-red-500' : modal.type === 'terminate' ? 'bg-amber-50 text-amber-500' : modal.type === 'restore' ? 'bg-emerald-50 text-emerald-500' : 'bg-zinc-100 text-zinc-600'}`}>
                                {modal.type === 'delete' ? <Trash2 size={24} /> : modal.type === 'terminate' ? <Ban size={24} /> : modal.type === 'restore' ? <RotateCcw size={24}/> : <Archive size={24} />}
                            </div>
                            <button onClick={() => setModal({ isOpen: false, type: null, payload: null })} className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-50"><X size={18}/></button>
                        </div>

                        <h3 className="text-2xl font-light tracking-tight mb-2">
                            {modal.type === 'delete' ? 'Permanent Wipe' : modal.type === 'terminate' ? 'Terminate Entity' : modal.type === 'archive' ? 'Archive Entity' : 'Restore Entity'}
                        </h3>
                        
                        <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                            {modal.type === 'delete' ? ( <span className="text-red-500 font-medium flex items-center gap-1"><AlertTriangle size={14}/> This will permanently erase the entity and ALL related projects and discoveries. This action cannot be undone.</span> ) : 
                            modal.type === 'terminate' ? 'Are you sure you want to terminate this entity? All related projects will be terminated.' :
                            modal.type === 'archive' ? 'Move this entity to the archive? Cloud drive access and related projects will be locked.' :
                            'Restore this entity back to active status? Related projects and discoveries will be reactivated.'}
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setModal({ isOpen: false, type: null, payload: null })} className="flex-1 py-4 px-4 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-colors">Cancel</button>
                            <button onClick={executeModalAction} className={`flex-1 py-4 px-4 text-white rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-colors shadow-lg ${modal.type === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : modal.type === 'terminate' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : modal.type === 'restore' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20' : 'bg-black hover:bg-zinc-800'}`}>
                                Confirm Action
                            </button>
                        </div>
                    </motion.div>
                </div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2 lg:px-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900">Entity Hub</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Unified CRM for Inbound Leads & Active Subscribers</p>
                </div>
                <button onClick={() => router.push('/admin/clients/new')} className="bg-black text-white px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 w-fit shadow-xl">
                    <Plus size={16} /> Register New Entity
                </button>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-zinc-200 pb-4 px-2 lg:px-0">
                <div className="flex bg-zinc-100 p-1 rounded-xl w-fit overflow-x-auto">
                    {(['inbound', 'active', 'archived', 'terminated'] as const).map((tab) => {
                        const count = tab === 'inbound' ? discoveries.length : tab === 'active' ? activeClients.length : tab === 'archived' ? archivedClients.length : terminatedClients.length;
                        return (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                {tab === 'inbound' && <User size={12}/>}
                                {tab === 'active' && <BrainCircuit size={12}/>}
                                {tab === 'archived' && <Archive size={12}/>}
                                {tab === 'terminated' && <Ban size={12}/>}
                                {tab} ({count})
                            </button>
                        );
                    })}
                </div>
                <div className="relative w-full xl:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                    <input type="text" placeholder="Search by name, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-zinc-200 pl-10 pr-4 py-3 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-black transition-all text-zinc-900 shadow-sm" />
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden p-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-white border-b border-zinc-100">
                            <tr>
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Identity Details</th>
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">{activeTab === 'inbound' ? 'Discovery Type' : 'SaaS Plan'}</th>
                                {activeTab !== 'inbound' && <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">Workspace</th>}
                                <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-zinc-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {loading ? (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold uppercase text-zinc-400 animate-pulse">Establishing Node Connection...</td></tr>
                            ) : filteredList.length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-10 text-center text-[10px] font-bold uppercase text-zinc-400">No records found matching your search.</td></tr>
                            ) : (
                                filteredList.map(item => (
                                    <tr key={item.id} onClick={() => handleRowClick(item)} className="group hover:bg-zinc-50 transition-colors cursor-pointer">
                                        <td className="px-8 py-5">
                                            <p className="text-sm font-medium text-zinc-900">{activeTab === 'inbound' ? item.client_name : item.full_name}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase mt-0.5">{activeTab === 'inbound' ? item.client_email : item.email}</p>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-2.5 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest border ${activeTab === 'terminated' ? 'border-red-200 text-red-600 bg-red-50' : activeTab === 'archived' ? 'border-amber-200 text-amber-600 bg-amber-50' : 'border-zinc-200 text-zinc-600 bg-zinc-50'}`}>
                                                {activeTab === 'inbound' ? (item.project_type || 'Blueprint') : (item.subscription_plan || 'Standard')}
                                            </span>
                                        </td>
                                        {activeTab !== 'inbound' && (
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2">
                                                    {item.google_drive_link && item.google_drive_link !== '#' ? (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md text-[8px] font-bold uppercase tracking-widest"><HardDrive size={10} /> Drive Synced</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-md text-[8px] font-bold uppercase tracking-widest"><LayoutTemplate size={10} /> Local Node</span>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-8 py-5 text-right">
                                            
                                            {/* QUICK ACTIONS (Hover Reveal) */}
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                
                                                {activeTab === 'inbound' && (
                                                    <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/clients/new?discovery_id=${item.id}`); }} className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-3 py-1.5 rounded-xl hover:scale-105 transition-transform mr-2">Convert</button>
                                                )}
                                                
                                                {activeTab !== 'inbound' && (
                                                    <button onClick={(e) => { e.stopPropagation(); router.push(`/admin/clients/${item.id}?type=${activeTab}`); }} className="text-[9px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-xl hover:bg-zinc-200 transition-transform mr-2 border border-zinc-200 shadow-sm">Open Dossier</button>
                                                )}

                                                {(activeTab === 'active' || activeTab === 'inbound') && (
                                                    <>
                                                    <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'archive', payload: item }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-black hover:border-black transition-all shadow-sm" title="Archive"><Archive size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'terminate', payload: item }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-amber-500 hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm" title="Terminate"><Ban size={14}/></button>
                                                    </>
                                                )}

                                                {(activeTab === 'archived' || activeTab === 'terminated') && (
                                                    <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'restore', payload: item }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all shadow-sm" title="Restore"><RotateCcw size={14}/></button>
                                                )}

                                                <button onClick={(e) => { e.stopPropagation(); setModal({ isOpen: true, type: 'delete', payload: item }); }} className="p-2 bg-white border border-zinc-200 rounded-xl text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm" title="Hard Delete"><Trash2 size={14}/></button>
                                                
                                                <button className="p-2 text-zinc-400 hover:text-black ml-1"><ChevronRight size={16}/></button>
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