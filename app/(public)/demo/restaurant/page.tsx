// app/(public)/demo/restaurant/page.tsx

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Menu, Phone, MapPin, Clock, Star, ChevronRight, ArrowRight } from 'lucide-react';

const menuItems = [
  {
    category: "Starters",
    items: [
      { name: "Truffle Burrata", desc: "Creamy burrata with black truffle, heirloom tomatoes, aged balsamic", price: "€18" },
      { name: "Tuna Tartare", desc: "Fresh yellowfin tuna, avocado mousse, sesame cracker, yuzu dressing", price: "€22" },
      { name: "Wild Mushroom Velouté", desc: "Seasonal wild mushrooms, truffle oil, crispy sage", price: "€15" },
    ]
  },
  {
    category: "Main Courses",
    items: [
      { name: "Wagyu Ribeye", desc: "300g marble score 7+, pommes purée, bordelaise sauce, grilled asparagus", price: "€48" },
      { name: "Pan-Seared Sea Bass", desc: "Mediterranean sea bass, saffron risotto, beurre blanc, crispy capers", price: "€34" },
      { name: "Truffle Tagliatelle", desc: "Fresh handmade pasta, black truffle cream, aged parmesan, wild mushrooms", price: "€26" },
    ]
  },
  {
    category: "Desserts",
    items: [
      { name: "Dark Chocolate Fondant", desc: "Warm chocolate cake with molten center, vanilla bean ice cream", price: "€14" },
      { name: "Crème Brûlée", desc: "Classic vanilla custard with caramelized sugar crust, fresh berries", price: "€12" },
      { name: "Tiramisu", desc: "Traditional Italian layers of mascarpone, espresso-soaked ladyfingers, cocoa", price: "€13" },
    ]
  },
];

const testimonials = [
  { name: "Sophie M.", text: "An unforgettable dining experience. The Wagyu was perfection.", rating: 5 },
  { name: "David L.", text: "The ambiance, the service, the food — everything was exceptional.", rating: 5 },
  { name: "Marie K.", text: "Best restaurant in the city. The truffle pasta is out of this world.", rating: 5 },
];

export default function RestaurantDemo() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="w-full bg-[#0a0a06] text-white font-sans selection:bg-amber-500 selection:text-black">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a06]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <span className="text-lg font-light tracking-[0.3em] text-amber-400">LUMIÈRE</span>
          <div className="hidden md:flex items-center gap-10">
            {['Menu', 'About', 'Reservations', 'Contact'].map(item => (
              <a key={item} href="#" className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest hover:text-amber-400 transition-colors">{item}</a>
            ))}
            <a href="#" className="px-6 py-2.5 border border-amber-400 text-amber-400 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-amber-400 hover:text-black transition-all">Book a Table</a>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white">
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1920&auto=format&fit=crop"
          alt="Restaurant interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a06]/60 via-[#0a0a06]/40 to-[#0a0a06]" />
        
        <div className="relative z-10 text-center px-6 space-y-8 max-w-3xl">
          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.4em]">Fine Dining Since 2012</p>
          <h1 className="text-5xl md:text-8xl font-light tracking-tighter leading-[1.05]">
            Where flavor<br />meets <span className="text-amber-400">elegance.</span>
          </h1>
          <p className="text-zinc-300 text-sm md:text-base font-light max-w-lg mx-auto leading-relaxed">
            An unforgettable culinary journey through contemporary European cuisine, crafted with passion and the finest seasonal ingredients.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <a href="#" className="px-8 py-4 bg-amber-400 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-amber-300 transition-all">
              Reserve a Table
            </a>
            <a href="#" className="px-8 py-4 border border-white/30 text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:border-amber-400 hover:text-amber-400 transition-all">
              View Menu
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
          <span className="text-[8px] font-bold uppercase tracking-widest">Scroll</span>
          <ChevronRight size={14} className="rotate-90" />
        </div>
      </section>

      {/* ABOUT */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop"
              alt="Chef cooking"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-8">
            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.3em]">Our Story</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter leading-[1.1]">
              A passion for<br />
              <span className="text-amber-400">exceptional</span> cuisine.
            </h2>
            <div className="space-y-4 text-zinc-400 text-sm font-light leading-relaxed">
              <p>
                Founded in 2012 by Chef Antoine Laurent, Lumière has been at the forefront of contemporary European dining. Our philosophy is simple: exceptional ingredients, masterful technique, and an atmosphere that elevates every meal into a memory.
              </p>
              <p>
                Every dish that leaves our kitchen is a reflection of our commitment to excellence — from the hand-selected truffles to the house-churned butter.
              </p>
            </div>
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <p className="text-3xl font-light text-amber-400">12+</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Years</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-light text-amber-400">2</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Michelin Stars</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-light text-amber-400">50+</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Team Members</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MENU */}
      <section className="py-24 md:py-32 px-6 bg-[#0d0d08]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Our Menu</p>
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter">Crafted with care.</h2>
          </div>

          <div className="space-y-16">
            {menuItems.map((section) => (
              <div key={section.category}>
                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400 mb-8 text-center">{section.category}</h3>
                <div className="space-y-6">
                  {section.items.map((item) => (
                    <div key={item.name} className="flex justify-between items-start gap-8 pb-6 border-b border-white/5">
                      <div>
                        <h4 className="text-base font-light text-white mb-1">{item.name}</h4>
                        <p className="text-xs text-zinc-500 font-light leading-relaxed">{item.desc}</p>
                      </div>
                      <span className="text-sm font-light text-amber-400 shrink-0">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <a href="#" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-400 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-amber-300 transition-all">
              Full Menu <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-16">What our guests say.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-8 rounded-3xl border border-white/5 bg-[#0d0d08] text-left">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-zinc-400 font-light leading-relaxed mb-6">"{t.text}"</p>
                <p className="text-xs font-medium text-white">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESERVATION CTA */}
      <section className="relative py-32 md:py-40 px-6 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1920&auto=format&fit=crop"
          alt="Restaurant table setting"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0a06]/80" />
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-light tracking-tighter">Ready for an evening to remember?</h2>
          <p className="text-zinc-400 text-sm font-light leading-relaxed">Reserve your table and let us take care of the rest. We look forward to welcoming you.</p>
          <a href="#" className="inline-flex items-center gap-2 px-10 py-5 bg-amber-400 text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-amber-300 transition-all">
            Make a Reservation <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 border-t border-white/5 bg-[#0d0d08]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-8 text-xs text-zinc-500 font-light">
            <span className="flex items-center gap-2"><Phone size={12} /> +32 2 123 45 67</span>
            <span className="flex items-center gap-2"><MapPin size={12} /> Avenue Louise 142, Brussels</span>
            <span className="flex items-center gap-2"><Clock size={12} /> Tue–Sun 18:00–23:00</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-lg font-light tracking-[0.3em] text-amber-400">LUMIÈRE</span>
            <span className="text-[9px] text-zinc-600">© 2024 All rights reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}