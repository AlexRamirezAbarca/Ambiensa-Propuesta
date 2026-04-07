'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { FileSpreadsheet, AlertCircle, UploadCloud, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import * as XLSX from 'xlsx'

interface UploadBudgetModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectId: string
}

export function UploadBudgetModal({ isOpen, onClose, onSuccess, projectId }: UploadBudgetModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorObj, setErrorObj] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorObj(null)
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const workbook = XLSX.read(bstr, { type: 'binary' })
        const wsname = workbook.SheetNames[0]
        const ws = workbook.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws)
        setPreviewData(data)
      } catch (err) {
        setErrorObj('Error al leer el archivo Excel. Verifica el formato.')
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleSubmit = async () => {
    if (previewData.length === 0) return
    setIsLoading(true)
    setErrorObj(null)

    try {
      const rowsToInsert = previewData.map(row => {
        const findCol = (keywords: string[]) => {
           const key = Object.keys(row).find(k => keywords.some(kw => k.toLowerCase().includes(kw)))
           return key ? row[key] : null
        }
        
        return {
          proyecto_id: projectId,
          rubro: findCol(['rubro', 'nombre']) || 'Sin Rubro',
          descripcion: findCol(['descrip', 'detalle']) || '',
          unidad: findCol(['unidad', 'medida', 'ud', 'un']) || 'GLB',
          cantidad: parseFloat(findCol(['cantidad', 'cant']) || '0'),
          precio_unitario: parseFloat(findCol(['precio', 'unitario']) || '0'),
          tiempo_dias: parseInt(findCol(['tiempo', 'dias', 'plazo']) || '0')
        }
      })

      const { error } = await supabase
        .from('proyecto_presupuesto')
        .insert(rowsToInsert)

      if (error) throw error

      setIsSuccess(true)
      setTimeout(() => {
         setIsSuccess(false)
         setFile(null)
         setPreviewData([])
         onSuccess()
         onClose()
      }, 2000)

    } catch (err: any) {
      console.error(err)
      setErrorObj(err.message || 'Error al procesar y subir los datos de la base central.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cargar Configuración de Presupuesto">
      {isSuccess ? (
        <div className="flex flex-col items-center py-12 text-center animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
             <CheckCircle2 className="w-10 h-10" />
           </div>
           <h4 className="text-xl font-bold text-slate-800">¡Presupuesto Subido Exitosamente!</h4>
           <p className="text-slate-500 text-sm mt-1">Se registraron {previewData.length} rubros a este proyecto.</p>
        </div>
      ) : (
        <div className="space-y-6">
           {!file ? (
             <div 
               onClick={() => fileInputRef.current?.click()}
               className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
             >
                <div className="w-16 h-16 bg-slate-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 mx-auto mb-4 transition-colors">
                   <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 mb-1">Haz clic para subir documento Excel</h4>
                <p className="text-xs text-slate-400">Columnas recomendadas: Rubro, Descripción, Unidad, Cantidad, Precio Unitario, Tiempo en Dias</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".xlsx, .xls, .csv" 
                  className="hidden" 
                />
             </div>
           ) : (
             <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                     <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-800">{file.name}</p>
                     <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">{previewData.length} FILAS LEÍDAS</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setPreviewData([]); setErrorObj(null); }} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                  Quitar Archivo
                </button>
             </div>
           )}

           {errorObj && (
             <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errorObj}
             </div>
           )}

           <div className="flex gap-3 pt-4 border-t border-slate-100">
             <Button type="button" variant="secondary" fullWidth onClick={onClose} disabled={isLoading}>
               Cancelar
             </Button>
             <Button onClick={handleSubmit} fullWidth isLoading={isLoading} disabled={!file || previewData.length === 0} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
               Confirmar Carga
             </Button>
           </div>
        </div>
      )}
    </Modal>
  )
}
