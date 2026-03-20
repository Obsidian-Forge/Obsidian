import CustomCursor from '@/app/components/CustomCursor';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-50 overflow-y-auto selection:bg-black selection:text-white cursor-none">
      <CustomCursor />
      <main className="relative z-[1] min-h-screen">
        {children}
      </main>
    </div>
  )
}