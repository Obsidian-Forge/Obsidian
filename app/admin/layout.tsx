import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-50 overflow-y-auto selection:bg-black selection:text-white transition-colors duration-500">
      
      {/* KRİTİK CSS EZİCİ (OVERRIDE): 
        Global CSS'teki 'cursor: none' kuralını iptal eder ve 
        Admin sayfalarında normal Windows/Mac imlecini geri getirir. 
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        *, body, html {
            cursor: auto !important;
        }
        button, a, select, [role="button"], label.cursor-pointer, input[type="file"], input[type="color"], input[type="range"], tr.cursor-pointer {
            cursor: pointer !important;
        }
        input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea {
            cursor: text !important;
        }
        /* Varsa global custom cursor'u tamamen gizle */
        .custom-cursor, #cursor, .cursor-dot, .cursor-outline, .mouse-cursor {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
        }
      `}} />

      <main className="relative z-[1] min-h-screen">
        {children}
      </main>
    </div>
  )
}