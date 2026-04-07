import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Resend servisi için API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Ledger sayfasından (Frontend) gelen verileri karşılıyoruz
        const { to, clientEmail, clientName, fileName, fileUrl, isBatch, attachments } = body;

        // Hedef e-posta adresi
        const targetEmail = to || clientEmail;

        if (!targetEmail) {
            throw new Error("Recipient email address is missing.");
        }

        let emailSubject = '';
        let htmlContent = '';
        let emailAttachments: any[] = [];

        // 1. TOPLU GÖNDERİM (BATCH MODE)
        if (isBatch && attachments && attachments.length > 0) {
            emailSubject = `Novatrum: Invoice Package Ready (${attachments.length} Documents)`;
            
            // Raw Linkleri Kaldırdık, Sadece İsimleri Gösteriyoruz
            const listHtml = attachments.map((att: any) => 
                `<li style="margin-bottom: 8px; font-weight: bold; color: #3f3f46;">
                    • ${att.fileName}
                </li>`
            ).join('');

            // Buton KALDILARAK sadeleştirildi
            htmlContent = `
                <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px;">
                    <h2 style="color: #000;">Hello ${clientName},</h2>
                    <p>We have issued <strong>${attachments.length} new document(s)</strong> for your secure Novatrum workspace.</p>
                    <p>You will find the following files securely <strong>attached to this email</strong>:</p>
                    <ul style="background: #f4f4f5; padding: 20px; border-radius: 12px; list-style: none;">
                        ${listHtml}
                    </ul>
                    <p>If you have any questions regarding these documents, please reach out to our support desk.</p>
                    <br />
                    <p style="font-size: 12px; color: #71717a;">
                        Best regards,<br />
                        <strong>Novatrum Infrastructure & Engineering</strong><br />
                        Flanders, Belgium
                    </p>
                </div>
            `;

            // PDF'leri indirip Mail Eklentisi (Attachment) Yapıyoruz
            emailAttachments = await Promise.all(
                attachments.map(async (att: any) => {
                    const pdfResponse = await fetch(att.fileUrl);
                    if (!pdfResponse.ok) throw new Error(`Failed to download PDF: ${att.fileName}`);
                    
                    const arrayBuffer = await pdfResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    return {
                        filename: att.fileName,
                        content: buffer,
                    };
                })
            );

        } 
        // 2. TEKİL GÖNDERİM (SINGLE INVOICE MODE)
        else {
            emailSubject = `Novatrum: New Invoice Available (${fileName})`;
            
            // Buton KALDILARAK sadeleştirildi
            htmlContent = `
                <div style="font-family: sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px;">
                    <h2 style="color: #000;">Hello ${clientName},</h2>
                    <p>A new document (<strong>${fileName}</strong>) has been generated for your secure Novatrum workspace.</p>
                    <p>Please find the official document <strong>attached to this email</strong>.</p>
                    <p>If you have any questions, please contact our support desk.</p>
                    <br />
                    <p style="font-size: 12px; color: #71717a;">
                        Best regards,<br />
                        <strong>Novatrum Infrastructure & Engineering</strong><br />
                        Flanders, Belgium
                    </p>
                </div>
            `;

            // Tek PDF'i indirip Eklenti Yap
            const pdfResponse = await fetch(fileUrl);
            if (!pdfResponse.ok) throw new Error(`Failed to download PDF: ${fileName}`);
            
            const arrayBuffer = await pdfResponse.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            emailAttachments = [{
                filename: fileName,
                content: buffer,
            }];
        }

        // 3. RESEND İLE MAİL GÖNDERİMİ
        const data = await resend.emails.send({
            from: 'Novatrum Billing <info@novatrum.eu>', 
            to: [targetEmail],
            subject: emailSubject,
            html: htmlContent,
            attachments: emailAttachments, // Dosya gerçekten eke kondu.
        });

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error("Resend API Error:", error);
        return NextResponse.json({ error: error.message || 'Failed to dispatch email' }, { status: 500 });
    }
}