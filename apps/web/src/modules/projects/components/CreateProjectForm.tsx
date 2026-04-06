'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Building2, Plus, Trash2, UserCheck, MapPin, AlignLeft } from 'lucide-react'

interface Fiscalizador {
  id: string
  nombres: string
  email: string
}

interface Lote {
  calle: string
  mz: string
  villa: string
  id_fiscalizador: string
}

interface CreateProjectFormProps {
  onProjectCreated?: () => void
}

export function CreateProjectForm({ onProjectCreated }: CreateProjectFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ubicacion: ''
  })
  
  const [lotes, setLotes] = useState<Lote[]>([
    { calle: '', mz: '', villa: '', id_fiscalizador: '' }
  ])
  
  const [fiscalizadores, setFiscalizadores] = useState<Fiscalizador[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingFisc, setIsFetchingFisc] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const fetchFiscalizadores = async () => {
      try {
        const response = await fetch('/api/projects/fiscalizadores')
        const data = await response.json()
        if (Array.isArray(data)) {
          setFiscalizadores(data)
        }
      } catch (err) {
        console.error('Error fetching fiscalizadores:', err)
      } finally {
        setIsFetchingFisc(false)
      }
    }
    fetchFiscalizadores()
  }, [])

  const handleProjectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLoteChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const updatedLotes = [...lotes]
    updatedLotes[index] = { ...updatedLotes[index], [name]: value }
    setLotes(updatedLotes)
  }

  const addLote = () => {
    setLotes([...lotes, { calle: '', mz: '', villa: '', id_fiscalizador: '' }])
  }

  const removeLote = (index: number) => {
    if (lotes.length === 1) return
    setLotes(lotes.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    if (!formData.nombre.trim()) { setErrorMsg('El nombre de la urbanización es obligatorio.'); return }
    if (lotes.some(l => !l.id_fiscalizador)) { setErrorMsg('Todos los lotes deben tener un fiscalizador asignado.'); return }

    setIsLoading(true)
    try {
      // 1. Crear Proyecto
      const projResponse = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const project = await projResponse.json()

      if (!projResponse.ok) throw new Error(project.message || 'Error al crear el proyecto.')

      // 2. Crear Lotes
      const lotesResponse = await fetch(`/api/projects/${project.id}/lotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotes })
      })

      if (!lotesResponse.ok) throw new Error('Error al registrar los lotes.')

      setIsSuccess(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center p-10 bg-white rounded-3xl border border-slate-100 shadow-xl max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
           <Building2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Proyecto Creado!</h2>
        <p className="text-slate-500 mb-8">La urbanización y sus unidades han sido registradas correctamente.</p>
        <Button onClick={() => onProjectCreated?.()} className="bg-slate-900 hover:bg-slate-800 px-8">
          Volver a Proyectos
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 sm:p-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
          <Building2 className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Nueva Urbanización</h2>
          <p className="text-slate-400 text-sm">Define el proyecto padre y sus unidades hijas responsables.</p>
        </div>
      </div>

      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 text-center">
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Info General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input label="Nombre de la Urbanización" name="nombre" placeholder="Ej: Málaga 2" value={formData.nombre} onChange={handleProjectChange} icon={<Building2 className="w-4 h-4" />} required />
          <Input label="Ubicación" name="ubicacion" placeholder="Ej: Vía a Salitre, Km 12" value={formData.ubicacion} onChange={handleProjectChange} icon={<MapPin className="w-4 h-4" />} />
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" /> Descripción
            </label>
            <textarea 
               name="descripcion" 
               rows={3} 
               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
               placeholder="Breve descripción del proyecto..."
               value={formData.descripcion}
               onChange={handleProjectChange}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Configuración de Lotes / Unidades
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addLote} className="text-xs border-slate-200 text-slate-600 hover:bg-slate-50">
              <Plus className="w-3 h-3 mr-1" /> Añadir Unidad
            </Button>
          </div>

          <div className="space-y-4">
            {lotes.map((lote, index) => (
              <motion.div layout key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl relative group border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-lg transition-all duration-300">
                <Input size="sm" label="Calle" name="calle" value={lote.calle} onChange={(e) => handleLoteChange(index, e)} />
                <Input size="sm" label="MZ" name="mz" value={lote.mz} onChange={(e) => handleLoteChange(index, e)} />
                <Input size="sm" label="Villa" name="villa" value={lote.villa} onChange={(e) => handleLoteChange(index, e)} />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Fiscalizador</label>
                  <select
                    name="id_fiscalizador"
                    value={lote.id_fiscalizador}
                    onChange={(e) => handleLoteChange(index, e)}
                    className="h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>Asignar responsable</option>
                    {fiscalizadores.map(f => (
                      <option key={f.id} value={f.id}>{f.nombres}</option>
                    ))}
                  </select>
                </div>

                {lotes.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeLote(index)}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-red-100 text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-all scale-0 group-hover:scale-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <Button 
           type="submit" 
           fullWidth 
           isLoading={isLoading} 
           disabled={fiscalizadores.length === 0}
           className="bg-blue-600 hover:bg-blue-700 py-4 shadow-xl shadow-blue-500/20 font-bold text-base"
        >
          {fiscalizadores.length === 0 ? 'No hay fiscalizadores disponibles' : 'Confirmar y Crear Proyecto'}
        </Button>
        {fiscalizadores.length === 0 && !isFetchingFisc && (
          <p className="text-center text-red-500 text-xs font-bold uppercase tracking-widest mt-2 animate-pulse">
            Debes registrar al menos un fiscalizador activo antes de crear proyectos.
          </p>
        )}
      </form>
    </div>
  )
}
