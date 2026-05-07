"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 'contact',
          clientName: formState.name,
          email: formState.email,
          message: formState.message
        })
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full bg-white min-h-screen font-sans selection:bg-black selection:text-white flex items-center justify-center px-6 py-20">
      
      <div className="w-full max-w-lg">
        
        {!isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.42, 0, 0.58, 1] }}
            className="space-y-10"
          >
            {/* Başlık */}
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-light tracking-tighter text-black">
                Let's work<br />together.
              </h1>
              <p className="text-sm text-zinc-400 font-light">
                Tell us about your project. We'll get back to you within 24 hours.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="name"
                  required
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm text-black placeholder:text-zinc-300 focus:border-black focus:bg-white outline-none transition-all font-light"
                />
                <input
                  type="email"
                  name="email"
                  required
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm text-black placeholder:text-zinc-300 focus:border-black focus:bg-white outline-none transition-all font-light"
                />
              </div>
              
              <textarea
                name="message"
                required
                rows={5}
                value={formState.message}
                onChange={handleChange}
                placeholder="Tell us about your project..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm text-black placeholder:text-zinc-300 focus:border-black focus:bg-white outline-none transition-all resize-none font-light"
              />

              {errorMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs text-center"
                >
                  {errorMessage}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-800 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Send Message <Send size={13} /></>
                )}
              </button>
            </form>

            {/* Alt bilgi */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400 font-medium">
              <a href="mailto:info@novatrum.eu" className="flex items-center gap-1.5 hover:text-black transition-colors">
                <Mail size={12} /> info@novatrum.eu
              </a>
              <span className="text-zinc-200">•</span>
              <span className="flex items-center gap-1.5">
                <MapPin size={12} /> Remote, EU
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-2xl font-light tracking-tighter text-black">Message sent.</h2>
            <p className="text-sm text-zinc-400 font-light">
              We'll get back to you within 24 hours.
            </p>
            <button 
              onClick={() => setIsSuccess(false)} 
              className="text-xs text-zinc-400 hover:text-black transition-colors font-medium underline underline-offset-4"
            >
              Send another
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
