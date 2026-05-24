import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import VehicleForm from '@/components/vehicles/VehicleForm'
import PageHeader from '@/components/ui/PageHeader'

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard?error=unauthorized')

  const { data: vehicle } = await supabase.from('vehicles').select('*').eq('id', id).single()
  if (!vehicle) notFound()

  return (
    <div className="p-6 max-w-2xl animate-fadeIn">
      <PageHeader
        title="EDITAR VEHÍCULO"
        back={{ href: `/vehicles/${id}`, label: 'Volver al vehículo' }}
      />
      <VehicleForm vehicle={vehicle} />
    </div>
  )
}
