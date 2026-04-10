"use client";

import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Login sayfasındaysak aktivite takibi yapmaya gerek yok
    if (pathname === '/admin/login') return;

    const TIMEOUT_MS = 30 * 60 * 1000; // 30 Dakika (Milisaniye cinsinden)

    const updateActivity = () => {
      // Her fare hareketinde veya tıklamada son aktivite saatini günceller
      localStorage.setItem('novatrum_admin_last_activity', Date.now().toString());
    };

    const checkActivity = async () => {
      const lastActive = localStorage.getItem('novatrum_admin_last_activity');
      if (lastActive && Date.now() - parseInt(lastActive) > TIMEOUT_MS) {
        // 30 DAKİKA DOLDU VEYA PC UYKUDAN UYANDI!
        localStorage.removeItem('novatrum_admin_last_activity');
        await supabase.auth.signOut(); // Supabase oturumunu zorla kapat
        router.push('/admin/login?timeout=true'); // Parametre ile login'e at
      }
    };

    // Sayfa yüklendiğinde süreci başlat
    updateActivity();

    // DOM Olaylarını (Etkileşimleri) Dinle
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('scroll', updateActivity);
    window.addEventListener('click', updateActivity);

    // Her 1 dakikada bir kontrol et (PC uyku modundan çıkınca anında yakalar)
    const interval = setInterval(checkActivity, 60000);

    // Tarayıcı sekmesi arka planda kalıp tekrar öne alındığında da kontrol et
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkActivity();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Component unmount olduğunda dinleyicileri temizle
    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('click', updateActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, [pathname, router]);

  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-50 overflow-y-auto selection:bg-black selection:text-white transition-colors duration-500">
      
      {/* KRİTİK CSS EZİCİ (OVERRIDE) */}
      <style dangerouslySetInnerHTML={{ __html: `
        *, body, html {
            cursor: auto !important;
        }
        button, a, select, [role="button"], label.cursor-pointer, input[type="file"], input[type="color"], input[type="range"], tr.cursor-pointer {
            cursor: pointer !important;
        }
        input[type="text"], input[type="email"], input[type="tel"], input[type="number"], textarea {
            cursor: text !important;
        }
        /* Global custom cursor'u tamamen gizle */
        .custom-cursor, #cursor, .cursor-dot, .cursor-outline, .mouse-cursor {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
        }
      `}} />

      <main className="relative z-[1] min-h-screen">
        {children}
      </main>
    </div>
  )
}