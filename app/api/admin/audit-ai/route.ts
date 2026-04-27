import { createGroq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

const groqAdmin = createGroq({
    apiKey: process.env.GROQ_API_KEY_ADMIN || process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Tamamen İngilizce, dürüst ve nokta atışı kurallar içeren prompt
        const prompt = `You are an elite technical sales strategist for Novatrum Engineering, focused on honesty, precision, and efficiency.
        Write a highly persuasive, professional Executive Summary for a website audit report based on the following data.

        [AUDIT DATA]
        Client: ${data.client_name || 'The Client'}
        Target URL: ${data.target_url || 'their website'}
        Identified Infrastructure: ${data.legacy_stack || 'Unknown systems'}
        Scores (out of 100): Performance: ${data.perf}, Accessibility: ${data.a11y}, Best Practices: ${data.bp}, SEO: ${data.seo}.

        WRITING RULES & STRATEGY:
        1. HONESTY: If Best Practices or SEO scores are high (80+), briefly acknowledge this strong foundation. DO NOT invent security vulnerabilities, data breach risks, or technical errors if they don't exist.
        2. FOCUS POINT: Concentrate heavily on the lowest scores (especially Performance if it's under 80). Emphasize the financial impact of slow loading times (e.g., mention that a 1-second delay can cause a 7% drop in conversions).
        3. TECHNOLOGY ANALYSIS: If the infrastructure shows modern tools (like Webpack, React), do NOT call them "outdated legacy systems." Instead, state that their current architecture is unoptimized and hitting performance limits. Only mention technical debt if actual legacy systems (like PHP, jQuery, WordPress) are listed.
        4. TONE: Professional, authoritative, and solution-oriented. Avoid aggressive fear-mongering. Focus on the loss of potential revenue and the opportunity for growth.
        5. FORMAT: Write exactly 2 to 3 short, highly readable paragraphs. Do NOT use any Markdown formatting (no asterisks, no bolding, no headers). Output plain text only.

        MISSION:
        Write a clear summary of their current technical state and conclude strongly by advising an upgrade to a custom, high-performance Node/React architecture built by Novatrum to eliminate these performance bottlenecks.`;

        const result = await generateText({
            model: groqAdmin('llama-3.3-70b-versatile'),
            prompt: prompt,
            temperature: 0.4, // Uydurma payını düşürmek için 0.4'e ayarladık
        });

        return NextResponse.json({ summary: result.text }, { status: 200 });
    } catch (error: any) {
        console.error("AI Audit Error:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown AI generation error. Check your API Keys.";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}