import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isOperaciones = request.nextUrl.pathname.startsWith('/operaciones')
  const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(request.nextUrl.pathname)

  // Sin sesión intentando entrar a ruta protegida → al login
  if (!user && (isDashboard || isOperaciones)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Con sesión intentando ver rutas de Auth (login) → redirigir según su rol
  if (user && isAuthRoute) {
    const role = user.user_metadata?.role as string | undefined
    const operarios = ['fiscalizador', 'supervisor', 'contraloria']
    
    if (role && operarios.includes(role.toLowerCase())) {
      return NextResponse.redirect(new URL('/operaciones', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Con sesión en dashboard pero NO es admin → Acceso Denegado
  if (user && isDashboard) {
    const role = user.user_metadata?.role as string | undefined
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/acceso-denegado', request.url))
    }
  }

  return supabaseResponse
}
