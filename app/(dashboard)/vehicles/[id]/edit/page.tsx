import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import VehicleForm from '@/components/vehicles/VehicleForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

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
      <Link href={"/vehicles/" + id} className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} /> Volver al vehículo
      </Link>
      <h1 className="font-display text-3xl font-bold tracking-wide mb-6" style={{ color: 'var(--text-primary)' }}>
        EDITAR VEHÍCULO
      </h1>
      <VehicleForm vehicle={vehicle} />
    </div>
  )
}
