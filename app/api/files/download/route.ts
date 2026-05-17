import { createClient } from '@/lib/supabase/server'
import { getPresignedDownloadUrl } from '@/lib/r2'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const key = request.nextUrl.searchParams.get('key')
  if (!key) return NextResponse.json({ error: 'Key requerida' }, { status: 400 })

  try {
    const url = await getPresignedDownloadUrl(key)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Download error:', err)
    return NextResponse.json({ error: 'Error al generar link de descarga' }, { status: 500 })
  }
}
