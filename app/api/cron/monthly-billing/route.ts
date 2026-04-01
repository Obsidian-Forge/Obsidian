import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    // Secret'ı fonksiyon içinde tanımlamak ortam değişkenlerinin daha güvenli okunmasını sağlar
    const CRON_SECRET = process.env.CRON_SECRET;
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('id, full_name, email')
            .is('archived_at', null);

        if (clientError) throw clientError;

        const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
        const currentYear = new Date().getFullYear();
        let generatedCount = 0;

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
            } else {
                console.error(`Error generating invoice for client ${client.id}:`, dbError);
            }
        }

        console.log(`Successfully generated ${generatedCount} invoice drafts for ${currentMonthName}.`);
        return NextResponse.json({ success: true, generatedCount });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}