"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmailMakerPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [emails, setEmails] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // CUSTOM POPUP (TOAST & MODAL) STATES
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

    // Dil ve Autocomplete State'leri
    const [lang, setLang] = useState('EN');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        senderName: 'Novatrum Engineering',
        from: 'info@novatrum.eu',
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        content: '',
        signature: 'Best regards,\nYasin Can Koc | Novatrum',
        attachments: [] as { name: string, url: string }[]
    });

    useEffect(() => { fetchHistory(); }, []);

    // --- POPUP FONKSİYONLARI ---
    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    async function fetchHistory() {
        const { data } = await supabase.from('sent_emails').select('*').order('created_at', { ascending: false });
        if (data) setEmails(data);
    }

    // --- AUTOCOMPLETE MANTIĞI ---
    const allHistoricalEmails = Array.from(new Set(emails.flatMap(e => e.to_emails || [])));

    const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, to: val });

        const parts = val.split(',');
        const currentSearch = parts[parts.length - 1].trim().toLowerCase();

        if (currentSearch.length > 0) {
            const matches = allHistoricalEmails.filter(email => email.toLowerCase().includes(currentSearch) && email.toLowerCase() !== currentSearch);
            setEmailSuggestions(matches);
            setShowSuggestions(matches.length > 0);
        } else {
            setShowSuggestions(false);
        }
    };

    const acceptSuggestion = (suggestion: string) => {
        const parts = formData.to.split(',');
        parts.pop();
        parts.push(' ' + suggestion);
        const newVal = parts.join(',').trim();
        setFormData({ ...formData, to: newVal + ', ' });
        setShowSuggestions(false);
    };

    // --- DİL DEĞİŞTİRİCİ ---
    const handleLangChange = (newLang: string) => {
        setLang(newLang);
        let newSignature = '';
        if (newLang === 'EN') newSignature = 'Best regards,\nYasin Can Koc | Novatrum';
        if (newLang === 'FR') newSignature = 'Cordialement,\nYasin Can Koc | Novatrum';
        if (newLang === 'NL') newSignature = 'Met vriendelijke groet,\nYasin Can Koc | Novatrum';
        if (newLang === 'TR') newSignature = 'Saygılarımla,\nYasin Can Koc | Novatrum';
        
        setFormData(prev => ({ ...prev, signature: newSignature }));
    };

    // --- DOSYA YÜKLEME VE SİLME ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `email-attachment-${Date.now()}.${fileExt}`;
        const filePath = `email_attachments/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, attachments: [...prev.attachments, { name: file.name, url: publicUrl }] }));
        } catch (error: any) {
            showToast("Upload failed: " + error.message, "error");
        } finally {
            setUploading(false);
        }
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
    };

    // --- GÖNDERME VE LOG SİLME ---
    async function handleSend() {
        if (!formData.to || !formData.subject || !formData.content) return showToast("To, Subject and Message are required!", "error");
        
        setLoading(true);
        // Boş dizileri (.filter(Boolean)) temizleyerek 400 hatasını engelliyoruz
        const toArray = formData.to.split(',').map(e => e.trim()).filter(Boolean);
        const ccArray = formData.cc ? formData.cc.split(',').map(e => e.trim()).filter(Boolean) : undefined;
        const bccArray = formData.bcc ? formData.bcc.split(',').map(e => e.trim()).filter(Boolean) : undefined;

        const res = await fetch('/api/email-maker', {
            method: 'POST',
            body: JSON.stringify({ ...formData, to: toArray, cc: ccArray, bcc: bccArray })
        });

        if (res.ok) {
            showToast("Email Transmitted Successfully!", "success");
            setFormData({ ...formData, to: '', subject: '', content: '', attachments: [] });
            fetchHistory();
        } else {
            const errData = await res.json();
            showToast("Error: " + (errData.error || "Failed to send email."), "error");
        }
        setLoading(false);
    }

    async function confirmDelete() {
        if (!deleteModalId) return;
        const { error } = await supabase.from('sent_emails').delete().eq('id', deleteModalId);
        if (!error) {
            setEmails(emails.filter(e => e.id !== deleteModalId));
            showToast("Log deleted successfully.", "success");
        } else {
            showToast("Error deleting log.", "error");
        }
        setDeleteModalId(null);
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans relative selection:bg-black selection:text-white pb-20">
            
            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-full shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                        {toast.type === 'success' ? (
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        ) : (
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETE CONFIRMATION MODAL */}
            <AnimatePresence>
                {deleteModalId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} className="bg-white border border-zinc-200 shadow-2xl rounded-3xl w-full max-w-sm overflow-hidden flex flex-col">
                            <div className="p-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Log Entry?</h3>
                                <p className="text-xs font-medium text-zinc-500">This action cannot be undone. It will permanently remove this record from the database.</p>
                            </div>
                            <div className="flex border-t border-zinc-100">
                                <button onClick={() => setDeleteModalId(null)} className="flex-1 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest hover:bg-zinc-50 transition-colors border-r border-zinc-100">Cancel</button>
                                <button onClick={confirmDelete} className="flex-1 py-4 text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.25]">
                <div className="absolute inset-0 bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_50%,transparent_100%)] bg-[linear-gradient(#d4d4d8_1px,transparent_1px),linear-gradient(90deg,#d4d4d8_1px,transparent_1px)]" />
            </div>

            <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
                
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-200 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Email Maker</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Professional Outreach System</p>
                    </div>
                    <button onClick={() => router.push('/admin/dashboard')} className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:border-black transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Workspace
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-200 shadow-sm space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Sender Name</label>
                                    <input value={formData.senderName} onChange={e => setFormData({...formData, senderName: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">From Email</label>
                                    <input value={formData.from} onChange={e => setFormData({...formData, from: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>

                                {/* AUTOCOMPLETE RECIPIENT INPUT */}
                                <div className="md:col-span-2 relative">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Recipient (To)</label>
                                    <input 
                                        value={formData.to} 
                                        onChange={handleToChange} 
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                                        placeholder="email1@test.com, email2@test.com" 
                                        className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" 
                                    />
                                    <AnimatePresence>
                                        {showSuggestions && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 w-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar overflow-hidden">
                                                {emailSuggestions.map(sug => (
                                                    <div 
                                                        key={sug} 
                                                        onMouseDown={(e) => { e.preventDefault(); acceptSuggestion(sug); }} 
                                                        className="px-5 py-3.5 hover:bg-zinc-50 cursor-pointer text-sm font-medium transition-colors border-b border-zinc-50 last:border-0 text-zinc-700 hover:text-black flex items-center gap-3"
                                                    >
                                                        <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                                                        {sug}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">CC</label>
                                    <input value={formData.cc} onChange={e => setFormData({...formData, cc: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">BCC</label>
                                    <input value={formData.bcc} onChange={e => setFormData({...formData, bcc: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Subject</label>
                                <input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                            </div>

                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Message</label>
                                <textarea rows={10} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all resize-none appearance-none" />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2 ml-1">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Signature</label>
                                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                                        {['EN', 'NL', 'FR', 'TR'].map(l => (
                                            <button 
                                                key={l}
                                                onClick={() => handleLangChange(l)}
                                                className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-md transition-all ${lang === l ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-black'}`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea rows={2} value={formData.signature} onChange={e => setFormData({...formData, signature: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm text-zinc-500 italic outline-none focus:border-black transition-all resize-none appearance-none" />
                            </div>

                            <div className="pt-4 border-t border-zinc-100">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-3 ml-1">Attachments</label>
                                <div className="space-y-3">
                                    {formData.attachments.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                                            <span className="text-xs font-medium font-mono text-zinc-600 truncate max-w-[70%]">{file.name}</span>
                                            <button onClick={() => removeAttachment(i)} className="text-[9px] font-bold uppercase text-red-500 tracking-widest hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-lg">Remove</button>
                                        </div>
                                    ))}

                                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center bg-zinc-50 hover:border-black transition-all cursor-pointer group">
                                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                        {uploading ? (
                                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-6 h-6 text-zinc-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-black">Add Document / File</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSend} disabled={loading} className="w-full bg-black text-white py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-800 disabled:opacity-50 mt-4 shadow-md active:scale-95 transition-all appearance-none flex items-center justify-center gap-3">
                                {loading ? <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" /> : "Transmit Professional Email"}
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-200 shadow-sm h-full max-h-[1000px] flex flex-col">
                            <h2 className="text-xl font-light tracking-tight mb-6">Sent Log</h2>
                            
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                {emails.length === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center py-10">No outgoing transmissions.</p>}
                                
                                {emails.map((email) => (
                                    <motion.div key={email.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group bg-zinc-50 border border-zinc-100 p-5 rounded-3xl hover:border-black transition-all relative shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[9px] font-bold bg-white border border-zinc-200 px-2 py-1 rounded-md text-zinc-500 shadow-sm">{new Date(email.created_at).toLocaleDateString()}</span>
                                            <button onClick={() => setDeleteModalId(email.id)} className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white p-1.5 rounded-lg shadow-sm border border-zinc-200">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                        <h3 className="font-bold text-sm text-zinc-900 truncate mb-1">{email.subject}</h3>
                                        <p className="text-[10px] text-zinc-500 font-mono truncate">To: {email.to_emails?.join(', ')}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}