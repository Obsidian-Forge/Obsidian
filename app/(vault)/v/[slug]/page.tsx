// app/(vault)/v/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { ArrowRight, ShieldAlert, Lock } from 'lucide-react';

import { supabase } from '../../../../lib/supabase';
import { TechnicalAudit } from '../../../types/audit'; 
import ArchitectureSimulation from '../../../components/audit/ArchitectureSimulation';
import MetricGrid from '../../../components/audit/MetricGrid';

export const revalidate = 60; 

async function getAudit(slug: string): Promise<TechnicalAudit | null> {
  const { data } = await supabase.from('technical_audits').select('*').eq('slug', slug).single();
  return data;
}

export default async function VaultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const audit = await getAudit(slug);

  if (!audit) return notFound();

  const hasSecurityIssue = audit.has_security_issue || (audit.scores?.bestPractices && audit.scores.bestPractices < 70);

  return (
    <main className="min-h-screen bg-[#FCFCFC] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white pb-32">
      
      {/* HEADER LOGO */}
      <div className="absolute top-8 left-8 md:top-12 md:left-12 z-50 flex items-center gap-3">
         <img src="/logo.png" alt="Novatrum" className="h-6 opacity-80" />
         <span className="text-[10px] font-bold uppercase tracking-[0.3em] mt-0.5 text-zinc-800">Novatrum</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 relative z-10">
        
        {/* HERO */}
        <header className="mb-20 text-center flex flex-col items-center">
          <div className="inline-flex items-center px-5 py-2 mb-10 border border-zinc-200 rounded-full bg-white shadow-sm">
            <span className="text-[10px] font-bold tracking-[0.25em] text-zinc-500 uppercase">Confidential Audit Report</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-zinc-950 mb-8 leading-[1.1]">
            {audit.client_name} <br />
            <span className="text-zinc-400 font-medium italic">Infrastructure.</span>
          </h1>
          <a href={audit.target_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 border-b border-transparent hover:border-zinc-900 transition-all pb-1">
            {audit.target_url} <ArrowRight size={14} />
          </a>
        </header>

        {/* 1. METRİKLER */}
        {audit.scores && <MetricGrid scores={audit.scores} />}

        {/* 2. DİNAMİK SİMÜLASYON */}
        <div className="mt-32">
          <ArchitectureSimulation 
            heroImage={audit.images?.heroImage} 
            clientName={audit.client_name}
            legacyScore={audit.scores?.performance || 0}
            targetRevenue={audit.revenue_index || 26}
          />
        </div>

        {/* 3. GÜVENLİK VE DARBOĞAZLAR */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className={`p-10 border border-zinc-200 bg-white rounded-[32px] shadow-sm relative overflow-hidden ${hasSecurityIssue ? 'md:col-span-7' : 'md:col-span-12'}`}>
                <div className="flex items-start gap-5 mb-8 relative z-10">
                    <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl">
                        <ShieldAlert size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-light tracking-tight text-zinc-900 mb-2">Architecture Friction</h4>
                        <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-xl">
                          The following legacy systems rely on synchronous rendering, causing digital friction.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3 relative z-10">
                    {audit.legacy_stack?.map((tech: string) => (
                    <span key={tech} className="px-5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-medium text-zinc-600 shadow-sm">
                        {tech}
                    </span>
                    ))}
                </div>
            </div>

            {hasSecurityIssue && (
                <div className="p-10 border border-red-200 bg-red-50/50 rounded-[32px] shadow-sm relative overflow-hidden md:col-span-5">
                    <div className="flex items-start gap-5 relative z-10">
                        <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h4 className="text-xl font-light tracking-tight text-red-900 mb-2">Security Vulnerability</h4>
                            <p className="text-xs font-medium text-red-700/80 leading-relaxed">
                                <strong className="font-bold text-red-800">Critical:</strong> Your site architecture is triggering automated browser security warnings.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Text Only */}
        <div className="mt-40 text-center border-t border-zinc-100 pt-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
              Novatrum Engineering © 2026 — Private Audit Access
            </p>
        </div>
      </div>
    </main>
  );
}