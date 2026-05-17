import { Car, Wrench, CircleCheck, CircleMinus, DollarSign } from 'lucide-react'

interface Stats {
  total: number
  active: number
  in_repair: number
  available: number
  off: number
  month_expenses: number
}

export default function DashboardStats({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Total Vehículos',
      value: stats.total,
      icon: Car,
      color: 'var(--accent-primary)',
      bg: 'var(--accent-glow)',
    },
    {
      label: 'Activos',
      value: stats.active,
      icon: CircleCheck,
      color: 'var(--status-active)',
      bg: 'rgba(34,197,94,0.1)',
    },
    {
      label: 'En Reparación',
      value: stats.in_repair,
      icon: Wrench,
      color: 'var(--status-repair)',
      bg: 'rgba(245,158,11,0.1)',
    },
    {
      label: 'Disponibles',
      value: stats.available,
      icon: CircleMinus,
      color: 'var(--status-available)',
      bg: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'Gastos del Mes',
      value: `$${stats.month_expenses.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.1)',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="card p-5 animate-fadeIn"
            style={{ borderTop: `2px solid ${card.color}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {card.label}
              </p>
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: card.bg }}
              >
                <Icon size={15} style={{ color: card.color }} />
              </div>
            </div>
            <p className="font-display text-3xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        )
      })}
    </div>
  )
}
