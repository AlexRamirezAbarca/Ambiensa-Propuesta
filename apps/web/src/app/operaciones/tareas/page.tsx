'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { 
  ClipboardList, 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  Clock,
  CalendarDays,
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  FileCheck,
  PartyPopper,
  Trophy,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { StatusModal, StatusType } from '@/shared/components/StatusModal'
import { PlanificarJornadaModal } from '@/modules/operaciones/components/PlanificarJornadaModal'
import { PlanillaDiariaModal } from '@/modules/operaciones/components/PlanillaDiariaModal'

export default function OperacionesTareasPage() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [activeJornada, setActiveJornada] = useState<any>(null)
  const [jornadaItems, setJornadaItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlanningOpen, setIsPlanningOpen] = useState(false)
  const [activeTaskModal, setActiveTaskModal] = useState<any>(null)
  
  // State for Custom Alerts
  const [statusModal, setStatusModal] = useState<{isOpen: boolean, title: string, message: string, type: StatusType}>({
    isOpen: false, title: '', message: '', type: 'info'
  })

  const supabase = createClient()

  const showAlert = (title: string, message: string, type: StatusType = 'info') => {
    setStatusModal({ isOpen: true, title, message, type })
  }

  const fetchCurrentState = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
      setUserProfile(profile)

      // 1. Buscar si hay una jornada hoy (abierta o cerrada)
      const today = new Date().toISOString().split('T')[0]
      
      const { data: jornada } = await supabase
        .from('jornadas_diarias')
        .select('*')
        .eq('contratista_id', user.id)
        .eq('fecha', today)
        .maybeSingle()

      if (jornada) {
        setActiveJornada(jornada)
        // 2. Traer los items de esa jornada con su avance si existe
        // Si está cerrada, solo queremos mostrar la lista resumida
        const { data: items } = await supabase
          .from('jornada_items')
          .select(`
            *,
            proyecto_presupuesto (
              *,
              proyectos(nombre),
              avances_diarios(*)
            )
          `)
          .eq('jornada_id', jornada.id)

        const processedItems = items?.map(item => {
           const avanceForThisJornada = item.proyecto_presupuesto?.avances_diarios?.find(
             (a: any) => a.jornada_id === jornada.id
           )
           return {
             ...item,
             avance_actual: avanceForThisJornada
           }
        })
        setJornadaItems(processedItems || [])
      } else {
        setActiveJornada(null)
        setJornadaItems([])
      }
    } catch (err) {
      console.error('Error fetching tasks state:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentState()
  }, [supabase])

  const handleCerrarJornadaGlobal = async () => {
    if (!activeJornada) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('jornadas_diarias')
        .update({ estado: 'cerrada' })
        .eq('id', activeJornada.id)

      if (error) throw error
      showAlert('¡Éxito!', 'Jornada técnica cerrada exitosamente. ¡Buen trabajo hoy!', 'success')
      fetchCurrentState()
    } catch (err: any) {
      showAlert('Error', 'No pudimos cerrar la jornada: ' + err.message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div className="p-20 text-center animate-pulse font-black text-slate-400 uppercase tracking-widest text-[10px]">ANALIZANDO JORNADA...</div>

  const isClosed = activeJornada?.estado === 'cerrada'
  const allFinalized = jornadaItems.length > 0 && jornadaItems.every(i => i.avance_actual?.estado === 'finalizado')

  return (
    <div className="space-y-8 fade-in pb-24 pt-6 px-4">
      
      {/* -------------------------------------------------------------
          PANTALLA DE ÉXITO (DÍA FINALIZADO)
         ------------------------------------------------------------- */}
      {isClosed ? (
        <div className="py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-80" />
              
              <div className="w-32 h-32 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
                 <Trophy className="w-16 h-16 text-emerald-500 animate-bounce" />
              </div>
              
              <h1 className="text-4xl font-black text-[#0f172a] tracking-tight leading-loose mb-3">
                 ¡Día Completado!
              </h1>
              
              <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] mb-10 flex items-center justify-center gap-2">
                 <PartyPopper className="w-4 h-4 text-emerald-500" /> 
                 Gestión del {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>

              <div className="bg-slate-50 rounded-[2rem] p-6 mb-10 border border-slate-100/50">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rubros Ejecutados</p>
                       <span className="text-2xl font-black text-slate-800">{jornadaItems.length}</span>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado Final</p>
                       <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">Auditado</span>
                    </div>
                 </div>
              </div>

              <p className="text-slate-500 text-sm font-bold max-w-[280px] mx-auto leading-relaxed mb-10">
                 Has cerrado exitosamente tu planificación diaria. La información ha sido enviada a fiscalización.
              </p>

              <Button onClick={() => window.location.href = '/operaciones'} variant="outline" fullWidth className="h-16 rounded-2xl border-2 border-slate-100 bg-white hover:bg-white hover:border-emerald-500 hover:text-emerald-600 text-slate-600 font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm transition-all">
                Ir al Inicio <ArrowRight className="w-4 h-4" />
              </Button>
           </div>
        </div>
      ) : (
        <>
          {/* Header Dinámico */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-6">
               <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl ${activeJornada ? 'bg-emerald-500 shadow-emerald-200' : 'bg-indigo-600 shadow-indigo-200'}`}>
                  {activeJornada ? <CheckCircle className="w-8 h-8" /> : <CalendarDays className="w-8 h-8" />}
               </div>
               <div>
                  <h1 className="text-3xl font-black text-[#0f172a] tracking-tight leading-tight">
                    {activeJornada ? 'Jornada Activa' : 'Planificar Día'}
                  </h1>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 leading-none flex items-center gap-2">
                     <Clock className="w-3.5 h-3.5 text-indigo-500" />
                     {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
               </div>
            </div>

            {!activeJornada && (
               <Button onClick={() => setIsPlanningOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 h-14 px-8 rounded-2xl shadow-xl shadow-indigo-100 font-black text-[10px] uppercase tracking-widest gap-3">
                  <PlusCircle className="w-5 h-5" />
                  Planificar Día de Trabajo
               </Button>
            )}
          </div>

          {!activeJornada ? (
            <div className="py-20 text-center animate-in fade-in zoom-in duration-500">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                  <LayoutGrid className="w-12 h-12" />
               </div>
               <h3 className="text-xl font-black text-[#0f172a] mb-2">¿Qué quieres hacer hoy?</h3>
               <p className="text-slate-400 text-sm font-medium max-w-[280px] mx-auto mb-8 leading-relaxed">
                  Inicia una planificación para escoger los rubros técnicos que reportarás en este día.
               </p>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex items-center justify-between px-2">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                     <ClipboardList className="w-4 h-4 text-indigo-500" /> 
                     Rubros Planificados para hoy ({jornadaItems.length})
                  </h2>
               </div>

               <div className="space-y-4">
                  {jornadaItems.map((item, idx) => {
                     const rubro = item.proyecto_presupuesto
                     const avance = item.avance_actual
                     
                     return (
                       <motion.div
                         key={item.id}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-xl group"
                       >
                         <div className="flex items-start justify-between">
                            <div className="flex gap-5">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${
                                  avance?.estado === 'finalizado' ? 'bg-emerald-50 text-emerald-600' : 
                                  avance?.estado === 'iniciado' ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-slate-50 text-slate-400'
                               }`}>
                                  <Building2 className="w-7 h-7" />
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mb-1.5">{rubro.proyectos?.nombre}</p>
                                  <h3 className="text-[16px] font-black text-slate-800 leading-tight mb-1">{rubro.descripcion}</h3>
                                  <p className="text-[11px] font-bold text-slate-400 mb-3">Código: {rubro.rubro}</p>
                                  <div className="flex items-center gap-3">
                                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                        avance?.estado === 'finalizado' ? 'bg-emerald-100 text-emerald-700' :
                                        avance?.estado === 'iniciado' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                                     }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                           avance?.estado === 'finalizado' ? 'bg-emerald-500' :
                                           avance?.estado === 'iniciado' ? 'bg-amber-500 animate-ping' : 'bg-slate-400'
                                        }`} />
                                        {avance?.estado === 'finalizado' ? 'Finalizado' : avance?.estado === 'iniciado' ? 'En Proceso' : 'Pendiente'}
                                     </span>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-end">
                            {avance?.estado === 'finalizado' ? (
                              <div className="flex items-center gap-2 text-emerald-600 text-xs font-black uppercase tracking-widest">
                                 <FileCheck className="w-4 h-4" /> Reporte Completado
                              </div>
                            ) : (
                              <Button 
                                onClick={() => setActiveTaskModal({ ...rubro, jornada_id: activeJornada.id })}
                                className={`h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 transition-all ${
                                   avance?.estado === 'iniciado' ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-100 shadow-xl' : 'bg-[#0f172a] hover:bg-black text-white shadow-slate-100 shadow-xl'
                                }`}
                              >
                                 {avance?.estado === 'iniciado' ? 'Cerrar Planillado Diario' : 'Comenzar a Planillar'}
                                 <ChevronRight className="w-4 h-4" />
                              </Button>
                            )}
                         </div>
                       </motion.div>
                     )
                  })}
               </div>

               {/* Botón Final de Jornada */}
               <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-100 flex flex-col items-center gap-6">
                   <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${allFinalized ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {allFinalized ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                        {allFinalized ? '¡Todos los rubros completados!' : 'Finaliza todos los rubros para cerrar el día'}
                      </span>
                   </div>
                   
                   <Button 
                     onClick={handleCerrarJornadaGlobal}
                     disabled={!allFinalized}
                     className={`w-full h-20 rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-2xl ${
                       allFinalized ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed border-none'
                     }`}
                   >
                     Cerrar Planificación Diaria
                     <CheckCircle2 className="w-6 h-6 ml-4" />
                   </Button>
               </div>
            </div>
          )}
        </>
      )}

      {/* -------------------------------------------------------------
          MODALES DE APOYO
         ------------------------------------------------------------- */}
      <PlanificarJornadaModal 
        isOpen={isPlanningOpen} 
        onClose={() => setIsPlanningOpen(false)} 
        onSuccess={() => { setIsPlanningOpen(false); fetchCurrentState(); }}
        userProfile={userProfile}
      />

      <PlanillaDiariaModal 
        isOpen={!!activeTaskModal} 
        onClose={() => setActiveTaskModal(null)} 
        onSuccess={fetchCurrentState}
        task={activeTaskModal} 
        userProfile={userProfile}
      />

      <StatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({...prev, isOpen: false}))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  )
}
