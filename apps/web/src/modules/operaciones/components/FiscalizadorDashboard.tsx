'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ClipboardList, AlertCircle, Clock, ChevronRight, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export function FiscalizadorDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null)
  const [assignedLots, setAssignedLots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
        if (profile) setUserProfile(profile)

        const { data: lots } = await supabase.from('lotes_unidades').select('*, proyectos(nombre)').eq('id_fiscalizador', user.id).order('mz', { ascending: true })
        if (lots) {
          const { data: stats } = await supabase.from('avances_diarios').select('lote_id, volumen_dia').in('lote_id', lots.map(l => l.id)).eq('estado', 'finalizado')
          const progressMap: any = {}
          stats?.forEach(s => { progressMap[s.lote_id] = (progressMap[s.lote_id] || 0) + (s.volumen_dia || 0) })
          const enrichedLots = lots.map(l => {
            const totalVol = progressMap[l.id] || 0
            const calculatedPercent = Math.min(Math.round((totalVol / 10) * 100), 100)
            return { ...l, estado_avance: calculatedPercent, volumen_acumulado: totalVol }
          })
          setAssignedLots(enrichedLots)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [supabase])

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400">Cargando...</div>

  return (
    <div className="space-y-8 fade-in pb-8 pt-4">
      
      {/* Saludo Minimalista */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] leading-tight">
            Hola, {userProfile?.nombres?.split(' ')[0] || 'Melanie'}
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest leading-none">
            {assignedLots.length} Jornadas activas para hoy
          </p>
        </div>
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
           <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* SECCIÓN NUEVA: PRIORIDADES / RETRASOS (MOCK) */}
      <div className="space-y-4">
        <h2 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
           <AlertCircle className="w-4 h-4" /> Alertas de Retraso
        </h2>
        <div className="grid grid-cols-1 gap-3 px-2">
           <div className="bg-rose-50/50 border border-rose-100 rounded-[2rem] p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white font-black text-xs">MZ 2</div>
                 <div>
                    <h4 className="text-sm font-black text-slate-800">Villa 4 - Excavación</h4>
                    <span className="text-[10px] font-bold text-rose-400 uppercase">5 Días de Retraso Crítico</span>
                 </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-300" />
           </div>

           <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-5 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white font-black text-xs">MZ 5</div>
                 <div>
                    <h4 className="text-sm font-black text-slate-800">Villa 12 - Estructural</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sin reporte últimos 3 días</span>
                 </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
           </div>
        </div>
      </div>

      {/* Listado de unidades */}
      <div className="mt-8">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-4">Tu Gestión de Hoy</h2>
        <div className="space-y-3">
          {assignedLots.map((lot, idx) => (
            <Link key={lot.id} href={`/operaciones/inspeccion/${lot.id}`} className="block">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all hover:border-indigo-100"
              >
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center">
                       <span className="text-[9px] font-black text-slate-400 leading-none uppercase">MZ</span>
                       <span className="text-base font-black text-indigo-700 leading-none">{lot.mz}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">Villa {lot.villa}</h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                         <span className="text-indigo-500/60 font-black">{lot.proyectos?.nombre}</span>
                         <span className="text-slate-200">|</span>
                         <span>Calle: {lot.calle || 'Principal'}</span>
                      </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-[11px] font-black text-indigo-600 mb-1">
                       {lot.estado_avance}% <span className="text-slate-300 font-bold ml-1">({lot.volumen_acumulado?.toFixed(1)} m³)</span>
                    </div>
                    <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400" style={{ width: `${lot.estado_avance}%` }}></div>
                    </div>
                 </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
