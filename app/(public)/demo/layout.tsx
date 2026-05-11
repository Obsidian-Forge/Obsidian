// app/(public)/demo/layout.tsx
import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Demo İçeriği */}
      {children}

      {/* Vertical Floating Bar - Tüm demolarda ortak */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-6 bg-white/90 backdrop-blur-xl border border-zinc-200 rounded-full py-8 px-3 shadow-lg">
        
        {/* Status noktası */}
        <div className="relative group flex flex-col items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
            Demo Active
          </div>
        </div>

        <div className="w-4 h-[1px] bg-zinc-300" />

        {/* Contact Button */}
        <Link href="/contact" className="group flex flex-col items-center gap-3 outline-none">
          <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-md">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-black transition-colors" style={{ writingMode: 'vertical-rl' }}>
            Contact
          </span>
        </Link>

        <div className="w-4 h-[1px] bg-zinc-300" />

        {/* Close Demo */}
        <Link href="/showroom" className="group flex flex-col items-center gap-3 outline-none">
          <div className="w-8 h-8 bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-full flex items-center justify-center group-hover:bg-red-500 group-hover:border-red-500 group-hover:text-white transition-all">
            <X size={14} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 group-hover:text-red-500 transition-colors" style={{ writingMode: 'vertical-rl' }}>
            Close
          </span>
        </Link>
      </div>
    </>
  );
}