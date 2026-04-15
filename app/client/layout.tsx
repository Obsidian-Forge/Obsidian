"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquare, Zap, Command, Cpu, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isNeuralOpen, setIsNeuralOpen] = useState(false);
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

    const navItems = [
        { href: "/client/dashboard", icon: <LayoutDashboard size={20} />, label: "Hub" },
        { href: "/client/neural", icon: <Cpu size={20} />, label: "Neural" },
        { href: "/client/support", icon: <MessageSquare size={20} />, label: "Desk" },
        { href: "/client/settings", icon: <Zap size={20} />, label: "Node" },
    ];

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
            
            {/* DESKTOP SIDEBAR (Sadece PC) */}
            <nav className={`fixed left-0 top-0 h-full w-20 hidden lg:flex flex-col items-center py-8 z-[60] border-r transition-colors duration-500 
                ${isDark ? 'bg-black/60 border-white/5 backdrop-blur-3xl' : 'bg-white/60 border-black/[0.03] backdrop-blur-3xl'}`}>
                <div className="mb-12">
                    <img src={isDark ? "/logo-white.png" : "/logo.png"} alt="Novatrum" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex-1 flex flex-col gap-8">
                    {navItems.map(item => (
                        <NavItem key={item.href} {...item} active={pathname === item.href} isDark={isDark} />
                    ))}
                </div>
                <button onClick={() => {localStorage.clear(); router.push('/client/login');}} className="mt-auto p-3 text-zinc-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                </button>
            </nav>

            {/* MOBILE BOTTOM DOCK (Sadece Telefon) */}
            <nav className={`fixed bottom-0 left-0 right-0 h-20 lg:hidden flex items-center justify-around z-[100] border-t px-6 pb-[env(safe-area-inset-bottom)] transition-colors duration-500
                ${isDark ? 'bg-black/80 border-white/5 backdrop-blur-2xl' : 'bg-white/80 border-black/[0.03] backdrop-blur-2xl'}`}>
                {navItems.map(item => (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
                        <div className={`p-2.5 rounded-2xl transition-all ${pathname === item.href ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'text-zinc-400'}`}>
                            {item.icon}
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${pathname === item.href ? (isDark ? 'text-white' : 'text-black') : 'text-zinc-500'}`}>{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* MAIN CONTENT */}
            <main className="lg:pl-20 min-h-screen flex flex-col relative">
                <header className={`h-16 lg:h-20 flex items-center justify-between px-6 lg:px-12 sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-500
                    ${isDark ? 'bg-black/40 border-white/5' : 'bg-white/40 border-black/[0.02]'}`}>
                    <div className="flex items-center gap-3">
                        <Command size={14} className="text-zinc-400" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Novatrum Core</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Operational</span>
                    </div>
                </header>

                <div className={`flex-1 w-full max-w-[1600px] mx-auto p-6 lg:p-12 pb-32 lg:pb-12 transition-colors duration-500 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}

function NavItem({ href, icon, active, isDark, label }: any) {
    return (
        <Link href={href} className="flex flex-col items-center gap-1 group">
            <div className={`p-3 rounded-2xl transition-all duration-500 ${active ? (isDark ? 'bg-white text-black scale-110' : 'bg-black text-white scale-110') : (isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-black')}`}>
                {icon}
            </div>
            <span className={`text-[8px] font-bold uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{label}</span>
        </Link>
    );
}