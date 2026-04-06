'use client'

import { useState } from 'react'
import { ProjectList } from '@/modules/projects/components/ProjectList'
import { CreateProjectForm } from '@/modules/projects/components/CreateProjectForm'
import { Building2, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/shared/components/Button'

export default function ProyectosPage() {
  const [view, setView] = useState<'list' | 'create'>('list')

  return (
    <div className="pb-10 space-y-8">
      {/* Header Dinámico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center">
               <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {view === 'create' ? 'Nueva Urbanización' : 'Gestión de Proyectos'}
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
             {view === 'create' 
               ? 'Completa los datos para registrar un nuevo proyecto y sus lotes.' 
               : 'Visualiza y gestiona las urbanizaciones y sus unidades responsables.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {view === 'create' ? (
            <Button 
              variant="outline" 
              onClick={() => setView('list')}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver al Listado
            </Button>
          ) : (
            <Button 
              onClick={() => setView('create')} 
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Proyecto
            </Button>
          )}
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {view === 'create' ? (
          <CreateProjectForm onProjectCreated={() => setView('list')} />
        ) : (
          <ProjectList onAddNew={() => setView('create')} />
        )}
      </div>
    </div>
  )
}
