import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  if (request.nextUrl.pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    const { data: member } = await supabase.from('members').select('role').eq('id', user.id).single()

    if (member?.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/client/dashboard')) {
    if (!clientKey) {
      return NextResponse.redirect(new URL('/client/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/client/dashboard/:path*'],
}