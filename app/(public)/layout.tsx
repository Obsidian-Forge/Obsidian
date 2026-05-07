"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { LanguageProvider } from "../../context/LanguageContext";
import { ThemeProvider } from "../../context/ThemeContext";
import AnnouncementBar from "../components/AnnouncementBar";
import SharedLayout from "../components/SharedLayout";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDemoPage = pathname?.startsWith('/demo');

  // Demo sayfalarında sadece içerik, header/footer yok
  if (isDemoPage) {
    return <>{children}</>;
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AnnouncementBar />
        <SharedLayout>
          {children}
        </SharedLayout>
      </ThemeProvider>
    </LanguageProvider>
  );
}
