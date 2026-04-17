"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, Users, Rocket, Wallet, MessageSquare, LogOut, Command 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);

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

    if (pathname.includes('/login')) return <>{children}</>;

    // YENİ "HUB" MİMARİSİ (Sadece 5 Ana Merkez)
    const navItems = [
        { href: "/admin/dashboard", icon: <LayoutDashboard size={20} strokeWidth={1.5} />, label: "Overview" },
        { href: "/admin/clients", icon: <Users size={20} strokeWidth={1.5} />, label: "Entity CRM" },
        { href: "/admin/deployments", icon: <Rocket size={20} strokeWidth={1.5} />, label: "Deployments" },
        { href: "/admin/ledger", icon: <Wallet size={20} strokeWidth={1.5} />, label: "Ledger" },
        { href: "/admin/support", icon: <MessageSquare size={20} strokeWidth={1.5} />, label: "Comms" },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FAFAFA]'}`}>
            
            {/* DESKTOP SIDEBAR */}
            <nav className={`fixed left-0 top-0 h-full w-24 hidden lg:flex flex-col items-center py-8 z-[60] border-r transition-colors duration-500 
                ${isDark ? 'bg-black/60 border-white/5 backdrop-blur-3xl' : 'bg-white/80 border-black/[0.03] backdrop-blur-3xl'}`}>
                
                {/* LOGO AREA */}
                <div className="mb-10 shrink-0">
                    <img src={isDark ? "/logo-white.png" : "/logo.png"} alt="Novatrum" className="w-10 h-10 object-contain hover:scale-105 transition-transform" />
                </div>

                {/* THE 5 HUBS */}
                <div className="flex-1 flex flex-col gap-4 w-full px-3">
                    {navItems.map(item => (
                        <NavItem key={item.href} {...item} active={pathname.includes(item.href)} isDark={isDark} />
                    ))}
                </div>

                {/* LOGOUT BUTTON */}
                <button onClick={handleLogout} className={`mt-auto shrink-0 p-3 transition-colors rounded-xl ${isDark ? 'text-zinc-500 hover:text-red-400 hover:bg-red-900/20' : 'text-zinc-400 hover:text-red-500 hover:bg-red-50'}`}>
                    <LogOut size={20} strokeWidth={1.5} />
                </button>
            </nav>

            {/* MOBILE BOTTOM DOCK (Tam 5 ikon kusursuz sığar) */}
            <nav className={`fixed bottom-0 left-0 right-0 h-20 lg:hidden flex items-center justify-around z-[100] border-t px-2 pb-[env(safe-area-inset-bottom)] transition-colors duration-500
                ${isDark ? 'bg-black/80 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-black/[0.03] backdrop-blur-2xl'}`}>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 flex-1 py-2">
                        <div className={`p-2.5 rounded-2xl transition-all ${pathname.includes(item.href) ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'text-zinc-400'}`}>
                            {item.icon}
                        </div>
                    </Link>
                ))}
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="lg:pl-24 min-h-screen flex flex-col relative">
                {/* TOP HEADER */}
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