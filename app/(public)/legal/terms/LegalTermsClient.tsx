"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LegalTermsClient() {
  const { t } = useLanguage();

  const fallbackSections = [
    { num: '01', title: 'Scope of Work', desc: 'The services provided by Novatrum are strictly limited to the specifications outlined in the agreed blueprint. Any additional features, pages, or integrations requested after approval will be subject to additional billing at our standard hourly rate.' },
    { num: '02', title: 'Payment Terms', desc: 'Invoices are generated via our automated system. Unless an installment plan is specifically agreed upon, payments are required as specified on the invoice. Development will pause if payments are delayed beyond 14 days of the due date.' },
    { num: '03', title: 'Intellectual Property', desc: 'All source code, design assets, and intellectual property remain the sole property of Novatrum until the final invoice is paid in full. Upon full payment, a perpetual license to use the product is automatically transferred to the client.' },
    { num: '04', title: 'Maintenance & Hosting', desc: 'Unless a maintenance package is selected, Novatrum is not responsible for server uptime, security patches, or content updates after the final handover. Clients without a maintenance plan assume full responsibility for their digital infrastructure.' },
    { num: '05', title: 'Client Responsibilities', desc: 'The client agrees to provide all necessary assets (copywriting, branding, API keys) within the requested timeframes. Project timelines are contingent upon prompt client feedback and approvals.' },
    { num: '06', title: 'Limitation of Liability', desc: 'Novatrum engineers high-performance systems, but we cannot guarantee zero downtime or absolute immunity from cyber threats. Our maximum liability for any claim is limited to the total amount paid by the client for that specific project.' },
  ];

  const activeSections = t?.legal?.sections || fallbackSections;

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      <div className="max-w-3xl mx-auto px-6 pt-36 pb-32">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-20"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">
            {t?.legal?.pageTitle || "Legal Blueprint"}
          </p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">
            {t?.legal?.subtitle || "General Terms & Conditions"}
          </h1>
          <p className="text-sm text-zinc-400 font-light mt-3">
            {t?.legal?.desc || "The foundational parameters governing our engineering partnerships."}
          </p>
        </motion.div>

        <div className="space-y-16">
          {activeSections.map((section: any, index: number) => (
            <motion.section
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-5"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0 mt-1">
                {section.num}
              </span>
              <div>
                <h2 className="text-base font-light tracking-tight text-black mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">
                  {section.desc}
                </p>
              </div>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-24 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">
            {t?.legal?.footerInfo || "Have questions about these terms?"}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-zinc-800 transition-all"
          >
            Get in Touch <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}