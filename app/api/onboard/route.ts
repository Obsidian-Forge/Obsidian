import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name, discoveryId } = body;

        if (!email || !discoveryId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Domain adresini otomatik alır. Lokal testlerde http://localhost:3000 kullanır.
        const domain = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const onboardingLink = `${domain}/onboarding?token=${discoveryId}`;

        // Senin .env.local dosyasındaki SMTP (Gmail) ayarlarınla bağlantı kuruyoruz
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Müşteriye gidecek e-posta şablonu
        const mailOptions = {
            from: '"Novatrum Systems" <info@novatrum.eu>',
            replyTo: 'info@novatrum.eu',
            to: email, // Admin Discovery ekranında tıklanılan müşterinin e-postası
            subject: 'Welcome to Novatrum - Initialize Your Client Profile',
            html: `
                <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eaeaea; border-radius: 10px; text-align: center;">
                    <h2 style="text-transform: uppercase; letter-spacing: 1px; color: #000;">Welcome, ${name}</h2>
                    <p style="color: #555; line-height: 1.6; text-align: left;">Your project discovery has been approved. We are ready to begin the integration process.</p>
                    <p style="color: #555; line-height: 1.6; text-align: left;">Please click the secure link below to complete your profile and generate your dedicated Deployment Key.</p>
                    
                    <a href="${onboardingLink}" style="display: inline-block; padding: 16px 32px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 30px; letter-spacing: 2px; text-transform: uppercase; font-size: 12px;">
                        Initialize Profile
                    </a>
                    
                    <p style="color: #999; font-size: 10px; margin-top: 40px; text-transform: uppercase; letter-spacing: 1px;">This is an automated secure message from Novatrum Systems.</p>
                </div>
            `
        };

        // Maili Gönder
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: 'Invite sent successfully' }, { status: 200 });

    } catch (error: any) {
        console.error('Onboard API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}