import { createClient } from '@supabase/supabase-js'

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'fleet-files'

// Service role client — bypasses RLS entirely
function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export function generateFileKey(vehicleId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `vehicles/${vehicleId}/${timestamp}_${sanitized}`
}

export async function uploadFile(key: string, buffer: Buffer, contentType: string): Promise<void> {
  const { error } = await getClient().storage.from(BUCKET).upload(key, buffer, {
    contentType,
    upsert: false,
  })
  if (error) throw error
}

export async function deleteFile(key: string): Promise<void> {
  const { error } = await getClient().storage.from(BUCKET).remove([key])
  if (error) throw error
}

export async function getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await getClient().storage.from(BUCKET).createSignedUrl(key, expiresIn)
  if (error) throw error
  return data.signedUrl
}
