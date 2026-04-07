'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Briefcase, Building2, ChevronRight } from 'lucide-react'
import { PlanillaDiariaModal } from './PlanillaDiariaModal'

export function ContratistaDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [assignedTasks, setAssignedTasks] = useState<any[]>([])
  const [activeTask, setActiveTask] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
        setUserProfile(profile)

        // Traemos los rubros (tareas) que se asignaron a este contratista
        const { data: tasks, error } = await supabase
          .from('proyecto_presupuesto')
          .select('*, proyectos(nombre, ubicacion)')
          .eq('contratista_id', user.id)
          .order('created_at', { ascending: false })

        if (error) console.error('Error fetching assigned tasks:', error)
        if (tasks) setAssignedTasks(tasks)
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold">Iniciando área de trabajo...</div>

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
             assignedTasks.map(task => (
               <div key={task.id} onClick={() => setActiveTask(task)} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] active:scale-[0.98] transition-transform cursor-pointer group">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                           <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                           <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{task.proyectos?.nombre || 'Proyecto N/A'}</div>
                           <h3 className="text-sm font-black text-slate-800 leading-tight mt-0.5">{task.rubro}</h3>
                        </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div>
                       <span className="text-[10px] font-bold text-slate-400 uppercase">A Ejecutar</span>
                       <p className="text-sm font-black text-slate-700">{Number(task.cantidad).toFixed(2)} <span className="text-[10px]">{task.unidad}</span></p>
                     </div>
                     <div className="text-right">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Tiempo Máximo</span>
                       <p className="text-sm font-black text-slate-700">{task.tiempo_dias} Días</p>
                     </div>
                  </div>
               </div>
             ))
           )}
         </div>
      </div>

      <PlanillaDiariaModal 
        isOpen={!!activeTask} 
        onClose={() => setActiveTask(null)} 
        task={activeTask} 
        userProfile={userProfile} 
      />
    </div>
  )
}
