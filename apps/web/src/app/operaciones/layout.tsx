import { ReactNode } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { MobileLayout } from '@/layouts/operaciones/MobileLayout'

async function getUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export default async function OperacionesLayout({ children }: { children: ReactNode }) {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  const role = user.user_metadata?.role as string
  const validRoles = ['fiscalizador', 'supervisor', 'contraloria']

  // Protección de la ruta para roles de campo
  if (!role || !validRoles.includes(role.toLowerCase())) {
    redirect('/acceso-denegado')
  }

  const fullName = user.user_metadata?.full_name ?? 'Operador'

  return (
    <MobileLayout fullName={fullName} role={role}>
      {children}
    </MobileLayout>
  )
}
