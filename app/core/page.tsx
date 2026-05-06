"use client";

import { motion } from "framer-motion";

export default function CoreDashboard() {
  // Sıralı açılış (Stagger) animasyonları için varyantlar
  // Sıralı açılış (Stagger) animasyonları için varyantlar
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, 
        delayChildren: 0.5,   
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)", 
      transition: { 
        duration: 1.5, 
        // TypeScript'e bu dizinin tam olarak 4 elemanlı sabit bir dizi olduğunu söylüyoruz
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number] 
      } 
    },
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans overflow-x-hidden selection:bg-white selection:text-black">
      {/* Arka plan: Çok hafif, sabit bir derinlik efekti */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black -z-10" />

      {/* Ana Çerçeve (Konteyner) - Animasyonla belirir */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 flex flex-col min-h-screen"
      >
        {/* Üst Bilgi Barı (Header) */}
        <motion.header 
          variants={itemVariants}
          className="w-full flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-900 pb-6 mb-16 gap-6"
        >
          <div>
            <h1 className="text-zinc-500 text-xs tracking-[0.4em] uppercase mb-2">Authenticated User</h1>
            <div className="text-xl md:text-2xl tracking-[0.2em] font-light">CLIENT_001</div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-xs tracking-[0.3em] uppercase">Onyx Link</span>
            {/* Onyx Aktif Göstergesi - Yanıp Sönen (Pulse) Işık */}
            <div className="relative flex items-center justify-center w-3 h-3">
              <span className="absolute inline-flex w-full h-full rounded-full bg-white opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-white"></span>
            </div>
          </div>
        </motion.header>

        {/* Ana İçerik Izgarası (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
          
          {/* Sol Kolon - Proje Özeti */}
          <motion.div variants={itemVariants} className="lg:col-span-2 flex flex-col gap-8">
            <div className="p-8 border border-zinc-900 bg-zinc-950/30 backdrop-blur-sm h-full relative group transition-colors duration-700 hover:border-zinc-800">
              <h2 className="text-zinc-600 text-[0.65rem] tracking-[0.4em] uppercase mb-8">Active Blueprint</h2>
              <div className="text-3xl md:text-4xl tracking-[0.1em] font-light mb-4">THE MONOLITH</div>
              <p className="text-zinc-500 text-sm tracking-wider leading-relaxed font-light max-w-lg">
                Residence project phase 2 in progress. Structural rendering calculations complete. Waiting for client material approval on interior surfaces.
              </p>
              
              {/* İlerleme Çubuğu */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex justify-between text-[0.65rem] text-zinc-600 tracking-[0.2em] mb-3 uppercase">
                  <span>Progress</span>
                  <span>64%</span>
                </div>
                <div className="w-full h-[1px] bg-zinc-900">
                  <div className="h-full bg-white w-[64%]"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sağ Kolon - Modüller */}
          <motion.div variants={itemVariants} className="flex flex-col gap-8">
            {/* Modül 1: Onyx Terminal (Gölge Sistem Bağlantısı) */}
            <div className="p-8 border border-zinc-900 bg-zinc-950/30 backdrop-blur-sm flex-1 relative flex flex-col transition-colors duration-700 hover:border-zinc-800">
              <h2 className="text-zinc-600 text-[0.65rem] tracking-[0.4em] uppercase mb-6 flex items-center justify-between">
                <span>Shadow System</span>
              </h2>
              <div className="flex-1 flex flex-col justify-end">
                <p className="text-zinc-400 text-xs tracking-widest leading-loose font-light">
                  &gt; ONYX: Good evening. Render queue is clear. I have prepared the 3D assets for review. Awaiting your command.
                </p>
                <div className="mt-6 border-t border-zinc-900 pt-4 flex items-center">
                  <span className="text-zinc-600 text-xs mr-3">&gt;</span>
                  <input 
                    type="text" 
                    placeholder="ENTER COMMAND" 
                    className="bg-transparent border-none outline-none text-xs tracking-[0.2em] text-white placeholder:text-zinc-800 w-full font-light"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>

            {/* Modül 2: Güvenlik / Çıkış */}
            <div className="p-8 border border-zinc-900 bg-zinc-950/30 backdrop-blur-sm flex flex-col items-start justify-center transition-colors duration-700 hover:border-zinc-800">
              <h2 className="text-zinc-600 text-[0.65rem] tracking-[0.4em] uppercase mb-4">Connection Status</h2>
              <div className="text-white text-xs tracking-[0.2em] mb-8">SECURE CHANNEL</div>
              
              <button className="text-zinc-500 hover:text-red-500 text-[0.65rem] tracking-[0.4em] uppercase transition-colors duration-500 flex items-center gap-2 group">
                <span className="w-2 h-[1px] bg-zinc-500 group-hover:bg-red-500 transition-colors"></span>
                Terminate Session
              </button>
            </div>
          </motion.div>

        </div>

        {/* Alt Bilgi (Footer) */}
        <motion.footer variants={itemVariants} className="mt-16 pt-8 border-t border-zinc-900 w-full flex justify-between items-center text-[0.6rem] text-zinc-700 tracking-[0.5em] uppercase">
          <span>Novatrum Architecture</span>
          <span>Encrypted</span>
        </motion.footer>

      </motion.div>
    </main>
  );
}