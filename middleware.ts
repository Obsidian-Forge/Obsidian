import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // --- 1. WEBHOOK İSTİSNASI (BYPASS) ---
  // Resend'den gelen sinyallerin (teslim edildi, açıldı vb.) giriş yapmadan (anonim) 
  // API'ye ulaşabilmesi için onları güvenlik duvarından doğrudan geçiriyoruz.
  if (request.nextUrl.pathname.startsWith('/api/webhooks')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const clientKey = request.cookies.get('novatrum_client_key')?.value

  // --- ROOT (ANA DİZİN) YÖNLENDİRMESİ ---
  if (request.nextUrl.pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // --- ADMIN KORUMASI ---
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('id', user.id)
      .single()

    if (member?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // --- CLIENT KORUMASI ---
  if (request.nextUrl.pathname.startsWith('/client/dashboard')) {
    if (!clientKey) {
      return NextResponse.redirect(new URL('/client/login', request.url))
    }
  }

  return response
}

export const config = {
  // Matcher'a api/webhooks yolunu da ekledik ki middleware bu yolda da çalışıp istisna kuralını (en üstteki bypass) işletebilsin.
  matcher: ['/admin/:path*', '/client/dashboard/:path*', '/api/webhooks/:path*'],
}