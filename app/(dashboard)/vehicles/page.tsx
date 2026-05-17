import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VehiclesTable from '@/components/vehicles/VehiclesTable'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('plate')

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            VEHÍCULOS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {vehicles?.length ?? 0} vehículos registrados
          </p>
        </div>
        {isAdmin && (
          <Link href="/vehicles/new" className="btn-primary flex items-center gap-2">
            + Nuevo Vehículo
          </Link>
        )}
      </div>
      <VehiclesTable vehicles={vehicles ?? []} isAdmin={isAdmin} />
    </div>
  )
}