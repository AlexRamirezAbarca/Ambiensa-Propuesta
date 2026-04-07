'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Camera, MapPin, Calculator, LocateFixed } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  isOpen: boolean
  onClose: () => void
  task: any // proyecto_presupuesto row
  userProfile: any
}

export function PlanillaDiariaModal({ isOpen, onClose, task, userProfile }: Props) {
  const [activePlanilla, setActivePlanilla] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const supabase = createClient()

  // Formulario Inicio
  const [mz, setMz] = useState('')
  const [villa, setVilla] = useState('')
  const [calle, setCalle] = useState('')
  const [absInicio, setAbsInicio] = useState('')
  const [fotoInicio, setFotoInicio] = useState<string | null>(null)

  // Formulario Fin
  const [longitud, setLongitud] = useState('')
  const [ancho, setAncho] = useState('')
  const [altura, setAltura] = useState('')
  const [fotoFin, setFotoFin] = useState<string | null>(null)

  const inputFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && task) {
      checkActivePlanilla()
    } else {
      resetForms()
    }
  }, [isOpen, task])

  const checkActivePlanilla = async () => {
    setIsFetching(true)
    try {
      const { data, error } = await supabase
        .from('avances_diarios')
        .select('*')
        .eq('proyecto_presupuesto_id', task.id)
        .eq('contratista_id', userProfile.id)
        .eq('estado', 'iniciado')
        .single() // Solo puede haber un día abierto por tarea a la vez

      if (data) {
        setActivePlanilla(data)
      } else {
        // No hay planilla abierta, vamos a buscar si hay una anterior para pre-llenar abscisa
        const { data: lastAvance } = await supabase
          .from('avances_diarios')
          .select('abs_fin')
          .eq('proyecto_presupuesto_id', task.id)
          .eq('estado', 'finalizado')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (lastAvance?.abs_fin) setAbsInicio(String(lastAvance.abs_fin))
        setActivePlanilla(null)
      }
    } catch (err) {
      console.log('No activa:', err)
    } finally {
      setIsFetching(false)
    }
  }

  const resetForms = () => {
    setMz(''); setVilla(''); setCalle(''); setAbsInicio(''); setFotoInicio(null)
    setLongitud(''); setAncho(''); setAltura(''); setFotoFin(null)
    setActivePlanilla(null)
  }

  const capturePhotoBase64 = (e: React.ChangeEvent<HTMLInputElement>, isInicio: boolean) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const b64 = reader.result as string
      if (isInicio) setFotoInicio(b64)
      else setFotoFin(b64)
    }
    reader.readAsDataURL(file)
  }

  const getGeoLocation = (): Promise<any> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ error: 'GEO_NOT_SUPPORTED', lat: 0, lng: 0 })
        return
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, ts: new Date().toISOString() }),
        (err) => resolve({ error: err.message, lat: 0, lng: 0 }),
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  const handleIniciarDia = async () => {
    if (!mz || !villa || !calle || !absInicio || !fotoInicio) {
      alert('Debes completar abcsisa, Mz, Villa, Calle y adjuntar la FOTO de evidencia.')
      return
    }
    setIsLoading(true)
    const gps = await getGeoLocation()
    
    try {
      const { error } = await supabase.from('avances_diarios').insert({
        proyecto_presupuesto_id: task.id,
        contratista_id: userProfile.id,
        mz, villa, calle,
        abs_inicio: Number(absInicio),
        foto_inicio_b64: fotoInicio,
        gps_inicio: gps,
        estado: 'iniciado'
      })
      if (error) throw error
      checkActivePlanilla() // Recargar fase 2
    } catch (err: any) {
      alert('Error iniciando planilla: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalizarDia = async () => {
    if (!longitud || !ancho || !altura || !fotoFin) {
      alert('Debes completar las medidas y tomar la FOTO final del trabajo.')
      return
    }
    setIsLoading(true)
    const gps = await getGeoLocation()
    
    const numL = Number(longitud)
    const numA = Number(ancho)
    const numH = Number(altura)
    const volumenCalculado = numL * numA * numH
    const absFinCalculada = Number(activePlanilla.abs_inicio) + numL

    try {
      const { error } = await supabase.from('avances_diarios').update({
        longitud: numL, ancho: numA, altura: numH,
        volumen_dia: volumenCalculado,
        abs_fin: absFinCalculada,
        foto_fin_b64: fotoFin,
        gps_fin: gps,
        estado: 'finalizado'
      }).eq('id', activePlanilla.id)

      if (error) throw error
      alert(`¡Jornada finalizada! Abscisa Fin: ${absFinCalculada} | Volumen: ${volumenCalculado.toFixed(2)} m³`)
      onClose()
    } catch (err: any) {
      alert('Error cerrando planilla: ' + err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activePlanilla ? "Finalizar Jornada" : "Iniciar Jornada"}>
      <div className="pt-4 pb-4 border-b border-slate-100 mb-6">
         <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{task.proyectos?.nombre}</h4>
         <p className="text-xl font-black text-slate-800 leading-tight">{task.rubro}</p>
      </div>

      {isFetching ? (
        <div className="py-10 text-center animate-pulse text-indigo-300 font-bold">Analizando estado de obra...</div>
      ) : !activePlanilla ? (
        // FORMULARIO: INICIAR DÍA
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <Input label="Abscisa de Inicio (Punto Partida)" type="number" placeholder="Ej: 0.00" value={absInicio} onChange={e => setAbsInicio(e.target.value)} required />
          
          <div className="grid grid-cols-2 gap-4">
             <Input label="Mz / Bloque" placeholder="Ej: 5" value={mz} onChange={e => setMz(e.target.value)} required />
             <Input label="Villa / Casa" placeholder="Ej: 14" value={villa} onChange={e => setVilla(e.target.value)} required />
          </div>
          <Input label="Calle o Ubicación Específica" placeholder="Calle principal..." value={calle} onChange={e => setCalle(e.target.value)} required />

          <div className="mt-6">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={inputFileRef} onChange={e => capturePhotoBase64(e, true)} />
            {fotoInicio ? (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-emerald-500">
                <img src={fotoInicio} className="w-full h-full object-cover" alt="previo" />
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[10px] px-2 py-1 rounded font-black flex items-center gap-1">
                  <LocateFixed className="w-3 h-3" /> GPS Tracking Activo
                </div>
              </div>
            ) : (
              <Button onClick={() => inputFileRef.current?.click()} variant="outline" fullWidth className="h-24 border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 flex flex-col items-center justify-center gap-2">
                <Camera className="w-6 h-6" /> Tomar Foto Mz {mz} (Requerido)
              </Button>
            )}
          </div>
          
          <Button onClick={handleIniciarDia} isLoading={isLoading} fullWidth className="bg-indigo-600 hover:bg-indigo-700 mt-6 shadow-indigo-200 shadow-xl h-14 text-sm tracking-wide">
             Arrancar Jornada
          </Button>
        </div>
      ) : (
        // FORMULARIO: FINALIZAR DÍA
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
               <MapPin className="w-4 h-4"/> 
               <span className="text-xs font-black">Mz {activePlanilla.mz} - V{activePlanilla.villa}</span>
            </div>
            <span className="text-[10px] bg-slate-200 px-2 py-1 rounded font-bold text-slate-600">Abs. Inicio: {activePlanilla.abs_inicio}</span>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calculator className="w-3 h-3" /> Datos Topográficos Finales
             </h4>
             <Input label="Longitud de avance (L)" type="number" placeholder="Metros (m)" value={longitud} onChange={e => setLongitud(e.target.value)} required />
             <div className="grid grid-cols-2 gap-4">
               <Input label="Ancho (A)" type="number" placeholder="Metros (m)" value={ancho} onChange={e => setAncho(e.target.value)} required />
               <Input label="Altura (H)" type="number" placeholder="Metros (m)" value={altura} onChange={e => setAltura(e.target.value)} required />
             </div>
             
             {/* Calculadora visual en vivo */}
             <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mt-2">
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1">Cálculo Automático (m³)</p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black text-indigo-900 leading-none">
                     { (Number(longitud || 0) * Number(ancho || 0) * Number(altura || 0)).toFixed(2) }
                  </span>
                  <span className="text-indigo-600 font-bold pb-1 text-sm">metros cúbicos</span>
                </div>
             </div>
          </div>

          <div className="mt-6">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={inputFileRef} onChange={e => capturePhotoBase64(e, false)} />
            {fotoFin ? (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-amber-500">
                <img src={fotoFin} className="w-full h-full object-cover" alt="previo" />
                <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[10px] px-2 py-1 rounded font-black flex items-center gap-1">
                  <LocateFixed className="w-3 h-3" /> Cierre GPS Registrado
                </div>
              </div>
            ) : (
              <Button onClick={() => inputFileRef.current?.click()} variant="outline" fullWidth className="h-24 border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-amber-400 hover:text-amber-600 flex flex-col items-center justify-center gap-2">
                <Camera className="w-6 h-6" /> Tomar Foto de Terminado
              </Button>
            )}
          </div>
          
          <Button onClick={handleFinalizarDia} disabled={!longitud || !ancho || !altura || !fotoFin} isLoading={isLoading} fullWidth className="bg-slate-900 hover:bg-black mt-6 shadow-slate-200 shadow-xl h-14 text-sm tracking-wide">
             Confirmar y Cargar Planilla
          </Button>
        </div>
      )}
    </Modal>
  )
}
