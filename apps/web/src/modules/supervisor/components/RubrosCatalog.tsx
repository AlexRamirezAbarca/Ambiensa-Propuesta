'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Search, Tags, Ruler, MoreVertical, Plus } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { createClient } from '@/lib/supabase/client'

interface Rubro {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  unidad_medida: string
  estado: boolean
}

export function RubrosCatalog() {
  const [rubros, setRubros] = useState<Rubro[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  const fetchRubros = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('rubros')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      if (data) setRubros(data)
    } catch (err) {
      console.error('Error fetching rubros:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRubros()
  }, [])

  const filteredRubros = rubros.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl border border-slate-100"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
      {/* Barra de Filtros */}
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">Total: {filteredRubros.length}</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/30">
            <tr>
              <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rubro / Descripción</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unidad</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estado</th>
              <th className="px-8 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredRubros.map((rubro) => (
              <motion.tr 
                key={rubro.id}
                layout
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-8 py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{rubro.nombre}</span>
                    <span className="text-xs text-slate-400 font-medium line-clamp-1">{rubro.descripcion || 'Sin descripción técnica.'}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase">
                    <Tags className="w-3 h-3" /> {rubro.categoria}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-600 uppercase">
                    <Ruler className="w-3 h-3 text-slate-300" /> {rubro.unidad_medida}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${rubro.estado ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${rubro.estado ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {rubro.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredRubros.length === 0 && (
          <div className="py-20 text-center bg-white">
            <ClipboardList className="w-12 h-12 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 text-sm font-medium">No se encontraron rubros con ese criterio.</p>
          </div>
        )}
      </div>
    </div>
  )
}
