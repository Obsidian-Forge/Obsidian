// app/terms/page.tsx (Server Component)
import { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms of Service', // Sekmede "Terms of Service | Novatrum" yazar
  description: 'Terms and conditions for using Novatrum’s software services and digital infrastructure.',
};

export default function TermsPage() {
  return <TermsClient />;
}