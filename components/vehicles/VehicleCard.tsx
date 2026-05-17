import Link from 'next/link'
import { Car, User, Wrench, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import type { Vehicle, VtvStatus } from '@/types'

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  activo:        { label: 'Activo',        cls: 'badge-active',    dot: '#22c55e' },
  en_reparacion: { label: 'En Reparación', cls: 'badge-repair',    dot: '#f59e0b' },
  disponible:    { label: 'Disponible',    cls: 'badge-available', dot: '#3b82f6' },
  baja:          { label: 'De Baja',       cls: 'badge-off',       dot: '#ef4444' },
}

const TYPE_LABELS: Record<string, string> = {
  sedan: 'Sedán', suv: 'SUV', pickup: 'Pick-up',
  van: 'Van', truck: 'Camión', motorcycle: 'Moto', otro: 'Otro',
}

function VtvChip({ vtv, vtvStatus, dias }: { vtv: string | null; vtvStatus?: VtvStatus | null; dias?: number | null }) {
  if (!vtv) return null
  const fecha = new Date(vtv + 'T00:00:00').toLocaleDateString('es-AR')
  if (vtvStatus === 'vencida')    return <span className="text-xs" style={{ color: '#ef4444' }}><AlertTriangle size={10} className="inline mr-1"/>VTV {fecha}</span>
  if (vtvStatus === 'por_vencer') return <span className="text-xs" style={{ color: '#f59e0b' }}><Clock size={10} className="inline mr-1"/>VTV {fecha} ({dias}d)</span>
  return <span className="text-xs" style={{ color: '#22c55e' }}><CheckCircle size={10} className="inline mr-1"/>VTV {fecha}</span>
}

export default function VehicleCard({ vehicle: v, isAdmin }: { vehicle: Vehicle; isAdmin: boolean }) {
  const status = STATUS_MAP[v.status] ?? { label: v.status, cls: '', dot: '#888' }

  return (
    <div className="card hover:border-orange-500/30 transition-all duration-200 animate-fadeIn"
      style={{ borderTop: "2px solid " + status.dot }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              {v.interno && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>#{v.interno}</span>}
              <span className="font-display text-2xl font-bold tracking-widest" style={{ color: 'var(--accent-primary)' }}>{v.plate}</span>
            </div>
            <p className="font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{v.vehicle_name}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{v.model}</p>
          </div>
          <span className={"text-xs px-2 py-1 rounded-md font-semibold " + status.cls}>{status.label}</span>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <Car size={12} /> <span>{TYPE_LABELS[v.type] ?? v.type}</span>
            {v.flota && <><span style={{ color: 'var(--text-muted)' }}>·</span><span>{v.flota}</span></>}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <User size={12} />
            <span>Titular: <strong>{v.titular}</strong></span>
          </div>
          {v.driver && (
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <User size={12} />
              <span>Chofer: {v.driver}</span>
            </div>
          )}
          <VtvChip vtv={v.vtv} vtvStatus={v.vtv_status} dias={v.vtv_dias_restantes} />
        </div>

        <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href={"/vehicles/" + v.id} className="btn-ghost text-xs flex-1 text-center py-1.5">
            Ver detalle
          </Link>
          <Link href={"/expenses?vehicle=" + v.id}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md font-semibold"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Wrench size={12} /> Gastos
          </Link>
        </div>
      </div>
    </div>
  )
}
