import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VehicleForm from '@/components/vehicles/VehicleForm'
import PageHeader from '@/components/ui/PageHeader'

export default async function NewVehiclePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard?error=unauthorized')

  return (
    <div className="p-6 md:p-8 max-w-2xl animate-fadeIn">
      <PageHeader title="NUEVO VEHÍCULO" />
      <VehicleForm />
    </div>
  )
}
