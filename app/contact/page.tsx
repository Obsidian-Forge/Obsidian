"use client";

import React from 'react';
import FadeUp from '../components/FadeUp'; // Kendi FadeUp bileşenini kullandığını varsayıyorum

export default function ContactPage() {
  const faqs = [
    { 
      q: "How fast can we start?", 
      a: "Typically, I can kick off a discovery phase within 1 week of initial contact depending on the project complexity." 
    },
    { 
      q: "How do you handle pricing?", 
      a: "For standard requirements, I have fixed-price packages. For more complex, custom-built solutions, I provide a dynamic estimate via the Price Calculator based on the specific features and scale you need." 
    },
    { 
      q: "Which technologies do you use?", 
      a: "I specialize in high-performance stacks: Next.js, TypeScript, Tailwind CSS, and Supabase for secure, scalable backends." 
    },
    {
      q: "Do you offer post-launch support?",
      a: "Absolutely. I provide ongoing maintenance and scaling support to ensure your product stays up-to-date and performs at its best."
    }
  ];

  return (
    <main className="w-full bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-40 overflow-hidden">
        
        {/* Page Header */}
        <FadeUp>
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-8xl font-medium tracking-tight text-black leading-none">
              Start the <br/>
              <span className="text-zinc-400 italic font-light">Dialogue.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              Have a project in mind? I'm ready to help you build the next generation of digital products with precision and scale.
            </p>
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-32 border-b border-zinc-100 pb-32">
          
          {/* Left Side: Roadmap & Presence */}
          <FadeUp delay={100}>
            <div className="space-y-16">
              <div className="space-y-6">
                <h2 className="text-3xl font-medium text-black tracking-tight italic">Obsidian Studio</h2>
                <div className="p-8 rounded-[24px] bg-zinc-50 border border-zinc-100 inline-block">
                  <p className="text-zinc-500 font-bold text-[10px] tracking-[0.2em] uppercase text-left leading-relaxed">
                    Based in Dilbeek, Belgium <br />
                    Global Operations // Remote-First
                  </p>
                </div>
              </div>

              {/* The Roadmap */}
              <div className="space-y-8">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 border-l-2 border-zinc-200 pl-4">
                  The Next Steps
                </h4>
                <div className="space-y-8">
                  {[
                    { s: "01", t: "Initial Review", d: "I analyze your inquiry and technical needs within 24 hours." },
                    { s: "02", t: "Discovery Session", d: "A deep-dive call to align on goals, features, and timeline." },
                    { s: "03", t: "Custom Proposal", d: "You receive a detailed roadmap and a transparent quote." }
                  ].map((item, i) => (
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
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em]">Currently booking for next month</p>
              </div>
            </div>
          </FadeUp>

          {/* Right Side: Contact Form (Web3Forms Integrated) */}
          <FadeUp delay={200}>
            <div className="p-10 md:p-14 rounded-[40px] bg-zinc-50 border border-zinc-100 shadow-sm">
              <form action="https://api.web3forms.com/submit" method="POST" className="space-y-8">
                {/* Web3Forms Access Key */}
                <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
                <input type="hidden" name="subject" value="New Inquiry from Obsidian Website" />
                <input type="hidden" name="from_name" value="Obsidian Studio Contact Form" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">Full Name</label>
                    <input type="text" name="name" required placeholder="John Doe" className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-black text-sm focus:border-black transition-all outline-none" />
                  </div>
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">Email</label>
                    <input type="email" name="email" required placeholder="john@example.com" className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-black text-sm focus:border-black transition-all outline-none" />
                  </div>
                </div>
                
                {/* Fixed Category Display */}
                <div className="space-y-3 text-left">
                  <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">Project Category</label>
                  <div className="w-full bg-white border border-zinc-100 rounded-2xl px-5 py-4 text-zinc-500 text-sm font-medium">
                    Custom Software Development
                  </div>
                  {/* Hidden input to pass the category to email */}
                  <input type="hidden" name="category" value="Custom Software Development" />
                </div>

                <div className="space-y-3 text-left">
                  <label className="text-[10px] uppercase text-zinc-400 tracking-[0.2em] font-bold">Project Brief</label>
                  <textarea name="message" required rows={4} placeholder="What are we building together?" className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-black text-sm focus:border-black transition-all outline-none resize-none"></textarea>
                </div>

                {/* Optional success redirection */}
                <input type="hidden" name="redirect" value="https://web3forms.com/success" />

                <button type="submit" className="w-full py-5 bg-black text-white font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-zinc-800 transition-colors shadow-lg shadow-black/10">
                  Send Inquiry
                </button>
              </form>
            </div>
          </FadeUp>
        </div>

        {/* FAQ Section */}
        <section className="mt-40">
          <FadeUp>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="lg:col-span-1 space-y-6 text-left">
                <h3 className="text-4xl md:text-5xl font-medium text-black tracking-tight italic">Common <br/>Questions</h3>
                <p className="text-zinc-500 font-light leading-relaxed">Everything you need to know about starting a project with me.</p>
              </div>
              
              <div className="lg:col-span-2 space-y-12 text-left">
                {faqs.map((faq, i) => (
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