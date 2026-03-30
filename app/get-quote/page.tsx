"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import { useLanguage } from '../../context/LanguageContext';

// --- SABİT VERİLER VE FİYATLANDIRMA MOTORU ---
const ARCHITECTURE_OPTIONS = [
    { id: "landing", price: 1500, desc: "High-conversion single page presence." },
    { id: "corporate", price: 3500, desc: "Multi-page professional business site." },
    { id: "ecommerce", price: 6000, desc: "Full digital storefront with cart flows." },
    { id: "saas", price: 12000, desc: "Complex custom software & database logic." }
];

const DESIGN_STYLES = [
    { id: "minimal", price: 0, desc: "Focus on whitespace and typography." },
    { id: "bold", price: 500, desc: "High contrast, large typography, edgy." },
    { id: "corporate", price: 0, desc: "Trustworthy, modern corporate structure." },
    { id: "interactive", price: 4000, desc: "Award-winning scroll animations & 3D." }
];

const INTEGRATION_OPTIONS = [
    { id: "stripe", price: 1200, icon: "💳", desc: "Secure payment gateway & subscriptions." },
    { id: "auth", price: 1500, icon: "🔒", desc: "Encrypted user roles and permissions." },
    { id: "crm", price: 1800, icon: "🤝", desc: "Direct sync with Hubspot or Salesforce." },
    { id: "mail", price: 400, icon: "📩", desc: "Automated email & newsletter flows." },
    { id: "analytics", price: 600, icon: "📈", desc: "Granular user behavior tracking." },
    { id: "ai", price: 4500, icon: "🧠", desc: "Custom LLM logic and AI workflows." },
    { id: "sockets", price: 2500, icon: "⚡", desc: "Real-time data and live notifications." },
    { id: "cms", price: 2800, icon: "📝", desc: "Bespoke admin panel for content." },
    { id: "multilang", price: 1200, icon: "🌐", desc: "Full multi-language locale routing." }
];

const TIMELINES = [
    { id: "relaxed", multiplier: 0.9, desc: "Extended delivery. 10% discount applied." },
    { id: "standard", multiplier: 1.0, desc: "Regular agency queue priority." },
    { id: "expedited", multiplier: 1.5, desc: "Fast-tracked delivery. 50% premium applied." },
    { id: "enterprise", multiplier: 1.1, desc: "Mandatory for complex scale architectures." }
];

const MAINTENANCE_OPTIONS = [
    { id: "none", price: 0, title: "No Ongoing Support", desc: "Client assumes full responsibility for security and updates post-launch." },
    { id: "essential", price: 299, title: "Essential", desc: "Proactive security patches, uptime monitoring, and core system updates." },
    { id: "growth", price: 599, title: "Growth", desc: "Essential package + 5 hours of monthly continuous development & UI updates." },
    { id: "scale", price: 999, title: "Scale", desc: "Essential package + 15 hours of monthly development. Your dedicated tech team." }
];

export default function DefinitiveDiscoveryPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const dData = t.discoveryPage;
    const cData = t.calculator;

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [discoveryId, setDiscoveryId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalSteps = 8;

    const [formData, setFormData] = useState({
        companyName: '',
        currentWebsite: '',
        projectGoals: '',
        competitors: '',
        architecture: '',
        estimatedPages: 5,
        designStyle: '',
        primaryColor: '#000000',
        secondaryColor: '#ffffff',
        hasAccentColor: false,
        accentColor: '#f59e0b',
        fontPreference: 'sans-serif',
        needsCopywriting: false,
        uploadedFiles: [] as {name: string, url: string}[],
        selectedIntegrations: [] as string[],
        seoLevel: 'standard', 
        timeline: 'standard', 
        maintenanceTier: 'essential',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        vatNumber: '',
        billingAddress: '',
        designNotes: '',
        acceptedTerms: false
    });

    const isComplexProject = formData.architecture === 'saas' || formData.architecture === 'ecommerce' || formData.estimatedPages > 15;

    useEffect(() => {
        if (isComplexProject) {
            setFormData(prev => ({ ...prev, timeline: 'enterprise' }));
        } else if (formData.timeline === 'enterprise') {
            setFormData(prev => ({ ...prev, timeline: 'standard' }));
        }
    }, [formData.architecture, formData.estimatedPages, isComplexProject]);

    const calculateBaseTotal = () => {
        let total = 0;
        const arch = ARCHITECTURE_OPTIONS.find(a => a.id === formData.architecture);
        if (arch) total += arch.price;
        if (formData.estimatedPages > 5) total += (formData.estimatedPages - 5) * 200;
        if (formData.needsCopywriting) total += 1500;
        const design = DESIGN_STYLES.find(d => d.id === formData.designStyle);
        if (design) total += design.price;
        formData.selectedIntegrations.forEach(intId => {
            const intg = INTEGRATION_OPTIONS.find(i => i.id === intId);
            if (intg) total += intg.price;
        });
        if (formData.seoLevel === 'advanced') total += 1500;

        return total;
    };

    const calculateTotal = () => {
        let total = calculateBaseTotal();
        const time = TIMELINES.find(t => t.id === formData.timeline);
        if (time) total = total * time.multiplier;
        return Math.round(total); 
    };

    const currentMaintenance = MAINTENANCE_OPTIONS.find(m => m.id === formData.maintenanceTier);
    const monthlyPrice = currentMaintenance ? currentMaintenance.price : 0;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `discovery-asset-${Date.now()}.${fileExt}`;
        const filePath = `discovery_uploads/${fileName}`;
        
        try {
            const { error: uploadError } = await supabase.storage.from('client-assets').upload(filePath, file);
            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from('client-assets').getPublicUrl(filePath);
            setFormData(prev => ({
                ...prev,
                uploadedFiles: [...prev.uploadedFiles, { name: file.name, url: publicUrl }]
            }));
        } catch (error: any) {
            alert("File upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFormData(prev => ({ ...prev, uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== indexToRemove) }));
    };

    const downloadClientCopy = async () => {
        setDownloadingPdf(true);
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 90;

        const loadImage = (url: string): Promise<string> => {
            return new Promise((resolve) => {
                const img = new Image(); img.src = url;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.width; canvas.height = img.height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png"));
                };
                img.onerror = () => resolve("");
            });
        };

        const logoData = await loadImage("/logo.png");
        if (logoData) doc.addImage(logoData, 'PNG', 20, 15, 25, 25);
        else { doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.text("NOVATRUM", 20, 25); }

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122);
        doc.text("Premium Software Studio", 20, 45);

        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(24, 24, 27);
        doc.text("BLUEPRINT SPECIFICATIONS", pageWidth - 20, 30, { align: "right" });
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122);
        doc.text(`Ref ID: ${discoveryId}`, pageWidth - 20, 38, { align: "right" });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 44, { align: "right" });

        const checkPageBreak = (addedHeight: number) => {
            if (yPos + addedHeight > 280) {
                doc.addPage();
                yPos = 20;
            }
        };

        const addSectionTitle = (title: string) => {
            checkPageBreak(15);
            doc.setFillColor(244, 244, 245);
            doc.rect(20, yPos - 6, pageWidth - 40, 10, "F");
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(24, 24, 27);
            doc.text(title, 25, yPos);
            yPos += 10;
        };

        const addRow = (label: string, value: string, priceStr: string = "") => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            const splitVal = doc.splitTextToSize(value || "N/A", pageWidth - 110);
            checkPageBreak(splitVal.length * 6);
            
            doc.text(label, 25, yPos);
            doc.setFont("helvetica", "normal");
            doc.text(splitVal, 65, yPos);
            
            if (priceStr) {
                if (priceStr.includes('-')) doc.setTextColor(239, 68, 68);
                else if (priceStr !== "Included") doc.setTextColor(16, 185, 129);
                doc.text(priceStr, pageWidth - 25, yPos, { align: "right" });
                doc.setTextColor(24, 24, 27);
            }
            
            yPos += (splitVal.length * 5) + 3;
        };

        doc.setTextColor(24, 24, 27);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PREPARED FOR:", 20, 65);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`${formData.clientName} (${formData.companyName})`, 20, 72);
        doc.text(formData.clientEmail, 20, 78);

        addSectionTitle("IDENTITY & VISION");
        addRow("Company Name:", formData.companyName);
        addRow("Contact Person:", `${formData.clientName} (${formData.clientEmail})`);
        if (formData.clientPhone) addRow("Phone:", formData.clientPhone);
        if (formData.vatNumber) addRow("VAT Number:", formData.vatNumber);
        addRow("Billing Address:", formData.billingAddress);
        addRow("Current Website:", formData.currentWebsite || "None provided");
        addRow("Project Goals:", formData.projectGoals);
        if (formData.competitors) addRow("Competitors/Refs:", formData.competitors);
        yPos += 5;

        addSectionTitle("ARCHITECTURE & DESIGN");
        const archLabel = cData.stepsData[0].options.find((o:any) => o.id === formData.architecture)?.label || "Not set";
        const arch = ARCHITECTURE_OPTIONS.find(a => a.id === formData.architecture);
        addRow("Core Platform:", archLabel, arch ? `+€${arch.price.toLocaleString()}` : "");
        const extraPagesCost = formData.estimatedPages > 5 ? (formData.estimatedPages - 5) * 200 : 0;
        addRow("Page Count:", `${formData.estimatedPages} Pages`, extraPagesCost > 0 ? `+€${extraPagesCost.toLocaleString()}` : "Included");

        const designLabel = dData.designStyles[formData.designStyle as keyof typeof dData.designStyles] || "Not set";
        const design = DESIGN_STYLES.find(d => d.id === formData.designStyle);
        addRow("Design Style:", designLabel, design && design.price > 0 ? `+€${design.price.toLocaleString()}` : "Included");
        let colorsStr = `Primary: ${formData.primaryColor}, Secondary: ${formData.secondaryColor}`;
        if (formData.hasAccentColor) colorsStr += `, Accent: ${formData.accentColor}`;
        addRow("Brand Colors:", colorsStr, "Included");
        addRow("Typography:", formData.fontPreference, "Included");
        addRow("Copywriting:", formData.needsCopywriting ? "Professional SEO Copywriting" : "Client Provided", formData.needsCopywriting ? "+€1,500" : "Included");

        const assets = formData.uploadedFiles.length > 0 ? formData.uploadedFiles.map(f => f.name).join(", ") : "No files provided yet";
        addRow("Uploaded Assets:", assets);
        yPos += 5;

        addSectionTitle("ENGINEERING & LOGISTICS");
        if (formData.selectedIntegrations.length > 0) {
            formData.selectedIntegrations.forEach(id => {
                const intg = INTEGRATION_OPTIONS.find(i => i.id === id);
                if (intg) addRow("Integration:", dData.integrations[id as keyof typeof dData.integrations], `+€${intg.price.toLocaleString()}`);
            });
        } else {
            addRow("Integrations:", "No extra integrations selected");
        }

        addRow("SEO Setup:", formData.seoLevel === 'advanced' ? dData.seoLevels.advanced : dData.seoLevels.standard, formData.seoLevel === 'advanced' ? "+€1,500" : "Included");

        const timeLabel = formData.timeline === 'enterprise' ? "4 - 6 Months (Enterprise Scale)" : (dData.timelines[formData.timeline as keyof typeof dData.timelines] || "Standard");
        const time = TIMELINES.find(t => t.id === formData.timeline);
        let timeModStr = "Included";
        if (time && time.multiplier !== 1.0) {
            const baseTotal = calculateBaseTotal();
            const diff = Math.abs((baseTotal * time.multiplier) - baseTotal);
            timeModStr = `${time.multiplier > 1 ? '+' : '-'}€${diff.toLocaleString()}`;
        }
        addRow("Timeline:", timeLabel, timeModStr);

        const cMaint = MAINTENANCE_OPTIONS.find(m => m.id === formData.maintenanceTier);
        addRow("Monthly Retainer:", cMaint ? cMaint.title : "None", cMaint && cMaint.price > 0 ? `+€${cMaint.price} / mo` : "");

        if (formData.designNotes) {
            addRow("Additional Notes:", formData.designNotes);
        }

        checkPageBreak(30);
        yPos += 5;
        doc.setDrawColor(228, 228, 231);
        doc.line(20, yPos, pageWidth - 20, yPos);
        
        yPos += 12;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL ESTIMATED INVESTMENT", 25, yPos);
        doc.setTextColor(16, 185, 129);
        doc.text(`€${calculateTotal().toLocaleString()}`, pageWidth - 25, yPos, { align: "right" });
        doc.setTextColor(24, 24, 27);

        if (cMaint && cMaint.price > 0) {
            yPos += 8;
            doc.setFontSize(12);
            doc.text("MONTHLY CONTINUOUS ENGINEERING", 25, yPos);
            doc.setTextColor(16, 185, 129);
            doc.text(`€${cMaint.price} / mo`, pageWidth - 25, yPos, { align: "right" });
            doc.setTextColor(24, 24, 27);
        }

        const footerY = doc.internal.pageSize.getHeight() - 25;
        doc.setDrawColor(228, 228, 231);
        doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(113, 113, 122);
        doc.text("This document is a definitive blueprint estimate securely logged in the Novatrum network.", 20, footerY + 5);
        doc.text("Our team will review your parameters and send an Onboarding Invite to finalize integration.", 20, footerY + 10);

        doc.save(`Novatrum_Architecture_${discoveryId || 'Draft'}.pdf`);
        setDownloadingPdf(false);
    };

    const submitDiscovery = async () => {
        setLoading(true);
        const dsNumber = `DS-${Math.floor(1000 + Math.random() * 9000)}`;
        const finalPrice = calculateTotal();
        const projectTypeLabel = cData.stepsData[0].options.find((a:any) => a.id === formData.architecture)?.label || 'Custom Software';

        let colorsString = `Primary: ${formData.primaryColor}, Secondary: ${formData.secondaryColor}`;
        if (formData.hasAccentColor) colorsString += `, Accent: ${formData.accentColor}`;

        const cMaint = MAINTENANCE_OPTIONS.find(m => m.id === formData.maintenanceTier);
        
        const detailsPayload = {
            "Company": formData.companyName,
            "Goals": formData.projectGoals,
            "Competitors": formData.competitors,
            "Design Style": dData.designStyles[formData.designStyle as keyof typeof dData.designStyles] || 'Not specified',
            "Colors": colorsString,
            "Typography": formData.fontPreference,
            "Page Count": formData.estimatedPages,
            "Copywriting": formData.needsCopywriting ? 'Requested' : 'Client Provided',
            "Integrations": formData.selectedIntegrations.map(id => dData.integrations[id as keyof typeof dData.integrations]).join(', '),
            "SEO Setup": formData.seoLevel,
            "Timeline": formData.timeline === 'enterprise' ? "4-6 Months" : formData.timeline,
            "Maintenance": cMaint ? `${cMaint.title} (€${cMaint.price}/mo)` : "None",
            "Assets": formData.uploadedFiles.map(f => f.url).join(' | '),
            "Notes": formData.designNotes,
            "Terms Accepted": `Yes (${new Date().toISOString()})`
        };

        try {
            const { error } = await supabase.from('project_discovery').insert([{
                discovery_number: dsNumber,
                client_name: formData.clientName,
                client_email: formData.clientEmail,
                project_type: projectTypeLabel,
                details: detailsPayload,
                estimated_price: finalPrice
            }]);

            if (error) throw error;

            await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'discovery_notification',
                    email: 'info@novatrum.eu',
                    clientEmail: formData.clientEmail, 
                    clientName: formData.clientName,
                    discoveryNumber: dsNumber,
                    projectType: projectTypeLabel,
                    amount: finalPrice,
                    currency: 'EUR'
                })
            }).catch(err => console.error("Email notification failed:", err));

            setDiscoveryId(dsNumber);
            setCurrentStep(8);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) {
            alert("System Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const isStepValid = () => {
        if (currentStep === 1) return formData.companyName.trim().length > 0 && formData.projectGoals.trim().length > 0;
        if (currentStep === 2) return formData.architecture !== '';
        if (currentStep === 3) return formData.designStyle !== '';
        // CHECKBOX GÜVENLİK KİLİDİ
        if (currentStep === 7) return formData.clientName.trim().length > 0 && formData.clientEmail.trim().length > 0 && formData.billingAddress.trim().length > 0 && formData.acceptedTerms;
        return true; 
    };

    const nextStep = () => {
        if (isStepValid()) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!dData || !cData) return <div className="pt-40 text-center font-mono text-xs uppercase tracking-widest text-zinc-400">Loading Translations...</div>;

    return (
        <div className="min-h-screen bg-white text-black font-sans pb-32 md:pb-40 selection:bg-black selection:text-white relative">
            
            {currentStep < 8 && (
                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-100 p-4 md:p-6 shadow-sm">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center w-full md:w-auto justify-between md:justify-start gap-4">
                            <button onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/gateway')} className="p-2 hover:bg-zinc-100 rounded-full transition-colors shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </button>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{dData.phase} {currentStep} {dData.of} {totalSteps - 1}</span>
                        </div>
                        
                        <div className="w-full md:flex-1 md:max-w-xl mx-4">
                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full bg-black transition-all duration-700 ease-out" style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }} />
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-3">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{dData.liveEstimate}</span>
                            <span className="text-lg font-black font-mono text-emerald-600">
                                €{calculateTotal().toLocaleString()}
                                {monthlyPrice > 0 && <span className="text-xs text-zinc-400 ml-1">+ €{monthlyPrice}/mo</span>}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto p-6 md:p-12 pt-12 md:pt-20">

                {currentStep === 1 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{dData.visionTitle}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{dData.visionSub}</p>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{dData.form.entity}</label>
                                    <input type="text" placeholder="e.g. Acme Corp" value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-5 md:p-6 rounded-[24px] outline-none text-sm font-bold focus:border-black focus:bg-white transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{dData.form.website}</label>
                                    <input type="text" placeholder="https://..." value={formData.currentWebsite} onChange={(e) => setFormData({...formData, currentWebsite: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-5 md:p-6 rounded-[24px] outline-none text-sm font-bold focus:border-black focus:bg-white transition-colors" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{dData.form.goals}</label>
                                <textarea placeholder={dData.form.goalsPlace} value={formData.projectGoals} onChange={(e) => setFormData({...formData, projectGoals: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-5 md:p-6 rounded-[24px] outline-none text-sm font-bold focus:border-black focus:bg-white transition-colors h-32 resize-none" />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{dData.form.competitors}</label>
                                <textarea placeholder="..." value={formData.competitors} onChange={(e) => setFormData({...formData, competitors: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 p-5 md:p-6 rounded-[24px] outline-none text-sm font-bold focus:border-black focus:bg-white transition-colors h-24 resize-none" />
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{dData.archTitle}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{dData.archSub}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cData.stepsData[0].options.slice(0, 4).map((opt: any, index: number) => {
                                const optIds = ["landing", "corporate", "ecommerce", "saas"];
                                const isSelected = formData.architecture === optIds[index];
                                const priceObj = ARCHITECTURE_OPTIONS.find(a => a.id === optIds[index]);
                                
                                return (
                                    <div 
                                        key={optIds[index]} 
                                        onClick={() => setFormData(prev => ({
                                            ...prev, 
                                            architecture: optIds[index],
                                            estimatedPages: optIds[index] === 'landing' ? 1 : (prev.architecture === 'landing' ? 5 : prev.estimatedPages)
                                        }))}
                                        className={`p-6 md:p-8 rounded-[32px] border-2 cursor-pointer transition-all duration-300 group ${isSelected ? 'border-black bg-zinc-50 ring-1 ring-black shadow-xl' : 'border-zinc-200 hover:border-zinc-400 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-300'}`}>
                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            {priceObj && <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-1 rounded-md whitespace-nowrap">+€{priceObj.price.toLocaleString()}</span>}
                                        </div>
                                        <h3 className="text-xl font-black uppercase mb-2">{opt.label}</h3>
                                        <p className="text-xs font-bold text-zinc-500 leading-relaxed">{cData.stepsData[0].options[index].desc}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-zinc-50 p-8 md:p-10 rounded-[32px] border border-zinc-200 space-y-8 mt-12">
                            <div className={formData.architecture === 'landing' ? 'opacity-50 pointer-events-none' : ''}>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        {formData.architecture === 'landing' ? dData.form.singlePage : dData.form.pages}
                                    </label>
                                    <span className="font-mono font-black text-xl">{formData.architecture === 'landing' ? '1' : formData.estimatedPages}</span>
                                </div>
                                <input 
                                    type="range" min="1" max="50" 
                                    value={formData.architecture === 'landing' ? 1 : formData.estimatedPages} 
                                    onChange={(e) => setFormData({...formData, estimatedPages: parseInt(e.target.value)})}
                                    disabled={formData.architecture === 'landing'}
                                    className={`w-full h-2 rounded-full appearance-none ${formData.architecture === 'landing' ? 'bg-zinc-200 cursor-not-allowed' : 'accent-black bg-zinc-200 cursor-pointer'}`} 
                                />
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-4 text-center">First 5 pages included. +€200 per additional page.</p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{dData.designTitle}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{dData.designSub}</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{dData.form.designDesc}</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {DESIGN_STYLES.map(style => (
                                    <div 
                                        key={style.id} 
                                        onClick={() => setFormData({...formData, designStyle: style.id})}
                                        className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex flex-col justify-between ${formData.designStyle === style.id ? 'border-black bg-black text-white shadow-xl' : 'border-zinc-200 hover:border-black text-black bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start w-full mb-2">
                                            <h3 className="font-black uppercase">{dData.designStyles[style.id as keyof typeof dData.designStyles] || style.id}</h3>
                                            {style.price > 0 && <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md whitespace-nowrap ${formData.designStyle === style.id ? 'bg-white/20' : 'bg-zinc-100 text-zinc-500'}`}>+€{style.price}</span>}
                                        </div>
                                        <p className={`text-xs font-bold leading-relaxed mt-2 ${formData.designStyle === style.id ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                            {style.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Brand Colors</label>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex-1 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col items-center gap-3">
                                        <span className="text-[9px] font-bold uppercase text-zinc-400">{dData.form.color}</span>
                                        <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({...formData, primaryColor: e.target.value})} className="w-12 h-12 rounded-full cursor-pointer border-0 p-0" />
                                    </div>
                                    <div className="flex-1 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col items-center gap-3">
                                        <span className="text-[9px] font-bold uppercase text-zinc-400">Secondary</span>
                                        <input type="color" value={formData.secondaryColor} onChange={(e) => setFormData({...formData, secondaryColor: e.target.value})} className="w-12 h-12 rounded-full cursor-pointer border-0 p-0" />
                                    </div>
                                    
                                    {formData.hasAccentColor ? (
                                        <div className="flex-1 bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex flex-col items-center gap-3 relative animate-in fade-in">
                                            <button onClick={() => setFormData({...formData, hasAccentColor: false})} className="absolute top-2 right-2 text-zinc-400 hover:text-red-500 transition-colors">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                            <span className="text-[9px] font-bold uppercase text-zinc-400">{dData.form.accent}</span>
                                            <input type="color" value={formData.accentColor} onChange={(e) => setFormData({...formData, accentColor: e.target.value})} className="w-12 h-12 rounded-full cursor-pointer border-0 p-0" />
                                        </div>
                                    ) : (
                                        <button onClick={() => setFormData({...formData, hasAccentColor: true})} className="flex-1 bg-white border-2 border-dashed border-zinc-200 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-zinc-50 transition-colors">
                                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                            <span className="text-[9px] font-bold uppercase text-zinc-400">{dData.form.hasAccent}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{dData.form.fonts}</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {['sans-serif', 'serif', 'monospace'].map(font => (
                                        <div key={font} onClick={() => setFormData({...formData, fontPreference: font})} className={`p-4 rounded-xl border cursor-pointer text-center transition-all ${formData.fontPreference === font ? 'bg-zinc-100 border-zinc-400' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}>
                                            <span style={{ fontFamily: font }} className="capitalize font-bold">{font}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{dData.contentTitle}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{dData.contentSub}</p>
                        </div>

                        <div className={`p-8 rounded-[32px] border-2 transition-all cursor-pointer ${formData.needsCopywriting ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 hover:border-zinc-300 bg-white'}`} onClick={() => setFormData({...formData, needsCopywriting: !formData.needsCopywriting})}>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xl font-black uppercase flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.needsCopywriting ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-300'}`}>
                                        {formData.needsCopywriting && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                    </div>
                                    {dData.form.copy}
                                </h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-100 whitespace-nowrap">+€1,500</span>
                            </div>
                            <p className="text-sm font-bold text-zinc-500 ml-9 leading-relaxed">I need Novatrum to write compelling, SEO-optimized content and sales copy for the entire platform.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">{dData.form.assets}</label>
                            
                            <div className="border-2 border-dashed border-zinc-300 rounded-[32px] p-10 text-center bg-zinc-50 hover:bg-zinc-100 transition-colors relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                <div className="space-y-4 pointer-events-none">
                                    {uploading ? (
                                        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                                    ) : (
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-zinc-200">
                                            <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                        </div>
                                    )}
                                    <p className="text-sm font-black uppercase tracking-widest">{uploading ? dData.fileUploading : dData.fileClick}</p>
                                    <p className="text-xs font-bold text-zinc-400">PDF, PNG, JPG, ZIP (Max 50MB)</p>
                                </div>
                            </div>

                            {formData.uploadedFiles.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {formData.uploadedFiles.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm">
                                            <span className="text-xs font-bold truncate max-w-[80%]">{file.name}</span>
                                            <button onClick={() => removeFile(i)} className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:bg-red-50 px-3 py-1 rounded-lg">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 5 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{dData.engTitle}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{dData.engSub}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {INTEGRATION_OPTIONS.map(opt => {
                                const isSelected = formData.selectedIntegrations.includes(opt.id);
                                return (
                                    <div 
                                        key={opt.id} 
                                        onClick={() => {
                                            if (isSelected) {
                                                setFormData({...formData, selectedIntegrations: formData.selectedIntegrations.filter(id => id !== opt.id)});
                                            } else {
                                                setFormData({...formData, selectedIntegrations: [...formData.selectedIntegrations, opt.id]});
                                            }
                                        }}
                                        className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all duration-300 flex flex-col items-start gap-4 ${isSelected ? 'border-black bg-black text-white shadow-xl' : 'border-zinc-200 hover:border-black bg-white text-black'}`}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'border-white bg-white text-black' : 'border-zinc-300'}`}>
                                                    {isSelected && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                                </div>
                                                <span className="font-black uppercase text-sm">{dData.integrations[opt.id as keyof typeof dData.integrations] || opt.id}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md whitespace-nowrap ${isSelected ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'}`}>
                                                +€{opt.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className={`text-xs font-bold leading-relaxed ml-9 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>{opt.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {currentStep === 6 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{dData.logTitle}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{dData.logSub}</p>
                        </div>

                        <div className="space-y-8">
                            
                            {isComplexProject && (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                                    <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-800">{dData.constraint.title}</p>
                                        <p className="text-xs font-bold text-amber-700/80 mt-1">{dData.constraint.desc}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Deployment Timeline</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['relaxed', 'standard', 'expedited', 'enterprise'].map(tId => {
                                        const isEnterprise = tId === 'enterprise';
                                        if (isEnterprise && !isComplexProject) return null;
                                        const isDisabled = isComplexProject && !isEnterprise;
                                        const isSelected = formData.timeline === tId;
                                        const tInfo = TIMELINES.find(x => x.id === tId);

                                        return (
                                            <div 
                                                key={tId} 
                                                onClick={() => !isDisabled && setFormData({...formData, timeline: tId})} 
                                                className={`p-5 rounded-2xl border-2 transition-all flex flex-col gap-2 
                                                    ${isDisabled ? 'opacity-40 bg-zinc-50 cursor-not-allowed border-zinc-100' : 'cursor-pointer hover:border-black'}
                                                    ${isSelected && !isDisabled ? (tId === 'expedited' ? 'border-red-500 bg-red-50 shadow-md' : tId === 'relaxed' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-black bg-zinc-50 shadow-md') : 'border-zinc-200 bg-white'}
                                                `}
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <h3 className={`font-black uppercase text-sm ${isSelected && !isDisabled ? (tId === 'expedited' ? 'text-red-600' : 'text-black') : 'text-zinc-700'}`}>
                                                        {isEnterprise ? "4 - 6 Months (Enterprise Scale)" : dData.timelines[tId as keyof typeof dData.timelines]}
                                                    </h3>
                                                    {isSelected && !isDisabled && (
                                                        <div className={`w-3 h-3 rounded-full ${tId === 'expedited' ? 'bg-red-500' : tId === 'relaxed' ? 'bg-blue-500' : 'bg-black'}`} />
                                                    )}
                                                </div>
                                                <p className={`text-xs font-bold mt-1 ${isSelected && !isDisabled ? (tId === 'expedited' ? 'text-red-500/70' : 'text-zinc-500') : 'text-zinc-400'}`}>
                                                    {isEnterprise ? "Mandatory for complex scale architectures." : tInfo?.desc}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">Continuous Engineering (Monthly)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {MAINTENANCE_OPTIONS.map(opt => {
                                        const isSelected = formData.maintenanceTier === opt.id;
                                        return (
                                            <div 
                                                key={opt.id} 
                                                onClick={() => setFormData({...formData, maintenanceTier: opt.id})}
                                                className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex flex-col justify-between 
                                                    ${isSelected ? 'border-black bg-zinc-50 shadow-md' : 'border-zinc-200 hover:border-black bg-white'}
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-2 w-full">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-300'}`}>
                                                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                        </div>
                                                        <h3 className={`font-black uppercase text-sm ${isSelected ? 'text-black' : 'text-zinc-800'}`}>{opt.title}</h3>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md whitespace-nowrap ${isSelected ? 'bg-white border border-zinc-200 text-black' : 'bg-zinc-100 text-zinc-500'}`}>
                                                        {opt.price > 0 ? `+€${opt.price} / mo` : 'Included'}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-zinc-500 mt-2 ml-7 leading-relaxed">{opt.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-zinc-100">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-2">SEO Optimization Level</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div onClick={() => setFormData({...formData, seoLevel: 'standard'})} className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex flex-col justify-between ${formData.seoLevel === 'standard' ? 'border-black bg-zinc-50' : 'border-zinc-200 hover:border-black bg-white'}`}>
                                        <h3 className="font-black uppercase mb-1">{dData.seoLevels.standard}</h3>
                                        <p className="text-xs font-bold text-zinc-500 mt-2">Included. Basic meta tags and fast load speeds.</p>
                                    </div>
                                    <div onClick={() => setFormData({...formData, seoLevel: 'advanced'})} className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex flex-col justify-between ${formData.seoLevel === 'advanced' ? 'border-emerald-500 bg-emerald-50' : 'border-zinc-200 hover:border-black bg-white'}`}>
                                        <div className="flex justify-between items-start mb-1 w-full">
                                            <h3 className="font-black uppercase text-emerald-800">{dData.seoLevels.advanced}</h3>
                                            <span className="text-[9px] font-black uppercase text-emerald-600 bg-white px-2 py-1 rounded-md border border-emerald-100 whitespace-nowrap">+€1,500</span>
                                        </div>
                                        <p className="text-xs font-bold text-emerald-700/70 mt-2">Schema markup, programmatic sitemaps, core web vitals optimization.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 7 && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">{dData.credTitle}</h1>
                            <p className="text-zinc-500 font-bold mt-4 text-sm md:text-base leading-relaxed">{dData.credSub}</p>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200 p-8 md:p-12 rounded-[40px] space-y-6 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2 pl-2">{dData.form.name}</label>
                                    <input type="text" placeholder="John Doe" required className="w-full bg-white border border-zinc-200 p-4 md:p-5 rounded-xl md:rounded-[20px] outline-none text-xs font-bold focus:border-black transition-colors" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2 pl-2">{dData.form.email}</label>
                                    <input type="email" placeholder="john@example.com" required className="w-full bg-white border border-zinc-200 p-4 md:p-5 rounded-xl md:rounded-[20px] outline-none text-xs font-bold focus:border-black transition-colors" value={formData.clientEmail} onChange={(e) => setFormData({...formData, clientEmail: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2 pl-2">{dData.form.phone}</label>
                                    <input type="tel" placeholder="+1..." className="w-full bg-white border border-zinc-200 p-4 md:p-5 rounded-xl md:rounded-[20px] outline-none text-xs font-bold focus:border-black transition-colors" value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2 pl-2">{dData.form.vat}</label>
                                    <input type="text" placeholder="BE0000..." className="w-full bg-white border border-zinc-200 p-4 md:p-5 rounded-xl md:rounded-[20px] outline-none text-xs font-bold focus:border-black transition-colors" value={formData.vatNumber} onChange={(e) => setFormData({...formData, vatNumber: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2 pl-2">{dData.form.address}</label>
                                <textarea placeholder="Street, City, Postal Code, Country" required className="w-full bg-white border border-zinc-200 p-4 md:p-5 rounded-xl md:rounded-[20px] outline-none text-xs font-bold h-24 resize-none focus:border-black transition-colors" value={formData.billingAddress} onChange={(e) => setFormData({...formData, billingAddress: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest block mb-2 pl-2">{dData.form.notes}</label>
                                <textarea placeholder={dData.form.notesPlace} className="w-full bg-white border border-zinc-200 p-4 md:p-5 rounded-xl md:rounded-[20px] outline-none text-xs font-bold h-24 resize-none focus:border-black transition-colors" value={formData.designNotes} onChange={(e) => setFormData({...formData, designNotes: e.target.value})} />
                            </div>

                            {/* GÜVENLİ (FALLBACK) YASAL ONAY KUTUCUĞU */}
                            <div className="mt-8 p-6 bg-white border-2 border-zinc-200 rounded-2xl flex items-start gap-4 hover:border-black transition-colors group shadow-sm">
                                <div className="relative flex items-start mt-1">
                                    <input
                                        id="terms"
                                        name="terms"
                                        type="checkbox"
                                        checked={formData.acceptedTerms}
                                        onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})}
                                        className="w-6 h-6 rounded-md border-zinc-300 text-black focus:ring-black cursor-pointer accent-black"
                                    />
                                </div>
                                <div className="text-xs font-bold text-zinc-600 leading-relaxed flex-1">
                                    <label htmlFor="terms" className="cursor-pointer block select-none">
                                        {dData.form?.termsAgree || "I acknowledge that I have read and agree to the "} 
                                        <a href="/legal/terms" target="_blank" onClick={(e) => e.stopPropagation()} className="text-black font-black underline underline-offset-2 hover:text-emerald-600 transition-colors">
                                            {dData.form?.termsLink || "Novatrum Master Service Agreement"}
                                        </a>
                                        {dData.form?.termsDesc || ". I understand that this definitive blueprint forms the technical scope and billing terms of our collaboration."}
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {currentStep === 8 && (
                    <div className="text-center space-y-10 animate-in zoom-in-95 py-10 md:py-20">
                        <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 animate-bounce">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        
                        <div>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">{dData.success.title}</h2>
                            <p className="text-zinc-500 font-bold max-w-lg mx-auto leading-relaxed text-sm md:text-base">
                                {dData.success.desc}
                                <br/><span className="text-black block mt-2">{dData.success.sub}</span>
                            </p>
                        </div>
                        
                        <div className="bg-zinc-50 p-10 md:p-12 rounded-[40px] border-2 border-zinc-100 max-w-md mx-auto relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">{dData.success.dsNumber}</p>
                            <p className="text-5xl font-black font-mono tracking-tighter text-black select-all mb-8">{discoveryId}</p>
                            
                            <div className="pt-8 border-t border-zinc-200 flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Final Estimate</span>
                                <span className="text-2xl text-emerald-600 font-black font-mono">€{calculateTotal().toLocaleString()}</span>
                            </div>
                            
                            {monthlyPrice > 0 && (
                                <div className="flex justify-between items-center mb-8 border-t border-zinc-100 pt-4">
                                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest">Monthly Retainer</span>
                                    <span className="text-lg text-emerald-600 font-black font-mono">+€{monthlyPrice} / mo</span>
                                </div>
                            )}

                            <button 
                                onClick={downloadClientCopy}
                                disabled={downloadingPdf}
                                className="w-full bg-white border border-zinc-200 text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-colors flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
                            >
                                {downloadingPdf ? (
                                    <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Compiling Document...</>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        {dData.btn.pdf}
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="mt-6 bg-zinc-50 border border-zinc-200 p-5 rounded-2xl max-w-lg mx-auto text-left shadow-sm">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Next Steps: Onboarding Protocol
                            </p>
                            <p className="text-xs font-bold text-zinc-500 leading-relaxed">
                                Our engineering team will review your blueprint. Once approved, you will receive a secure <strong>Onboarding Invite</strong> via email to initialize your profile and generate your dedicated Deployment Key.
                            </p>
                        </div>

                        <div className="pt-8 flex flex-col items-center gap-4">
                            <button onClick={() => router.push('/')} className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-lg active:scale-95">{dData.btn.hub}</button>
                        </div>
                    </div>
                )}
            </div>

            {currentStep < 8 && (
                <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-zinc-200 p-4 md:p-6 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 md:gap-6">
                        
                        <div className="flex flex-col">
                            <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-0.5 md:mb-1">{dData.liveEstimate}</p>
                            <p className="text-lg md:text-2xl font-black font-mono text-black whitespace-nowrap">
                                €{calculateTotal().toLocaleString()}
                                {monthlyPrice > 0 && <span className="text-sm md:text-lg text-zinc-400 ml-1 md:ml-2">+€{monthlyPrice}/mo</span>}
                            </p>
                        </div>
                    
                        <div className="flex gap-3">
                            {currentStep === 7 ? (
                                <button 
                                    onClick={submitDiscovery}
                                    disabled={loading || !isStepValid()}
                                    className="bg-emerald-500 text-white px-6 md:px-16 py-3.5 md:py-5 rounded-2xl md:rounded-[20px] font-black uppercase text-[9px] md:text-xs tracking-[0.2em] active:scale-95 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3"
                                >
                                    {loading ? (
                                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {dData.btn.encrypting}</>
                                    ) : (
                                        <>{dData.btn.submit} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></>
                                    )}
                                </button>
                            ) : (
                                <button 
                                    onClick={nextStep}
                                    disabled={!isStepValid()}
                                    className="bg-black text-white px-6 md:px-16 py-3.5 md:py-5 rounded-2xl md:rounded-[20px] font-black uppercase text-[9px] md:text-xs tracking-[0.2em] active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 md:gap-3 hover:bg-zinc-800"
                                >
                                    {dData.btn.next} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}