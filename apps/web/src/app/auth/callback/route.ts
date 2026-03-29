import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth/actualizar-clave'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Exchange error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }
  }

  // Si no hay código, es posible que la sesión venga en el Hash (#)
  // Dejamos que la página cliente intente capturarla antes de rendirse.
  return NextResponse.redirect(`${origin}${next}`)
}
