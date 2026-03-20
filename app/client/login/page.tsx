'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ClientPortalLogin() {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Kodu veritabanında ara
      // .maybeSingle() kullanıyoruz: Eğer kayıt yoksa hata fırlatmaz, null döner. 
      // Bu 406 hatalarının önüne geçer.
      const { data: client, error: dbError } = await supabase
        .from('clients')
        .select('id, full_name')
        .eq('access_code', accessCode.trim().toUpperCase())
        .maybeSingle()

      if (dbError) throw dbError

      // 2. Müşteri bulunamadıysa uyar
      if (!client) {
        setError('Invalid Deployment Key. Please verify your credentials.')
        setLoading(false)
        return
      }

      // 3. Bilgileri kaydet
      localStorage.setItem('novatrum_client_id', client.id)
      localStorage.setItem('novatrum_client_name', client.full_name)
      
      // 4. Son giriş tarihini güncelle
      await supabase
        .from('clients')
        .update({ last_login: new Date().toISOString() })
        .eq('id', client.id)

      // 5. Dashboard'a yönlendir
      router.push('/client/dashboard')

    } catch (err) {
      console.error("Login error:", err)
      setError('System connection failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8F9FA] p-6 font-sans text-black">
      <div className="w-full max-w-[400px] space-y-12 bg-white p-12 rounded-[40px] shadow-sm border border-zinc-200">
        
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black tracking-tighter uppercase">Client Portal</h2>
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-bold">Secure Project Access</p>
        </div>

        <form onSubmit={handleAccess} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Deployment Key</label>
            <input
              type="text"
              placeholder="NVTR-XXXX-XXXX"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              className="w-full border border-zinc-200 bg-zinc-50 p-5 rounded-[20px] focus:border-black focus:bg-white outline-none transition-all text-sm text-center font-mono font-bold tracking-[0.2em] uppercase"
            />
          </div>

          {error && (
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center bg-red-50 py-3 rounded-[10px]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white p-6 rounded-[20px] font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-xl"
          >
            {loading ? 'VERIFYING KEY...' : 'INITIALIZE CONNECTION'}
          </button>
        </form>

        <div className="pt-4 border-t border-zinc-100 text-center">
          <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">
            Novatrum Deployment Hub
          </p>
        </div>
      </div>
    </div>
  )
}