import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LogoutButton from '../components/LogoutButton';

export default async function DashboardPage() {
  // 1. Sunucu tarafında Supabase istemcisini başlat (Çerezleri okur)
  const supabase = await createClient();

  // 2. Kullanıcı oturumunu güvenli bir şekilde kontrol et
  const { data: { user } } = await supabase.auth.getUser();

  // 3. Eğer kullanıcı yoksa login sayfasına yönlendir (Proxy/Middleware ile çift dikiş güvenlik)
  if (!user) {
    redirect('/dashboard/login');
  }

  // 4. Kullanıcının e-posta adresine kayıtlı projeleri Supabase'den çek
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('client_email', user.email);

  return (
    <div className="min-h-screen bg-white text-black p-8 selection:bg-black selection:text-white">
      <div className="max-w-4xl mx-auto pt-16">
        
        {/* Üst Başlık Bölümü */}
        <div className="flex justify-between items-end mb-16">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-500">Client Portal</span>
            <h1 className="text-4xl font-bold tracking-tighter uppercase">Project Status</h1>
            <p className="text-zinc-400 text-sm font-light">
              Logged in as <span className="text-zinc-900 font-medium">{user.email}</span>
            </p>
          </div>
          
          <div className="flex gap-8 items-center pb-1">
            <button className="text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors cursor-none underline underline-offset-8">
              Support
            </button>
            <LogoutButton />
          </div>
        </div>

        {/* Projeler Listesi */}
        <div className="grid gap-12">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <div 
                key={project.id} 
                className="group relative border border-zinc-100 p-10 rounded-[32px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] transition-all duration-500"
              >
                {/* Proje Başlığı */}
                <div className="flex justify-between items-start mb-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold uppercase tracking-tight text-zinc-900">
                      {project.project_name || "Untitled Project"}
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono uppercase tracking-widest">
                      ID: {project.id.toString().slice(0, 8)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">
                      Active
                    </span>
                  </div>
                </div>

                {/* İlerleme Çubuğu Bölümü */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Development Progress</span>
                    <span className="font-mono text-xl font-bold">{project.progress_percent}%</span>
                  </div>
                  
                  <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                    <div 
                      className="h-full bg-black transition-all duration-1000 ease-out" 
                      style={{ width: `${project.progress_percent}%` }}
                    />
                  </div>

                  {/* Son Güncelleme Mesajı */}
                  <div className="mt-10 p-6 bg-zinc-50 rounded-2xl border border-zinc-100/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Latest Update</span>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed font-light">
                      "{project.status_message || "We are currently setting up your project environment. Stay tuned!"}"
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Proje Yoksa Gösterilecek Boş Durum */
            <div className="py-32 text-center border-2 border-dashed border-zinc-100 rounded-[40px] space-y-4">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-zinc-400 font-light italic">No projects linked to this account yet.</p>
              <button className="text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-4">
                Contact Support
              </button>
            </div>
          )}
        </div>

        {/* Alt Bilgi */}
        <footer className="mt-24 pt-8 border-t border-zinc-50 text-center">
          <p className="text-[10px] text-zinc-300 uppercase tracking-[0.3em] font-medium">
            Novatrum Tech Studio &copy; 2026 // Secure Client Environment
          </p>
        </footer>

      </div>
    </div>
  );
}