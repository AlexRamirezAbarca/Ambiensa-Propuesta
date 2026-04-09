'use client'

import { ReactNode, useState } from 'react'
import { LayoutDashboard, Users, HardHat, FileSpreadsheet, LogOut, ClipboardList, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  name: string
  href: string
  icon: any
  roles?: string[]
}

const navItems: NavItem[] = [
  { name: 'Panel de Control', href: '/operaciones', icon: LayoutDashboard },
  { name: 'Gestión de Personal', href: '/operaciones/fiscalizadores', icon: Users, roles: ['supervisor', 'administrador'] },
  { name: 'Gestión de Proyectos', href: '/operaciones/proyectos', icon: HardHat, roles: ['fiscalizador', 'contraloria'] }
]

export function SupervisorLayout({ children, fullName, role }: { children: ReactNode, fullName: string, role: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [showLogout, setShowLogout] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const filteredNav = navItems.filter(item => !item.roles || item.roles.includes(role))

  // Limpiar nombre: Alex Ramirez Abarca (A...) -> Alex Ramirez Abarca
  const cleanName = fullName?.split('(')[0].trim() || 'Operador'
  
  // Iniciales: primeras 2 letras del primer nombre
  const initials = cleanName.split(' ')[0].substring(0, 2).toUpperCase()

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-900 font-sans">

      {/* SIDEBAR SUPERVISOR */}
      <aside className="w-72 bg-white border-r border-slate-200 shadow-sm z-10 flex flex-col hidden lg:flex">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl shadow-inner shadow-white/20 mr-3 flex items-center justify-center">
            <FileSpreadsheet className="text-white w-5 h-5" />
          </div>
          <span className="font-extrabold text-[#0f172a] tracking-tight text-lg">Centro de Mando</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/operaciones' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
              >
                <item.icon className={`mr-3 h-[22px] w-[22px] flex-shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* PERFIL Y LOGOUT AL PIE */}
        <div className="p-4 border-t border-slate-100 relative">
          <AnimatePresence>
            {showLogout && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-4 right-4 mb-2"
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-4 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl shadow-lg border border-red-100 transition-all"
                >
                  <LogOut className="mr-3 h-5 w-5" /> Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowLogout(!showLogout)}
            className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${showLogout ? 'bg-slate-50 border-slate-200 shadow-inner' : 'hover:bg-slate-50'}`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 text-left flex-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{role}</p>
              <p className="text-sm font-black text-slate-800 truncate mt-1">{cleanName}</p>
            </div>
            <ChevronUp className={`w-4 h-4 text-slate-300 transition-transform ${showLogout ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 overflow-y-auto w-full relative scroll-smooth bg-[#f8fafc]">
        <div className="p-6 md:p-8 lg:p-12 max-w-[1400px] mx-auto pb-24 h-full">
          {children}
        </div>
      </main>

    </div>
  )
}
