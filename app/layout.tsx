import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SharedLayout from "./components/SharedLayout";
import { LanguageProvider } from "../context/LanguageContext";
import { ThemeProvider } from "../context/ThemeContext";
import AnnouncementBar from "./components/AnnouncementBar"; // Duyuru çubuğu eklendi

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// GÜNCELLENMİŞ PREMİUM METADATA YAPISI
export const metadata: Metadata = {
  title: {
    default: "Novatrum | Premium Software Studio", // Ana sayfadaki isim
    template: "%s | Novatrum", // Diğer sayfalarda "Sayfa Adı | Novatrum" yapar
  },
  description: "We engineer bespoke web applications, SaaS platforms, and enterprise digital architectures. Transforming complex logic into high-performance software.",
  metadataBase: new URL('https://novatrum.eu'),
  openGraph: {
    title: 'Novatrum | Future-Ready Infrastructure',
    description: 'Bespoke software engineering and high-performance digital architectures.',
    url: 'https://novatrum.eu',
    siteName: 'Novatrum',
    images: [
      {
        url: '/og-image.png', // Public klasöründe bu isimle bir resim olmalı
        width: 1200,
        height: 630,
        alt: 'Novatrum Infrastructure Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Novatrum | Premium SaaS Solutions',
    description: 'Building the digital backbone of tomorrow.',
    images: ['/og-image.png'],
  },
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
            {/* DUYURU ÇUBUĞU: Tüm sayfalarda en üstte görünür */}
            <AnnouncementBar />
            
            <SharedLayout>
              {children}
            </SharedLayout>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}