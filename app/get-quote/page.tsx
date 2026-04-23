"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import { useLanguage } from '../../context/LanguageContext';

// ============================================================================
// NOVATRUM ENTERPRISE PRICING & LOGIC ENGINE (MULTILINGUAL PREMIUM EDITION)
// ============================================================================

const SETUP_FEE = 300;
const RESTRICTED_FOR_LANDING = ['stripe', 'auth', 'crm', 'sockets', 'cms', 'ai'];

function DiscoveryFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useLanguage();

    const totalSteps = 10; // 9 steps + 1 success step

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [discoveryId, setDiscoveryId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        companyName: '', currentWebsite: '', projectGoals: '',
        targetAudience: '', uniqueValue: '', competitors: '',
        architecture: '', estimatedPages: 5,
        designStyle: '', primaryColor: '#000000', secondaryColor: '#ffffff', hasAccentColor: false, accentColor: '#10b981', fontPreference: 'sans-serif',
        needsCopywriting: false, uploadedFiles: [] as { name: string, url: string }[],
        selectedIntegrations: [] as string[],
        dataRegion: 'eu', complianceLevel: 'standard',
        seoLevel: 'standard', timeline: 'standard', maintenanceTier: 'essential',
        clientName: '', clientEmail: '', clientPhone: '', vatNumber: '', billingAddress: '', designNotes: '', acceptedTerms: false
    });

    // ------------------------------------------------------------------------
    // DYNAMIC ARRAYS (Tied to 't' object for instant translation)
    // ------------------------------------------------------------------------
    const ARCHITECTURE_OPTIONS = [
        { id: "landing", price: 1250, label: t.discoveryPage?.architectures?.landing?.label || "Landing Architecture", desc: t.discoveryPage?.architectures?.landing?.desc || "A high-performance, single-page digital asset." },
        { id: "corporate", price: 2500, label: t.discoveryPage?.architectures?.corporate?.label || "Corporate Platform", desc: t.discoveryPage?.architectures?.corporate?.desc || "A multi-page authoritative presence." },
        { id: "ecommerce", price: 4000, label: t.discoveryPage?.architectures?.ecommerce?.label || "Digital Storefront", desc: t.discoveryPage?.architectures?.ecommerce?.desc || "A bespoke conversion engine." },
        { id: "saas", price: 6000, label: t.discoveryPage?.architectures?.saas?.label || "Custom Software (SaaS)", desc: t.discoveryPage?.architectures?.saas?.desc || "Proprietary digital infrastructure." }
    ];

    const DESIGN_STYLES = [
        { id: "minimal", price: 0, label: t.discoveryPage?.designStyles?.minimal || "Scandinavian Minimal", desc: "Extreme focus on whitespace, clean lines, and typography. Timeless." },
        { id: "bold", price: 800, label: t.discoveryPage?.designStyles?.bold || "Bold & Editorial", desc: "High contrast, large typography, edgy and memorable. Magazine-like feel." },
        { id: "corporate", price: 0, label: t.discoveryPage?.designStyles?.corporate || "Modern Corporate", desc: "Trustworthy, highly structured, and data-forward aesthetic." },
        { id: "interactive", price: 4500, label: t.discoveryPage?.designStyles?.interactive || "Award-Winning Immersive", desc: "Heavy WebGL, scroll animations, 3D interactions, and fluid transitions." }
    ];

    const INTEGRATION_OPTIONS = [
        { id: "stripe", price: 1500, label: t.discoveryPage?.integrations?.stripe || "Payment Infrastructure", desc: "Secure checkout, subscriptions, and invoicing via Stripe/Mollie." },
        { id: "auth", price: 1800, label: t.discoveryPage?.integrations?.auth || "Authentication & Roles", desc: "Encrypted user login, JWT tokens, and multi-tier permission layers." },
        { id: "crm", price: 2000, label: t.discoveryPage?.integrations?.crm || "CRM Sync", desc: "Direct bidirectional sync with Hubspot, Salesforce, or custom endpoints." },
        { id: "mail", price: 600, label: t.discoveryPage?.integrations?.mail || "Transactional Email", desc: "Automated event-based email flows (SendGrid/Resend)." },
        { id: "analytics", price: 800, label: t.discoveryPage?.integrations?.analytics || "Telemetry & Analytics", desc: "Granular user behavior, event tracking, and custom conversion funnels." },
        { id: "ai", price: 5000, label: t.discoveryPage?.integrations?.ai || "AI & LLM Pipelines", desc: "Custom AI workflows, automated assistants, and RAG architectures." },
        { id: "sockets", price: 3000, label: t.discoveryPage?.integrations?.sockets || "Real-time WebSockets", desc: "Live data feeds, instant messaging, and collaborative interfaces." },
        { id: "cms", price: 3500, label: t.discoveryPage?.integrations?.cms || "Bespoke Admin Control", desc: "Custom-built headless CMS tailored exactly to your operational needs." },
        { id: "multilang", price: 1500, label: t.discoveryPage?.integrations?.multilang || "Multi-language (i18n)", desc: "Full locale routing, dynamic translation engine, and SEO localization." }
    ];

    const TIMELINES = [
        { id: "relaxed", multiplier: 0.9, label: t.discoveryPage?.timelines?.relaxed || "Relaxed Delivery", desc: "Extended delivery window. 10% operational discount applied." },
        { id: "standard", multiplier: 1.0, label: t.discoveryPage?.timelines?.standard || "Standard Pipeline", desc: "Regular agency queue priority. Expected delivery in 4-8 weeks." },
        { id: "expedited", multiplier: 1.5, label: t.discoveryPage?.timelines?.expedited || "Expedited Priority", desc: "Fast-tracked delivery. Dedicated team allocation. 50% premium." },
        { id: "enterprise", multiplier: 1.1, label: "Enterprise Scale", desc: "Mandatory extended timeline for complex SaaS and E-commerce architectures." }
    ];

    const MAINTENANCE_OPTIONS = [
        { id: "none", price: 0, title: t.discoveryPage?.maintenance?.none?.title || "No Ongoing Support", desc: t.discoveryPage?.maintenance?.none?.desc || "Client assumes full responsibility post-launch." },
        { id: "essential", price: 299, title: t.discoveryPage?.maintenance?.essential?.title || "Infrastructure Management", desc: t.discoveryPage?.maintenance?.essential?.desc || "Proactive security patches, monitoring, and updates." },
        { id: "growth", price: 599, title: t.discoveryPage?.maintenance?.growth?.title || "Growth Engineering", desc: t.discoveryPage?.maintenance?.growth?.desc || "Infrastructure package + 5 hours of development." },
        { id: "scale", price: 1299, title: t.discoveryPage?.maintenance?.scale?.title || "Dedicated Tech Lead", desc: t.discoveryPage?.maintenance?.scale?.desc || "Growth package + 15 hours of development." }
    ];

    // ------------------------------------------------------------------------
    // LOGIC & CALCULATIONS
    // ------------------------------------------------------------------------
    useEffect(() => {
        if (formData.architecture === 'landing') {
            setFormData(prev => ({ ...prev, selectedIntegrations: prev.selectedIntegrations.filter(id => !RESTRICTED_FOR_LANDING.includes(id)) }));
        }
    }, [formData.architecture]);

    const isComplexProject = formData.architecture === 'saas' || formData.architecture === 'ecommerce' || formData.estimatedPages > 15;

    useEffect(() => {
        if (isComplexProject) setFormData(prev => ({ ...prev, timeline: 'enterprise' }));
        else if (formData.timeline === 'enterprise') setFormData(prev => ({ ...prev, timeline: 'standard' }));
    }, [formData.architecture, formData.estimatedPages, isComplexProject]);

    const calculateBaseTotal = () => {
        let total = SETUP_FEE;
        const arch = ARCHITECTURE_OPTIONS.find(a => a.id === formData.architecture);
        if (arch) total += arch.price;
        if (formData.estimatedPages > 5 && formData.architecture !== 'landing') total += (formData.estimatedPages - 5) * 200;
        if (formData.needsCopywriting) total += 1500;
        const design = DESIGN_STYLES.find(d => d.id === formData.designStyle);
        if (design) total += design.price;
        formData.selectedIntegrations.forEach(intId => {
            const intg = INTEGRATION_OPTIONS.find(i => i.id === intId);
            if (intg) total += intg.price;
        });
        if (formData.seoLevel === 'advanced') total += 1500;
        if (formData.complianceLevel === 'strict') total += 2500;
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
            setFormData(prev => ({ ...prev, uploadedFiles: [...prev.uploadedFiles, { name: file.name, url: publicUrl }] }));
        } catch (error: any) { alert("Upload failed: " + error.message); }
        finally { setUploading(false); }
    };

    const removeFile = (index: number) => setFormData(prev => ({ ...prev, uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index) }));

    const downloadClientCopy = async () => {
        setDownloadingPdf(true);
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth(); let yPos = 90;

        const loadImage = (url: string): Promise<string> => new Promise((resolve) => {
            const img = new Image(); img.src = url;
            img.onload = () => { const canvas = document.createElement("canvas"); canvas.width = img.width; canvas.height = img.height; const ctx = canvas.getContext("2d"); ctx?.drawImage(img, 0, 0); resolve(canvas.toDataURL("image/png")); };
            img.onerror = () => resolve("");
        });

        const logoData = await loadImage("/logo.png");
        if (logoData) doc.addImage(logoData, 'PNG', 20, 15, 25, 25);
        else { doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.text("NOVATRUM", 20, 25); }

        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(113, 113, 122);
        doc.text("Premium Software Studio", 20, 45);
        doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(24, 24, 27);
        doc.text("ARCHITECTURE BLUEPRINT", pageWidth - 20, 30, { align: "right" });
        doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(113, 113, 122);
        doc.text(`Ref ID: ${discoveryId}`, pageWidth - 20, 38, { align: "right" });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, 44, { align: "right" });

        const checkPageBreak = (add: number) => { if (yPos + add > 280) { doc.addPage(); yPos = 20; } };
        const addSectionTitle = (title: string) => { checkPageBreak(15); doc.setFillColor(250, 250, 250); doc.rect(20, yPos - 6, pageWidth - 40, 10, "F"); doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(0, 0, 0); doc.text(title, 25, yPos); yPos += 10; };
        const addRow = (label: string, value: string, priceStr: string = "") => { doc.setFont("helvetica", "bold"); doc.setFontSize(9); const splitVal = doc.splitTextToSize(value || "N/A", pageWidth - 110); checkPageBreak(splitVal.length * 6); doc.setTextColor(0, 0, 0); doc.text(label, 25, yPos); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80); doc.text(splitVal, 65, yPos); if (priceStr) { if (priceStr.includes('-')) doc.setTextColor(239, 68, 68); else if (priceStr !== "Included") doc.setTextColor(16, 185, 129); else doc.setTextColor(150, 150, 150); doc.text(priceStr, pageWidth - 25, yPos, { align: "right" }); } yPos += (splitVal.length * 5) + 3; };

        doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text("PREPARED FOR:", 20, 65); doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.text(`${formData.clientName} (${formData.companyName})`, 20, 72); doc.text(formData.clientEmail, 20, 78);

        addSectionTitle("1. IDENTITY & VISION");
        addRow("Entity Name:", formData.companyName); addRow("Current Web:", formData.currentWebsite || "None"); addRow("Primary Goal:", formData.projectGoals); addRow("Target Audience:", formData.targetAudience);
        addRow("Unique Value:", formData.uniqueValue); addRow("Competitors:", formData.competitors); yPos += 5;

        addSectionTitle("2. TECHNICAL ARCHITECTURE");
        const arch = ARCHITECTURE_OPTIONS.find(a => a.id === formData.architecture);
        addRow("Core Platform:", arch?.label || "Not set", arch ? `+€${arch.price.toLocaleString()}` : "");
        const extraPages = formData.estimatedPages > 5 && formData.architecture !== 'landing' ? (formData.estimatedPages - 5) * 200 : 0;
        addRow("Page Count:", `${formData.architecture === 'landing' ? '1' : formData.estimatedPages} Pages`, extraPages > 0 ? `+€${extraPages.toLocaleString()}` : "Included");
        addRow("Base Setup & Ops:", "Cloud Provisioning & Framework Init", `+€${SETUP_FEE}`); yPos += 5;

        addSectionTitle("3. VISUAL ENGINEERING");
        const design = DESIGN_STYLES.find(d => d.id === formData.designStyle); addRow("Design Style:", design?.label || "Not set", design && design.price > 0 ? `+€${design.price.toLocaleString()}` : "Included");
        addRow("Brand Colors:", `Primary: ${formData.primaryColor}, Secondary: ${formData.secondaryColor}`, "Included"); addRow("Typography Base:", formData.fontPreference, "Included");
        addRow("Copywriting:", formData.needsCopywriting ? "Novatrum SEO Copywriting" : "Client Provided", formData.needsCopywriting ? "+€1,500" : "Included"); yPos += 5;

        addSectionTitle("4. INTEGRATION MATRIX");
        if (formData.selectedIntegrations.length > 0) { formData.selectedIntegrations.forEach(id => { const intg = INTEGRATION_OPTIONS.find(i => i.id === id); if (intg) addRow("Integration:", intg.label, `+€${intg.price.toLocaleString()}`); }); } else addRow("Integrations:", "No external APIs selected");
        addRow("Data Residency:", formData.dataRegion === 'eu' ? "EU Servers (Frankfurt/Paris)" : formData.dataRegion === 'us' ? "US Servers" : "Global CDN", "Included");
        addRow("Compliance:", formData.complianceLevel === 'strict' ? "Strict (GDPR/HIPAA Ready)" : "Standard Web Security", formData.complianceLevel === 'strict' ? "+€2,500" : "Included"); yPos += 5;

        addSectionTitle("5. LOGISTICS & SUPPORT");
        addRow("SEO Architecture:", formData.seoLevel === 'advanced' ? "Advanced Programmatic SEO" : "Standard Indexing", formData.seoLevel === 'advanced' ? "+€1,500" : "Included");
        const time = TIMELINES.find(t => t.id === formData.timeline); let timeMod = "Included";
        if (time && time.multiplier !== 1.0) { const base = calculateBaseTotal(); timeMod = `${time.multiplier > 1 ? '+' : '-'}€${Math.abs((base * time.multiplier) - base).toLocaleString()}`; } addRow("Delivery Timeline:", time?.label || "Standard", timeMod);
        const cMaint = MAINTENANCE_OPTIONS.find(m => m.id === formData.maintenanceTier); addRow("Monthly Retainer:", cMaint ? cMaint.title : "None", cMaint && cMaint.price > 0 ? `+€${cMaint.price} / mo` : "");

        checkPageBreak(35); yPos += 10; doc.setDrawColor(200, 200, 200); doc.line(20, yPos, pageWidth - 20, yPos); yPos += 12;
        doc.setFontSize(14); doc.setFont("helvetica", "bold");
        doc.text("TOTAL ESTIMATED INVESTMENT", 25, yPos); doc.setFont("helvetica", "bold"); doc.text(`€${calculateTotal().toLocaleString()}`, pageWidth - 25, yPos, { align: "right" });
        yPos += 6; doc.setFontSize(8);
        doc.setFont("helvetica", "italic"); doc.setTextColor(150, 150, 150); doc.text("* Estimate represents engineering value. Excludes VAT.", pageWidth - 25, yPos, { align: "right" });
        doc.setTextColor(0, 0, 0);

        if (cMaint && cMaint.price > 0) { yPos += 10; doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text("MONTHLY CONTINUOUS ENGINEERING", 25, yPos); doc.text(`€${cMaint.price} / mo`, pageWidth - 25, yPos, { align: "right" }); }

        const footerY = doc.internal.pageSize.getHeight() - 20; doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(150, 150, 150);
        doc.text("Definitive blueprint securely logged in the Novatrum internal network.", 20, footerY);
        doc.save(`Novatrum_Architecture_${discoveryId || 'Draft'}.pdf`);
        setDownloadingPdf(false);
    };

    const submitDiscovery = async () => {
        setLoading(true);
        const dsNumber = `DS-${Math.floor(1000 + Math.random() * 9000)}`;
        const finalPrice = calculateTotal();
        const projectTypeLabel = ARCHITECTURE_OPTIONS.find(a => a.id === formData.architecture)?.label || 'Custom Software';

        let colorsString = `Primary: ${formData.primaryColor}, Secondary: ${formData.secondaryColor}`;
        if (formData.hasAccentColor) colorsString += `, Accent: ${formData.accentColor}`;
        const cMaint = MAINTENANCE_OPTIONS.find(m => m.id === formData.maintenanceTier);

        const detailsPayload = {
            "Company": formData.companyName, "Goals": formData.projectGoals, "Audience": formData.targetAudience, "Unique Value": formData.uniqueValue, "Competitors": formData.competitors,
            "Architecture": projectTypeLabel, "Page Count": formData.architecture === 'landing' ? 1 : formData.estimatedPages,
            "Design Style": DESIGN_STYLES.find(d => d.id === formData.designStyle)?.label || 'Not specified', "Colors": colorsString, "Typography": formData.fontPreference,
            "Copywriting": formData.needsCopywriting ? 'Requested' : 'Client Provided',
            "Integrations": formData.selectedIntegrations.map(id => INTEGRATION_OPTIONS.find(i => i.id === id)?.label || id).join(', '),
            "Data Region": formData.dataRegion, "Compliance": formData.complianceLevel,
            "SEO Setup": formData.seoLevel, "Timeline": formData.timeline === 'enterprise' ? "Enterprise Scale" : formData.timeline,
            "Maintenance": cMaint ? `${cMaint.title} (€${cMaint.price}/mo)` : "None",
            "Setup Fee": `€${SETUP_FEE}`, "Assets": formData.uploadedFiles.map(f => f.url).join(' | '),
            "Notes": formData.designNotes, "Terms Accepted": `Yes (${new Date().toISOString()})`
        };

        try {
            const { error } = await supabase.from('project_discovery').insert([{
                discovery_number: dsNumber, client_name: formData.clientName, client_email: formData.clientEmail,
                project_type: projectTypeLabel, details: detailsPayload, estimated_price: finalPrice
            }]);
            if (error) throw error;

            await fetch('/api/email', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'discovery_notification', email: 'info@novatrum.eu', clientEmail: formData.clientEmail, clientName: formData.clientName, discoveryNumber: dsNumber, projectType: projectTypeLabel, amount: finalPrice, currency: 'EUR' })
            }).catch(err => console.error("Email notification failed:", err));

            setDiscoveryId(dsNumber); setCurrentStep(10); window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error: any) { alert("System Error: " + error.message); }
        finally { setLoading(false); }
    };

    const isStepValid = () => {
        if (currentStep === 1) return formData.companyName.trim().length > 0 && formData.projectGoals.trim().length > 0;
        if (currentStep === 2) return formData.targetAudience.trim().length > 0;
        if (currentStep === 3) return formData.architecture !== '';
        if (currentStep === 4) return formData.designStyle !== '';
        if (currentStep === 9) return formData.clientName.trim().length > 0 && formData.clientEmail.trim().length > 0 && formData.billingAddress.trim().length > 0 && formData.acceptedTerms;
        return true;
    };

    const nextStep = () => { if (isStepValid()) { setCurrentStep(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

    return (
        <div className="min-h-screen bg-white text-black font-sans pb-32 md:pb-40 selection:bg-black selection:text-white">

            {/* ULTRA-PREMIUM TOP HEADER */}
            {currentStep < 10 && (
                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-zinc-100 px-4 py-4 md:px-12 md:py-6 transition-all">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <button onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push('/gateway')} className="p-3 bg-white hover:bg-zinc-50 rounded-full transition-colors shrink-0 border border-zinc-200 text-black">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </button>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{t.discoveryPage?.subtitle || "Discovery Protocol"}</span>
                                <span className="text-sm font-black tracking-widest uppercase">{t.discoveryPage?.phase || "Phase"} 0{currentStep} {t.discoveryPage?.of || "/"} 0{totalSteps - 1}</span>
                            </div>
                        </div>

                        <div className="hidden md:flex flex-1 max-w-2xl mx-12 h-[2px] bg-zinc-100 overflow-hidden">
                            <div className="h-full bg-black transition-all duration-700 ease-in-out" style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }} />
                        </div>

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-1">{t.discoveryPage?.liveEstimate || "Live Architectural Estimate"}</span>
                            <div className="flex items-end gap-3">
                                <span className="text-2xl font-light tracking-tighter text-black">€{calculateTotal().toLocaleString()}</span>
                                {monthlyPrice > 0 && <span className="text-sm tracking-tight text-zinc-400 mb-0.5">+€{monthlyPrice}/mo</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto p-5 md:p-10 pt-10 md:pt-20">

                {/* STEP 1: INITIATION */}
                {currentStep === 1 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">{t.discoveryPage?.title || "Initiation."}</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">{t.discoveryPage?.desc || "Define the core entity and primary objective of the digital architecture."}</p>
                        </div>

                        {/* PREMIUM SETUP FEE UI */}
                        <div className="bg-white border border-zinc-200 p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-black transition-colors">
                            <div className="w-12 h-12 rounded-full border border-zinc-200 bg-white flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-black mb-2">{t.discoveryPage?.setupFee?.title || "Initialization Fee"}: €{SETUP_FEE}</h3>
                                <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-xl mb-4">
                                    {t.discoveryPage?.setupFee?.desc || "Every Novatrum architecture begins with a standard operational setup. This mandatory fee ensures enterprise-grade performance and security from day one."}
                                </p>
                                <div className="text-[11px] text-zinc-500 font-medium tracking-wide border-l-2 border-black pl-3 space-y-1.5">
                                    <p className="text-black font-bold mb-2 uppercase tracking-widest text-[9px]">{t.discoveryPage?.setupFee?.includesTitle || "The Novatrum Standard Includes:"}</p>
                                    <p>• {t.discoveryPage?.setupFee?.items?.i1 || "Vercel Edge Network Deployment"}</p>
                                    <p>• {t.discoveryPage?.setupFee?.items?.i2 || "SSL Encryption & Security Headers"}</p>
                                    <p>• {t.discoveryPage?.setupFee?.items?.i3 || "Global CDN Configuration"}</p>
                                    <p>• {t.discoveryPage?.setupFee?.items?.i4 || "100/100 Lighthouse Performance Tuning"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">{t.discoveryPage?.form?.entity || "Corporate Entity / Brand Name *"}</label>
                                    <input type="text" placeholder="Acme Corporation" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full bg-white border border-zinc-200 p-6 rounded-3xl outline-none text-base font-medium focus:border-black transition-colors" />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">{t.discoveryPage?.form?.website || "Existing Domain (Optional)"}</label>
                                    <input type="text" placeholder="https://..." value={formData.currentWebsite} onChange={(e) => setFormData({ ...formData, currentWebsite: e.target.value })} className="w-full bg-white border border-zinc-200 p-6 rounded-3xl outline-none text-base font-medium focus:border-black transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">{t.discoveryPage?.form?.goals || "Primary Objective *"}</label>
                                <textarea placeholder={t.discoveryPage?.form?.goalsPlace || "What specific business problem are we solving?"} value={formData.projectGoals} onChange={(e) => setFormData({ ...formData, projectGoals: e.target.value })} className="w-full bg-white border border-zinc-200 p-6 rounded-3xl outline-none text-base font-medium focus:border-black transition-colors h-40 resize-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: AUDIENCE & MARKET */}
                {currentStep === 2 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">Market.</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">Understanding the ecosystem your architecture will inhabit.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">Target Audience *</label>
                                <textarea placeholder="Who are the primary users?" value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} className="w-full bg-white border border-zinc-200 p-6 rounded-3xl outline-none text-base font-medium focus:border-black transition-colors h-32 resize-none" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">Unique Value Proposition</label>
                                <textarea placeholder="What makes your offering better?" value={formData.uniqueValue} onChange={(e) => setFormData({ ...formData, uniqueValue: e.target.value })} className="w-full bg-white border border-zinc-200 p-6 rounded-3xl outline-none text-base font-medium focus:border-black transition-colors h-32 resize-none" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">{t.discoveryPage?.form?.competitors || "Direct Competitors / Benchmarks"}</label>
                                <textarea placeholder="List URLs..." value={formData.competitors} onChange={(e) => setFormData({ ...formData, competitors: e.target.value })} className="w-full bg-white border border-zinc-200 p-6 rounded-3xl outline-none text-base font-medium focus:border-black transition-colors h-24 resize-none" />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: ARCHITECTURE */}
                {currentStep === 3 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">{t.discoveryPage?.form?.architecture || "Architecture."}</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">{t.discoveryPage?.form?.archDesc || "Select the foundational technical structure for your deployment."}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ARCHITECTURE_OPTIONS.map((opt) => {
                                const isSelected = formData.architecture === opt.id;
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => setFormData(prev => ({ ...prev, architecture: opt.id, estimatedPages: opt.id === 'landing' ? 1 : (prev.architecture === 'landing' ? 5 : prev.estimatedPages) }))} className={`p-8 rounded-[32px] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${isSelected ? 'border-black shadow-md bg-white scale-[1.02]' : 'border-zinc-200 hover:border-zinc-400 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start mb-8">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-300'}`}>
                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <span className={`text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1.5 rounded-full ${isSelected ? 'bg-black text-white' : 'bg-white border border-zinc-200 text-zinc-500'}`}>Base: +€{opt.price.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-light tracking-tight mb-3 text-black">{opt.label}</h3>
                                            <p className="text-sm font-medium text-zinc-500 leading-relaxed">{opt.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={`bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 transition-opacity duration-500 ${formData.architecture === 'landing' ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
                            <div className="flex justify-between items-end mb-8">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t.discoveryPage?.form?.pages || "Scale Requirement (Page Count)"}</label>
                                <span className="font-light text-5xl tracking-tighter text-black">{formData.architecture === 'landing' ? '1' : formData.estimatedPages}</span>
                            </div>
                            <input
                                type="range" min="1" max="50"
                                value={formData.architecture === 'landing' ? 1 : formData.estimatedPages}
                                onChange={(e) => setFormData({ ...formData, estimatedPages: parseInt(e.target.value) })}
                                disabled={formData.architecture === 'landing'}
                                className={`w-full h-1 rounded-full appearance-none outline-none ${formData.architecture === 'landing' ? 'bg-zinc-200' : 'bg-zinc-200 accent-black cursor-pointer'}`}
                            />
                            <div className="flex justify-between mt-4 text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
                                <span>Core (1-5) Included</span>
                                <span>+€200 / Extra Page</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 4: DESIGN IDENTITY */}
                {currentStep === 4 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">{t.discoveryPage?.form?.design || "Aesthetics."}</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">{t.discoveryPage?.form?.designDesc || "Define the visual engineering and brand parameters."}</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">Interface Styling</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {DESIGN_STYLES.map(style => (
                                    <div
                                        key={style.id}
                                        onClick={() => setFormData({ ...formData, designStyle: style.id })}
                                        className={`p-8 rounded-[32px] border transition-all cursor-pointer flex flex-col justify-between ${formData.designStyle === style.id ? 'border-black shadow-md bg-black text-white scale-[1.02]' : 'border-zinc-200 hover:border-black bg-white text-black'}`}
                                    >
                                        <div className="flex justify-between items-start w-full mb-6">
                                            <h3 className="text-xl font-light tracking-tight">{style.label}</h3>
                                            {style.price > 0 && <span className={`text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap ${formData.designStyle === style.id ? 'bg-white/20 text-white' : 'bg-white border border-zinc-200 text-zinc-500'}`}>+€{style.price}</span>}
                                        </div>
                                        <p className={`text-sm font-medium leading-relaxed ${formData.designStyle === style.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{style.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-2">Brand Palette</label>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col items-center gap-4">
                                        <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">{t.discoveryPage?.form?.color || "Primary Color"}</span>
                                        <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-12 h-12 rounded-full cursor-pointer border-0 p-0 shadow-inner" />
                                    </div>
                                    <div className="flex-1 bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col items-center gap-4">
                                        <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Secondary</span>
                                        <input type="color" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} className="w-12 h-12 rounded-full cursor-pointer border-0 p-0 shadow-inner" />
                                    </div>
                                    {formData.hasAccentColor ? (
                                        <div className="flex-1 bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col items-center gap-4 relative">
                                            <button onClick={() => setFormData({ ...formData, hasAccentColor: false })} className="absolute top-2 right-2 text-zinc-300 hover:text-black transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">{t.discoveryPage?.form?.accent || "Accent Color"}</span>
                                            <input type="color" value={formData.accentColor} onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })} className="w-12 h-12 rounded-full cursor-pointer border-0 p-0 shadow-inner" />
                                        </div>
                                    ) : (
                                        <button onClick={() => setFormData({ ...formData, hasAccentColor: true })} className="flex-1 bg-white border-2 border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-black transition-all">
                                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{t.discoveryPage?.form?.hasAccent || "Add Accent"}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-2">{t.discoveryPage?.form?.fonts || "Typography Base"}</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {['sans-serif', 'serif', 'monospace'].map(font => (
                                        <div key={font} onClick={() => setFormData({ ...formData, fontPreference: font })} className={`p-4 rounded-2xl border cursor-pointer text-center transition-all ${formData.fontPreference === font ? 'bg-black text-white border-black shadow-md' : 'bg-white border-zinc-200 hover:border-black text-black'}`}>
                                            <span style={{ fontFamily: font }} className="capitalize font-medium text-lg">{font}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 5: CONTENT */}
                {currentStep === 5 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">{t.discoveryPage?.form?.content || "Assets."}</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">Supply data or request professional copywriting services.</p>
                        </div>

                        <div className={`p-8 rounded-[32px] border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${formData.needsCopywriting ? 'border-black bg-black text-white shadow-md scale-[1.02]' : 'border-zinc-200 hover:border-black bg-white text-black'}`} onClick={() => setFormData({ ...formData, needsCopywriting: !formData.needsCopywriting })}>
                            <div className="flex gap-6 items-center">
                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.needsCopywriting ? 'border-white bg-white text-black' : 'border-zinc-300'}`}>
                                    {formData.needsCopywriting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-light tracking-tight">{t.discoveryPage?.form?.copy || "Novatrum SEO Copywriting"}</h3>
                                    <p className={`text-sm font-medium mt-2 ${formData.needsCopywriting ? 'text-zinc-400' : 'text-zinc-500'}`}>Full content generation, tone-of-voice design, and keyword optimization by our specialized team.</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold font-mono uppercase tracking-widest px-4 py-2 rounded-full whitespace-nowrap self-start md:self-auto ${formData.needsCopywriting ? 'bg-white/20' : 'bg-white border border-zinc-200 text-zinc-500'}`}>+€1,500</span>
                        </div>

                        <div className="bg-white p-8 md:p-12 rounded-[32px] border border-zinc-200 space-y-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-2">{t.discoveryPage?.form?.assets || "Asset Upload Center"}</label>

                            <div className="border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center bg-white hover:border-black transition-all relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                                <div className="space-y-4 pointer-events-none">
                                    {uploading ? (
                                        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                                    ) : (
                                        <svg className="w-10 h-10 text-zinc-300 group-hover:text-black transition-colors mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                    )}
                                    <p className="text-base font-bold tracking-tight text-black">{uploading ? (t.discoveryPage?.fileUploading || 'Transmitting Data Protocol...') : (t.discoveryPage?.fileClick || 'Click to Upload Materials')}</p>
                                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Logos, Wireframes, Brand Guidelines (Max 50MB)</p>
                                </div>
                            </div>

                            {formData.uploadedFiles.length > 0 && (
                                <div className="space-y-3 pt-6">
                                    {formData.uploadedFiles.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl">
                                            <span className="text-xs font-medium font-mono text-zinc-600 truncate max-w-[70%]">{file.name}</span>
                                            <button onClick={() => removeFile(i)} className="text-[10px] font-bold uppercase text-red-500 tracking-widest hover:text-red-700 transition-colors">Remove</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 6: INTEGRATION MATRIX */}
                {currentStep === 6 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">{t.discoveryPage?.form?.integrations || "Matrix."}</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">{t.discoveryPage?.form?.intDesc || "Select backend capabilities and API integrations."}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {INTEGRATION_OPTIONS.map(opt => {
                                const isSelected = formData.selectedIntegrations.includes(opt.id);
                                const isRestricted = formData.architecture === 'landing' && RESTRICTED_FOR_LANDING.includes(opt.id);

                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => {
                                            if (isRestricted) return;
                                            if (isSelected) setFormData({ ...formData, selectedIntegrations: formData.selectedIntegrations.filter(id => id !== opt.id) });
                                            else setFormData({ ...formData, selectedIntegrations: [...formData.selectedIntegrations, opt.id] });
                                        }}
                                        className={`p-6 md:p-8 rounded-[32px] border transition-all duration-300 flex flex-col gap-4 relative overflow-hidden
                                            ${isRestricted ? 'border-zinc-100 opacity-50 cursor-not-allowed grayscale' :
                                                isSelected ? 'border-black bg-black text-white shadow-md scale-[1.02]' :
                                                    'border-zinc-200 hover:border-black bg-white text-black cursor-pointer'}`}
                                    >
                                        <div className="flex justify-between items-start w-full relative z-10">
                                            <div className="flex flex-col gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border 
                                                    ${isRestricted ? 'border-zinc-200 text-zinc-400' : isSelected ? 'border-white/20 bg-white/10 text-white' : 'border-zinc-200 bg-white text-black'}`}>
                                                    {isRestricted ? <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg> : <div className="w-3 h-3 rounded-sm bg-current rotate-45" />}
                                                </div>
                                                <span className="text-xl font-light tracking-tight">{opt.label}</span>
                                            </div>
                                            {!isRestricted && (
                                                <span className={`text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap ${isSelected ? 'bg-white/20 text-white' : 'bg-white border border-zinc-200 text-zinc-500'}`}>
                                                    +€{opt.price.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-sm font-medium leading-relaxed mt-2 relative z-10 ${isSelected ? 'text-zinc-400' : isRestricted ? 'text-zinc-400 font-bold' : 'text-zinc-500'}`}>
                                            {isRestricted ? "Locked: Upgrade architecture to unlock this module." : opt.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 7: SECURITY & COMPLIANCE */}
                {currentStep === 7 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">Compliance.</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">Configure data residency and security standards.</p>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">Data Server Region</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['eu', 'us', 'global'].map(region => (
                                    <div key={region} onClick={() => setFormData({ ...formData, dataRegion: region })} className={`p-6 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between ${formData.dataRegion === region ? 'border-black shadow-md bg-black text-white' : 'border-zinc-200 hover:border-black bg-white text-black'}`}>
                                        <h3 className="font-light text-xl uppercase tracking-tight mb-2">{region === 'eu' ? 'EU (Frankfurt)' : region === 'us' ? 'US (N. Virginia)' : 'Global Edge CDN'}</h3>
                                        <p className={`text-xs font-medium ${formData.dataRegion === region ? 'text-zinc-400' : 'text-zinc-500'}`}>{region === 'eu' ? 'GDPR Compliant servers.' : region === 'us' ? 'Best for NA latency.' : 'Distributed assets.'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-4">Security Level</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div onClick={() => setFormData({ ...formData, complianceLevel: 'standard' })} className={`p-8 rounded-[32px] border cursor-pointer transition-all ${formData.complianceLevel === 'standard' ? 'border-black shadow-md bg-white' : 'border-zinc-200 hover:border-black bg-white'}`}>
                                    <h3 className="text-2xl font-light tracking-tight text-black mb-3">Standard Web Security</h3>
                                    <p className="text-sm font-medium text-zinc-500">Standard SSL, prepared SQL injection protection, and regular CSRF tokens. Included.</p>
                                </div>
                                <div onClick={() => setFormData({ ...formData, complianceLevel: 'strict' })} className={`p-8 rounded-[32px] border cursor-pointer transition-all flex flex-col justify-between ${formData.complianceLevel === 'strict' ? 'border-black shadow-md bg-black text-white scale-[1.02]' : 'border-zinc-200 hover:border-black bg-white'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-2xl font-light tracking-tight">Strict Compliance</h3>
                                        <span className={`text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1.5 rounded-full ${formData.complianceLevel === 'strict' ? 'bg-white/20' : 'bg-white border border-zinc-200 text-zinc-500'}`}>+€2,500</span>
                                    </div>
                                    <p className={`text-sm font-medium ${formData.complianceLevel === 'strict' ? 'text-zinc-400' : 'text-zinc-500'}`}>Full GDPR/HIPAA readiness, encrypted databases at rest, and extensive penetration testing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 8: LOGISTICS */}
                {currentStep === 8 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">{t.discoveryPage?.form?.timeline || "Logistics."}</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">{t.discoveryPage?.form?.timelineDesc || "Define delivery timeline and ongoing engineering retainer."}</p>
                        </div>

                        <div className="space-y-8">
                            {isComplexProject && (
                                <div className="bg-white p-6 rounded-3xl flex items-start gap-6 border border-zinc-200">
                                    <div className="w-10 h-10 rounded-full border border-zinc-200 bg-white flex items-center justify-center shrink-0">
                                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-black mb-1">{t.discoveryPage?.constraint?.title || "Scale Constraint Enforced"}</p>
                                        <p className="text-sm font-medium text-zinc-500">{t.discoveryPage?.constraint?.desc || "Due to the selected architecture complexity, standard timelines are disabled. Enterprise scale timeline is mandatory for quality assurance."}</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 space-y-6">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block border-b border-zinc-100 pb-4">Deployment Schedule</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TIMELINES.map(tInfo => {
                                        const isEnterprise = tInfo.id === 'enterprise';
                                        if (isEnterprise && !isComplexProject) return null;
                                        const isDisabled = isComplexProject && !isEnterprise;
                                        const isSelected = formData.timeline === tInfo.id;
                                        return (
                                            <div
                                                key={tInfo.id}
                                                onClick={() => !isDisabled && setFormData({ ...formData, timeline: tInfo.id })}
                                                className={`p-6 rounded-2xl border transition-all flex flex-col gap-2 
                                                    ${isDisabled ? 'opacity-30 cursor-not-allowed border-zinc-100 grayscale' : 'cursor-pointer hover:border-black'}
                                                    ${isSelected && !isDisabled ? 'border-black bg-black text-white shadow-md scale-[1.02]' : 'border-zinc-200 bg-white text-black'}
                                                `}
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <h3 className="text-lg font-light tracking-tight">{tInfo.label}</h3>
                                                    {isSelected && !isDisabled && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <p className={`text-xs font-medium ${isSelected && !isDisabled ? 'text-zinc-400' : 'text-zinc-500'}`}>{tInfo.desc}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-white p-8 md:p-10 rounded-[32px] border border-zinc-200 space-y-6">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block border-b border-zinc-100 pb-4">{t.discoveryPage?.form?.maintenance || "Continuous Engineering (Retainer)"}</label>
                                <div className="grid grid-cols-1 gap-4">
                                    {MAINTENANCE_OPTIONS.map(opt => {
                                        const isSelected = formData.maintenanceTier === opt.id;
                                        return (
                                            <div
                                                key={opt.id}
                                                onClick={() => setFormData({ ...formData, maintenanceTier: opt.id })}
                                                className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 
                                                      ${isSelected ? 'border-black bg-white shadow-sm' : 'border-zinc-200 hover:border-black bg-white'}
                                                `}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-5 h-5 mt-1 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-black bg-black' : 'border-zinc-300'}`}>
                                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-lg font-light tracking-tight ${isSelected ? 'text-black' : 'text-zinc-800'}`}>{opt.title}</h3>
                                                        <p className="text-sm font-medium text-zinc-500 mt-1">{opt.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end shrink-0 pl-9 md:pl-0">
                                                    <span className={`text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1.5 rounded-full ${isSelected ? 'bg-black text-white' : 'bg-white border border-zinc-200 text-zinc-500'}`}>
                                                        {opt.price > 0 ? `+€${opt.price} / mo` : 'No Cost'}
                                                    </span>
                                                    {opt.price > 0 && isSelected && <span className="text-[9px] font-bold text-black uppercase mt-2 tracking-widest">{t.discoveryPage?.form?.twoMonthsFreeBadge || "2 Months Free"}</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 9: FINAL AUTHORIZATION */}
                {currentStep === 9 && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-black">{t.discoveryPage?.form?.client || "Authorization."}</h1>
                            <p className="text-zinc-400 font-medium mt-6 text-lg tracking-tight">{t.discoveryPage?.form?.clientSub || "Finalize billing credentials to generate the official blueprint."}</p>
                        </div>

                        <div className="bg-white border border-zinc-200 p-8 md:p-12 rounded-[40px] space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-2">{t.discoveryPage?.form?.name || "Authorized Signatory *"}</label>
                                    <input type="text" placeholder="Full Name" required className="w-full bg-white border border-zinc-200 p-5 rounded-2xl outline-none text-base font-medium focus:border-black transition-all" value={formData.clientName} onChange={(e) => setFormData({ ...formData, clientName: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-2">{t.discoveryPage?.form?.email || "Corporate Email *"}</label>
                                    <input type="email" placeholder="name@company.com" required className="w-full bg-white border border-zinc-200 p-5 rounded-2xl outline-none text-base font-medium focus:border-black transition-all" value={formData.clientEmail} onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-2">{t.discoveryPage?.form?.phone || "Phone Number"}</label>
                                    <input type="tel" placeholder="+32..." className="w-full bg-white border border-zinc-200 p-5 rounded-2xl outline-none text-base font-medium focus:border-black transition-all" value={formData.clientPhone} onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-2">{t.discoveryPage?.form?.vat || "VAT Number"}</label>
                                    <input type="text" placeholder="BE0000..." className="w-full bg-white border border-zinc-200 p-5 rounded-2xl outline-none text-base font-medium focus:border-black transition-all" value={formData.vatNumber} onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest pl-2">{t.discoveryPage?.form?.address || "Billing Address *"}</label>
                                <textarea placeholder="Street, City, Postal Code, Country" required className="w-full bg-white border border-zinc-200 p-5 rounded-2xl outline-none text-base font-medium h-24 resize-none focus:border-black transition-all" value={formData.billingAddress} onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })} />
                            </div>

                            <div className="mt-8 p-6 bg-white border border-zinc-200 rounded-3xl flex items-start gap-5 hover:border-black transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })}>
                                <div className="mt-1">
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${formData.acceptedTerms ? 'bg-black border-black text-white' : 'border-zinc-300 bg-white'}`}>
                                        {formData.acceptedTerms && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-zinc-600 leading-relaxed flex-1 select-none">
                                    {t.discoveryPage?.termsAgree || "I acknowledge that I have read and agree to the "} <a href="/legal/terms" target="_blank" onClick={(e) => e.stopPropagation()} className="text-black font-bold underline hover:text-zinc-500 transition-colors">{t.discoveryPage?.termsLink || "Master Service Agreement"}</a>{t.discoveryPage?.termsDesc || ". I understand that this definitive blueprint forms the technical scope and billing terms of our collaboration."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 10: SUCCESS */}
                {currentStep === 10 && (
                    <div className="text-center space-y-12 animate-in zoom-in-95 py-16">
                        <div className="w-24 h-24 bg-white border border-zinc-200 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7"></path></svg>
                        </div>

                        <div>
                            <h2 className="text-5xl md:text-7xl font-light tracking-tighter text-black">{t.discoveryPage?.success?.title || "Protocol Logged."}</h2>
                            <p className="text-zinc-500 font-medium max-w-lg mx-auto mt-6 text-lg">
                                {t.discoveryPage?.success?.desc || "Architecture specifications secured. Engineering review pending."}
                            </p>
                        </div>

                        <div className="bg-white p-10 md:p-12 border border-zinc-200 rounded-[40px] max-w-md mx-auto text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" /></svg>
                            </div>

                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t.discoveryPage?.success?.dsNumber || "Deployment Reference"}</p>
                            <p className="text-4xl font-light tracking-tighter text-black mb-8">{discoveryId}</p>

                            <div className="pt-8 border-t border-zinc-100 flex justify-between items-end mb-6 relative z-10">
                                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1.5">CapEx Estimate</span>
                                <span className="text-3xl text-black font-light tracking-tighter">€{calculateTotal().toLocaleString()}</span>
                            </div>

                            {monthlyPrice > 0 && (
                                <div className="flex justify-between items-end mb-8 relative z-10">
                                    <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1.5">OpEx Retainer</span>
                                    <span className="text-xl text-zinc-800 font-light tracking-tight">+€{monthlyPrice}<span className="text-sm text-zinc-400">/mo</span></span>
                                </div>
                            )}

                            <button onClick={downloadClientCopy} disabled={downloadingPdf} className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 mt-4 relative z-10">
                                {downloadingPdf ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>}
                                {t.discoveryPage?.btn?.pdf || "Download Blueprint PDF"}
                            </button>
                        </div>

                        <div className="mt-12 flex flex-col items-center gap-4">
                            <button onClick={() => router.push('/')} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors underline underline-offset-8">{t.discoveryPage?.btn?.hub || "Return to Central Gateway"}</button>
                        </div>
                    </div>
                )}
            </div>

            {/* MOBILE BOTTOM BAR / DESKTOP STICKY SUBMIT */}
            {currentStep < 10 && (
                <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-zinc-200 p-5 md:p-8 z-40">
                    <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

                        <div className="flex flex-col">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1 hidden md:block">{t.discoveryPage?.summary?.total || "Live Calculation (€)"}</p>
                            <div className="flex items-end gap-3">
                                <p className="text-2xl md:text-4xl font-light tracking-tighter text-black">€{calculateTotal().toLocaleString()}</p>
                                {monthlyPrice > 0 && <span className="text-sm md:text-base text-zinc-500 font-medium mb-1">+€{monthlyPrice}/mo</span>}
                            </div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-1">{t.discoveryPage?.form?.exclVat || "Excl. VAT"}</p>
                        </div>

                        <div>
                            {currentStep === 9 ? (
                                <button onClick={submitDiscovery} disabled={loading || !isStepValid()} className="bg-black text-white px-8 md:px-16 py-4 md:py-5 rounded-full font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
                                    {loading ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t.discoveryPage?.btn?.encrypting || "Encrypting Protocol..."}</> : <>{t.discoveryPage?.btn?.submit || "Submit For Review"} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></>}
                                </button>
                            ) : (
                                <button onClick={nextStep} disabled={!isStepValid()} className="bg-black text-white px-8 md:px-16 py-4 md:py-5 rounded-full font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3">
                                    {t.discoveryPage?.btn?.next || "Next Phase"} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DefinitiveDiscoveryPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white font-mono text-xs uppercase tracking-widest text-zinc-400">Initializing Environment...</div>}>
            <DiscoveryFormContent />
        </Suspense>
    );
}