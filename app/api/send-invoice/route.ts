import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
    // BURASI KRİTİK: Resend'i burada tanımlıyoruz
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { clientEmail, clientName, invoiceNumber, pdfUrl } = await request.json();
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await resend.emails.send({
            from: 'Novatrum <info@novatrum.eu>',
            to: [clientEmail],
            subject: `Novatrum Ledger Update: ${invoiceNumber}`,
            html: `<h1>Invoice Ready</h1><p>Hello ${clientName}, your invoice ${invoiceNumber} is attached.</p>`,
            attachments: [{ filename: `${invoiceNumber}.pdf`, content: buffer }],
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}