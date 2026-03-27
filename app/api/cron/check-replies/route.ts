import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    // 1 saat öncesini hesapla
    const birSaatOnce = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // support_replies tablosundan: 
    // 1 saatten eski, admin tarafından atılmış, okunmamış ve maili henüz gitmemiş mesajları bul
    const { data: replies, error } = await supabaseAdmin
      .from('support_replies')
      .select('*, support_tickets(subject, client_id, clients(email, name))')
      .lt('created_at', birSaatOnce)
      .eq('sender_type', 'admin')
      .eq('is_read', false)
      .eq('email_sent', false);

    if (error) throw error;

    if (!replies || replies.length === 0) {
      return NextResponse.json({ success: true, message: "İşlenecek mesaj yok." });
    }

    for (const reply of replies) {
      // Mevcut email API'ni tetikle
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'support_reminder',
          email: reply.support_tickets.clients.email,
          clientName: reply.support_tickets.clients.name,
          ticketSubject: reply.support_tickets.subject,
          messagePreview: reply.message.substring(0, 100) + '...'
        }),
      });

      // Mesajı 'mail gönderildi' olarak işaretle
      await supabaseAdmin
        .from('support_replies')
        .update({ email_sent: true })
        .eq('id', reply.id);
    }

    return NextResponse.json({ success: true, processed: replies.length });
  } catch (error: any) {
    console.error("Cron Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}