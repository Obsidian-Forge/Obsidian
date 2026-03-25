"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface DiscoveryLog {
    id: string;
    discovery_number: string;
    client_name: string;
    client_email: string;
    project_type: string;
    details: any;
    estimated_price: number;
    status: string;
    created_at: string;
}

// 1. ADIM: GELİŞMİŞ STATÜ SEÇENEKLERİ
const STATUS_OPTIONS = [
    { id: 'pending', label: 'Pending', badge: 'bg-amber-50 text-amber-600 border-amber-200' },
    { id: 'reviewed', label: 'Reviewed', badge: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'in-progress', label: 'In Progress', badge: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { id: 'accepted', label: 'Accepted (Won)', badge: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { id: 'declined', label: 'Declined (Lost)', badge: 'bg-red-50 text-red-600 border-red-200' }
];

export default function DiscoveryIntelligencePage() {
    const router = useRouter();
    const [discoveries, setDiscoveries] = useState<DiscoveryLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<DiscoveryLog | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // YENİ: Statü Filtresi

    useEffect(() => {
        fetchDiscoveries();

        // Gerçek zamanlı dinleme
        const channel = supabase.channel('discovery-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'project_discovery' }, () => {
                fetchDiscoveries();
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const fetchDiscoveries = async () => {
        const { data, error } = await supabase
            .from('project_discovery')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (data) setDiscoveries(data);
        setLoading(false);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('project_discovery')
                .update({ status: newStatus })
                .eq('id', id);
            
            if (error) throw error;
            
            // Seçili paneli ve genel listeyi anında güncelle
            if (selectedLog && selectedLog.id === id) {
                setSelectedLog({ ...selectedLog, status: newStatus });
            }
            setDiscoveries(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
        } catch (err: any) {
            alert("Failed to update status: " + err.message);
        }
    };

    const deleteLog = async (id: string) => {
        if (!confirm("WARNING: Are you sure you want to permanently delete this discovery log?")) return;
        try {
            await supabase.from('project_discovery').delete().eq('id', id);
            if (selectedLog?.id === id) setSelectedLog(null);
            setDiscoveries(prev => prev.filter(d => d.id !== id));
        } catch (err: any) {
            alert("Failed to delete: " + err.message);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        });
    };

    const renderColors = (colorString: string) => {
        if (!colorString) return null;
        const colors = colorString.split(',').map(c => c.trim());
        
        return (
            <div className="flex gap-4 mt-2">
                {colors.map((c, idx) => {
                    const [label, hex] = c.split(':').map(s => s.trim());
                    if (!hex) return null;
                    return (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                            <div className="w-8 h-8 rounded-full border border-zinc-200 shadow-inner" style={{ backgroundColor: hex }} title={hex} />
                            <span className="text-[8px] font-black uppercase text-zinc-500">{label}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const found = STATUS_OPTIONS.find(s => s.id === status);
        return found ? found.badge : 'bg-zinc-100 text-zinc-600 border-zinc-200';
    };

    // ARAMA VE FİLTRELEME MANTIĞI
    const filteredDiscoveries = discoveries.filter(d => {
        const matchesSearch = d.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              d.discovery_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              d.client_email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // İSTATİSTİKLER
    const pendingCount = discoveries.filter(d => d.status === 'pending').length;
    const wonCount = discoveries.filter(d => d.status === 'accepted').length;
    // Aktif Pipeline: Bekleyen, incelenen veya görüşülen projelerin toplam tahmini değeri
    const activePipelineValue = discoveries
        .filter(d => ['pending', 'reviewed', 'in-progress'].includes(d.status))
        .reduce((sum, d) => sum + (d.estimated_price || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="text-center space-y-4 animate-pulse">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Syncing Intelligence...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 text-black font-sans relative overflow-x-hidden pb-20">

            {/* DETAY PANELİ (SLIDE-OVER) */}
            {selectedLog && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLog(null)} />
                    <aside className="relative w-full max-w-2xl bg-white h-full shadow-2xl p-6 md:p-10 overflow-y-auto border-l border-zinc-200 animate-in slide-in-from-right duration-300">
                        
                        <div className="flex justify-between items-start mb-8 pb-6 border-b border-zinc-100">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-black tracking-tighter uppercase">{selectedLog.discovery_number}</h2>
                                    <span className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${getStatusBadge(selectedLog.status)}`}>
                                        {STATUS_OPTIONS.find(s => s.id === selectedLog.status)?.label || selectedLog.status}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Submitted: {formatDate(selectedLog.created_at)}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
                                <svg className="w-6 h-6 text-zinc-400 hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* YENİ: GELİŞMİŞ STATÜ YÖNETİMİ */}
                            <div className="bg-zinc-950 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Estimated Value</p>
                                    <p className="text-3xl font-black text-emerald-400 font-mono">${selectedLog.estimated_price?.toLocaleString()}</p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-end gap-2 w-full md:w-auto">
                                    {STATUS_OPTIONS.map(status => (
                                        <button 
                                            key={status.id}
                                            onClick={() => updateStatus(selectedLog.id, status.id)}
                                            className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                                selectedLog.status === status.id 
                                                ? `${status.badge} ring-2 ring-white/20 shadow-lg scale-105` 
                                                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'
                                            }`}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* KİMLİK & VİZYON */}
                            <section>
                                <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4 border-b border-zinc-100 pb-2">Client Identity</h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                    <div><p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Name</p><p className="font-black text-sm uppercase mt-1">{selectedLog.client_name}</p></div>
                                    <div><p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Company</p><p className="font-black text-sm uppercase mt-1">{selectedLog.details.Company || 'N/A'}</p></div>
                                    <div className="col-span-2"><p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Email</p><p className="font-bold text-sm text-zinc-600 mt-1">{selectedLog.client_email}</p></div>
                                </div>
                            </section>

                            {/* PROJE VİZYONU */}
                            <section>
                                <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4 border-b border-zinc-100 pb-2">Project Vision</h3>
                                <div className="space-y-4">
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Primary Goals</p>
                                        <p className="text-sm font-bold leading-relaxed text-zinc-800 whitespace-pre-wrap">{selectedLog.details.Goals}</p>
                                    </div>
                                    {selectedLog.details.Competitors && (
                                        <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Competitors / Inspirations</p>
                                            <p className="text-sm font-bold leading-relaxed text-zinc-600 whitespace-pre-wrap">{selectedLog.details.Competitors}</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* MİMARİ VE TASARIM */}
                            <section>
                                <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4 border-b border-zinc-100 pb-2">Architecture & Design</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Core Platform</p>
                                        <p className="font-black text-sm uppercase mt-1">{selectedLog.project_type}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Page Count</p>
                                        <p className="font-black text-sm uppercase mt-1">{selectedLog.details['Page Count']} Pages</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Design Style</p>
                                        <p className="font-black text-sm uppercase mt-1">{selectedLog.details['Design Style']}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Typography</p>
                                        <p className="font-black text-sm uppercase mt-1">{selectedLog.details.Typography}</p>
                                    </div>
                                    <div className="col-span-2 bg-white p-5 rounded-2xl border border-zinc-200">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Brand Colors</p>
                                        {renderColors(selectedLog.details.Colors)}
                                    </div>
                                </div>
                            </section>

                            {/* MÜHENDİSLİK */}
                            <section>
                                <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4 border-b border-zinc-100 pb-2">Engineering & Logistics</h3>
                                <div className="space-y-4">
                                    <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Required Integrations</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedLog.details.Integrations ? selectedLog.details.Integrations.split(',').map((intg: string, i: number) => (
                                                <span key={i} className="bg-black text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{intg.trim()}</span>
                                            )) : <span className="text-xs font-bold text-zinc-400">No integrations requested</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Timeline Profile</p>
                                            <p className={`font-black text-sm uppercase mt-1 ${selectedLog.details.Timeline === 'rush' ? 'text-red-500' : 'text-black'}`}>{selectedLog.details.Timeline}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">SEO Setup</p>
                                            <p className="font-black text-sm uppercase mt-1">{selectedLog.details['SEO Setup']}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* DİĞER */}
                            <section className="pb-10">
                                <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] mb-4 border-b border-zinc-100 pb-2">Additional Context</h3>
                                {selectedLog.details.Assets && selectedLog.details.Assets !== "No files provided yet" && selectedLog.details.Assets !== "" && (
                                    <div className="bg-white p-5 rounded-2xl border border-zinc-200 mb-4">
                                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Client Assets</p>
                                        <div className="flex flex-col gap-2">
                                            {selectedLog.details.Assets.split(' | ').map((url: string, i: number) => (
                                                <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:underline break-all flex items-center gap-2">
                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                    View Asset {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedLog.details.Notes && (
                                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200">
                                        <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mb-2">Final Notes</p>
                                        <p className="text-sm font-bold leading-relaxed text-amber-900 whitespace-pre-wrap">{selectedLog.details.Notes}</p>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-end">
                                    <button onClick={() => deleteLog(selectedLog.id)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white border border-red-200 bg-white hover:bg-red-500 px-6 py-3 rounded-xl transition-all shadow-sm">
                                        Delete Record Permanently
                                    </button>
                                </div>
                            </section>

                        </div>
                    </aside>
                </div>
            )}

            {/* ANA SAYFA İÇERİĞİ */}
            <div className="max-w-7xl mx-auto p-6 md:p-12">
                
                {/* ÜST BAR VE ÖZET */}
                <div className="mb-12">
                    <button onClick={() => router.push('/admin/dashboard')} className="text-[10px] font-black uppercase text-zinc-400 mb-6 block hover:text-black transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Workspace
                    </button>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-900">Discovery <br/> Intelligence</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm max-w-xl">Master log of all client architectural blueprints and definitive quotes.</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-w-[140px]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-500 mb-1">Action Required</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-3xl font-black text-black">{pendingCount}</p>
                                    {pendingCount > 0 && <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm min-w-[140px]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-1">Projects Won</p>
                                <p className="text-3xl font-black text-black">{wonCount}</p>
                            </div>
                            <div className="bg-zinc-950 text-white p-6 rounded-2xl shadow-xl min-w-[200px]">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Active Pipeline Value</p>
                                <p className="text-3xl font-black font-mono text-emerald-400">€{activePipelineValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* YENİ: HIZLI FİLTRELEME SEKMELERİ */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                    <button 
                        onClick={() => setStatusFilter('all')} 
                        className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === 'all' ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'}`}
                    >
                        All Logs
                    </button>
                    {STATUS_OPTIONS.map(status => (
                        <button 
                            key={status.id}
                            onClick={() => setStatusFilter(status.id)} 
                            className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${statusFilter === status.id ? `${status.badge} ring-1 ring-offset-1 ring-zinc-200 shadow-sm` : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'}`}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>

                {/* ARAMA VE LİSTE */}
                <div className="bg-white rounded-[32px] border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-100">
                        <input 
                            type="text" 
                            placeholder="Search by company, name, email or ID..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 px-5 py-3 rounded-xl text-xs font-bold outline-none focus:border-zinc-400 w-full sm:w-96 transition-colors"
                        />
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead className="bg-zinc-50/50 border-b border-zinc-100 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                <tr>
                                    <th className="px-6 py-5 pl-8">Reference</th>
                                    <th className="px-6 py-5">Entity</th>
                                    <th className="px-6 py-5">Architecture</th>
                                    <th className="px-6 py-5">Estimate</th>
                                    <th className="px-6 py-5">Timeline</th>
                                    <th className="px-6 py-5 text-right pr-8">Status & Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                {filteredDiscoveries.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No architectural logs match your criteria.</p>
                                        </td>
                                    </tr>
                                )}
                                {filteredDiscoveries.map((d) => (
                                    <tr key={d.id} onClick={() => setSelectedLog(d)} className="hover:bg-zinc-50/80 cursor-pointer group transition-colors">
                                        <td className="px-6 py-5 pl-8">
                                            <p className="font-mono font-bold text-sm text-zinc-900 group-hover:text-indigo-600 transition-colors">{d.discovery_number}</p>
                                            <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{formatDate(d.created_at).split(',')[0]}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-black text-sm uppercase text-zinc-800">{d.details.Company || d.client_name}</p>
                                            <p className="text-[10px] text-zinc-500 font-bold mt-0.5 truncate max-w-[150px]" title={d.client_email}>{d.client_email}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-md inline-block">
                                                {d.project_type}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-black font-mono text-emerald-600 text-sm">${d.estimated_price?.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${d.details.Timeline === 'rush' ? 'text-red-500' : 'text-zinc-500'}`}>
                                                {d.details.Timeline}
                                            </p>
                                        </td>
                                        
                                        {/* YENİ: SATIR İÇİ AKSİYONLAR (Hızlı Statü Değiştirme ve Silme) */}
                                        <td className="px-6 py-5 pr-8 text-right relative" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                                                <select 
                                                    value={d.status}
                                                    onChange={(e) => updateStatus(d.id, e.target.value)}
                                                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border outline-none cursor-pointer appearance-none text-center shadow-sm ${getStatusBadge(d.status)}`}
                                                >
                                                    {STATUS_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                                </select>
                                                
                                                <button 
                                                    onClick={() => deleteLog(d.id)}
                                                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition-all"
                                                    title="Delete Log"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}