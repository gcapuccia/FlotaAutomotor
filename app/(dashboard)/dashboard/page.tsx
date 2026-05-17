import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardStats from '@/components/dashboard/DashboardStats'
import VehicleTable from '@/components/vehicles/VehicleTable'
import RecentExpenses from '@/components/expenses/RecentExpenses'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams

  // Fetch vehicles
/*   const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*, assigned_profile:profiles(id, full_name, email)')
    .order('created_at', { ascending: false }) */
    const { data: vehicles } = await supabase
  .from('vehicles')
  .select('*')
  .order('created_at', { ascending: false })

  // Fetch expenses (current month)
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const { data: monthExpenses } = await supabase
    .from('expenses')
    .select('*')
    .gte('date', firstDay)

  // Fetch recent expenses with vehicle info
  const { data: recentExpenses } = await supabase
    .from('expenses')
    .select('*, vehicle:vehicles(plate, vehicle_name, model)')
    .order('date', { ascending: false })
    .limit(8)

  const stats = {
    total: vehicles?.length ?? 0,
    active: vehicles?.filter(v => v.status === 'activo').length ?? 0,
    in_repair: vehicles?.filter(v => v.status === 'en_reparacion').length ?? 0,
    available: vehicles?.filter(v => v.status === 'disponible').length ?? 0,
    off: vehicles?.filter(v => v.status === 'baja').length ?? 0,
    month_expenses: monthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0,
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            DASHBOARD
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {params?.error === 'unauthorized' && (
          <div className="text-sm px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            No tenés permisos para acceder a esa sección
          </div>
        )}
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <VehicleTable vehicles={vehicles ?? []} />
        </div>
        <div>
          <RecentExpenses expenses={recentExpenses ?? []} />
        </div>
      </div>
    </div>
  )
}
