import CustomCursor from '@/app/components/CustomCursor';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FA] overflow-y-auto selection:bg-black selection:text-white cursor-none">
      <CustomCursor />
      <main className="relative z-[1] min-h-screen">
        {children}
      </main>
    </div>
  )
}