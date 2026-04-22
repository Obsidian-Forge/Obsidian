// app/process/page.tsx
import { Metadata } from 'next';
import ProcessClient from './ProcessClient';

export const metadata: Metadata = {
  title: 'The Workflow', // Sekmede "The Workflow | Novatrum" yazacak
  description: 'How we transform complex ideas into high-performance digital architectures.',
};

export default function ProcessPage() {
  return <ProcessClient />;
}