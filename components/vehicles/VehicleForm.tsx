'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Vehicle, VehicleType, VehicleStatus } from '@/types'

const TYPES: { value: VehicleType; label: string }[] = [
  { value: 'sedan', label: 'Sedán' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pick-up' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Camión' },
  { value: 'motorcycle', label: 'Motocicleta' },
  { value: 'otro', label: 'Otro' },
]

const STATUSES: { value: VehicleStatus; label: string }[] = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'activo', label: 'Activo' },
  { value: 'en_reparacion', label: 'En Reparación' },
  { value: 'baja', label: 'De Baja' },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

interface Props {
  vehicle?: Vehicle
}

export default function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const isEdit = !!vehicle

  const [form, setForm] = useState({
    interno:      vehicle?.interno      ?? '',
    plate:        vehicle?.plate        ?? '',
    vehicle_name: vehicle?.vehicle_name ?? '',
    model:        vehicle?.model        ?? '',
    driver:       vehicle?.driver       ?? '',
    titular:      vehicle?.titular      ?? '',
    type:         (vehicle?.type        ?? 'sedan') as VehicleType,
    flota:        vehicle?.flota        ?? '',
    llave:        vehicle?.llave        ?? '',
    titulo:       vehicle?.titulo       ?? '',
    status:       (vehicle?.status      ?? 'disponible') as VehicleStatus,
    motor:        vehicle?.motor        ?? '',
    chasis:       vehicle?.chasis       ?? '',
    vtv:          vehicle?.vtv          ?? '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      interno:      form.interno      || null,
      plate:        form.plate.toUpperCase(),
      vehicle_name: form.vehicle_name,
      model:        form.model,
      driver:       form.driver       || null,
      titular:      form.titular,
      type:         form.type,
      flota:        form.flota        || null,
      llave:        form.llave        || null,
      titulo:       form.titulo       || null,
      status:       form.status,
      motor:        form.motor        || null,
      chasis:       form.chasis       || null,
      vtv:          form.vtv          || null,
    }

    const { error } = isEdit
      ? await supabase.from('vehicles').update(payload).eq('id', vehicle!.id)
      : await supabase.from('vehicles').insert(payload)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/vehicles')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-5" style={{ borderTop: '2px solid var(--accent-primary)' }}>

      {/* Identificación */}
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Identificación</p>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Interno">
          <input className="input-base" value={form.interno} onChange={(e) => set('interno', e.target.value)} placeholder="001" />
        </Field>
        <Field label="Patente *">
          <input className="input-base uppercase" value={form.plate} onChange={(e) => set('plate', e.target.value)} required placeholder="ABC123" />
        </Field>
        <Field label="Estado">
          <select className="input-base" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Vehículo *">
          <input className="input-base" value={form.vehicle_name} onChange={(e) => set('vehicle_name', e.target.value)} required placeholder="Ford Transit" />
        </Field>
        <Field label="Modelo *">
          <input className="input-base" value={form.model} onChange={(e) => set('model', e.target.value)} required placeholder="2022" />
        </Field>
      </div>

      {/* Personas */}
      <p className="text-xs font-semibold uppercase tracking-widest pt-2" style={{ color: 'var(--text-muted)' }}>Personas</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Titular *">
          <input className="input-base" value={form.titular} onChange={(e) => set('titular', e.target.value)} required placeholder="Empresa S.A." />
        </Field>
        <Field label="Chofer">
          <input className="input-base" value={form.driver} onChange={(e) => set('driver', e.target.value)} placeholder="Juan Pérez" />
        </Field>
      </div>

      {/* Clasificación */}
      <p className="text-xs font-semibold uppercase tracking-widest pt-2" style={{ color: 'var(--text-muted)' }}>Clasificación</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipo">
          <select className="input-base" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Flota">
          <input className="input-base" value={form.flota} onChange={(e) => set('flota', e.target.value)} placeholder="Flota Norte" />
        </Field>
      </div>

      {/* Documentación */}
      <p className="text-xs font-semibold uppercase tracking-widest pt-2" style={{ color: 'var(--text-muted)' }}>Documentación</p>
      <div className="grid grid-cols-3 gap-4">
        <Field label="VTV (vencimiento)">
          <input type="date" className="input-base" value={form.vtv} onChange={(e) => set('vtv', e.target.value)} />
        </Field>
        <Field label="Llave">
          <input className="input-base" value={form.llave} onChange={(e) => set('llave', e.target.value)} placeholder="Copia en oficina" />
        </Field>
        <Field label="Título">
          <input className="input-base" value={form.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Original en caja" />
        </Field>
      </div>

      {/* Datos técnicos */}
      <p className="text-xs font-semibold uppercase tracking-widest pt-2" style={{ color: 'var(--text-muted)' }}>Datos Técnicos</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nro. Motor">
          <input className="input-base" value={form.motor} onChange={(e) => set('motor', e.target.value)} placeholder="ABC123456" />
        </Field>
        <Field label="Nro. Chasis">
          <input className="input-base" value={form.chasis} onChange={(e) => set('chasis', e.target.value)} placeholder="9BWZZZ377VT004251" />
        </Field>
      </div>

      {error && (
        <div className="text-sm px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Vehículo'}
        </button>
        <button type="button" onClick={() => router.back()} className="btn-ghost">
          Cancelar
        </button>
      </div>
    </form>
  )
}
