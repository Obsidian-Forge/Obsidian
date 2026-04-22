// app/showroom/page.tsx (Server Component)
import { Metadata } from 'next';
import ShowroomClient from './ShowroomClient';

export const metadata: Metadata = {
  // Sekme adı: "Digital Showroom | Novatrum"
  title: 'Digital Showroom', 
  description: 'Experience our live project status and digital twin infrastructure in real-time.',
};

export default function ShowroomPage() {
  return <ShowroomClient />;
}