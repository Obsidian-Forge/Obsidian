// app/api/onyx-ai/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { askOnyx } from '@/lib/onyx-ai';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const result = await askOnyx(messages);
    
    return NextResponse.json({ 
      reply: result.reply,
      model: result.model 
    });
  } catch {
    return NextResponse.json({ 
      reply: 'Bir hata oluştu.', 
      model: 'NONE' 
    }, { status: 500 });
  }
}