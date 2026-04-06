'use client'

import { useState, useEffect, use, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  Save, 
  Ruler, 
  Maximize, 
  Activity,
  AlertCircle,
  Clock,
  ArrowRightCircle,
  HardHat
} from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { Input } from '@/shared/components/Input'
import { motion, AnimatePresence } from 'framer-motion'

interface InspectionPageProps {
  params: Promise<{ id: string }>
}

export default function InspectionPage({ params }: InspectionPageProps) {
  const { id: loteId } = use(params)
  const router = useRouter()
  const supabase = createClient()

  // State
  const [lote, setLote] = useState<any>(null)
  const [rubroId, setRubroId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<'inicio' | 'cursando' | 'cierre' | 'terminado'>('inicio')
  const [loadingText, setLoadingText] = useState('Procesando...')
  
  // Data for the day (Entradas brutas)
  const [formData, setFormData] = useState({
    longitud: '' as string,
    ancho: '1' as string,
    altura: '0.20' as string,
    abs_inicio: 0
  })

  const [evidence, setEvidence] = useState({
    foto_inicio: null as string | null,
    foto_fin: null as string | null,
    gps_inicio: null as any,
    gps_fin: null as any
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchLoteAndLastProgress = async () => {
      try {
        const { data: loteData } = await supabase
          .from('lotes_unidades')
          .select('*, proyectos(nombre)')
          .eq('id', loteId)
          .single()

        if (loteData) {
          setLote(loteData)
          
          const { data: rubroData } = await supabase.from('rubros').select('id').limit(1).single()
          if (rubroData) setRubroId(rubroData.id)

          const { data: historyData } = await supabase
            .from('avances_diarios')
            .select('*')
            .eq('lote_id', loteId)
            .order('fecha', { ascending: false })

          if (historyData) {
            const today = new Date().toISOString().split('T')[0]
            const sessionToday = historyData.find(h => h.fecha === today)
            
            if (sessionToday?.estado === 'iniciado') {
                setStep('cursando')
            } else if (sessionToday?.estado === 'finalizado') {
                setStep('terminado')
            }

            const lastFinished = historyData.find(h => h.estado === 'finalizado')
            const startAbs = lastFinished ? lastFinished.abs_fin : loteData.absica_inicio
            setFormData(prev => ({ ...prev, abs_inicio: Number(startAbs) }))
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLoteAndLastProgress()
  }, [loteId, supabase])

  // CÁLCULO DIRECTO (Sin logs)
  const calc = useMemo(() => {
    const parseNum = (val: string | number) => {
       const str = String(val || '').replace(',', '.')
       const n = parseFloat(str)
       return isNaN(n) ? 0 : n
    }

    const L = parseNum(formData.longitud)
    const A = parseNum(formData.ancho)
    const H = parseNum(formData.altura)
    
    const area = L * A
    const volumen = area * H
    const abs_fin = Number(formData.abs_inicio) + L

    return { area, volumen, abs_fin, L, A, H }
  }, [formData])

  const getGeolocation = (): Promise<{lat: number, lng: number, timestamp: string}> => {
    return new Promise((resolve) => {
      const hardTimeout = setTimeout(() => {
        resolve({ lat: -2.1479, lng: -79.9325, timestamp: new Date().toISOString() })
      }, 6000)
      navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(hardTimeout); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, timestamp: new Date().toISOString() }) },
        () => { clearTimeout(hardTimeout); resolve({ lat: -2.1479, lng: -79.9325, timestamp: new Date().toISOString() }) },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      )
    })
  }

  const handleStartDay = async () => {
    setIsSubmitting(true)
    setLoadingText('GPS...')
    try {
      const gps = await getGeolocation()
      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase.from('avances_diarios').select('id').eq('lote_id', loteId).eq('fecha', today).maybeSingle()

      if (existing) {
        setStep('cursando')
        setIsSubmitting(false)
        return
      }

      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      
      const resetOnFocus = () => {
         setTimeout(() => { setIsSubmitting(false); window.removeEventListener('focus', resetOnFocus) }, 1000)
      }
      window.addEventListener('focus', resetOnFocus)

      input.onchange = async (e: any) => {
        window.removeEventListener('focus', resetOnFocus)
        const file = e.target.files[0]
        if (file) {
          setLoadingText('Iniciando...')
          await supabase.from('avances_diarios').insert({
            lote_id: loteId,
            rubro_id: rubroId || '88888888-8888-8888-8888-888888888888',
            fiscalizador_id: (await supabase.auth.getUser()).data.user?.id,
            abs_inicio: formData.abs_inicio,
            foto_inicio_url: 'mock_init_url',
            gps_inicio: gps,
            estado: 'iniciado'
          })
          setStep('cursando')
        }
        setIsSubmitting(false)
      }
      input.click()
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  const handleEndPhoto = async () => {
    setIsSubmitting(true)
    setLoadingText('GPS...')
    const gps = await getGeolocation()
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    
    const reset = () => { setTimeout(() => setIsSubmitting(false), 1000) }
    window.addEventListener('focus', reset, { once: true })

    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) setEvidence(p => ({ ...p, foto_fin: 'done', gps_fin: gps }))
      setIsSubmitting(false)
    }
    input.click()
  }

  const handleFinalizeWork = async () => {
    setIsSubmitting(true)
    setLoadingText('Sincronizando...')
    try {
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('avances_diarios')
        .update({
          abs_fin: calc.abs_fin,
          longitud: calc.L,
          ancho: calc.A,
          area: calc.area,
          altura_promedio: calc.H,
          volumen_dia: calc.volumen,
          foto_fin_url: 'mock_end_url',
          gps_fin: evidence.gps_fin,
          estado: 'finalizado'
        })
        .eq('lote_id', loteId)
        .eq('fecha', today)
        .eq('estado', 'iniciado')

      const { data: currentLot } = await supabase.from('lotes_unidades').select('volumen_acumulado').eq('id', loteId).single()
      const newTotal = (Number(currentLot?.volumen_acumulado) || 0) + calc.volumen

      await supabase.from('lotes_unidades').update({ volumen_acumulado: newTotal }).eq('id', loteId)
      router.push('/operaciones')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <div className="p-20 text-center font-bold text-slate-400">CARGANDO...</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center gap-4">
        <button onClick={() => router.back()} className="text-slate-400"><ArrowLeft /></button>
        <div>
          <h1 className="text-lg font-black text-slate-900 leading-none">Villa {lote.villa} - MZ {lote.mz}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{lote.proyectos?.nombre}</p>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {step === 'inicio' && (
            <motion.div key="inicio" className="flex flex-col items-center pt-10">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6"><Camera /></div>
              <h2 className="text-xl font-black mb-10 text-center">Abrir Jornada Técnica</h2>
              <Button fullWidth className="h-16 rounded-3xl" onClick={handleStartDay} isLoading={isSubmitting} loadingText={loadingText}>Iniciar Día</Button>
            </motion.div>
          )}

          {step === 'cursando' && (
            <motion.div key="cursando" className="flex flex-col items-center pt-10">
               <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 animate-pulse"><HardHat /></div>
               <h2 className="text-xl font-black mb-10 text-center">Trabajo en Curso</h2>
               <button onClick={() => setStep('cierre')} className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                  <ArrowRightCircle /> Registrar Reporte de Salida
               </button>
            </motion.div>
          )}

          {step === 'cierre' && (
            <motion.div key="cierre" className="space-y-6">
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2"><Ruler className="w-3 h-3"/> Reporte Técnico de Salida</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Longitud (m)</label>
                      <div className="relative">
                        <Maximize className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0.00"
                          value={formData.longitud}
                          onChange={(e) => setFormData(p => ({ ...p, longitud: e.target.value }))}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Ancho (m)</label>
                      <div className="relative">
                        <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="1"
                          value={formData.ancho}
                          onChange={(e) => setFormData(p => ({ ...p, ancho: e.target.value }))}
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Altura Promedio (m)</label>
                    <div className="relative">
                      <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.20"
                        value={formData.altura}
                        onChange={(e) => setFormData(p => ({ ...p, altura: e.target.value }))}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-[#0f172a] rounded-3xl p-8 text-white mt-8 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Volumen del Día</span>
                    <div className="text-5xl font-black text-blue-400 mt-2">
                        {calc.volumen.toFixed(2)} <span className="text-lg text-slate-500">m³</span>
                    </div>
                    <div className="flex justify-between mt-6 pt-4 border-t border-white/5 text-[9px] font-bold uppercase text-slate-500">
                        <span>Área: {calc.area.toFixed(2)} m²</span>
                        <span className="text-blue-500">ABS Fin: {calc.abs_fin.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button fullWidth variant="secondary" className="h-16 rounded-3xl border-2 border-slate-100" onClick={handleEndPhoto} isLoading={isSubmitting} loadingText={loadingText}>
                {evidence.foto_fin ? <CheckCircle2 className="text-emerald-500" /> : <Camera />} {evidence.foto_fin ? 'Foto OK' : 'Capturar Foto Cierre'}
              </Button>

              {evidence.foto_fin && (
                <Button fullWidth className="h-16 rounded-3xl shadow-lg" onClick={handleFinalizeWork} isLoading={isSubmitting} loadingText="Sincronizando...">
                   Finalizar y Sincronizar
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
