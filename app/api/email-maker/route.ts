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
      // Varsayılan gönderici ismini 'Novatrum Engineering' olarak sabitledik
      from: `${senderName || 'Novatrum Engineering'} <${from || 'yasin@novatrum.eu'}>`,
      to: to,
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; color: #18181b; margin: 0 auto;">
          
          <div style="padding: 40px 0; border-bottom: 1px solid #e4e4e7; text-align: center;">
            <div style="display: inline-block; vertical-align: middle;">
              <img 
                src="https://novatrum.eu/logo.png" 
                alt="N." 
                height="36" 
                style="height: 36px; vertical-align: middle; display: inline-block; -webkit-user-drag: none; user-select: none; pointer-events: none; margin-right: 14px;" 
                oncontextmenu="return false;"
              />
              <h1 style="font-size: 26px; letter-spacing: -0.05em; margin: 0; font-weight: 600; color: #000; line-height: 36px; display: inline-block; vertical-align: middle;">NOVATRUM</h1>
            </div>
          </div>
          
          <div style="padding: 40px 0; line-height: 1.7; font-size: 15px;">
            ${content.replace(/\n/g, '<br>')}
            <p style="margin-top: 40px; font-style: italic; color: #71717a;">
              ${signature.replace(/\n/g, '<br>')}
            </p>
          </div>
          
          <div style="padding: 24px; background-color: #fafafa; border-radius: 12px; font-size: 12px; color: #71717a; border: 1px solid #f4f4f5;">
            <p style="margin: 0; font-weight: 700; color: #18181b; letter-spacing: 0.05em;">NOVATRUM ENGINEERING</p>
            <p style="margin: 6px 0;">Scalable Web Infrastructure & Systems Architecture</p>
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
      cc: cc && cc.length > 0 ? cc : null,
      bcc: bcc && bcc.length > 0 ? bcc : null,
      subject: subject,
      content: content,
      signature: signature
    }]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}