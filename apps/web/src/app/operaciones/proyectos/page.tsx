'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, MapPin, Building2, TrendingUp, CheckCircle2, AlertCircle, ArrowRight, HardHat } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/shared/components/Button'
import { CreateProjectModal } from '@/modules/projects/components/CreateProjectModal'

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [role, setRole] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchProyectos = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setRole(user?.user_metadata?.role?.toLowerCase() || '')

      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          lotes_unidades (
            volumen_acumulado
          )
        `)
        .order('nombre', { ascending: true })

      if (!error && data) {
        setProyectos(data)
      }
      setIsLoading(false)
    }

    fetchProyectos()
  }, [supabase])

  const filteredProyectos = proyectos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold">Cargando Urbanizaciones...</div>

  return (
    <div className="space-y-10 animate-in fade-in transition-all">
      
      {/* Header Interactivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <nav className="flex items-center gap-2 text-indigo-600 mb-2">
              <HardHat className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Módulo Central</span>
           </nav>
           <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Gestión de Proyectos</h1>
           <p className="text-slate-400 font-medium text-sm mt-1">Supervisión integral de urbanas y frentes de obra.</p>
        </div>
        
        {/* Solo el Supervisor puede crear proyectos */}
        {role !== 'admin' && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#0f172a] hover:bg-slate-800 shadow-2xl shadow-indigo-200 h-14 px-8 rounded-2xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        )}
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
         <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o ubicación..." 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
         </div>
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 hidden md:block">
            {filteredProyectos.length} ACTIVOS
         </div>
      </div>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProyectos.map((p) => {
          const lotesConAvance = p.lotes_unidades?.filter((l: any) => (Number(l.volumen_acumulado) || 0) > 0).length || 0
          const totalVolumen = p.lotes_unidades?.reduce((acc: number, curr: any) => acc + (Number(curr.volumen_acumulado) || 0), 0) || 0
          
          return (
            <div key={p.id} className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
               <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                     <Building2 className="w-8 h-8" />
                  </div>
                  <div className="px-4 py-2 bg-indigo-50 rounded-xl text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                     Inmobiliario
                  </div>
               </div>

               <h3 className="text-2xl font-black text-[#0f172a] mb-2 group-hover:text-indigo-600 transition-colors">{p.nombre}</h3>
               <p className="text-xs font-bold text-slate-400 flex items-center gap-2 mb-8">
                  <MapPin className="w-3 h-3 text-indigo-500" /> {p.ubicacion || 'Guayaquil'}
               </p>

               <div className="grid grid-cols-2 gap-4 mb-10 pt-6 border-t border-slate-50">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades</p>
                     <p className="text-lg font-black text-slate-800">{p.lotes_unidades?.length || 0}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aporte m³</p>
                     <p className="text-lg font-black text-indigo-600">{totalVolumen.toFixed(2)}</p>
                  </div>
               </div>

               <Link href={`/operaciones/proyectos/${p.id}`} className="w-full h-14 bg-[#0f172a] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-900/10">
                  Ver Detalles <ArrowRight className="w-3 h-3" />
               </Link>
            </div>
          )
        })}
      </div>

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => {
          setIsCreateOpen(false)
          window.location.reload()
        }}
      />
    </div>
  )
}
