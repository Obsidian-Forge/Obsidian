// app/page.tsx (Server Component)
import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  // Buraya yazdığın title, layout.tsx'teki template sayesinde 
  // "Novatrum | Premium Software Studio" olarak görünecek.
  title: "Novatrum", 
  description: "We engineer bespoke web applications, SaaS platforms, and enterprise digital architectures.",
};

export default function HomePage() {
  return <HomeClient />;
}