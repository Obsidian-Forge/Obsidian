import React from 'react';
import FadeUp from './components/FadeUp';

// Kartların içinde kullandığımız için logo bileşenini burada tutuyoruz
const ObsidianLogo = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-6 space-y-40 overflow-hidden">
      
      {/* Hero Section */}
      <FadeUp>
        <section className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-[3rem]" />
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white max-w-4xl leading-tight">
            Shaping the <br />
            <span className="text-neutral-500">Digital Future.</span>
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl font-light">
            Crafting high-end, performance-driven, and scalable tech solutions for modern brands.
          </p>
          <div className="pt-8">
            <a href="#contact" className="px-10 py-4 bg-white/5 border border-white/10 backdrop-blur-xl text-white font-medium rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-300 inline-block cursor-none">
              Start a Project
            </a>
          </div>
        </section>
      </FadeUp>

      {/* Services Section */}
      <FadeUp>
        <section id="services" className="space-y-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Our Expertise</h2>
            <p className="text-neutral-500">Building high-quality digital products.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[240px]">
            <div className="md:col-span-2 md:row-span-2 p-10 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-md flex flex-col justify-end group hover:bg-neutral-900/60 transition-all">
              <div className="mb-auto p-4 bg-white/5 rounded-2xl w-fit border border-white/5">
                <ObsidianLogo />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Custom Software</h3>
              <p className="text-neutral-400 font-light">Tailored, secure, and fast web applications using modern frameworks and serverless architectures.</p>
            </div>
            <div className="md:col-span-2 p-8 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-md flex flex-col justify-end hover:bg-neutral-900/60 transition-all">
              <h3 className="text-xl font-bold text-white mb-2">UI/UX Design</h3>
              <p className="text-neutral-400 text-sm font-light">User-centric, minimalist, and engaging interface designs.</p>
            </div>
            <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-md flex flex-col justify-end hover:bg-neutral-900/60 transition-all">
              <h3 className="text-lg font-bold text-white mb-2">Performance</h3>
              <p className="text-neutral-400 text-sm font-light">Maximum speed and SEO optimization.</p>
            </div>
            <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 backdrop-blur-md flex flex-col justify-end hover:bg-neutral-900/60 transition-all">
              <h3 className="text-lg font-bold text-white mb-2">SaaS Architecture</h3>
              <p className="text-neutral-400 text-sm font-light">Scalable cloud infrastructures.</p>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Process Section */}
      <FadeUp>
        <section id="process" className="space-y-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold text-white tracking-tight">Our Process</h2>
            <p className="text-neutral-500">How we bring your vision to life.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['1. Discover', '2. Design', '3. Develop', '4. Deploy'].map((step, index) => (
              <div key={index} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/5 transition-colors">
                <h3 className="text-xl font-bold text-white mb-4">{step}</h3>
                <p className="text-neutral-400 text-sm font-light">
                  {index === 0 && "We analyze your requirements and define the project scope."}
                  {index === 1 && "Creating wireframes and modern, user-friendly interfaces."}
                  {index === 2 && "Writing clean, scalable, and secure code."}
                  {index === 3 && "Launching your product and providing ongoing support."}
                </p>
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      {/* Tech Stack Section */}
      <FadeUp>
        <section className="space-y-12">
          <div className="flex flex-col gap-2 text-center items-center">
            <h2 className="text-3xl font-bold text-white tracking-tight">Powered By</h2>
            <p className="text-neutral-500">We use the best modern tools.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Supabase', 'Vercel', 'Netlify'].map((tech, index) => (
              <div key={index} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-neutral-300 text-sm font-medium hover:bg-white/10 transition-colors">
                {tech}
              </div>
            ))}
          </div>
        </section>
      </FadeUp>

      {/* Calculator CTA Section */}
      <FadeUp>
        <section className="py-10">
          <div className="max-w-4xl mx-auto p-10 md:p-16 rounded-[3rem] bg-gradient-to-br from-neutral-900/60 to-black border border-white/5 backdrop-blur-2xl text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-t-[3rem]" />
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight relative z-10">
              Estimate Your Project
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto relative z-10 font-light">
              Use our interactive pricing calculator to get an instant cost estimate for your next digital product. Download a professional Obsidian PDF proposal in seconds.
            </p>
            <div className="pt-6 relative z-10">
              <a href="/calculator" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-300 transition-colors inline-flex items-center gap-2 group cursor-none">
                Open Price Calculator
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* Contact Form */}
      <FadeUp>
        <section id="contact" className="py-20 border-t border-white/5">
          <div className="max-w-3xl mx-auto bg-neutral-900/30 border border-white/5 backdrop-blur-2xl rounded-[3rem] p-10 md:p-16">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold text-white">Get in Touch</h2>
              <p className="text-neutral-400">Take the first step to bring your idea to life.</p>
            </div>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</label>
                  <input type="text" id="name" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-colors cursor-none" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</label>
                  <input type="email" id="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-colors cursor-none" placeholder="hello@company.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Message</label>
                <textarea id="message" rows={5} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-white/30 transition-colors resize-none cursor-none" placeholder="Tell us about your project..."></textarea>
              </div>
              <button type="button" className="w-full py-4 mt-4 bg-white text-black font-bold rounded-xl hover:bg-neutral-300 transition-colors cursor-none">
                Send Message
              </button>
            </form>
          </div>
        </section>
      </FadeUp>

    </main>
  );
}