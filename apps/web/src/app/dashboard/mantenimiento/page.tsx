'use client'

import { useState, useEffect } from 'react'
import { PersonnelDashboard } from '@/modules/users/components/PersonnelDashboard'
import { CreateUserForm } from '@/modules/users/components/CreateUserForm'
import { Users2, ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { createClient } from '@/lib/supabase/client'

export default function MantenimientoPage() {
  const [view, setView] = useState<'loading' | 'dashboard' | 'form'>('loading')
  const [userCount, setUserCount] = useState(0)

  const checkUsers = async () => {
    setView('loading')
    try {
      const supabase = createClient()
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      const response = await fetch('/api/users')
      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        // Filtramos para excluir al administrador activo actual
        const externalUsers = result.data.filter((u: any) => u.id !== currentUser?.id)
        const count = externalUsers.length
        
        setUserCount(count)
        setView(count === 0 ? 'form' : 'dashboard')
      } else {
        setView('form')
      }
    } catch {
      // Si falla (API apagada), mostramos el formulario directamente
      setView('form')
    }
  }

  useEffect(() => {
    checkUsers()
  }, [])

  if (view === 'loading') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center">
               <Users2 className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Mantenimiento de Personal</h1>
          </div>
          <p className="text-slate-500 text-sm max-w-xl">
            {view === 'form' 
              ? 'Registra el primer integrante de tu equipo de trabajo.' 
              : 'Gestión administrativa de roles y permisos del equipo Ambiensa.'}
          </p>
        </div>

        {view === 'form' && userCount > 0 && (
          <Button 
            variant="outline" 
            onClick={() => setView('dashboard')}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Tablero
          </Button>
        )}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {view === 'form' ? (
          <CreateUserForm onUserCreated={() => checkUsers()} />
        ) : (
          <PersonnelDashboard onAddNew={() => setView('form')} />
        )}
      </div>
    </div>
  )
}
