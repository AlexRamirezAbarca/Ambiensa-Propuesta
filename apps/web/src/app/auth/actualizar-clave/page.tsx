'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/shared/components/Input'
import { Button } from '@/shared/components/Button'
import { LockKeyhole, UserCheck } from 'lucide-react'

export default function ActualizarClavePage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [sessionUser, setSessionUser] = useState<any>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const captureHashSession = async () => {
      // Capturar manualmente si @supabase/ssr ignora el hash de invitaciones server-side
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')
        
        if (access_token && refresh_token) {
          const { data } = await supabase.auth.setSession({ access_token, refresh_token })
          if (data?.session?.user && isMounted) {
            setSessionUser({
              email: data.session.user.email,
              fullName: data.session.user.user_metadata?.full_name || 'Nuevo Integrante'
            })
            return true // Capturado con éxito
          }
        }
      }
      return false
    }

    captureHashSession().then((captured) => {
      if (!captured) {
        // Fallback al flujo normal de Supabase (por si ya estamos con sesión o usamos PKCE)
        supabase.auth.getUser().then(({ data }) => {
          if (data?.user && isMounted) {
            setSessionUser({
              email: data.user.email,
              fullName: data.user.user_metadata?.full_name || 'Nuevo Integrante'
            })
          }
        })
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && isMounted) {
        setSessionUser({
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name || 'Nuevo Integrante'
        })
      }
    })

    const timeout = setTimeout(async () => {
      if (isMounted && !sessionUser) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          setErrorMsg('No se detectó la sesión del enlace mágico. Por favor revisa que el enlace sea el más reciente o prueba en otra pestaña.')
          setIsLoading(false)
        } else {
           setSessionUser({
             email: session.user.email,
             fullName: session.user.user_metadata?.full_name || 'Nuevo Integrante'
           })
        }
      }
    }, 4000)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Inténtalo de nuevo.')
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setErrorMsg(`Error de Supabase: ${error.message}`)
      setIsLoading(false)
      return
    }

    // Redirección inteligente post-guardado
    const role = data.user?.user_metadata?.role as string
    const operarios = ['fiscalizador', 'supervisor', 'contraloria']

    if (role && operarios.includes(role.toLowerCase())) {
      router.push('/operaciones')
    } else {
      router.push('/dashboard')
    }
  }

  if (!sessionUser && !errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 rounded-full border-t-2 border-blue-600 animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Verificando enlace seguro...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 md:p-10 theme-light">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100/50">
            <LockKeyhole className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight mb-2">Asegura tu Cuenta</h1>
          <p className="text-sm font-medium text-slate-500">
            Hola <span className="text-blue-600 font-bold">{sessionUser?.fullName || 'Usuario'}</span>, <br/>
            Crea tu contraseña definitiva para acceder al sistema.
          </p>
        </motion.div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-semibold text-center mb-6"
            >
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input 
            variant="light"
            label="Nueva Contraseña"
            type="password"
            placeholder="Escribe al menos 6 caracteres"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <Input 
            variant="light"
            label="Confirmar Contraseña"
            type="password"
            placeholder="Repite la contraseña"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
            className="mt-4 bg-[#2563eb] py-3.5 shadow-lg shadow-blue-500/20"
          >
            <UserCheck className="w-5 h-5 mr-2" />
            Guardar Clave y Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
