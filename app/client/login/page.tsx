'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Key, Cpu, Mail, ChevronRight, Info } from 'lucide-react'

export default function ClientPortalLogin() {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('novatrum_theme') || 'light'
    setTheme(savedTheme as 'light' | 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('novatrum_theme', newTheme)
    window.dispatchEvent(new Event('theme-changed'))
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    let formattedValue = rawValue
    
    if (rawValue.length > 4 && rawValue.length <= 8) {
      formattedValue = `${rawValue.slice(0, 4)}-${rawValue.slice(4)}`
    } else if (rawValue.length > 8) {
      formattedValue = `${rawValue.slice(0, 4)}-${rawValue.slice(4, 8)}-${rawValue.slice(8, 12)}`
    }
    setAccessCode(formattedValue)
    setError('')
  }

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
    if (!keyPattern.test(accessCode)) {
      setError('INVALID PROTOCOL. 12-DIGIT KEY REQUIRED.')
      setLoading(false)
      return
    }

    try {
      // GÜVENLİK KONTROLÜ: archived_at ve deleted_at kontrolü
      const { data: client, error: dbError } = await supabase
        .from('clients')
        .select('id, full_name, archived_at, deleted_at, access_code')
        .eq('access_code', accessCode)
        .maybeSingle()

      if (dbError) throw dbError

      // 1. Kullanıcı var mı?
      if (!client) {
        setError('ACCESS DENIED. UNAUTHORIZED CREDENTIALS.')
        setLoading(false)
        return
      }

      // 2. Müşteri Terminate (Silinmiş) edilmiş mi?
      if (client.deleted_at) {
        setError('ACCESS DENIED. ENTITY TERMINATED.')
        setLoading(false)
        return
      }

      // 3. Müşteri Archive (Arşivlenmiş) edilmiş mi?
      if (client.archived_at) {
        setError('ACCESS DENIED. ENTITY ARCHIVED.')
        setLoading(false)
        return
      }

      // 4. Access Code iptal edilmiş mi? (Kill Switch kontrolü)
      if (client.access_code?.startsWith('REVOKED')) {
        setError('ACCESS REVOKED. CONTACT SUPPORT.')
        setLoading(false)
        return
      }

      // Tüm kontroller geçtiyse giriş yap
      document.cookie = `novatrum_client_key=${accessCode}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`
      localStorage.setItem('novatrum_client_id', client.id)
      localStorage.setItem('novatrum_client_name', client.full_name)
      
      // Oturum verisini Layout heartbeat için cache'e at
      localStorage.setItem('novatrum_client', JSON.stringify({
        id: client.id,
        full_name: client.full_name
      }));

      router.push('/client/dashboard')
    } catch (err) {
      setError('CONNECTION ERROR. RETRY INITIALIZING.')
      setLoading(false)
    }
  }

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 md:p-10 font-sans relative overflow-hidden transition-colors duration-700 ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-white text-black'}`}>
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]`}></div>
      </div>

      {/* TOP BAR */}
      <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
        <img src={isDark ? "/logo-white.png" : "/logo.png"} alt="Novatrum" className="h-8 lg:h-10 w-auto" />
        <button 
          onClick={toggleTheme}
          className={`p-3 rounded-2xl transition-all border ${isDark ? 'bg-white/5 border-white/10 text-zinc-400 hover:text-white' : 'bg-black/5 border-black/5 text-zinc-500 hover:text-black'}`}
        >
          {isDark ? <Cpu size={18}/> : <ShieldCheck size={18}/>}
        </button>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* BRANDING */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-light tracking-tighter mb-4">Core Portal</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Secure Infrastructure Gateway</p>
        </div>

        {/* LOGIN CARD */}
        <div className={`p-8 lg:p-12 rounded-[40px] border transition-all duration-500 backdrop-blur-3xl 
          ${isDark ? 'bg-zinc-900/40 border-white/5 shadow-2xl' : 'bg-white border-black/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.04)]'}`}>
          <form onSubmit={handleAccess} className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Authorized Key</label>
                <Key size={14} className="text-zinc-300" />
              </div>
              <input
                type="text" required maxLength={14} value={accessCode} onChange={handleCodeChange}
                placeholder="XXXX-XXXX-XXXX"
                className={`w-full p-5 lg:p-6 rounded-[24px] focus:outline-none transition-all font-mono text-center text-lg lg:text-xl font-bold tracking-[0.2em] border 
                  ${isDark ? 'bg-black/40 border-white/10 focus:border-white/20 text-white' : 'bg-zinc-50 border-black/[0.02] focus:border-black/10 text-black'}`}
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                  className="py-3 border border-red-500/20 bg-red-500/5 rounded-2xl text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit" disabled={loading || accessCode.length < 14}
              className={`w-full p-5 lg:p-6 rounded-[24px] font-bold uppercase tracking-[0.3em] text-[10px] transition-all duration-500 shadow-2xl active:scale-95 disabled:opacity-30 disabled:grayscale
                ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
            >
              {loading ? 'Authenticating...' : 'Establish Connection'}
            </button>
          </form>

          {/* FOOTER ACTIONS */}
          <div className={`mt-12 pt-8 border-t flex flex-col gap-6 items-center transition-colors ${isDark ? 'border-white/5' : 'border-black/[0.02]'}`}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>System Operational</span>
            </div>
            <button 
              type="button" onClick={() => setIsSupportModalOpen(true)}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black'}`}
            >
              Request Access Support
            </button>
          </div>
        </div>
      </motion.div>

      {/* SUPPORT MODAL (Apple Style) */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-2xl bg-black/20">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-sm p-8 lg:p-12 rounded-[40px] border shadow-2xl text-center relative ${isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-black/[0.05]'}`}
            >
              <button onClick={() => setIsSupportModalOpen(false)} className="absolute top-6 right-6 p-2 text-zinc-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-8">
                <Mail size={32} className="text-emerald-500" />
              </div>
              <h3 className="text-2xl font-light tracking-tighter mb-4">Support Hub</h3>
              <p className={`text-sm leading-relaxed mb-8 font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                To request credentials or report an issue, please contact:<br/>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>info@novatrum.eu</span>
              </p>
              <button 
                onClick={() => setIsSupportModalOpen(false)}
                className={`w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className={`fixed bottom-8 text-[9px] font-bold uppercase tracking-[0.6em] ${isDark ? 'text-zinc-800' : 'text-zinc-200'}`}>
        Novatrum Infrastructure // All Rights Reserved
      </footer>
    </div>
  )
}