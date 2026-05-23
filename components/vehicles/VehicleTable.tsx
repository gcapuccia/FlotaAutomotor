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
  if (!vtv) return <span className="text-slate-400 dark:text-slate-500">—</span>

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
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 px-4 py-4 dark:border-slate-800/60 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Flota de vehículos</h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Últimos vehículos agregados</p>
        </div>
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-1.5 self-start rounded-md border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 sm:self-auto"
        >
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/60">
              {['Int.', 'Patente', 'Vehículo', 'Titular', 'Chofer', 'Tipo', 'Flota', 'VTV', 'Estado', ''].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.slice(0, 10).map((v) => {
              const status = STATUS_MAP[v.status] ?? { label: v.status, cls: '' }
              return (
                <tr
                  key={v.id}
                  className="border-b border-slate-200/60 last:border-0 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="px-3 py-3 text-xs tabular-nums text-slate-400 dark:text-slate-500">{v.interno ?? '—'}</td>
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-100">{v.plate}</td>
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{v.vehicle_name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{v.model}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{v.titular}</td>
                  <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{v.driver ?? '—'}</td>
                  <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{TYPE_LABELS[v.type] ?? v.type}</td>
                  <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{v.flota ?? '—'}</td>
                  <td className="px-3 py-3">
                    <VtvBadge vtv={v.vtv} vtvStatus={v.vtv_status} diasRestantes={v.vtv_dias_restantes} />
                  </td>
                  <td className="px-3 py-3">
                    <span className={status.cls}>{status.label}</span>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/vehicles/${v.id}`}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              )
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-12 text-center text-sm text-slate-400 dark:text-slate-500">
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
