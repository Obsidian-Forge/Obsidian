'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('novatrum_admin_theme')
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark')
    }

    // Timeout (30 dk Inactivity) kontrolü
    if (window.location.search.includes('timeout=true')) {
      setError('SESSION EXPIRED. PLEASE RE-VERIFY IDENTITY.')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('novatrum_admin_theme', newTheme)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        setError("VERIFICATION FAILED: " + authError.message.toUpperCase())
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
    } catch (err: any) {
      setError("SYSTEM ERROR: " + err.message.toUpperCase())
      setLoading(false)
    }
  }

  if (!mounted) return null

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 md:p-10 font-sans relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-black text-white selection:bg-indigo-500/30' : 'bg-[#FAFAFA] text-zinc-900 selection:bg-indigo-500/30'}`}>
      
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

      {/* Dynamic Background Noise & Blob */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
        <div className={`absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 ${isDark ? 'mix-blend-overlay' : 'mix-blend-multiply'}`}></div>
        {/* Mavi/Mor (Indigo) Admin Vurgusu */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
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
            <div className={`absolute inset-0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}></div>
            <img src="https://novatrum.eu/logo.png" alt="Novatrum" className={`w-8 h-8 md:w-10 md:h-10 object-contain ${isDark ? 'invert' : ''}`} />
          </div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tighter mb-4">Command Center</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">System Administration</p>
        </div>

        {/* Login Box */}
        <div className={`backdrop-blur-xl border p-8 md:p-12 rounded-[40px] shadow-2xl relative transition-colors duration-500 ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white/70 border-zinc-200'}`}>
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

          <form onSubmit={handleLogin} className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 block ml-2">System Identity</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@novatrum.eu"
                  className={`w-full p-4 md:p-5 rounded-[20px] md:rounded-[24px] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-medium appearance-none ${isDark ? 'bg-black/50 border-zinc-800 text-white placeholder:text-zinc-700' : 'bg-zinc-50 border border-zinc-200 text-black placeholder:text-zinc-400'}`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 block ml-2">Security Key</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full p-4 md:p-5 rounded-[20px] md:rounded-[24px] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm font-medium appearance-none ${isDark ? 'bg-black/50 border-zinc-800 text-white placeholder:text-zinc-700' : 'bg-zinc-50 border border-zinc-200 text-black placeholder:text-zinc-400'}`}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className={`border py-4 rounded-2xl overflow-hidden ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}
                >
                  <p className={`text-[9px] font-bold uppercase tracking-widest text-center px-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`w-full p-5 md:p-6 rounded-[20px] md:rounded-[24px] font-bold uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 appearance-none relative overflow-hidden group ${isDark ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)]' : 'bg-black text-white shadow-[0_0_30px_rgba(0,0,0,0.1)] hover:shadow-[0_0_40px_rgba(0,0,0,0.2)]'}`}
            >
              <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] ${isDark ? 'via-black/20' : 'via-white/20'}`}></div>
              <span className="relative z-10">{loading ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}</span>
            </button>
          </form>

          <div className={`mt-10 md:mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">Node Secure</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Admin Gateway
            </span>
          </div>

        </div>
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  )
}