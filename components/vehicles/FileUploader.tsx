'use client'

import { useState, useRef } from 'react'
import { Upload, Download, Trash2, FileText, Loader2 } from 'lucide-react'
import type { VehicleFile } from '@/types'

type FileWithProfile = VehicleFile & { uploaded_by_profile?: { full_name: string } | null }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUploader({
  vehicleId,
  files: initialFiles,
  isAdmin,
}: {
  vehicleId: string
  files: FileWithProfile[]
  isAdmin: boolean
}) {
  const [files, setFiles] = useState(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('vehicleId', vehicleId)

    const res = await fetch('/api/files/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al subir archivo')
    } else {
      setFiles((prev) => [data.file, ...prev])
    }

    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = async (file: FileWithProfile) => {
    const res = await fetch(`/api/files/download?key=${encodeURIComponent(file.file_key)}`)
    const data = await res.json()
    if (data.url) {
      window.open(data.url, '_blank')
    }
  }

  const handleDelete = async (fileId: string, fileKey: string) => {
    if (!confirm('¿Eliminar este archivo?')) return
    const res = await fetch(`/api/files/${fileId}?key=${encodeURIComponent(fileKey)}`, { method: 'DELETE' })
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.id !== fileId))
    }
  }

  return (
    <div className="card" style={{ borderTop: '2px solid #38bdf8' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-display font-semibold tracking-wide" style={{ color: 'var(--text-primary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
          Archivos
        </h3>
      </div>

      {/* Upload area */}
      {isAdmin && (
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-2 border-dashed rounded-lg py-4 flex flex-col items-center gap-2 text-sm transition-colors"
            style={{ borderColor: 'var(--border-accent)', color: 'var(--text-muted)' }}
          >
            {uploading ? (
              <><Loader2 size={18} className="animate-spin" /> Subiendo...</>
            ) : (
              <><Upload size={18} /> Subir archivo<span className="text-xs">PDF, imagen, Excel, Word</span></>
            )}
          </button>
          {error && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>}
        </div>
      )}

      {/* File list */}
      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {files.map((f) => (
          <div key={f.id} className="px-5 py-3 flex items-center gap-3 table-row-hover">
            <FileText size={16} style={{ color: '#38bdf8', flexShrink: 0 }} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{f.file_name}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatBytes(f.file_size)} · {new Date(f.created_at).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => handleDownload(f)}
                className="p-1.5 rounded-md transition-colors"
                style={{ color: 'var(--text-muted)' }}
                title="Descargar"
              >
                <Download size={14} />
              </button>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(f.id, f.file_key)}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
        {files.length === 0 && (
          <p className="px-5 py-6 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Sin archivos adjuntos
          </p>
        )}
      </div>
    </div>
  )
}
