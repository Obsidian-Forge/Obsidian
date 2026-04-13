import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Webhook'lar dışarıdan (Resend sunucularından) geldiği için, 
// güvenlik kurallarını (RLS) aşabilmek adına Service Role anahtarı kullanmalıyız.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // .env dosyanızda bu anahtarın olduğundan emin olun
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    // Eğer gelen bildirim "İletildi" veya "Açıldı" ise
    if (type === 'email.delivered' || type === 'email.opened') {
      const status = type === 'email.opened' ? 'opened' : 'delivered';
      const emailId = data.email_id; // Resend'in mail gönderirken ürettiği ID

      // Supabase'deki 'sent_emails' tablosunda ilgili maili bul ve statüsünü güncelle
      const { error } = await supabaseAdmin
        .from('sent_emails')
        .update({ status: status })
        .eq('resend_id', emailId);

      if (error) console.error('Webhook DB Update Error:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}