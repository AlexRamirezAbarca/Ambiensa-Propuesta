'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)
  
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    setIsLoading(false)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-center"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
           <MailCheck className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Correo enviado</h2>
        <p className="text-slate-400 text-sm mb-8">Revisa la carpeta de "Spam" o "Principal" en {email}. Te hemos enviado un enlace para cambiar tu contraseña.</p>
        <Link href="/login">
          <Button fullWidth variant="outline">Entendido</Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      {errorMsg && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium">
            {errorMsg}
          </motion.div>
      )}

      <div className="mb-8 p-1">
        <h2 className="text-2xl font-bold text-white mb-2">Restaurar contraseña</h2>
        <p className="text-slate-400 text-sm">Te enviaremos instrucciones por correo para recuperar tu cuenta.</p>
      </div>

      <form onSubmit={handleReset} className="space-y-6">
        <Input 
          label="Correo Electrónico"
          type="email"
          placeholder="Ingrese su correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Button type="submit" fullWidth isLoading={isLoading} className="mt-8">
          Restaurar Acceso
        </Button>
      </form>

      <div className="mt-8 pt-6 text-center border-t border-slate-800">
        <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
          Cancelar proceso
        </Link>
      </div>
    </div>
  )
}
