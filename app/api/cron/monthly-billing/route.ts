import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Güvenlik: Bu endpoint'e sadece GitHub Actions erişebilir
const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Sistemdeki tüm aktif müşterileri çek
        const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('id, full_name, email')
            .is('archived_at', null);

        if (clientError) throw clientError;

        const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
        const currentYear = new Date().getFullYear();

        let generatedCount = 0;

        // 2. Her müşteri için aylık bakım faturası taslağı oluştur
        for (const client of clients) {
            // Not: Gerçek sistemde burada müşterinin "Maintenance" paketi olup olmadığını kontrol eden bir DB sorgusu olmalı.
            // Şimdilik test için herkese taslak oluşturuyoruz.
            
            const invoiceName = `MAINT-${currentYear}-${currentMonthName.toUpperCase().substring(0, 3)}-${client.id.substring(0, 4)}`;
            
            const { error: dbError } = await supabase.from('client_invoices').insert({
                client_id: client.id,
                file_name: `${invoiceName} (Automated Draft)`,
                file_url: '#', // Taslak olduğu için henüz PDF yok
                status: 'draft' // Yeni statü: Taslak
            });

            if (!dbError) generatedCount++;
        }

        // 3. Sana bir bildirim maili atar (Resend veya benzeri bir servis ile eklenebilir)
        console.log(`Successfully generated ${generatedCount} invoice drafts for ${currentMonthName}.`);

        return NextResponse.json({ success: true, generatedCount });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}