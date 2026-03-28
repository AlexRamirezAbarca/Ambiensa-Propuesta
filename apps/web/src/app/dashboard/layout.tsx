import { ReactNode } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DashboardSidebar } from '@/layouts/main/DashboardSidebar'

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

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUser()
  const fullName = user?.user_metadata?.full_name ?? 'Administrador'
  const email = user?.email ?? ''

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      <DashboardSidebar fullName={fullName} email={email} />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar solo Móvil */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <span className="font-bold text-blue-600 text-lg">Ambiensa ERP</span>
        </header>

        <div className="p-5 sm:p-7 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
