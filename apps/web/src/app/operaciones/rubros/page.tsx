'use client'

import { useState } from 'react'
import { RubrosCatalog } from '@/modules/supervisor/components/RubrosCatalog'
import { CreateRubroModal } from '@/modules/supervisor/components/CreateRubroModal'
import { ClipboardList, Plus, Info } from 'lucide-react'
import { Button } from '@/shared/components/Button'

export default function RubrosPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="pb-10 space-y-8">
      
      {/* Header Dinámico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center">
               <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Catalogo de Rubros</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
             Maestro técnico de actividades y tareas para el control de inspecciones.
          </p>
        </div>

        <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Rubro
            </Button>
        </div>
      </div>

      {/* Info Banner para Demo */}
      <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-3xl flex items-start gap-3">
         <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
           <Info className="w-4 h-4" />
         </div>
         <div className="text-xs font-medium text-blue-700 mt-0.5">
           <p className="font-bold mb-1">Modo Demo Activado</p>
           <p className="opacity-80">Como Supervisor, puedes gestionar los 360+ rubros aquí. Para la demostración inicial, hemos cargado el rubro de <strong>Excavación</strong>.</p>
         </div>
      </div>

      {/* Catálogo Listado */}
      <div key={refreshKey} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <RubrosCatalog />
      </div>

      {/* Modal de Creación */}
      <CreateRubroModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleSuccess} 
      />

    </div>
  )
}
