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
  Filter,
  Search,
  Eye,
  AlertCircle,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ContraloriaDashboard = () => {
  const [jornadas, setJornadas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pendiente') // pendiente, aprobado, observado
  const supabase = createClient()

  useEffect(() => {
    fetchJornadas()
  }, [filter])

  const fetchJornadas = async () => {
    setLoading(true)
    try {
      // Fetch jornadas with related data
      const { data, error } = await supabase
        .from('jornadas_diarias')
        .select(`
          *,
          usuarios:contratista_id(nombres),
          proyecto_presupuesto(descripcion_rubro, lote_vivienda),
          evidencias_jornada(*)
        `)
        .eq('estado', 'cerrado')
        .order('fecha', { ascending: false })

      if (error) throw error
      setJornadas(data || [])
    } catch (err) {
      console.error('Error fetching jornadas:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (jornadaId: string, action: 'aprobar' | 'observar') => {
    const confirmation = window.confirm(`¿Está seguro de ${action} esta jornada?`)
    if (!confirmation) return

    try {
      const { error } = await supabase
        .from('jornadas_diarias')
        .update({ 
          estado_auditoria: action === 'aprobar' ? 'aprobado' : 'observado',
          auditado_por: (await supabase.auth.getUser()).data.user?.id,
          fecha_auditoria: new Date().toISOString()
        })
        .eq('id', jornadaId)

      if (error) throw error
      fetchJornadas()
    } catch (err) {
      alert('Error al actualizar auditoría')
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Muro de Auditoría - Contraloría</h1>
          <p className="text-slate-500 mt-1 italic">Validación técnica y visual de avances de obra.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          {['pendiente', 'aprobado', 'observado'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider ${
                filter === f 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : jornadas.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={40} className="text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-400">No hay jornadas pendientes de auditoría</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jornadas.map((j) => (
            <div key={j.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-none mb-2">
                        {j.usuarios?.nombres || 'Contratista'}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(j.fecha), "PPP", { locale: es })}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="flex items-center gap-1"><Clock size={12} /> {j.hora_inicio} - {j.hora_fin}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(j.id, 'observar')}
                      className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-rose-100 transition-colors"
                    >
                      <XCircle size={18} /> Observar
                    </button>
                    <button 
                      onClick={() => handleAction(j.id, 'aprobar')}
                      className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 size={18} /> Aprobar Avance
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Rubro y Ubicación</span>
                    <p className="text-slate-700 font-bold">
                      {j.proyecto_presupuesto?.descripcion_rubro} - <span className="text-blue-600">Lote {j.proyecto_presupuesto?.lote_vivienda}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Volumen Reportado</span>
                    <p className="text-2xl font-black text-slate-900">
                      {j.volumen_avance} <span className="text-sm font-medium text-slate-400">m² / m³</span>
                    </p>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['inicio', 'fin'].map((type) => {
                    const evidencia = j.evidencias_jornada?.find((e: any) => e.tipo === type)
                    return (
                      <div key={type} className="relative aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 group/img">
                        {evidencia ? (
                          <>
                            <img 
                              src={evidencia.foto_url} 
                              alt={`Evidencia ${type}`} 
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                              <div className="flex items-center gap-2 text-white font-bold text-sm mb-1">
                                <MapPin size={16} /> GPS: {evidencia.latitud}, {evidencia.longitud}
                              </div>
                              <div className="text-slate-300 text-xs font-medium">
                                Capturado el {format(new Date(evidencia.fecha_captura), "HH:mm:ss")}
                              </div>
                            </div>
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest text-slate-900 shadow-xl">
                              Foto {type}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 italic text-sm">
                            <Camera size={32} className="mb-2 opacity-20" />
                            Sin evidencia de {type}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ContraloriaDashboard
