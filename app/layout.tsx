import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SharedLayout from "./components/SharedLayout";
import { LanguageProvider } from "../context/LanguageContext";
import { ThemeProvider } from "../context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Novatrum | Premium Software Studio",
  description: "We engineer bespoke web applications, SaaS platforms, and enterprise digital architectures. Transforming complex logic into high-performance software.",
  openGraph: {
    title: 'Novatrum | Premium Software Studio',
    description: 'We engineer bespoke web applications, SaaS platforms, and enterprise digital architectures.',
    url: 'https://novatrum.eu',
    siteName: 'Novatrum',
    type: 'website',
  },
  // YALNIZCA VAR OLAN icon.png DOSYASINA YÖNLENDİRİLDİ
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('novatrum_theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#F8F9FA] dark:bg-zinc-950 transition-colors duration-300`}>
        <LanguageProvider>
          <ThemeProvider>
            <SharedLayout>
              {children}
            </SharedLayout>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}