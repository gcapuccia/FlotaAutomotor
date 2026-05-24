import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import VehiclesTable from '@/components/vehicles/VehiclesTable'
import PageHeader from '@/components/ui/PageHeader'

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
    <div className="p-6 md:p-8 animate-fadeIn">
      <PageHeader
        title="VEHÍCULOS"
        subtitle={`${vehicles?.length ?? 0} vehículos registrados`}
        action={isAdmin ? (
          <Link href="/vehicles/new" className="btn-primary">
            + Nuevo Vehículo
          </Link>
        ) : undefined}
      />
      <VehiclesTable vehicles={vehicles ?? []} isAdmin={isAdmin} />
    </div>
  )
}