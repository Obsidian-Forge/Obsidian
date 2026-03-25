import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Specialized Solutions | Novatrum',
  description: 'Explore Novatrum\'s premium software engineering services. From full-stack SaaS development to bespoke frontend architectures and interactive UI/UX design.',
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}