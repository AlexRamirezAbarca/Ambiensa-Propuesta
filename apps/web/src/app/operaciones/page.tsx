import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { FiscalizadorDashboard } from '@/modules/operaciones/components/FiscalizadorDashboard'
import { SupervisorDashboard } from '@/modules/supervisor/components/SupervisorDashboard'

export const metadata = {
  title: 'Operaciones | Ambiensa ERP',
  description: 'Panel y Centro de Mando',
}

async function getUserRole() {
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
  return user?.user_metadata?.role as string | null
}

export default async function OperacionesDashboardPage() {
  const role = await getUserRole()
  
  const isSupervisor = role?.toLowerCase() === 'supervisor' || role?.toLowerCase() === 'contraloria'

  // Si es supervisor, mostramos la vista ancha del Centro de Mando
  if (isSupervisor) {
    return <SupervisorDashboard />
  }

  // Si no, mostramos la vista compacta para celular del Fiscalizador
  return <FiscalizadorDashboard />
}
