import { ClipboardList, AlertCircle, Clock } from 'lucide-react'

export const metadata = {
  title: 'Operaciones | Ambiensa ERP',
  description: 'Panel de herramientas en campo',
}

export default function OperacionesDashboardPage() {
  return (
    <div className="space-y-6 fade-in pb-8">
      
      {/* Saludo y Resumen rápido */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-[#0f172a]">Hola, Equipo Operativo</h1>
          <p className="text-sm text-slate-500 font-medium">Tienes 3 tareas urgentes hoy.</p>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Acciones Rápidas</h2>

      {/* Grid de acciones rápidas (Optimizado para Touch) */}
      <div className="grid grid-cols-2 gap-4">
        <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 active:scale-95 transition-transform">
          <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700">Inspecciones</span>
        </button>
        
        <button className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 active:scale-95 transition-transform">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-slate-700">Reportar</span>
        </button>
      </div>

      {/* Tareas Pendientes UI (Placeholder) */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Agenda de Hoy</h2>
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-50 flex items-center gap-4">
            <div className="w-2 h-10 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-bold text-slate-800">Manzana 14 - Villa 22</p>
              <p className="text-xs text-slate-400">Inspección de Obra Gris</p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-4 bg-slate-50/50">
            <div className="w-2 h-10 bg-slate-300 rounded-full"></div>
            <div>
              <p className="text-sm font-bold text-slate-800">Manzana 08 - Villa 05</p>
              <p className="text-xs text-slate-400">Revisión de Acabados</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
