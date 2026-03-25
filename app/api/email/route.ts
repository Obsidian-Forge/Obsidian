import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Gelen temel verileri alıyoruz
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
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
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

            // DÜZELTİLEN YER: YENİ CALCULATOR MANTIĞI
            case 'calculator':
                finalSubject = 'Novatrum - Your Quick Project Estimate';
                const { minPrice, maxPrice, projectType } = body;
                
                finalHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
                        <h1 style="color: #000; text-transform: uppercase; font-weight: 900; letter-spacing: -1px;">Novatrum Studio</h1>
                        <p style="color: #52525b; font-size: 14px;">Hello,</p>
                        <p style="color: #52525b; font-size: 14px;">Thank you for using the Novatrum Quick Estimate tool. Based on your selection for a <strong>${projectType || 'Custom Architecture'}</strong>, here is your ballpark figure:</p>
                        
                        <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                            <p style="margin: 0 0 5px 0; font-size: 10px; color: #a1a1aa; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Estimated Range</p>
                            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #000; font-family: monospace;">
                                $${minPrice?.toLocaleString() || '0'} - $${maxPrice?.toLocaleString() || '0'}
                            </p>
                        </div>
                        
                        <p style="color: #71717a; font-size: 12px; line-height: 1.5;">Please note: This is a rough calculation based on standard parameters. It is not a definitive quote.</p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e4e4e7;">
                            <p style="color: #000; font-size: 14px; font-weight: bold;">Ready for an exact, contract-ready price?</p>
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://novatrum.eu'}/gateway" style="display: inline-block; background-color: #10b981; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; margin-top: 10px;">Start Full Project Discovery</a>
                        </div>
                    </div>
                `;
                break;

            case 'contact':
                finalSubject = `New Inquiry from ${clientName}`;
                finalHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
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

            case 'discovery_notification':
                finalSubject = `NEW PROJECT: ${body.discoveryNumber} - ${clientName}`;
                finalHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
                        <h1 style="color: #000;">New Discovery Blueprint Received</h1>
                        <p><strong>Entity:</strong> ${clientName} (<a href="mailto:${body.clientEmail}">${body.clientEmail}</a>)</p>
                        <p><strong>Architecture:</strong> ${body.projectType}</p>
                        <p><strong>Estimated Price:</strong> $${body.amount?.toLocaleString()}</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 14px; color: #555;">Check the Admin Dashboard for full technical specifications.</p>
                    </div>
                `;
                break;

            case 'invoice':
                finalSubject = `Novatrum - New Proforma Invoice & SOW: ${body.invoiceNumber}`;
                finalHtml = `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 10px;">
                        <h1 style="color: #000; text-transform: uppercase;">Novatrum Studio</h1>
                        <p style="color: #52525b; font-size: 16px;">Hello ${clientName},</p>
                        <p style="color: #52525b; font-size: 16px;">A new proforma invoice / Statement of Work (<strong>${body.invoiceNumber}</strong>) has been securely generated for your project.</p>
                        <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 14px; color: #71717a; text-transform: uppercase; font-weight: bold;">Amount (Excl. VAT)</p>
                            <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #10b981;">${body.currency || '€'}${body.amount?.toLocaleString()}</p>
                        </div>
                        <a href="${body.invoiceLink}" style="display: inline-block; background-color: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; text-transform: uppercase; font-size: 12px; margin-top: 10px;">Download Document</a>
                        <p style="color: #a1a1aa; font-size: 12px; margin-top: 30px;">Thank you for choosing Novatrum.</p>
                    </div>
                `;
                break;

            default:
                throw new Error("Geçersiz e-posta türü belirtildi: " + type);
        }

        // MAİLİ GÖNDERME AYARLARI
        const mailOptions = {
            from: `"Novatrum" <${process.env.SMTP_EMAIL}>`,
            to: type === 'contact' ? process.env.SMTP_EMAIL : email, 
            subject: finalSubject,
            html: finalHtml,
            replyTo: type === 'contact' ? email : undefined 
        };

        await transporter.sendMail(mailOptions);
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Backend Mail Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}