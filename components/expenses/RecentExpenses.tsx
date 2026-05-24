import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Expense, Vehicle } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  combustible:   '⛽ Combustible',
  mantenimiento: '🔧 Mantenimiento',
  reparacion:    '🛠️ Reparación',
  seguro:        '🛡️ Seguro',
  patente:       '📋 Patente',
  lavado:        '🚿 Lavado',
  neumaticos:    '⭕ Neumáticos',
  otro:          '📌 Otro',
}

type ExpenseWithVehicle = Expense & {
  vehicle?: Pick<Vehicle, 'plate' | 'vehicle_name' | 'model'> | null
}

export default function RecentExpenses({ expenses }: { expenses: ExpenseWithVehicle[] }) {
  return (
    <div className="card" style={{ borderTop: '2px solid var(--color-expenses)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h2 className="font-display text-lg font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          GASTOS RECIENTES
        </h2>
        <Link href="/expenses" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-expenses)' }}>
          Ver todos <ArrowRight size={13} />
        </Link>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {expenses.map((e) => (
          <div key={e.id} className="px-5 py-3 table-row-hover">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  {CATEGORY_LABELS[e.category] ?? e.category}
                </p>
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {e.vehicle ? e.vehicle.vehicle_name : '—'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {e.vehicle?.plate} · {new Date(e.date).toLocaleDateString('es-AR')}
                </p>
              </div>
              <p className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--color-expenses)' }}>
                ${Number(e.amount).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            No hay gastos registrados
          </p>
        )}
      </div>
    </div>
  )
}
