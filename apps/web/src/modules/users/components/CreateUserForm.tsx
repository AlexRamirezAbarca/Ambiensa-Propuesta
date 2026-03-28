'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { UserPlus, ShieldCheck, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CreateUserFormProps {
  onUserCreated?: () => void
}

export function CreateUserForm({ onUserCreated }: CreateUserFormProps) {
  const [formData, setFormData] = useState({
    nombres: '',
    cedula: '',
    telefono: '',
    sexo: '',
    edad: '',
    email: '',
    role: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [resultData, setResultData] = useState<{ email: string, tempPassword: string, nombres: string, role: string } | null>(null)
  const [copied, setCopied] = useState(false)
  
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if ((name === 'cedula' || name === 'telefono') && /[^\d]/.test(value)) return
    if (name === 'nombres' && /\d/.test(value)) return
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.nombres.trim()) return "Ingresa el nombre completo del colaborador."
    if (formData.cedula.length < 10) return "La cédula debe tener 10 dígitos numéricos."
    if (formData.telefono.length < 9) return "Ingresa un número de teléfono celular válido."
    if (!formData.sexo) return "Selecciona el sexo del colaborador."
    if (!formData.edad) return "Ingresa la edad del colaborador."
    if (!formData.email.trim()) return "Ingresa el correo electrónico."
    if (!formData.role) return "Debes asignar un rol de trabajo."
    return null
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    const err = validateForm()
    if (err) { setErrorMsg(err); return }

    setIsLoading(true)

    try {
      const { data: { user: admin } } = await supabase.auth.getUser()

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, adminId: admin?.id })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error del servidor.')
      }

      setResultData({ 
        email: formData.email, 
        tempPassword: result.tempPassword,
        nombres: formData.nombres,
        role: formData.role
      })
    } catch (error: any) {
      setErrorMsg(error.message || 'No se pudo conectar con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  const copyPassword = () => {
    if (resultData) {
      navigator.clipboard.writeText(resultData.tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Pantalla de éxito
  if (resultData) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl p-10 text-center"
      >
        <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <ShieldCheck className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Registro Exitoso!</h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-md mx-auto">
          <strong className="text-slate-700">{resultData.nombres}</strong> ha sido registrado como <strong className="text-blue-600 uppercase">{resultData.role}</strong>. 
          Se ha enviado un correo de confirmación a <em className="text-slate-600">{resultData.email}</em>.
        </p>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Clave Temporal Generada</p>
          <div className="flex items-center justify-center gap-4">
            <code className="text-3xl font-mono font-bold text-blue-700 tracking-wider select-all">
              {resultData.tempPassword}
            </code>
            <button 
              onClick={copyPassword}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
              title="Copiar"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>

        <Button 
          fullWidth 
          onClick={() => onUserCreated?.()} 
          className="bg-slate-900 hover:bg-slate-800 py-4 font-semibold text-base"
        >
          Volver al Módulo de Personal
        </Button>
      </motion.div>
    )
  }

  // Formulario de registro — envuelto en theme-light para que autofill respete fondo blanco
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl p-8 sm:p-10 theme-light">
      
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-6 h-6 text-blue-600" /> 
        </div>
        <h2 className="text-xl font-bold text-slate-800">Nuevo Integrante de Equipo</h2>
        <p className="text-slate-400 mt-1.5 text-sm">
          Completa los datos. El sistema generará una clave aleatoria segura.
        </p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }} 
            className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-medium text-center"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleCreateUser} className="space-y-5">

        {/* Fila 1: Nombre + Cédula */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input 
            variant="light"
            label="Nombres y Apellidos"
            name="nombres"
            placeholder="Ingrese nombres completos"
            value={formData.nombres}
            onChange={handleChange}
            required
          />
          <Input 
            variant="light"
            label="Cédula de Identidad"
            name="cedula"
            maxLength={10}
            placeholder="Ingrese número de cédula"
            value={formData.cedula}
            onChange={handleChange}
            required
          />
        </div>

        {/* Fila 2: Teléfono + Sexo + Edad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input 
            variant="light"
            label="Teléfono Móvil"
            name="telefono"
            type="tel"
            maxLength={10}
            placeholder="Ingrese número celular"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
          
          {/* Sexo Segmented */}
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Sexo</label>
            <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1.5 h-[46px] items-center">
              <button 
                type="button"
                onClick={() => setFormData(p => ({...p, sexo: 'M'}))}
                className={`flex-1 rounded-lg text-sm font-bold h-full transition-all duration-200 ${formData.sexo === 'M' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                M
              </button>
              <button 
                type="button"
                onClick={() => setFormData(p => ({...p, sexo: 'F'}))}
                className={`flex-1 rounded-lg text-sm font-bold h-full transition-all duration-200 ${formData.sexo === 'F' ? 'bg-white shadow-sm border border-slate-200 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                F
              </button>
            </div>
          </div>
          
          <Input 
            variant="light"
            label="Edad"
            name="edad"
            type="number"
            min="18"
            placeholder="Ingrese la edad"
            value={formData.edad}
            onChange={handleChange}
            required
          />
        </div>

        {/* Separador visual */}
        <div className="border-t border-slate-100 pt-5" />

        {/* Fila 3: Correo + Rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input 
            variant="light"
            label="Correo Electrónico"
            name="email"
            type="email"
            placeholder="Ingrese correo del colaborador"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Rol de Trabajo</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full h-[46px] px-4 bg-white border border-slate-200 hover:border-blue-400 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none"
            >
              <option value="" disabled>Seleccionar rol asignado</option>
              <option value="fiscalizador">Fiscalizador</option>
              <option value="contraloria">Contraloría</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
        </div>
        
        {/* Botón Submit */}
        <Button 
          type="submit" 
          fullWidth 
          isLoading={isLoading} 
          className="mt-6 bg-blue-600 hover:bg-blue-700 py-3.5 shadow-lg shadow-blue-500/20 font-bold"
        >
          Confirmar e Invitar al Sistema
        </Button>
      </form>
    </div>
  )
}
