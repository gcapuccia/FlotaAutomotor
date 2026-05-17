import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Verify the requester is admin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Sin permisos de administrador' }, { status: 403 })
    }

    const { email, password, full_name, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 })
    }

    // Create user with admin client (service role)
    const adminClient = await createAdminClient()
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: role ?? 'viewer' },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Update profile if full_name or role needs to be set explicitly
    if (newUser.user) {
      await adminClient
        .from('profiles')
        .update({ full_name: full_name ?? null, role: role ?? 'viewer' })
        .eq('id', newUser.user.id)

      const { data: profileData } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', newUser.user.id)
        .single()

      return NextResponse.json({ user: profileData })
    }

    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  } catch (err) {
    console.error('Create user error:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
