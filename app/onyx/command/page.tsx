// app/onyx/command/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CommandCenter() {
  const [time, setTime] = useState(new Date());
  const [tokensActive, setTokensActive] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'CONNECTED' | 'OFFLINE'>('OFFLINE');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const modules = [
    { 
      name: 'ONYX AI', 
      desc: 'Hibrit Beyin Motoru', 
      icon: '/ai.svg',
      isOnyx: true,
      url: '/onyx/ai' 
    },
    { 
      name: 'MAPS', 
      desc: 'Bağımsız Navigasyon', 
      icon: '/maps.svg',
      url: '/onyx/maps' 
    },
    { 
      name: 'NOTES', 
      desc: 'Şifreli Not Defteri', 
      icon: '/notes.svg',
      url: '/onyx/notes' 
    },
    { 
      name: 'BROWSER', 
      desc: 'Özel Tarayıcı', 
      icon: '/browser.svg',
      url: '/onyx/browser' 
    },
    { 
      name: 'CALENDAR', 
      desc: 'Akıllı Takvim', 
      icon: '/calendar.svg',
      url: '/onyx/calendar' 
    },
    { 
      name: 'VAULT', 
      desc: 'Güvenlik Kasası', 
      icon: '/vault.svg',
      url: '/onyx/vault' 
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] p-8 md:p-16">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-20">
        <div>
          <h1 className="text-white text-xl font-light tracking-[12px] mb-3">
            ONYX COMMAND
          </h1>
          <p className="text-[#3a3a3a] text-[9px] tracking-[6px]">
            NOVATRUM CORE SYSTEM
          </p>
        </div>
        <div className="text-right">
          <div className="text-white text-lg font-mono font-light tracking-[4px]">
            {time.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit', 
              hour12: false 
            })}
          </div>
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] mb-16 bg-[#0a0a0a]">
        <div className="bg-[#000000] p-5">
          <div className="text-[#4a4a4a] text-[8px] tracking-[5px] mb-3">
            ACTIVE TOKENS
          </div>
          <div className="text-white text-lg font-mono font-light">
            {tokensActive}
          </div>
        </div>
        <div className="bg-[#000000] p-5">
          <div className="text-[#4a4a4a] text-[8px] tracking-[5px] mb-3">
            AI STATUS
          </div>
          <div className="text-[#EF4444] text-lg font-mono font-light">
            OFFLINE
          </div>
        </div>
        <div className="bg-[#000000] p-5">
          <div className="text-[#4a4a4a] text-[8px] tracking-[5px] mb-3">
            SYNC
          </div>
          <div className="text-[#71717A] text-lg font-mono font-light">
            {syncStatus}
          </div>
        </div>
        <div className="bg-[#000000] p-5">
          <div className="text-[#4a4a4a] text-[8px] tracking-[5px] mb-3">
            SECURE ENCLAVE
          </div>
          <div className="text-white text-lg font-mono font-light">
            ACTIVE
          </div>
        </div>
      </div>

      {/* MODULES */}
      <h2 className="text-[#4a4a4a] text-[9px] tracking-[8px] mb-8">
        SYSTEM MODULES
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[#0a0a0a]">
        {modules.map((mod) => (
          <a
            key={mod.name}
            href={mod.url}
            className="group bg-[#000000] p-7 hover:bg-[#030303] transition-colors no-underline block"
          >
            {/* SVG İkon */}
            <div className={`mb-6 transition-all ${
              mod.isOnyx 
                ? 'w-10 h-10' 
                : 'w-8 h-8'
            }`}>
              <Image
                src={mod.icon}
                alt={mod.name}
                width={mod.isOnyx ? 40 : 32}
                height={mod.isOnyx ? 40 : 32}
                className={`opacity-60 group-hover:opacity-100 transition-opacity ${
                  mod.isOnyx ? 'brightness-0 invert' : ''
                }`}
                style={{ 
                  filter: mod.isOnyx 
                    ? 'brightness(0) invert(1)' 
                    : 'brightness(0) invert(0.3)'
                }}
              />
            </div>
            
            {/* İsim */}
            <div className={`text-xs tracking-[6px] font-light mb-2 ${
              mod.isOnyx ? 'text-white' : 'text-white'
            }`}>
              {mod.name}
            </div>
            
            {/* Açıklama */}
            <div className="text-[#3a3a3a] text-[10px] tracking-[2px]">
              {mod.desc}
            </div>
            
            {/* Ok */}
            <div className="text-[#1a1a1a] text-sm mt-6 group-hover:text-white transition-colors">
              →
            </div>
          </a>
        ))}
      </div>

      {/* FOOTER */}
      <div className="mt-20 pt-6 border-t border-[#0a0a0a] flex justify-between items-center">
        <div className="text-[#1a1a1a] text-[8px] tracking-[5px]">
          ⚔ PENTAGON PROTOCOL
        </div>
        <div className="text-[#1a1a1a] text-[8px] tracking-[5px]">
          ONYX ECOSYSTEM V1.0
        </div>
      </div>
    </div>
  );
}