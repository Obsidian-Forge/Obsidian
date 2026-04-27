"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send, Trash2, X, Paperclip, Save, Edit, RefreshCw } from 'lucide-react';

const SIGNATURES = {
    EN: "Best regards,\n\nYasin Can Koç | Founder & Digital Architect at Novatrum",
    NL: "Met vriendelijke groet,\n\nYasin Can Koç | Oprichter & Digitaal Architect bij Novatrum",
    FR: "Cordialement,\n\nYasin Can Koç | Fondateur & Architecte Numérique chez Novatrum",
    TR: "Saygılarımla,\n\nYasin Can Koç | Kurucu & Dijital Mimar, Novatrum"
};

export default function EmailEnginePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [emails, setEmails] = useState<any[]>([]);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'sent' | 'drafts'>('drafts');
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewEmail, setViewEmail] = useState<any | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        senderName: 'Yasin Can Koç | Novatrum',
        from: 'yasin@novatrum.eu',
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        content: '',
        signature: SIGNATURES.EN,
        attachments: [] as { name: string, url: string }[]
    });

    const SENDER_OPTIONS = [
        "Yasin Can Koç | Novatrum",
        "Novatrum Engineering",
        "Novatrum Support",
        "Novatrum Billing"
    ];

    useEffect(() => { fetchHistory(); }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Hem gönderilenleri hem taslakları çekiyoruz
    async function fetchHistory() {
        const [sentRes, draftRes] = await Promise.all([
            supabase.from('sent_emails').select('*').order('created_at', { ascending: false }),
            supabase.from('email_drafts').select('*').order('created_at', { ascending: false })
        ]);
        if (sentRes.data) setEmails(sentRes.data);
        if (draftRes.data) setDrafts(draftRes.data);
    }

    const clearForm = () => {
        setFormData(prev => ({
            ...prev,
            to: '', cc: '', bcc: '', subject: '', content: '', signature: SIGNATURES.EN, attachments: []
        }));
        setCurrentDraftId(null);
    };

    // Dosya Yükleme (Vault Bucket)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `emails/${Date.now()}_${safeName}`;
        
        try {
            const { error: uploadError } = await supabase.storage.from('vault').upload(filePath, file);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('vault').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, attachments: [...prev.attachments, { name: file.name, url: publicUrl }] }));
        } catch (error: any) {
            showToast("Upload failed. Ensure 'vault' bucket exists.", "error");
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const preparePayload = () => {
        return {
            sender_name: formData.senderName,
            reply_to: formData.from,
            to_emails: formData.to.split(',').map(e => e.trim()).filter(Boolean),
            cc_emails: formData.cc ? formData.cc.split(',').map(e => e.trim()).filter(Boolean) : [],
            bcc_emails: formData.bcc ? formData.bcc.split(',').map(e => e.trim()).filter(Boolean) : [],
            subject: formData.subject,
            content: formData.content,
            signature: formData.signature,
            attachments: formData.attachments
        };
    };

    // --- TASLAK (DRAFT) KAYDETME ---
    async function handleSaveDraft() {
        if (!formData.subject && !formData.to) {
            return showToast("Provide at least a subject or recipient to save a draft.", "error");
        }
        
        setSavingDraft(true);
        const payload = preparePayload();

        try {
            if (currentDraftId) {
                // Mevcut taslağı güncelle
                const { error } = await supabase.from('email_drafts').update(payload).eq('id', currentDraftId);
                if (error) throw error;
                showToast("Draft updated successfully.");
            } else {
                // Yeni taslak oluştur
                const { data, error } = await supabase.from('email_drafts').insert([payload]).select().single();
                if (error) throw error;
                setCurrentDraftId(data.id);
                showToast("Saved as new draft.");
            }
            fetchHistory();
            setActiveTab('drafts');
        } catch (err: any) {
            showToast(err.message, "error");
        } finally {
            setSavingDraft(false);
        }
    }

    // --- TASLAĞI FORMA YÜKLEME ---
    const loadDraft = (draft: any) => {
        setFormData({
            senderName: draft.sender_name || 'Yasin Can Koç | Novatrum',
            from: draft.reply_to || 'yasin@novatrum.eu',
            to: Array.isArray(draft.to_emails) ? draft.to_emails.join(', ') : '',
            cc: Array.isArray(draft.cc_emails) ? draft.cc_emails.join(', ') : '',
            bcc: Array.isArray(draft.bcc_emails) ? draft.bcc_emails.join(', ') : '',
            subject: draft.subject || '',
            content: draft.content || '',
            signature: draft.signature || SIGNATURES.EN,
            attachments: draft.attachments || []
        });
        setCurrentDraftId(draft.id);
        showToast("Draft loaded into workspace.");
    };

    // --- E-POSTA GÖNDERME ---
    async function handleSend() {
        if (!formData.to || !formData.subject || !formData.content) {
            return showToast("To, Subject and Message are required to dispatch!", "error");
        }
        
        setLoading(true);
        const payload = preparePayload();
        
        try {
            const res = await fetch('/api/email-maker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ...formData, 
                    to: payload.to_emails, 
                    cc: payload.cc_emails.length > 0 ? payload.cc_emails : undefined, 
                    bcc: payload.bcc_emails.length > 0 ? payload.bcc_emails : undefined 
                })
            });

            if (res.ok) {
                showToast("Email dispatched securely.");
                // Eğer gönderilen mail bir taslaksa, veritabanından taslağı sil
                if (currentDraftId) {
                    await supabase.from('email_drafts').delete().eq('id', currentDraftId);
                }
                
                clearForm();
                fetchHistory();
                setActiveTab('sent');
            } else {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to dispatch email");
            }
        } catch (err: any) {
            showToast(err.message, "error");
        } finally {
            setLoading(false);
        }
    }

    // --- SİLME İŞLEMLERİ ---
    async function deleteLog(id: string, isDraft: boolean) {
        if (!confirm(`Delete this ${isDraft ? 'draft' : 'log'}?`)) return;
        const table = isDraft ? 'email_drafts' : 'sent_emails';
        
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (!error) {
            if (isDraft) {
                setDrafts(drafts.filter(e => e.id !== id));
                if (currentDraftId === id) clearForm();
            } else {
                setEmails(emails.filter(e => e.id !== id));
            }
            showToast("Record erased.");
            if (viewEmail?.id === id) setViewEmail(null);
        }
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans pb-20">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl border flex items-center gap-2 backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Email Modal */}
            <AnimatePresence>
                {viewEmail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                                <div>
                                    <h3 className="font-bold text-lg">{viewEmail.subject || "No Subject"}</h3>
                                    <p className="text-[10px] font-mono text-zinc-500 mt-1">To: {viewEmail.to_emails?.join ? viewEmail.to_emails.join(', ') : viewEmail.to_emails}</p>
                                </div>
                                <button onClick={() => setViewEmail(null)} className="p-2 bg-white rounded-xl border border-zinc-200 text-zinc-400 hover:text-black"><X size={16}/></button>
                            </div>
                            <div className="p-8 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                                {viewEmail.content}
                                <p className="mt-8 italic text-zinc-500">{viewEmail.signature}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto p-6 md:p-12 relative z-10">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-200 pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black">Email Engine</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Protocol Dispatch System</p>
                    </div>
                    <button onClick={() => router.push('/admin')} className="px-6 py-3 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 shadow-sm hover:text-black transition-all flex items-center gap-2">
                        <ArrowLeft size={14}/> Command Center
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    
                    {/* Compose Bölümü */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-200 shadow-sm space-y-6">
                            
                            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                                <h3 className="text-[11px] font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2">
                                    {currentDraftId ? <><Edit size={16} className="text-amber-500"/> Editing Draft</> : <><Mail size={16}/> New Message</>}
                                </h3>
                                {currentDraftId && (
                                    <button onClick={clearForm} className="text-[9px] font-bold uppercase text-zinc-400 hover:text-black flex items-center gap-1 transition-colors">
                                        <RefreshCw size={12}/> Clear Workspace
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Sender Profile</label>
                                    <select value={formData.senderName} onChange={e => setFormData({ ...formData, senderName: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm outline-none cursor-pointer focus:border-black transition-colors">
                                        {SENDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Reply-To Address</label>
                                    <input value={formData.from} onChange={e => setFormData({ ...formData, from: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm outline-none focus:border-black transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Recipient(s) (Comma separated)</label>
                                <input value={formData.to} onChange={e => setFormData({ ...formData, to: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm outline-none focus:border-black transition-colors" />
                            </div>

                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Subject</label>
                                <input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-bold outline-none focus:border-black transition-colors" />
                            </div>

                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Message Content</label>
                                <textarea rows={8} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm outline-none resize-none focus:border-black transition-colors" />
                            </div>

                            {/* SIGNATURE SECTION ADDED HERE */}
                            <div>
                                <div className="flex justify-between items-end mb-2 ml-1">
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block">Signature</label>
                                    <div className="flex gap-2">
                                        {(Object.keys(SIGNATURES) as Array<keyof typeof SIGNATURES>).map(lang => (
                                            <button 
                                                key={lang} 
                                                type="button" 
                                                onClick={() => setFormData(prev => ({ ...prev, signature: SIGNATURES[lang] }))}
                                                className={`text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-md border transition-colors ${formData.signature === SIGNATURES[lang] ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea rows={3} value={formData.signature} onChange={e => setFormData({ ...formData, signature: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm outline-none resize-none focus:border-black transition-colors" />
                            </div>

                            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-[9px] font-bold uppercase tracking-widest text-zinc-600 flex items-center gap-2 hover:border-zinc-300 transition-colors shadow-sm">
                                        <Paperclip size={12}/> Attach
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                </div>
                                <span className="text-[9px] font-bold uppercase text-zinc-400">{formData.attachments.length} files attached</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={handleSaveDraft} disabled={savingDraft} className="w-full bg-white border border-zinc-200 text-zinc-600 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-sm flex items-center justify-center gap-2 hover:border-black hover:text-black transition-all disabled:opacity-50">
                                    {savingDraft ? "Saving..." : <><Save size={14}/> Save Draft</>}
                                </button>
                                <button onClick={handleSend} disabled={loading} className="w-full bg-black text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50">
                                    {loading ? "Transmitting..." : <><Send size={14}/> Dispatch Email</>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dispatch Log & Drafts (Right Column) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-200 shadow-sm h-full max-h-[850px] flex flex-col">
                            
                            {/* Tabs */}
                            <div className="flex bg-zinc-50 p-1.5 rounded-2xl w-full mb-6 border border-zinc-100">
                                <button onClick={() => setActiveTab('drafts')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'drafts' ? 'bg-white text-black shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-black'}`}>
                                    Drafts ({drafts.length})
                                </button>
                                <button onClick={() => setActiveTab('sent')} className={`flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'sent' ? 'bg-white text-black shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-black'}`}>
                                    Sent ({emails.length})
                                </button>
                            </div>

                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                                {activeTab === 'drafts' ? (
                                    drafts.length === 0 ? (
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest text-center py-10 border border-dashed border-zinc-100 rounded-3xl">No drafts stored.</p>
                                    ) : (
                                        drafts.map(draft => (
                                            <div key={draft.id} onClick={() => loadDraft(draft)} className={`group bg-zinc-50 border p-5 rounded-3xl cursor-pointer hover:border-black transition-all relative ${currentDraftId === draft.id ? 'border-zinc-400' : 'border-zinc-100'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[9px] font-bold bg-white border border-zinc-200 px-2 py-1 rounded-md text-amber-600 flex items-center gap-1"><Edit size={10}/> DRAFT</span>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteLog(draft.id, true); }} className="text-zinc-300 hover:text-red-500 bg-white p-1.5 rounded-lg border border-zinc-200 transition-colors"><Trash2 size={12}/></button>
                                                </div>
                                                <h4 className="font-bold text-sm text-zinc-900 truncate mb-1">{draft.subject || "No Subject"}</h4>
                                                <p className="text-[10px] font-mono text-zinc-500 truncate">{draft.to_emails?.join ? draft.to_emails.join(', ') : draft.to_emails || 'No Recipient'}</p>
                                            </div>
                                        ))
                                    )
                                ) : (
                                    emails.length === 0 ? (
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest text-center py-10 border border-dashed border-zinc-100 rounded-3xl">No dispatches recorded.</p>
                                    ) : (
                                        emails.map(email => (
                                            <div key={email.id} onClick={() => setViewEmail(email)} className="group bg-white border border-zinc-100 p-5 rounded-3xl cursor-pointer hover:border-black transition-all relative shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[9px] font-bold bg-zinc-50 border border-zinc-200 px-2 py-1 rounded-md text-zinc-500">{new Date(email.created_at).toLocaleDateString()}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); deleteLog(email.id, false); }} className="text-zinc-300 hover:text-red-500 bg-zinc-50 p-1.5 rounded-lg border border-zinc-200 transition-colors"><Trash2 size={12}/></button>
                                                </div>
                                                <h4 className="font-bold text-sm text-zinc-900 truncate mb-1">{email.subject}</h4>
                                                <p className="text-[10px] font-mono text-zinc-500 truncate">{email.to_emails?.join ? email.to_emails.join(', ') : email.to_emails}</p>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}