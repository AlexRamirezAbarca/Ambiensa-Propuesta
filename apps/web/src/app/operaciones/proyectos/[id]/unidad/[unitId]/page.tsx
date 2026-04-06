'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, HardHat, Calendar, Ruler, Maximize, Activity, Box, MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

interface UnitHistoryPageProps {
  params: Promise<{ id: string, unitId: string }>
}

export default function UnitHistoryPage({ params }: UnitHistoryPageProps) {
  const { id: projectId, unitId } = use(params)
  const [logs, setLogs] = useState<any[]>([])
  const [unit, setUnit] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: unitData } = await supabase
          .from('lotes_unidades')
          .select('*, proyectos(nombre)')
          .eq('id', unitId)
          .single()
        
        if (unitData) setUnit(unitData)

        const { data: logData } = await supabase
          .from('avances_diarios')
          .select(`
            *,
            usuarios (nombres)
          `)
          .eq('lote_id', unitId)
          .eq('estado', 'finalizado')
          .order('fecha', { ascending: false })

        if (logData) setLogs(logData)
      } catch (err) {
        console.error('Error fetching unit logs:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [unitId, supabase])

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400">Cargando Bitácora...</div>
  if (!unit) return <div className="p-10 text-center">Unidad no encontrada.</div>

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <Link href={`/operaciones/proyectos/${projectId}`} className="group flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider hover:text-indigo-800 transition-all mb-4">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Volver a {unit.proyectos?.nombre}
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
               <span className="text-xl font-black">MZ {unit.mz}</span>
            </div>
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Villa {unit.villa}</h1>
               <div className="flex items-center gap-3 text-slate-400 text-sm font-medium mt-1">
                  <span className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-[10px]"><MapPin className="w-3 h-3 text-indigo-500" /> {unit.calle || 'Principal'}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="font-black text-indigo-600 uppercase text-xs">Bitácora Técnica Diaria</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Técnico Unitario */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm col-span-1 md:col-span-2">
             <div className="flex justify-between items-center mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aporte Técnico Total</p>
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                   <Box className="w-4 h-4" />
                </div>
             </div>
             <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900">{(Number(unit.volumen_acumulado) || 0).toFixed(2)}</span>
                <span className="text-sm font-bold text-slate-400 uppercase">m³ acumulados</span>
             </div>
             <div className="w-full h-2 bg-slate-100 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(((Number(unit.volumen_acumulado) || 0) / 10) * 100, 100)}%` }}></div>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Abscisa Actual</p>
             <div className="text-3xl font-black text-indigo-400 leading-none">
                {logs.length > 0 ? Number(logs[0].abs_fin).toFixed(3) : Number(unit.absica_inicio).toFixed(3)}
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase mt-4">Punto Kilométrico (ABS)</p>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Jornadas</p>
             <div className="text-3xl font-black text-slate-900 leading-none">{logs.length}</div>
             <p className="text-[10px] font-bold text-emerald-500 uppercase mt-4 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Reportes Validados</p>
          </div>
      </div>

      {/* Tabla Técnica Detallada */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
           <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase tracking-[0.2em] text-xs">Registro de Jornadas Técnicas</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha / Operador</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Abscisas (ABS)</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medidas (m)</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Geometría</th>
                 <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aporte</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {logs.map((log, i) => (
                 <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                             <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-800">{new Date(log.fecha).toLocaleDateString()}</p>
                             <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter">{log.usuarios?.nombres}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="bg-slate-900 text-[10px] font-black text-white px-2 py-1 rounded-md">INC</div>
                          <span className="text-xs font-bold text-slate-600">{Number(log.abs_inicio).toFixed(3)}</span>
                          <ArrowLeft className="w-3 h-3 text-slate-200 rotate-180" />
                          <div className="bg-indigo-600 text-[10px] font-black text-white px-2 py-1 rounded-md">FIN</div>
                          <span className="text-xs font-bold text-slate-900">{Number(log.abs_fin).toFixed(3)}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                             <Ruler className="w-3 h-3" /> LONG: <span className="text-slate-800">{log.longitud}m</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                             <Maximize className="w-3 h-3" /> ANCHO: <span className="text-slate-800">{log.ancho}m</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                             <Activity className="w-3 h-3" /> ÁREA: <span className="text-slate-800">{log.area}m²</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                             <Box className="w-3 h-3" /> ALTURA: <span className="text-slate-800">{log.altura_promedio}m</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="text-base font-black text-indigo-600">{log.volumen_dia.toFixed(2)} <span className="text-[9px] text-slate-400">m³</span></div>
                       <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Registrado</div>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
          {logs.length === 0 && (
             <div className="py-24 text-center">
                <HardHat className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-300 font-black uppercase text-xs tracking-widest">Sin jornadas registradas aún</p>
             </div>
          )}
        </div>
      </div>

    </div>
  )
}
