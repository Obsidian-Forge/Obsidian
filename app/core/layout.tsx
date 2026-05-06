import "../globals.css"; // Tailwind için global CSS dosyasını bir üst dizinden çekiyoruz
import type { Metadata } from "next";

// Sadece Core portala özel SEO ve Başlık
export const metadata: Metadata = {
  title: "Novatrum Core | The Black Gate",
  description: "Restricted Access. Initiate Sequence.",
};

export default function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Sadece siyah arka planı ve beyaz yazıyı zorlayan, antialiased ile fontları pürüzsüzleştiren özel gövde */}
      <body className="antialiased bg-black text-white h-screen w-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}