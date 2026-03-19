"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/app/components/LogoutButton';

export default function AdvancedAdminPage() {
  const [activeTab, setActiveTab] = useState('clients');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Detaylı Form State'i
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    category: 'Web Development',
    budget: '',
    deadline: '',
    folder: '',
    staging: '',
    progress: 0,
    message: ''
  });

  useEffect(() => {
    checkAdmin();
    fetchProjects();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/dashboard/login');
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) router.push('/dashboard');
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) setProjects(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('projects').upsert({
      client_email: formData.email,
      project_name: formData.name,
      category: formData.category,
      budget: formData.budget,
      deadline: formData.deadline,
      folder_link: formData.folder,
      staging_link: formData.staging, // Veritabanında staging_link sütunu olduğunu varsayıyoruz
      progress_percent: formData.progress,
      status_message: formData.message
    }, { onConflict: 'client_email' });

    if (error) {
      alert("Hata: " + error.message);
    } else {
      alert("Project Deployed Successfully!");
      fetchProjects();
      setActiveTab('clients');
      // Formu temizle
      setFormData({ email: '', name: '', category: 'Web Development', budget: '', deadline: '', folder: '', staging: '', progress: 0, message: '' });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] text-black selection:bg-black selection:text-white">
      
      {/* SOL SIDEBAR (DARK TECH) */}
      <aside className="w-72 bg-black text-white p-8 flex flex-col fixed h-full border-r border-zinc-800">
        <div className="mb-16">
          <h2 className="text-2xl font-black tracking-tighter italic italic tracking-tight">NOVATRUM.OS</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[8px] text-zinc-500 tracking-[0.4em] uppercase font-bold">Admin Infrastructure</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          {[
            { id: 'clients', label: 'Client Database', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: 'add', label: 'New Deployment', icon: 'M12 4v16m8-8H4' },
            { id: 'files', label: 'Asset Storage', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
            { id: 'settings', label: 'Core Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === item.id ? 'bg-white text-black translate-x-2 shadow-xl shadow-white/5' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-zinc-800 flex justify-center">
          <LogoutButton />
        </div>
      </aside>

      {/* ANA PANEL */}
      <main className="flex-1 ml-72 p-16">
        
        {/* CLIENT DATABASE SEKMESİ */}
        {activeTab === 'clients' && (
          <div className="max-w-6xl animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-1">
                <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">Global Clients</h1>
                <p className="text-zinc-400 text-sm font-medium tracking-wide italic">Active monitoring of {projects.length} independent infrastructures</p>
              </div>
            </div>

            <div className="bg-white rounded-[40px] border border-zinc-100 shadow-[0_8px_40px_rgba(0,0,0,0.03)] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-50/50 border-b border-zinc-100">
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-10 py-6">Operational Project</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6">Integrity</th>
                    <th className="px-10 py-6 text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-zinc-50/30 transition-all duration-300 group">
                      <td className="px-10 py-8">
                        <span className="font-mono text-[11px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg tracking-tighter">
                          {p.client_id || 'ID-GEN'}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <p className="font-black text-sm uppercase tracking-tight text-zinc-900">{p.project_name}</p>
                        <p className="text-[10px] text-zinc-400 lowercase font-medium mt-1 italic">{p.client_email}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Secure</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-1 bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black transition-all duration-1000" style={{ width: `${p.progress_percent}%` }} />
                          </div>
                          <span className="font-mono text-[10px] font-bold">%{p.progress_percent}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => {
                            setFormData({
                              email: p.client_email,
                              name: p.project_name,
                              category: p.category || 'Web Development',
                              budget: p.budget || '',
                              deadline: p.deadline || '',
                              folder: p.folder_link || '',
                              staging: p.staging_link || '',
                              progress: p.progress_percent,
                              message: p.status_message
                            });
                            setActiveTab('add');
                          }}
                          className="p-3 hover:bg-black hover:text-white rounded-xl transition-all border border-zinc-100 hover:border-black shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEW DEPLOYMENT (ONBOARDING FORM) SEKMESİ */}
        {activeTab === 'add' && (
          <div className="max-w-4xl animate-in slide-in-from-bottom-8 duration-700">
            <div className="mb-12">
              <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">New Deployment</h1>
              <p className="text-zinc-400 text-sm mt-2 font-medium italic">Initialize a secure project environment for your client.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-14 rounded-[50px] border border-zinc-100 shadow-2xl space-y-12">
              
              {/* 01. BASIC INFO */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-black text-white text-[10px] font-black rounded-full">01</span>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Basic Infrastructure</h3>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 ml-1">Client Email</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="auth@client.com" className="w-full bg-zinc-50 p-5 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-200 focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 ml-1">Project Code Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="E.G. NEURAL-X PLATFORM" className="w-full bg-zinc-50 p-5 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-200 focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* 02. PROJECT SPECIFICATIONS */}
              <div className="space-y-8 pt-4">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-black text-white text-[10px] font-black rounded-full">02</span>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Specifications</h3>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 ml-1">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-zinc-50 p-5 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-200 appearance-none font-bold uppercase tracking-tighter">
                      <option>Web Development</option>
                      <option>Mobile App</option>
                      <option>AI Solutions</option>
                      <option>Blockchain</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 ml-1">Budget Allocation</label>
                    <input type="text" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} placeholder="E.G. 12,500 USD" className="w-full bg-zinc-50 p-5 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-200" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 ml-1">Target Deadline</label>
                    <input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="w-full bg-zinc-50 p-5 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-200" />
                  </div>
                </div>
              </div>

              {/* 03. ASSET LINKS */}
              <div className="space-y-8 pt-4">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-black text-white text-[10px] font-black rounded-full">03</span>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">External Assets</h3>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 ml-1">Cloud Folder Link</label>
                    <input type="url" value={formData.folder} onChange={(e) => setFormData({...formData, folder: e.target.value})} placeholder="HTTPS://DRIVE.GOOGLE.COM/..." className="w-full bg-zinc-50 p-5 rounded-2xl outline-none text-[11px] font-mono border border-transparent focus:border-zinc-200" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 ml-1">Live Staging Preview</label>
                    <input type="url" value={formData.staging} onChange={(e) => setFormData({...formData, staging: e.target.value})} placeholder="HTTPS://STAGING.CLIENT.COM" className="w-full bg-zinc-50 p-5 rounded-2xl outline-none text-[11px] font-mono border border-transparent focus:border-zinc-200" />
                  </div>
                </div>
              </div>

              {/* 04. STATUS & LOGS */}
              <div className="space-y-8 pt-4">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-black text-white text-[10px] font-black rounded-full">04</span>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Live Status Log</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Starting Progress</span>
                    <span className="font-mono text-2xl font-black">%{formData.progress}</span>
                  </div>
                  <input type="range" min="0" max="100" value={formData.progress} onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})} className="w-full accent-black h-1.5 bg-zinc-100 rounded-full appearance-none cursor-pointer" />
                  <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Enter the initial update for the client dashboard..." className="w-full bg-zinc-50 p-6 rounded-[30px] outline-none text-sm h-40 resize-none border border-transparent focus:border-zinc-200" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-zinc-900 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'INITIALIZING ENVIRONMENT...' : 'DEPLOY PROJECT INFRASTRUCTURE'}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}