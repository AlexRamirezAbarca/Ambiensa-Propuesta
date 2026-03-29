'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users2, 
  MoreHorizontal, 
  Shield, 
  UserX, 
  UserCheck, 
  Settings2,
  Eye,
  Edit3,
  Lock,
  Unlock,
  Plus
} from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { createClient } from '@/lib/supabase/client'

interface Permisos {
  visualizacion: boolean
  lectura: boolean
  escritura: boolean
}

const DEFAULT_PERMISOS: Permisos = { visualizacion: true, lectura: true, escritura: true }

interface User {
  id: string
  nombres: string
  email: string
  cedula: string
  estado: boolean
  roles: { nombre: string } | null
  permisos: Permisos | null
}

interface PersonnelDashboardProps {
  onAddNew?: () => void
}

export function PersonnelDashboard({ onAddNew }: PersonnelDashboardProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchUsers = async () => {
    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      const response = await fetch('/api/users')
      const result = await response.json()
      if (result.success && Array.isArray(result.data)) {
        const externalUsers = result.data.filter((u: any) => u.id !== currentUser?.id)
        setUsers(externalUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: !user.estado })
      })
      if (response.ok) fetchUsers()
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const updatePermissions = async (user: User, field: string) => {
    setIsUpdating(true)
    const current = user.permisos ?? DEFAULT_PERMISOS
    const newPerms = { ...current, [field]: !current[field as keyof Permisos] }
    try {
      const response = await fetch(`/api/users/${user.id}/permissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPerms)
      })
      if (response.ok) fetchUsers()
    } catch (error) {
      console.error('Error updating permissions:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del Tablero */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
            <Users2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Equipo Registrado</h2>
            <p className="text-sm text-slate-500">{users.length} Colaboradores en total</p>
          </div>
        </div>
        <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700 py-2.5 px-5 shadow-lg shadow-blue-500/20">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Miembro
        </Button>
      </div>

      {/* Tabla de Personal */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Estado</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Colaborador</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rol</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Permisos de Acceso</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.estado ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700 text-sm leading-tight">{user.nombres}</span>
                    <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-600 uppercase bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {user.roles?.nombre ?? 'Sin rol'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {(() => {
                    const p = user.permisos ?? DEFAULT_PERMISOS
                    return (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => updatePermissions(user, 'visualizacion')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all border ${p.visualizacion ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-300 hover:border-blue-400'}`}
                          title="Visualización"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updatePermissions(user, 'lectura')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all border ${p.lectura ? 'bg-violet-600 border-violet-600 text-white' : 'bg-white border-slate-200 text-slate-300 hover:border-violet-400'}`}
                          title="Lectura"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updatePermissions(user, 'escritura')}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-all border ${p.escritura ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-300 hover:border-emerald-400'}`}
                          title="Escritura"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => toggleStatus(user)}
                      className={`p-2.5 rounded-xl transition-all shadow-sm border ${user.estado ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 border-green-100 text-green-500 hover:bg-green-500 hover:text-white'}`}
                      title={user.estado ? 'Desactivar Usuario' : 'Activar Usuario'}
                    >
                      {user.estado ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-12 text-center text-slate-400 font-medium">
            No se encontraron miembros registrados.
          </div>
        )}
      </div>

      {/* Footer del Dash con leyenda de permisos */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/50 flex flex-wrap gap-8 items-center justify-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <span className="flex items-center gap-2 text-blue-600"><div className="w-2 h-2 rounded-full bg-blue-600" /> Visualización</span>
        <span className="flex items-center gap-2 text-violet-600"><div className="w-2 h-2 rounded-full bg-violet-600" /> Lectura</span>
        <span className="flex items-center gap-2 text-emerald-600"><div className="w-2 h-2 rounded-full bg-emerald-600" /> Escritura</span>
      </div>
    </div>
  )
}
