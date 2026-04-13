// app/(vault)/layout.tsx

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white selection:bg-black selection:text-white">
      {/* <html> ve <body> KULLANILMAZ çünkü Root Layout'ta zaten var. */}
      {/* Sadece sayfa içeriğini render ediyoruz */}
      {children}
    </div>
  );
}