import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';

// Resend'i başlatıyoruz
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    const CRON_SECRET = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    // Güvenlik Kontrolü
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Tüm aktif müşterileri çek
        const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('id, full_name, email')
            .is('archived_at', null);

        if (clientError) throw clientError;

        const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
        const currentYear = new Date().getFullYear();
        let generatedCount = 0;

        // 2. Faturaları oluştur
        for (const client of clients) {
            const invoiceName = `MAINT-${currentYear}-${currentMonthName.toUpperCase().substring(0, 3)}-${client.id.substring(0, 4)}`;
            
            const { error: dbError } = await supabase.from('client_invoices').insert({
                client_id: client.id,
                file_name: `${invoiceName} (Automated Draft)`,
                file_url: '#', 
                status: 'draft'
            });

            if (!dbError) {
                generatedCount++;
            }
        }

        // 3. EĞER fatura oluşturulduysa Yasin'e (Sana) bildirim gönder
        if (generatedCount > 0) {
            await resend.emails.send({
                from: 'Novatrum System <onboarding@resend.dev>', // Domain doğrulaması yaptıysan kendi mailini yazabilirsin
                to: 'novatrum.hq@gmail.com', // BURAYA KENDİ MAİLİNİ YAZ
                subject: `🔔 Faturalar Hazır: ${currentMonthName} ${currentYear}`,
                html: `
                    <h1>İşlem Başarılı!</h1>
                    <p>Merhaba Yasin,</p>
                    <p>GitHub Actions üzerinden tetiklenen aylık otomasyon çalıştı.</p>
                    <p><strong>${currentMonthName} ${currentYear}</strong> dönemi için toplam <strong>${generatedCount}</strong> adet fatura taslağı başarıyla oluşturuldu.</p>
                    <p>Şimdi admin panelinden kontrol edip onaylayabilirsin.</p>
                    <br />
                    <p>Sevgiler, <br /> Novatrum Altyapısı</p>
                `
            });
        }

        return NextResponse.json({ success: true, generatedCount });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}