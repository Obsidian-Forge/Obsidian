"use client";

import React, { useState } from 'react';
import FadeUp from '../components/FadeUp'; 
import { useLanguage } from '../../context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const data = t.contactPage;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const object = Object.fromEntries(formData);
    
    const fullMessage = `Category: ${object.category}\n\nMessage:\n${object.message}`;

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'contact',
          clientName: object.name,
          email: object.email,
          message: fullMessage
        })
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error submitting form.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data || !data.form) return <div className="pt-40 text-center text-zinc-500">Loading translations...</div>;

  return (
    <main className="w-full bg-white min-h-screen relative overflow-hidden">
      
      <div className="absolute top-[-5%] left-[-5%] w-[600px] h-[600px] bg-purple-100/40 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply" />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-40 relative z-10">
        
        <FadeUp>
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-slate-800 to-indigo-900 leading-[1.1] pb-2">
              {data.title} <br/>
              <span className="text-zinc-400 italic font-light">{data.subtitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              {data.desc}
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-32 border-b border-zinc-100/50 pb-32">
          
          <FadeUp delay={100}>
            <div className="space-y-16">
              <div className="space-y-6">
                <h2 className="text-3xl font-medium text-black tracking-tight italic">{data.studioName}</h2>
                <div className="p-8 rounded-[32px] bg-white/60 backdrop-blur-md border border-zinc-200/60 shadow-sm inline-block relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <p className="text-zinc-500 font-bold text-[10px] tracking-[0.2em] uppercase text-left leading-relaxed relative z-10">
                    {data.studioLoc} <br />
                    {data.studioOper}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400 border-l-2 border-indigo-200 pl-4">
                  {data.roadmapTitle}
                </h4>
                <div className="space-y-8">
                  {data.steps?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-6 items-start group">
                      <span className="text-xs font-black text-white px-3 py-2 bg-gradient-to-br from-zinc-900 to-black rounded-xl tracking-tighter shadow-md group-hover:shadow-indigo-900/20 transition-all">
                        {item.s}
                      </span>
                      <div className="space-y-1 text-left">
                        <h5 className="text-lg font-bold text-black">{item.t}</h5>
                        <p className="text-sm text-zinc-500 font-light leading-relaxed max-w-sm">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50/80 backdrop-blur-sm border border-emerald-100/50 w-fit shadow-sm">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em]">{data.badge}</p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={200}>
            <div className="p-10 md:p-14 rounded-[40px] bg-zinc-950 shadow-2xl min-h-[500px] flex flex-col justify-center relative overflow-hidden group">
              
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay transition-opacity duration-1000 group-hover:opacity-40"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/40 rounded-full blur-[100px] pointer-events-none -z-0 opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />

              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10" suppressHydrationWarning>
                  <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">{data.form.nameLabel}</label>
                      <input type="text" name="name" required placeholder={data.form.namePlaceholder} className="w-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm rounded-[24px] px-6 py-4 text-white text-sm focus:border-indigo-400 transition-all outline-none placeholder:text-zinc-500" suppressHydrationWarning />
                    </div>
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">{data.form.emailLabel}</label>
                      <input type="email" name="email" required placeholder={data.form.emailPlaceholder} className="w-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm rounded-[24px] px-6 py-4 text-white text-sm focus:border-indigo-400 transition-all outline-none placeholder:text-zinc-500" suppressHydrationWarning />
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">{data.form.categoryLabel}</label>
                    <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-[24px] px-6 py-4 text-zinc-300 text-sm font-medium shadow-sm" suppressHydrationWarning>
                      {data.form.categoryValue}
                    </div>
                    <input type="hidden" name="category" value={data.form.categoryValue} suppressHydrationWarning />
                  </div>

                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">{data.form.briefLabel}</label>
                    <textarea name="message" required rows={4} placeholder={data.form.briefPlaceholder} className="w-full bg-white/5 backdrop-blur-md border border-white/10 shadow-sm rounded-[24px] px-6 py-4 text-white text-sm focus:border-indigo-400 transition-all outline-none resize-none placeholder:text-zinc-500" suppressHydrationWarning></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-all disabled:opacity-50"
                    suppressHydrationWarning
                  >
                    {isSubmitting ? data.form.sending : data.form.submit}
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500 relative z-10">
                  <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto shadow-xl shadow-white/10">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{data.success.title}</h3>
                  <p className="text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
                    {data.success.desc}
                  </p>
                  <button onClick={() => setIsSuccess(false)} className="mt-8 px-8 py-4 bg-white/10 border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-white hover:text-black hover:shadow-md transition-all">
                    {data.success.button}
                  </button>
                </div>
              )}

            </div>
          </FadeUp>
        </div>

        <section className="mt-40">
          <FadeUp>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-1 space-y-6 text-left">
                <h3 className="text-4xl md:text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-indigo-900 tracking-tight italic leading-tight pb-2">
                  {data.faqTitle} <br/>{data.faqSubtitle}
                </h3>
                <p className="text-zinc-500 font-light leading-relaxed">{data.faqDesc}</p>
              </div>
              
              <div className="lg:col-span-2 space-y-12 text-left">
                {data.faqs?.map((faq: any, i: number) => (
                  <div key={i} className="group border-b border-zinc-100/50 pb-10">
                    <h4 className="text-xl font-bold text-black group-hover:text-indigo-900 transition-colors duration-300">
                      {faq.q}
                    </h4>
                    <p className="text-zinc-500 mt-4 font-light leading-relaxed max-w-2xl">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </section>

      </div>
    </main>
  );
}