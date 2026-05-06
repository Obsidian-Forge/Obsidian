import "../globals.css"; // Global Tailwind ayarları
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Novatrum | Command Center",
  description: "Restricted Access. Architect Only.",
};

export default function AdminCoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white min-h-screen w-full flex flex-col selection:bg-zinc-800 selection:text-white">
        {/* Admin Paneli Üst Barı */}
        <header className="w-full border-b border-zinc-900 px-8 py-6 flex justify-between items-center bg-black/50 backdrop-blur-md sticky top-0 z-50">
          <div>
            <h1 className="text-zinc-600 text-[0.65rem] tracking-[0.5em] uppercase">Novatrum</h1>
            <div className="text-white text-sm tracking-[0.3em] font-light mt-1">COMMAND CENTER</div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-[0.65rem] tracking-[0.4em] uppercase">Status: Online</span>
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
          </div>
        </header>

        {/* Ana İçerik Alanı */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}