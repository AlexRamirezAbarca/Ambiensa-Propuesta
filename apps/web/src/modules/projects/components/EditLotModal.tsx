'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { Users, Search, CheckCircle2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface EditLotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lot: any
}

export function EditLotModal({ isOpen, onClose, onSuccess, lot }: EditLotModalProps) {
  const [fiskSearch, setFiskSearch] = useState('')
  const [fiscalizadores, setFiscalizadores] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState(lot?.id_fiscalizador || '')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchFiscalizadores = async () => {
      const { data } = await supabase
        .from('usuarios')
        .select('id, nombres, roles!inner(nombre)')
        .eq('roles.nombre', 'fiscalizador')
        .eq('estado', true)
      if (data) setFiscalizadores(data)
    }
    if (isOpen) {
      fetchFiscalizadores()
      setSelectedId(lot?.id_fiscalizador || '')
    }
  }, [isOpen, lot, supabase])

  const filteredFisk = fiscalizadores.filter(f => 
    f.nombres.toLowerCase().includes(fiskSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('lotes_unidades')
        .update({ id_fiscalizador: selectedId || null })
        .eq('id', lot.id)

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Error reassigning lot:', err)
      alert('Error al reasignar el fiscalizador.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!lot) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reasignar Responsable">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h4 className="text-xl font-bold text-slate-800">¡Asignación Actualizada!</h4>
           <p className="text-slate-500 text-sm mt-1">El nuevo fiscalizador ha sido vinculado.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
           
           {/* Info Bloqueada */}
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <MapPin className="w-5 h-5" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase leading-none">Unidad</p>
                    <p className="text-sm font-black text-slate-800">MZ {lot.mz} - Villa {lot.villa}</p>
                 </div>
              </div>
              <span className="px-2 py-1 bg-slate-200 text-[10px] font-black text-slate-500 rounded uppercase">Bloqueado</span>
           </div>

           {/* Buscador de Fiscalizadores */}
           <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" /> Nuevo Fiscalizador
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="Buscar fiscalizador..." 
                  value={fiskSearch}
                  onChange={(e) => setFiskSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all mb-2"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => setSelectedId('')}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedId === '' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Sin asignar
                </button>
                {filteredFisk.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedId(f.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedId === f.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {f.nombres}
                  </button>
                ))}
              </div>
           </div>

           <div className="pt-4 flex gap-3">
             <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={isLoading}>
               Cancelar
             </Button>
             <Button type="submit" fullWidth isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
               Actualizar Responsable
             </Button>
           </div>
        </form>
      )}
    </Modal>
  )
}
