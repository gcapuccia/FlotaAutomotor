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
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
        <AlertTriangle size={10} /> {fecha}
      </span>
    )
  }
  if (vtvStatus === 'por_vencer') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold"
        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
        <Clock size={10} /> {fecha} ({diasRestantes}d)
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold"
      style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
      <CheckCircle size={10} /> {fecha}
    </span>
  )
}

export default function VehicleTable({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="card" style={{ borderTop: '2px solid var(--accent-primary)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-display text-lg font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          FLOTA DE VEHÍCULOS
        </h2>
        <Link href="/vehicles" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent-primary)' }}>
          Ver todos <ArrowRight size={13} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Int.', 'Patente', 'Vehículo / Modelo', 'Titular', 'Chofer', 'Tipo', 'Flota', 'VTV', 'Estado', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.slice(0, 10).map((v) => {
              const status = STATUS_MAP[v.status] ?? { label: v.status, cls: '' }
              return (
                <tr key={v.id} className="table-row-hover border-b" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {v.interno ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-display font-bold tracking-widest" style={{ color: 'var(--accent-primary)' }}>
                      {v.plate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{v.vehicle_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.model}</p>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {v.titular}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {v.driver ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {TYPE_LABELS[v.type] ?? v.type}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {v.flota ?? <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <VtvBadge vtv={v.vtv} vtvStatus={v.vtv_status} diasRestantes={v.vtv_dias_restantes} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={"text-xs px-2 py-1 rounded-md font-semibold whitespace-nowrap " + status.cls}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={"/vehicles/" + v.id} className="btn-ghost text-xs px-3 py-1">
                      Ver
                    </Link>
                  </td>
                </tr>
              )
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
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
