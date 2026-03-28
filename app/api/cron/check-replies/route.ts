import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    const birSaatOnce = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // 1. ADIM: Sadece okunmamış yanıtları ve bağlı oldukları bilet ID'lerini çekiyoruz
    const { data: replies, error: repliesError } = await supabaseAdmin
      .from('support_replies')
      .select('*, support_tickets(subject, client_id)')
      .lt('created_at', birSaatOnce)
      .eq('sender_type', 'admin')
      .eq('is_read', false)
      .eq('email_sent', false);

    if (repliesError) throw repliesError;
    if (!replies || replies.length === 0) return NextResponse.json({ success: true, message: "No unread replies." });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://novatrum.eu';
    let processedCount = 0;

    for (const reply of replies) {
      const ticket = reply.support_tickets;
      
      if (ticket && ticket.client_id) {
        // 2. ADIM: Her bilet için müşteri bilgisini ayrı bir sorgu ile güvenle çekiyoruz
        const { data: client, error: clientError } = await supabaseAdmin
          .from('clients')
          .select('email, name')
          .eq('id', ticket.client_id)
          .single();

        if (!clientError && client?.email) {
          try {
            // 3. ADIM: Email API'sini tetikle
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

            // Başarılıysa veritabanını işaretle
            await supabaseAdmin
              .from('support_replies')
              .update({ email_sent: true })
              .eq('id', reply.id);
            
            processedCount++;
          } catch (fetchError) {
            console.error("Fetch error:", fetchError);
          }
        }
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}