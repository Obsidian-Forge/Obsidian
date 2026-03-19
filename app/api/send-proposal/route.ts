import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const data = {
      service_id: 'service_lzn6bze',
      template_id: 'template_f33ua3k',
      user_id: 'rsgJ9I_OVOHvHyewq', // Public Key
      accessToken: 'NboZRjjyZ8B5_NX11lXnL', // <--- YENİ EKLENEN KISIM (Private Key)
      template_params: body
    };

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      // Eğer hala hata verirse terminalde tam olarak neye kızdığını görebilmek için log ekledik
      const errorText = await response.text();
      console.error("EmailJS Detaylı Hata:", errorText); 
      return NextResponse.json({ success: false, error: errorText }, { status: response.status });
    }
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}