"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminClientsPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // CLIENT STATES
    const [clients, setClients] = useState<any[]>([]);
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    // SLIDE-OVER (ENTITY PROFILE) STATES
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [internalNote, setInternalNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingInvoice, setUploadingInvoice] = useState(false);

    // YENİ: EDİT PROFİL STATES
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        email: '',
        company_name: '',
        phone_number: '',
        address: ''
    });

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') router.push('/client/login');
            else setIsAdmin(true);
        };
        checkAdmin();
        fetchData();

        const clientsChannel = supabase.channel('admin-clients-active-sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData())
            .subscribe();

        return () => {
            supabase.removeChannel(clientsChannel);
        };
    }, [router]);

    useEffect(() => {
        if (selectedClient) {
            setInternalNote(selectedClient.internal_notes || '');
            // Edit formunu seçili müşteri ile doldur
            setEditForm({
                full_name: selectedClient.full_name || '',
                email: selectedClient.email || '',
                company_name: selectedClient.company_name || '',
                phone_number: selectedClient.phone_number || '',
                address: selectedClient.address || ''
            });
            setIsEditingProfile(false); // Her yeni müşteri açıldığında view modunda başla
            
            fetchClientInvoices(selectedClient.id);
            fetchClientFiles(selectedClient.id);
        }
    }, [selectedClient]);

    const fetchData = async () => {
        setLoading(true);
        const { data } = await supabase.from('clients').select('*').is('archived_at', null).order('created_at', { ascending: false });
        if (data) setClients(data);
        setLoading(false);
    };

    const fetchClientFiles = async (clientId: string) => {
        const { data } = await supabase.from('client_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (data) setClientFiles(data);
    };

    const fetchClientInvoices = async (clientId: string) => {
        const { data } = await supabase.from('client_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false });
        if (data) setClientInvoices(data);
    };

    // --- YENİ: PROFİL GÜNCELLEME ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingProfile(true);
        try {
            const { error } = await supabase.from('clients').update(editForm).eq('id', selectedClient.id);
            if (error) throw error;
            
            setSelectedClient({ ...selectedClient, ...editForm });
            setIsEditingProfile(false);
            fetchData();
        } catch (err: any) {
            alert("Error updating profile: " + err.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const deleteClient = async (id: string) => {
        if (!confirm("WARNING: Are you sure you want to PERMANENTLY delete this entity? All associated projects, files, and tickets will be destroyed. This action cannot be undone.")) return;
        try {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
            if (selectedClient?.id === id) setSelectedClient(null);
            fetchData();
        } catch (err: any) { alert("Error deleting client: " + err.message); }
    };

    const archiveClient = async (id: string, accessCode: string) => {
        if (!confirm("TERMINATE ENTITY? This will revoke their access and move them to the Archive.")) return;
        try {
            const { error } = await supabase.from('clients').update({ archived_at: new Date().toISOString(), access_code: `REVOKED-${accessCode}` }).eq('id', id);
            if (error) throw error;
            setSelectedClient(null); 
            fetchData(); 
            alert("Entity successfully archived.");
        } catch (err: any) { alert("Failed to archive: " + err.message); }
    };

    const handleCopyKey = (e: React.MouseEvent, key: string, id: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(key);
        setCopiedKeyId(id);
        setTimeout(() => setCopiedKeyId(null), 2000); 
    };

    const handleSendCode = async (email: string, code: string, clientName: string) => {
        if (!confirm(`Send key to ${email}?`)) return;
        try {
            const response = await fetch('/api/email', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'access_code', email: email, code: code, clientName: clientName, loginLink: `${window.location.origin}/client/login` })
            });
            if (!response.ok) throw new Error("Backend failed");
            alert("Sent successfully.");
        } catch (err) { alert("Failed to send."); }
    };

    const handleSaveNote = async () => {
        setSavingNote(true);
        try {
            const { error } = await supabase.from('clients').update({ internal_notes: internalNote }).eq('id', selectedClient.id);
            if (error) throw error;
            setSelectedClient({ ...selectedClient, internal_notes: internalNote });
            fetchData();
        } catch (err: any) { alert("Error saving note: " + err.message); } finally { setSavingNote(false); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, clientId: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${clientId}/${Math.random()}.${fileExt}`;
        try {
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            await supabase.from('client_files').insert({ client_id: clientId, file_name: file.name, file_url: publicUrl, file_type: file.type.includes('pdf') ? 'pdf' : 'document' });
            fetchClientFiles(clientId);
        } catch (error: any) { alert(error.message); } finally { setUploading(false); }
    };

    const deleteClientFile = async (fileId: string, fileUrl: string, clientId: string) => {
        if (!confirm("Are you sure you want to delete this asset?")) return;
        try {
            const basePath = '/client-assets/';
            const pathIndex = fileUrl.indexOf(basePath);
            if (pathIndex !== -1) await supabase.storage.from('client-assets').remove([fileUrl.substring(pathIndex + basePath.length)]);
            const { error } = await supabase.from('client_files').delete().eq('id', fileId);
            if (error) throw error;
            fetchClientFiles(clientId);
        } catch (error: any) { alert("Error deleting file: " + error.message); }
    };

    const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>, clientId: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploadingInvoice(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `invoices/${clientId}/${Math.random()}.${fileExt}`;
        try {
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            await supabase.from('client_invoices').insert({ client_id: clientId, file_name: file.name, file_url: publicUrl, status: 'unpaid' });
            fetchClientInvoices(clientId);
        } catch (error: any) { alert(error.message); } finally { setUploadingInvoice(false); }
    };

    const toggleInvoiceStatus = async (invoiceId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
        const { error } = await supabase.from('client_invoices').update({ status: newStatus }).eq('id', invoiceId);
        if (!error) fetchClientInvoices(selectedClient.id);
    };

    const deleteInvoice = async (invoiceId: string, fileUrl: string, clientId: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;
        try {
            const basePath = '/client-assets/';
            const pathIndex = fileUrl.indexOf(basePath);
            if (pathIndex !== -1) await supabase.storage.from('client-assets').remove([fileUrl.substring(pathIndex + basePath.length)]);
            const { error } = await supabase.from('client_invoices').delete().eq('id', invoiceId);
            if (error) throw error;
            fetchClientInvoices(clientId);
        } catch (error: any) { alert("Error deleting invoice: " + error.message); }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (!isAdmin) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-black uppercase text-xs tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-zinc-50 text-black font-sans relative overflow-x-hidden selection:bg-black selection:text-white">
            
            {selectedClient && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedClient(null)} />
                    <aside className="relative w-full max-w-2xl bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto border-l border-zinc-200 animate-in slide-in-from-right duration-300">
                        
                        <div className="flex justify-between items-start mb-8 pb-6 border-b border-zinc-100">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-zinc-900">Entity Profile</h2>
                                    <span className="px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-200">
                                        Verified
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-mono">ID: {selectedClient.id.split('-')[0].toUpperCase()} • {formatDate(selectedClient.created_at)}</p>
                            </div>
                            <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors"><svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                        </div>
                        
                        <div className="space-y-8">
                            
                            {/* EDİTLENEBİLİR KİMLİK BÖLÜMÜ */}
                            <section className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Identity & Billing Details</p>
                                    <button 
                                        onClick={() => setIsEditingProfile(!isEditingProfile)} 
                                        className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-black px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                                    >
                                        {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                                    </button>
                                </div>

                                {isEditingProfile ? (
                                    <form onSubmit={handleUpdateProfile} className="space-y-4 animate-in fade-in zoom-in-95">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest block mb-1.5 ml-1 text-zinc-500">Full Name</label>
                                                <input type="text" required value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="w-full p-3 rounded-xl border border-zinc-200 outline-none text-xs font-bold focus:border-black" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest block mb-1.5 ml-1 text-zinc-500">Email Address</label>
                                                <input type="email" required value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full p-3 rounded-xl border border-zinc-200 outline-none text-xs font-bold focus:border-black" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest block mb-1.5 ml-1 text-zinc-500">Company</label>
                                                <input type="text" value={editForm.company_name} onChange={e => setEditForm({...editForm, company_name: e.target.value})} className="w-full p-3 rounded-xl border border-zinc-200 outline-none text-xs font-bold focus:border-black" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest block mb-1.5 ml-1 text-zinc-500">Phone</label>
                                                <input type="text" value={editForm.phone_number} onChange={e => setEditForm({...editForm, phone_number: e.target.value})} className="w-full p-3 rounded-xl border border-zinc-200 outline-none text-xs font-bold focus:border-black" />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest block mb-1.5 ml-1 text-zinc-500">Billing Address</label>
                                                <textarea value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full p-3 rounded-xl border border-zinc-200 outline-none text-xs font-bold focus:border-black resize-none h-20" />
                                            </div>
                                        </div>
                                        <button disabled={isSavingProfile} type="submit" className="w-full bg-black text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-colors mt-2">
                                            {isSavingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in">
                                        <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Full Name</p><p className="text-sm font-black uppercase text-zinc-900 mt-1">{selectedClient.full_name}</p></div>
                                        <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Email Address</p><p className="text-xs font-bold text-zinc-600 break-all mt-1">{selectedClient.email}</p></div>
                                        <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Company</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.company_name || 'N/A'}</p></div>
                                        <div><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Phone</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.phone_number || 'N/A'}</p></div>
                                        <div className="sm:col-span-2"><p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Address</p><p className="text-xs font-bold text-zinc-600 mt-1">{selectedClient.address || 'N/A'}</p></div>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-zinc-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Project Started</p>
                                        <p className="text-xs font-bold text-zinc-700 mt-1">{formatDate(selectedClient.created_at)}</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); archiveClient(selectedClient.id, selectedClient.access_code); }} className="text-[9px] font-black text-red-500 bg-red-50 border border-red-100 uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">Terminate</button>
                                </div>
                            </section>

                            <section className="bg-zinc-50 p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-4">Internal Notes</p>
                                <textarea value={internalNote} onChange={(e) => setInternalNote(e.target.value)} placeholder="Private notes..." className="w-full bg-white border border-zinc-200 p-4 rounded-xl text-xs font-bold outline-none focus:border-zinc-400 resize-none h-24 mb-3 transition-colors" />
                                <button onClick={handleSaveNote} disabled={savingNote || internalNote === (selectedClient.internal_notes || '')} className="w-full bg-zinc-900 text-white py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-50 hover:bg-black transition-colors shadow-sm">{savingNote ? 'Saving...' : 'Save Note'}</button>
                            </section>

                            <section className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Billing & Invoices</p>
                                    <label className="cursor-pointer bg-zinc-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-colors hover:bg-black shadow-sm">
                                        {uploadingInvoice ? '...' : 'Upload Invoice'}
                                        <input type="file" className="hidden" onChange={(e) => handleInvoiceUpload(e, selectedClient.id)} />
                                    </label>
                                </div>
                                <div className="grid gap-3">
                                    {clientInvoices.length === 0 && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-6 text-center border border-zinc-100 border-dashed rounded-xl">No invoices found.</p>}
                                    {clientInvoices.map((inv) => (
                                        <div key={inv.id} className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl group transition-all">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => toggleInvoiceStatus(inv.id, inv.status)} className={`px-2.5 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest border transition-colors ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`} title="Click to toggle status">
                                                    {inv.status === 'paid' ? 'Paid' : 'Unpaid'}
                                                </button>
                                                <span className="text-xs font-bold text-zinc-700 truncate max-w-[120px]">{inv.file_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <a href={inv.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-800 transition-colors">Open</a>
                                                <button onClick={() => deleteInvoice(inv.id, inv.file_url, selectedClient.id)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-white p-6 rounded-[24px] border border-zinc-200 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Asset Vault</p>
                                    <label className="cursor-pointer bg-zinc-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-colors hover:bg-black shadow-sm">
                                        {uploading ? '...' : 'Upload Asset'}
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, selectedClient.id)} />
                                    </label>
                                </div>
                                <div className="grid gap-3">
                                    {clientFiles.length === 0 && <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest p-6 text-center border border-zinc-100 border-dashed rounded-xl">No assets found.</p>}
                                    {clientFiles.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl group transition-all">
                                            <span className="text-xs font-bold text-zinc-700 truncate max-w-[150px]">{file.file_name}</span>
                                            <div className="flex items-center gap-3">
                                                <a href={file.file_url} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase text-zinc-400 hover:text-zinc-800 transition-colors">Open</a>
                                                <button onClick={() => deleteClientFile(file.id, file.file_url, selectedClient.id)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            )}

            <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto max-w-7xl mx-auto w-full relative z-0">
                
                <button 
                    onClick={() => router.push('/admin/dashboard')} 
                    className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Workspace
                </button>

                <div className="w-full animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-zinc-900">Active Database</h1>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Manage Authorized Entities</p>
                        </div>
                        <button onClick={fetchData} className="w-fit p-2.5 bg-white border border-zinc-200 hover:bg-zinc-100 rounded-xl transition-all active:scale-95 text-zinc-500 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="py-20 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">Loading...</div>
                    ) : clients.length === 0 ? (
                        <div className="py-20 text-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">No active entities found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {clients.map((c) => (
                                <div key={c.id} onClick={() => { setSelectedClient(c); fetchClientFiles(c.id); }} className="bg-white border border-zinc-200 p-6 rounded-[24px] shadow-sm hover:border-zinc-400 cursor-pointer transition-all flex flex-col gap-5 relative group">
                                    
                                    {/* SİLME BUTONU (HOVER) */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteClient(c.id); }} 
                                        className="absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Entity"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>

                                    <div className="flex justify-between items-start pr-8">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Verified Client</p>
                                            </div>
                                            <p className="font-black text-lg uppercase truncate text-zinc-900" title={c.full_name}>{c.full_name}</p>
                                            <p className="text-xs text-zinc-500 font-bold mt-1 truncate" title={c.email}>{c.email}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-zinc-50 rounded-xl p-4 flex items-center justify-between border border-zinc-200 mt-auto">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Key</p>
                                        <div className="flex items-center gap-2">
                                            <span onClick={(e) => handleCopyKey(e, c.access_code, c.id)} className="bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold cursor-pointer hover:bg-zinc-100 transition-colors text-zinc-800 shadow-sm">
                                                {copiedKeyId === c.id ? "COPIED" : c.access_code}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <footer className="mt-20 pb-10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300">Novatrum // Entity Management</p>
                </footer>
            </main>
        </div>
    );
}