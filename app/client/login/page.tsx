'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function ClientPortalLogin() {
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  
  const router = useRouter()

  // Sayfa yüklendiğinde kullanıcının tema tercihini localStorage'dan çek
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('novatrum_login_theme')
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('novatrum_login_theme', newTheme)
  }

  // Kullanıcı yazarken kodu otomatik olarak XXXX-XXXX-XXXX formatına çevirir
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece harf ve rakamları al, boşluk ve özel karakterleri sil
    let rawValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    
    // Tireleri otomatik ekle
    let formattedValue = rawValue
    if (rawValue.length > 4 && rawValue.length <= 8) {
      formattedValue = `${rawValue.slice(0, 4)}-${rawValue.slice(4)}`
    } else if (rawValue.length > 8) {
      formattedValue = `${rawValue.slice(0, 4)}-${rawValue.slice(4, 8)}-${rawValue.slice(8, 12)}`
    }

    setAccessCode(formattedValue)
    setError('') // Kullanıcı yazarken hatayı temizle
  }

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Kodu kontrol et: Tam olarak 4-4-4 formatında (Toplam 14 karakter tirelerle) olmalı
    const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/

    if (!keyPattern.test(accessCode)) {
      setError('INVALID KEY FORMAT. REQUIRED: 12-DIGIT CODE.')
      setLoading(false)
      return
    }

    try {
      // Veritabanında bu tam koda sahip bir müşteri var mı kontrol et
      const { data: client, error: dbError } = await supabase
        .from('clients')
        .select('id, full_name, archived_at')
        .eq('access_code', accessCode)
        .is('archived_at', null) // Sadece arşive atılmamış (aktif) müşteriler girebilir
        .maybeSingle()

      if (dbError) throw dbError

      if (!client) {
        setError('UNAUTHORIZED KEY. ACCESS DENIED.')
        setLoading(false)
        return
      }

      // Güvenlik çerezi ve yerel depolama
      document.cookie = `novatrum_client_key=${accessCode}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`
      localStorage.setItem('novatrum_client_id', client.id)
      localStorage.setItem('novatrum_client_name', client.full_name)
      
      // Başarılı giriş
      router.push('/client/dashboard')
    } catch (err: any) {
      console.error(err)
      setError('CONNECTION FAILED. TRY AGAIN.')
      setLoading(false)
    }
  }

  // Hydration hatasını önlemek için sayfa mount olana kadar boş döndür
  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 md:p-10 font-sans relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-black text-white selection:bg-emerald-500/30' : 'bg-[#FAFAFA] text-zinc-900 selection:bg-emerald-500/30'}`}>
      
      {/* THEME TOGGLE BUTTON */}
      <button 
        onClick={toggleTheme} 
        className={`absolute top-6 right-6 p-3 rounded-full border backdrop-blur-md transition-all z-20 outline-none ${isDark ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-black/5 border-black/10 text-black hover:bg-black/10'}`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
        )}
      </button>

      {/* Dynamic Background Noise */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 ${isDark ? 'mix-blend-overlay' : 'mix-blend-multiply'}`}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        
        {/* Brand Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-md shadow-2xl relative group border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-zinc-200 shadow-xl'}`}>
            <div className={`absolute inset-0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}></div>
            <svg className={`w-8 h-8 md:w-10 md:h-10 ${isDark ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tighter mb-4">Secure Gateway</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Client Infrastructure Portal</p>
        </div>

        {/* Login Box */}
        <div className={`backdrop-blur-xl border p-8 md:p-12 rounded-[40px] shadow-2xl relative transition-colors duration-500 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/70 border-zinc-200'}`}>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

          <form onSubmit={handleAccess} className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 flex items-center justify-between">
                <span>Access Key</span>
              </label>
              <input
                type="text"
                required
                maxLength={14} // 12 harf/rakam + 2 tire
                value={accessCode}
                onChange={handleCodeChange}
                placeholder="XXXX-XXXX-XXXX"
                className={`w-full p-5 md:p-6 rounded-[20px] md:rounded-[24px] focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-center text-sm md:text-base font-bold tracking-[0.2em] uppercase appearance-none ${isDark ? 'bg-black/50 border-zinc-800 text-white placeholder:text-zinc-700' : 'bg-zinc-50 border border-zinc-200 text-black placeholder:text-zinc-400'}`}
              />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className={`border py-4 rounded-2xl overflow-hidden ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}
                >
                  <p className={`text-[9px] font-bold uppercase tracking-widest text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || accessCode.trim().length < 14}
              className={`w-full p-5 md:p-6 rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 appearance-none relative overflow-hidden group ${isDark ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]' : 'bg-black text-white shadow-[0_0_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_40px_rgba(0,0,0,0.2)]'}`}
            >
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] ${isDark ? 'via-black/20' : 'via-white/20'}`}></div>
              <span className="relative z-10">{loading ? 'AUTHENTICATING...' : 'ESTABLISH CONNECTION'}</span>
            </button>
          </form>

          <div className={`mt-10 md:mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">System Operational</span>
            </div>
            {/* SUPPORT POPUP TETİKLEYİCİ */}
            <button 
              type="button" 
              onClick={() => setIsSupportModalOpen(true)} 
              className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-colors outline-none ${isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-500 hover:text-black'}`}
            >
              Request Support
            </button>
          </div>

        </div>
      </motion.div>

      {/* SUPPORT MODAL (POPUP) */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }} 
              className={`w-full max-w-sm p-8 md:p-10 rounded-[32px] border shadow-2xl text-center flex flex-col items-center ${isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'}`}
            >
              <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              
              <h3 className="text-2xl font-light tracking-tight mb-3">Need Support?</h3>
              
              <p className={`text-xs font-medium leading-relaxed mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Please send an email to <br/>
                <strong className={`font-bold text-sm ${isDark ? 'text-white' : 'text-black'}`}>info@novatrum.eu</strong><br/><br/>
                Our engineering team will get back to you as soon as possible.
              </p>
              
              <button 
                onClick={() => setIsSupportModalOpen(false)} 
                className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all outline-none active:scale-95 ${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'}`}
              >
                Understood
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}