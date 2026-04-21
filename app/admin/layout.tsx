"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, Users, Rocket, Compass, Activity, 
    FileCheck, Mail, Receipt, LogOut, Command 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);
    
    // GÜVENLİK: Timeout Referansı
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 Dakika

    // GÜVENLİK: Oturum Kapatma Fonksiyonu (Timeout olup olmadığını algılar)
    const handleLogout = useCallback(async (isTimeout = false) => {
        await supabase.auth.signOut();
        // push yerine replace kullanıyoruz ki "Geri" tuşu ile tekrar bu sayfaya gelinemezsin
        router.replace(isTimeout ? '/admin/login?timeout=true' : '/admin/login');
    }, [router]);

    // GÜVENLİK: Sayacı Sıfırlama Fonksiyonu
    const resetTimer = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            handleLogout(true); // 30 dk dolunca zaman aşımı ile at
        }, INACTIVITY_TIMEOUT);
    }, [handleLogout, INACTIVITY_TIMEOUT]);

    useEffect(() => {
        const checkTheme = () => {
            const theme = localStorage.getItem('novatrum_theme');
            setIsDark(theme === 'dark');
            if (theme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        };
        checkTheme();
        window.addEventListener('theme-changed', checkTheme);
        return () => window.removeEventListener('theme-changed', checkTheme);
    }, []);

    // GÜVENLİK: Oturum, Hareketsizlik ve Geri Tuşu Koruması
    useEffect(() => {
        if (pathname.includes('/login')) return;

        // 1. Session Doğrulaması (URL kopyalama veya geri tuşu koruması)
        const verifySession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/admin/login');
            }
        };
        verifySession();

        // 2. Anlık Auth Durumu Dinleyicisi (Başka sekmede çıkış yapılırsa anında atar)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                router.replace('/admin/login');
            }
        });

        // 3. Hareketsizlik (Inactivity) Dinleyicileri
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));
        resetTimer(); // İlk açılışta sayacı başlat

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            events.forEach(event => document.removeEventListener(event, resetTimer));
            subscription.unsubscribe();
        };
    }, [pathname, router, resetTimer]);

    if (pathname.includes('/login')) return <>{children}</>;

    // ULTRA-YALIN MENÜ (Google Sheets/Drive'a devredilenler silindi)
    const navItems = [
        // ANA MERKEZLER
        { href: "/admin", icon: <LayoutDashboard size={20} strokeWidth={1.5} />, label: "Overview", isMobile: true },
        { href: "/admin/clients", icon: <Users size={20} strokeWidth={1.5} />, label: "Entities", isMobile: true },
        { href: "/admin/deployments", icon: <Rocket size={20} strokeWidth={1.5} />, label: "Projects", isMobile: true },
        { href: "/admin/discoveries", icon: <Compass size={20} strokeWidth={1.5} />, label: "Discoveries", isMobile: true },
        { href: "/admin/status", icon: <Activity size={20} strokeWidth={1.5} />, label: "Infra", isMobile: true },
        
        // OPERASYONEL ARAÇLAR (Sadece Desktop'ta tam görünür, mobilde Overview'dan girilir)
        { href: "/admin/audit-maker", icon: <FileCheck size={20} strokeWidth={1.5} />, label: "Audit Maker", isMobile: false },
        { href: "/admin/email-maker", icon: <Mail size={20} strokeWidth={1.5} />, label: "Email Maker", isMobile: false },
        { href: "/admin/invoice-generator", icon: <Receipt size={20} strokeWidth={1.5} />, label: "Invoice Maker", isMobile: false },
    ];

    const mobileNavItems = navItems.filter(item => item.isMobile);

    const isActive = (href: string) => {
        if (href === '/admin') return pathname === '/admin';
        return pathname.includes(href);
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
            
            {/* DESKTOP SIDEBAR */}
            <nav className={`fixed left-0 top-0 h-full w-24 hidden lg:flex flex-col items-center py-8 z-[60] border-r transition-colors duration-500 overflow-y-auto custom-scrollbar
                ${isDark ? 'bg-black/60 border-white/5 backdrop-blur-3xl' : 'bg-white/80 border-black/[0.03] backdrop-blur-3xl'}`}>
                
                <div className="mb-8 shrink-0 cursor-pointer" onClick={() => router.push('/admin')}>
                    <img src={isDark ? "/logo-white.png" : "/logo.png"} alt="Novatrum" className="w-10 h-10 object-contain hover:scale-105 transition-transform" />
                </div>

                <div className="flex-1 flex flex-col gap-3 w-full px-3">
                    {/* Main Hubs */}
                    {navItems.slice(0, 5).map(item => (
                        <NavItem key={item.href} {...item} active={isActive(item.href)} isDark={isDark} />
                    ))}
                    
                    <div className="w-8 h-px bg-zinc-200 dark:bg-zinc-800 mx-auto my-2" />
                    
                    {/* Tool Makers */}
                    {navItems.slice(5).map(item => (
                        <NavItem key={item.href} {...item} active={isActive(item.href)} isDark={isDark} />
                    ))}
                </div>

                <button 
                    onClick={() => handleLogout(false)} 
                    className={`mt-6 shrink-0 p-3 transition-colors rounded-xl ${isDark ? 'text-zinc-500 hover:text-red-400 hover:bg-red-900/20' : 'text-zinc-400 hover:text-red-500 hover:bg-red-50'}`}
                >
                    <LogOut size={20} strokeWidth={1.5} />
                </button>
            </nav>

            {/* MOBILE BOTTOM DOCK (Tam 5 ana ikon) */}
            <nav className={`fixed bottom-0 left-0 right-0 h-20 lg:hidden flex items-center justify-around z-[100] border-t px-2 pb-[env(safe-area-inset-bottom)] transition-colors duration-500
                ${isDark ? 'bg-black/80 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-black/[0.03] backdrop-blur-2xl'}`}>
                {mobileNavItems.map(item => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 flex-1 py-2">
                        <div className={`p-2.5 rounded-2xl transition-all ${isActive(item.href) ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'text-zinc-400'}`}>
                            {item.icon}
                        </div>
                    </Link>
                ))}
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="lg:pl-24 min-h-screen flex flex-col relative">
                <header className={`h-16 lg:h-20 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-500
                    ${isDark ? 'bg-black/40 border-white/5' : 'bg-white/60 border-black/[0.02]'}`}>
                    <div className="flex items-center gap-3">
                        <Command size={14} className={isDark ? 'text-zinc-500' : 'text-zinc-400'} />
                        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Command Center</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Core Online</span>
                    </div>
                </header>

                <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 lg:p-12 pb-32 lg:pb-12">
                    {children}
                </div>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 0px; height: 0px; }
                .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

function NavItem({ href, icon, active, isDark, label }: any) {
    return (
        <Link href={href} className="flex flex-col items-center gap-1.5 group w-full relative" title={label}>
            {active && (
                <motion.div layoutId="admin-active-nav" className={`absolute inset-0 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-black/5'}`} />
            )}
            <div className={`p-3 rounded-2xl transition-all duration-300 relative z-10 ${active ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600')}`}>
                {icon}
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-widest transition-all text-center leading-tight ${active ? (isDark ? 'text-zinc-300' : 'text-zinc-800') : 'opacity-0 group-hover:opacity-100 text-zinc-400'} max-w-full overflow-hidden text-ellipsis px-1`}>
                {label}
            </span>
        </Link>
    );
}