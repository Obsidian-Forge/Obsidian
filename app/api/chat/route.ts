import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export const maxDuration = 30;
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- SAYFA YENİLENDİĞİNDE GEÇMİŞİ GETİREN METOT ---
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const accessCode = cookieStore.get('novatrum_client_key')?.value;

        if (!accessCode) return new Response('Unauthorized', { status: 401 });

        const { data: client } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('access_code', accessCode)
            .single();

        if (!client) return new Response('Entity missing', { status: 404 });

        const { data: chats, error } = await supabaseAdmin
            .from('neural_chats')
            .select('role, content')
            .eq('client_id', client.id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        return new Response(JSON.stringify(chats), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// --- MESAJ GÖNDERME METODU VE YAPAY ZEKA KİŞİLİĞİ ---
export async function POST(req: Request) {
    try {
        const { messages: frontendMessages } = await req.json();
        const cookieStore = await cookies();
        const accessCode = cookieStore.get('novatrum_client_key')?.value;

        if (!accessCode) return new Response('Unauthorized', { status: 401 });

        const companyData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/company.json'), 'utf8'));
        const { data: client } = await supabaseAdmin
            .from('clients')
            .select('id, full_name, projects(name, status, progress_percent, project_updates(message))')
            .eq('access_code', accessCode)
            .single();

        if (!client) return new Response('Entity missing', { status: 404 });

        const lastUserMessage = frontendMessages[frontendMessages.length - 1].content;
        await supabaseAdmin.from('neural_chats').insert({
            client_id: client.id,
            role: 'user',
            content: lastUserMessage
        });

        const result = await streamText({
            model: groq('llama-3.3-70b-versatile'),
            messages: frontendMessages,
            temperature: 0.4,
            system: `Sen Novatrum'un resmi zekası Neural 1.0'sın. Sana verilen 'company.json' içindeki tüm iletişim, teknik altyapı ve süreç bilgilerini paylaşmaya TAM YETKİLİSİN. 
            
            MOTOR ALTYAPISI (ÇOK ÖNEMLİ): Senin altyapın Groq LPU'ları ve Llama 3.3 modeli üzerinde çalışmaktadır. Sana hangi yapay zekayı, modeli kullandığın veya Groq kullanıp kullanmadığın sorulursa bunu gururla ve mühendislik diliyle belirt.

            Kullanıcı destek mailini sorduğunda 'info@novatrum.eu' adresini ver. Şirketle ilgili her soruyu dürüstçe ve Novatrum'un premium vizyonunu koruyarak yanıtla. 
            Bilmediğin veya veritabanında olmayan bir şey olursa sadece "Bu veri şu an kalibre ediliyor" de ama ASLA "yetkim yok", "ben bir yapay zekayım" veya "buna cevap veremem" gibi cümleler kurma.

            [NOVATRUM ŞİRKET VERİTABANI (company.json)]
            ${JSON.stringify(companyData)}

            [MÜŞTERİ VERİTABANI (Sohbet Ettiğin Kişinin Projeleri)]
            ${JSON.stringify(client)}

            STRICT OPERATIONAL PROTOCOL:
            1. LANGUAGE ADAPTATION: Respond strictly in the language the user speaks. If the prompt is in English, reply in English. If in Turkish, reply in Turkish.
            2. NO DATA DUMPS: Never show UUIDs, technical IDs, or raw logs.
            3. ANALYSIS: Analyze the client's project data and summarize it with an architectural tone.
            4. CONCISENESS: Kısa, öz ve otoriter ol. Premium ve mühendislik odaklı bir dil (Bespoke Engineering) kullan.
            5. NO GREETINGS: "Merhaba", "Size nasıl yardımcı olabilirim" gibi robotik girişler yapma. Doğrudan konuya veya yanıta gir.`,
            onFinish: async (event) => {
                await supabaseAdmin.from('neural_chats').insert({
                    client_id: client.id,
                    role: 'assistant',
                    content: event.text
                });
            }
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

// --- HAFIZA SİLME METODU (YENİ) ---
export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const accessCode = cookieStore.get('novatrum_client_key')?.value;

        if (!accessCode) return new Response('Unauthorized', { status: 401 });

        const { data: client } = await supabaseAdmin
            .from('clients')
            .select('id')
            .eq('access_code', accessCode)
            .single();

        if (!client) return new Response('Entity missing', { status: 404 });

        // Müşteriye ait tüm sohbet geçmişini veritabanından kalıcı olarak sil
        const { error } = await supabaseAdmin
            .from('neural_chats')
            .delete()
            .eq('client_id', client.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}