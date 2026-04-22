// app/status/page.tsx (Server Component)
import { Metadata } from 'next';
import StatusClient from './StatusClient';

export const metadata: Metadata = {
  // Sekme adı: "System Status | Novatrum"
  title: 'System Status', 
  description: 'Real-time Novatrum infrastructure and service availability monitor.',
};

export default function StatusPage() {
  return <StatusClient />;
}