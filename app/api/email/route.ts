import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Gelen verileri alıyoruz
        const { type, email, clientName } = body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        let finalHtml = '';
        let finalSubject = '';

        switch (type) {
            
            case 'access_code':
                finalSubject = 'Novatrum OS - Secure Access Key';
                finalHtml = `
                    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
                        <h2 style="text-transform: uppercase; font-weight: 900; letter-spacing: -1px;">Welcome to Novatrum OS</h2>
                        <p style="color: #52525b; font-size: 14px;">Hello <strong>${clientName}</strong>,</p>
                        <p style="color: #52525b; font-size: 14px;">Your secure entity has been registered. You can access the client portal using the credentials below:</p>
                        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; margin: 0 0 5px 0;">Access Code</p>
                            <p style="font-size: 20px; font-weight: bold; font-family: monospace; margin: 0; color: #000;">${body.code}</p>
                        </div>
                        <a href="${body.loginLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Access Portal</a>
                    </div>
                `;
                break;

            case 'calculator':
                finalSubject = 'Novatrum - Project Estimate';
                const { upfront, monthly, items, vision } = body;
                const itemsHtml = items.map((item: any) => `
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; color: #333333; font-size: 14px;">${item.label}</td>
                        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #000000; font-size: 14px; font-family: monospace;">${item.price}</td>
                    </tr>
                `).join('');
                const visionText = vision 
                    ? `<div style="margin-top: 30px; padding: 20px; background-color: #fafafa; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; font-size: 10px; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Client Vision</p>
                        <p style="margin: 0; font-size: 14px; color: #555555; font-style: italic;">"${vision}"</p>
                       </div>`
                    : '';
                finalHtml = `
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #f0f0f0; border-radius: 24px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 40px rgba(0,0,0,0.05);">
                        <div style="background: #09090b linear-gradient(135deg, #09090b 0%, #1e1b4b 100%); padding: 60px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; text-transform: uppercase; letter-spacing: 5px; line-height: 1;">NOVATRUM</h1>
                            <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.5); font-size: 10px; text-transform: uppercase; letter-spacing: 3px; font-weight: 700;">Project Estimate</p>
                        </div>
                        <div style="padding: 50px 40px;">
                            <p style="margin: 0 0 10px 0; font-size: 18px; color: #000000; font-weight: 600;">Hello <strong>${clientName}</strong>,</p>
                            <h2 style="margin: 0 0 20px 0; font-size: 12px; color: #000000; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; border-bottom: 1px solid #f0f0f0; padding-bottom: 12px;">Project Scope</h2>
                            <table style="width: 100%; border-collapse: collapse;">${itemsHtml}</table>
                            ${visionText}
                            <div style="margin-top: 50px; padding: 40px; background-color: #fcfcfd; border-radius: 20px; text-align: right; border: 1px solid #f8f8f8;">
                                ${monthly > 0 ? `<p style="margin: 0 0 15px 0; font-size: 12px; color: #666666; text-transform: uppercase; letter-spacing: 1px;">Recurring Services <span style="font-size: 20px; color: #4f46e5; font-weight: 700;">+ €${monthly.toFixed(2)} <span style="font-size: 12px; font-weight: 400; color: #999;">/ mo</span></span></p>` : ''}
                                <p style="margin: 0 0 8px 0; font-size: 11px; color: #999999; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">Total Investment</p>
                                <p style="margin: 0; font-size: 48px; font-weight: 800; color: #000000; letter-spacing: -2px; line-height: 1;">€${upfront.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                `;
                break;

            // YENİ: ANA SAYFA İLETİŞİM FORMU MAİLİ
            case 'contact':
                // Bu mail SANA (kendi mailine) gelecek, o yüzden "to" kısmını değiştireceğiz
                finalSubject = `New Inquiry from ${clientName}`;
                finalHtml = `
                    <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
                        <h2 style="text-transform: uppercase; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px;">New Contact Request</h2>
                        <p style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0;">Via Novatrum Homepage</p>
                        
                        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong style="color: #000;">Name:</strong> <span style="color: #52525b;">${clientName}</span></p>
                            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong style="color: #000;">Email:</strong> <span style="color: #52525b;"><a href="mailto:${email}" style="color: #4f46e5;">${email}</a></span></p>
                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
                                <p style="margin: 0 0 10px 0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #a1a1aa; font-weight: bold;">Message</p>
                                <p style="margin: 0; font-size: 14px; color: #18181b; line-height: 1.6; white-space: pre-wrap;">${body.message}</p>
                            </div>
                        </div>
                    </div>
                `;
                break;

            default:
                throw new Error("Geçersiz e-posta türü belirtildi.");
        }

        // MAİLİ GÖNDERME AYARLARI
        const mailOptions = {
            from: `"Novatrum" <${process.env.SMTP_EMAIL}>`,
            // EĞER İLETİŞİM FORMUYSA: SANA GELSİN. DEĞİLSE MÜŞTERİYE GİTSİN.
            to: type === 'contact' ? process.env.SMTP_EMAIL : email, 
            subject: finalSubject,
            html: finalHtml,
            // İletişim formunda müşterinin mailini Reply-To'ya ekleyelim ki "Yanıtla" deyince direkt ona gitsin.
            replyTo: type === 'contact' ? email : undefined 
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Backend Mail Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}