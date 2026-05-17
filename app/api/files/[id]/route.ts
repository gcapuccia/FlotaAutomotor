import { createClient } from '@/lib/supabase/server'
import { deleteFromR2 } from '@/lib/r2'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const { id } = await params
  const key = request.nextUrl.searchParams.get('key')

  if (key) {
    try {
      await deleteFromR2(key)
    } catch (err) {
      console.error('R2 delete error:', err)
    }
  }

  const { error } = await supabase.from('vehicle_files').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
