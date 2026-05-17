import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VehicleForm from '@/components/vehicles/VehicleForm'

export default async function NewVehiclePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard?error=unauthorized')

  return (
    <div className="p-6 max-w-2xl animate-fadeIn">
      <h1 className="font-display text-3xl font-bold tracking-wide mb-6" style={{ color: 'var(--text-primary)' }}>
        NUEVO VEHÍCULO
      </h1>
      <VehicleForm />
    </div>
  )
}
