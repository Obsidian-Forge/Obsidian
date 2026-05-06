"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase"; 

export default function KeyGenerator() {
  const [clientName, setClientName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [secret, setSecret] = useState("");
  const [qrUri, setQrUri] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");

  const generateSecureBase32Seed = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let result = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
    return result;
  };

  const handleGenerateAndSave = async () => {
    if (!clientName || !projectName) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const newSecret = generateSecureBase32Seed(16);
      
      const { error: sbError } = await supabase
        .from('access_keys')
        .insert([
          { 
            client_name: clientName, 
            project_name: projectName, 
            secret_seed: newSecret, 
            is_active: true 
          }
        ]);

      if (sbError) throw sbError;

      setSecret(newSecret);
      const safeClientName = encodeURIComponent(clientName.replace(/\s+/g, '_'));
      const uri = `otpauth://totp/Novatrum_Core:${safeClientName}?secret=${newSecret}&issuer=Novatrum_Core&digits=12&period=30`;
      
      setQrUri(uri);
      setSaveStatus("success");

    } catch (error: any) {
      console.error("Critical Failure:", error);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
      {/* Sol Panel: Girişler */}
      <div className="flex flex-col gap-12">
        <div className="group">
          <label className="block text-zinc-600 text-[0.55rem] tracking-[0.4em] uppercase mb-4 group-focus-within:text-white transition-colors">
            Subject Identifier
          </label>
          <input 
            type="text" 
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="E.G. ARCHITECT_01"
            className="w-full bg-transparent border-b border-zinc-900 pb-3 text-white tracking-[0.3em] font-light outline-none focus:border-white transition-all duration-700 placeholder:text-zinc-900 text-sm"
          />
        </div>

        <div className="group">
          <label className="block text-zinc-600 text-[0.55rem] tracking-[0.4em] uppercase mb-4 group-focus-within:text-white transition-colors">
            Project Designation
          </label>
          <input 
            type="text" 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="E.G. NEBULA_CORE"
            className="w-full bg-transparent border-b border-zinc-800 pb-3 text-white tracking-[0.3em] font-light outline-none focus:border-white transition-all duration-700 placeholder:text-zinc-900 text-sm"
          />
        </div>

        <div className="pt-8">
          <button 
            onClick={handleGenerateAndSave}
            disabled={!clientName || !projectName || isSaving}
            className="w-full border border-zinc-900 py-4 text-zinc-600 text-[0.65rem] tracking-[0.5em] uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-500 disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-zinc-600 group relative overflow-hidden"
          >
            <span className="relative z-10">
              {isSaving ? "Syncing Core..." : "Initiate Seed Protocol"}
            </span>
          </button>
          
          {saveStatus === "error" && (
            <p className="mt-4 text-red-900 text-[0.55rem] tracking-widest uppercase text-center animate-pulse">
              Protocol Error: Check Schema Sync
            </p>
          )}
        </div>
      </div>

      {/* Sağ Panel: Çıktı (QR) */}
      <div className="relative flex flex-col items-center justify-center border border-zinc-950 bg-zinc-950/30 p-12 min-h-[400px] group">
        {/* Dekoratif Köşeler */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-800 group-hover:border-white transition-colors" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-800 group-hover:border-white transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-800 group-hover:border-white transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-800 group-hover:border-white transition-colors" />

        {qrUri ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
             <div className="bg-white p-6 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                <QRCodeSVG 
                  value={qrUri} 
                  size={200} 
                  level="H"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                />
             </div>
             <div className="mt-10 text-center">
                <p className="text-zinc-500 text-[0.55rem] tracking-[0.4em] uppercase mb-2">Encrypted Seed Key</p>
                <p className="text-white text-[0.7rem] tracking-[0.2em] font-mono opacity-50">{secret}</p>
             </div>
             <p className="mt-8 text-zinc-700 text-[0.5rem] tracking-[0.6em] uppercase">
                Awaiting Onyx Sync
             </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 border border-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            </div>
            <p className="text-zinc-800 uppercase tracking-[0.8em] text-[0.6rem]">
              System Idle
            </p>
          </div>
        )}
      </div>
    </div>
  );
}   