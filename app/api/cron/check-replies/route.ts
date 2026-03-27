import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side için yetkili client
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
    try {
        const birSaatOnce = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        // 1. Son 1 saat içinde atılmış ve henüz 'bildirildi' olarak işaretlenmemiş mesajları bul
        // Not: ticket_replies tablosunda 'is_notified' diye bir sütun olduğunu varsayıyoruz
        // Sadece ADMIN tarafından atılan mesajlar için mail gönder
        const { data: replies, error } = await supabaseAdmin
            .from('ticket_replies')
            .select('*, support_tickets(subject, client_id, clients(email, name))')
            .lt('created_at', birSaatOnce)
            .eq('is_notified', false)
            .eq('sender_type', 'admin'); // Bu satırı ekle!

        if (error) throw error;

        for (const reply of replies) {
            // 2. Senin mevcut mail API'ne istek atıyoruz
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

            // 3. Tekrar mail gitmemesi için işaretle
            await supabaseAdmin
                .from('ticket_replies')
                .update({ is_notified: true })
                .eq('id', reply.id);
        }

        return NextResponse.json({ success: true, processed: replies.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}