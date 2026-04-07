'use client'

import { useState } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DeleteProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  proyecto: any
}

export function DeleteProjectModal({ isOpen, onClose, onSuccess, proyecto }: DeleteProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  if (!proyecto) return null

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('proyectos')
        .delete()
        .eq('id', proyecto.id)

      if (error) throw error
      onSuccess()
    } catch (err) {
      console.error('Error deleting project:', err)
      alert('Error en la base de datos al eliminar el proyecto.')
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Eliminar Proyecto">
      <div className="flex flex-col items-center text-center pb-6 pt-4">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-bold text-slate-800 mb-2">¿Estás absolutamente seguro?</h4>
        <p className="text-slate-500 text-sm">
          Esta acción no se puede deshacer. Se eliminará el proyecto <span className="font-extrabold text-[#0f172a]">{proyecto.nombre}</span> y todos sus lotes, avances y datos asociados de forma permanente.
        </p>
      </div>
      <div className="flex gap-3 pt-6 border-t border-slate-100">
        <Button type="button" onClick={onClose} variant="secondary" fullWidth disabled={isLoading}>
          Cancelar
        </Button>
        <Button onClick={handleDelete} fullWidth isLoading={isLoading} className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200">
          Sí, Eliminar Proyecto
        </Button>
      </div>
    </Modal>
  )
}
