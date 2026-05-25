'use client'

import { useState, useMemo } from 'react'
import { Search, FileText, Image, FileSpreadsheet, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react'
import Pagination from '@/components/ui/Pagination'

const PAGE_SIZE = 15

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

type FileRow = {
  id: string
  file_name: string
  file_key: string
  file_type: string
  file_size: number
  created_at: string
  vehicle?: { plate: string; vehicle_name: string; model: string } | null
  uploaded_by_profile?: { full_name: string } | null
}

type SortKey = 'name' | 'vehicle' | 'size' | 'date'

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: 'name',    label: 'Archivo' },
  { key: 'vehicle', label: 'Vehículo' },
  { key: 'size',    label: 'Tamaño' },
  { key: null,      label: 'Subido por' },
  { key: 'date',    label: 'Fecha' },
  { key: null,      label: 'Acción' },
]

export default function FilesTable({ files }: { files: FileRow[] }) {
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage]       = useState(1)

  const handleSearch  = (v: string) => { setSearch(v); setPage(1) }
  const handleSortCol = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const list = files.filter((f) => {
      const q = search.toLowerCase()
      return (
        !q ||
        f.file_name.toLowerCase().includes(q) ||
        (f.vehicle?.plate        ?? '').toLowerCase().includes(q) ||
        (f.vehicle?.vehicle_name ?? '').toLowerCase().includes(q)
      )
    })

    list.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = a.file_name.localeCompare(b.file_name, 'es')
      } else if (sortKey === 'vehicle') {
        cmp = (a.vehicle?.plate ?? '').localeCompare(b.vehicle?.plate ?? '', 'es')
      } else if (sortKey === 'size') {
        cmp = a.file_size - b.file_size
      } else if (sortKey === 'date') {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return list
  }, [files, search, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="card" style={{ borderTop: '2px solid var(--color-files)' }}>

      {/* Barra de búsqueda */}
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4"
        style={{ borderColor: 'var(--border)' }}>
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar archivo o patente..."
            className="input-base py-2 pl-8 text-sm"
          />
        </div>
        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
          {filtered.length} archivo{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.label || 'actions'}
                  className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: col.key && sortKey === col.key ? 'var(--color-files)' : 'var(--text-muted)',
                    cursor: col.key ? 'pointer' : undefined,
                    userSelect: 'none',
                  }}
                  onClick={() => col.key && handleSortCol(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.key && (
                      sortKey === col.key
                        ? (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
                        : <ArrowUpDown size={11} style={{ opacity: 0.3 }} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((f) => {
              const Icon = getFileIcon(f.file_type)
              return (
                <tr key={f.id} className="table-row-hover border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Icon size={15} style={{ color: 'var(--color-files)', flexShrink: 0 }} />
                      <span className="font-medium truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>
                        {f.file_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {f.vehicle ? (
                      <span>
                        <span className="font-display font-bold" style={{ color: 'var(--accent-primary)' }}>
                          {f.vehicle.plate}
                        </span>
                        <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                          {f.vehicle.vehicle_name} {f.vehicle.model}
                        </span>
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                  No hay archivos subidos aún
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}
