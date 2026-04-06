'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, Plus, ArrowLeft, Search, Filter, MapPin, Navigation, HardHat, Mail, CheckCircle2, AlertCircle, TrendingUp, Edit, Trash2, Clock, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/components/Button'
import { BatchCreateLotsModal } from '@/modules/projects/components/BatchCreateLotsModal'
import { EditLotModal } from '@/modules/projects/components/EditLotModal'
import { exportProjectToExcel } from '@/lib/utils/excelHelper'

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { id } = use(params)
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLot, setEditingLot] = useState<any>(null)
  const [role, setRole] = useState('')
  const supabase = createClient()

  const fetchProjectDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setRole(user?.user_metadata?.role?.toLowerCase() || '')

      const { data, error } = await supabase
        .from('proyectos')
        .select(`
          *,
          lotes_unidades (
            *,
            usuarios (
              nombres,
              email
            )
          )
        `)
        .eq('id', id)
        .single()

      if (!error && data) {
        setProject(data)
      }
    } catch (err) {
      console.error('Error fetching project details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    setIsExporting(true)
    try {
      const { data, error } = await supabase
        .from('avances_diarios')
        .select(`*, lotes_unidades!inner (*)`)
        .eq('lotes_unidades.proyecto_id', id)
        .order('fecha', { ascending: true })

      if (data) exportProjectToExcel(project.nombre, data)
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchProjectDetails()
  }, [id, supabase])

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-black">Cargando Urbanización...</div>
  if (!project) return <div className="p-10 text-center">Proyecto no encontrado.</div>

  const filteredLots = project.lotes_unidades?.filter((l: any) => 
    l.mz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.villa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.calle?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const totalVolume = project.lotes_unidades?.reduce((acc: number, curr: any) => acc + (Number(curr.volumen_acumulado) || 0), 0) || 0

  return (
    <div className="space-y-12 animate-in fade-in transition-all pb-24">
      
      {/* Header Premium con Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Link href="/operaciones/proyectos" className="group flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-800 transition-all">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Volver a Urbanizaciones
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-900 shadow-xl shadow-slate-200/50 group-hover:scale-105 transition-transform duration-500">
               <Building2 className="w-10 h-10" />
            </div>
            <div>
               <h1 className="text-4xl font-black text-[#0f172a] tracking-tight leading-none mb-3">{project.nombre}</h1>
               <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {project.ubicacion || 'Guayaquil'}</span>
                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                  <span className="text-indigo-600">{project.lotes_unidades?.length || 0} Unidades totales</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="secondary"
            onClick={handleDownloadReport} 
            isLoading={isExporting}
            loadingText="Preparando..."
            className="border-2 border-slate-100 bg-white shadow-sm h-14 px-8 rounded-2xl text-slate-700 font-black text-[11px] uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all"
          >
            <Download className="w-4 h-4 mr-2" />
            Reporte Técnico
          </Button>
          
          {/* Solo Supervisor puede inyectar datos técnicos */}
          {role !== 'admin' && (
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#0f172a] hover:bg-slate-800 shadow-2xl shadow-indigo-200 h-14 px-8 rounded-2xl">
              <Plus className="w-4 h-4 mr-2" /> Inyectar Unidades
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8">
             <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Con Avance</p>
                <p className="text-4xl font-black text-slate-900 leading-none">
                  {project.lotes_unidades?.filter((l: any) => (Number(l.volumen_acumulado) || 0) > 0).length || 0}
                </p>
             </div>
          </div>
          <div className="bg-[#0f172a] p-10 rounded-[3rem] shadow-2xl shadow-indigo-900/10 flex items-center gap-8 text-white relative overflow-hidden group">
             <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner relative z-10 transition-transform group-hover:scale-110">
                <TrendingUp className="w-8 h-8" />
             </div>
             <div className="relative z-10">
                <p className="text-[10px] font-black text-indigo-300/50 uppercase tracking-widest mb-2">Total m³ Urbanización</p>
                <p className="text-4xl font-black">{totalVolume.toFixed(2)}</p>
             </div>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-8">
             <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner">
                <AlertCircle className="w-8 h-8" />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pendientes Asignar</p>
                <p className="text-4xl font-black text-slate-900 tracking-tight">
                   {project.lotes_unidades?.filter((l: any) => !l.id_fiscalizador).length || 0}
                </p>
             </div>
          </div>
      </div>

      {/* Inventario Técnico */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
           <div>
              <h3 className="text-2xl font-black text-[#0f172a] flex items-center gap-4">
                 Inventario de Obra <span className="text-slate-100 italic">/</span> <span className="text-indigo-600">{filteredLots.length}</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Bitácora técnica de villas individuales</p>
           </div>
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="MZ o Villa..." className="w-full md:w-80 pl-14 pr-8 py-5 bg-slate-50 border-none rounded-3xl text-sm font-black placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                 <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Villa / MZ</th>
                 <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ubicación Geográfica</th>
                 <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Aporte (m³)</th>
                 <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Responsable</th>
                 <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredLots.map((lot: any) => (
                 <tr key={lot.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-8">
                       <Link href={`/operaciones/proyectos/${id}/unidad/${lot.id}`} className="flex items-center gap-6 transition-transform active:scale-95 group">
                          <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex flex-col items-center justify-center shadow-sm group-hover:border-indigo-200 group-hover:shadow-indigo-50 transition-all duration-500">
                             <span className="text-[9px] font-black text-slate-300 leading-none">MZ</span>
                             <span className="text-xl font-black text-indigo-700 leading-none mt-1">{lot.mz}</span>
                          </div>
                          <div>
                             <p className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">Villa {lot.villa}</p>
                             <span className="text-[9px] font-black text-indigo-400 uppercase flex items-center gap-1.5 mt-1 tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                <Clock className="w-3 h-3" /> Bitácora técnica
                             </span>
                          </div>
                       </Link>
                    </td>
                    <td className="px-8 py-8">
                       <p className="text-xs font-black text-slate-500 flex items-center gap-3">
                          <Navigation className="w-3.5 h-3.5 text-indigo-400" /> {lot.calle || 'Principal'}
                       </p>
                    </td>
                    <td className="px-8 py-8">
                       <div className="space-y-3">
                          <div className="text-lg font-black text-[#0f172a]">{(Number(lot.volumen_acumulado) || 0).toFixed(2)} <span className="text-[10px] font-bold text-slate-400 uppercase ml-1">m³</span></div>
                          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20 shadow-inner">
                             <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full" style={{ width: `${Math.min(((Number(lot.volumen_acumulado) || 0) / 10) * 100, 100)}%` }}></div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-8">
                       {lot.usuarios ? (
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 font-black text-[10px]">
                               {lot.usuarios.nombres.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-700">{lot.usuarios.nombres}</p>
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{lot.usuarios.email.split('@')[0]}</span>
                            </div>
                         </div>
                       ) : <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Sin Asignar</span>}
                    </td>
                    <td className="px-8 py-8 text-right">
                       {/* Solo Supervisor puede editar lotes individualmente */}
                       {role !== 'admin' && (
                         <button onClick={() => setEditingLot(lot)} className="w-10 h-10 bg-slate-50 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 border border-slate-100 rounded-xl transition-all flex items-center justify-center"><Edit className="w-4 h-4"/></button>
                       )}
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      <BatchCreateLotsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchProjectDetails} projectId={id} projectName={project.nombre} />
      {editingLot && <EditLotModal isOpen={!!editingLot} onClose={() => setEditingLot(null)} onSuccess={fetchProjectDetails} lot={editingLot} />}
    </div>
  )
}
