'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users2, Menu, X } from 'lucide-react'
import { AdminAvatar } from '@/shared/components/AdminAvatar'

const navItems = [
  {
    label: 'Inicio',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Resumen y métricas'
  },
  {
    label: 'Personal',
    href: '/dashboard/mantenimiento',
    icon: Users2,
    description: 'Gestión de equipo'
  },
]

interface DashboardSidebarProps {
  fullName: string
  email: string
}

export function DashboardSidebar({ fullName, email }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
          <span className="text-white font-black text-xs">A</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">Ambiensa</p>
          <p className="text-blue-400/70 text-[10px] font-medium tracking-wider uppercase mt-0.5">ERP Admin</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5 mb-4" />

      {/* Navegación */}
      <nav className="flex-1 px-3 space-y-1">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">Módulos</p>
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative
                ${active
                  ? 'bg-blue-600/20 border border-blue-500/20'
                  : 'hover:bg-white/5 border border-transparent'
                }
              `}
            >
              {/* Indicador activo */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-full" />
              )}
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                ${active
                  ? 'bg-blue-500/30 text-blue-300 shadow-inner'
                  : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-slate-200'
                }
              `}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-sm font-semibold leading-none mb-0.5 ${active ? 'text-blue-200' : 'text-slate-300 group-hover:text-white'}`}>
                  {item.label}
                </p>
                <p className="text-[10px] text-slate-500">{item.description}</p>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/5 mb-3" />

      {/* Avatar y Perfil */}
      <div className="px-3 pb-4">
        <AdminAvatar fullName={fullName} email={email} />
      </div>
    </div>
  )

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-white/5 flex-shrink-0 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* BOTÓN HAMBURGUESA MOBILE */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 right-4 z-30 w-9 h-9 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* OVERLAY MOBILE */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR DRAWER MOBILE */}
      <aside className={`
        lg:hidden fixed top-0 left-0 h-full w-72 bg-slate-900 border-r border-white/5 z-50
        transform transition-transform duration-300 ease-in-out shadow-2xl
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>
        <SidebarContent />
      </aside>
    </>
  )
}
