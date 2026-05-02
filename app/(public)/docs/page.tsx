// app/docs/page.tsx (Server Component)
import { Metadata } from 'next';
import DocumentationClient from './DocumentationClient';

export const metadata: Metadata = {
  // Sekme adı: "Documentation | Novatrum"
  title: 'Documentation', 
  description: 'Technical guides, API references, and architectural documentation for Novatrum systems.',
};

export default function DocumentationPage() {
  return <DocumentationClient />;
}