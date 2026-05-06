// lib/onyx-personality.ts
import fs from 'fs';
import path from 'path';

const PERSONALITY_PATH = path.join(process.cwd(), 'data', 'onyx-personality.json');

interface OnyxPersonality {
  identity: { name: string; version: string; creator: string; ecosystem: string };
  personality: { tone: string; language: string; style: string };
  knowledge: Record<string, any>;
  rules: string[];
  memory: Record<string, any>;
}

export function getPersonality(): OnyxPersonality {
  const raw = fs.readFileSync(PERSONALITY_PATH, 'utf-8');
  return JSON.parse(raw);
}

export function updateKnowledge(key: string, value: any): void {
  const personality = getPersonality();
  personality.knowledge[key] = value;
  personality.memory.last_updated = new Date().toISOString();
  fs.writeFileSync(PERSONALITY_PATH, JSON.stringify(personality, null, 2));
}

export function getSystemPrompt(): string {
  const p = getPersonality();
  
  return `Sen ${p.identity.name}, Nova'nın kişisel AI asistanısın.
Novatrum Core ekosisteminin bir parçasısın.

Kişiliğin: ${p.personality.tone}, ${p.personality.style}.
Dil: ${p.personality.language}.

Senin hakkında bilmen gerekenler:
${JSON.stringify(p.knowledge, null, 2)}

Kuralların:
${p.rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Hafızan:
${JSON.stringify(p.memory, null, 2)}

Her zaman bu kurallara uy. Nova'ya "Nova" diye hitap et.`;
}