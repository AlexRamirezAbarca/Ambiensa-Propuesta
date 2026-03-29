import { ReactNode } from 'react'
import Link from 'next/link'
import { Home, ClipboardList, User } from 'lucide-react'

// Menú inferior para la App móvil (PWA) de campo
const navItems = [
  { name: 'Inicio', href: '/operaciones', icon: Home },
  { name: 'Tareas', href: '/operaciones/tareas', icon: ClipboardList },
  { name: 'Perfil', href: '/operaciones/perfil', icon: User },
]

interface MobileLayoutProps {
  children: ReactNode
  fullName: string
  role: string
}

export function MobileLayout({ children, fullName, role }: MobileLayoutProps) {
  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 overscroll-none no-select">
      
      {/* TOP APP BAR (Fijo, minimalista y limpio) */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-5 pt-safe h-16 bg-white border-b border-slate-200/60 shadow-sm">
        <div className="flex flex-col justify-center">
          <span className="font-extrabold text-[#2563eb] text-lg tracking-tight leading-none mb-1">Ambiensa Op</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{role}</span>
        </div>
        
        {/* Avatar pequeño de estado o Notificaciones (Placeholder) */}
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs uppercase shadow-sm">
          {fullName.substring(0, 2)}
        </div>
      </header>

      {/* ÁREA DE CONTENIDO (Scrollable sin overscroll-bounce si el navegador lo soporta) */}
      <main className="flex-1 overflow-y-auto w-full pb-20 pt-4 px-4 sm:px-6">
        <div className="max-w-md mx-auto h-full">
          {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION BAR (PWA) */}
      <nav className="fixed bottom-0 w-full z-30 pb-safe bg-white border-t border-slate-200/80 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="group flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-blue-600 active:bg-slate-50/50 transition-colors"
            >
              <div className="relative mb-1">
                <item.icon className="h-6 w-6 transition-transform group-active:scale-90" strokeWidth={2.5} />
                {/* Indicador visual activo (Lógica a mejorar con usePathname) */}
              </div>
              <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

    </div>
  )
}
