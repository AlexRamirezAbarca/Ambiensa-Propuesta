'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Building2, Plus, ArrowLeft, Search, MapPin, Briefcase, User, UserPlus, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/components/Button'
import { UploadBudgetModal } from '@/modules/projects/components/UploadBudgetModal'
import { AssignContractorModal } from '@/modules/projects/components/AssignContractorModal'

interface ProjectDetailsPageProps {
  params: Promise<{ id: string }>
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const { id } = use(params)
  const [project, setProject] = useState<any>(null)
  const [budgetItems, setBudgetItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [assigningContractor, setAssigningContractor] = useState<any>(null)
  const [role, setRole] = useState('')
  const supabase = createClient()

  const fetchProjectDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setRole(user?.user_metadata?.role?.toLowerCase() || '')

      const { data: projectData, error: projError } = await supabase
        .from('proyectos')
        .select('*')
        .eq('id', id)
        .single()

      if (!projError && projectData) {
        setProject(projectData)
      }

      const { data: budgetData, error: budgetError } = await supabase
        .from('proyecto_presupuesto')
        .select(`
          *,
          usuarios!contratista_id(nombres)
        `)
        .eq('proyecto_id', id)
        .order('rubro', { ascending: true })

      if (budgetError) console.error('Error fetching budget:', JSON.stringify(budgetError))

      if (!budgetError && budgetData) {
        setBudgetItems(budgetData)
      }
    } catch (err) {
      console.error('Error fetching project details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectDetails()
  }, [id, supabase])

  if (isLoading) return <div className="p-20 text-center animate-pulse text-slate-400 font-black">Cargando Presupuesto...</div>
  if (!project) return <div className="p-10 text-center">Proyecto no encontrado.</div>

  const filteredBudget = budgetItems.filter((i: any) => 
    i.rubro?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalBudgetCost = budgetItems.reduce((acc, curr) => acc + (Number(curr.cantidad) * Number(curr.precio_unitario)), 0)

  return (
    <div className="space-y-12 animate-in fade-in transition-all pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <Link href="/operaciones/proyectos" className="group flex items-center gap-2 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-800 transition-all">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Volver a Proyectos
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-900 shadow-xl shadow-slate-200/50">
               <Building2 className="w-10 h-10" />
            </div>
            <div>
               <h1 className="text-4xl font-black text-[#0f172a] tracking-tight leading-none mb-3">{project.nombre}</h1>
               <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {project.ubicacion || 'Centro de Operaciones'}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border text-center border-slate-100 rounded-2xl px-6 py-3 flex flex-col justify-center shadow-sm">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Presupuesto Total</span>
             <span className="text-lg font-black text-indigo-600">${totalBudgetCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          {role === 'fiscalizador' && (
            <Button onClick={() => setIsModalOpen(true)} className="bg-[#0f172a] hover:bg-slate-800 shadow-2xl shadow-indigo-200 h-[68px] px-8 rounded-2xl">
              <Plus className="w-4 h-4 mr-2" /> Cargar Presupuesto
            </Button>
          )}
        </div>
      </div>

      {/* Asignación de Presupuesto */}
      <div className="bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
           <div>
              <h3 className="text-2xl font-black text-[#0f172a] flex items-center gap-4">
                 Asignación de Presupuesto <span className="text-slate-100 italic">/</span> <span className="text-indigo-600">{filteredBudget.length} Rubros</span>
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Líneas de inversión y tareas del proyecto</p>
           </div>
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar rubro o detalle..." className="w-full md:w-80 pl-14 pr-8 py-5 bg-slate-50 border-none rounded-3xl text-sm font-black placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                 <th className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Actividad</th>
                 <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-none">Cantidad</th>
                 <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-none">P. Unitario</th>
                 <th className="px-4 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-none">Plazo / Días</th>
                 <th className="px-4 py-5 text-[10px] font-black text-emerald-600 uppercase tracking-widest text-right leading-none">Total</th>
                 <th className="px-5 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Contratista</th>
                 <th className="px-5 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {filteredBudget.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="p-16 text-center text-sm font-bold text-slate-400">
                      No hay líneas de presupuesto asignadas todavía. {role === 'fiscalizador' ? 'Sube tu Excel de configuración.' : ''}
                   </td>
                 </tr>
               ) : filteredBudget.map((item: any) => {
                 const cant = Number(item.cantidad) || 0
                 const pu = Number(item.precio_unitario) || 0
                 return (
                   <tr key={item.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-5 py-5 w-1/4">
                         <span className="text-sm font-black text-[#0f172a] block mb-1 leading-tight">{item.rubro}</span>
                         <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-relaxed" title={item.descripcion}>
                            {item.descripcion || <span className="italic text-slate-300">Sin descripción</span>}
                         </p>
                      </td>
                      <td className="px-4 py-5 font-bold text-slate-700 text-center text-sm">
                         {cant.toFixed(2)} <span className="text-[10px] font-black text-slate-400">{item.unidad}</span>
                      </td>
                      <td className="px-4 py-5 font-bold text-slate-700 text-center text-sm">
                         ${pu.toFixed(2)}
                      </td>
                      <td className="px-4 py-5 text-center">
                         <span className="text-sm font-black text-slate-700">{item.tiempo_dias}</span>
                      </td>
                      <td className="px-4 py-5 text-right font-black text-emerald-600 text-[15px]">
                         ${(cant * pu).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-5">
                         {item.contratista_id && item.usuarios ? (
                           <div className="flex items-center gap-2 w-max group-hover:scale-105 transition-transform">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-[9px] border border-indigo-200">
                                 {item.usuarios?.nombres?.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-black text-slate-800 leading-none">{item.usuarios?.nombres}</span>
                                <span className="text-[9px] font-bold text-slate-400">Asignado</span>
                              </div>
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity w-max">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                                 <User className="w-3 h-3" />
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 italic">No asignado</span>
                           </div>
                         )}
                      </td>
                      <td className="px-5 py-5 text-right">
                         {!item.contratista_id ? (
                           <Button 
                             variant="outline" 
                             onClick={() => setAssigningContractor(item)}
                             className="border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
                           >
                              <UserPlus className="w-4 h-4 mr-2" /> Asignar
                           </Button>
                         ) : (
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center justify-end gap-1">
                             <CheckCircle2 className="w-4 h-4" /> Listo
                           </span>
                         )}
                      </td>
                   </tr>
                 )
               })}
            </tbody>
          </table>
        </div>
      </div>

      <UploadBudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProjectDetails} 
        projectId={id} 
      />

      <AssignContractorModal 
        isOpen={!!assigningContractor} 
        onClose={() => setAssigningContractor(null)} 
        onSuccess={() => { setAssigningContractor(null); fetchProjectDetails(); }}
        rubro={assigningContractor} 
      />
    </div>
  )
}
