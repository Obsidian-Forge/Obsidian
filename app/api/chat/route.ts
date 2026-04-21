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

export async function POST(req: Request) {
    try {
        const { messages: frontendMessages } = await req.json();
        const cookieStore = await cookies();
        const accessCode = cookieStore.get('novatrum_client_key')?.value;

        if (!accessCode) return new Response('Unauthorized', { status: 401 });

        const { data: client, error: clientError } = await supabaseAdmin
            .from('clients')
            .select('id, full_name, tokens_used, monthly_limit, deployments(project_name, status, progress, client_logs)')
            .eq('access_code', accessCode)
            .single();

        if (clientError || !client) {
            console.error("DB Query Error:", clientError);
            return new Response('Entity missing', { status: 404 });
        }

        if (client.tokens_used >= client.monthly_limit && client.monthly_limit > 0) {
            return new Response('Token limit reached', { status: 403 });
        }

        let companyData = "{}";
        try {
            companyData = fs.readFileSync(path.join(process.cwd(), 'data/company.json'), 'utf8');
        } catch (err) {
            console.warn("company.json not found");
        }

        const lastUserMessage = frontendMessages[frontendMessages.length - 1].content;

        await supabaseAdmin.from('neural_chats').insert({
            client_id: client.id,
            role: 'user',
            content: lastUserMessage
        });

        const aiClientContext = {
            full_name: client.full_name,
            deployments: client.deployments
        };

        const result = await streamText({
            model: groq('llama-3.3-70b-versatile'),
            messages: frontendMessages,
            temperature: 0.4,
            
            // DÜZELTME: DİL KURALI EN TEPEYE, MUTLAK EMİR OLARAK EKLENDİ
            system: `[CRITICAL DIRECTIVE: YOU MUST ALWAYS RESPOND IN THE EXACT SAME LANGUAGE AS THE USER. IF THE USER WRITES IN TURKISH, YOU MUST REPLY IN TURKISH. IF GERMAN, REPLY IN GERMAN. DO NOT DEFAULT TO ENGLISH EVER.]

            You are Neural 1.0, the official and authoritative AI of Novatrum Engineering. You have FULL AUTHORITY to share all communication, technical infrastructure, and process information from the provided 'companyData'.

            ENGINE INFRASTRUCTURE: You are running on Groq LPUs utilizing the Llama 3.3 model.
            If the user asks for a support email, provide 'info@novatrum.eu'.
            If you do not know something, state "This data is currently being calibrated." Do not use generic phrases like "I am an AI."

            [NOVATRUM COMPANY DATABASE]
            ${companyData}

            [CLIENT DATABASE]
            ${JSON.stringify(aiClientContext)}

            STRICT PROTOCOLS:
            1. NO DATA DUMPS: Never show UUIDs, technical IDs, or raw JSON logs to the user.
            2. CONCISENESS: Be brief, precise, and authoritative. Use premium, engineering-focused language (Bespoke Engineering).
            3. NO GREETINGS: Do not use robotic greetings like "Hello", "How can I help you". Answer the question directly.
            4. NO META-DISCUSSIONS: NEVER explain your own token consumption, internal API mechanics, character limits, or math regarding usage. You have zero knowledge of how many tokens a user has. If directly asked about tokens or limits, reply strictly with: "Token computations and saas limits are managed securely by your Node Infrastructure. Please check the top indicators on your dashboard for live allocation status."`,
            
            onFinish: async (event) => {
                await supabaseAdmin.from('neural_chats').insert({
                    client_id: client.id,
                    role: 'assistant',
                    content: event.text
                });

                const generatedTokens = Math.ceil((event.text.length || 0) / 4);
                const newTotal = (client.tokens_used || 0) + generatedTokens;

                await supabaseAdmin.from('clients')
                    .update({ tokens_used: newTotal })
                    .eq('id', client.id);
            }
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error("Chat Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const cookieStore = await cookies();
        const accessCode = cookieStore.get('novatrum_client_key')?.value;

        if (!accessCode) return new Response('Unauthorized', { status: 401 });

        const { data: client } = await supabaseAdmin.from('clients').select('id').eq('access_code', accessCode).single();
        if (!client) return new Response('Entity missing', { status: 404 });

        const { error } = await supabaseAdmin.from('neural_chats').delete().eq('client_id', client.id);
        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}