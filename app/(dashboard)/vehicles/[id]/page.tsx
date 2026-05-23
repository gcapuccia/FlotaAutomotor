import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Wrench } from 'lucide-react'
import FileUploader from '@/components/vehicles/FileUploader'
import ExpenseList from '@/components/expenses/ExpenseList'

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  activo:        { label: 'Activo',        cls: 'badge-active' },
  en_reparacion: { label: 'En Reparación', cls: 'badge-repair' },
  disponible:    { label: 'Disponible',    cls: 'badge-available' },
  baja:          { label: 'De Baja',       cls: 'badge-off' },
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

const { data: vehicle } = await supabase
  .from('vehicles')
  .select('*')
  .eq('id', id)
  .single()

  if (!vehicle) notFound()

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, created_by_profile:profiles(full_name)')
    .eq('vehicle_id', id)
    .order('date', { ascending: false })

  const { data: files } = await supabase
    .from('vehicle_files')
    .select('*, uploaded_by_profile:profiles(full_name)')
    .eq('vehicle_id', id)
    .order('created_at', { ascending: false })

  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0
  const status = STATUS_MAP[vehicle.status] ?? { label: vehicle.status, cls: '' }

  return (
    <div className="p-6 md:p-8 animate-fadeIn">
      {/* Back */}
      <Link href="/vehicles" className="flex items-center gap-2 mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} /> Volver a vehículos
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-4xl font-bold tracking-widest" style={{ color: 'var(--accent-primary)' }}>
              {vehicle.plate}
            </h1>
            <span className={`text-xs px-2 py-1 rounded-md font-semibold ${status.cls}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
            {vehicle.vehicle_name} {vehicle.model} {vehicle.year}
          </p>
          {vehicle.assigned_profile && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Asignado a: <strong>{vehicle.assigned_profile.full_name}</strong>
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href={`/vehicles/${id}/edit`} className="btn-ghost">Editar</Link>
            <Link href={`/expenses/new?vehicle=${id}`} className="btn-primary flex items-center gap-2">
              <Plus size={14} /> Nuevo Gasto
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle info */}
        <div className="space-y-4">
          <div className="card p-5" style={{ borderTop: '2px solid var(--accent-primary)' }}>
            <h3 className="font-display font-semibold tracking-wider mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
              Datos del Vehículo
            </h3>
            <dl className="space-y-3">
              {[
                  ['Patente',   vehicle.plate],
                  ['Vehículo',  vehicle.vehicle_name],
                  ['Modelo',    vehicle.model],
                  ['Tipo',      vehicle.type],
                  ['Titular',   vehicle.titular],
                  ['Chofer',    vehicle.driver ?? '—'],
                  ['Flota',     vehicle.flota ?? '—'],
                  ['Interno',   vehicle.interno ?? '—'],
                  ['Motor',     vehicle.motor ?? '—'],
                  ['Chasis',    vehicle.chasis ?? '—'],
                  ['Llave',     vehicle.llave ?? '—'],
                  ['Título',    vehicle.titulo ?? '—'],
                  ['VTV',       vehicle.vtv ? new Date(vehicle.vtv + 'T00:00:00').toLocaleDateString('es-AR') : '—'],
                ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between">
                  <dt className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</dt>
                  <dd className="text-sm font-medium text-right" style={{ color: 'var(--text-primary)' }}>{value}</dd>
                </div>
              ))}
            </dl>
            {vehicle.notes && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Notas</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{vehicle.notes}</p>
              </div>
            )}
          </div>

          {/* Total expenses card */}
          <div className="card p-5" style={{ borderTop: '2px solid #a78bfa' }}>
            <div className="flex items-center gap-2 mb-2">
              <Wrench size={14} style={{ color: '#a78bfa' }} />
              <p className="font-display text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                Total Gastos
              </p>
            </div>
            <p className="font-display text-3xl font-bold" style={{ color: '#a78bfa' }}>
              ${totalExpenses.toLocaleString('es-AR')}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {expenses?.length ?? 0} registros de gastos
            </p>
          </div>

          {/* Files */}
          <FileUploader
            vehicleId={id}
            files={files ?? []}
            isAdmin={isAdmin}
          />
        </div>

        {/* Expenses list */}
        <div className="lg:col-span-2">
          <ExpenseList expenses={expenses ?? []} vehicleId={id} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  )
}
