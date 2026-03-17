import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SharedLayout from "./components/SharedLayout";
import { LanguageProvider } from "../context/LanguageContext"; // Provider'ı içeri aldık

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Novatrum",
  description: "Premium software studio crafting high-performance digital experiences.",
  icons: {
    icon: '/logo.png', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}>
        <LanguageProvider>
          <SharedLayout>
            {children}
          </SharedLayout>
        </LanguageProvider>
      </body>
    </html>
  );
}