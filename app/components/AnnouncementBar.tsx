"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Megaphone, AlertTriangle, ShieldAlert, Gift, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AnnouncementBar() {
    const [announcement, setAnnouncement] = useState<any>(null);

    useEffect(() => {
        fetchAnnouncement();

        // GERÇEK ZAMANLI DİNLEME: Admin panelinden güncellediğin an burası tetiklenir
        const channel = supabase.channel('public:announcements')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
                fetchAnnouncement();
            })
            .subscribe();

        // Senin isteğin üzerine her ihtimale karşı 5 saniyelik yedek kontrol (Polling)
        const interval = setInterval(fetchAnnouncement, 5000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, []);

    const fetchAnnouncement = async () => {
        const { data } = await supabase.from('announcements').select('*').eq('id', 1).single();
        if (data) setAnnouncement(data);
    };

    if (!announcement || !announcement.is_active) return null;

    // Temaya göre renk ve ikon ayarlamaları
    const themeConfig: Record<string, any> = {
        info: { bg: 'bg-indigo-600', text: 'text-white', icon: Megaphone },
        sale: { bg: 'bg-amber-500', text: 'text-black', icon: Gift },
        holiday: { bg: 'bg-rose-500', text: 'text-white', icon: Heart },
        warning: { bg: 'bg-orange-500', text: 'text-black', icon: AlertTriangle },
        alert: { bg: 'bg-red-600', text: 'text-white', icon: ShieldAlert },
    };

    const currentTheme = themeConfig[announcement.theme] || themeConfig.info;
    const Icon = currentTheme.icon;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`w-full ${currentTheme.bg} ${currentTheme.text} relative z-[9999]`}
            >
                <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-center text-center gap-3">
                    <Icon size={14} className="shrink-0 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {announcement.message}
                    </span>
                    {announcement.link_url && (
                        <Link href={announcement.link_url} className="ml-2 flex items-center gap-1 underline underline-offset-2 opacity-80 hover:opacity-100 transition-opacity text-[10px] font-bold uppercase tracking-widest">
                            Details <ArrowRight size={12} />
                        </Link>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}