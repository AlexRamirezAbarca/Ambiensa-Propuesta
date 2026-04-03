'use client'

import { ReactNode } from 'react'
import { LayoutDashboard, Users, HardHat, FileSpreadsheet, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { name: 'Panel de Control', href: '/operaciones', icon: LayoutDashboard },
  { name: 'Fiscalizadores', href: '/operaciones/fiscalizadores', icon: Users },
  { name: 'Gestión de Proyectos', href: '/operaciones/proyectos', icon: HardHat },
]

export function SupervisorLayout({ children, fullName }: { children: ReactNode, fullName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-900 font-sans">
      
      {/* SIDEBAR PARA SUPERVISOR (Escritorio Web) */}
      <aside className="w-72 bg-white border-r border-slate-200 shadow-sm z-10 flex flex-col hidden lg:flex">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
           <div className="w-9 h-9 bg-blue-600 rounded-xl shadow-inner shadow-white/20 mr-3 flex items-center justify-center">
             <FileSpreadsheet className="text-white w-5 h-5"/>
           </div>
           <span className="font-extrabold text-[#0f172a] tracking-tight text-lg">Centro de Mando</span>
        </div>
        
        <div className="px-8 py-6 border-b border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Supervisor de Intervención</p>
          <p className="text-base font-extrabold text-slate-800 truncate mt-1">{fullName}</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`group flex items-center px-4 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  isActive 
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

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3.5 text-sm font-bold text-red-600 bg-red-50/50 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" /> Finalizar Turno
          </button>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 overflow-y-auto w-full relative scroll-smooth">
        <div className="p-6 md:p-8 lg:p-12 max-w-[1400px] mx-auto pb-24 h-full">
          {children}
        </div>
      </main>

    </div>
  )
}
