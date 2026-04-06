'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, ChevronRight, LayoutGrid, Calendar, MoreVertical, Plus } from 'lucide-react'
import { Button } from '@/shared/components/Button'

interface Project {
  id: string
  nombre: string
  descripcion: string
  ubicacion: string
  estado: boolean
  created_at: string
  lotes_unidades: { count: number }[]
}

interface ProjectListProps {
  onAddNew?: () => void
}

export function ProjectList({ onAddNew }: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        const data = await response.json()
        if (Array.isArray(data)) {
          setProjects(data)
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl border border-slate-100"></div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center p-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="w-10 h-10 text-slate-200" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No hay proyectos registrados</h3>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Comienza creando tu primera urbanización para gestionar sus lotes.</p>
        <Button onClick={onAddNew} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
           <Plus className="w-4 h-4 mr-2" /> Crear Primer Proyecto
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((proj) => (
        <motion.div 
          key={proj.id}
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
               <Building2 className="w-7 h-7" />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
               <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
            {proj.nombre}
          </h3>
          <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[40px]">
             {proj.descripcion || 'Sin descripción detallada.'}
          </p>

          <div className="space-y-4">
            {/* Lotes Count */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-blue-100 transition-all">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                   <LayoutGrid className="w-4 h-4 text-slate-400" />
                 </div>
                 <span className="text-xs font-bold text-slate-600 uppercase">Unidades</span>
               </div>
               <span className="text-sm font-black text-slate-900">
                 {proj.lotes_unidades?.[0]?.count || 0}
               </span>
            </div>

            {/* Fecha */}
            <div className="flex items-center gap-3 px-3">
               <Calendar className="w-4 h-4 text-slate-300" />
               <span className="text-xs font-medium text-slate-400">
                 Creado el {new Date(proj.created_at).toLocaleDateString()}
               </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ver Detalles</span>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
