import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { clientEmail, clientName, invoiceNumber, pdfUrl } = await request.json();

        // PDF'i Supabase'den çek
        const response = await fetch(pdfUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await resend.emails.send({
            from: 'Novatrum <info@novatrum.eu>', // Artık domain doğrulanmış olduğu için bunu kullanabilirsin
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
                        .content { padding: 40px; color: #1f2937; }
                        .footer { padding: 20px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
                        .invoice-box { background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 16px; padding: 20px; margin: 25px 0; }
                        .button { display: inline-block; padding: 14px 28px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; margin-top: 20px; }
                        h1 { text-transform: uppercase; letter-spacing: 5px; margin: 0; font-size: 24px; font-weight: 900; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>NOVATRUM</h1>
                            <div style="font-size: 10px; letter-spacing: 2px; margin-top: 8px; opacity: 0.7; font-weight: bold;">SECURE INFRASTRUCTURE</div>
                        </div>
                        <div class="content">
                            <h2 style="margin-top: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Invoice Notification</h2>
                            <p style="line-height: 1.6;">Dear <strong>${clientName}</strong>,</p>
                            <p style="line-height: 1.6;">A new financial statement has been generated and authorized for your project. A digital copy is attached to this transmission and has also been archived in your secure workspace ledger.</p>
                            
                            <div class="invoice-box">
                                <table width="100%">
                                    <tr>
                                        <td style="font-size: 12px; font-weight: bold; color: #6b7280; text-transform: uppercase; padding-bottom: 5px;">Reference ID</td>
                                        <td align="right" style="font-size: 12px; font-weight: bold; padding-bottom: 5px;">${invoiceNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style="font-size: 12px; font-weight: bold; color: #6b7280; text-transform: uppercase;">Status</td>
                                        <td align="right" style="font-size: 12px; font-weight: bold; color: #10b981; text-transform: uppercase;">Awaiting Settlement</td>
                                    </tr>
                                </table>
                            </div>

                            <p style="font-size: 13px; color: #6b7280;">Please ensure the settlement is processed by the specified due date to maintain continuous infrastructure service.</p>
                            
                            <div style="text-align: center;">
                                <a href="https://novatrum.eu/client/login" class="button">ACCESS CLIENT HUB</a>
                            </div>
                        </div>
                        <div class="footer">
                            NOVATRUM SYSTEMS &bull; Flanders, Belgium<br>
                            Automated Billing Node &bull; Secure Transmission
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