import { Users, ClipboardCheck, Building2, TrendingUp } from 'lucide-react'

const metrics = [
  { label: 'Colaboradores Activos', value: '0', icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', note: 'Total registrados' },
  { label: 'Fiscalizaciones', value: '0', icon: ClipboardCheck, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600', note: 'En progreso' },
  { label: 'Urbanizaciones', value: '0', icon: Building2, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', note: 'Activas' },
  { label: 'Reportes del Mes', value: '0', icon: TrendingUp, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600', note: 'Generados' },
]

export default function DashboardHomePage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Panel de Control</h1>
        <p className="text-slate-500 text-sm mt-1">Vista general del sistema Ambiensa ERP</p>
      </div>

      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 ${m.bg} rounded-xl flex items-center justify-center`}>
                <m.icon className={`w-5 h-5 ${m.text}`} />
              </div>
              <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">{m.note}</span>
            </div>
            <p className="text-3xl font-bold text-slate-800 leading-none mb-1">{m.value}</p>
            <p className="text-sm text-slate-500 font-medium">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Sección central de bienvenida */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Actividad Reciente */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-800">Actividad Reciente</h2>
            <span className="text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-full font-medium">Hoy</span>
          </div>
          <div className="space-y-4">
            {[
              { action: 'Sistema iniciado correctamente', time: 'Ahora mismo', dot: 'bg-green-400' },
              { action: 'Base de datos conectada a Supabase', time: 'Reciente', dot: 'bg-blue-400' },
              { action: 'Módulo de Seguridad activado', time: 'Al iniciar', dot: 'bg-violet-400' },
            ].map((ev, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">{ev.action}</p>
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0">{ev.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Info Admin */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg leading-tight mb-2">Ambiensa ERP</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sistema de gestión empresarial para inmuebles y urbanizaciones.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-500">Versión del sistema</p>
            <p className="text-sm font-semibold text-blue-400 mt-0.5">v1.0.0 — Entorno Dev</p>
          </div>
        </div>
      </div>
    </div>
  )
}
