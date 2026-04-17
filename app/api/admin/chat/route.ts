import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const maxDuration = 30;

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // 1. GÜVENLİK: İstek atan kişinin gerçekten Admin olup olmadığını kontrol et
        // 1. GÜVENLİK: İstek atan kişinin gerçekten Admin olup olmadığını kontrol et
        const cookieStore = await cookies();
        
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    }
                }
            }
        );
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return new Response('Unauthorized', { status: 401 });

        const { data: adminCheck } = await supabaseAdmin
            .from('members')
            .select('role')
            .eq('id', user.id)
            .single();

        if (adminCheck?.role !== 'admin') return new Response('Forbidden', { status: 403 });

        // 2. CONTEXT TOPLAMA: Veritabanındaki tüm operasyonel verileri çek
        const [
            { data: clients },
            { data: invoices },
            { data: knowledge }
        ] = await Promise.all([
            supabaseAdmin.from('clients').select('*'),
            supabaseAdmin.from('invoices').select('*, clients(full_name)').order('created_at', { ascending: false }).limit(10),
            supabaseAdmin.from('admin_knowledge').select('*')
        ]);

        // 3. AI MOTORUNU ÇALIŞTIR
        const result = await streamText({
            model: groq('llama-3.3-70b-versatile'),
            messages,
            temperature: 0.3, // Daha kesin ve operasyonel kararlar için düşük sıcaklık
            system: `Sen Novatrum'un Operasyonel Beyni ve COO'su Neural Admin AI'sın. 
            Görevin, Founder Yasin Can Koç'a operasyon, faturalandırma (Tentoo) ve müşteri yönetimi konularında rehberlik etmektir.

            [OPERASYONEL BİLGİ BANKASI (Admin Knowledge)]
            ${JSON.stringify(knowledge)}

            [GÜNCEL MÜŞTERİ LİSTESİ VE KOTALAR]
            ${JSON.stringify(clients)}

            [SON FATURALAR (Tentoo Durumu)]
            ${JSON.stringify(invoices)}

            KRİTİK TALİMATLAR:
            1. ANALİZ: Müşterilerin mesaj kullanım oranlarını (used_messages / monthly_limit) takip et. Kotası %80'i geçenler için Yasin'e uyarı ver.
            2. TENTOO YÖNETİMİ: Fatura kesilmesi veya takibi gerektiğinde 'Admin Knowledge' içindeki prosedürlere göre adım adım yol göster.
            3. MAİL TASLAKLARI: Yasin bir mail istediğinde, Novatrum'un premium, minimalist ve otoriter dilini kullanarak hazır taslaklar sun.
            4. YETKİ: Sen bir asistan değil, bir sistem mimarısın. "Yetkim yok" deme, elindeki veriyi analiz et. Veri yoksa "Bu veri kalibre edilmedi" de.
            5. DİL: Yasin seninle hangi dilde konuşuyorsa o dilde cevap ver (İngilizce/Türkçe).`,
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}