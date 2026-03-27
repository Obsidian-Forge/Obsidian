import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
    // Vercel build hatasını önlemek için Resend'i burada başlatıyoruz
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { clientEmail, clientName, invoiceNumber, pdfUrl } = await request.json();

        // PDF'i Supabase Storage'dan çekiyoruz
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await resend.emails.send({
            from: 'Novatrum <info@novatrum.eu>',
            to: [clientEmail],
            subject: `Novatrum Ledger Update: ${invoiceNumber}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
                    <h2 style="text-transform: uppercase; font-weight: 900;">Novatrum Ledger</h2>
                    <p>Hello <strong>${clientName}</strong>,</p>
                    <p>A new ledger entry has been generated: <strong>${invoiceNumber}</strong></p>
                    <p>Please find the attached document for your records.</p>
                </div>
            `,
            attachments: [
                {
                    filename: `${invoiceNumber}.pdf`,
                    content: buffer,
                },
            ],
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Resend Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}