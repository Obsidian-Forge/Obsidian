import { notFound } from 'next/navigation';
import { ShieldAlert, Lock, Activity, Globe, Layout, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // Yollar projene uygun olarak güncellendi

export const revalidate = 60;

// YENİ: Veritabanı yapımıza tam uyumlu arayüz
interface AuditData {
    id: string;
    created_at: string;
    slug: string;
    client_name: string;
    target_url: string;
    legacy_stack: string;
    perf: number;
    a11y: number;
    bp: number;
    seo: number;
    hero_image: string;
    ai_summary: string;
}

// DÜZELTME: technical_audits yerine doğru tablo olan audits kullanıldı
async function getAudit(slug: string): Promise<AuditData | null> {
  const { data, error } = await supabase.from('audits').select('*').eq('slug', slug).single();
  if (error) console.error("Fetch error:", error);
  return data;
}

export default async function VaultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const audit = await getAudit(slug);

  // Veri bulunamazsa 404 sayfasına at
  if (!audit) return notFound();

  // Basit bir güvenlik/eskilik kontrolü (jQuery, PHP vb. varsa uyarı ver)
  const hasSecurityIssue = audit.legacy_stack?.toLowerCase().includes('jquery') ||
                           audit.legacy_stack?.toLowerCase().includes('wordpress') ||
                           audit.legacy_stack?.toLowerCase().includes('php') ||
                           audit.bp < 70;

  const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
      if (score >= 50) return 'text-amber-500 bg-amber-50 border-amber-100';
      return 'text-red-500 bg-red-50 border-red-100';
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-black selection:text-white pb-32">
      {/* Üst Güvenlik Barı */}
      <div className="w-full bg-black text-white px-6 py-3 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
        <span>Novatrum Intelligence</span>
        <span className="text-emerald-400 flex items-center gap-2"><Lock size={12} /> Encrypted Vault Access</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-16">
        {/* Başlık Alanı */}
        <header className="mb-16 border-b border-zinc-200 pb-12">
          <h1 className="text-5xl font-light tracking-tighter text-zinc-900 mb-4">{audit.client_name}</h1>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
            <span className="flex items-center gap-1.5"><Globe size={14} /> {audit.target_url}</span>
            <span>•</span>
            <span>Report Generated: {new Date(audit.created_at).toLocaleDateString()}</span>
          </div>
        </header>

        {/* AI SUMMARY (YAPAY ZEKA YÖNETİCİ ÖZETİ) */}
        {audit.ai_summary && (
            <section className="mb-16 bg-black text-white p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 text-white/5 pointer-events-none">
                    <Activity size={160} />
                </div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2 relative z-10">
                    <CheckCircle2 size={16} /> Executive Summary
                </h2>
                <p className="text-base md:text-lg font-light leading-relaxed text-zinc-300 relative z-10 whitespace-pre-wrap">
                    {audit.ai_summary}
                </p>
            </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* SOL KOLON: Skorlar ve Teknoloji */}
            <div className="space-y-10">
                {/* Core Web Vitals */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 mb-6 flex items-center gap-2">
                        <Zap size={14} /> Core Web Vitals
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Performance', score: audit.perf },
                            { label: 'Accessibility', score: audit.a11y },
                            { label: 'Best Practices', score: audit.bp },
                            { label: 'SEO', score: audit.seo }
                        ].map((item, idx) => (
                            <div key={idx} className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${getScoreColor(item.score)}`}>
                                <span className="text-4xl font-light font-mono mb-2">{item.score}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legacy Stack */}
                <div className="bg-white p-8 rounded-[32px] border border-zinc-200 shadow-sm">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 mb-6 flex items-center gap-2">
                        <Layout size={14} /> Identified Infrastructure
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {audit.legacy_stack ? audit.legacy_stack.split(',').map((tech, idx) => (
                            <span key={idx} className="px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                {tech.trim()}
                            </span>
                        )) : <span className="text-sm text-zinc-400 italic">No specific legacy stack identified.</span>}
                    </div>
                </div>

                {/* Güvenlik Uyarısı (Şartlı Gösterim) */}
                {hasSecurityIssue && (
                    <div className="p-8 border border-red-200 bg-red-50 rounded-[32px] shadow-sm flex items-start gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-2xl shrink-0"><ShieldAlert size={20} /></div>
                        <div>
                            <h4 className="text-sm font-bold text-red-900 mb-1">Security & Modernization Risk</h4>
                            <p className="text-xs text-red-700 leading-relaxed">
                                The identified tech stack contains legacy components (e.g., outdated libraries or monolithic CMS) that pose security vulnerabilities and performance bottlenecks. An upgrade to a modern Node/React architecture is highly recommended.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* SAĞ KOLON: Müşterinin Sitesinin Ekran Görüntüsü */}
            <div>
                <div className="bg-white p-4 rounded-[32px] border border-zinc-200 shadow-sm h-full flex flex-col min-h-[400px]">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-4 mb-6 px-4 flex items-center gap-2">
                        <Layout size={14} /> Visual Capture
                    </h3>
                    <div className="flex-1 bg-zinc-50 rounded-[24px] border border-zinc-100 overflow-hidden flex items-center justify-center">
                        {audit.hero_image ? (
                            <img src={audit.hero_image} alt="Site Hero" className="w-full h-full object-cover object-top" />
                        ) : (
                            <span className="text-xs text-zinc-400 uppercase tracking-widest font-bold px-6 text-center">No Visual Captured</span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Footer / Call To Action */}
        <div className="mt-20 text-center">
            <a href="mailto:info@novatrum.eu" className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-xl">
                Request Architecture Upgrade <ArrowRight size={14} />
            </a>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-12 pb-10">
                Novatrum Engineering © 2026 — Confidential Report
            </p>
        </div>
      </div>
    </main>
  );
}