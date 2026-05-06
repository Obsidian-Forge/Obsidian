"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { verifyBlackGateAccess } from "../actions";

export default function TheBlackGate() {
  const [code, setCode] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Sadece harf ve rakamları al, büyük harfe çevir
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    
    // 12 karakterle sınırla
    if (val.length > 12) val = val.slice(0, 12);
    
    // XXXX-XXXX-XXXX formatına sok
    const formatted = val.match(/.{1,4}/g)?.join("-") || val;
    setCode(formatted);
    setHasError(false); // Kullanıcı yazmaya başlayınca hatayı temizle
  };

  const handleInitiate = async (e: FormEvent) => {
    e.preventDefault();
    if (code.length !== 14) return; // 12 harf + 2 tire

    setIsAuthenticating(true);
    setHasError(false);

    // Tireleri çıkarıp saf 12 haneli kodu backend'e gönderiyoruz
    const pureCode = code.replace(/-/g, "");
    
    const result = await verifyBlackGateAccess(pureCode);

    if (result.success) {
      // ERİŞİM ONAYLANDI
      setSuccessMsg(`Welcome, ${result.client}. Connecting to ${result.project}...`);
      
      // 2 saniye o lüks mesajı gösterip içeri al
      setTimeout(() => {
        // TODO: Asıl dashboard sayfana yönlendirilecek
        router.push("/core/dashboard"); 
      }, 2000);
      
    } else {
      // ERİŞİM REDDEDİLDİ
      setIsAuthenticating(false);
      setHasError(true);
      setCode(""); // Yanlış kodu temizle
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center selection:bg-zinc-800">
      
      <div className="mb-16 text-center">
        <h1 className="text-zinc-600 text-[0.65rem] tracking-[0.5em] uppercase mb-2">Novatrum</h1>
        <h2 className="text-white text-sm tracking-[0.4em] font-light">SECURE ENCLAVE</h2>
      </div>

      <form onSubmit={handleInitiate} className="flex flex-col items-center w-full max-w-sm">
        
        <label className="text-zinc-500 text-[0.65rem] tracking-[0.3em] uppercase mb-8">
          Enter Authorization Code
        </label>

        <input
          type="text"
          value={code}
          onChange={handleInputChange}
          placeholder="XXXX-XXXX-XXXX"
          disabled={isAuthenticating || !!successMsg}
          spellCheck={false}
          className={`w-full bg-transparent border-b-2 text-center text-2xl tracking-[0.3em] font-light outline-none pb-4 transition-colors duration-500 placeholder:text-zinc-800 disabled:opacity-50
            ${hasError ? "border-red-900 text-red-500" : "border-zinc-800 focus:border-zinc-500 text-white"}
          `}
        />

        {/* Durum Mesajları ve Buton */}
        <div className="h-12 mt-12 w-full flex items-center justify-center">
          {successMsg ? (
            <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase animate-pulse">
              {successMsg}
            </p>
          ) : hasError ? (
            <p className="text-red-500/80 text-xs tracking-[0.3em] uppercase">
              Access Denied
            </p>
          ) : (
            <button
              type="submit"
              disabled={code.length !== 14 || isAuthenticating}
              className="text-zinc-500 text-[0.65rem] tracking-[0.4em] uppercase hover:text-white transition-colors duration-500 disabled:opacity-0"
            >
              {isAuthenticating ? "Authenticating..." : "Initiate Sequence"}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}