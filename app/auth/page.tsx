// app/auth/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { hashCode } from '../../lib/crypto';

export default function BlackGate() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (value.length > 12) value = value.slice(0, 12);
        if (value.length > 8) {
            value = value.slice(0, 4) + '-' + value.slice(4, 8) + '-' + value.slice(8);
        } else if (value.length > 4) {
            value = value.slice(0, 4) + '-' + value.slice(4);
        }
        setCode(value);
    };

    const handleVerify = async () => {
        const cleanCode = code.replace(/-/g, '');

        if (cleanCode.length !== 12) {
            setError('12 DIGITS REQUIRED');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const hash = await hashCode(cleanCode);

            // DEBUG: Konsolda hash'i gör
            console.log('Girilen kod:', cleanCode);
            console.log('Hash:', hash);

            const { data, error: dbError } = await supabase
                .from('onyx_active_tokens')
                .select('id, code_hash, expires_at, status')
                .eq('code_hash', hash)
                .eq('status', 'active')
                .gt('expires_at', new Date().toISOString())
                .single();

            // DEBUG: Supabase yanıtı
            console.log('Supabase data:', data);
            console.log('Supabase error:', dbError);

            if (dbError || !data) {
                setError('ACCESS DENIED');
                return;
            }

            await supabase
                .from('onyx_active_tokens')
                .update({ status: 'used' })
                .eq('id', data.id);

            router.push('/onyx/command');
        } catch (err) {
            console.error('Hata:', err);
            setError('SYSTEM ERROR');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleVerify();
    };

    return (
        <div className="min-h-screen bg-[#000000] flex items-center justify-center">
            <div className="flex flex-col items-center gap-10">

                {/* Başlık */}
                <h1 className="text-[#71717A] text-xs font-light tracking-[8px]">
                    BLACK GATE
                </h1>

                {/* Input */}
                <input
                    type="text"
                    value={code}
                    onChange={handleCodeChange}
                    onKeyDown={handleKeyDown}
                    placeholder="XXXX-XXXX-XXXX"
                    maxLength={14}
                    className="bg-transparent text-white text-2xl tracking-[6px] text-center 
                     py-4 px-2 w-80 font-mono font-light
                     placeholder:text-[#1a1a1a]
                     focus:outline-none
                     border-b border-[#1a1a1a] focus:border-[#4a4a4a]
                     transition-colors"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                />

                {/* Hata */}
                {error && (
                    <p className="text-red-600/70 text-[10px] tracking-[4px] font-light">
                        {error}
                    </p>
                )}

                {/* Buton */}
                <button
                    onClick={handleVerify}
                    disabled={code.length < 14 || loading}
                    className="text-[#4a4a4a] text-[10px] tracking-[6px] font-light
                     hover:text-white transition-colors
                     disabled:opacity-20 disabled:cursor-not-allowed"
                >
                    {loading ? 'VERIFYING...' : 'AUTHENTICATE'}
                </button>

            </div>
        </div>
    );
}