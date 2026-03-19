import CustomCursor from '../components/CustomCursor';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Buraya cursor-none eklendi
    <div className="fixed inset-0 z-[9999] bg-zinc-50 overflow-y-auto selection:bg-black selection:text-white cursor-none">
      <CustomCursor />
      
      <main className="relative z-[1] min-h-screen">
        {children}
      </main>
    </div>
  )
}