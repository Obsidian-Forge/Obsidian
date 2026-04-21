"use client";
import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FolderGit2, Link as LinkIcon, FileText, Save, CheckCircle2, Activity, Globe, Rocket, TerminalSquare, Plus, Archive, Trash2, Play, ShieldAlert, RotateCcw, Ban } from 'lucide-react';

export default function ProjectManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const depType = searchParams.get('type') || 'active';
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [project, setProject] = useState<any>(null);
  const [currentTable, setCurrentTable] = useState('deployments');
  const [newLogMsg, setNewLogMsg] = useState('');
  
  const [form, setForm] = useState({
    project_name: '', project_type: '', status: '', progress: 0,
    repository_url: '', live_url: '', notes: '',
    client_logs: [] as { date: string, message: string }[]
  });

  const projectTypes = ["Web Application", "Mobile App (iOS/Android)", "AI & Neural Integration", "E-Commerce Platform", "Custom SaaS Architecture"];
  const phases = ['planning', 'development', 'review', 'live'];

  useEffect(() => { fetchProjectDetails(); }, [id, depType]);

  const fetchProjectDetails = async () => {
    try {
      const table = depType === 'waiting' ? 'deployments_waiting' : depType === 'archived' ? 'deployments_archived' : depType === 'terminated' ? 'deployments_terminated' : 'deployments';
      setCurrentTable(table);
      
      const { data, error } = await supabase.from(table).select('*, clients (full_name, company_name, email)').eq('id', id).single();
      if (error) throw error;
      
      if (data) {
        setProject(data);
        setForm({
          project_name: data.project_name || '', project_type: data.project_type || '', status: data.status || 'planning',
          progress: data.progress || 0, repository_url: data.repository_url || '', live_url: data.live_url || '',
          notes: data.notes || '', client_logs: data.client_logs || []
        });
      }
    } catch (err) { 
      console.error(err); 
      showToast("Failed to load project data.", "error");
    } finally { 
      setLoading(false); 
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => { 
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); 
  };

  const handleAddLog = () => { 
    if (!newLogMsg.trim()) return;
    setForm(prev => ({ ...prev, client_logs: [{ date: new Date().toISOString(), message: newLogMsg }, ...prev.client_logs] })); 
    setNewLogMsg(''); 
  };

  const handleRemoveLog = (index: number) => { 
    const updated = [...form.client_logs]; 
    updated.splice(index, 1); 
    setForm(prev => ({ ...prev, client_logs: updated }));
  };

  // THE FIX: Strictly strip out 'clients', 'cliets', or any relational objects
  const getCleanPayload = () => {
    const rawData = { ...project, ...form };
    delete rawData.clients;
    delete rawData.cliets; 
    
    const allowed = ['project_name', 'project_type', 'status', 'progress', 'repository_url', 'live_url', 'notes', 'client_logs', 'client_id', 'completed_at'];
    return Object.fromEntries(Object.entries(rawData).filter(([k]) => allowed.includes(k)));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updates: any = { ...getCleanPayload() };
      updates.completed_at = form.status === 'live' && project.status !== 'live' ? new Date().toISOString() : form.status !== 'live' ? null : project.completed_at;
      
      const { error } = await supabase.from(currentTable).update(updates).eq('id', id);
      if (error) throw error;
      setProject({ ...project, ...updates });
      showToast("Project trajectory & logs synced.");
    } catch (err: any) { 
      showToast(err.message || "Failed to sync updates.", "error");
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleMoveToActive = async () => {
    if (!window.confirm("Activate this project?")) return;
    setIsSaving(true);
    try {
      const payload = getCleanPayload();
      const { error: insertErr } = await supabase.from('deployments').insert([payload]);
      if (insertErr) throw insertErr;
      
      // Auto-convert discovery if linked
      if (project.clients?.email) {
        await supabase.from('project_discovery').update({ status: 'converted' }).eq('client_email', project.clients.email);
      }
      
      await supabase.from('deployments_waiting').delete().eq('id', id);
      showToast("Project Activated!");
      setTimeout(() => router.push('/admin/deployments'), 1500);
    } catch (err: any) { 
      showToast(err.message || "Activation failed.", "error"); 
      setIsSaving(false); 
    }
  };

  const handleArchive = async () => {
    if (!window.confirm("Archive this project?")) return; 
    setIsSaving(true);
    try {
      const { error: insertErr } = await supabase.from('deployments_archived').insert([{ ...getCleanPayload(), completed_at: new Date().toISOString() }]);
      if (insertErr) throw insertErr;
      
      await supabase.from(currentTable).delete().eq('id', id);
      showToast("Project Archived!"); 
      setTimeout(() => router.push('/admin/deployments?type=archived'), 1500);
    } catch (err: any) { 
      showToast(err.message || "Archive failed.", "error"); 
      setIsSaving(false); 
    }
  };

  const handleTerminate = async () => {
    if (!window.confirm("Terminate this project?")) return; 
    setIsSaving(true);
    try {
      const { error: insertErr } = await supabase.from('deployments_terminated').insert([getCleanPayload()]);
      if (insertErr) throw insertErr;
      
      await supabase.from(currentTable).delete().eq('id', id);
      showToast("Project Terminated!"); 
      setTimeout(() => router.push('/admin/deployments?type=terminated'), 1500);
    } catch (err: any) { 
      showToast(err.message || "Termination failed.", "error"); 
      setIsSaving(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!window.prompt("TYPE 'DELETE' TO CONFIRM PERMANENT WIPE. This cannot be undone.")) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from(currentTable).delete().eq('id', id);
      if (error) throw error;
      showToast("Deployment permanently wiped.");
      setTimeout(() => router.push('/admin/deployments'), 1500);
    } catch (err: any) { 
      showToast(err.message, "error"); 
      setIsSaving(false); 
    }
  };

  const handleRestore = async () => {
    if (!window.confirm("Restore this project to Active pipeline?")) return;
    setIsSaving(true);
    try {
      const payload = getCleanPayload();
      const { error: insertErr } = await supabase.from('deployments').insert([payload]);
      if (insertErr) throw insertErr;
      
      await supabase.from(currentTable).delete().eq('id', id);
      showToast("Project Restored!"); 
      setTimeout(() => router.push('/admin/deployments'), 1500);
    } catch (err: any) { 
      showToast(err.message || "Restore failed.", "error"); 
      setIsSaving(false); 
    }
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400">Decrypting Project Data...</div>;
  if (!project) return <div className="h-[50vh] flex items-center justify-center font-bold text-zinc-400">PROJECT NOT FOUND</div>;

  const currentPhaseIndex = phases.indexOf(form.status);
  const isReadOnly = currentTable === 'deployments_archived' || currentTable === 'deployments_terminated';

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto bg-white min-h-screen rounded-[40px] shadow-sm border border-zinc-100 mt-6 overflow-hidden pb-20">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-2xl border ${toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-black text-white'}`}>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row justify-between items-center gap-6 p-8 border-b border-zinc-100">
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="p-3 bg-zinc-50 rounded-full text-zinc-400 hover:text-black transition-colors"><ArrowLeft size={20}/></button>
          <div>
            <h1 className="text-3xl font-light tracking-tighter">{project.project_name}</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Entity: <span className="text-black">{project.clients?.full_name}</span>
              {currentTable === 'deployments_waiting' && <span className="ml-2 text-blue-500">(Waiting)</span>}
              {currentTable === 'deployments_archived' && <span className="ml-2 text-amber-500">(Archived)</span>}
              {currentTable === 'deployments_terminated' && <span className="ml-2 text-red-500">(Terminated)</span>}
            </p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${form.status === 'live' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-zinc-100 text-black border-zinc-200'}`}>{form.status}</span>
      </header>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-zinc-50 p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-8">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Activity size={14}/> Development Pipeline</h3>
              <div className="flex justify-between items-center relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-200 rounded-full z-0"/>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black rounded-full z-0 transition-all duration-500" style={{ width: `${(Math.max(0, currentPhaseIndex) / (phases.length - 1)) * 100}%` }}/>
                {phases.map((phase, idx) => { 
                  const isActive = form.status === phase;
                  const isPassed = currentPhaseIndex >= idx; 
                  return (
                    <div key={phase} onClick={() => !isReadOnly && setForm({...form, status: phase})} className={`relative z-10 flex flex-col items-center gap-2 ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer'} group`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive ? 'bg-black border-black text-white scale-125' : isPassed ? 'bg-black border-black text-white' : 'bg-white border-zinc-300 text-zinc-300 group-hover:border-zinc-500'}`}>
                        {isPassed ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-current"/>}
                      </div>
                      <span className={`absolute -bottom-6 text-[8px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${isActive ? 'text-black' : isPassed ? 'text-zinc-600' : 'text-zinc-400'}`}>{phase}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pt-6 border-t border-zinc-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Completion Progress</label>
                <span className="text-xl font-bold font-mono">{form.progress}%</span>
              </div>
              <input disabled={isReadOnly} type="range" min="0" max="100" step="1" value={form.progress} onChange={(e) => setForm({...form, progress: parseInt(e.target.value)})} className="w-full accent-black cursor-pointer h-1.5 bg-zinc-200 rounded-lg appearance-none disabled:opacity-60"/>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><FolderGit2 size={14}/> Architecture Details</h3>
            <div className="space-y-5">
              <div>
                <label className="text-[9px] font-bold uppercase text-zinc-500 mb-2 block">Project Name</label>
                <input disabled={isReadOnly} required value={form.project_name} onChange={e => setForm({...form, project_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm outline-none focus:border-black transition-colors disabled:opacity-60"/>
              </div>
              <div>
                <label className="text-[9px] font-bold uppercase text-zinc-500 mb-2 block">Architecture Type</label>
                <select disabled={isReadOnly} value={form.project_type} onChange={e => setForm({...form, project_type: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3.5 rounded-xl text-sm outline-none focus:border-black transition-colors appearance-none disabled:opacity-60">
                  {projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 p-6 rounded-[28px] border border-zinc-800 shadow-sm space-y-4 text-white">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2"><TerminalSquare size={14}/> Client Ledger (Visible)</h3>
            {!isReadOnly && (
              <div className="flex gap-2">
                <input value={newLogMsg} onChange={e => setNewLogMsg(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddLog(); } }} placeholder="Add deployment log..." className="flex-1 bg-white/10 border border-white/20 px-3 py-2 rounded-xl text-xs outline-none focus:border-white text-white placeholder:text-zinc-500"/>
                <button type="button" onClick={handleAddLog} className="bg-white text-black p-2 rounded-xl hover:scale-105 transition-transform"><Plus size={16}/></button>
              </div>
            )}
            <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-2">
              {form.client_logs.map((log, i) => (
                <div key={i} className="flex justify-between items-start gap-2 bg-white/5 p-3 rounded-xl border border-white/10 group">
                  <div>
                    <p className="text-[8px] text-zinc-400 font-mono mb-1">{new Date(log.date).toLocaleString()}</p>
                    <p className="text-xs text-zinc-300">{log.message}</p>
                  </div>
                  {!isReadOnly && (
                    <button type="button" onClick={() => handleRemoveLog(i)} className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowLeft size={12} className="rotate-45"/></button>
                  )}
                </div>
              ))}
              {form.client_logs.length === 0 && <p className="text-xs text-zinc-500 italic text-center py-4">No logs pushed to client portal yet.</p>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-[28px] border border-zinc-200 shadow-sm space-y-5">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><Globe size={14}/> Endpoints</h3>
            <div>
              <label className="text-[9px] font-bold uppercase text-zinc-500 mb-2 flex items-center gap-1.5"><LinkIcon size={10}/> Git Repository</label>
              <input disabled={isReadOnly} type="url" value={form.repository_url} onChange={e => setForm({...form, repository_url: e.target.value})} placeholder="https://github.com/..." className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-xs font-mono outline-none focus:border-black transition-colors disabled:opacity-60"/>
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase text-emerald-500 mb-2 flex items-center gap-1.5"><Rocket size={10}/> Live Production URL</label>
              <input disabled={isReadOnly} type="url" value={form.live_url} onChange={e => setForm({...form, live_url: e.target.value})} placeholder="https://..." className="w-full bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl text-xs font-mono outline-none focus:border-emerald-500 transition-colors text-emerald-900 disabled:opacity-60"/>
            </div>
          </div>

          <div className="bg-zinc-50 p-6 rounded-[28px] border border-zinc-200 shadow-sm space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2"><FileText size={14}/> Internal Notes (Hidden)</h3>
            <textarea disabled={isReadOnly} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Private developer notes..." className="w-full bg-transparent text-xs text-zinc-700 outline-none min-h-[80px] resize-none disabled:opacity-60"/>
          </div>
          
          {!isReadOnly && (
            <button type="submit" disabled={isSaving} className="w-full bg-black text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? "Syncing..." : <><Save size={14}/> Save Architecture</>}
            </button>
          )}

          <div className="bg-red-50 p-6 rounded-[28px] border border-red-100 space-y-4 mt-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-2"><ShieldAlert size={14}/> Danger Zone</h3>
            
            {isReadOnly ? (
              <button type="button" onClick={handleRestore} disabled={isSaving} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] shadow-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mb-3">
                <RotateCcw size={14}/> Restore Pipeline
              </button>
            ) : (
              <>
                {currentTable === 'deployments_waiting' && (
                  <button type="button" onClick={handleMoveToActive} disabled={isSaving} className="w-full bg-blue-600 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 mb-3">
                    <Play size={12}/> Activate Project
                  </button>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={handleArchive} disabled={isSaving} className="flex-1 bg-white text-zinc-600 border border-zinc-200 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"><Archive size={12}/> Archive</button>
                  <button type="button" onClick={handleTerminate} disabled={isSaving} className="flex-1 bg-white text-amber-600 border border-amber-200 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-amber-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"><Ban size={12}/> Terminate</button>
                </div>
              </>
            )}
            
            <button type="button" onClick={handlePermanentDelete} disabled={isSaving} className="w-full bg-red-600 text-white py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 mt-2 shadow-sm">
               <Trash2 size={12} /> Hard Delete
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}