'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminAvatarProps {
  fullName?: string
  email?: string
}

export function AdminAvatar({ fullName = 'Admin', email = '' }: AdminAvatarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Obtener iniciales del nombre
  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Cerrar menú si hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-all group"
      >
        {/* Avatar con Iniciales */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-900/40">
          {initials}
        </div>
        <div className="flex-1 text-left overflow-hidden min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-none mb-0.5">{fullName}</p>
          <p className="text-[11px] text-slate-400 truncate">{email}</p>
        </div>
        <ChevronUp
          className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${open ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {/* Menú desplegable hacia arriba */}
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-xs text-slate-400 font-medium">Perfil de Administrador</p>
            <p className="text-sm text-white font-semibold mt-0.5">{email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}
