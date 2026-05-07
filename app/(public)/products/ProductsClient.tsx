"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';

const icons: Record<string, any> = {
  Cpu: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  ShieldCheck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  BrainCircuit: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Network: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
};

export default function ProductsPage() {
  const { language, t } = useLanguage();
  const pData = t.productsPage;
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    const channel = supabase.channel('public:modules')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'modules' }, fetchProducts)
      .subscribe();
    return () => { clearInterval(interval); supabase.removeChannel(channel); };
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('modules').select('*').order('display_order', { ascending: true });
    if (data) setDbProducts(data);
    setLoading(false);
  };

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white">
      
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-32">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-24"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            {pData?.heroTag || "Our Products"}
          </p>
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter text-black leading-[1.1] max-w-2xl mx-auto">
            {pData?.heroTitleLine1}{' '}
            <span className="text-zinc-300">{pData?.heroTitleLine2}</span>
          </h1>
          <p className="text-sm text-zinc-400 font-light max-w-lg mx-auto leading-relaxed">
            {pData?.heroDesc}
          </p>
        </motion.div>

        {/* Products */}
        <div className="space-y-24">
          {dbProducts.length === 0 && !loading && (
            <p className="text-center text-zinc-400 text-xs font-light tracking-widest uppercase">No products yet.</p>
          )}

          {dbProducts.map((product, index) => {
            const content = product.content[language] || product.content['en'];
            const Icon = icons[product.icon_name] || icons.Network;
            const isComingSoon = product.status === 'coming-soon';

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
              >
                {/* Soldaki görsel kart */}
                <div className={`order-2 ${index % 2 === 1 ? 'md:order-1' : 'md:order-2'}`}>
                  <div className="relative aspect-[4/3] rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden flex items-center justify-center group">
                    {product.image_url ? (
                      <img src={product.image_url} alt={content.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                    ) : (
                      <div className="text-zinc-200 group-hover:text-zinc-400 transition-colors duration-500">
                        <Icon />
                      </div>
                    )}
                    {isComingSoon && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full">
                        <Clock size={12} /> Soon
                      </div>
                    )}
                  </div>
                </div>

                {/* Sağdaki içerik */}
                <div className={`order-1 ${index % 2 === 1 ? 'md:order-2' : 'md:order-1'} space-y-5`}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    {content.tagline}
                  </p>
                  <h2 className="text-2xl md:text-3xl font-light tracking-tight text-black">
                    {content.name}
                  </h2>
                  <p className="text-sm text-zinc-500 font-light leading-relaxed">
                    {content.description}
                  </p>

                  <ul className="space-y-2 pt-2">
                    {(content.features || []).slice(0, 4).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-500 font-light">
                        <CheckCircle2 size={14} className="text-zinc-300 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center gap-4 pt-4">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-[0.15em] rounded-xl hover:bg-zinc-800 transition-all"
                    >
                      {pData?.btnRequest || "Learn More"} <ArrowRight size={13} />
                    </Link>
                    {!isNaN(Number(product.price)) && (
                      <span className="text-xs text-zinc-400 font-light">
                        From <span className="text-black font-medium">€{product.price}</span>/mo
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 pt-16 border-t border-zinc-100 text-center"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
            {pData?.ctaTitle || "Ready to start?"}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all"
          >
            {pData?.btnConsult || "Get in Touch"} <ArrowRight size={14} />
          </Link>
        </motion.div>

      </div>
    </main>
  );
}