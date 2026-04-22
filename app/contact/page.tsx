// app/contact/page.tsx
import { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Get in Touch', // Sekmede "Get in Touch | Novatrum" yazacak
  description: 'Reach out to Novatrum for bespoke software engineering and consulting.',
};

export default function ContactPage() {
  return <ContactClient />;
}