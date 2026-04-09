'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { CheckCircle2, Circle, Search, LayoutList } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatusModal, StatusType } from '@/shared/components/StatusModal'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userProfile: any
}

export function PlanificarJornadaModal({ isOpen, onClose, onSuccess, userProfile }: Props) {
  const [assignedRubros, setAssignedRubros] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusModal, setStatusModal] = useState<{isOpen: boolean, title: string, message: string, type: StatusType}>({
    isOpen: false, title: '', message: '', type: 'info'
  })
  
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchAvailableRubros()
    }
  }, [isOpen])

  const fetchAvailableRubros = async () => {
    try {
      setIsFetching(true)
      // Traemos todos los rubros asignados al contratista
      const { data, error } = await supabase
        .from('proyecto_presupuesto')
        .select('*, proyectos(nombre)')
        .eq('contratista_id', userProfile.id)
        .order('rubro', { ascending: true })

      if (error) throw error
      setAssignedRubros(data || [])
    } catch (err) {
      console.error('Error fetching rubros for planning:', err)
    } finally {
      setIsFetching(false)
    }
  }

  const toggleRubro = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleGuardarPlanificacion = async () => {
    if (selectedIds.length === 0) {
      setStatusModal({
        isOpen: true,
        title: 'Selección Vacía',
        message: 'Por favor, selecciona al menos un rubro para planificar tu jornada.',
        type: 'info'
      })
      return
    }

    setIsLoading(true)
    try {
      // 1. Crear la Jornada Diaria
      const { data: jornada, error: jError } = await supabase
        .from('jornadas_diarias')
        .insert({
          contratista_id: userProfile.id,
          fecha: new Date().toISOString().split('T')[0],
          estado: 'abierta'
        })
        .select()
        .single()

      if (jError) throw jError

      // 2. Crear los items de la jornada
      const items = selectedIds.map(rid => ({
        jornada_id: jornada.id,
        proyecto_presupuesto_id: rid
      }))

      const { error: iError } = await supabase
        .from('jornada_items')
        .insert(items)

      if (iError) throw iError

      onSuccess()
    } catch (err: any) {
      setStatusModal({
        isOpen: true,
        title: 'Error de Planificación',
        message: 'No pudimos guardar tu jornada: ' + err.message,
        type: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredRubros = assignedRubros.filter(r => 
    r.rubro.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.proyectos?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Planificar Jornada de Trabajo">
      <div className="space-y-6 pt-2">
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-center gap-4">
           <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <LayoutList className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1">Paso 1: Selección</p>
              <h3 className="text-sm font-black text-indigo-900 leading-tight">Escoge los rubros que ejecutarás hoy</h3>
           </div>
        </div>

        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
           <input 
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
             placeholder="Buscar rubro o proyecto..." 
             className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
           />
        </div>

        <div className="max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
          {isFetching ? (
            <div className="py-10 text-center animate-pulse text-slate-300 font-bold">Cargando catálogo...</div>
          ) : filteredRubros.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-sm font-medium italic">No se encontraron rubros asignados.</div>
          ) : (
            filteredRubros.map(r => (
              <div 
                key={r.id} 
                onClick={() => toggleRubro(r.id)}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                  selectedIds.includes(r.id) 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-slate-50 bg-white hover:border-slate-200'
                }`}
              >
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{r.proyectos?.nombre}</p>
                    <h4 className="text-sm font-black text-slate-800 leading-tight mt-0.5">{r.rubro}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Meta: {Number(r.cantidad).toFixed(2)} {r.unidad}</p>
                 </div>
                 {selectedIds.includes(r.id) ? (
                   <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                 ) : (
                   <Circle className="w-5 h-5 text-slate-200" />
                 )}
              </div>
            ))
          )}
        </div>

        <div className="pt-4 flex flex-col gap-3">
           <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
              Has seleccionado {selectedIds.length} rubros para hoy
           </p>
           <Button 
             onClick={handleGuardarPlanificacion} 
             isLoading={isLoading} 
             disabled={selectedIds.length === 0}
             fullWidth 
             className="bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl shadow-xl shadow-indigo-100"
           >
             Arrancar Jornada Técnica
           </Button>
           <button onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2">
             Cancelar y Volver
           </button>
        </div>
      </div>

      <StatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({...prev, isOpen: false}))}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </Modal>
  )
}
