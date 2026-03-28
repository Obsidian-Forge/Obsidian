import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Sadece admin sayfalarına girmeye çalışanları yakala
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    
    // Supabase'in tarayıcıya bıraktığı yetki çerezini (cookie) ara
    const hasAuthCookie = req.cookies.getAll().some(cookie => 
      cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    );

    // Eğer çerez yoksa, sayfayı hiç yüklemeden anında Login'e fırlat!
    if (!hasAuthCookie) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return NextResponse.next();
}

// Middleware'in hangi sayfalarda tetikleneceğini belirliyoruz
export const config = {
  matcher: ['/admin/:path*'],
}