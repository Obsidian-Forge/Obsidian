import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await request.json();
        const { clientEmail, clientName, isCombined, invoices } = body;

        // 1. Gelen verinin kontrolü
        // Eğer invoices dizisi yoksa (eski sistemden geliyorsa), geriye dönük uyumluluk için dizi oluşturalım
        const invoiceList = invoices || [{ 
            invoiceNumber: body.invoiceNumber, 
            pdfUrl: body.pdfUrl 
        }];

        // 2. Tüm PDF linklerini asenkron olarak indirip Buffer'a çeviriyoruz
        const attachments = await Promise.all(
            invoiceList.map(async (inv: any) => {
                const pdfResponse = await fetch(inv.pdfUrl);
                if (!pdfResponse.ok) throw new Error(`Failed to download PDF: ${inv.invoiceNumber}`);
                
                const arrayBuffer = await pdfResponse.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                return {
                    filename: `${inv.invoiceNumber}.pdf`,
                    content: buffer,
                };
            })
        );

        // 3. Mail İçeriğini Hazırlama
        const subject = isCombined 
            ? `Documents Update from Novatrum - ${invoiceList.length} Files`
            : `Invoice Update from Novatrum: ${invoiceList[0].invoiceNumber}`;

        const htmlContent = `
            <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a;">
                <h2 style="color: #000;">Hello ${clientName},</h2>
                <p>Please find the requested documentation attached to this email.</p>
                <ul style="background: #f4f4f5; padding: 20px; border-radius: 12px; list-style: none;">
                    ${invoiceList.map((inv: any) => `<li style="font-weight: bold; margin-bottom: 5px;">• ${inv.invoiceNumber}</li>`).join('')}
                </ul>
                <p>If you have any questions regarding these documents or the infrastructure nodes, please reach out to our support desk.</p>
                <br />
                <p style="font-size: 12px; color: #71717a;">
                    Best regards,<br />
                    <strong>Novatrum Systems</strong><br />
                    Flanders, Belgium
                </p>
            </div>
        `;

        // 4. Maili Gönder
        const data = await resend.emails.send({
            from: 'Novatrum <info@novatrum.eu>',
            to: [clientEmail],
            subject: subject,
            html: htmlContent,
            attachments: attachments, // Resend burada listenin tamamını ekler
        });

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error("Email API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}