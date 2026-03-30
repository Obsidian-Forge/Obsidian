'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function ClientPortalLogin() {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const cleanCode = accessCode.trim().toUpperCase()

    try {
      // .headers() satırını sildik, sadece kodu kontrol ediyoruz
      const { data: client, error: dbError } = await supabase
        .from('clients')
        .select('id, full_name')
        .eq('access_code', cleanCode)
        .maybeSingle()

      if (dbError) throw dbError

      if (!client) {
        setError('UNAUTHORIZED KEY. ACCESS DENIED.')
        setLoading(false)
        return
      }

      // Teknik zorunlu çerez (Sunucu kalkanı için En güvenli yöntem)
      document.cookie = `novatrum_client_key=${cleanCode}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`
      
      localStorage.setItem('novatrum_client_id', client.id)
      localStorage.setItem('novatrum_client_name', client.full_name)
      
      router.push('/client/dashboard')
      router.refresh() 
    } catch (err) {
      setError('SYSTEM ERROR. RETRY INITIATION.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white p-6 font-sans text-black overflow-hidden">

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-50 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-50 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="bg-white p-10 md:p-14 rounded-[48px] border border-zinc-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.03)] text-center">

          <div className="mb-12 text-center">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <img src="/logo.png" alt="N" className="w-6 h-6 invert" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-2">Client Portal</h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.4em] font-bold text-center">Secure Access Only</p>
          </div>

          <form onSubmit={handleAccess} className="space-y-8">
            <div className="relative group text-left">
              <label className="absolute -top-2.5 left-6 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 z-10">
                Deployment Key
              </label>
              <input
                type="text"
                placeholder="NVTR-XXXX-XXXX"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                className="w-full border-2 border-zinc-50 bg-zinc-50/50 p-6 rounded-[24px] focus:border-black focus:bg-white outline-none transition-all text-sm text-center font-mono font-bold tracking-[0.25em] uppercase placeholder:text-zinc-400"
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-red-50/50 border border-red-100 py-4 rounded-2xl"
                >
                  <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white p-6 rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'INITIALIZING...' : 'ESTABLISH CONNECTION'}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-zinc-50 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">
              Novatrum Protocols Active
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}