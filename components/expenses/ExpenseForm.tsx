'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ExpenseCategory } from '@/types'

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

interface ExistingExpense {
  id: string
  vehicle_id: string
  category: ExpenseCategory
  amount: number
  date: string
  description: string | null
  mechanic_name: string | null
  workshop_name: string | null
  invoice_number: string | null
  mileage_at_expense: number | null
}

interface Props {
  vehicles: { id: string; plate: string; vehicle_name: string; model: string }[]
  defaultVehicleId?: string
  userId: string
  expense?: ExistingExpense
}

export default function ExpenseForm({ vehicles, defaultVehicleId, userId, expense }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!expense

  const [form, setForm] = useState({
    vehicle_id: expense?.vehicle_id ?? defaultVehicleId ?? '',
    category: (expense?.category ?? 'reparacion') as ExpenseCategory,
    amount: expense?.amount?.toString() ?? '',
    date: expense?.date ?? new Date().toISOString().split('T')[0],
    description: expense?.description ?? '',
    mechanic_name: expense?.mechanic_name ?? '',
    workshop_name: expense?.workshop_name ?? '',
    invoice_number: expense?.invoice_number ?? '',
    mileage_at_expense: expense?.mileage_at_expense?.toString() ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const selectedCategory = CATEGORIES.find((c) => c.value === form.category)
  const showMechanic = selectedCategory?.showMechanic

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.vehicle_id) { setError('Seleccioná un vehículo'); return }
    setLoading(true)
    setError(null)

    const payload = {
      vehicle_id: form.vehicle_id,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      description: form.description || null,
      mechanic_name: form.mechanic_name || null,
      workshop_name: form.workshop_name || null,
      invoice_number: form.invoice_number || null,
      mileage_at_expense: form.mileage_at_expense ? Number(form.mileage_at_expense) : null,
    }

    const { error } = isEditing
      ? await supabase.from('expenses').update(payload).eq('id', expense!.id)
      : await supabase.from('expenses').insert({ ...payload, created_by: userId })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(isEditing ? `/expenses/${expense!.id}` : defaultVehicleId ? `/vehicles/${defaultVehicleId}` : '/expenses')
      router.refresh()
    }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5" style={{ borderTop: '2px solid #a78bfa' }}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Vehículo *">
          <select className="input-base" value={form.vehicle_id} onChange={(e) => set('vehicle_id', e.target.value)} required>
            <option value="">Seleccionar...</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.plate} — {v.vehicle_name} {v.model}</option>
            ))}
          </select>
        </Field>
        <Field label="Categoría *">
          <select className="input-base" value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Importe ($) *">
          <input type="number" step="0.01" min="0" className="input-base" value={form.amount}
            onChange={(e) => set('amount', e.target.value)} required placeholder="0.00" />
        </Field>
        <Field label="Fecha *">
          <input type="date" className="input-base" value={form.date}
            onChange={(e) => set('date', e.target.value)} required />
        </Field>
      </div>

      <Field label="Descripción">
        <textarea className="input-base" rows={2} value={form.description}
          onChange={(e) => set('description', e.target.value)} placeholder="Detalle del gasto..." />
      </Field>

      {showMechanic && (
        <div className="p-4 rounded-lg space-y-4" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#f59e0b' }}>
            Datos del Taller / Mecánico
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre del Taller">
              <input className="input-base" value={form.workshop_name}
                onChange={(e) => set('workshop_name', e.target.value)} placeholder="Taller XYZ" />
            </Field>
            <Field label="Nombre del Mecánico">
              <input className="input-base" value={form.mechanic_name}
                onChange={(e) => set('mechanic_name', e.target.value)} placeholder="Juan Pérez" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nro. Factura / Remito">
              <input className="input-base" value={form.invoice_number}
                onChange={(e) => set('invoice_number', e.target.value)} placeholder="0001-00012345" />
            </Field>
            <Field label="Km al momento del gasto">
              <input type="number" min="0" className="input-base" value={form.mileage_at_expense}
                onChange={(e) => set('mileage_at_expense', e.target.value)} placeholder="150000" />
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
          {loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Gasto'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  )
}
