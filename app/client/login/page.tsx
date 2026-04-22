// app/client/login/page.tsx (Server Component)
import { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  // Sekme adı: "Client Access | Novatrum"
  title: 'Client Access', 
  description: 'Secure access to your bespoke digital infrastructure and project status.',
};

export default function LoginPage() {
  return <LoginClient />;
}