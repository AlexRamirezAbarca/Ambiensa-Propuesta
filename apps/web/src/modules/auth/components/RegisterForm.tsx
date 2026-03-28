'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MailCheck } from 'lucide-react'

export function RegisterForm() {
  const [formData, setFormData] = useState({
    nombres: '',
    cedula: '',
    telefono: '',
    sexo: '', // M o F
    edad: '',
    email: '',
    password: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    // Para Cédula y Teléfono, solo permitir números en tiempo real
    if ((e.target.name === 'cedula' || e.target.name === 'telefono') && /[^\d]/.test(e.target.value)) {
      return
    }
    // Para Nombres, impedir números
    if (e.target.name === 'nombres' && /\d/.test(e.target.value)) {
      return
    }
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const validateForm = () => {
    if (formData.cedula.length < 10) return "La cédula debe tener 10 dígitos."
    if (formData.telefono.length < 9) return "Ingresa un teléfono o celular válido."
    
    // Contraseña: Minimo 8, al menos 1 letra y 1 numero
    const hasLetters = /[a-zA-Z]/.test(formData.password)
    const hasNumbers = /\d/.test(formData.password)
    
    if (formData.password.length < 8 || !hasLetters || !hasNumbers) {
      return "La contraseña debe tener mínimo 8 caracteres (combina al menos 1 letra y 1 número)."
    }
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    
    const validationError = validateForm()
    if (validationError) {
      setErrorMsg(validationError)
      return
    }

    setIsLoading(true)

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.nombres,
          cedula: formData.cedula,
          telefono: formData.telefono,
          sexo: formData.sexo,
          edad: formData.edad,
          role: 'admin' // Forced admin default setup for now
        }
      }
    })

    setIsLoading(false)

    if (error) {
      if (error.message.includes("already registered")) {
        setErrorMsg("El correo ingresado ya existe en la plataforma.")
      } else {
        setErrorMsg(error.message)
      }
      return
    }

    // Modal popup state (Reemplaza el form)
    setSuccess(true)
  }

  // POPUP DE ÉXITO ESTILO GLASSMORPHISM
  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full text-center"
      >
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
           <MailCheck className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">¡Cuenta Creada Éxitosamente!</h2>
        <p className="text-slate-400 text-sm mb-8 px-4 leading-relaxed">
          Tu registro en Ambiensa ERP está casi listo. Hemos enviado un correo de confirmación de forma segura a <strong>{formData.email}</strong>. Por favor, <u>abre el enlace en tu celular o web para verificar tu acceso.</u>
        </p>
        <div className="flex flex-col gap-3 mt-4">
          <Button fullWidth type="button" onClick={() => window.open('https://mail.google.com/mail/u/0/#inbox', '_blank')} className="bg-white text-blue-600 hover:bg-slate-100 border-none font-bold">
            Abrir mi Gmail directamente
          </Button>
          <Button fullWidth onClick={() => router.push('/login')} variant="outline" className="border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300">
            Ya lo confirmé, ingresar al sistema
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      <AnimatePresence>
        {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }} 
              className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium"
            >
              {errorMsg}
            </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleRegister} className="space-y-4">
        
        <Input 
          label="Nombres Completos"
          name="nombres"
          type="text"
          placeholder="Ingrese sus apellidos y nombres"
          value={formData.nombres}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Número de Cédula"
            name="cedula"
            type="text"
            maxLength={10}
            placeholder="Ingrese su cédula"
            value={formData.cedula}
            onChange={handleChange}
            required
          />
          <Input 
            label="Teléfono"
            name="telefono"
            type="tel"
            maxLength={10}
            placeholder="Ingrese su teléfono"
            value={formData.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 mb-2 h-full">
            <label className="text-sm font-medium text-slate-300 ml-1">Sexo</label>
            <div className="flex bg-slate-900/50 border border-slate-700/50 rounded-xl p-1 h-full items-center min-h-[46px]">
              <button 
                type="button"
                onClick={() => setFormData(p => ({...p, sexo: 'M'}))}
                className={`flex-1 rounded-lg text-sm font-medium py-1.5 transition-all ${formData.sexo === 'M' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Masculino
              </button>
              <button 
                type="button"
                onClick={() => setFormData(p => ({...p, sexo: 'F'}))}
                className={`flex-1 rounded-lg text-sm font-medium py-1.5 transition-all ${formData.sexo === 'F' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Femenino
              </button>
            </div>
            {/* Pequeño hack para forzar required hook nativo si envían vacío */}
            <input type="hidden" required value={formData.sexo} />
          </div>
          
          <Input 
            label="Edad"
            name="edad"
            type="number"
            min="18"
            max="120"
            placeholder="Ingrese su edad"
            value={formData.edad}
            onChange={handleChange}
            required
          />
        </div>

        <Input 
          label="Correo Electrónico"
          name="email"
          type="email"
          placeholder="Ingrese su correo institucional"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input 
          label="Contraseña"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres (Letras y Números)"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <Button type="submit" fullWidth isLoading={isLoading} className="mt-6 shadow-lg shadow-blue-600/20">
          Registrar Usuario
        </Button>
      </form>

      <div className="mt-6 text-center border-slate-800">
        <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
          &larr; Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
