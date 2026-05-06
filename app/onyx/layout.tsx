// app/onyx/command/layout.tsx
import { redirect } from 'next/navigation';

export default function OnyxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Burada token kontrolü yapılabilir
  return (
    <div className="min-h-screen bg-[#000000]">
      {children}
    </div>
  );
}