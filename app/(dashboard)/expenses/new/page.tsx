import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import PageHeader from '@/components/ui/PageHeader'

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, id').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard?error=unauthorized')

  const params = await searchParams
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, plate, vehicle_name, model')
    .neq('status', 'baja')
    .order('plate')

  return (
    <div className="p-6 md:p-8 max-w-2xl animate-fadeIn">
      <PageHeader title="REGISTRAR GASTO" />
      <ExpenseForm vehicles={vehicles ?? []} defaultVehicleId={params?.vehicle} userId={profile.id} />
    </div>
  )
}
