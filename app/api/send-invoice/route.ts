import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
    // Resend'i fonksiyonun içinde başlatmak Vercel derleme hatasını (Missing API Key) çözer
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { clientEmail, clientName, invoiceNumber, pdfUrl } = await request.json();

        // PDF'i Supabase'den çek
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await resend.emails.send({
            from: 'Novatrum <info@novatrum.eu>',
            to: [clientEmail],
            subject: `Novatrum Ledger Update: ${invoiceNumber}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: 'Helvetica', Arial, sans-serif; background-color: #fafafa; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 24px; overflow: hidden; }
                        .header { padding: 40px; text-align: center; background-color: #000000; color: #ffffff; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header"><h1>NOVATRUM</h1></div>
                        <div style="padding: 40px;">
                            <p>Hello ${clientName},</p>
                            <p>A new ledger entry has been generated for your infrastructure service.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            attachments: [
                {
                    filename: `${invoiceNumber}.pdf`,
                    content: buffer,
                },
            ],
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Resend Server Error:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}