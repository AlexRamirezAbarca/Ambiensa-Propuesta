'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FiscalizadorDashboard } from '@/modules/operaciones/components/FiscalizadorDashboard'
import { 
  HardHat, 
  CheckCircle2, 
  BarChart3, 
  ArrowUpRight, 
  Boxes,
  Activity,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function OperationsDashboard() {
  const [role, setRole] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // Datos reales
  const [totalVolumen, setTotalVolumen] = useState(0)
  const [unidadesActivas, setUnidadesActivas] = useState(0)
  const [totalUnidades, setTotalUnidades] = useState(0)
  const [proyectosData, setProyectosData] = useState<any[]>([])
  const [rubrosData, setRubrosData] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const userRole = user?.user_metadata?.role?.toLowerCase() || ''
      setRole(userRole)

      if (userRole === 'contratista') {
        setLoading(false)
        return
      }

      // 1. Total m³ acumulado y unidades
      const { data: lotes } = await supabase
        .from('lotes_unidades')
        .select('volumen_acumulado, proyecto_id, proyectos(nombre)')

      if (lotes) {
        const total = lotes.reduce((acc, l) => acc + (Number(l.volumen_acumulado) || 0), 0)
        setTotalVolumen(total)
        setTotalUnidades(lotes.length)
        setUnidadesActivas(lotes.filter(l => (Number(l.volumen_acumulado) || 0) > 0).length)

        // 2. Agrupar volumen por proyecto (ejecutado real)
        const proyMap: Record<string, { nombre: string, ejecutado: number }> = {}
        lotes.forEach(l => {
          const pid = l.proyecto_id
          const nombre = (l.proyectos as any)?.nombre || pid
          if (!proyMap[pid]) proyMap[pid] = { nombre, ejecutado: 0 }
          proyMap[pid].ejecutado += Number(l.volumen_acumulado) || 0
        })
        setProyectosData(Object.values(proyMap))
      }

      // 3. Avances por rubro (últimos 30 días)
      const { data: avances } = await supabase
        .from('avances_diarios')
        .select('rubro_id, volumen_dia, rubros(nombre)')
        .eq('estado', 'finalizado')

      if (avances && avances.length > 0) {
        const rubroMap: Record<string, { nombre: string, total: number }> = {}
        avances.forEach(a => {
          const rid = a.rubro_id
          const nombre = (a.rubros as any)?.nombre || 'Sin nombre'
          if (!rubroMap[rid]) rubroMap[rid] = { nombre, total: 0 }
          rubroMap[rid].total += Number(a.volumen_dia) || 0
        })
        const rubrosList = Object.values(rubroMap).sort((a, b) => b.total - a.total)
        setRubrosData(rubrosList)
      }

      setLoading(false)
    }
    fetchAll()
  }, [supabase])

  if (loading) return <div className="p-20 text-center font-bold text-slate-300 animate-pulse">Cargando métricas...</div>

  // Contratista → su vista de campo (la antigua del fiscalizador)
  if (role === 'contratista') {
    return <FiscalizadorDashboard />
  }

  const isExecutive = ['administrador', 'admin', 'contraloria', 'supervisor'].includes(role)

  // Calcular eficiencia global
  const eficienciaPct = totalUnidades > 0 ? Math.round((unidadesActivas / totalUnidades) * 100) : 0

  // Máximo m³ entre proyectos para barras proporcionales
  const maxVol = proyectosData.length > 0 ? Math.max(...proyectosData.map(p => p.ejecutado)) : 1
  // Máximo m³ entre rubros para barras proporcionales
  const maxRubroVol = rubrosData.length > 0 ? Math.max(...rubrosData.map(r => r.total)) : 1

  // Encontrar proyecto con más y menos avance
  const sortedProyectos = [...proyectosData].sort((a, b) => b.ejecutado - a.ejecutado)
  const proyectoMas = sortedProyectos[0] || { nombre: 'N/A', ejecutado: 0 }
  const proyectoMenos = sortedProyectos.length > 1 ? sortedProyectos[sortedProyectos.length - 1] : { nombre: 'N/A', ejecutado: 0 }

  return (
    <div className="space-y-12 pb-20">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-3 block opacity-70">
             CENTRO DE INTELIGENCIA ESTRATÉGICA
           </label>
           <h1 className="text-5xl font-black text-[#0f172a] tracking-tight mb-2">
             Centro de Mando
           </h1>
           <p className="text-slate-500 font-medium text-lg max-w-2xl">
             Visión panorámica de la ejecución volumétrica y eficiencia de los frentes de obra.
           </p>
        </div>
      </div>

      {/* SOLO 3 INDICADORES SOLICITADOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            label: 'Proyectos Activos', 
            val: String(proyectosData.length), 
            sub: 'En ejecución técnica', 
            icon: HardHat, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
          },
          { 
            label: 'Proyecto con más avance', 
            val: proyectoMas.nombre, 
            sub: 'Líder en ejecución', 
            icon: ArrowUpRight, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
          },
          { 
            label: 'Proyecto con menos avance', 
            val: proyectoMenos.nombre, 
            sub: 'Requiere atención', 
            icon: Activity, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50' 
          },
        ].map((kpi, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={kpi.label} 
            className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
             <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <kpi.icon className="w-6 h-6" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{kpi.label}</p>
             <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">{kpi.val}</h3>
             <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                {kpi.sub}
             </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
