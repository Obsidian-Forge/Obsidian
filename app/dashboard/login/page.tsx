'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Supabase Auth ile giriş yap
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert("Giriş başarısız: " + error.message)
    } else if (user) {
      // 2. Yeni 'accounts' tablosundan kullanıcının rolünü kontrol et
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('role')
        .eq('id', user.id)
        .single()

      if (accountError || !account) {
        // Eğer hesap kaydı yoksa standart dashboard'a gönder
        window.location.href = '/dashboard'
        return
      }

      // 3. Role göre yönlendirme yap
      if (account.role === 'admin') {
        window.location.href = '/dashboard/admin'
      } else {
        window.location.href = '/dashboard'
      }
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-6">
      <div className="w-full max-w-[400px] space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-bold tracking-tighter text-black">Novatrum</h2>
          <p className="text-sm text-gray-400 uppercase tracking-widest font-medium">
            Client Portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email address"
              required
              className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-xl focus:border-black focus:bg-white outline-none transition-all text-black"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full border border-gray-100 bg-gray-50/50 p-4 rounded-xl focus:border-black focus:bg-white outline-none transition-all text-black"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-zinc-800 transition-all active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-gray-300">
          Secure access for authorized projects only.
        </p>
      </div>
    </div>
  )
}