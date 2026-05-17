import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ExpensesTable from '@/components/expenses/ExpensesTable'

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  const params = await searchParams

  let query = supabase
    .from('expenses')
    .select('*, vehicle:vehicles(id, plate, vehicle_name, model), created_by_profile:profiles(full_name)')
    .order('date', { ascending: false })

  if (params?.vehicle) query = query.eq('vehicle_id', params.vehicle)

  const { data: expenses } = await query

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            GASTOS
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {expenses?.length ?? 0} registros
          </p>
        </div>
        {isAdmin && (
          <Link href="/expenses/new" className="btn-primary flex items-center gap-2">
            + Nuevo Gasto
          </Link>
        )}
      </div>
      <ExpensesTable expenses={expenses ?? []} isAdmin={isAdmin} />
    </div>
  )
}