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
    { label: 'Total vehículos', value: stats.total },
    { label: 'Activos',         value: stats.active },
    { label: 'En reparación',   value: stats.in_repair },
    { label: 'Disponibles',     value: stats.available },
    {
      label: 'Gastos del mes',
      value: `$${stats.month_expenses.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-5" style={{ margin: '1%' }}>
      {cards.map((card) => (
        <div key={card.label} className="card animate-fadeIn p-6" style={{ margin: '1%' }}>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {card.label}
          </p>
          <hr className="my-3 border-slate-200 dark:border-slate-700/60" />
          <h3 className="tabular-nums text-4xl font-bold text-slate-900 dark:text-slate-100">
            {card.value}
          </h3>
        </div>
      ))}
    </div>
  )
}
