// app/services/page.tsx (Server Component)
import { Metadata } from 'next';
import ServicesClient from './ServicesClient';

export const metadata: Metadata = {
  // Sekme adı: "Engineering Services | Novatrum"
  title: 'Engineering Services', 
  description: 'Bespoke software development, cloud architecture, and digital transformation solutions.',
};

export default function ServicesPage() {
  return <ServicesClient />;
}