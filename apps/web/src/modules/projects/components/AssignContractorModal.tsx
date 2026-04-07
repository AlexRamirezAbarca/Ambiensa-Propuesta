'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { UserPlus, Search, HardHat, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AssignContractorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  rubro: any
}

export function AssignContractorModal({ isOpen, onClose, onSuccess, rubro }: AssignContractorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [contractors, setContractors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchContractors()
      setSelected(rubro?.contratista_id || null)
    }
  }, [isOpen, rubro])

  const fetchContractors = async () => {
    setIsFetching(true)
    try {
      const { data: roleData } = await supabase.from('roles').select('id').eq('nombre', 'contratista').single()
      if (roleData) {
        const { data: users } = await supabase.from('usuarios').select('*').eq('role_id', roleData.id)
        if (users) setContractors(users)
      }
    } catch (err) {
      console.error('Error fetching contractors:', err)
    } finally {
      setIsFetching(false)
    }
  }

  const handleAssign = async () => {
    if (!selected || !rubro) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('proyecto_presupuesto')
        .update({ contratista_id: selected })
        .eq('id', rubro.id)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error assigning contractor:', err)
      alert('Error al asignar el contratista. Verifica los permisos.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!rubro) return null

  const filtered = contractors.filter(c => 
    c.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cedula?.includes(searchTerm)
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asignar Contratista">
      <div className="flex flex-col mb-6 pt-4">
        <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Rubro Seleccionado</h4>
        <p className="text-lg font-black text-slate-800">{rubro.rubro}</p>
        <p className="text-xs font-bold text-slate-400 mt-1 line-clamp-1">{rubro.descripcion}</p>
      </div>

      <div className="relative mb-6">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
         <input 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           placeholder="Buscar contratista por nombre o identificador..." 
           className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
         />
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-8 custom-scrollbar">
         {isFetching ? (
           <p className="text-center text-xs font-bold text-slate-400 py-10">Cargando contratistas de la base de datos...</p>
         ) : filtered.length === 0 ? (
           <p className="text-center text-xs font-bold text-slate-400 py-10">No se encontraron contratistas.</p>
         ) : (
           filtered.map(c => (
             <div 
               key={c.id} 
               onClick={() => setSelected(c.id)}
               className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                 selected === c.id 
                   ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                   : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
               }`}
             >
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected === c.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <HardHat className="w-5 h-5" />
                   </div>
                   <div>
                      <p className={`text-sm font-black ${selected === c.id ? 'text-indigo-900' : 'text-slate-700'}`}>{c.nombres}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${selected === c.id ? 'text-indigo-500' : 'text-slate-400'}`}>
                         ID: {c.cedula || 'N/A'}
                      </p>
                   </div>
                </div>
                {selected === c.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
             </div>
           ))
         )}
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-100">
        <Button onClick={onClose} variant="secondary" fullWidth disabled={isLoading}>
          Cancelar
        </Button>
        <Button 
          onClick={handleAssign} 
          fullWidth 
          isLoading={isLoading}
          disabled={!selected || isFetching}
          className="bg-[#0f172a] hover:bg-slate-800 shadow-xl shadow-slate-200"
        >
          <UserPlus className="w-4 h-4 mr-2" /> Víncular al Rubro
        </Button>
      </div>
    </Modal>
  )
}
