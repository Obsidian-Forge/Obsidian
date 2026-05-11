// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Novatrum | Premium Software Studio",
    template: "%s | Novatrum",
  },
  description: "We engineer bespoke web applications and enterprise digital architectures.",
  metadataBase: new URL('https://novatrum.eu'),
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Critical CSS inline - Sayfa yüklenirken anında görünür */}
        <style dangerouslySetInnerHTML={{ __html: `
          body { margin: 0; padding: 0; background: #fff; color: #000; }
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}>
        {children}
      </body>
    </html>
  );
}