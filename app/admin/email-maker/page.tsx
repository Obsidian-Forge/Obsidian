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

    // YENİ: VIEW MODAL (ÖNİZLEME) VE EXPORT STATES
    const [viewEmail, setViewEmail] = useState<any | null>(null);
    const [exportOpen, setExportOpen] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

    const [lang, setLang] = useState('EN');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        senderName: 'Novatrum Engineering',
        from: 'yasin@novatrum.eu',
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        content: '',
        signature: 'Best regards,\n\nYasin Can Koç | Founder & Digital Architect at Novatrum',
        attachments: [] as { name: string, url: string }[]
    });

    useEffect(() => { fetchHistory(); }, []);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    async function fetchHistory() {
        const { data } = await supabase.from('sent_emails').select('*').order('created_at', { ascending: false });
        if (data) setEmails(data);
    }

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

    const handleLangChange = (newLang: string) => {
        setLang(newLang);
        let newSignature = '';

        if (newLang === 'EN') newSignature = 'Best regards,\n\nYasin Can Koç | Founder & Digital Architect at Novatrum';
        if (newLang === 'FR') newSignature = 'Cordialement,\n\nYasin Can Koç | Fondateur & Architecte Digital chez Novatrum';
        if (newLang === 'NL') newSignature = 'Met vriendelijke groet,\n\nYasin Can Koç | Oprichter & Digitaal Architect bij Novatrum';
        if (newLang === 'TR') newSignature = 'Saygılarımla,\n\nYasin Can Koç | Kurucu & Dijital Mimar, Novatrum';

        setFormData(prev => ({ ...prev, signature: newSignature }));
    };

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

    // YENİ: Akıllı Yapıştırma (Gemini/ChatGPT format koruyucu)
    const handleMessagePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const html = e.clipboardData.getData('text/html');

        // Eğer kopyalanan metin HTML barındırıyorsa (Yapay zeka araçları vs.)
        if (html) {
            e.preventDefault(); // Tarayıcının metni sıkıştırmasını engelle

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 1. Paragrafların sonuna çift satır boşluğu (\n\n) ekle
            doc.body.querySelectorAll('p').forEach(p => {
                p.appendChild(document.createTextNode('\n\n'));
            });

            // 2. Madde işaretlerinin sonuna tek boşluk (\n) ekle (araları gereksiz açılmasın)
            doc.body.querySelectorAll('li').forEach(li => {
                li.appendChild(document.createTextNode('\n'));
            });

            // 3. Standart <br> etiketlerini satır atlamaya çevir
            doc.body.querySelectorAll('br').forEach(br => br.replaceWith('\n'));

            // Metni temizle: Art arda gelen 3'ten fazla boş satırı 2'ye düşür
            let formattedText = doc.body.innerText.replace(/\n{3,}/g, '\n\n').trim();

            // Metni tam olarak imlecin (cursor) olduğu noktaya yapıştır
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const currentContent = formData.content;

            const newContent = currentContent.substring(0, start) + formattedText + currentContent.substring(end);

            setFormData(prev => ({ ...prev, content: newContent }));

            // İmleci yapıştırılan metnin sonuna taşı
            setTimeout(() => {
                target.selectionStart = target.selectionEnd = start + formattedText.length;
            }, 0);
        }
    };

    const removeAttachment = (index: number) => {
        setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
    };

    async function handleSend() {
        if (!formData.to || !formData.subject || !formData.content) return showToast("To, Subject and Message are required!", "error");

        setLoading(true);
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
            if (viewEmail && viewEmail.id === deleteModalId) setViewEmail(null); // Açıkken silinirse kapat
        } else {
            showToast("Error deleting log.", "error");
        }
        setDeleteModalId(null);
    }

    // YENİ: DOSYA İNDİRME / EXPORT FONKSİYONLARI
    const handleExport = (format: 'txt' | 'html' | 'pdf') => {
        if (!viewEmail) return;

        if (format === 'txt') {
            const textContent = `Date: ${new Date(viewEmail.created_at).toLocaleString()}\nFrom: ${viewEmail.from_email}\nTo: ${viewEmail.to_emails?.join(', ')}\nSubject: ${viewEmail.subject}\n\n${viewEmail.content}\n\n${viewEmail.signature}`;
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Novatrum_Email_${viewEmail.id.slice(0, 6)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }

        if (format === 'html' || format === 'pdf') {
            const htmlContent = `
                <html>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #18181b; max-width: 700px; margin: 0 auto;">
                    <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #e4e4e7;">
                        <p style="margin: 0 0 5px 0; color: #71717a; font-size: 13px;"><strong>Date:</strong> ${new Date(viewEmail.created_at).toLocaleString()}</p>
                        <p style="margin: 0 0 5px 0; color: #71717a; font-size: 13px;"><strong>From:</strong> ${viewEmail.from_email}</p>
                        <p style="margin: 0 0 5px 0; color: #71717a; font-size: 13px;"><strong>To:</strong> ${viewEmail.to_emails?.join(', ')}</p>
                        <h2 style="margin: 15px 0 0 0; font-size: 20px;">Subject: ${viewEmail.subject}</h2>
                    </div>
                    <div style="text-align: center; margin-bottom: 40px;">
                        <h1 style="font-size: 26px; letter-spacing: -0.05em; margin: 0; font-weight: 600; color: #000;">NOVATRUM</h1>
                    </div>
                    <div style="line-height: 1.7; font-size: 15px; white-space: pre-wrap;">
                        ${viewEmail.content}
                        <br/><br/>
                        <span style="font-style: italic; color: #71717a;">${viewEmail.signature}</span>
                    </div>
                </body>
                </html>
            `;

            if (format === 'html') {
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Novatrum_Email_${viewEmail.id.slice(0, 6)}.html`;
                a.click();
                URL.revokeObjectURL(url);
            }

            if (format === 'pdf') {
                const printWin = window.open('', '', 'width=800,height=800');
                if (printWin) {
                    printWin.document.write(htmlContent);
                    printWin.document.close();
                    printWin.focus();
                    setTimeout(() => {
                        printWin.print();
                        printWin.close();
                    }, 250);
                }
            }
        }
        setExportOpen(false);
    };

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
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-white/60 backdrop-blur-md">
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

            {/* YENİ: EMAIL PREVIEW (ÖNİZLEME) MODAL */}
            <AnimatePresence>
                {viewEmail && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-zinc-900/30 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 40, scale: 0.98 }} className="bg-white w-full max-w-4xl h-[90vh] rounded-[32px] shadow-2xl flex flex-col overflow-hidden relative">

                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/50">
                                <div className="flex flex-col">
                                    <h2 className="text-xl font-bold text-zinc-900 truncate pr-4">{viewEmail.subject}</h2>
                                    <p className="text-xs font-mono text-zinc-500 mt-1">To: {viewEmail.to_emails?.join(', ')}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Custom Dropdown for Downloads */}
                                    <div className="relative">
                                        <button onClick={() => setExportOpen(!exportOpen)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-black hover:border-black transition-all shadow-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            Export
                                        </button>
                                        <AnimatePresence>
                                            {exportOpen && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden z-50">
                                                    <button onClick={() => handleExport('pdf')} className="w-full text-left px-5 py-3.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors border-b border-zinc-100">Save as PDF</button>
                                                    <button onClick={() => handleExport('html')} className="w-full text-left px-5 py-3.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors border-b border-zinc-100">Download .HTML</button>
                                                    <button onClick={() => handleExport('txt')} className="w-full text-left px-5 py-3.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black transition-colors">Download .TXT</button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <button onClick={() => setViewEmail(null)} className="w-10 h-10 flex items-center justify-center bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-black hover:border-black transition-all shadow-sm">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </div>

                            {/* Email Visual Preview (Resend Style) */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 bg-white">
                                <div className="max-w-[600px] mx-auto text-[#18181b] font-sans">

                                    <div className="py-10 border-b border-zinc-200 text-center flex justify-center items-center gap-5">
                                        <img src="https://novatrum.eu/logo.png" alt="N." className="h-9 pointer-events-none opacity-90" />
                                        <h1 className="text-[28px] tracking-[-0.05em] m-0 font-semibold text-black leading-none">NOVATRUM</h1>
                                    </div>

                                    <div className="py-10 text-[15px] leading-[1.8] whitespace-pre-wrap text-zinc-800">
                                        {viewEmail.content}
                                        <p className="mt-10 italic text-zinc-500 whitespace-pre-wrap">{viewEmail.signature}</p>
                                    </div>

                                    <div className="p-6 mt-6 bg-[#fafafa] rounded-2xl text-xs text-zinc-500 border border-zinc-100">
                                        <p className="m-0 font-bold text-[#18181b] tracking-[0.05em] uppercase">NOVATRUM ENGINEERING</p>
                                        <p className="my-1.5">Scalable Web Infrastructure & Systems Architecture</p>
                                        <p className="mt-3 flex items-center gap-2">
                                            <span className="text-black border-b border-zinc-200 pb-0.5">novatrum.eu</span>
                                            <span className="text-zinc-300">|</span>
                                            <span className="text-black border-b border-zinc-200 pb-0.5">LinkedIn</span>
                                        </p>
                                    </div>

                                </div>
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

                    {/* Compose Bölümü */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-200 shadow-sm space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Sender Name</label>
                                    <input value={formData.senderName} onChange={e => setFormData({ ...formData, senderName: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">From Email</label>
                                    <input value={formData.from} onChange={e => setFormData({ ...formData, from: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>

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
                                    <input value={formData.cc} onChange={e => setFormData({ ...formData, cc: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">BCC</label>
                                    <input value={formData.bcc} onChange={e => setFormData({ ...formData, bcc: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Subject</label>
                                <input value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all appearance-none" />
                            </div>

                            <div>
                                <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 block mb-2 ml-1">Message</label>
                                <textarea
                                    rows={10}
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    onPaste={handleMessagePaste}
                                    className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all resize-none appearance-none"
                                />                            </div>

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
                                <textarea rows={4} value={formData.signature} onChange={e => setFormData({ ...formData, signature: e.target.value })} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-2xl text-sm text-zinc-500 italic outline-none focus:border-black transition-all resize-none appearance-none" />                            </div>

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

                    {/* Sent Log Bölümü */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 md:p-10 rounded-[40px] border border-zinc-200 shadow-sm h-full max-h-[1000px] flex flex-col">
                            <h2 className="text-xl font-light tracking-tight mb-6">Sent Log</h2>

                            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                                {emails.length === 0 && <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-center py-10">No outgoing transmissions.</p>}

                                {emails.map((email) => (
                                    <motion.div
                                        key={email.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        // YENİ: Tıklandığında Modal'ı Aç
                                        onClick={() => setViewEmail(email)}
                                        className="group bg-zinc-50 border border-zinc-100 p-5 rounded-3xl hover:border-black transition-all relative shadow-sm cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-[9px] font-bold bg-white border border-zinc-200 px-2 py-1 rounded-md text-zinc-500 shadow-sm">{new Date(email.created_at).toLocaleDateString()}</span>
                                            {/* YENİ: e.stopPropagation() eklendi ki çöpe basınca Modal açılmasın */}
                                            <button onClick={(e) => { e.stopPropagation(); setDeleteModalId(email.id); }} className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-white p-1.5 rounded-lg shadow-sm border border-zinc-200">
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