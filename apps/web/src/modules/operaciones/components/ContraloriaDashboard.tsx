'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Camera, 
  Calendar, 
  User, 
  Clock,
  ArrowRight,
  ShieldCheck,
  Map as MapIcon,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion } from 'framer-motion'

const ContraloriaDashboard = () => {
  const [jornadas, setJornadas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pendiente')
  const supabase = createClient()

  useEffect(() => {
    fetchJornadas()
  }, [filter])

  const fetchJornadas = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('jornadas_diarias')
        .select(`
          *,
          contratista:contratista_id(nombres),
          avances_diarios(
            *,
            proyecto_presupuesto(rubro, descripcion, unidad)
          )
        `)
        .eq('estado', 'cerrada')
        .eq('auditoria_estado', filter)
        .order('created_at', { ascending: false })

      if (error) throw error
      setJornadas(data || [])
    } catch (err: any) {
      console.error('Error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (jornadaId: string, newState: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('jornadas_diarias')
        .update({ 
          auditoria_estado: newState,
          auditado_por: user?.id,
          fecha_auditoria: new Date().toISOString()
        })
        .eq('id', jornadaId)

      if (error) throw error
      
      // Limpiar selección y refrescar
      await fetchJornadas()
      
      // Refresco forzado para asegurar que desaparezca de la lista en la demo
      window.location.reload()
    } catch (err: any) {
      alert('Error crítico de auditoría (¿Ejecutaste el script 016?): ' + (err.message || JSON.stringify(err)))
    }
  }

  const getMapUrl = (lat: number, lng: number) => `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* Header Estilo Apple - Limpio y Potente */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-30 px-6 py-6">
         <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                  <ShieldCheck size={28} />
               </div>
               <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Muro de Auditoría</h1>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Transparencia Ambiensa 2026</p>
               </div>
            </div>

            <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
               {['pendiente', 'aprobado', 'observado'].map((f) => (
                 <button
                   key={f}
                   onClick={() => setFilter(f)}
                   className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     filter === f ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                   }`}
                 >
                   {f === 'pendiente' ? 'Pendientes' : f}
                 </button>
               ))}
            </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        {loading ? (
          <div className="py-20 text-center animate-pulse text-slate-300 font-black text-[10px] uppercase tracking-widest">Sincronizando Muro...</div>
        ) : jornadas.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 py-32 text-center shadow-sm">
             <CheckCircle2 size={48} className="mx-auto mb-4 text-slate-100" />
             <p className="text-sm font-bold text-slate-400">Sin registros en esta categoría</p>
          </div>
        ) : (
          jornadas.map((j) => (
            <motion.div 
              key={j.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[3.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden"
            >
              {/* Info del Contratista */}
              <div className="p-10 pb-6 flex items-center justify-between border-b border-slate-50">
                 <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-700 font-black text-sm">
                       {j.contratista?.nombres?.substring(0,2)}
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 leading-none">{j.contratista?.nombres}</h3>
                       <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500" /> {format(new Date(j.fecha), "dd MMM, yyyy", { locale: es })}</span>
                          <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                          <span className="flex items-center gap-1.5"><Clock size={14} className="text-blue-500" /> {format(new Date(j.created_at), "HH:mm")}</span>
                       </div>
                    </div>
                 </div>
                 <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                   filter === 'pendiente' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                 }`}>
                   {filter}
                 </div>
              </div>

              {/* Detalle de Avances (El "Instagram" de Obra) */}
              <div className="p-10 space-y-12">
                 {j.avances_diarios?.map((av: any) => (
                   <div key={av.id} className="space-y-8">
                      {/* Título del Rubro */}
                      <div className="flex items-start justify-between bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         <div>
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">{av.proyecto_presupuesto?.rubro}</p>
                            <h4 className="text-lg font-black text-slate-800">{av.proyecto_presupuesto?.descripcion}</h4>
                            <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Mz {av.mz} - Villa {av.villa} - {av.calle}</p>
                         </div>
                         <div className="text-right">
                            <span className="text-[10px] font-black text-slate-300 uppercase block mb-1">Volumen</span>
                            <p className="text-2xl font-black text-slate-900 leading-none">
                               {av.volumen_dia} <span className="text-xs font-medium text-slate-400">{av.proyecto_presupuesto?.unidad}</span>
                            </p>
                         </div>
                      </div>

                      {/* Fotos Comparativas Grandes */}
                      <div className="grid md:grid-cols-2 gap-6">
                         {/* Inicio */}
                         <div className="space-y-4">
                            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-100 border-2 border-white shadow-xl">
                               {av.foto_inicio_b64 ? (
                                 <img src={av.foto_inicio_b64} className="w-full h-full object-cover" alt="Inicio" />
                               ) : (
                                 <div className="h-full flex items-center justify-center text-slate-300"><Camera size={32} /></div>
                               )}
                               <div className="absolute top-4 left-4 bg-white/95 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-slate-100">Foto Inicio</div>
                            </div>
                            {av.gps_inicio && (
                               <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><MapIcon size={16} /></div>
                                  <div>
                                     <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5 tracking-widest">Coordenada Inicio</p>
                                     <p className="text-[10px] font-bold text-slate-700">{av.gps_inicio.lat.toFixed(5)}, {av.gps_inicio.lng.toFixed(5)}</p>
                                  </div>
                                  <a href={`https://www.google.com/maps?q=${av.gps_inicio.lat},${av.gps_inicio.lng}`} target="_blank" className="ml-auto text-[9px] font-black text-blue-600 underline">VER MAPA</a>
                               </div>
                            )}
                         </div>

                         {/* Fin */}
                         <div className="space-y-4">
                            <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-100 border-2 border-white shadow-xl">
                               {av.foto_fin_b64 ? (
                                 <img src={av.foto_fin_b64} className="w-full h-full object-cover" alt="Fin" />
                               ) : (
                                 <div className="h-full flex items-center justify-center text-slate-300"><Camera size={32} /></div>
                               )}
                               <div className="absolute top-4 left-4 bg-white/95 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-slate-100">Foto Cierre</div>
                            </div>
                            {av.gps_fin && (
                               <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><MapIcon size={16} /></div>
                                  <div>
                                     <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5 tracking-widest">Coordenada Cierre</p>
                                     <p className="text-[10px] font-bold text-slate-700">{av.gps_fin.lat.toFixed(5)}, {av.gps_fin.lng.toFixed(5)}</p>
                                  </div>
                                  <a href={`https://www.google.com/maps?q=${av.gps_fin.lat},${av.gps_fin.lng}`} target="_blank" className="ml-auto text-[9px] font-black text-blue-600 underline">VER MAPA</a>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              {/* Acciones de Auditoría Finales */}
              {filter === 'pendiente' && (
                <div className="p-10 pt-0 flex gap-4">
                   <button 
                     onClick={() => handleAction(j.id, 'observado')}
                     className="flex-1 py-5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-3xl text-xs font-black uppercase tracking-widest transition-all border-2 border-transparent hover:border-rose-100"
                   >
                     <XCircle size={18} className="inline mr-2" /> Rechazar
                   </button>
                   <button 
                     onClick={() => handleAction(j.id, 'aprobado')}
                     className="flex-[2] py-5 bg-blue-600 hover:bg-slate-900 text-white rounded-3xl text-xs font-black uppercase tracking-widest transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-3 group"
                   >
                     <CheckCircle2 size={18} /> Aprobar y Liberar para Pago
                   </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

    </div>
  )
}

export default ContraloriaDashboard
