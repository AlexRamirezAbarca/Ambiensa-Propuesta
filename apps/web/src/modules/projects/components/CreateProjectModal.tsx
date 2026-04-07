'use client'

import { useState } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Building2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    nombre: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('proyectos')
        .insert({
          nombre: formData.nombre,
          estado: true
        })

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({ nombre: '' })
        onSuccess()
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Error creating project:', err)
      alert('Error al crear el proyecto. Verifica los permisos.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nueva Urbanización">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h4 className="text-xl font-bold text-slate-800">¡Proyecto Registrado!</h4>
           <p className="text-slate-500 text-sm mt-1">La información se ha guardado correctamente.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
           <Input 
              label="Nombre del Proyecto" 
              name="nombre" 
              placeholder="Ej: Urbanización Málaga 2" 
              value={formData.nombre} 
              onChange={handleChange} 
              icon={<Building2 className="w-4 h-4" />}
              required 
           />

           <div className="pt-4 flex gap-3">
             <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={isLoading}>
               Cancelar
             </Button>
             <Button type="submit" fullWidth isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
               Guardar Proyecto
             </Button>
           </div>
        </form>
      )}
    </Modal>
  )
}
