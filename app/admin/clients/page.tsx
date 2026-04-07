"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminClientsPage() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    const [clients, setClients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [clientFiles, setClientFiles] = useState<any[]>([]);
    const [clientInvoices, setClientInvoices] = useState<any[]>([]);
    const [internalNote, setInternalNote] = useState('');
    const [savingNote, setSavingNote] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadingInvoice, setUploadingInvoice] = useState(false);

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        email: '',
        company_name: '',
        address: '',
        access_code: ''
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddingClient, setIsAddingClient] = useState(false);
    const [archiveWarningClient, setArchiveWarningClient] = useState<any>(null); // YENİ: Arşiv Uyarı Popup'ı için
    const [addForm, setAddForm] = useState({
        full_name: '',
        email: '',
        company_name: '',
        address: ''
    });

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') {
                router.push('/client/login');
                return;
            }
            setIsAdmin(true);
            fetchClients();
        };
        checkAdmin();
    }, [router]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase.from('clients').select('*').is('archived_at', null).order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setClients(data);
        } catch (error: any) {
            showToast("Failed to load entities.", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchClientDetails = async (clientId: string) => {
        try {
            const [filesRes, invoicesRes] = await Promise.all([
                supabase.from('client_files').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
                supabase.from('client_invoices').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
            ]);
            
            if (filesRes.data) setClientFiles(filesRes.data);
            if (invoicesRes.data) setClientInvoices(invoicesRes.data);
            
            const client = clients.find(c => c.id === clientId);
            if (client) {
                setInternalNote(client.internal_notes || '');
                setEditForm({
                    full_name: client.full_name,
                    email: client.email,
                    company_name: client.company_name || '',
                    address: client.address || '',
                    access_code: client.access_code
                });
            }
        } catch (error: any) {
            showToast("Failed to load entity details.", "error");
        }
    };

    // 12 Haneli Özel Kod Formatı (XXXX-XXXX-XXXX)
    const generateAccessKey = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const getPart = () => {
            let part = '';
            for (let i = 0; i < 4; i++) part += chars.charAt(Math.floor(Math.random() * chars.length));
            return part;
        };
        return `${getPart()}-${getPart()}-${getPart()}`;
    };

    // MÜŞTERİ OLUŞTURMA & ARŞİV ÇAKIŞMASI KONTROLÜ
    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingClient(true);
        
        try {
            // Önce bu email sistemde var mı kontrol et
            const { data: existingClient } = await supabase.from('clients').select('id, archived_at').eq('email', addForm.email).maybeSingle();
            
            if (existingClient) {
                if (!existingClient.archived_at) {
                    // Müşteri aktifse doğrudan reddet
                    showToast("An ACTIVE entity with this email already exists.", "error");
                    setIsAddingClient(false);
                    return;
                } else {
                    // Müşteri ARŞİVDEYSE, uyarı popup'ını aç ve bekle
                    setArchiveWarningClient(existingClient);
                    setIsAddingClient(false);
                    return;
                }
            }

            // Çakışma yoksa doğrudan oluştur
            await proceedWithCreation();

        } catch (error: any) {
            showToast(error.message, "error");
            setIsAddingClient(false);
        }
    };

    // YENİ MÜŞTERİYİ VERİTABANINA YAZMA İŞLEMİ
    const proceedWithCreation = async (oldClientIdToRename?: string) => {
        try {
            setIsAddingClient(true);
            
            // Eğer arşivdeki eski hesabın üzerine yazıyorsak (Continue Anyway),
            // Veritabanı "Unique Email" hatası (409) vermesin diye eski maili bozuyoruz:
            if (oldClientIdToRename) {
                await supabase.from('clients')
                    .update({ email: `archived_${Date.now()}_${addForm.email}` })
                    .eq('id', oldClientIdToRename);
            }

            const newKey = generateAccessKey();
            const { error } = await supabase.from('clients').insert({
                full_name: addForm.full_name,
                email: addForm.email,
                company_name: addForm.company_name || null,
                address: addForm.address || null,
                access_code: newKey,
                internal_notes: ''
            });

            if (error) throw error;

            showToast("Entity registered successfully.", "success");
            setIsAddModalOpen(false);
            setArchiveWarningClient(null); // Uyarıyı kapat
            setAddForm({ full_name: '', email: '', company_name: '', address: '' });
            fetchClients();
        } catch(error: any) {
            showToast(error.message, "error");
        } finally {
            setIsAddingClient(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;
        setIsSavingProfile(true);
        try {
            const { error } = await supabase.from('clients').update({
                full_name: editForm.full_name,
                email: editForm.email,
                company_name: editForm.company_name || null,
                address: editForm.address || null,
                access_code: editForm.access_code
            }).eq('id', selectedClient.id);

            if (error) throw error;

            showToast("Profile updated.", "success");
            setIsEditingProfile(false);
            fetchClients();
            setSelectedClient({ ...selectedClient, ...editForm });
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleRegenerateKey = async () => {
        if (!selectedClient) return;
        const confirmRegenerate = window.confirm("Warning: Regenerating the access key will instantly revoke the client's current access. Proceed?");
        if (!confirmRegenerate) return;

        try {
            const newKey = generateAccessKey();
            const { error } = await supabase.from('clients').update({ access_code: newKey }).eq('id', selectedClient.id);
            if (error) throw error;
            
            showToast("Key regenerated and applied.", "success");
            setEditForm({ ...editForm, access_code: newKey });
            setSelectedClient({ ...selectedClient, access_code: newKey });
            fetchClients();
        } catch (error: any) {
            showToast("Failed to regenerate key.", "error");
        }
    };

    const copyToClipboard = (key: string, id: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKeyId(id);
        showToast("Key copied to clipboard.", "info");
        setTimeout(() => setCopiedKeyId(null), 2000);
    };

    const sendKeyByEmail = (email: string, key: string) => {
        const subject = encodeURIComponent("Your Secure Access Key for Novatrum Portal");
        const body = encodeURIComponent(`Hello,\n\nYour secure access key for the Novatrum Infrastructure Portal has been generated.\n\nAccess Key: ${key}\n\nPlease keep this key safe and do not share it with unauthorized personnel.\n\nPortal: https://novatrum.eu/client/login\n\nRegards,\nNovatrum Systems`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        showToast("Opening mail client...", "info");
    };

    const handleSaveNote = async () => {
        if (!selectedClient) return;
        setSavingNote(true);
        try {
            const { error } = await supabase.from('clients').update({ internal_notes: internalNote }).eq('id', selectedClient.id);
            if (error) throw error;
            showToast("Internal note synced.", "success");
        } catch (error: any) {
            showToast("Failed to sync note.", "error");
        } finally {
            setSavingNote(false);
        }
    };

    // GÜNCELLENDİ: ARCHIVE VE TERMINATE (KOMPLE SİLME) MANTIĞI
    const handleTerminateOrArchive = async (type: 'archive' | 'terminate') => {
        if (!selectedClient) return;
        const actionText = type === 'terminate' ? 'TERMINATE (completely delete)' : 'ARCHIVE';
        const confirmAction = window.confirm(`CRITICAL WARNING: Are you sure you want to ${actionText} ${selectedClient.full_name}? This action is immediate.`);
        if (!confirmAction) return;

        try {
            if (type === 'terminate') {
                // SİSTEMDEN VE VERİTABANINDAN KOMPLE SİL
                const { error } = await supabase.from('clients').delete().eq('id', selectedClient.id);
                if (error) throw error;
                showToast("Entity completely removed from database.", "success");
            } else {
                // ARŞİVE KALDIR (Anahtarı boz)
                const revokedKey = `REVOKED-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                const { error } = await supabase.from('clients').update({ 
                    archived_at: new Date().toISOString(),
                    access_code: revokedKey
                }).eq('id', selectedClient.id);
                
                if (error) throw error;
                showToast("Entity successfully archived.", "success");
            }
            
            setSelectedClient(null);
            fetchClients();
        } catch (error: any) {
            showToast(`Failed to ${type} entity.`, "error");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'invoice') => {
        if (!e.target.files || e.target.files.length === 0 || !selectedClient) return;
        const file = e.target.files[0];
        
        if (type === 'file') setUploading(true);
        else setUploadingInvoice(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${selectedClient.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);

            if (type === 'file') {
                const { error: dbError } = await supabase.from('client_files').insert({
                    client_id: selectedClient.id,
                    file_name: file.name,
                    file_url: publicUrl,
                    file_type: file.type
                });
                if (dbError) throw dbError;
                showToast("File uploaded to Vault.", "success");
            } else {
                const { error: dbError } = await supabase.from('client_invoices').insert({
                    client_id: selectedClient.id,
                    file_name: file.name,
                    file_url: publicUrl,
                    status: 'unpaid'
                });
                if (dbError) throw dbError;
                showToast("Invoice uploaded to Ledger.", "success");
            }
            
            fetchClientDetails(selectedClient.id);
        } catch (error: any) {
            showToast(`Upload failed: ${error.message}`, "error");
        } finally {
            if (type === 'file') setUploading(false);
            else setUploadingInvoice(false);
            e.target.value = '';
        }
    };

    const handleDeleteFile = async (fileId: string, fileUrl: string, type: 'file' | 'invoice') => {
        if (!confirm("Are you sure you want to delete this document permanently?")) return;
        try {
            const urlObj = new URL(fileUrl);
            const pathParts = urlObj.pathname.split('/');
            const filePath = pathParts.slice(pathParts.indexOf('client-assets') + 1).join('/');

            await supabase.storage.from('client-assets').remove([filePath]);

            if (type === 'file') {
                await supabase.from('client_files').delete().eq('id', fileId);
            } else {
                await supabase.from('client_invoices').delete().eq('id', fileId);
            }

            showToast("Document erased.", "success");
            fetchClientDetails(selectedClient.id);
        } catch (error: any) {
            showToast("Failed to erase document.", "error");
        }
    };

    const filteredClients = clients.filter(c => 
        c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAdmin || loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-bold uppercase text-[10px] tracking-widest text-zinc-400">Authenticating Secure Node...</div>;

    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans relative overflow-x-hidden selection:bg-black selection:text-white">
            
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
                            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                        }`}
                    >
                        {toast.type === 'success' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>}
                        {toast.type === 'error' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}
                        {toast.type === 'info' && <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.25]">
                <div className="absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_50%,transparent_100%)] bg-[linear-gradient(#d4d4d8_1px,transparent_1px),linear-gradient(90deg,#d4d4d8_1px,transparent_1px)]" />
            </div>

            <main className="flex-1 p-6 md:p-10 lg:p-14 max-w-7xl mx-auto w-full relative z-10 custom-scrollbar overflow-y-auto">
                
                <button onClick={() => router.push('/admin/dashboard')} className="mb-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors appearance-none w-fit">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Workspace
                </button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Active Database</h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Entity Relationship Management</p>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="bg-black text-white px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-md active:scale-95 flex items-center gap-2 appearance-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg> Register Entity
                    </button>
                </div>

                {/* SEARCH BAR */}
                <div className="mb-10">
                    <div className="relative max-w-xl mx-auto md:mx-0">
                        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input 
                            type="text" 
                            placeholder="SEARCH BY NAME, COMPANY, OR EMAIL..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-zinc-200 pl-12 pr-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none shadow-sm"
                        />
                    </div>
                </div>

                {/* FULL WIDTH GRID FOR CLIENT LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.length === 0 ? (
                        <div className="col-span-full p-10 text-center border border-dashed border-zinc-200 rounded-[24px] bg-zinc-50">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">No entities found.</p>
                        </div>
                    ) : (
                        filteredClients.map(client => (
                            <div 
                                key={client.id} 
                                onClick={() => {
                                    setSelectedClient(client);
                                    fetchClientDetails(client.id);
                                    setIsEditingProfile(false);
                                }}
                                className="p-6 rounded-[24px] border bg-white border-zinc-200 hover:border-black hover:shadow-lg cursor-pointer transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg tracking-tight truncate pr-4 text-black">{client.company_name || client.full_name}</h3>
                                        <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-100">Active</span>
                                    </div>
                                    {client.company_name && <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4 truncate">{client.full_name}</p>}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                        <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-600">{client.access_code}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); sendKeyByEmail(client.email, client.access_code); }}
                                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors"
                                            title="Send Key via Email"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); copyToClipboard(client.access_code, client.id); }}
                                            className={`p-2 rounded-lg transition-colors ${copiedKeyId === client.id ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
                                            title="Copy Key"
                                        >
                                            {copiedKeyId === client.id ? (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                            ) : (
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <footer className="mt-24 pb-10 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-zinc-300">Novatrum // Entity Management</p>
                </footer>
            </main>
            
            {/* CENTERED MODAL: CLIENT DETAILS (DOSSIER) */}
            <AnimatePresence>
                {selectedClient && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-zinc-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.95, y: 20 }} 
                            className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="px-8 md:px-10 py-6 md:py-8 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0 sticky top-0 z-10">
                                <div>
                                    <h2 className="text-3xl font-light tracking-tight text-black mb-1">{selectedClient.company_name || selectedClient.full_name}</h2>
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">Authenticated Node</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setIsEditingProfile(!isEditingProfile)} className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors border ${isEditingProfile ? 'bg-zinc-100 border-zinc-200 text-black' : 'bg-white border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-50'}`}>
                                        {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                                    </button>
                                    <button onClick={() => handleTerminateOrArchive('archive')} className="px-4 py-2 bg-white border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors shadow-sm">
                                        Archive
                                    </button>
                                    <button onClick={() => handleTerminateOrArchive('terminate')} className="px-4 py-2 bg-red-600 border border-red-700 text-white hover:bg-red-700 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors shadow-sm flex items-center gap-1.5">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg> Terminate
                                    </button>
                                    <button onClick={() => setSelectedClient(null)} className="ml-2 p-2 bg-zinc-100 text-zinc-500 hover:text-black hover:bg-zinc-200 rounded-full transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body (Scrollable) */}
                            <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar flex-1 bg-zinc-50 space-y-10">
                                
                                {/* 1. PROFILE SECTION */}
                                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
                                    {isEditingProfile ? (
                                        <form onSubmit={handleUpdateProfile} className="space-y-5 animate-in fade-in">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Full Name</label>
                                                    <input required type="text" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-black" />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Email Address</label>
                                                    <input required type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-black" />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Company Name</label>
                                                    <input type="text" value={editForm.company_name} onChange={e => setEditForm({...editForm, company_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-black" />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Address</label>
                                                    <input type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-black" />
                                                </div>
                                                <div className="sm:col-span-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                    <div>
                                                        <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">Access Key</label>
                                                        <p className="text-sm font-mono font-medium text-black tracking-widest">{editForm.access_code}</p>
                                                    </div>
                                                    <button type="button" onClick={handleRegenerateKey} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:border-black rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all">
                                                        Regenerate Key
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="pt-4 flex justify-end">
                                                <button type="submit" disabled={isSavingProfile} className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                                    {isSavingProfile ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Save Changes'}
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 animate-in fade-in">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Primary Contact</p>
                                                <p className="text-sm font-medium text-black">{selectedClient.full_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Email</p>
                                                <div className="flex items-center gap-2">
                                                    <a href={`mailto:${selectedClient.email}`} className="text-sm font-medium text-black hover:underline">{selectedClient.email}</a>
                                                </div>
                                            </div>
                                            {selectedClient.address && (
                                                <div className="sm:col-span-2">
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Address</p>
                                                    <p className="text-sm font-medium text-black">{selectedClient.address}</p>
                                                </div>
                                            )}
                                            <div className="sm:col-span-2 pt-4">
                                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Internal Note (Private)</p>
                                                <div className="relative">
                                                    <textarea 
                                                        value={internalNote}
                                                        onChange={(e) => setInternalNote(e.target.value)}
                                                        placeholder="Add private notes about this client..."
                                                        className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black min-h-[100px] resize-y custom-scrollbar"
                                                    />
                                                    <button 
                                                        onClick={handleSaveNote}
                                                        disabled={savingNote || internalNote === selectedClient.internal_notes}
                                                        className="absolute bottom-4 right-4 bg-black text-white px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-md disabled:opacity-0 disabled:pointer-events-none"
                                                    >
                                                        {savingNote ? 'Saving...' : 'Save Note'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* 2. VAULT (FILES) */}
                                    <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col">
                                        <div className="flex items-center justify-between gap-4 mb-8 border-b border-zinc-100 pb-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Secure Vault</h3>
                                            <div>
                                                <input type="file" id="file-upload" className="hidden" onChange={(e) => handleFileUpload(e, 'file')} />
                                                <label htmlFor="file-upload" className={`cursor-pointer px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 border ${uploading ? 'bg-zinc-100 border-zinc-200 text-zinc-400 pointer-events-none' : 'bg-black text-white border-black hover:bg-zinc-800'}`}>
                                                    {uploading ? <span className="w-3 h-3 border-2 border-t-transparent border-current rounded-full animate-spin" /> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>}
                                                    Upload
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3 flex-1">
                                            {clientFiles.length === 0 ? (
                                                <div className="py-10 text-center border border-dashed rounded-[20px] border-zinc-200 bg-zinc-50 h-full flex items-center justify-center">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Vault is empty.</p>
                                                </div>
                                            ) : (
                                                clientFiles.map(file => (
                                                    <div key={file.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors gap-4">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-black truncate">{file.file_name}</p>
                                                            <p className="text-[8px] font-bold font-mono uppercase tracking-widest text-zinc-400 mt-1">{new Date(file.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <a href={file.file_url} target="_blank" rel="noreferrer" className="p-2 bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></a>
                                                            <button onClick={() => handleDeleteFile(file.id, file.file_url, 'file')} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. LEDGER (INVOICES) */}
                                    <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm flex flex-col">
                                        <div className="flex items-center justify-between gap-4 mb-8 border-b border-zinc-100 pb-4">
                                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Financial Ledger</h3>
                                            <div>
                                                <input type="file" id="invoice-upload" className="hidden" accept=".pdf" onChange={(e) => handleFileUpload(e, 'invoice')} />
                                                <label htmlFor="invoice-upload" className={`cursor-pointer px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 border ${uploadingInvoice ? 'bg-zinc-100 border-zinc-200 text-zinc-400 pointer-events-none' : 'bg-black text-white border-black hover:bg-zinc-800'}`}>
                                                    {uploadingInvoice ? <span className="w-3 h-3 border-2 border-t-transparent border-current rounded-full animate-spin" /> : <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>}
                                                    Upload
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-3 flex-1">
                                            {clientInvoices.length === 0 ? (
                                                <div className="py-10 text-center border border-dashed rounded-[20px] border-zinc-200 bg-zinc-50 h-full flex items-center justify-center">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Ledger is empty.</p>
                                                </div>
                                            ) : (
                                                clientInvoices.map(invoice => (
                                                    <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-black truncate">{invoice.file_name}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : invoice.status === 'unpaid' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                                                                    {invoice.status}
                                                                </span>
                                                                <span className="text-[8px] font-bold font-mono uppercase tracking-widest text-zinc-400">{new Date(invoice.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <a href={invoice.file_url} target="_blank" rel="noreferrer" className="p-2 bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></a>
                                                            <button onClick={() => handleDeleteFile(invoice.id, invoice.file_url, 'invoice')} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ADD CLIENT MODAL */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white border border-zinc-200 shadow-2xl rounded-[40px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 shrink-0">
                                <div>
                                    <h2 className="text-2xl font-light tracking-tight text-zinc-900">Register Entity</h2>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Create a new secure workspace</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100 appearance-none">
                                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                                <form id="addClientForm" onSubmit={handleCreateClient} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Full Name (Primary Contact) *</label>
                                            <input required type="text" value={addForm.full_name} onChange={e => setAddForm({...addForm, full_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="e.g. Jane Doe" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Email Address *</label>
                                            <input required type="email" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="jane@company.com" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Company Name</label>
                                            <input type="text" value={addForm.company_name} onChange={e => setAddForm({...addForm, company_name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="Optional" />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Billing Address</label>
                                            <input type="text" value={addForm.address} onChange={e => setAddForm({...addForm, address: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" placeholder="Optional" />
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex gap-4 items-start">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-800 mb-1">Secure 12-Digit Access Key Generated Automatically</h4>
                                            <p className="text-[10px] font-medium text-emerald-600 leading-relaxed">A unique, highly secure 12-character cryptographic key (Format: XXXX-XXXX-XXXX) will be generated for this entity upon registration. This key grants them access to their secure workspace.</p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            
                            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3 shrink-0">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors">Cancel</button>
                                <button type="submit" form="addClientForm" disabled={isAddingClient} className="bg-black text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                    {isAddingClient ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Register Entity'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* YENİ: ARCHIVE WARNING MODAL (ÇAKIŞMA DURUMUNDA AÇILIR) */}
            <AnimatePresence>
                {archiveWarningClient && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white border border-zinc-200 shadow-2xl rounded-[32px] w-full max-w-md overflow-hidden flex flex-col">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-amber-50 rounded-full border-4 border-amber-100 flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <h2 className="text-2xl font-light tracking-tight text-zinc-900 mb-2">Entity Found in Archive</h2>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed">
                                    This email is associated with a previously archived entity. Do you want to proceed and create a new active workspace for this email?
                                </p>
                            </div>
                            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-center gap-3">
                                <button onClick={() => setArchiveWarningClient(null)} className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors">Cancel</button>
                                <button onClick={() => proceedWithCreation(archiveWarningClient.id)} disabled={isAddingClient} className="bg-black text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                    {isAddingClient ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : 'Continue Anyway'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e4e4e7; border-radius: 20px; }
            `}} />
        </div>
    );
}