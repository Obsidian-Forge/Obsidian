import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, code, clientName, loginLink } = body;

        // Gmail SMTP ayarları
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,     // Senin Gmail adresin
                pass: process.env.SMTP_PASSWORD,  // Gmail Uygulama Şifresi (Normal şifre değil)
            },
        });

        // Gönderilecek E-postanın İçeriği ve Tasarımı
        const mailOptions = {
            from: `"Novatrum OS" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: 'Novatrum OS - Secure Access Key',
            html: `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
                    <h2 style="text-transform: uppercase; font-weight: 900; letter-spacing: -1px;">Welcome to Novatrum OS</h2>
                    <p style="color: #52525b; font-size: 14px;">Hello <strong>${clientName}</strong>,</p>
                    <p style="color: #52525b; font-size: 14px;">Your secure entity has been registered. You can access the client portal using the credentials below:</p>
                    
                    <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #a1a1aa; margin: 0 0 5px 0;">Access Code</p>
                        <p style="font-size: 20px; font-weight: bold; font-family: monospace; margin: 0; color: #000;">${code}</p>
                    </div>

                    <a href="${loginLink}" style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Access Portal</a>
                    
                    <p style="font-size: 10px; color: #a1a1aa; margin-top: 30px; text-transform: uppercase; letter-spacing: 1px;">This is an automated message from Novatrum Infrastructure.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Backend Mail Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}