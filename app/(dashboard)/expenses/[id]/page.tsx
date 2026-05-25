import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import DeleteExpenseButton from '@/components/expenses/DeleteExpenseButton'

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

export default async function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: expense } = await supabase
    .from('expenses')
    .select('*, vehicle:vehicles(id, plate, vehicle_name, model), created_by_profile:profiles(full_name)')
    .eq('id', id)
    .single()

  if (!expense) notFound()

  const formattedDate = new Date(expense.date + 'T00:00:00').toLocaleDateString('es-AR')
  const formattedAmount = Number(expense.amount).toLocaleString('es-AR')

  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="text-sm text-right font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl animate-fadeIn">
      <Link href="/expenses" className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} /> Volver a gastos
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            DETALLE DEL GASTO
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{formattedDate}</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Link href={`/expenses/${id}/edit`} className="btn-ghost text-sm">
              Editar
            </Link>
            <DeleteExpenseButton expenseId={id} />
          </div>
        )}
      </div>

      <div className="card p-6 space-y-4" style={{ borderTop: '2px solid #a78bfa' }}>
        {/* Categoría + importe destacado */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="font-display text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {CATEGORY_LABELS[expense.category] ?? expense.category}
          </span>
          <span className="font-display text-3xl font-bold" style={{ color: '#a78bfa' }}>
            ${formattedAmount}
          </span>
        </div>

        {/* Vehículo */}
        {expense.vehicle && (
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Vehículo</span>
            <Link
              href={`/vehicles/${expense.vehicle.id}`}
              className="text-sm font-semibold hover:underline font-display tracking-wider"
              style={{ color: 'var(--accent-primary)' }}
            >
              {expense.vehicle.plate}
              <span className="ml-2 font-normal font-sans text-xs" style={{ color: 'var(--text-secondary)' }}>
                {expense.vehicle.vehicle_name} {expense.vehicle.model}
              </span>
            </Link>
          </div>
        )}

        <Row label="Fecha" value={formattedDate} />

        {expense.description && (
          <Row label="Descripción" value={expense.description} />
        )}

        {expense.mileage_at_expense && (
          <Row label="Kilometraje" value={`${expense.mileage_at_expense.toLocaleString('es-AR')} km`} />
        )}

        {(expense.workshop_name || expense.mechanic_name || expense.invoice_number) && (
          <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
              Datos del Taller / Mecánico
            </p>
            {expense.workshop_name && <Row label="Taller" value={expense.workshop_name} />}
            {expense.mechanic_name && <Row label="Mecánico" value={expense.mechanic_name} />}
            {expense.invoice_number && <Row label="Factura / Remito" value={expense.invoice_number} />}
          </div>
        )}

        {expense.created_by_profile && (
          <div className="flex justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Registrado por</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {expense.created_by_profile.full_name}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
