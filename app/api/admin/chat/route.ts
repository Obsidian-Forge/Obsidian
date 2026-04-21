import { createGroq } from '@ai-sdk/groq';
import { streamText, generateText } from 'ai';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const groqAdmin = createGroq({
    apiKey: process.env.GROQ_API_KEY_ADMIN || process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { messages: frontendMessages, sessionId } = await req.json();

        if (!sessionId) return new Response('Session ID missing', { status: 400 });

        // 1. VERİTABANI ERİŞİMİ - ARTIK TEKNİK DETAYLAR, GİZLİ NOTLAR VE DISCOVERY (FORM) EKLENDİ!
        const [clientsRes, invoicesRes, deploymentsRes, discoveryRes, sessionRes] = await Promise.all([
            supabaseAdmin.from('clients').select('id, full_name, company_name, email, subscription_plan, active_products, monthly_price, maintenance_fee, project_total, tokens_used, monthly_limit, internal_notes'),
            supabaseAdmin.from('client_invoices').select('id, client_id, amount, status, created_at, details'),
            supabaseAdmin.from('deployments').select('id, client_id, project_name, status, progress, client_logs'),
            supabaseAdmin.from('project_discovery').select('client_email, project_type, estimated_price, details'),
            supabaseAdmin.from('admin_chat_sessions').select('title').eq('id', sessionId).single()
        ]);

        const systemDatabase = {
            clients: clientsRes.data || [],
            invoices: invoicesRes.data || [],
            deployments: deploymentsRes.data || [],
            discoveries: discoveryRes.data || [] // Müşterinin tüm mimari istekleri burada
        };

        const lastUserMessage = frontendMessages[frontendMessages.length - 1].content;
        
        await supabaseAdmin.from('admin_chat_messages').insert({ session_id: sessionId, role: 'user', content: lastUserMessage });

        // OTOMATİK İSİMLENDİRME
        if (sessionRes.data?.title === 'New Analysis' || sessionRes.data?.title?.includes('Audit:')) {
            generateText({
                model: groqAdmin('llama-3.3-70b-versatile'),
                prompt: `Summarize this message in maximum 3-4 words to be used as a chat title. Do not use quotes or punctuation. Message: "${lastUserMessage.substring(0, 100)}"`,
            }).then(async (res) => {
                await supabaseAdmin.from('admin_chat_sessions').update({ title: res.text.trim() }).eq('id', sessionId);
            }).catch(console.error);
        }

        const result = await streamText({
            model: groqAdmin('llama-3.3-70b-versatile'),
            messages: frontendMessages,
            temperature: 0.4, 
            
            system: `[CRITICAL: RESPOND IN THE USER'S LANGUAGE - TURKISH IF TURKISH]
            You are "Neural AI", the high-level infrastructure intelligence and personal assistant for Novatrum's CEO, Yasin.
            
            YOUR IDENTITY & KNOWLEDGE:
            1. You are conversational, highly intelligent, and helpful. Do not sound like a rigid robot.
            2. You have FULL ACCESS to general world knowledge.
            3. You have real-time access to Novatrum's internal database (provided below). THIS NOW INCLUDES TECHNICAL LOGS, DISCOVERY FORMS, AND INTERNAL NOTES.

            TECHNICAL & FINANCIAL PROTOCOL (STRICT):
            1. Novatrum is based in Belgium (Europe). ALL financial figures MUST be displayed in EUROS (€). NEVER use US Dollars ($).
            2. Total Monthly Recurring Revenue (MRR) = Sum of 'monthly_price' + Sum of 'maintenance_fee'.
            3. If asked about a client's server, architecture, tech stack, or history, deeply analyze their 'deployments' (client_logs), 'discoveries' (details), and 'clients' (internal_notes, active_products). Do not say you don't have access if the data is in these fields.
            
            [LIVE DATABASE FEED]
            ${JSON.stringify(systemDatabase)}

            Never mention "JSON" or "System Database". Give direct, authoritative answers as if you naturally know everything about the company.`,
            
            onFinish: async (event) => {
                await supabaseAdmin.from('admin_chat_messages').insert({ session_id: sessionId, role: 'assistant', content: event.text });
            }
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}