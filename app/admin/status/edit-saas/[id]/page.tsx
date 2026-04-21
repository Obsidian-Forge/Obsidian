"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, Save, LayoutTemplate, Image as ImageIcon, 
    Box, Tag, List, Activity, Settings, UploadCloud, Link as LinkIcon
} from 'lucide-react';

export default function EditSaaSModule() {
    const router = useRouter();
    const params = useParams();
    const moduleId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [moduleData, setModuleData] = useState<any>(null);

    // Resim yükleme türü seçimi (URL veya Dosya)
    const [imageUploadType, setImageUploadType] = useState<'url' | 'file'>('url');
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Form Stateleri
    const [formData, setFormData] = useState({
        slug: '',
        price: '',
        status: 'live',
        image_url: '',
        icon_name: 'Box',
        display_order: 0,
        // Content (İngilizce baz alınarak)
        name: '',
        tagline: '',
        description: '',
        features: '' 
    });

    useEffect(() => {
        const fetchModule = async () => {
            if (!moduleId) return;
            const { data, error } = await supabase.from('modules').select('*').eq('id', moduleId).single();
            
            if (error) {
                alert("Error fetching module!");
                router.push('/admin/status');
                return;
            }

            if (data) {
                setModuleData(data);
                const enContent = data.content?.en || {};
                setFormData({
                    slug: data.slug || '',
                    price: data.price || '',
                    status: data.status || 'live',
                    image_url: data.image_url || '',
                    icon_name: data.icon_name || 'Box',
                    display_order: data.display_order || 0,
                    name: enContent.name || '',
                    tagline: enContent.tagline || '',
                    description: enContent.description || '',
                    features: enContent.features ? enContent.features.join('\n') : ''
                });
            }
            setLoading(false);
        };

        fetchModule();
    }, [moduleId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        let finalImageUrl = formData.image_url;

        // EĞER DOSYA SEÇİLMİŞSE VE YÜKLENİYORSA
        if (imageUploadType === 'file' && imageFile) {
            try {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `module-${Date.now()}.${fileExt}`;
                const filePath = `modules/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('assets')
                    .upload(filePath, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('assets')
                    .getPublicUrl(filePath);

                finalImageUrl = publicUrl;
            } catch (error: any) {
                alert("Image upload failed: " + error.message);
                setSaving(false);
                return;
            }
        }

        const featuresArray = formData.features.split('\n').filter(f => f.trim() !== '');

        const updatedContent = {
            ...moduleData.content,
            en: {
                ...(moduleData.content?.en || {}),
                name: formData.name,
                tagline: formData.tagline,
                description: formData.description,
                features: featuresArray
            }
        };

        const { error } = await supabase
            .from('modules')
            .update({
                slug: formData.slug,
                price: formData.price,
                status: formData.status,
                image_url: finalImageUrl, // Güncellenmiş veya eski resim URL'si
                icon_name: formData.icon_name,
                display_order: formData.display_order,
                content: updatedContent
            })
            .eq('id', moduleId);

        setSaving(false);

        if (error) {
            alert("Error saving module: " + error.message);
        } else {
            router.push('/admin/status');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center font-bold uppercase text-[10px] tracking-widest text-zinc-400">
            <span className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin mb-4" />
            Loading Module Data...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans pb-32">
            <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10 animate-in fade-in duration-700">
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-zinc-200 pb-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => router.push('/admin/status')} className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-full hover:border-black hover:text-black text-zinc-400 transition-all shadow-sm shrink-0">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-light tracking-tight text-black">Edit Module</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">
                                ID: <span className="font-mono text-zinc-400">{moduleId.split('-')[0]}...</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="bg-black hover:bg-zinc-800 text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto"
                    >
                        {saving ? <span className="w-4 h-4 border-2 border-zinc-600 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
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
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Module Slug (URL ID)</label>
                                <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Monthly Price (€ or Text)</label>
                                <input type="text" name="price" value={formData.price} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Public Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none cursor-pointer appearance-none">
                                    <option value="live">Live (Active)</option>
                                    <option value="coming-soon">Coming Soon (Waitlist)</option>
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
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Module Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Nexus CX Module" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Tagline</label>
                                    <input type="text" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="e.g. Client Experience Paradigm" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
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
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Lucide Icon Name</label>
                                <input type="text" name="icon_name" value={formData.icon_name} onChange={handleChange} placeholder="e.g. Network, Cpu, ShieldCheck" className="w-full bg-zinc-50 border border-zinc-200 rounded-[24px] px-6 py-4 text-sm font-medium focus:border-black transition-all outline-none" />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-2">Module Image</label>
                                
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

                        {/* Mevcut resim önizlemesi */}
                        {formData.image_url && imageUploadType === 'url' && (
                            <div className="mt-8 p-4 border border-zinc-200 rounded-[24px] bg-zinc-50 flex flex-col items-center justify-center">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Current Image Preview</p>
                                <img src={formData.image_url} alt="Preview" className="h-40 object-cover rounded-xl shadow-sm border border-zinc-200" />
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}