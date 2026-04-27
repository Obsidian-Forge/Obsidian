import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { senderName, from, to, cc, bcc, subject, content, signature, attachments } = body;

    const resendAttachments = attachments?.map((file: any) => ({
        filename: file.name,
        path: file.url
    })) || [];

    const mailOptions: any = {
      from: `${senderName || 'Yasin Can Koç | Novatrum'} <${from || 'yasin@novatrum.eu'}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #18181b; margin: 0 auto;">
          
          <div style="padding: 40px 0; border-bottom: 1px solid #e4e4e7; text-align: center;">
            <div style="display: inline-block; vertical-align: middle;">
              <img 
                src="https://novatrum.eu/logo.png" 
                alt="Novatrum Logo" 
                style="height: 36px; display: block;"
              />
            </div>
            <div style="display: inline-block; vertical-align: middle; margin-left: 16px;">
              <h1 style="font-size: 24px; letter-spacing: -0.05em; margin: 0; font-weight: 600; color: #000;">NOVATRUM</h1>
            </div>
          </div>

          <div style="padding: 40px 0; line-height: 1.7; font-size: 15px; white-space: pre-wrap;">${content}</div>

          <div style="padding-bottom: 40px;">
            <p style="margin: 0; color: #52525b; font-style: italic; white-space: pre-wrap;">${signature}</p>
          </div>

          <div style="padding: 30px; background-color: #fafafa; border-radius: 12px; border: 1px solid #f4f4f5; text-align: left;">
            <p style="margin: 0; font-weight: 700; letter-spacing: 0.05em; font-size: 12px;">NOVATRUM CORE</p>
            <p style="color: #a1a1aa; font-size: 11px; margin: 6px 0;">Scalable Infrastructure & Bespoke Engineering</p>
            <p style="margin: 14px 0 0 0; display: flex; align-items: center;">
              <a href="https://novatrum.eu" style="color: #000; text-decoration: none; border-bottom: 1px solid #e4e4e7; padding-bottom: 2px;">novatrum.eu</a>
              <span style="color: #d4d4d8; margin: 0 8px;">|</span>
              <a href="https://www.linkedin.com/company/novatrum/" style="color: #000; text-decoration: none; border-bottom: 1px solid #e4e4e7; padding-bottom: 2px;">LinkedIn</a>
            </p>
          </div>

        </div>
      `
    };

    if (cc && cc.length > 0) mailOptions.cc = cc;
    if (bcc && bcc.length > 0) mailOptions.bcc = bcc;
    if (resendAttachments.length > 0) mailOptions.attachments = resendAttachments;

    const { data, error } = await resend.emails.send(mailOptions);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from('sent_emails').insert([{
      from_email: `${senderName || 'Novatrum Engineering'} <${from || 'yasin@novatrum.eu'}>`,
      to_emails: to,
      cc: cc,
      bcc: bcc,
      subject: subject,
      content: content,
      signature: signature
    }]);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}