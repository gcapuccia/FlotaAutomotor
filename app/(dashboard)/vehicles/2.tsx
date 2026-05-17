import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import VehicleCard from '@/components/vehicles/VehicleCard'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'

const { data: vehicles } = await supabase
  .from('vehicles')
  .select('*')
  .order('created_at', { ascending: false })

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
            <Plus size={16} /> Nuevo Vehículo
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vehicles?.map((v) => (
          <VehicleCard key={v.id} vehicle={v} isAdmin={isAdmin} />
        ))}
        {(!vehicles || vehicles.length === 0) && (
          <div className="col-span-3 card p-12 text-center" style={{ color: 'var(--text-muted)' }}>
            No hay vehículos registrados.{isAdmin && ' Hacé clic en "Nuevo Vehículo" para agregar uno.'}
          </div>
        )}
      </div>
    </div>
  )
}
