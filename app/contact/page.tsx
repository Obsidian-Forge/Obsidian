import React from 'react';
import FadeUp from '../components/FadeUp';

export default function ContactPage() {
  const faqs = [
    { 
      q: "How fast can we start?", 
      a: "Typically, we can kick off a discovery phase within 1 week of initial contact depending on the project complexity." 
    },
    { 
      q: "How do you handle pricing?", 
      a: "We offer a hybrid model. For standard requirements, we have fixed-price packages. For more complex, custom-built solutions, we provide a dynamic estimate via our Price Calculator based on the specific features and scale you need." 
    },
    { 
      q: "Which technologies do you use?", 
      a: "We specialize in high-performance stacks: Next.js, TypeScript, Tailwind CSS, and Supabase for secure, scalable backends." 
    },
    {
      q: "Do you offer post-launch support?",
      a: "Absolutely. We provide ongoing maintenance and scaling support to ensure your product stays up-to-date and performs at its best."
    }
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 pb-32 overflow-hidden">
      
      {/* Page Header */}
      <FadeUp>
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase">
            Start the <span className="text-neutral-500 font-light italic">Dialogue.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 font-light leading-relaxed">
            Have a project in mind? We're ready to help you build the next generation of digital products with precision and scale.
          </p>
        </div>
      </FadeUp>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-32 border-b border-white/5 pb-32">
        
        {/* Left Side: Roadmap & Presence */}
        <FadeUp delay={100}>
          <div className="space-y-16">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white tracking-tight italic">Obsidian Studio</h2>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 inline-block">
                <p className="text-neutral-400 font-mono text-sm tracking-widest uppercase text-left">
                  Based in Dilbeek, Belgium <br />
                  Global Operations // Remote-First
                </p>
              </div>
            </div>

            {/* The Roadmap */}
            <div className="space-y-8">
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-500 border-l-2 border-white/20 pl-4">The Next Steps</h4>
              <div className="space-y-6">
                {[
                  { s: "01", t: "Initial Review", d: "We analyze your inquiry and technical needs within 24 hours." },
                  { s: "02", t: "Discovery Session", d: "A deep-dive call to align on goals, features, and timeline." },
                  { s: "03", t: "Custom Proposal", d: "You receive a detailed roadmap and a transparent quote." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <span className="text-sm font-black text-white px-2 py-1 bg-neutral-900 border border-white/10 rounded tracking-tighter">
                      {item.s}
                    </span>
                    <div className="space-y-1 text-left">
                      <h5 className="text-lg font-bold text-white">{item.t}</h5>
                      <p className="text-sm text-neutral-500 font-light leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-green-500/5 border border-green-500/10 w-fit">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs text-green-500 font-bold uppercase tracking-widest">Currently booking for next month</p>
            </div>
          </div>
        </FadeUp>

        {/* Right Side: Contact Form */}
        <FadeUp delay={200}>
          <div className="p-10 md:p-14 rounded-[3rem] bg-neutral-900/30 border border-white/5 backdrop-blur-2xl">
            <form className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] uppercase text-neutral-600 tracking-[0.2em] font-bold">Full Name</label>
                  <input type="text" placeholder="John Doe" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/40 transition-all outline-none cursor-none" />
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] uppercase text-neutral-600 tracking-[0.2em] font-bold">Email</label>
                  <input type="email" placeholder="john@example.com" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/40 transition-all outline-none cursor-none" />
                </div>
              </div>
              
              {/* Tek ve Sabit Seçenek */}
              <div className="space-y-3 text-left">
                <label className="text-[10px] uppercase text-neutral-600 tracking-[0.2em] font-bold">Project Category</label>
                <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-5 py-4 text-neutral-400 font-medium">
                  Custom Software Development
                </div>
              </div>

              <div className="space-y-3 text-left">
                <label className="text-[10px] uppercase text-neutral-600 tracking-[0.2em] font-bold">Project Brief</label>
                <textarea rows={4} placeholder="What are we building together?" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-white/40 transition-all outline-none resize-none cursor-none"></textarea>
              </div>

              <button className="w-full py-5 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-neutral-300 transition-all active:scale-[0.98] cursor-none shadow-xl shadow-white/5">
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
            <div className="lg:col-span-1 space-y-4 text-left">
              <h3 className="text-3xl font-bold text-white tracking-tight italic">Common <br/>Questions</h3>
              <p className="text-neutral-500 font-light leading-relaxed">Everything you need to know about starting a project with us.</p>
            </div>
            
            <div className="lg:col-span-2 space-y-12 text-left">
              {faqs.map((faq, i) => (
                <div key={i} className="group border-b border-white/5 pb-10">
                  <h4 className="text-xl font-bold text-white group-hover:text-neutral-400 transition-colors duration-300">
                    {faq.q}
                  </h4>
                  <p className="text-neutral-400 mt-4 font-light leading-relaxed max-w-2xl">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

    </main>
  );
}