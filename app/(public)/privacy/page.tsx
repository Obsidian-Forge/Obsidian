// app/privacy/page.tsx (Server Component)
import { Metadata } from 'next';
import PrivacyClient from './PrivacyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy', // Sekmede "Privacy Policy | Novatrum" yazar
  description: 'Learn how Novatrum handles, protects, and manages your personal and project data.',
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}