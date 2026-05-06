// app/(public)/layout.tsx
import type { Metadata } from "next";
import { LanguageProvider } from "../../context/LanguageContext";
import { ThemeProvider } from "../../context/ThemeContext";
import AnnouncementBar from "../components/AnnouncementBar";
import SharedLayout from "../components/SharedLayout";

export const metadata: Metadata = {
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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