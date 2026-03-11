"use client";

import React, { useState } from 'react';
import FadeUp from '../components/FadeUp';
import emailjs from '@emailjs/browser';

type Option = {
  id: string;
  label: string;
  price: number;
  monthlyPrice?: number;
  description: string;
};

type Step = {
  title: string;
  subtitle: string;
  type: 'select' | 'multi-select' | 'style' | 'text';
  options?: Option[];
};

export default function PriceCalculator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, any>>({});
  const [customColors, setCustomColors] = useState(["#ffffff", "#888888", "#000000"]);
  
  const [clientInfo, setClientInfo] = useState({ name: '', company: '', email: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const steps: Step[] = [
    {
      title: "Base Architecture",
      subtitle: "Select the foundation of your digital presence.",
      type: 'select',
      options: [
        { id: "landing", label: "High-Conversion Landing", price: 1250.00, description: "Single-page scroll experience. (1 Page Only)" },
        { id: "business", label: "Multi-Page Business Site", price: 2850.00, description: "Professional corporate architecture. (Up to 8 Pages)" },
        { id: "standard-store", label: "Standard Store Setup", price: 2250.00, description: "Basic e-commerce capabilities. (Up to 50 Products)" },
        { id: "advanced-api", label: "Advanced API Store", price: 3850.00, description: "Complex store with external integrations. (Unlimited)" },
        { id: "ecommerce", label: "Premium E-Commerce", price: 4750.00, description: "The ultimate bespoke shopping experience. (Custom Architecture)" }
      ]
    },
    {
      title: "Visual Identity",
      subtitle: "Choose a professional palette or build your own from scratch.",
      type: 'style'
    },
    {
      title: "Design & Branding",
      subtitle: "Enhance your visual assets. (You can select multiple)",
      type: 'multi-select',
      options: [
        { id: "logo", label: "Professional Logo Design", price: 400.00, description: "Custom brand mark and typography." },
        { id: "custom-ui", label: "Custom Graphics & UI Elements", price: 500.00, description: "Bespoke illustrations and interface details." }
      ]
    },
    {
      title: "Content & SEO",
      subtitle: "Boost your reach and messaging. (You can select multiple)",
      type: 'multi-select',
      options: [
        { id: "seo-basic", label: "Basic SEO Setup", price: 350.00, description: "Foundational metadata and search engine indexing." },
        { id: "copywriting", label: "Professional Content Writing", price: 450.00, description: "Engaging, conversion-focused copywriting." },
        { id: "seo-adv", label: "Advanced SEO Strategy", price: 750.00, description: "Deep keyword targeting and technical SEO optimization." }
      ]
    },
    {
      title: "Functional Features",
      subtitle: "Add specific capabilities to your site. (You can select multiple)",
      type: 'multi-select',
      options: [
        { id: "contact-form", label: "Advanced Contact Form", price: 150.00, description: "Complex conditional logic and multi-step forms." },
        { id: "newsletter", label: "Newsletter System", price: 200.00, description: "Capture leads and grow your audience." },
        { id: "email-marketing", label: "Email Marketing Integration", price: 250.00, description: "Connect directly to Mailchimp, ActiveCampaign, etc." }
      ]
    },
    {
      title: "Performance & Support",
      subtitle: "Speed upgrades and ongoing maintenance. (You can select multiple)",
      type: 'multi-select',
      options: [
        { id: "speed-basic", label: "Basic Speed Optimization", price: 250.00, description: "Asset minification and basic caching." },
        { id: "speed-ultra", label: "Ultra-Fast Performance Bundle", price: 550.00, description: "Server-side optimizations for maximum speed." },
        { id: "hosting", label: "Premium Hosting Management", price: 0.00, monthlyPrice: 45.00, description: "Secure, high-uptime cloud hosting." },
        { id: "maintenance", label: "Monthly Maintenance & Support", price: 0.00, monthlyPrice: 125.00, description: "Regular updates, backups, and priority support." }
      ]
    },
    {
      title: "Delivery Timeline",
      subtitle: "How fast do you need this project launched?",
      type: 'select',
      options: [
        { id: "timeline-standard", label: "Standard Pace (4-6 Weeks)", price: 0.00, description: "Our standard, high-quality development cycle." },
        { id: "timeline-rush", label: "Priority Rush (1-2 Weeks)", price: 750.00, description: "Skip the queue. We work overtime to deliver ASAP." }
      ]
    },
    {
      title: "The Vision",
      subtitle: "Tell us more about your specific needs or references.",
      type: 'text'
    }
  ];

  const stylePalettes = [
    { name: "Obsidian Dark", colors: ["#000000", "#1a1a1a", "#ffffff"], desc: "The signature look. Deep, premium, and bold." },
    { name: "Nordic Clean", colors: ["#ffffff", "#f8fafc", "#0f172a"], desc: "Airy, minimalist, and focuses on typography." },
    { name: "Midnight Tech", colors: ["#020617", "#3b82f6", "#1e293b"], desc: "Modern blue tones for tech-focused startups." },
    { name: "Industrial Gold", colors: ["#1c1917", "#fbbf24", "#ffffff"], desc: "High-contrast with elegant golden accents." }
  ];

  const handleSelect = (val: string, isMulti: boolean = false) => {
    if (isMulti) {
      const current = selections[currentStep] || [];
      if (current.includes(val)) {
        setSelections({ ...selections, [currentStep]: current.filter((id: string) => id !== val) });
      } else {
        setSelections({ ...selections, [currentStep]: [...current, val] });
      }
    } else {
      setSelections({ ...selections, [currentStep]: val });
    }
  };

  const handleCustomColorChange = (index: number, val: string) => {
    const newColors = [...customColors];
    newColors[index] = val;
    setCustomColors(newColors);
    handleSelect(`Custom Palette: ${newColors.join(' | ')}`, false);
  };

  const handleRandomPalette = () => {
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const newColors = [randomHex(), randomHex(), randomHex()];
    setCustomColors(newColors);
    handleSelect(`Custom Palette: ${newColors.join(' | ')}`, false);
  };

  const calculateTotal = () => {
    let upfront = 0;
    let monthly = 0;

    Object.entries(selections).forEach(([stepIdx, val]) => {
      const step = steps[parseInt(stepIdx)];
      if (step.type === 'select') {
        const option = step.options?.find(o => o.id === val);
        upfront += (option?.price || 0);
        monthly += (option?.monthlyPrice || 0);
      } else if (step.type === 'multi-select') {
        (val as string[]).forEach(id => {
          const option = step.options?.find(o => o.id === id);
          upfront += (option?.price || 0);
          monthly += (option?.monthlyPrice || 0);
        });
      }
    });
    return { upfront, monthly };
  };

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const isStepValid = () => {
    if (steps[currentStep].type === 'select' || steps[currentStep].type === 'style') {
      return selections[currentStep] !== undefined;
    }
    return true; 
  };

  const { upfront, monthly } = calculateTotal();

  const getSelectedItemsForEmail = () => {
    let items: { label: string, price: string }[] = [];
    Object.entries(selections).forEach(([stepIdx, val]) => {
      const step = steps[parseInt(stepIdx)];
      if (step.type === 'select') {
        const option = step.options?.find(o => o.id === val);
        if (option) items.push({ label: option.label, price: `€${option.price.toFixed(2)}` });
      } else if (step.type === 'multi-select') {
        (val as string[]).forEach(id => {
          const option = step.options?.find(o => o.id === id);
          if (option) {
            if (option.price > 0) items.push({ label: option.label, price: `€${option.price.toFixed(2)}` });
            if (option.monthlyPrice && option.monthlyPrice > 0) items.push({ label: option.label, price: `€${option.monthlyPrice.toFixed(2)} / mo` });
          }
        });
      } else if (step.type === 'style') {
         let styleText = val;
         const matchedPalette = stylePalettes.find(p => p.name === val);
         if (matchedPalette) {
           styleText = `${val} (${matchedPalette.colors.join(', ')})`;
         }
         items.push({ label: `Style: ${styleText}`, price: 'Included' });
      }
    });
    return items;
  };

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    try {
      // E-posta için şık HTML tablosunu oluşturuyoruz
      const itemsHtml = getSelectedItemsForEmail().map(item => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333; font-size: 14px;">${item.label}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #000000; font-size: 14px; font-family: monospace;">${item.price}</td>
        </tr>
      `).join('');

      const visionText = selections[steps.length - 1] && selections[steps.length - 1].length > 2 
        ? `<div style="margin-top: 30px; padding: 20px; background-color: #fafafa; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Client Vision Notes</p>
            <p style="margin: 0; font-size: 14px; color: #555555; font-style: italic;">"${selections[steps.length - 1]}"</p>
           </div>` 
        : '';

      const htmlProposal = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #000000; padding: 40px 30px; text-align: center;">
            
            <img 
              src="https://i.postimg.cc/NMqsRc9X/duotone.png" 
              alt="Obsidian" 
              width="45" 
              height="45" 
              style="display: block; margin: 0 auto 16px auto; width: 45px !important; height: 45px !important; border: 0; outline: none; text-decoration: none; opacity: 1 !important; filter: none !important; -webkit-filter: none !important;" 
            />
            
            <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #ffffff; text-transform: uppercase; font-style: italic; letter-spacing: 2px;">OBSIDIAN</h1>
            <p style="margin: 10px 0 0 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: monospace;">Digital Project Proposal</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 5px 0; font-size: 16px; color: #000000;">Hello <strong>${clientInfo.name}</strong>,</p>
            <p style="margin: 0 0 30px 0; font-size: 14px; color: #666666; line-height: 1.6;">Thank you for using the Obsidian Configurator. Below is the detailed estimate for <strong>${clientInfo.company || 'your project'}</strong>.</p>
            
            <h2 style="margin: 0 0 15px 0; font-size: 14px; color: #000000; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000000; padding-bottom: 10px;">Scope of Work</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
            </table>
            
            ${visionText}
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dddddd; text-align: right;">
              ${monthly > 0 ? `<p style="margin: 0 0 10px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Recurring Services: <span style="font-size: 18px; color: #000000; font-weight: bold; font-family: monospace;">+ €${monthly.toFixed(2)} <span style="font-size: 12px; color: #888;">/ mo</span></span></p>` : ''}
              <p style="margin: 0 0 5px 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Total Estimated Investment</p>
              <p style="margin: 0; font-size: 42px; font-weight: 900; color: #000000; line-height: 1;">€${upfront.toFixed(2)}</p>
              <p style="margin: 10px 0 0 0; font-size: 10px; color: #aaaaaa; text-transform: uppercase; letter-spacing: 1px;">Prices exclude VAT where applicable.</p>
            </div>
          </div>
          
          <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
            <p style="margin: 0; font-size: 12px; color: #000000; font-weight: bold;">Obsidian Studio</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #888888;">Dilbeek, Belgium • obsidian.studio.hq@gmail.com</p>
            <p style="margin: 15px 0 0 0; font-size: 10px; color: #bbbbbb; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">Generated via Obsidian Engine. Not a final legal contract.</p>
          </div>
        </div>
      `;

      const templateParams = {
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        html_proposal: htmlProposal
      };

      await emailjs.send(
        'service_ra7x10v',   
        'template_ucd79qi',  
        templateParams,
        'gKoFLF4zfxzIxyQ8F'    // Buraya Account sekmesindeki Public Key'ini yapıştırmayı unutma
      );

      setIsSuccess(true);

    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send proposal. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 pb-40 relative">
      <FadeUp>
        <div className="mb-20 space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white italic">
                Project <span className="text-neutral-500 font-light not-italic italic">Configurator.</span>
              </h1>
              <p className="text-xs text-neutral-500 font-mono tracking-widest uppercase">
                Step {currentStep + 1} of {steps.length + 1} // Precision Pricing
              </p>
            </div>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-700 ease-out" 
              style={{ width: `${((currentStep + 1) / (steps.length + 1)) * 100}%` }}
            />
          </div>
        </div>
      </FadeUp>

      <div className="min-h-[500px]">
        {currentStep < steps.length ? (
          <FadeUp key={currentStep}>
            <div className="space-y-12 text-left">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">{steps[currentStep].title}</h2>
                <p className="text-neutral-500 font-light">{steps[currentStep].subtitle}</p>
              </div>

              {steps[currentStep].type === 'select' && (
                <div className="grid grid-cols-1 gap-4">
                  {steps[currentStep].options?.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id, false)}
                      className={`group p-8 rounded-3xl border transition-all text-left cursor-none ${
                        selections[currentStep] === opt.id 
                        ? 'bg-white text-black border-white' 
                        : 'bg-white/[0.02] border-white/5 text-white hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold uppercase tracking-tight">{opt.label}</span>
                        <span className="font-mono text-sm">
                          {opt.price === 0 ? 'Included' : `+ €${opt.price.toFixed(2)}`}
                        </span>
                      </div>
                      <p className={`text-sm font-light ${selections[currentStep] === opt.id ? 'text-black/60' : 'text-neutral-500'}`}>
                        {opt.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {steps[currentStep].type === 'multi-select' && (
                <div className="grid grid-cols-1 gap-4">
                  {steps[currentStep].options?.map((opt) => {
                    const isSelected = (selections[currentStep] || []).includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(opt.id, true)}
                        className={`group p-8 rounded-3xl border transition-all text-left cursor-none relative overflow-hidden ${
                          isSelected 
                          ? 'bg-white/10 text-white border-white/50' 
                          : 'bg-white/[0.02] border-white/5 text-white hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white' : 'border-white/30'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-black rounded-sm" />}
                            </div>
                            <span className="text-xl font-bold uppercase tracking-tight">{opt.label}</span>
                          </div>
                          <span className="font-mono text-sm">
                            {opt.monthlyPrice 
                              ? `€${opt.monthlyPrice.toFixed(2)} / mo` 
                              : `+ €${opt.price.toFixed(2)}`}
                          </span>
                        </div>
                        <p className={`text-sm font-light ml-9 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {opt.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}

              {steps[currentStep].type === 'style' && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stylePalettes.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => handleSelect(p.name, false)}
                        className={`p-8 rounded-3xl border transition-all text-left cursor-none ${
                          selections[currentStep] === p.name 
                          ? 'bg-white text-black border-white' 
                          : 'bg-white/[0.03] border-white/5 text-white hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold uppercase tracking-widest text-[10px]">{p.name}</span>
                          <div className="flex -space-x-2">
                            {p.colors.map((c, i) => (
                              <div key={i} className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                        <p className={`text-xs font-light ${selections[currentStep] === p.name ? 'text-black/60' : 'text-neutral-500'}`}>
                          {p.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className={`p-8 rounded-3xl border transition-all ${
                      selections[currentStep]?.startsWith('Custom') 
                      ? 'bg-white/[0.05] border-white text-white' 
                      : 'bg-black border-white/10 text-white'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold uppercase tracking-widest">Custom Palette Builder</h4>
                        <p className="text-xs text-neutral-500 font-light">Define your own 3-color brand identity.</p>
                      </div>
                      <button 
                        onClick={handleRandomPalette}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-none"
                      >
                        Shuffle Colors
                      </button>
                    </div>

                    <div className="flex gap-4 mb-8">
                      {customColors.map((color, index) => (
                        <div key={index} className="flex-1 flex flex-col gap-2">
                          <div className="relative h-20 w-full rounded-2xl border border-white/10 overflow-hidden group">
                            <input 
                              type="color" 
                              value={color}
                              onChange={(e) => handleCustomColorChange(index, e.target.value)}
                              className="absolute -inset-2 w-[200%] h-[200%] cursor-none"
                            />
                          </div>
                          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest text-center">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleSelect(`Custom Palette: ${customColors.join(' | ')}`, false)}
                      className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300 ${
                        selections[currentStep]?.startsWith('Custom')
                        ? 'bg-white text-black scale-[0.98]' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {selections[currentStep]?.startsWith('Custom') ? '✓ Palette Selected' : 'Apply This Palette'}
                    </button>
                  </div>
                </div>
              )}

              {steps[currentStep].type === 'text' && (
                <textarea
                  value={selections[currentStep] || ""}
                  onChange={(e) => handleSelect(e.target.value, false)}
                  placeholder="Tell us about your brand personality, desired features, or reference websites you love..."
                  className="w-full h-64 bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-10 text-white focus:outline-none focus:border-white/30 transition-all cursor-none resize-none font-light leading-relaxed"
                />
              )}
            </div>
          </FadeUp>
        ) : (
          <FadeUp>
            <div className="p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-neutral-900/50 to-black border border-white/10 text-center space-y-12 shadow-2xl relative overflow-hidden">
              <div className="space-y-4 relative z-10">
                <h2 className="text-3xl font-black text-white uppercase tracking-widest italic">Estimate Generated</h2>
                <div className="h-px w-20 bg-white/20 mx-auto" />
              </div>

              <div className="space-y-2 relative z-10">
                <span className="text-[10px] text-neutral-600 uppercase tracking-[0.5em] font-bold">Total Investment</span>
                <div className="text-7xl md:text-[8rem] font-black text-white tracking-tighter leading-none">
                  €{upfront.toFixed(2)}
                </div>
              </div>

              {monthly > 0 && (
                <div className="inline-block px-8 py-4 rounded-2xl bg-white/[0.02] border border-white/10 relative z-10">
                  <span className="text-[10px] text-neutral-500 uppercase tracking-[0.3em] block mb-1">Recurring Support & Hosting</span>
                  <div className="text-2xl font-mono text-white tracking-tight">
                    + €{monthly.toFixed(2)} <span className="text-sm text-neutral-500">/ month</span>
                  </div>
                </div>
              )}

              {!isSuccess ? (
                <div className="max-w-md mx-auto space-y-4 pt-8 relative z-10 text-left">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-neutral-500 tracking-[0.2em] font-bold">Full Name</label>
                    <input 
                      type="text" 
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/40 outline-none cursor-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-neutral-500 tracking-[0.2em] font-bold">Company / Brand</label>
                    <input 
                      type="text" 
                      value={clientInfo.company}
                      onChange={(e) => setClientInfo({...clientInfo, company: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/40 outline-none cursor-none"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase text-neutral-500 tracking-[0.2em] font-bold">Email Address</label>
                    <input 
                      type="email" 
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/40 outline-none cursor-none"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="pt-6">
                    <button 
                      disabled={!clientInfo.name || !clientInfo.email || isGenerating}
                      onClick={handleGenerateDocument}
                      className="w-full py-7 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-all cursor-none shadow-xl shadow-white/5 disabled:opacity-50"
                    >
                      {isGenerating ? 'Sending Proposal...' : 'Send Proposal to Email'}
                    </button>
                    <p className="text-[10px] text-neutral-600 uppercase tracking-widest text-center mt-6">A detailed overview will be sent to the email address provided.</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto pt-8 relative z-10">
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-2">Proposal Sent</h3>
                    <p className="text-neutral-400 text-sm">Please check your inbox (and spam folder) for the detailed estimate. We will be in touch shortly.</p>
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 pointer-events-none" />
            </div>
          </FadeUp>
        )}
      </div>

      <div className="mt-24 flex justify-between items-center border-t border-white/5 pt-12">
        <button
          onClick={prevStep}
          disabled={currentStep === 0 || currentStep === steps.length}
          className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all cursor-none ${currentStep === 0 || currentStep === steps.length ? 'opacity-0 pointer-events-none' : 'text-neutral-500 hover:text-white'}`}
        >
          // Previous Step
        </button>
        
        {currentStep < steps.length && (
          <button
            onClick={nextStep}
            disabled={!isStepValid()}
            className={`px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all cursor-none ${
              isStepValid() ? 'bg-white text-black hover:bg-neutral-200' : 'bg-white/5 text-neutral-700'
            }`}
          >
            {currentStep === steps.length - 1 ? 'See Final Estimate' : 'Continue'}
          </button>
        )}
      </div>
    </main>
  );
}