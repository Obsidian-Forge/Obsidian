'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })

      if (authError) {
        alert("Login Error: " + authError.message)
        setLoading(false)
        return
      }

      if (authData?.user) {
        const { data: members, error: memberError } = await supabase
          .from('members')
          .select('role')
          .eq('id', authData.user.id)
          .limit(1)

        if (memberError || !members || members.length === 0) {
          router.push('/client/login')
          router.refresh()
          return
        }

        const member = members[0]
        if (member.role === 'admin') {
          router.push('/admin/dashboard')
          router.refresh()
        } else {
          router.push('/client/login')
          router.refresh()
        }
      }
    } catch (error: any) {
      alert("System Error: " + error.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] p-6 font-sans">
      <div className="w-full max-w-[400px] space-y-10 bg-white p-12 rounded-[40px] shadow-sm border border-zinc-200">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black tracking-tighter text-black uppercase leading-none">
            DEPLOYMENT HUB
          </h2>
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.4em] font-bold">
            Admin Infrastructure
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="System Identity"
              required
              className="w-full border border-zinc-200 bg-zinc-50 p-5 rounded-[20px] focus:border-black focus:bg-white outline-none transition-all text-sm text-black"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Security Key"
              required
              className="w-full border border-zinc-200 bg-zinc-50 p-5 rounded-[20px] focus:border-black focus:bg-white outline-none transition-all text-sm text-black"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-5 rounded-[20px] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-xl"
          >
            {loading ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}
          </button>
        </form>
      </div>
    </div>
  )
}