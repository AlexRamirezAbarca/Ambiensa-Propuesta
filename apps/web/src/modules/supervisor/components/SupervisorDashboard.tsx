'use client'

import { useState, useEffect } from 'react'
import { Users, HardHat, TrendingUp, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function SupervisorDashboard() {
  const [stats, setStats] = useState({
    fiscalizadoresTotal: 0,
    proyectosActivos: 0, 
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [topPerformer, setTopPerformer] = useState<any>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: fiscalizadores } = await supabase
          .from('usuarios')
          .select('id, nombres, roles!inner(nombre)')
          .eq('roles.nombre', 'fiscalizador')

        const { count: proyectosCount } = await supabase.from('proyectos').select('*', { count: 'exact', head: true })

        const { data: activity } = await supabase
          .from('avances_diarios')
          .select(`
            *,
            lotes_unidades (
              villa, 
              mz,
              proyectos (nombre)
            ),
            usuarios (nombres)
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (activity) setRecentActivity(activity)
        const best = activity?.length ? activity[0] : null
        if (best) setTopPerformer(best)

        if (fiscalizadores) {
          setStats({
            fiscalizadoresTotal: fiscalizadores.length,
            proyectosActivos: proyectosCount || 0
          })
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [supabase])

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400">Cargando Centro de Mando...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Mando Web</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Monitoreo en tiempo real de la gestión de campo de Ambiensa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Fiscalizadores</p>
              <h3 className="text-4xl font-black text-slate-900">{stats.fiscalizadoresTotal}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black uppercase text-emerald-500 tracking-wider">
             Personal en Obra Activo
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Proyectos Activos</p>
              <h3 className="text-4xl font-black text-slate-900">{stats.proyectosActivos}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <HardHat className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Sincronizado via Satélite
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mejor Avance Hoy</p>
              <h3 className="text-lg font-black text-slate-900 leading-tight">
                {topPerformer?.usuarios?.nombres?.split(' ')[0] || '—'}
              </h3>
              <p className="text-indigo-600 text-[11px] font-black uppercase mt-1 tracking-tight">
                {topPerformer?.volumen_dia ? `${topPerformer.volumen_dia.toFixed(2)} m³ Reportados` : 'Esperando datos'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Top Rendimiento</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-rose-50 shadow-sm hover:shadow-xl transition-all duration-300 group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Mayor Retraso</p>
              <h3 className="text-lg font-black text-[#0f172a] leading-tight">Villa 4 - MZ 2</h3>
              <p className="text-rose-600 text-[11px] font-black uppercase mt-1 tracking-tight">5 días de inactividad</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 transition-transform group-hover:scale-110">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="bg-rose-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">Urgente</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Rendimiento Técnico de Campo</h2>
          <div className="space-y-4">
             {recentActivity.length > 0 ? recentActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center font-black text-indigo-600 border border-slate-100">
                         {act.usuarios?.nombres?.[0] || 'F'}
                      </div>
                      <div>
                         <p className="text-sm font-black text-slate-800">{act.usuarios?.nombres}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{act.lotes_unidades?.proyectos?.nombre}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-black text-slate-900">{act.volumen_dia?.toFixed(2)} m³</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase">Aporte Exitoso</p>
                   </div>
                </div>
             )) : (
                <div className="py-20 text-center animate-pulse text-slate-300 font-black uppercase text-xs tracking-widest">Sin reportes hoy</div>
             )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Bitácora en Tiempo Real</h2>
          <div className="flex-1 overflow-auto pr-2 space-y-8">
            {recentActivity.map((act, i) => (
               <div key={i} className="relative pl-8 border-l-2 border-indigo-100 pb-2">
                 <div className="absolute w-4 h-4 bg-indigo-500 rounded-full -left-[9px] top-1 ring-4 ring-white shadow-sm"></div>
                 <p className="text-sm font-black text-slate-900">Villa {act.lotes_unidades?.villa} - MZ {act.lotes_unidades?.mz}</p>
                 <p className="text-xs font-bold text-slate-500 mt-1 leading-relaxed">Registró {act.volumen_dia?.toFixed(2)} m³ de avance técnico.</p>
                 <div className="flex gap-2 mt-3">
                    <span className="text-[9px] uppercase font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md tracking-tighter">GPS OK</span>
                    <span className="text-[9px] uppercase font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md tracking-tighter">Foto OK</span>
                 </div>
                 <p className="text-[10px] uppercase font-bold text-slate-300 mt-4 tracking-widest">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {act.usuarios?.nombres}
                 </p>
               </div>
            ))}
            {recentActivity.length === 0 && (
               <p className="text-center text-slate-300 text-[10px] font-black uppercase tracking-widest py-20">Esperando actividad de campo...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
