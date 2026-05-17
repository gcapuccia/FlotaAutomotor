import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Al inicio de middleware(), después de obtener el user:
const { data: { session } } = await supabase.auth.getSession()

if (session) {
  const SESSION_DURATION_MS = 4 * 60 * 60 * 1000 // 4 horas
  const loginTime = new Date(session.user.last_sign_in_at!).getTime()
  const now = Date.now()

  if (now - loginTime > SESSION_DURATION_MS) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?expired=true', request.url))
  }
}

  const { pathname } = request.nextUrl

  // Rutas públicas (no requieren auth)
  const publicRoutes = ['/login', '/auth/callback']
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // Si ya está logueado, redirigir al dashboard
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return supabaseResponse
  }

  // Si no está autenticado, redirigir al login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rutas que requieren rol admin
  const adminRoutes = ['/admin', '/api/admin']
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard?error=unauthorized', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
