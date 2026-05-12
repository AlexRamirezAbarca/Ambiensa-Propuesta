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

    // 1. Invitar al usuario via Auth (esto envía el correo)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { 
        full_name: nombres,
        role: role,
        cedula,
        telefono,
        sexo,
        edad
      }
    })

    if (authError) throw authError

    // 2. Crear el perfil en la tabla pública usuarios
    const { error: profileError } = await supabaseAdmin
      .from('usuarios')
      .insert({
        id: authData.user.id,
        nombres,
        email,
        cedula,
        telefono,
        sexo,
        edad: parseInt(edad),
        role_id: getRoleId(role),
        estado: true
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
