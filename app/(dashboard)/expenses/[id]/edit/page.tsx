import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ExpenseForm from '@/components/expenses/ExpenseForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, id').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard?error=unauthorized')

  const { data: expense } = await supabase
    .from('expenses')
    .select('id, vehicle_id, category, amount, date, description, mechanic_name, workshop_name, invoice_number, mileage_at_expense')
    .eq('id', id)
    .single()

  if (!expense) notFound()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id, plate, vehicle_name, model')
    .order('plate')

  return (
    <div className="p-6 max-w-2xl animate-fadeIn">
      <Link href={`/expenses/${id}`} className="flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft size={14} /> Volver al gasto
      </Link>
      <h1 className="font-display text-3xl font-bold tracking-wide mb-6" style={{ color: 'var(--text-primary)' }}>
        EDITAR GASTO
      </h1>
      <ExpenseForm vehicles={vehicles ?? []} expense={expense} userId={profile.id} />
    </div>
  )
}
