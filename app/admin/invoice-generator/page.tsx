"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowLeft, Building, FileText, CheckCircle2, DownloadCloud, FileOutput, LayoutList, ChevronDown, Euro, CheckSquare, Square, Box, BrainCircuit } from 'lucide-react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage, pdf } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';

// --- SSR FIX: Dynamically import browser-dependent PDF components ---
const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), { ssr: false });
const PDFDownloadLink = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink), { ssr: false });

// --- PREMIUM PDF STİLLERİ ---
const styles = StyleSheet.create({
  page: { padding: 50, fontFamily: 'Helvetica', backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2 solid #18181b', paddingBottom: 25, marginBottom: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 45, height: 45, marginRight: 15 },
  companyInfo: { flexDirection: 'column', justifyContent: 'center' },
  companyName: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#18181b', letterSpacing: 1.5 },
  companySub: { fontSize: 8, color: '#71717a', letterSpacing: 2, marginTop: 4 },
  invoiceHeader: { alignItems: 'flex-end' },
  invoiceTitle: { fontSize: 32, fontFamily: 'Helvetica-Bold', color: '#18181b', letterSpacing: 2 },
  invoiceNumber: { fontSize: 11, color: '#71717a', marginTop: 6, fontFamily: 'Helvetica' },
  
  metaSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 45, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, border: '1 solid #e4e4e7' },
  metaBlock: { flexDirection: 'column' },
  metaLabel: { fontSize: 8, color: '#a1a1aa', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1 },
  metaTextBold: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: '#18181b', marginBottom: 3 },
  metaText: { fontSize: 10, color: '#52525b', marginBottom: 3 },
  
  tableHeader: { flexDirection: 'row', borderBottom: '1 solid #d4d4d8', paddingBottom: 10, marginBottom: 10 },
  col1: { width: '75%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#71717a', textTransform: 'uppercase', letterSpacing: 1 },
  col2: { width: '25%', fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#71717a', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'right' },
  
  tableRow: { flexDirection: 'row', paddingVertical: 15, borderBottom: '1 solid #f4f4f5' },
  cell1: { width: '75%', flexDirection: 'column' },
  itemTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#18181b', marginBottom: 8 },
  bulletRow: { flexDirection: 'row', marginBottom: 4, paddingLeft: 5 },
  bulletDot: { fontSize: 10, color: '#a1a1aa', marginRight: 6 },
  bulletText: { fontSize: 9, color: '#52525b', lineHeight: 1.4 },
  cell2: { width: '25%', fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#18181b', textAlign: 'right' },
  
  totalSection: { marginTop: 30, flexDirection: 'row', justifyContent: 'flex-end' },
  totalBox: { width: 250, backgroundColor: '#ffffff', padding: 20, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', border: '2 solid #18181b' },
  totalLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#18181b', textTransform: 'uppercase', letterSpacing: 1 },
  totalAmount: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#18181b' },
  
  disclaimerBox: { marginTop: 20, padding: 15, backgroundColor: '#f4f4f5', borderRadius: 8, borderLeft: '3 solid #18181b' },
  disclaimerTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#18181b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  disclaimerText: { fontSize: 8, color: '#52525b', lineHeight: 1.5 },

  footer: { position: 'absolute', bottom: 40, left: 50, right: 50, borderTop: '1 solid #e4e4e7', paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 8, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 1 }
});

const AVAILABLE_SERVICES = [
    { id: 'nexus_cx', name: 'Nexus CX Module', price: 49 },
    { id: 'sentinel', name: 'Sentinel Core Security', price: 99 },
    { id: 'architect', name: 'Architect AI Module', price: 79 },
    { id: 'neural_ai', name: 'Neural AI Token Allocation', price: 0 } // Fiyat planlardan gelecek
];

const NEURAL_PLANS = [
    { id: 'node', name: 'Node Plan (5,000 Tokens)', price: 39 },
    { id: 'core', name: 'Core Plan (25,000 Tokens)', price: 129 },
    { id: 'nexus', name: 'Nexus Plan (100,000 Tokens)', price: 399 }
];

// --- PDF COMPONENT ---
const InvoiceDocument = ({ data, client, options }: { data: any, client: any, options: any }) => (
  <Document title={`Novatrum_Architecture_${data.invoice_number}_${client?.company_name || client?.full_name || 'Client'}.pdf`}>    
    <Page size="A4" style={styles.page}>
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <PDFImage src="/logo.png" style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>NOVATRUM</Text>
            <Text style={styles.companySub}>INFRASTRUCTURE & SAAS</Text>
          </View>
        </View>
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceTitle}>DOCUMENT</Text>
          <Text style={styles.invoiceNumber}>{data.invoice_number}</Text>
        </View>
      </View>

      <View style={styles.metaSection}>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Prepared For</Text>
          <Text style={styles.metaTextBold}>{client?.company_name || client?.full_name || 'Client Name'}</Text>
          {client?.company_name && <Text style={styles.metaText}>{client.full_name}</Text>}
          <Text style={styles.metaText}>{client?.address || 'Address not provided'}</Text>
          <Text style={[styles.metaTextBold, { marginTop: 5 }]}>{client?.email}</Text>
        </View>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Issue Date</Text>
          <Text style={styles.metaTextBold}>{new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      <View style={styles.tableHeader}>
        <Text style={styles.col1}>Items & Particulars</Text>
        <Text style={styles.col2}>Amount</Text>
      </View>

      {/* DİNAMİK: SADECE SEÇİLENLER EKRANA BASILIR */}
      {options.includeItems.project && (
        <View style={styles.tableRow}>
            <View style={styles.cell1}>
            <Text style={styles.itemTitle}>{data.project_title || 'Custom Architecture Deployment'}</Text>
            {data.features_text.split('\n').map((line: string, i: number) => line.trim() ? (
                <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{line.trim()}</Text>
                </View>
            ) : null)}
            </View>
            <Text style={styles.cell2}>€ {parseFloat(data.amount || 0).toFixed(2)}</Text>
        </View>
      )}

      {options.includeItems.maintenance && parseFloat(data.maintenance_fee) > 0 && (
        <View style={styles.tableRow}>
          <View style={styles.cell1}>
            <Text style={styles.itemTitle}>Monthly Maintenance & Infrastructure</Text>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Server Hosting & Database Provisioning</Text>
            </View>
            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Continuous Security Updates & Support</Text>
            </View>
          </View>
          <Text style={styles.cell2}>€ {parseFloat(data.maintenance_fee).toFixed(2)}</Text>
        </View>
      )}

      {options.includeItems.services && options.selectedServices.map((srvId: string) => {
          const isNeural = srvId === 'neural_ai';
          const planInfo = isNeural ? NEURAL_PLANS.find(p => p.id === options.neuralPlan) : null;
          const srvName = isNeural ? `Neural AI Engine - ${planInfo?.name}` : AVAILABLE_SERVICES.find(s => s.id === srvId)?.name;
          const srvPrice = isNeural ? planInfo?.price : AVAILABLE_SERVICES.find(s => s.id === srvId)?.price;
          
          return (
              <View style={styles.tableRow} key={srvId}>
                  <View style={styles.cell1}>
                      <Text style={styles.itemTitle}>{srvName}</Text>
                  </View>
                  <Text style={styles.cell2}>€ {parseFloat(srvPrice?.toString() || '0').toFixed(2)}</Text>
              </View>
          );
      })}

      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalAmount}>€ {options.calculatedTotal.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Important Payment Notice</Text>
        <Text style={styles.disclaimerText}>
          This document serves as a detailed breakdown of the agreed architecture and services. It is not the final tax invoice.
          The official invoice will be issued and processed by our financial partner, Tentoo.
          Please hold all payments until you receive the official Tentoo invoice and follow the specific payment instructions provided therein.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={{ flexDirection: 'column' }}>
          <Text style={[styles.footerText, { marginBottom: 4 }]}>NOVATRUM HQ</Text>
          <Text style={styles.footerText}>THANK YOU FOR YOUR BUSINESS</Text>
        </View>
        <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text style={[styles.footerText, { marginBottom: 4 }]}>Support & Inquiries</Text>
          <Text style={{ fontSize: 8, color: '#71717a', letterSpacing: 0.5 }}>
            support@novatrum.eu  •  info@novatrum.eu
          </Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function InvoiceGeneratorPage() {
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'preview'>('form');
    const [isClientSide, setIsClientSide] = useState(false);
    
    const [clients, setClients] = useState<any[]>([]);
    const [discoveries, setDiscoveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [form, setForm] = useState({
        client_id: '',
        discovery_id: '',
        project_title: '',
        features_text: '',
        amount: '',
        maintenance_fee: '0',
        invoice_number: `INV-${Date.now().toString().slice(-6)}`
    });

    const [includeItems, setIncludeItems] = useState({
        project: true,
        maintenance: false,
        services: false
    });

    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [neuralPlan, setNeuralPlan] = useState<string>('node');
    const [calculatedTotal, setCalculatedTotal] = useState<number>(0);

    const [discSearch, setDiscSearch] = useState('');
    const [isDiscOpen, setIsDiscOpen] = useState(false);
    const [clientSearch, setClientSearch] = useState('');
    const [isClientOpen, setIsClientOpen] = useState(false);

    useEffect(() => {
        setIsClientSide(true);
        fetchInitialData();
    }, []);

    useEffect(() => {
        let total = 0;
        if (includeItems.project && form.amount) total += parseFloat(form.amount);
        if (includeItems.maintenance && form.maintenance_fee) total += parseFloat(form.maintenance_fee);
        if (includeItems.services) {
            selectedServices.forEach(srvId => {
                if (srvId === 'neural_ai') {
                    const plan = NEURAL_PLANS.find(p => p.id === neuralPlan);
                    if (plan) total += plan.price;
                } else {
                    const srv = AVAILABLE_SERVICES.find(s => s.id === srvId);
                    if (srv) total += srv.price;
                }
            });
        }
        setCalculatedTotal(total);
    }, [includeItems, form.amount, form.maintenance_fee, selectedServices, neuralPlan]);

    const fetchInitialData = async () => {
        try {
            const [clientsRes, discRes] = await Promise.all([
                supabase.from('clients').select('*').is('deleted_at', null),
                supabase.from('project_discovery').select('*').order('created_at', { ascending: false })
            ]);
            if (clientsRes.data) setClients(clientsRes.data);
            if (discRes.data) setDiscoveries(discRes.data);
        } catch (error) { 
            console.error(error);
        } finally { 
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filteredDiscoveries = discoveries.filter(d => 
        (d.discovery_number?.toLowerCase() || '').includes(discSearch.toLowerCase()) ||
        (d.client_name?.toLowerCase() || '').includes(discSearch.toLowerCase()) ||
        (d.client_email?.toLowerCase() || '').includes(discSearch.toLowerCase())
    );

    const filteredClients = clients.filter(c => 
        (c.company_name?.toLowerCase() || '').includes(clientSearch.toLowerCase()) ||
        (c.full_name?.toLowerCase() || '').includes(clientSearch.toLowerCase()) ||
        (c.email?.toLowerCase() || '').includes(clientSearch.toLowerCase())
    );

    const toggleService = (srvId: string) => {
        if (selectedServices.includes(srvId)) {
            setSelectedServices(prev => prev.filter(id => id !== srvId));
        } else {
            setSelectedServices(prev => [...prev, srvId]);
        }
    };

    const handleSelectDiscovery = (d: any) => {
        setDiscSearch(`${d.discovery_number} - ${d.client_name}`);
        setIsDiscOpen(false);
        
        let targetClientId = form.client_id;
        let targetClientSearch = clientSearch;

        if (d.client_email && d.client_name) {
            const matchedClient = clients.find(c => 
                c.email.toLowerCase() === d.client_email.toLowerCase() &&
                (c.full_name?.toLowerCase() === d.client_name?.toLowerCase() || c.company_name?.toLowerCase() === d.client_name?.toLowerCase())
            );
            if (matchedClient) {
                targetClientId = matchedClient.id;
                targetClientSearch = matchedClient.company_name || matchedClient.full_name;
                showToast("Exact Entity Match Found & Linked!", "success");
            } else {
                showToast("Discovery loaded, but no exact matching Entity found. Please select manually.", "error");
            }
        }

        const details = d.details || {};
        let parsedMaintenance = 0;

        const maintKey = Object.keys(details).find(k => k.toLowerCase().includes('maintenance') || k.toLowerCase().includes('support'));
        if (maintKey && details[maintKey]) {
            const rawVal = String(details[maintKey]);
            const match = rawVal.match(/€\s*(\d+)/) || rawVal.match(/(\d+)/); 
            if (match) {
                parsedMaintenance = parseInt(match[1], 10);
            } else if (rawVal.toLowerCase() === 'yes') {
                parsedMaintenance = 99;
            }
        }

        const extractedBullets = Object.entries(details)
            .filter(([k, v]) => v && k.toLowerCase() !== 'description')
            .map(([k, v]) => {
                const cleanKey = k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return `${cleanKey}: ${v}`;
            })
            .join('\n');

        setForm(prev => ({
            ...prev,
            discovery_id: d.id,
            client_id: targetClientId,
            project_title: `${d.project_type || 'Architecture Deployment'} - ${details.description || 'Core Systems'}`,
            features_text: extractedBullets,
            amount: d.estimated_price?.toString() || '',
            maintenance_fee: parsedMaintenance.toString() 
        }));
        
        setClientSearch(targetClientSearch);
    };

    const handleSelectClient = (c: any) => {
        setClientSearch(c.company_name || c.full_name);
        setForm(prev => ({ ...prev, client_id: c.id }));
        setIsClientOpen(false);
    };

    const selectedClientObj = clients.find(c => c.id === form.client_id);
    const cleanName = (selectedClientObj?.company_name || selectedClientObj?.full_name || 'Client').replace(/\s+/g, '_');
    const safeFileName = `Novatrum_Architecture_${form.invoice_number}_${cleanName}.pdf`;

    const handleConfirmAndUpload = async () => {
        if (!selectedClientObj) return;
        setIsGenerating(true);
        const pdfOptions = { includeItems, selectedServices, neuralPlan, calculatedTotal };

        try {
            const pdfBlob = await pdf(<InvoiceDocument data={form} client={selectedClientObj} options={pdfOptions} />).toBlob();
            const filePath = `${selectedClientObj.id}/invoice/${safeFileName}`;

            const { error: uploadError } = await supabase.storage
                .from('vault')
                .upload(filePath, pdfBlob, { contentType: 'application/pdf', upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('vault').getPublicUrl(filePath);
            const fileSize = (pdfBlob.size / 1024 / 1024).toFixed(2) + ' MB';

            // Fixed: Targets client_invoices, uncomments file data, and ensures status is compliant
            const { error: dbError } = await supabase.from('client_invoices').insert([{
                client_id: selectedClientObj.id,
                amount: calculatedTotal,
                status: 'draft', 
                file_name: safeFileName,
                file_url: publicUrlData.publicUrl,
                file_size: fileSize,
                invoice_type: 'system',
                details: { title: form.project_title, features: form.features_text, discovery_id: form.discovery_id, inclusions: includeItems }
            }]);

            if (dbError) throw dbError;

            showToast("Document Safely Vaulted!");
            setTimeout(() => router.push(`/admin/clients/${selectedClientObj.id}`), 1500);
        } catch (error: any) {
            showToast(error.message, "error");
            setIsGenerating(false);
        }
    };

    if (loading || !isClientSide) return <div className="h-[50vh] flex items-center justify-center text-[10px] uppercase font-bold text-zinc-400">Loading Generator...</div>;
    const pdfOptions = { includeItems, selectedServices, neuralPlan, calculatedTotal };

    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl border flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <button onClick={() => step === 'preview' ? setStep('form') : router.back()} className="mb-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors w-fit">
                <ArrowLeft size={14}/> {step === 'preview' ? 'Back to Config' : 'Back to Hub'}
            </button>

            <header className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-zinc-900 mb-2">Invoice Generator</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                        {step === 'form' ? 'Link intelligence, auto-fill parameters, and compile.' : 'Review True-PDF rendering before pushing to vault.'}
                    </p>
                </div>
                {step === 'form' && (
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1">Live Total</span>
                        <span className="text-3xl font-mono font-bold text-emerald-500 tracking-tighter">€{calculatedTotal.toFixed(2)}</span>
                    </div>
                )}
            </header>

            {step === 'form' ? (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={(e) => { e.preventDefault(); setStep('preview'); }} className="space-y-8">
                    
                    <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-4 relative">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><LayoutList size={14}/> Intelligence Blueprint</h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input 
                                autoComplete="off" spellCheck="false"
                                value={discSearch} 
                                onChange={(e) => setDiscSearch(e.target.value)}
                                onClick={() => setIsDiscOpen(!isDiscOpen)}
                                placeholder="Search by email, name or ID to auto-fill..."
                                className="w-full bg-zinc-50 border border-zinc-200 pl-10 pr-10 py-4 rounded-xl text-sm outline-none focus:border-black transition-colors cursor-pointer"
                            />
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                        </div>
                        {isDiscOpen && (
                            <div className="absolute z-50 left-8 right-8 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                {filteredDiscoveries.map(d => (
                                    <div key={d.id} onClick={() => handleSelectDiscovery(d)} className="p-4 border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer flex justify-between items-center group">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900">{d.discovery_number} <span className="font-normal text-zinc-500 ml-2">({d.project_type})</span></p>
                                            <p className="text-[10px] uppercase font-bold text-zinc-400 mt-1">{d.client_name} • {d.client_email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-4 relative">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><Building size={14}/> Target Vault Entity</h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input 
                                autoComplete="off" spellCheck="false"
                                required value={clientSearch} 
                                onChange={(e) => { setClientSearch(e.target.value); setForm({...form, client_id: ''}); }}
                                onClick={() => setIsClientOpen(!isClientOpen)}
                                placeholder="Select registered entity..."
                                className={`w-full bg-zinc-50 border pl-10 pr-10 py-4 rounded-xl text-sm outline-none transition-colors cursor-pointer ${form.client_id ? 'border-emerald-200 focus:border-emerald-500' : 'border-zinc-200 focus:border-black'}`}
                            />
                            {form.client_id ? <CheckCircle2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" /> : <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />}
                        </div>
                        {isClientOpen && (
                            <div className="absolute z-40 left-8 right-8 mt-2 bg-white border border-zinc-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                {filteredClients.map(c => (
                                    <div key={c.id} onClick={() => handleSelectClient(c)} className="p-4 border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer flex justify-between items-center group">
                                        <div>
                                            <p className="text-xs font-bold text-zinc-900">{c.company_name || c.full_name}</p>
                                            <p className="text-[10px] uppercase font-bold text-zinc-400 mt-1">{c.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 flex items-center gap-2"><FileText size={14}/> Architecture Particulars</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 block">Project Title</label>
                                <input required value={form.project_title} onChange={e => setForm({...form, project_title: e.target.value})} placeholder="e.g., Landing Architecture - Core Systems" className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-xl text-sm font-bold outline-none focus:border-black" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center justify-between">
                                    <span>Architecture Details (Bullet Points)</span>
                                </label>
                                <textarea required value={form.features_text} onChange={e => setForm({...form, features_text: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-xl text-sm leading-relaxed outline-none focus:border-black min-h-[120px] resize-none" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5"><Euro size={12}/> Project Base Price</label>
                                <input required type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-xl text-lg font-mono outline-none focus:border-black" />
                            </div>
                            <div>
                                <label className="text-[9px] font-bold uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5"><Euro size={12}/> Monthly Maintenance</label>
                                <input required type="number" step="0.01" value={form.maintenance_fee} onChange={e => setForm({...form, maintenance_fee: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 px-5 py-4 rounded-xl text-lg font-mono outline-none focus:border-black" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-black p-8 rounded-[32px] text-white shadow-xl space-y-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-white/10 pb-4 flex items-center gap-2">
                            <Box size={14}/> Invoice Inclusions
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed mb-4">Select exactly what you want to charge the client for on this specific invoice document.</p>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            <label className={`flex-1 p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${includeItems.project ? 'bg-white text-black border-white' : 'bg-black text-white border-white/20 hover:border-white/50'}`}>
                                <input type="checkbox" className="hidden" checked={includeItems.project} onChange={() => setIncludeItems(p => ({...p, project: !p.project}))} />
                                {includeItems.project ? <CheckSquare size={18} /> : <Square size={18} className="opacity-50" />}
                                <span className="text-xs font-bold uppercase tracking-widest mt-0.5">Project Base</span>
                            </label>
                            
                            <label className={`flex-1 p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${includeItems.maintenance ? 'bg-white text-black border-white' : 'bg-black text-white border-white/20 hover:border-white/50'}`}>
                                <input type="checkbox" className="hidden" checked={includeItems.maintenance} onChange={() => setIncludeItems(p => ({...p, maintenance: !p.maintenance}))} />
                                {includeItems.maintenance ? <CheckSquare size={18} /> : <Square size={18} className="opacity-50" />}
                                <span className="text-xs font-bold uppercase tracking-widest mt-0.5">Maintenance</span>
                            </label>

                            <label className={`flex-1 p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${includeItems.services ? 'bg-white text-black border-white' : 'bg-black text-white border-white/20 hover:border-white/50'}`}>
                                <input type="checkbox" className="hidden" checked={includeItems.services} onChange={() => setIncludeItems(p => ({...p, services: !p.services}))} />
                                {includeItems.services ? <CheckSquare size={18} /> : <Square size={18} className="opacity-50" />}
                                <span className="text-xs font-bold uppercase tracking-widest mt-0.5">Services / AI</span>
                            </label>
                        </div>

                        <AnimatePresence>
                            {includeItems.services && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-4">
                                    <div className="bg-white/5 rounded-[24px] p-6 border border-white/10 space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Select Active Modules</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {AVAILABLE_SERVICES.map(srv => (
                                                <div key={srv.id} onClick={() => toggleService(srv.id)} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${selectedServices.includes(srv.id) ? 'bg-emerald-500/20 border-emerald-500/50 text-white' : 'bg-transparent border-white/10 text-zinc-400 hover:border-white/30 hover:text-zinc-200'}`}>
                                                    <div className="flex items-center gap-2">
                                                        {selectedServices.includes(srv.id) ? <CheckCircle2 size={14} className="text-emerald-400"/> : <div className="w-3.5 h-3.5 rounded-full border border-white/20"/>}
                                                        <span className="text-xs font-bold">{srv.name}</span>
                                                    </div>
                                                    {srv.price > 0 && <span className="text-xs font-mono font-bold tracking-widest">€{srv.price}</span>}
                                                </div>
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {selectedServices.includes('neural_ai') && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="pt-4 border-t border-white/10 mt-4">
                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2"><BrainCircuit size={12}/> Neural Allocation Tier</label>
                                                    <div className="flex flex-wrap gap-3">
                                                        {NEURAL_PLANS.map(plan => (
                                                            <button type="button" key={plan.id} onClick={(e) => { e.stopPropagation(); setNeuralPlan(plan.id); }} className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${neuralPlan === plan.id ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30'}`}>
                                                                <div className="uppercase tracking-widest mb-1">{plan.name.split('(')[0]}</div>
                                                                <div className="font-mono text-[10px] opacity-70">€{plan.price}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button type="submit" disabled={!form.client_id || (!includeItems.project && !includeItems.maintenance && !includeItems.services)} className="w-full bg-black text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                        <FileOutput size={14}/> Render Document (€{calculatedTotal.toFixed(2)})
                    </button>
                </motion.form>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                    
                    <div className="flex justify-between items-center bg-white p-4 rounded-[20px] border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Document Ready</p>
                                <p className="text-[9px] text-zinc-400 font-mono">{safeFileName}</p>
                            </div>
                        </div>

                        <PDFDownloadLink 
                            document={<InvoiceDocument data={form} client={selectedClientObj} options={pdfOptions} />} 
                            fileName={safeFileName}
                            className="bg-black text-white px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2 shadow-lg shadow-black/10"
                        >
                            {({ loading }) => (
                                loading ? 'Preparing...' : <><DownloadCloud size={14}/> Download PDF</>
                            )}
                        </PDFDownloadLink>
                    </div>

                    <div className="bg-zinc-100 p-4 rounded-[32px] border border-zinc-200 h-[750px] shadow-inner overflow-hidden">
                        <PDFViewer width="100%" height="100%" className="rounded-[20px] border-0">
                            <InvoiceDocument data={form} client={selectedClientObj} options={pdfOptions} />
                        </PDFViewer>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setStep('form')} className="flex-1 bg-white text-zinc-600 border border-zinc-200 py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-colors">
                            Edit Parameters
                        </button>
                        <button onClick={handleConfirmAndUpload} disabled={isGenerating} className="flex-[2] bg-emerald-600 text-white py-5 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                            {isGenerating ? "Encrypting..." : <><DownloadCloud size={14}/> Confirm & Store in Vault ({selectedClientObj?.email})</>}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}