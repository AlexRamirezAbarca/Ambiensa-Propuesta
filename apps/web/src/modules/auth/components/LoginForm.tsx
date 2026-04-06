'use client'

import { useState, useEffect } from 'react'
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
  const [showRegisterLink, setShowRegisterLink] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdminExists = async () => {
      // 1. Obtener los IDs de los roles de mando (más robusto)
      const { data: rolesData } = await supabase
        .from('roles')
        .select('id')
        .or('nombre.eq.administrador,nombre.eq.admin,nombre.eq.supervisor')

      if (rolesData && rolesData.length > 0) {
        const roleIds = rolesData.map(r => r.id)
        
        // 2. Contar si hay usuarios con esos roles
        const { count } = await supabase
          .from('usuarios')
          .select('id', { count: 'exact', head: true })
          .in('role_id', roleIds)

        if (count && count > 0) {
          setShowRegisterLink(false)
        }
      }
    }
    checkAdminExists()
  }, [supabase])

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
      const operarios = ['fiscalizador', 'supervisor', 'contraloria', 'administrador', 'admin']

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

      {showRegisterLink && (
        <div className="mt-8 pt-6 text-center border-t border-slate-800">
          <p className="text-sm text-slate-400">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Regístrate ahora
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}

