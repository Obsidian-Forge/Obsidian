import React from 'react';
import FadeUp from '../components/FadeUp';
import Link from 'next/link';

export default function ProcessPage() {
  const steps = [
    {
      num: "01",
      title: "Discovery & Strategy",
      subtitle: "Understanding your vision",
      desc: "We start by deeply analyzing your business goals, target audience, and technical requirements. We define the project scope, feature list, and establish a clear roadmap for success.",
    },
    {
      num: "02",
      title: "UI/UX Design",
      subtitle: "Crafting the experience",
      desc: "Before writing any code, we create wireframes and high-fidelity prototypes. We focus on modern, minimalist aesthetics and intuitive user journeys that align perfectly with your brand identity.",
    },
    {
      num: "03",
      title: "Development",
      subtitle: "Building the engine",
      desc: "This is where the magic happens. We write clean, scalable, and secure code using modern frameworks like Next.js and Tailwind CSS. We build a robust architecture that performs effortlessly.",
    },
    {
      num: "04",
      title: "Testing & Refinement",
      subtitle: "Ensuring perfection",
      desc: "We conduct rigorous testing across different devices and browsers. We optimize loading speeds, ensure SEO best practices, and squash any bugs to guarantee a flawless user experience.",
    },
    {
      num: "05",
      title: "Deployment & Handoff",
      subtitle: "Going live",
      desc: "We deploy your project to high-performance global networks like Vercel or Netlify. Once live, we provide you with all necessary documentation and a smooth handoff, ensuring you are ready to scale.",
    }
  ];

  return (
    // Üst tarafa pt-24 (veya pt-32) ekleyerek Navbar'ın altında kalmasını engelledik
    <main className="max-w-7xl mx-auto px-6 space-y-40 pb-32 overflow-hidden pt-24 md:pt-32">
      
      {/* Page Header */}
      <FadeUp>
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white">
            Our <span className="text-neutral-500">Process.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 font-light leading-relaxed">
            A transparent, step-by-step methodology designed to turn complex ideas into elegant digital realities.
          </p>
        </div>
      </FadeUp>

      {/* Process Steps */}
      <div className="space-y-8 relative">
        <div className="hidden md:block absolute left-12 top-10 bottom-10 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent z-0" />

        {steps.map((step, index) => (
          <FadeUp key={index} delay={index * 100}>
            <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-16 items-start group">
              <div className="flex-shrink-0 flex md:flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-neutral-900/80 border border-white/10 backdrop-blur-xl flex items-center justify-center text-3xl font-black text-white group-hover:bg-white group-hover:text-black transition-colors duration-500 shadow-2xl">
                  {step.num}
                </div>
              </div>

              <div className="flex-1 p-10 md:p-14 rounded-[3rem] bg-gradient-to-br from-neutral-900/40 to-black border border-white/5 backdrop-blur-md hover:bg-neutral-900/60 transition-colors w-full">
                <div className="space-y-4 text-left">
                  <span className="text-neutral-500 text-sm font-medium tracking-widest uppercase">
                    {step.subtitle}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {step.title}
                  </h2>
                  <p className="text-neutral-400 text-lg font-light leading-relaxed max-w-3xl">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>

      {/* CTA Section */}
      <FadeUp>
        <div className="text-center mt-32 mb-10">
          <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">Ready to start step one?</h3>
          <Link href="/calculator" className="px-12 py-5 bg-white text-black font-bold rounded-xl hover:bg-neutral-300 transition-colors inline-flex items-center gap-3 group cursor-none text-lg">
            Estimate Your Project
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </FadeUp>

    </main>
  );
}