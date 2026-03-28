'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh() // Refresca el router para limpiar estados del server y redirige via layout
  }

  return (
    <button 
      onClick={handleLogout}
      className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
    >
      <LogOut className="mr-3 h-5 w-5" />
      Cerrar Sesión
    </button>
  )
}
