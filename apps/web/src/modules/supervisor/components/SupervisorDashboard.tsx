'use client'

import { Users, HardHat, TrendingUp, AlertTriangle } from 'lucide-react'

export function SupervisorDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Centro de Mando Web</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Resumen general de operaciones, trabajadores y proyectos activos.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tarjeta 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Fiscalizadores</p>
              <h3 className="text-4xl font-extrabold text-slate-900">12</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-500 font-bold flex items-center gap-1">
               ● 10 Activos
            </span>
            <span className="text-slate-400 font-medium ml-4">
               ● 2 Libres
            </span>
          </div>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Proyectos Activos</p>
              <h3 className="text-4xl font-extrabold text-slate-900">45</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <HardHat className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-slate-500 font-medium">
            Urbanizaciones: El Norte 1 & Sur 3
          </div>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Mejor Avance</p>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-none mt-1">Mz 4 Villa 2</h3>
              <p className="text-slate-400 text-xs font-medium mt-1">Urb. El Norte 1</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg font-bold">85% Avance</span>
          </div>
        </div>

        {/* Tarjeta 4 */}
        <div className="bg-white rounded-3xl p-6 border border-red-50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Mayor Retraso</p>
              <h3 className="text-2xl font-extrabold text-slate-900 leading-none mt-1">Mz 8 Villa 5</h3>
              <p className="text-slate-400 text-xs font-medium mt-1">Urb. Sur 3</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg font-bold">Alerta: 10% Avance</span>
          </div>
        </div>

      </div>

      {/* Gráficos / Tablas Centrales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Fiscalizadores - Gráfico Vacío */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-extrabold text-slate-900">Rendimiento de Fiscalizadores</h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">Ver Detalles</button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50 h-64">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold mb-1">Sin datos suficientes</p>
            <p className="text-slate-400 text-sm max-w-sm text-center">Asigna proyectos a los fiscalizadores y espera a que comiencen a reportar sus avances de obra para poblar esta gráfica.</p>
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-extrabold text-slate-900 mb-6">Actividad Reciente</h2>
          <div className="flex-1 overflow-auto pr-2 space-y-6">
            
            {/* Entry placeholder */}
            <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 ring-4 ring-white"></div>
              <p className="text-sm font-bold text-slate-800">Sistema Iniciado</p>
              <p className="text-xs font-medium text-slate-500 mt-1">El panel de control ha sido configurado para la administración de obras.</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">Hace un momento</p>
            </div>

            {/* Entry placeholder */}
            <div className="relative pl-6 border-l-2 border-slate-100 pb-2">
              <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[7px] top-1 ring-4 ring-white"></div>
              <p className="text-sm font-bold text-slate-800">Esperando asignaciones</p>
              <p className="text-xs font-medium text-slate-500 mt-1">Ve al módulo de proyectos para configurar las villas y manzanas a tus fiscalizadores.</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">--</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
