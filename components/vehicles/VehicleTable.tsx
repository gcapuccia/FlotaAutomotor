'use client'

import Link from 'next/link'
import { ArrowRight, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import type { Vehicle, VtvStatus } from '@/types'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  activo:        { label: 'Activo',        cls: 'badge-active' },
  en_reparacion: { label: 'En Reparación', cls: 'badge-repair' },
  disponible:    { label: 'Disponible',    cls: 'badge-available' },
  baja:          { label: 'De Baja',       cls: 'badge-off' },
}

const TYPE_LABELS: Record<string, string> = {
  sedan: 'Sedán', suv: 'SUV', pickup: 'Pick-up',
  van: 'Van', truck: 'Camión', motorcycle: 'Moto', otro: 'Otro',
}

function VtvBadge({ vtv, vtvStatus, diasRestantes }: {
  vtv: string | null
  vtvStatus?: VtvStatus | null
  diasRestantes?: number | null
}) {
  if (!vtv) return <span style={{ color: 'var(--text-muted)' }}>—</span>

  const fecha = new Date(vtv + 'T00:00:00').toLocaleDateString('es-AR')

  if (vtvStatus === 'vencida') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <AlertTriangle size={11} /> {fecha}
      </span>
    )
  }
  if (vtvStatus === 'por_vencer') {
    return (
      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
        <Clock size={11} /> {fecha} ({diasRestantes}d)
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
      <CheckCircle size={11} /> {fecha}
    </span>
  )
}

export default function VehicleTable({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="card overflow-hidden" style={{ borderTop: '2px solid var(--accent-primary)' }}>
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-display text-lg font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          FLOTA DE VEHÍCULOS
        </h2>
        <Link href="/vehicles" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
          Ver todos <ArrowRight size={13} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {['Int.', 'Patente', 'Vehículo', 'Titular', 'Chofer', 'Tipo', 'Flota', 'VTV', 'Estado', ''].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.slice(0, 3).map((v) => {
              const status = STATUS_MAP[v.status] ?? { label: v.status, cls: '' }
              return (
                <tr
                  key={v.id}
                  className="table-row-hover border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td className="px-3 py-3 text-xs tabular-nums" style={{ color: 'var(--text-muted)' }}>{v.interno ?? '—'}</td>
                  <td className="px-3 py-3 font-semibold" style={{ color: 'var(--accent-primary)' }}>{v.plate}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{v.vehicle_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.model}</p>
                  </td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{v.titular}</td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{v.driver ?? '—'}</td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{TYPE_LABELS[v.type] ?? v.type}</td>
                  <td className="px-3 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{v.flota ?? '—'}</td>
                  <td className="px-3 py-3">
                    <VtvBadge vtv={v.vtv} vtvStatus={v.vtv_status} diasRestantes={v.vtv_dias_restantes} />
                  </td>
                  <td className="px-3 py-3">
                    <span className={status.cls}>{status.label}</span>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/vehicles/${v.id}`}
                      className="flex items-center gap-1 text-xs font-medium"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Ver <ArrowRight size={11} />
                    </Link>
                  </td>
                </tr>
              )
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  No hay vehículos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
