"use client";

import React, { useState } from 'react';
import FadeUp from '../components/FadeUp';
import emailjs from '@emailjs/browser';
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();
  const cData = t.calculator;

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, any>>({});
  const [customColors, setCustomColors] = useState(["#ffffff", "#888888", "#000000"]);
  
  const [clientInfo, setClientInfo] = useState({ name: '', company: '', email: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!cData) return <div className="pt-40 text-center text-zinc-500">Loading...</div>;

  const steps: Step[] = [
    {
      title: cData.stepsData[0].title,
      subtitle: cData.stepsData[0].subtitle,
      type: 'select',
      options: [
        { id: "landing", price: 1250.00, label: cData.stepsData[0].options[0].label, description: cData.stepsData[0].options[0].desc },
        { id: "business", price: 2850.00, label: cData.stepsData[0].options[1].label, description: cData.stepsData[0].options[1].desc },
        { id: "standard-store", price: 2250.00, label: cData.stepsData[0].options[2].label, description: cData.stepsData[0].options[2].desc },
        { id: "advanced-api", price: 3850.00, label: cData.stepsData[0].options[3].label, description: cData.stepsData[0].options[3].desc },
        { id: "ecommerce", price: 4750.00, label: cData.stepsData[0].options[4].label, description: cData.stepsData[0].options[4].desc }
      ]
    },
    {
      title: cData.stepsData[1].title,
      subtitle: cData.stepsData[1].subtitle,
      type: 'style'
    },
    {
      title: cData.stepsData[2].title,
      subtitle: cData.stepsData[2].subtitle,
      type: 'multi-select',
      options: [
        { id: "logo", price: 400.00, label: cData.stepsData[2].options[0].label, description: cData.stepsData[2].options[0].desc },
        { id: "custom-ui", price: 500.00, label: cData.stepsData[2].options[1].label, description: cData.stepsData[2].options[1].desc }
      ]
    },
    {
      title: cData.stepsData[3].title,
      subtitle: cData.stepsData[3].subtitle,
      type: 'multi-select',
      options: [
        { id: "seo-basic", price: 350.00, label: cData.stepsData[3].options[0].label, description: cData.stepsData[3].options[0].desc },
        { id: "copywriting", price: 450.00, label: cData.stepsData[3].options[1].label, description: cData.stepsData[3].options[1].desc },
        { id: "seo-adv", price: 750.00, label: cData.stepsData[3].options[2].label, description: cData.stepsData[3].options[2].desc }
      ]
    },
    {
      title: cData.stepsData[4].title,
      subtitle: cData.stepsData[4].subtitle,
      type: 'multi-select',
      options: [
        { id: "contact-form", price: 150.00, label: cData.stepsData[4].options[0].label, description: cData.stepsData[4].options[0].desc },
        { id: "newsletter", price: 200.00, label: cData.stepsData[4].options[1].label, description: cData.stepsData[4].options[1].desc },
        { id: "email-marketing", price: 250.00, label: cData.stepsData[4].options[2].label, description: cData.stepsData[4].options[2].desc }
      ]
    },
    {
      title: cData.stepsData[5].title,
      subtitle: cData.stepsData[5].subtitle,
      type: 'multi-select',
      options: [
        { id: "speed-basic", price: 250.00, label: cData.stepsData[5].options[0].label, description: cData.stepsData[5].options[0].desc },
        { id: "speed-ultra", price: 550.00, label: cData.stepsData[5].options[1].label, description: cData.stepsData[5].options[1].desc },
        { id: "hosting", price: 0.00, monthlyPrice: 45.00, label: cData.stepsData[5].options[2].label, description: cData.stepsData[5].options[2].desc },
        { id: "maintenance", price: 0.00, monthlyPrice: 125.00, label: cData.stepsData[5].options[3].label, description: cData.stepsData[5].options[3].desc }
      ]
    },
    {
      title: cData.stepsData[6].title,
      subtitle: cData.stepsData[6].subtitle,
      type: 'select',
      options: [
        { id: "timeline-standard", price: 0.00, label: cData.stepsData[6].options[0].label, description: cData.stepsData[6].options[0].desc },
        { id: "timeline-rush", price: 750.00, label: cData.stepsData[6].options[1].label, description: cData.stepsData[6].options[1].desc }
      ]
    },
    {
      title: cData.stepsData[7].title,
      subtitle: cData.stepsData[7].subtitle,
      type: 'text'
    }
  ];

  const stylePalettes = [
    { name: cData.palettes[0].name, colors: ["#000000", "#1a1a1a", "#ffffff"], desc: cData.palettes[0].desc },
    { name: cData.palettes[1].name, colors: ["#ffffff", "#f8fafc", "#0f172a"], desc: cData.palettes[1].desc },
    { name: cData.palettes[2].name, colors: ["#020617", "#3b82f6", "#1e293b"], desc: cData.palettes[2].desc },
    { name: cData.palettes[3].name, colors: ["#1c1917", "#fbbf24", "#ffffff"], desc: cData.palettes[3].desc }
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
    handleSelect(`${cData.customPalette}: ${newColors.join(' | ')}`, false);
  };

  const handleRandomPalette = () => {
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const newColors = [randomHex(), randomHex(), randomHex()];
    setCustomColors(newColors);
    handleSelect(`${cData.customPalette}: ${newColors.join(' | ')}`, false);
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
            if (option.monthlyPrice && option.monthlyPrice > 0) items.push({ label: option.label, price: `€${option.monthlyPrice.toFixed(2)} / ${cData.monthly}` });
          }
        });
      } else if (step.type === 'style') {
         let styleText = val;
         const matchedPalette = stylePalettes.find(p => p.name === val);
         if (matchedPalette) {
           styleText = `${val} (${matchedPalette.colors.join(', ')})`;
         }
         items.push({ label: `Style: ${styleText}`, price: cData.included });
      }
    });
    return items;
  };

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    
    try {
      const itemsHtml = getSelectedItemsForEmail().map(item => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333; font-size: 14px;">${item.label}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #000000; font-size: 14px; font-family: monospace;">${item.price}</td>
        </tr>
      `).join('');

      const visionText = selections[steps.length - 1] && selections[steps.length - 1].length > 2 
        ? `<div style="margin-top: 30px; padding: 20px; background-color: #fafafa; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Client Vision</p>
            <p style="margin: 0; font-size: 14px; color: #555555; font-style: italic;">"${selections[steps.length - 1]}"</p>
           </div>` 
        : '';

      const htmlProposal = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #000000; padding: 40px 30px; text-align: center;">
            <img 
              src="https://novatrum.eu/logo-white.png" 
              alt="Novatrum" 
              width="45" 
              height="45" 
              style="display: block; margin: 0 auto 16px auto; width: 45px !important; height: 45px !important; border: 0; outline: none; text-decoration: none;" 
            />
            <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #ffffff; text-transform: uppercase; font-style: italic; letter-spacing: 2px;">NOVATRUM</h1>
            <p style="margin: 10px 0 0 0; color: #888888; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-family: monospace;">${cData.emailSubject}</p>
          </div>
          
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 5px 0; font-size: 16px; color: #000000;">Hello <strong>${clientInfo.name}</strong>,</p>
            <p style="margin: 0 0 30px 0; font-size: 14px; color: #666666; line-height: 1.6;">Thank you for using the Configurator. Below is the detailed estimate for <strong>${clientInfo.company || 'your project'}</strong>.</p>
            
            <h2 style="margin: 0 0 15px 0; font-size: 14px; color: #000000; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #000000; padding-bottom: 10px;">${cData.emailScope}</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              ${itemsHtml}
            </table>
            
            ${visionText}
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #dddddd; text-align: right;">
              ${monthly > 0 ? `<p style="margin: 0 0 10px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">${cData.emailRecurring} <span style="font-size: 18px; color: #000000; font-weight: bold; font-family: monospace;">+ €${monthly.toFixed(2)} <span style="font-size: 12px; color: #888;">/ ${cData.monthly}</span></span></p>` : ''}
              <p style="margin: 0 0 5px 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">${cData.emailTotal}</p>
              <p style="margin: 0; font-size: 42px; font-weight: 900; color: #000000; line-height: 1;">€${upfront.toFixed(2)}</p>
              <p style="margin: 10px 0 0 0; font-size: 10px; color: #aaaaaa; text-transform: uppercase; letter-spacing: 1px;">${cData.emailVat}</p>
            </div>
          </div>
          
          <div style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
            <p style="margin: 0; font-size: 12px; color: #000000; font-weight: bold;">Novatrum Studio</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #888888;">Dilbeek, Belgium • info@novatrum.eu</p>
            <p style="margin: 15px 0 0 0; font-size: 10px; color: #bbbbbb; text-transform: uppercase; letter-spacing: 1px; font-family: monospace;">${cData.emailGenerated}</p>
          </div>
        </div>
      `;

      const templateParams = {
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        html_proposal: htmlProposal
      };

      await emailjs.send(
        'service_lzn6bze',   
        'template_f33ua3k',  
        templateParams,
        'rsgJ9I_OVOHvHyewq'
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
    <main className="w-full bg-white min-h-screen relative overflow-hidden">
      
      {/* BACKGROUND GLOWS (Derinlik hissi için eklendi) */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply" />
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-purple-100/40 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply" />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-40 relative z-10">
        <FadeUp>
          <div className="mb-20 space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-medium uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-slate-800 to-indigo-900 leading-tight pb-2">
                  {cData.title} <br/>
                  <span className="text-zinc-400 font-light italic">{cData.subtitle}</span>
                </h1>
                <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mt-4">
                  {cData.stepInfo} {currentStep + 1} {cData.of} {steps.length + 1} // {cData.tag}
                </p>
              </div>
            </div>
            
            {/* Progress Bar (Gradient uygulandı) */}
            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden mt-8 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out" 
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
                  <h2 className="text-3xl font-bold text-black tracking-tight">{steps[currentStep].title}</h2>
                  <p className="text-zinc-500 font-light">{steps[currentStep].subtitle}</p>
                </div>

                {/* SELECT (TEKLİ SEÇİM) */}
                {steps[currentStep].type === 'select' && (
                  <div className="grid grid-cols-1 gap-4">
                    {steps[currentStep].options?.map((opt) => {
                      const isSelected = selections[currentStep] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt.id, false)}
                          className={`group p-8 rounded-[32px] border transition-all duration-300 text-left cursor-none relative overflow-hidden ${
                            isSelected 
                            ? 'bg-zinc-950 text-white border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
                            : 'bg-white/60 backdrop-blur-xl border-zinc-200/60 text-black hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5'
                          }`}
                        >
                          {/* Seçili karta içten hafif bir ışıltı */}
                          {isSelected && <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl -z-10" />}

                          <div className="flex justify-between items-center mb-2 relative z-10">
                            <span className="text-xl font-bold tracking-tight">{opt.label}</span>
                            <span className={`font-mono text-sm ${isSelected ? 'text-indigo-300' : 'text-zinc-500 opacity-80'}`}>
                              {opt.price === 0 ? cData.included : `+ €${opt.price.toFixed(2)}`}
                            </span>
                          </div>
                          <p className={`text-sm font-light relative z-10 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {opt.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* MULTI-SELECT (ÇOKLU SEÇİM) */}
                {steps[currentStep].type === 'multi-select' && (
                  <div className="grid grid-cols-1 gap-4">
                    {steps[currentStep].options?.map((opt) => {
                      const isSelected = (selections[currentStep] || []).includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelect(opt.id, true)}
                          className={`group p-8 rounded-[32px] border transition-all duration-300 text-left cursor-none relative overflow-hidden ${
                            isSelected 
                            ? 'bg-zinc-950 text-white border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
                            : 'bg-white/60 backdrop-blur-xl border-zinc-200/60 text-black hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5'
                          }`}
                        >
                          {isSelected && <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl -z-10" />}

                          <div className="flex justify-between items-center mb-2 relative z-10">
                            <div className="flex items-center gap-4">
                              <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors border ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-zinc-300 bg-white'}`}>
                                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                              </div>
                              <span className="text-xl font-bold tracking-tight">{opt.label}</span>
                            </div>
                            <span className={`font-mono text-sm ${isSelected ? 'text-indigo-300' : 'text-zinc-500 opacity-80'}`}>
                              {opt.monthlyPrice 
                                ? `€${opt.monthlyPrice.toFixed(2)} / ${cData.monthly}` 
                                : `+ €${opt.price.toFixed(2)}`}
                            </span>
                          </div>
                          <p className={`text-sm font-light ml-9 relative z-10 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {opt.description}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* STYLE (PALET SEÇİMİ) */}
                {steps[currentStep].type === 'style' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {stylePalettes.map((p) => {
                        const isSelected = selections[currentStep] === p.name;
                        return (
                          <button
                            key={p.name}
                            onClick={() => handleSelect(p.name, false)}
                            className={`p-8 rounded-[32px] border transition-all duration-300 text-left cursor-none relative overflow-hidden ${
                              isSelected 
                              ? 'bg-zinc-950 text-white border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
                              : 'bg-white/60 backdrop-blur-xl border-zinc-200/60 text-black hover:bg-white hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-900/5'
                            }`}
                          >
                            {isSelected && <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl -z-10" />}
                            
                            <div className="flex justify-between items-center mb-4 relative z-10">
                              <span className="font-bold tracking-tight">{p.name}</span>
                              <div className="flex -space-x-2">
                                {p.colors.map((c, i) => (
                                  <div key={i} className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c }} />
                                ))}
                              </div>
                            </div>
                            <p className={`text-xs font-light relative z-10 ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {p.desc}
                            </p>
                          </button>
                        )
                      })}
                    </div>

                    {/* CUSTOM PALETTE BÖLÜMÜ */}
                    <div className={`p-8 rounded-[32px] border transition-all duration-300 relative overflow-hidden ${
                        selections[currentStep]?.startsWith(cData.customPalette) 
                        ? 'bg-zinc-950 border-zinc-800 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
                        : 'bg-white/60 backdrop-blur-xl border-zinc-200/60 text-black'
                      }`}
                    >
                      {selections[currentStep]?.startsWith(cData.customPalette) && <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl -z-10" />}

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 relative z-10">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold tracking-tight">{cData.builderTitle}</h4>
                          <p className={`text-xs font-light ${selections[currentStep]?.startsWith(cData.customPalette) ? 'text-zinc-400' : 'text-zinc-500'}`}>{cData.builderDesc}</p>
                        </div>
                        <button 
                          onClick={handleRandomPalette}
                          className={`px-4 py-2 border text-[10px] font-bold uppercase tracking-widest rounded-full transition-all cursor-none ${
                            selections[currentStep]?.startsWith(cData.customPalette)
                            ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                            : 'bg-white border-zinc-200 text-black hover:border-black'
                          }`}
                        >
                          {cData.shuffleColors}
                        </button>
                      </div>

                      <div className="flex gap-4 mb-8 relative z-10">
                        {customColors.map((color, index) => (
                          <div key={index} className="flex-1 flex flex-col gap-2">
                            <div className="relative h-20 w-full rounded-2xl border border-zinc-200/50 overflow-hidden shadow-sm">
                              <input 
                                type="color" 
                                value={color}
                                onChange={(e) => handleCustomColorChange(index, e.target.value)}
                                className="absolute -inset-2 w-[200%] h-[200%] cursor-none"
                              />
                            </div>
                            <span className={`text-[10px] font-mono uppercase tracking-widest text-center ${selections[currentStep]?.startsWith(cData.customPalette) ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {color}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSelect(`${cData.customPalette}: ${customColors.join(' | ')}`, false)}
                        className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300 relative z-10 ${
                          selections[currentStep]?.startsWith(cData.customPalette)
                          ? 'bg-white text-black shadow-lg hover:bg-zinc-200' 
                          : 'bg-white border border-zinc-200 text-black hover:border-indigo-300'
                        }`}
                      >
                        {selections[currentStep]?.startsWith(cData.customPalette) ? `✓ ${cData.paletteSelected}` : cData.applyPalette}
                      </button>
                    </div>
                  </div>
                )}

                {/* TEXT (VİZYON GİRİŞİ) */}
                {steps[currentStep].type === 'text' && (
                  <textarea
                    value={selections[currentStep] || ""}
                    onChange={(e) => handleSelect(e.target.value, false)}
                    placeholder={cData.textPlaceholder}
                    className="w-full h-64 bg-white/60 backdrop-blur-xl border border-zinc-200/60 shadow-sm rounded-[32px] p-10 text-black focus:outline-none focus:border-indigo-300 transition-all cursor-none resize-none font-light leading-relaxed placeholder:text-zinc-400 hover:bg-white"
                  />
                )}
              </div>
            </FadeUp>
          ) : (
            // FİNAL TAHMİN VE FORM EKRANI
            <FadeUp>
              <div className="p-12 md:p-20 rounded-[48px] bg-white/60 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center space-y-12 relative overflow-hidden">
                {/* Final ekranına içten premium bir ışık */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10" />

                <div className="space-y-4 relative z-10">
                  <h2 className="text-3xl font-medium text-black tracking-tight italic">{cData.estimateGen}</h2>
                  <div className="h-px w-20 bg-indigo-200 mx-auto" />
                </div>

                <div className="space-y-2 relative z-10">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-bold">{cData.totalInv}</span>
                  <div className="text-7xl md:text-[8rem] font-medium tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-900 to-zinc-600">
                    €{upfront.toFixed(2)}
                  </div>
                </div>

                {monthly > 0 && (
                  <div className="inline-block px-8 py-4 rounded-3xl bg-white border border-zinc-100 shadow-sm relative z-10">
                    <span className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] block mb-1 font-bold">{cData.recurringLabel}</span>
                    <div className="text-2xl font-mono text-black tracking-tight font-medium">
                      + €{monthly.toFixed(2)} <span className="text-sm text-zinc-400 font-sans">/ {cData.month}</span>
                    </div>
                  </div>
                )}

                {!isSuccess ? (
                  <div className="max-w-md mx-auto space-y-4 pt-8 relative z-10 text-left">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-zinc-500 tracking-[0.2em] font-bold">{cData.formNameLabel}</label>
                      <input 
                        type="text" 
                        value={clientInfo.name}
                        onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                        className="w-full bg-white/80 backdrop-blur-sm border border-zinc-200 shadow-sm rounded-[20px] px-6 py-4 text-black text-sm focus:border-indigo-900/30 transition-colors outline-none cursor-none"
                        placeholder={cData.formNamePlace}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-zinc-500 tracking-[0.2em] font-bold">{cData.formCompanyLabel}</label>
                      <input 
                        type="text" 
                        value={clientInfo.company}
                        onChange={(e) => setClientInfo({...clientInfo, company: e.target.value})}
                        className="w-full bg-white/80 backdrop-blur-sm border border-zinc-200 shadow-sm rounded-[20px] px-6 py-4 text-black text-sm focus:border-indigo-900/30 transition-colors outline-none cursor-none"
                        placeholder={cData.formCompanyPlace}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase text-zinc-500 tracking-[0.2em] font-bold">{cData.formEmailLabel}</label>
                      <input 
                        type="email" 
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                        className="w-full bg-white/80 backdrop-blur-sm border border-zinc-200 shadow-sm rounded-[20px] px-6 py-4 text-black text-sm focus:border-indigo-900/30 transition-colors outline-none cursor-none"
                        placeholder={cData.formEmailPlace}
                      />
                    </div>
                    <div className="pt-6">
                      <button 
                        disabled={!clientInfo.name || !clientInfo.email || isGenerating}
                        onClick={handleGenerateDocument}
                        className="w-full py-6 bg-gradient-to-r from-zinc-900 to-black text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:shadow-lg hover:shadow-indigo-900/20 transition-all cursor-none disabled:opacity-50"
                      >
                        {isGenerating ? cData.btnSending : cData.btnSend}
                      </button>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center mt-6">
                        {cData.notice}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto pt-8 relative z-10">
                    <div className="p-10 rounded-[32px] bg-white border border-zinc-100 shadow-sm">
                      <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      </div>
                      <h3 className="text-xl font-bold text-black mb-2">{cData.successTitle}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">{cData.successDesc}</p>
                    </div>
                  </div>
                )}
              </div>
            </FadeUp>
          )}
        </div>

        {/* ALT BUTONLAR (Önceki / Devam Et) */}
        <div className="mt-24 flex justify-between items-center border-t border-zinc-100 pt-12 relative z-10">
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || currentStep === steps.length}
            className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all cursor-none ${currentStep === 0 || currentStep === steps.length ? 'opacity-0 pointer-events-none' : 'text-zinc-400 hover:text-black'}`}
          >
            // {cData.btnPrev}
          </button>
          
          {currentStep < steps.length && (
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className={`px-12 py-5 rounded-full font-bold uppercase tracking-widest text-[10px] transition-all cursor-none ${
                isStepValid() 
                ? 'bg-gradient-to-r from-zinc-900 to-black text-white hover:shadow-lg hover:shadow-indigo-900/20' 
                : 'bg-zinc-100 text-zinc-400'
              }`}
            >
              {currentStep === steps.length - 1 ? cData.btnFinish : cData.btnNext}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}