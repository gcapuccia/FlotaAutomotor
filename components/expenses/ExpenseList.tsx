'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Expense } from '@/types'

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

const MECHANIC_CATEGORIES = ['reparacion', 'mantenimiento']

type ExpenseWithProfile = Expense & { created_by_profile?: { full_name: string } | null }

export default function ExpenseList({
  expenses,
  vehicleId,
  isAdmin,
}: {
  expenses: ExpenseWithProfile[]
  vehicleId: string
  isAdmin: boolean
}) {
  return (
    <div className="card" style={{ borderTop: '2px solid #f59e0b' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="font-display font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          HISTORIAL DE GASTOS
        </h3>
        {isAdmin && (
          <Link href={`/expenses/new?vehicle=${vehicleId}`} className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5">
            <Plus size={13} /> Agregar
          </Link>
        )}
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
        {expenses.map((e) => (
          <div key={e.id} className="px-5 py-4 table-row-hover">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {CATEGORY_LABELS[e.category] ?? e.category}
                  </span>
                  {MECHANIC_CATEGORIES.includes(e.category) && e.workshop_name && (
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                      Taller
                    </span>
                  )}
                </div>

                {e.description && (
                  <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{e.description}</p>
                )}

                {/* Mechanic / Workshop details */}
                {(e.mechanic_name || e.workshop_name) && (
                  <div className="text-xs space-y-0.5 mb-1" style={{ color: 'var(--text-muted)' }}>
                    {e.workshop_name && <p>🏪 {e.workshop_name}</p>}
                    {e.mechanic_name && <p>👤 Mecánico: {e.mechanic_name}</p>}
                    {e.invoice_number && <p>🧾 Factura: {e.invoice_number}</p>}
                  </div>
                )}

                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>{new Date(e.date).toLocaleDateString('es-AR')}</span>
                  {e.mileage_at_expense && <span>· {e.mileage_at_expense.toLocaleString('es-AR')} km</span>}
                  {e.created_by_profile && <span>· por {e.created_by_profile.full_name}</span>}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-display font-bold text-lg" style={{ color: 'var(--color-expenses)' }}>
                  ${Number(e.amount).toLocaleString('es-AR')}
                </p>
              </div>
            </div>
          </div>
        ))}
        {expenses.length === 0 && (
          <p className="px-5 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
            No hay gastos registrados para este vehículo
          </p>
        )}
      </div>
    </div>
  )
}
