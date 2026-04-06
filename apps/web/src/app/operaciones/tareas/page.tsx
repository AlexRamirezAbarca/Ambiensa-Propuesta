'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ClipboardList, 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  Clock,
  ArrowRightCircle
} from 'lucide-react'

export default function OperacionesTareasPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchTasksWithStatus = async () => {
      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Obtener lotes asignados
        const { data: lots } = await supabase
          .from('lotes_unidades')
          .select('*, proyectos(nombre)')
          .eq('id_fiscalizador', user.id)

        // 2. Obtener avances de hoy
        const today = new Date().toISOString().split('T')[0]
        const { data: todayProgress } = await supabase
          .from('avances_diarios')
          .select('*')
          .eq('fiscalizador_id', user.id)
          .eq('fecha', today)

        if (lots) {
          const mergedTasks = lots.map(lot => {
            const progress = todayProgress?.find(p => p.lote_id === lot.id)
            return {
              ...lot,
              status_hoy: progress?.estado || 'pendiente', // 'pendiente', 'iniciado', 'finalizado'
              progress_id: progress?.id
            }
          })
          setTasks(mergedTasks)
        }
      } catch (err) {
        console.error('Error fetching tasks:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasksWithStatus()
  }, [supabase])

  if (isLoading) return <div className="p-20 text-center animate-pulse font-bold text-slate-400">CARGANDO TAREAS...</div>

  return (
    <div className="space-y-6 fade-in pb-20 pt-4">
      <div className="px-2">
        <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">Mis Tareas</h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de Obra Diaria</p>
      </div>

      <div className="space-y-4">
        {tasks.length > 0 ? tasks.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative overflow-hidden group"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center group-hover:bg-indigo-50 transition-colors">
                   <span className="text-[9px] font-black text-slate-400 leading-none">MZ</span>
                   <span className="text-base font-black text-indigo-700 leading-none">{task.mz}</span>
                </div>
                <div>
                   <h3 className="text-lg font-black text-slate-800">Villa {task.villa}</h3>
                   <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Building2 className="w-3 h-3" /> {task.proyectos?.nombre}
                   </div>
                </div>
              </div>

              {task.status_hoy === 'finalizado' ? (
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
                   <CheckCircle2 className="w-3.5 h-3.5" />
                   Cerrado
                </div>
              ) : (
                <div className={`${task.status_hoy === 'iniciado' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'} px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 animate-pulse`}>
                   {task.status_hoy === 'iniciado' ? <Clock className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                   {task.status_hoy === 'iniciado' ? 'En Proceso' : 'Por Iniciar'}
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50">
               {task.status_hoy === 'finalizado' ? (
                 <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
                   Tarea completada exitosamente hoy
                 </p>
               ) : (
                 <Link href={`/operaciones/inspeccion/${task.id}`}>
                    <button className={`w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98]
                      ${task.status_hoy === 'iniciado' 
                        ? 'bg-amber-500 text-white shadow-amber-100 hover:bg-amber-600' 
                        : 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700'
                      }`}
                    >
                      {task.status_hoy === 'iniciado' ? 'Finalizar Jornada' : 'Iniciar Día de Trabajo'}
                      <ArrowRightCircle className="w-4 h-4" />
                    </button>
                 </Link>
               )}
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center">
             <ClipboardList className="w-16 h-16 text-slate-100 mx-auto mb-4" />
             <h4 className="text-lg font-bold text-slate-800 tracking-tight">No tienes tareas asignadas</h4>
             <p className="text-slate-400 text-sm max-w-[200px] mx-auto mt-2 font-medium">Contacta al supervisor para recibir tu cronograma de obra.</p>
          </div>
        )}
      </div>
    </div>
  )
}
