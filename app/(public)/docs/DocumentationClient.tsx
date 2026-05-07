"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Copy, CheckCircle2, Server, Mail, UserCircle, CheckSquare, Square, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { contentData, DocType } from "@/lib/docs-content";

export default function DocumentationClient() {
  const { language, t } = useLanguage();
  const [activeDoc, setActiveDoc] = useState<DocType>("dns");
  const [copied, setCopied] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const currentContent = contentData[activeDoc][language as "en" | "nl" | "fr" | "tr"] || contentData[activeDoc]["en"];
  const d = t.docs;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleChecklist = (index: number) => {
    const newList = [...checklist];
    newList[index] = !newList[index];
    setChecklist(newList);
  };

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      <div className="max-w-5xl mx-auto px-6 pt-36 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-4">{d.badge}</p>
          <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black leading-[1.1]">{currentContent.title}</h1>
          <p className="text-sm text-zinc-400 font-light mt-3 max-w-lg">{currentContent.description}</p>
        </motion.div>

        <div className="flex overflow-x-auto gap-2 mb-12 pb-2">
          {([
            { key: "dns", icon: Server, label: d.dnsTab },
            { key: "email", icon: Mail, label: d.emailTab },
            { key: "troubleshooting", icon: AlertTriangle, label: d.emergencyTab },
          ]).map((doc) => (
            <button key={doc.key} onClick={() => setActiveDoc(doc.key as DocType)} className={`flex items-center gap-2 px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all shrink-0 ${activeDoc === doc.key ? "bg-black text-white" : "bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-black"}`}>
              <doc.icon size={14} /> {doc.label}
            </button>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-10 p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-black mb-4">{currentContent.checklistTitle}</h4>
          <div className="space-y-3">
            {currentContent.checklistItems.map((item, i) => (
              <button key={i} onClick={() => toggleChecklist(i)} className="flex items-center gap-3 text-left w-full">
                {checklist[i] ? <CheckSquare size={18} className="text-emerald-500 shrink-0" /> : <Square size={18} className="text-zinc-300 shrink-0" />}
                <span className={`text-sm font-light ${checklist[i] ? "text-zinc-400 line-through" : "text-zinc-600"}`}>{item}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="space-y-12">
          {currentContent.steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <h3 className="text-base font-light tracking-tight text-black mb-4">{step.title}</h3>
              <p className="text-sm text-zinc-500 font-light leading-relaxed whitespace-pre-line">{step.content}</p>
              {step.warning && <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3"><AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" /><p className="text-sm text-red-600 font-light">{step.warning}</p></div>}
            </motion.div>
          ))}
        </div>

        {activeDoc === "dns" && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-16 p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-black mb-5">{d.quickCopy}</h4>
            <div className="space-y-3">
              {[{ label: "76.76.21.21", value: "76.76.21.21" }, { label: "cname.vercel-dns.com", value: "cname.vercel-dns.com" }].map((item) => (
                <div key={item.value} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-zinc-200">
                  <span className="text-sm font-mono text-zinc-700 truncate mr-4">{item.label}</span>
                  <button onClick={() => handleCopy(item.value)} className="text-zinc-400 hover:text-black shrink-0 p-1">
                    {copied === item.value ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="mt-16 text-center">
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-50 border border-zinc-200 text-black text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-zinc-100 transition-all">
            <Download size={14} /> {d.savePdf}
          </button>
        </div>
      </div>
    </main>
  );
}