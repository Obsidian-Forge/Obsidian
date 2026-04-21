import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';

export const maxDuration = 30;

const groqAdmin = createGroq({
    apiKey: process.env.GROQ_API_KEY_ADMIN || process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const prompt = `You are an elite technical sales strategist for Novatrum Engineering. 
        Write a highly persuasive, professional Executive Summary for a website audit report.
        
        [AUDIT DATA]
        Client: ${data.client_name || 'The Client'}
        Target URL: ${data.target_url || 'their website'}
        Legacy Tech Stack: ${data.legacy_stack || 'Unknown outdated systems'}
        PageSpeed Scores (out of 100): Performance: ${data.perf}, Accessibility: ${data.a11y}, Best Practices: ${data.bp}, SEO: ${data.seo}.

        YOUR MISSION:
        Write 2-3 short, hard-hitting paragraphs. 
        1. If the performance is low (under 80), heavily emphasize how every second of delay costs them revenue, conversions, and damages brand trust.
        2. If the tech stack is old (like jQuery, PHP, WordPress), mention security risks and technical debt.
        3. Conclude strongly by advising an upgrade to a custom, high-performance Node/React architecture by Novatrum.
        
        Do not use markdown headers or asterisks. Write clear, professional, plain-text paragraphs. Focus on the business and financial impact of these technical metrics.`;

        const result = await generateText({
            model: groqAdmin('llama-3.3-70b-versatile'),
            prompt: prompt,
            temperature: 0.5,
        });

        return new Response(JSON.stringify({ summary: result.text }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error: any) {
        console.error("AI Audit Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}