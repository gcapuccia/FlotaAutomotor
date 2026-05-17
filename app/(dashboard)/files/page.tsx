import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText, Image, FileSpreadsheet } from 'lucide-react'

function getFileIcon(type: string) {
  if (type.includes('image')) return Image
  if (type.includes('pdf')) return FileText
  if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet
  return FileText
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: files } = await supabase
    .from('vehicle_files')
    .select('*, vehicle:vehicles(plate, vehicle_name, model), uploaded_by_profile:profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 animate-fadeIn">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          ARCHIVOS
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          {files?.length ?? 0} archivos almacenados en Cloudflare R2
        </p>
      </div>

      <div className="card" style={{ borderTop: '2px solid #38bdf8' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Archivo', 'Vehículo', 'Tamaño', 'Subido por', 'Fecha', 'Acción'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files?.map((f) => {
              const Icon = getFileIcon(f.file_type)
              return (
                <tr key={f.id} className="table-row-hover border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Icon size={15} style={{ color: '#38bdf8', flexShrink: 0 }} />
                      <span className="font-medium truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>
                        {f.file_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {f.vehicle ? (
                      <span>
                        <span className="font-display font-bold" style={{ color: 'var(--accent-primary)' }}>{f.vehicle.plate}</span>
                        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>{f.vehicle.vehicle_name} {f.vehicle.model}</span>
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatBytes(f.file_size)}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {f.uploaded_by_profile?.full_name ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(f.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-5 py-3">
                    <a
                      href={`/api/files/download?key=${encodeURIComponent(f.file_key)}`}
                      target="_blank"
                      className="btn-ghost text-xs px-3 py-1"
                    >
                      Descargar
                    </a>
                  </td>
                </tr>
              )
            })}
            {(!files || files.length === 0) && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                  No hay archivos subidos aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
