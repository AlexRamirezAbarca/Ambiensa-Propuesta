'use client'

import { useState, useEffect, useRef } from 'react'
import { Modal } from '@/shared/components/Modal'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { Camera, MapPin, Calculator, LocateFixed } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { StatusModal, StatusType } from '@/shared/components/StatusModal'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  task: any // proyecto_presupuesto row + jornada_id
  userProfile: any
}

export function PlanillaDiariaModal({ isOpen, onClose, onSuccess, task, userProfile }: Props) {
  const [activePlanilla, setActivePlanilla] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [statusModal, setStatusModal] = useState<{isOpen: boolean, title: string, message: string, type: StatusType}>({
    isOpen: false, title: '', message: '', type: 'info'
  })
  const supabase = createClient()

  // Formulario Inicio
  const [mz, setMz] = useState('')
  const [villaDesde, setVillaDesde] = useState('')
  const [villaHasta, setVillaHasta] = useState('')
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
      let query = supabase
        .from('avances_diarios')
        .select('*')
        .eq('proyecto_presupuesto_id', task.id)
        .eq('contratista_id', userProfile.id)
        .eq('estado', 'iniciado')
      
      // Si venimos de una jornada específica, filtramos por ella
      if (task.jornada_id) {
        query = query.eq('jornada_id', task.jornada_id)
      }

      const { data, error } = await query.maybeSingle()

      if (data) {
        setActivePlanilla(data)
      } else {
        // No hay planilla abierta, pre-llenar abscisa con la última finalizada
        const { data: lastAvance } = await supabase
          .from('avances_diarios')
          .select('abs_fin')
          .eq('proyecto_presupuesto_id', task.id)
          .eq('estado', 'finalizado')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        
        if (lastAvance?.abs_fin) setAbsInicio(String(lastAvance.abs_fin))
        else setAbsInicio('0.000') // Valor inicial si no hay historial
        
        setActivePlanilla(null)
      }
    } catch (err) {
      console.log('Error checkActivePlanilla:', err)
    } finally {
      setIsFetching(false)
    }
  }

  const resetForms = () => {
    setMz(''); setVillaDesde(''); setVillaHasta(''); setCalle(''); setAbsInicio(''); setFotoInicio(null)
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
      // Alta precisión solicitada para entorno de obra
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude, 
          accuracy: pos.coords.accuracy,
          ts: new Date().toISOString() 
        }),
        (err) => resolve({ error: err.message, lat: 0, lng: 0 }),
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 
        }
      )
    })
  }

  const handleIniciarDia = async () => {
    if (!mz || !villaDesde || !villaHasta || !calle || !absInicio || !fotoInicio) {
      alert('Debes completar abscisa, Mz, Villas (Desde/Hasta), Calle y adjuntar la FOTO de evidencia.')
      return
    }
    setIsLoading(true)
    const gps = await getGeoLocation()
    
    try {
      const { error } = await supabase.from('avances_diarios').insert({
        proyecto_presupuesto_id: task.id,
        contratista_id: userProfile.id,
        jornada_id: task.jornada_id || null,
        mz, 
        villa_desde: villaDesde, 
        villa_hasta: villaHasta,
        calle,
        abs_inicio: Number(absInicio),
        foto_inicio_b64: fotoInicio,
        gps_inicio: gps,
        estado: 'iniciado'
      })
      if (error) throw error
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setStatusModal({ 
        isOpen: true, 
        title: 'Error de Inicio', 
        message: 'No pudimos aperturar la jornada: ' + err.message, 
        type: 'error' 
      })
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
    
    // Lógica de cálculo solicitada
    const areaDia = numL * numA
    const volumenDia = areaDia * numH
    const absFin = Number(activePlanilla.abs_inicio) + numL

    try {
      const { error } = await supabase.from('avances_diarios').update({
        longitud: numL, 
        ancho: numA, 
        altura: numH,
        area_dia: areaDia,
        volumen_dia: volumenDia,
        abs_fin: absFin,
        foto_fin_b64: fotoFin,
        gps_fin: gps,
        estado: 'finalizado'
      }).eq('id', activePlanilla.id)

      if (error) throw error
      setStatusModal({
        isOpen: true,
        title: '¡Reporte Guardado!',
        message: 'Tu avance diario ha sido registrado correctamente.',
        type: 'success'
      })
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setStatusModal({ 
        isOpen: true, 
        title: 'Error de Cierre', 
        message: 'No pudimos finalizar el reporte: ' + err.message, 
        type: 'error' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={activePlanilla ? "Finalizar Jornada" : "Aperturar Jornada"}>
      <div className="pt-4 pb-4 border-b border-slate-100 mb-6">
         <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{task.proyectos?.nombre}</h4>
         <p className="text-xl font-black text-slate-800 leading-tight">{task.rubro}</p>
      </div>

      {isFetching ? (
        <div className="py-10 text-center animate-pulse text-indigo-300 font-bold text-sm">Analizando estado de obra...</div>
      ) : !activePlanilla ? (
        // FORMULARIO: APERTURAR DÍA
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <Input label="Abscisa de Inicio" type="number" placeholder="Ej: 0.00" value={absInicio} onChange={e => setAbsInicio(e.target.value)} required />
          
          <div className="grid grid-cols-3 gap-4">
             <Input label="Mz / Bloque" placeholder="Ej: 5" value={mz} onChange={e => setMz(e.target.value)} required />
             <Input label="Villa Desde" placeholder="14" value={villaDesde} onChange={e => setVillaDesde(e.target.value)} required />
             <Input label="Villa Hasta" placeholder="20" value={villaHasta} onChange={e => setVillaHasta(e.target.value)} required />
          </div>
          <Input label="Calle o Ubicación Específica" placeholder="Calle principal..." value={calle} onChange={e => setCalle(e.target.value)} required />

          <div className="mt-6">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={inputFileRef} onChange={e => capturePhotoBase64(e, true)} />
            {fotoInicio ? (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-lg">
                <img src={fotoInicio} className="w-full h-full object-cover" alt="previo" />
                <div className="absolute bottom-2 left-2 bg-emerald-500 text-white text-[9px] px-2 py-1 rounded font-black flex items-center gap-1 shadow-sm">
                  <LocateFixed className="w-3 h-3" /> GPS ALTA PRECISIÓN ACTIVO
                </div>
              </div>
            ) : (
              <Button onClick={() => inputFileRef.current?.click()} variant="outline" fullWidth className="h-24 border-dashed border-slate-300 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-600 flex flex-col items-center justify-center gap-2 rounded-2xl transition-all shadow-sm">
                <Camera className="w-6 h-6" /> Tomar Foto de Inicio
              </Button>
            )}
          </div>
          
          <Button onClick={handleIniciarDia} isLoading={isLoading} fullWidth className="bg-indigo-600 hover:bg-indigo-700 mt-6 shadow-indigo-200 shadow-xl h-14 text-sm font-black tracking-wide rounded-2xl">
             Aperturar Jornada
          </Button>
        </div>
      ) : (
        // FORMULARIO: FINALIZAR JORNADA
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-slate-600">
               <MapPin className="w-4 h-4 text-indigo-500"/> 
               <span className="text-xs font-black">Mz {activePlanilla.mz} | Villas: {activePlanilla.villa_desde}-{activePlanilla.villa_hasta}</span>
            </div>
            <span className="text-[10px] bg-indigo-100 px-2 py-1 rounded font-bold text-indigo-700">Abscisa Inicio: {activePlanilla.abs_inicio}</span>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Calculator className="w-3 h-3" /> Reporte de Ingeniería Final
             </h4>
             <Input label="Longitud de avance (L)" type="number" placeholder="Metros (m)" value={longitud} onChange={e => setLongitud(e.target.value)} required />
             <div className="grid grid-cols-2 gap-4">
               <Input label="Ancho (A)" type="number" placeholder="Metros (m)" value={ancho} onChange={e => setAncho(e.target.value)} required />
               <Input label="Altura Promedio (H)" type="number" placeholder="Metros (m)" value={altura} onChange={e => setAltura(e.target.value)} required />
             </div>
             
             {/* Calculadora visual en vivo */}
             <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 mt-4">
                 <div className="grid grid-cols-2 gap-6 border-b border-slate-100 pb-4 mb-4">
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Área (m²)</p>
                       <span className="text-2xl font-black text-slate-900 leading-none">
                          { (Number(longitud || 0) * Number(ancho || 0)).toFixed(2) }
                       </span>
                    </div>
                    <div>
                       <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mb-1">Volumen Día (m³)</p>
                       <span className="text-2xl font-black text-indigo-700 leading-none">
                          { (Number(longitud || 0) * Number(ancho || 0) * Number(altura || 0)).toFixed(2) }
                       </span>
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Nueva Abscisa Proyectada</p>
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-emerald-600">
                             { (Number(activePlanilla.abs_inicio) + Number(longitud || 0)).toFixed(3) }
                          </span>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-tight">Cálculo en Tiempo Real</span>
                    </div>
                 </div>
             </div>
          </div>

          <div className="mt-6">
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={inputFileRef} onChange={e => capturePhotoBase64(e, false)} />
            {fotoFin ? (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-lg">
                <img src={fotoFin} className="w-full h-full object-cover" alt="previo" />
                <div className="absolute bottom-2 left-2 bg-amber-500 text-white text-[9px] px-2 py-1 rounded font-black flex items-center gap-1 shadow-sm">
                  <LocateFixed className="w-3 h-3" /> CIERRE GPS REGISTRADO
                </div>
              </div>
            ) : (
              <Button onClick={() => inputFileRef.current?.click()} variant="outline" fullWidth className="h-24 border-dashed border-slate-300 bg-white text-slate-500 hover:border-amber-400 hover:text-amber-600 flex flex-col items-center justify-center gap-2 rounded-2xl transition-all shadow-sm">
                <Camera className="w-6 h-6" /> Tomar Foto Final de Jornada
              </Button>
            )}
          </div>
          
          <Button onClick={handleFinalizarDia} disabled={!longitud || !ancho || !altura || !fotoFin} isLoading={isLoading} fullWidth className="bg-slate-900 hover:bg-black mt-6 shadow-slate-200 shadow-xl h-14 text-sm font-black tracking-wide rounded-2xl text-white">
             Confirmar y Finalizar Reporte
          </Button>
        </div>
      )}

      <StatusModal 
        isOpen={statusModal.isOpen}
        onClose={() => {
          setStatusModal(prev => ({...prev, isOpen: false}))
          if (statusModal.type === 'success') onClose()
        }}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </Modal>
  )
}
