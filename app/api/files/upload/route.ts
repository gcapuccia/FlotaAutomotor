import { createClient } from '@/lib/supabase/server'
import { uploadFile, generateFileKey } from '@/lib/storage'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const vehicleId = formData.get('vehicleId') as string
    const expenseId = formData.get('expenseId') as string | null

    if (!file || !vehicleId) {
      return NextResponse.json({ error: 'Archivo y vehículo son requeridos' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'El archivo no puede superar 10MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileKey = generateFileKey(vehicleId, file.name)
    await uploadFile(fileKey, buffer, file.type)

    const { data: dbFile, error: dbError } = await supabase
      .from('vehicle_files')
      .insert({
        vehicle_id: vehicleId,
        expense_id: expenseId ?? null,
        file_name: file.name,
        file_key: fileKey,
        file_url: fileKey,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    return NextResponse.json({ file: dbFile })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}
