'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  Shield, 
  ArrowLeft,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Key
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/components/Button'
import { CreateUserForm } from '@/modules/users/components/CreateUserForm'

export default function PersonalPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('todos')
  const [view, setView] = useState<'list' | 'form'>('list')
  const supabase = createClient()

  const fetchUsers = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('usuarios')
      .select('*, roles!inner(nombre)')
      .order('nombres', { ascending: true })

    if (!error && data) {
      setUsers(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [supabase])

  const filteredData = users.filter(usr => {
    const matchesSearch = usr.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        usr.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'todos' || usr.roles?.nombre === selectedRole
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const styles: any = {
       admin: 'bg-indigo-50 text-indigo-600 border-indigo-100',
       supervisor: 'bg-blue-50 text-blue-600 border-blue-100',
       contraloria: 'bg-rose-50 text-rose-600 border-rose-100',
       fiscalizador: 'bg-emerald-50 text-emerald-600 border-emerald-100'
    }
    return styles[role.toLowerCase()] || 'bg-slate-50 text-slate-600'
  }

  return (
    <div className="space-y-12 animate-in fade-in transition-all">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
           <div className="flex items-center gap-2 text-indigo-600 mb-4 group cursor-pointer" onClick={() => window.history.back()}>
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Volver</span>
           </div>
           <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Gestión de Personal</h1>
           <p className="text-slate-400 font-medium text-sm mt-1">Administra el equipo y sus niveles de acceso dentro del sistema.</p>
        </div>
        
        {view === 'list' ? (
          <Button 
            onClick={() => setView('form')}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 h-14 px-8 rounded-2xl"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invitar integrante
          </Button>
        ) : (
          <Button 
            onClick={() => setView('list')}
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xl shadow-slate-100 h-14 px-8 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Button>
        )}
      </div>

      {view === 'form' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <CreateUserForm onUserCreated={() => {
            fetchUsers()
            setView('list')
          }} />
        </div>
      ) : (
        <>
          {/* Control Bar */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
         <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              type="text" 
              placeholder="Escribe un nombre o correo..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {['todos', 'administrador', 'supervisor', 'fiscalizador', 'contraloria'].map(r => (
               <button 
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRole === r ? 'bg-[#0f172a] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
               >
                 {r === 'administrador' ? 'ADMIN' : r}
               </button>
            ))}
         </div>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map(n => <div key={n} className="h-80 bg-white rounded-[3rem] animate-pulse border border-slate-100"></div>)
          ) : filteredData.length > 0 ? (
            filteredData.map((u) => {
              const userInitials = u.nombres?.trim().split(' ')[0].substring(0, 2).toUpperCase() || 'OP'
              return (
                <div key={u.id} className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <button className="text-slate-200 hover:text-indigo-600 transition-colors"><MoreVertical className="w-5 h-5" /></button>
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-lg group-hover:scale-110 transition-transform">
                      {userInitials}
                    </div>
                    <div>
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border inline-block ${getRoleBadge(u.roles?.nombre)}`}>
                        {u.roles?.nombre}
                      </div>
                      <h3 className="text-xl font-black text-[#0f172a] mt-2 truncate">{u.nombres}</h3>
                    </div>
                  </div>

                  <div className="space-y-4 mb-10 pt-4 border-t border-slate-50">
                    <div className="flex items-center text-xs font-bold text-slate-500">
                      <Mail className="w-4 h-4 mr-3 text-slate-200" /> {u.email}
                    </div>
                    <div className="flex items-center text-xs font-bold text-slate-500">
                      <Phone className="w-4 h-4 mr-3 text-slate-200" /> {u.telefono || 'Sin registro'}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="flex-1 py-4 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <Shield className="w-3 h-3" /> Bitácora
                    </button>
                    <button className="px-5 py-4 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl transition-all">
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-slate-100">
              <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No se encontraron integrantes</p>
            </div>
          )}
        </div>
        </>
      )}

    </div>
  )
}
