import React from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FA] dark:bg-zinc-950 overflow-y-auto selection:bg-emerald-500/30 transition-colors duration-500">
      
      {/* KRİTİK CSS EZİCİ (OVERRIDE): 
        Global CSS'teki 'cursor: none' kuralını iptal eder ve 
        tüm Client (Müşteri) sayfalarında normal Windows/Mac imlecini geri getirir. 
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        *, body, html {
            cursor: auto !important;
        }
        button, a, select, [role="button"], label.cursor-pointer, input[type="file"], input[type="color"], input[type="range"] {
            cursor: pointer !important;
        }
        input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea {
            cursor: text !important;
        }
      `}} />

      <main className="relative z-[1] min-h-screen">
        {children}
      </main>
    </div>
  )
}