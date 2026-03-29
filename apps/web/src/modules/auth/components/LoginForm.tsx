'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setErrorMsg('Seguridad: No se ha confirmado el correo. Revisa tu bandeja de entrada o spam para activarlo.')
      } else if (error.message.includes('Invalid login credentials')) {
        // Supabase oscurece si no existe el usuario o si la contraseña es mala por Anti-Phishing,
        // Traducimos al español más exacto que se permite:
        setErrorMsg('El usuario no existe o la contraseña registrada es incorrecta.')
      } else {
        setErrorMsg(`Error del sistema: ${error.message}`)
      }
      setIsLoading(false)
      return
    }

    if (data.user) {
      const role = data.user.user_metadata?.role as string
      const operarios = ['fiscalizador', 'supervisor', 'contraloria']

      if (operarios.includes(role?.toLowerCase())) {
        router.push('/operaciones')
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="w-full">
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium mb-6"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleLogin} className="space-y-4">

        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="Ingrese su correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="space-y-1">
          <Input
            label="Contraseña"
            type="password"
            placeholder="Ingrese su contraseña secreta"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end pr-1 mt-1">
            <Link href="/forgot-password" className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading} className="mt-8">
          Acceder
        </Button>
      </form>

      <div className="mt-8 pt-6 text-center border-t border-slate-800">
        <p className="text-sm text-slate-400">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Regístrate ahora
          </Link>
        </p>
      </div>
    </div>
  )
}
