import { Car, CheckCircle2, Wrench, Clock, DollarSign, CalendarClock } from 'lucide-react'

interface VtvInfo {
  plate: string
  vehicle_name: string
  model: string
  days: number
}

interface Stats {
  total: number
  active: number
  in_repair: number
  available: number
  off: number
  month_expenses: number
  next_vtv: VtvInfo | null
}

function vtvAccent(days: number) {
  if (days < 0) return '#ef4444'
  if (days <= 30) return '#f59e0b'
  return '#22c55e'
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'Total vehículos', value: stats.total,    icon: Car,          color: '#64748b', small: false },
    { label: 'Activos',         value: stats.active,   icon: CheckCircle2, color: '#22c55e', small: false },
    { label: 'En reparación',   value: stats.in_repair,icon: Wrench,       color: '#f59e0b', small: false },
    { label: 'Disponibles',     value: stats.available,icon: Clock,        color: '#3b82f6', small: false },
    {
      label: 'Gastos del mes',
      value: `$${stats.month_expenses.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: '#a78bfa',
      small: true,
    },
  ]

  const vtv = stats.next_vtv
  const vtvColor = vtv ? vtvAccent(vtv.days) : '#64748b'

  return (
    <div style={{ margin: '1%' }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6" style={{ gap: '1rem' }}>
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="card animate-fadeIn p-5"
              style={{ borderTop: `3px solid ${card.color}` }}
            >
              <div className="mb-3 flex items-start justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {card.label}
                </p>
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
                  style={{ background: `${card.color}1a` }}
                >
                  <Icon size={50} style={{ color: card.color }} />
                </div>
              </div>
              <p className={`tabular-nums font-bold ${card.small ? 'text-2xl' : 'text-3xl'}`} style={{ color: 'var(--text-primary)' }}>
                {card.value}
              </p>
            </div>
          )
        })}

        {/* VTV card */}
        <div
          className="card animate-fadeIn p-5"
          style={{ borderTop: `3px solid ${vtvColor}` }}
        >
          <div className="mb-3 flex items-start justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Próximo VTV
            </p>
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md"
              style={{ background: `${vtvColor}1a` }}
            >
              <CalendarClock size={50} style={{ color: vtvColor }} />
            </div>
          </div>
          {vtv ? (
            <>
              <p className="tabular-nums text-2xl font-bold" style={{ color: vtvColor }}>
                {vtv.days < 0 ? 'Vencida' : `${vtv.days} días`}
              </p>
              <p className="mt-1 truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                {vtv.days < 0 ? `hace ${Math.abs(vtv.days)} días · ` : ''}{vtv.plate} · {vtv.vehicle_name}
              </p>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Sin datos de VTV
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
