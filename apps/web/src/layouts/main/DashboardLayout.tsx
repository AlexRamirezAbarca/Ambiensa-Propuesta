import { ReactNode } from 'react'
import { Home, Users, Settings } from 'lucide-react'
import Link from 'next/link'
import { LogoutButton } from '@/shared/components/LogoutButton'

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

const navItems: NavItem[] = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Inquilinos', href: '#inquilinos', icon: Users },
  { name: 'Configuración', href: '#settings', icon: Settings },
]

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-[var(--surface)] overflow-hidden text-[length:var(--foreground)]">
      
      {/* SIDEBAR PARA ESCRITORIO (WEB) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[var(--surface-border)] shadow-sm z-10 transition-all">
        <div className="h-16 flex items-center px-6 border-b border-[var(--surface-border)]">
          <span className="font-bold text-xl text-[var(--primary-600)] fade-in">Ambiensa</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-slate-700 hover:bg-[var(--primary-50)] hover:text-[var(--primary-600)] transition-colors"
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--surface-border)]">
          <LogoutButton />
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 overflow-y-auto w-full md:pb-0 pb-16">
        {/* Cabecera Móvil rápida */}
        <header className="md:hidden h-14 bg-white border-b flex items-center justify-center sticky top-0 z-20">
            <span className="font-bold text-lg text-[var(--primary-600)]">Ambiensa</span>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* BOTTOM NAVIGATION PARA PWA (MOVIL) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[var(--surface-border)] z-20 pb-safe shadow-lg">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-[var(--primary-600)] active:bg-slate-50 transition-colors"
            >
              <item.icon className="h-6 w-6 mb-1" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
