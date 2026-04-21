"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Save, LayoutTemplate, Image as ImageIcon, 
    Settings, UploadCloud, Link as LinkIcon
} from 'lucide-react';

export default function NewSaaSModule() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [saving, setSaving] = useState(false);

    // Resim yükleme türü seçimi (URL veya Dosya)
    const [imageUploadType, setImageUploadType] = useState<'url' | 'file'>('url');
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Form Stateleri (Boş Başlangıç)
    const [formData, setFormData] = useState({
        slug: '',
        price: '',
        status: 'coming-soon', // Yeni eklenenler varsayılan olarak yakında olsun
        image_url: '',
        icon_name: 'Box',
        display_order: 99, // En sonda çıkması için yüksek bir değer
        name: '',
        tagline: '',
        description: '',
        features: '' 
    });

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return router.push('/admin/login');
            const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single();
            if (member?.role !== 'admin') return router.push('/client/login');
            setIsAdmin(true);
        };
        checkAdmin();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        // Doğrulama
        if (!formData.slug || !formData.name) {
            return alert("Slug and Module Name are required!");
        }

        setSaving(true);
        let finalImageUrl = formData.image_url;

        // EĞER DOSYA YÜKLENMİŞSE SUPABASE STORAGE'A GÖNDER
        if (imageUploadType === 'file' && imageFile) {
            try {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `module-${Date.now()}.${fileExt}`;
                const filePath = `modules/${fileName}`;

                // 'assets' adında bir bucket olmalı
                const { error: uploadError } = await supabase.storage
                    .from('assets')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                // Yüklenen dosyanın public URL'sini al
                const { data: { publicUrl } } = supabase.storage
                    .from('assets')
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
            } catch (error: any) {
                alert("Image upload failed: " + error.message + "\nMake sure you have an 'assets' bucket in Supabase Storage.");
                setSaving(false);
                return;
            }
        }

        const featuresArray = formData.features.split('\n').filter(f => f.trim() !== '');

        // Content JSON yapısını oluştur
        const newContent = {
            en: {
                name: formData.name,
                tagline: formData.tagline,
                description: formData.description,
                features: featuresArray
            }
        };

        const { error } = await supabase
            .from('modules')
            .insert([{
                slug: formData.slug.toLowerCase().replace(/\s+/g, '-'), // Otomatik slug formatı
                price: formData.price,
                status: formData.status,
                image_url: finalImageUrl,
                icon_name: formData.icon_name,
                display_order: formData.display_order,
                content: newContent
            }]);

        setSaving(false);

        if (error) {
            alert("Error creating module: " + error.message);
        } else {
            router.push('/admin/status'); // Başarılıysa altyapı sayfasına dön
        }
    };

    if (!isAdmin) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">Authenticating...</div>;

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans pb-32">
            <div className="max-w-4xl mx-auto p-6 md:p-12 relative animate-in fade-in duration-700">
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-200 pb-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.push('/admin/status')} className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-full hover:border-black hover:text-black text-zinc-400 transition-all shadow-sm shrink-0">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black">New SaaS Module</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Deploy a new architectural node</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto"
                    >
                        {saving ? <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <Save size={16} />}
                        {saving ? 'Deploying...' : 'Deploy Module'}
                    </button>
                </header>

                <div className="space-y-8">
                    
                    {/* SYSTEM SETTINGS */}
                    <div className="bg-white border border-zinc-200 p-8 rounded-[40px] shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100"><Settings size={20} className="text-zinc-600"/></div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900">System Parameters</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Module Slug (URL ID) *</label>
                                <input type="text" name="slug" required value={formData.slug} onChange={handleChange} placeholder="e.g. ai-assistant" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Monthly Price (€ or Text)</label>
                                <input type="text" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 199 or Tiered" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Initial Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none cursor-pointer appearance-none">
                                    <option value="coming-soon">Coming Soon (Waitlist)</option>
                                    <option value="live">Live (Active)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Display Order</label>
                                <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* CONTENT & DISPLAY */}
                    <div className="bg-white border border-zinc-200 p-8 rounded-[40px] shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100"><LayoutTemplate size={20} className="text-zinc-600"/></div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Content & Display (English)</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Module Name *</label>
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Quantum Analytics" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Tagline</label>
                                    <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="e.g. Data Processing Engine" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Full description of the module..." className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none resize-none" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2 flex items-center gap-2">
                                    Features <span className="text-[8px] text-zinc-400 bg-zinc-200 px-2 py-0.5 rounded-full">(Write each feature on a new line)</span>
                                </label>
                                <textarea name="features" value={formData.features} onChange={handleChange} rows={4} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none resize-y" />
                            </div>
                        </div>
                    </div>

                    {/* VISUALS */}
                    <div className="bg-white border border-zinc-200 p-8 rounded-[40px] shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100"><ImageIcon size={20} className="text-zinc-600"/></div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Visual Assets</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* İKON SEÇİMİ */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Lucide Icon Name</label>
                                <input type="text" name="icon_name" value={formData.icon_name} onChange={handleChange} placeholder="e.g. Network, Cpu, ShieldCheck, Zap" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                            </div>

                            {/* RESİM YÜKLEME ALANI */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Module Image</label>
                                
                                {/* URL mi Dosya mı Switch'i */}
                                <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-200 w-fit">
                                    <button 
                                        onClick={() => setImageUploadType('url')}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${imageUploadType === 'url' ? 'bg-white text-black shadow-sm border border-zinc-200' : 'text-zinc-400 hover:text-black'}`}
                                    >
                                        <LinkIcon size={12}/> URL Link
                                    </button>
                                    <button 
                                        onClick={() => setImageUploadType('file')}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${imageUploadType === 'file' ? 'bg-white text-black shadow-sm border border-zinc-200' : 'text-zinc-400 hover:text-black'}`}
                                    >
                                        <UploadCloud size={12}/> Upload File
                                    </button>
                                </div>

                                {/* Yükleme Alanı Değişimi */}
                                {imageUploadType === 'url' ? (
                                    <input type="text" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://example.com/image.png" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                                ) : (
                                    <div className="w-full bg-zinc-50 border border-dashed border-zinc-300 rounded-[24px] p-6 flex flex-col items-center justify-center text-center relative hover:bg-zinc-100 transition-colors">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        <UploadCloud size={24} className="text-zinc-400 mb-2" />
                                        <p className="text-xs font-medium text-zinc-600">
                                            {imageFile ? imageFile.name : "Click or drag image here"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}