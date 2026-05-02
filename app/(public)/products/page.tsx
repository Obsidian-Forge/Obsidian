// app/products/page.tsx
import { Metadata } from 'next';
import ProductsClient from './ProductsClient';

export const metadata: Metadata = {
  title: 'Digital Modules', // Tarayıcı sekmesinde "Digital Modules | Novatrum" yazacak
  description: 'Explore Novatrum’s premium SaaS infrastructure and digital modules.',
};

export default function ProductsPage() {
  return <ProductsClient />;
}