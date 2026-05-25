'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { confirmDelete } from '@/lib/swal'
import { createClient } from '@/lib/supabase/client'
import type { Expense, ExpenseCategory } from '@/types'
import VehicleSelect from '@/components/ui/VehicleSelect'

const CATEGORIES: { value: ExpenseCategory; label: string; showMechanic?: boolean }[] = [
  { value: 'combustible',   label: '⛽ Combustible' },
  { value: 'mantenimiento', label: '🔧 Mantenimiento', showMechanic: true },
  { value: 'reparacion',    label: '🛠️ Reparación',    showMechanic: true },
  { value: 'seguro',        label: '🛡️ Seguro' },
  { value: 'patente',       label: '📋 Patente' },
  { value: 'lavado',        label: '🚿 Lavado' },
  { value: 'neumaticos',    label: '⭕ Neumáticos',    showMechanic: true },
  { value: 'otro',          label: '📌 Otro' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )
}

interface Props {
  expense: Expense
  vehicles: { id: string; plate: string; vehicle_name: string; model: string }[]
}

export default function ExpenseEditForm({ expense, vehicles }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    vehicle_id:         expense.vehicle_id,
    category:           expense.category,
    amount:             String(expense.amount),
    date:               expense.date,
    description:        expense.description        ?? '',
    mechanic_name:      expense.mechanic_name      ?? '',
    workshop_name:      expense.workshop_name      ?? '',
    invoice_number:     expense.invoice_number     ?? '',
    mileage_at_expense: expense.mileage_at_expense ? String(expense.mileage_at_expense) : '',
  })

  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const selectedCategory = CATEGORIES.find(c => c.value === form.category)
  const showMechanic = selectedCategory?.showMechanic

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) { setError('El importe debe ser mayor a $0'); return }
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('expenses')
      .update({
        vehicle_id:         form.vehicle_id,
        category:           form.category,
        amount:             Number(form.amount),
        date:               form.date,
        description:        form.description        || null,
        mechanic_name:      form.mechanic_name      || null,
        workshop_name:      form.workshop_name      || null,
        invoice_number:     form.invoice_number     || null,
        mileage_at_expense: form.mileage_at_expense ? Number(form.mileage_at_expense) : null,
      })
      .eq('id', expense.id)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      toast.success('Gasto actualizado')
      router.push('/expenses')
      router.refresh()
    }
  }

  const handleDelete = async () => {
    const { isConfirmed } = await confirmDelete({
      title: '¿Eliminar gasto?',
      text: 'Esta acción no se puede deshacer.',
    })
    if (!isConfirmed) return
    setDeleting(true)

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expense.id)

    if (error) {
      setError(error.message)
      setDeleting(false)
    } else {
      toast.success('Gasto eliminado')
      router.push('/expenses')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5" style={{ borderTop: '2px solid var(--color-expenses)' }}>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Vehículo *">
          <VehicleSelect
            vehicles={vehicles}
            value={form.vehicle_id}
            onChange={(id) => set('vehicle_id', id)}
          />
        </Field>
        <Field label="Categoría *">
          <select className="input-base" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Importe ($) *">
          <input type="number" step="0.01" min="0" className="input-base"
            value={form.amount} onChange={e => set('amount', e.target.value)} required placeholder="0.00" />
        </Field>
        <Field label="Fecha *">
          <input type="date" className="input-base"
            value={form.date} onChange={e => set('date', e.target.value)} required />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea className="input-base" rows={2}
          value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Detalle del gasto..." />
      </Field>

      {showMechanic && (
        <div className="p-4 rounded-lg space-y-4" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
            Datos del Taller / Mecánico
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre del Taller">
              <input className="input-base" value={form.workshop_name}
                onChange={e => set('workshop_name', e.target.value)} placeholder="Taller XYZ" />
            </Field>
            <Field label="Nombre del Mecánico">
              <input className="input-base" value={form.mechanic_name}
                onChange={e => set('mechanic_name', e.target.value)} placeholder="Juan Pérez" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nro. Factura / Remito">
              <input className="input-base" value={form.invoice_number}
                onChange={e => set('invoice_number', e.target.value)} placeholder="0001-00012345" />
            </Field>
            <Field label="Km al momento del gasto">
              <input type="number" min="0" className="input-base" value={form.mileage_at_expense}
                onChange={e => set('mileage_at_expense', e.target.value)} placeholder="150000" />
            </Field>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-md text-sm font-semibold"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          {deleting ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </form>
  )
}
