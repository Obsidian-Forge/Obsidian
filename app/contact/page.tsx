"use client";

import React, { useState } from 'react';
import FadeUp from '../components/FadeUp'; // Kendi FadeUp bileşenini kullandığını varsayıyorum
import { useLanguage } from '../../context/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const data = t.contactPage;

  // Form durumlarını takip etmek için state'ler ekliyoruz
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sayfa yenilenmesini engelleyip veriyi arka planda gönderen fonksiyon
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    // Kendi Access Key'ini buraya yazacaksın
    formData.append("access_key", "0ca2b8a6-eeb6-4866-841b-ac00ee601416");
    formData.append("subject", "New Inquiry from Obsidian Website");
    formData.append("from_name", "Obsidian Studio Contact Form");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        setIsSuccess(true); // Başarılı olursa formu gizle, mesajı göster
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

  // Eğer translations.ts içinde 'contactPage' henüz yoksa sayfanın çökmesini engellemek için güvenlik kontrolü
  if (!data) return <div className="pt-40 text-center text-zinc-500">Loading translations...</div>;

  return (
    <main className="w-full bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-40 overflow-hidden">
        
        {/* Page Header */}
        <FadeUp>
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-black leading-none">
              {data.title} <br/>
              <span className="text-zinc-400 italic font-light">{data.subtitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              {data.desc}
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-32 border-b border-zinc-100 pb-32">
          
          {/* Left Side: Roadmap & Presence */}
          <FadeUp delay={100}>
            <div className="space-y-16">
              <div className="space-y-6">
                <h2 className="text-3xl font-medium text-black tracking-tight italic">{data.studioName}</h2>
                <div className="p-8 rounded-[24px] bg-zinc-50 border border-zinc-100 inline-block">
                  <p className="text-zinc-500 font-bold text-[10px] tracking-[0.2em] uppercase text-left leading-relaxed">
                    {data.studioLoc} <br />
                    {data.studioOper}
                  </p>
                </div>
              </div>

              {/* The Roadmap */}
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 border-l-2 border-zinc-200 pl-4">
                  {data.roadmapTitle}
                </h4>
                <div className="space-y-8">
                  {data.steps.map((item: any, i: number) => (
                    <div key={i} className="flex gap-6 items-start">
                      <span className="text-xs font-black text-white px-2.5 py-1.5 bg-black rounded-md tracking-tighter shadow-sm">
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

              {/* Availability Badge */}
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 w-fit">
                <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em]">{data.badge}</p>
              </div>
            </div>
          </FadeUp>

          {/* Right Side: Contact Form (AJAX Integrated) */}
          <FadeUp delay={200}>
            <div className="p-10 md:p-14 rounded-[40px] bg-zinc-50 border border-zinc-100 shadow-sm min-h-[500px] flex flex-col justify-center">
              
              {!isSuccess ? (
                // FORM HENÜZ GÖNDERİLMEDİYSE FORMU GÖSTER
                <form onSubmit={handleSubmit} className="space-y-8" suppressHydrationWarning>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">{data.form.nameLabel}</label>
                      <input type="text" name="name" required placeholder={data.form.namePlaceholder} className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-black text-sm focus:border-black transition-all outline-none" suppressHydrationWarning />
                    </div>
                    <div className="space-y-3 text-left">
                      <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">{data.form.emailLabel}</label>
                      <input type="email" name="email" required placeholder={data.form.emailPlaceholder} className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-black text-sm focus:border-black transition-all outline-none" suppressHydrationWarning />
                    </div>
                  </div>
                  
                  {/* Fixed Category Display */}
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">{data.form.categoryLabel}</label>
                    <div className="w-full bg-white border border-zinc-100 rounded-2xl px-5 py-4 text-zinc-500 text-sm font-medium" suppressHydrationWarning>
                      {data.form.categoryValue}
                    </div>
                    {/* Hidden input to pass the category to email */}
                    <input type="hidden" name="category" value={data.form.categoryValue} suppressHydrationWarning />
                  </div>

                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">{data.form.briefLabel}</label>
                    <textarea name="message" required rows={4} placeholder={data.form.briefPlaceholder} className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-black text-sm focus:border-black transition-all outline-none resize-none" suppressHydrationWarning></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10 disabled:opacity-50"
                    suppressHydrationWarning
                  >
                    {isSubmitting ? "Sending..." : data.form.submit}
                  </button>
                </form>
              ) : (
                // FORM BAŞARIYLA GÖNDERİLDİYSE BU ŞIK EKRANI GÖSTER
                <div className="text-center space-y-6 py-10 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-3xl font-bold text-black tracking-tight">Message Sent.</h3>
                  <p className="text-zinc-500 font-light leading-relaxed max-w-sm mx-auto">
                    Thank you for reaching out. I have received your project brief and will get back to you within 24 hours.
                  </p>
                  <button onClick={() => setIsSuccess(false)} className="mt-8 px-6 py-3 border border-zinc-200 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-full hover:border-black hover:text-black transition-colors">
                    Send another message
                  </button>
                </div>
              )}

            </div>
          </FadeUp>
        </div>

        {/* FAQ Section */}
        <section className="mt-40">
          <FadeUp>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-1 space-y-6 text-left">
                <h3 className="text-4xl md:text-5xl font-medium text-black tracking-tight italic">{data.faqTitle} <br/>{data.faqSubtitle}</h3>
                <p className="text-zinc-500 font-light leading-relaxed">{data.faqDesc}</p>
              </div>
              
              <div className="lg:col-span-2 space-y-12 text-left">
                {data.faqs.map((faq: any, i: number) => (
                  <div key={i} className="group border-b border-zinc-100 pb-10">
                    <h4 className="text-xl font-bold text-black transition-colors duration-300">
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