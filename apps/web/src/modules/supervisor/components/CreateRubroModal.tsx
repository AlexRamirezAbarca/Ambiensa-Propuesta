'use client'

import { useState } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { ClipboardList, Type, Ruler, Tags, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CreateRubroModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateRubroModal({ isOpen, onClose, onSuccess }: CreateRubroModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Obra Gris',
    unidad_medida: 'm3'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  const hangleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('rubros')
        .insert(formData)

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({ nombre: '', descripcion: '', categoria: 'Obra Gris', unidad_medida: 'm3' })
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Error creating rubro:', err)
      alert('Error al crear el rubro. Es posible que el nombre ya exista.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Rubro Técnico">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h4 className="text-xl font-bold text-slate-800">¡Rubro Creado!</h4>
           <p className="text-slate-500 text-sm mt-1">Se ha añadido al catálogo maestro.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
           <Input 
             label="Nombre del Rubro" 
             name="nombre" 
             placeholder="Ej: Excavación" 
             value={formData.nombre} 
             onChange={hangleChange}
             icon={<ClipboardList className="w-4 h-4" />}
             required 
           />

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Tags className="w-3 h-3" /> Categoría
                </label>
                <select 
                  name="categoria" 
                  value={formData.categoria} 
                  onChange={hangleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option>Obra Gris</option>
                  <option>Movimiento de Tierras</option>
                  <option>Instalaciones</option>
                  <option>Acabados</option>
                  <option>Exteriores</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                  <Ruler className="w-3 h-3" /> Unidad
                </label>
                <select 
                  name="unidad_medida" 
                  value={formData.unidad_medida} 
                  onChange={hangleChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option>m3</option>
                  <option>m2</option>
                  <option>ml</option>
                  <option>Un</option>
                  <option>GLB</option>
                  <option>Puntos</option>
                </select>
              </div>
           </div>

           <div className="space-y-1.5">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-2">
               <Type className="w-3 h-3" /> Descripción
             </label>
             <textarea 
               name="descripcion" 
               rows={2} 
               value={formData.descripcion}
               onChange={hangleChange}
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
               placeholder="Detalles sobre el proceso de este rubro..."
             />
           </div>

           <div className="pt-4 flex gap-3">
             <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={isLoading}>
               Cancelar
             </Button>
             <Button type="submit" fullWidth isLoading={isLoading} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
               Crear Rubro
             </Button>
           </div>
        </form>
      )}
    </Modal>
  )
}
