import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, nombres, role, cedula, telefono, sexo, edad } = body

    // Usamos la Service Role Key para poder crear usuarios como Admin
    // Si no está en el env, fallará con gracia.
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Intentar Invitar (Modo Profesional - Requiere Service Key)
    let { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { 
        full_name: nombres,
        role: role,
        cedula,
        telefono,
        sexo,
        edad
      }
    })

    // FALLBACK: Si falla la invitación (ej. falta la key), usamos Registro Normal (Modo Rescate)
    if (authError) {
      console.warn('Invitación fallida, usando Modo Rescate (signUp)...')
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-12), // Generamos una clave temporal aleatoria
        options: { 
          data: { 
            full_name: nombres,
            role: role,
            cedula,
            telefono,
            sexo,
            edad
          }
        }
      })
      
      if (signUpError) throw signUpError
      authData = { user: signUpData.user } as any
    }

    if (!authData?.user) throw new Error('No se pudo crear el usuario en Auth.')

    // 2. Crear o Actualizar el perfil en la tabla pública usuarios (UPSERT para evitar errores de duplicidad)
    const { error: profileError } = await supabaseAdmin
      .from('usuarios')
      .upsert({
        id: authData.user.id,
        nombres,
        email,
        cedula,
        telefono,
        sexo,
        edad: parseInt(edad),
        role_id: getRoleId(role),
        estado: true,
        updated_at: new Date().toISOString()
      })

    if (profileError) throw profileError

    return NextResponse.json({ success: true, user: authData.user })
  } catch (error: any) {
    console.error('Error en API Users:', error.message)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

function getRoleId(roleName: string) {
  const roles: Record<string, number> = {
    'administrador': 1,
    'fiscalizador': 2,
    'contraloria': 3,
    'supervisor': 4,
    'contratista': 9
  }
  return roles[roleName.toLowerCase()] || 2
}
