import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const birSaatOnce = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // HATA ÇÖZÜMÜ: İlişki isimlerini (Foreign Key) ünlem işareti ile belirttik
    const { data: replies, error } = await supabaseAdmin
      .from('support_replies')
      .select(`
        *,
        support_tickets!support_replies_ticket_id_fkey (
          subject,
          client_id,
          clients!support_tickets_client_id_fkey (
            email,
            name
          )
        )
      `)
      .lt('created_at', birSaatOnce)
      .eq('sender_type', 'admin')
      .eq('is_read', false)
      .eq('email_sent', false);

    if (error) {
      console.error("Supabase Query Error:", error);
      throw error;
    }

    if (!replies || replies.length === 0) {
      return NextResponse.json({ success: true, message: "No unread replies." });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://novatrum.eu';

    for (const reply of replies) {
      // support_tickets ve clients verilerinin gelip gelmediğini kontrol ediyoruz
      const ticket = reply.support_tickets;
      const client = ticket?.clients;

      if (client?.email) {
        try {
          await fetch(`${siteUrl}/api/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'support_reminder',
              email: client.email,
              clientName: client.name,
              ticketSubject: ticket.subject,
              messagePreview: reply.message.substring(0, 100) + '...'
            }),
          });

          // Mail gönderildikten sonra veritabanını güncelle
          await supabaseAdmin
            .from('support_replies')
            .update({ email_sent: true })
            .eq('id', reply.id);
            
        } catch (fetchError) {
          console.error(`Email send failed for reply ${reply.id}:`, fetchError);
        }
      }
    }

    return NextResponse.json({ success: true, processed: replies.length });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}