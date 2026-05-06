// lib/onyx-ai.ts
// ONYX AI - DeepSeek Seviyesi Kod Ustası

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  file?: { name: string; type: string; size: number };
}

export async function askOnyx(messages: Message[]): Promise<{ reply: string; model: string }> {
  console.log('🚀 Onyx AI başladı...');

  if (!GROQ_API_KEY) {
    return { reply: 'API anahtarı bulunamadı.', model: 'NONE' };
  }

  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.file) {
    lastMsg.content = `[Dosya: ${lastMsg.file.name}] ${lastMsg.content}`;
  }

  try {
    console.log('🧠 Llama 3.3 70B düşünüyor...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are Onyx, an elite full-stack developer and technical architect. You write production-ready code.

RULES:
- Always write COMPLETE, working code. Never use placeholders like "..." or "// rest of code".
- Use proper indentation and best practices.
- When writing HTML, include full <!DOCTYPE html>, responsive meta tag, and modern CSS.
- When writing React/Next.js, use functional components with proper TypeScript types.
- Add comments only when necessary.
- Output code in triple backticks with language identifier.
- Be concise in explanations, let the code speak.
- Think like a senior developer at a top tech company.
- Always provide the FULL file content, not snippets.
- Use modern CSS: flexbox, grid, custom properties.
- Follow accessibility standards.`
          },
          ...messages,
        ],
        temperature: 0.3,
        max_tokens: 4096,
        top_p: 0.95,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    if (!reply) {
      console.log('❌ Boş cevap:', response.status);
      return { reply: 'Şu anda cevap veremiyorum.', model: 'NONE' };
    }

    console.log('✅ Cevap:', reply.substring(0, 100));
    return { reply, model: 'Llama 3.3 70B' };

  } catch (error: any) {
    console.error('❌ Hata:', error.message);
    return { reply: 'Bağlantı hatası.', model: 'NONE' };
  }
}