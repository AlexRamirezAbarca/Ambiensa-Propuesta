'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Briefcase, Building2 } from 'lucide-react'

export function ContratistaDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [assignedTasks, setAssignedTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
        setUserProfile(profile)

        // Usamos UTC para coincidir con la sesión de pruebas actual del usuario
        const today = new Date().toISOString().split('T')[0]

        // 1. Traemos los rubros (tareas) asignados
        const { data: tasks, error: tError } = await supabase
          .from('proyecto_presupuesto')
          .select(`
            *, 
            proyectos(nombre, ubicacion),
            avances_diarios(*)
          `)
          .eq('contratista_id', user.id)
          .order('created_at', { ascending: false })

        if (tError) throw tError
        
        // 2. Procesamos en JS para encontrar el avance de HOY (sin límites de query)
        const tasksWithStatus = tasks?.map(t => {
          const todaysAdvance = t.avances_diarios?.find((a: any) => a.fecha === today)
          return {
            ...t,
            status_hoy: todaysAdvance?.estado || 'pendiente',
            fecha_gestion: todaysAdvance?.fecha || today
          }
        })

        if (tasksWithStatus) setAssignedTasks(tasksWithStatus)
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold tracking-widest text-[10px] uppercase">Sincronizando...</div>

  return (
    <div className="space-y-10 fade-in pb-12 pt-6 px-2">
      
      {/* Cabecera / Saludo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] leading-tight flex flex-col">
            <span className="text-sm font-bold text-slate-400 mb-1">Bienvenido,</span>
            {userProfile?.nombres?.split(' ')[0] || 'Contratista'}
          </h1>
        </div>
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
           <Briefcase className="w-6 h-6" />
        </div>
      </div>

      <div>
         <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">
           Rubros y Tareas Asignadas ({assignedTasks.length})
         </h2>

         <div className="space-y-4">
           {assignedTasks.length === 0 ? (
             <div className="bg-white border border-slate-100 rounded-[2rem] p-10 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4">
                   <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-600">Sin Asignaciones</h3>
                <p className="text-xs text-slate-400 mt-1">Aún no se te han delegado líneas de presupuesto.</p>
             </div>
           ) : (
             assignedTasks.map(task => {
                const isInProgress = task.status_hoy === 'iniciado'
                const isManaged = task.status_hoy === 'finalizado'
                
                return (
                  <div key={task.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                    {isInProgress && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest animate-pulse">
                        Jornada en curso
                      </div>
                    )}
                    {isManaged && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                        Gestionado
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${isInProgress ? 'bg-amber-100 text-amber-600' : isManaged ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-500'} rounded-full flex items-center justify-center transition-colors`}>
                              <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{task.proyectos?.nombre || 'Proyecto N/A'}</div>
                              <h3 className="text-sm font-black text-slate-800 leading-tight mt-0.5">{task.descripcion}</h3>
                              <p className="text-[10px] font-bold text-slate-400 mt-1">Rubro: {task.rubro}</p>
                          </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">A Ejecutar</span>
                          <p className="text-sm font-black text-slate-700">{Number(task.cantidad).toFixed(2)} <span className="text-[10px]">{task.unidad}</span></p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {isManaged ? 'Fecha Gestión' : 'Estado'}
                          </span>
                          <p className={`text-[11px] font-black uppercase tracking-tighter ${isInProgress ? 'text-amber-600' : isManaged ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {isInProgress ? 'En Proceso' : isManaged ? task.fecha_gestion : 'Pendiente'}
                          </p>
                        </div>
                    </div>
                  </div>
                )
             })
           )}
         </div>
      </div>

    </div>
  )
}
