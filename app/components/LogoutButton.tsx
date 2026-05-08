'use client'

import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    // Supabase'den çıkış yap ve çerezleri temizle
    await supabase.auth.signOut()
    
    // Yönlendirme ve sayfa yenileme ile proxy'nin temiz çalışmasını sağla
    window.location.href = '/dashboard/login'
  }

  return (
    <button 
      onClick={handleLogout}
      className="text-sm font-medium underline underline-offset-4 text-zinc-400 hover:text-black transition-colors cursor-none"
    >
      Sign Out
    </button>
  )
}