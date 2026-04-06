import { Users, ClipboardCheck, Building2, TrendingUp } from 'lucide-react'

const metrics = [
  { label: 'Colaboradores Activos', value: '—', icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', note: 'Consultando...' },
  { label: 'Fiscalizaciones', value: '—', icon: ClipboardCheck, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600', note: 'Consultando...' },
  { label: 'Urbanizaciones', value: '—', icon: Building2, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', note: 'Consultando...' },
  { label: 'Reportes del Mes', value: '—', icon: TrendingUp, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600', note: 'Consultando...' },
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
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center min-h-[200px] text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
             <TrendingUp className="w-6 h-6 text-slate-300" />
          </div>
          <h2 className="font-bold text-slate-800">Actividad del Sistema</h2>
          <p className="text-slate-400 text-sm max-w-xs mt-1">No hay eventos recientes que mostrar en este momento.</p>
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
