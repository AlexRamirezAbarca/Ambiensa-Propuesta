'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { Hash, MapPin, Users, Info, CheckCircle2, Navigation, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

import { useRouter } from 'next/navigation'

interface BatchCreateLotsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
  projectName: string
  onSuccessRedirect?: string
}

export function BatchCreateLotsModal({ isOpen, onClose, onSuccess, projectId, projectName, onSuccessRedirect }: BatchCreateLotsModalProps) {
  const [formData, setFormData] = useState({
    mz: '',
    villa_inicio: 1,
    villa_fin: 10,
    calle: '',
    id_fiscalizador: '',
    absica_inicio: 0
  })
  const router = useRouter()
  const [fiscalizadores, setFiscalizadores] = useState<any[]>([])
  const [fiskSearch, setFiskSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchFiscalizadores = async () => {
      // Filtrar solo usuarios con el rol 'fiscalizador'
      const { data } = await supabase
        .from('usuarios')
        .select(`
          id, 
          nombres,
          roles!inner(nombre)
        `)
        .eq('roles.nombre', 'fiscalizador')
        .eq('estado', true)
      
      if (data) setFiscalizadores(data)
    }
    if (isOpen) fetchFiscalizadores()
  }, [isOpen, supabase])

  const filteredFisk = fiscalizadores.filter(f => 
    f.nombres.toLowerCase().includes(fiskSearch.toLowerCase())
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const lotes = []
      for (let i = Number(formData.villa_inicio); i <= Number(formData.villa_fin); i++) {
        lotes.push({
          proyecto_id: projectId,
          mz: formData.mz,
          villa: i.toString(),
          calle: formData.calle || null,
          id_fiscalizador: formData.id_fiscalizador || null,
          absica_inicio: Number(formData.absica_inicio),
          estado_avance: 0,
          detalles: {}
        })
      }

      const { error } = await supabase
        .from('lotes_unidades')
        .insert(lotes)

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        setFormData({ mz: '', villa_inicio: 1, villa_fin: 10, calle: '', id_fiscalizador: '', absica_inicio: 0 })
        onSuccess()
        if (onSuccessRedirect) {
          router.push(onSuccessRedirect)
        }
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Error batch creating lots:', err)
      alert('Error al crear los lotes en masa.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configurar Obra: ${projectName}`}>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h4 className="text-xl font-bold text-slate-800">¡Lotes Generados!</h4>
           <p className="text-slate-500 text-sm mt-1">Se han inyectado {Number(formData.villa_fin) - Number(formData.villa_inicio) + 1} unidades correctamente.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
           
           <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                Esta herramienta creará automáticamente múltiples registros. Asegúrate de que el rango sea correcto para evitar duplicados.
              </p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Manzana (MZ)" 
                name="mz" 
                placeholder="Ej: 14" 
                value={formData.mz} 
                onChange={handleChange} 
                icon={<MapPin className="w-4 h-4" />}
                required 
              />
              <Input 
                label="Abscisa Inicio (Km 0)" 
                name="absica_inicio" 
                type="number"
                step="0.001"
                placeholder="Ej: 0.000" 
                value={formData.absica_inicio} 
                onChange={handleChange} 
                icon={<Hash className="w-4 h-4 text-indigo-400" />}
                required
              />
           </div>

           <Input 
             label="Nombre de Calle" 
             name="calle" 
             placeholder="Ej: Transversal 5" 
             value={formData.calle} 
             onChange={handleChange} 
             icon={<Navigation className="w-4 h-4" />}
           />

           <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Villa Desde" 
                name="villa_inicio" 
                type="number"
                value={formData.villa_inicio} 
                onChange={handleChange} 
                icon={<Hash className="w-4 h-4" />}
                required 
              />
              <Input 
                label="Villa Hasta" 
                name="villa_fin" 
                type="number"
                value={formData.villa_fin} 
                onChange={handleChange} 
                icon={<Hash className="w-4 h-4" />}
                required 
              />
           </div>

           <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" /> Fiscalizador Responsable (Opcional)
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Filtrar fiscalizador por nombre..." 
                  value={fiskSearch}
                  onChange={(e) => setFiskSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mb-2"
                />
              </div>
              <select 
                name="id_fiscalizador" 
                value={formData.id_fiscalizador}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
              >
                <option value="">Sin asignar (Por definir después)</option>
                {filteredFisk.map(f => (
                  <option key={f.id} value={f.id}>{f.nombres}</option>
                ))}
              </select>
           </div>

           <div className="pt-4 flex gap-3">
             <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={isLoading}>
               Cancelar
             </Button>
             <Button type="submit" fullWidth isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
               Generar Unidades
             </Button>
           </div>
        </form>
      )}
    </Modal>
  )
}
