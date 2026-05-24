import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ExpenseEditForm from '@/components/expenses/ExpenseEditForm'
import PageHeader from '@/components/ui/PageHeader'

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard?error=unauthorized')

  const { data: expense } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .single()

  if (!expense) notFound()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, plate, vehicle_name, model')
    .order('plate')

  return (
    <div className="p-6 max-w-2xl animate-fadeIn">
      <PageHeader
        title="EDITAR GASTO"
        back={{ href: '/expenses', label: 'Volver a gastos' }}
      />
      <ExpenseEditForm expense={expense} vehicles={vehicles ?? []} />
    </div>
  )
}