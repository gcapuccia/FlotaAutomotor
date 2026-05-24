import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Car, DollarSign } from 'lucide-react'
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

  const [{ data: profile }, { data: vehicles }, { data: monthExpenses }, { data: recentExpenses }] =
    await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase.from('vehicles').select('*').order('created_at', { ascending: false }),
      supabase
        .from('expenses')
        .select('amount')
        .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      supabase
        .from('expenses')
        .select('*, vehicle:vehicles(plate, vehicle_name, model)')
        .order('date', { ascending: false })
        .limit(8),
    ])

  const isAdmin = profile?.role === 'admin'

  const nextVtvVehicle = vehicles
    ?.filter(v => v.vtv && v.status === 'activo')
    .sort((a, b) => new Date(a.vtv + 'T00:00:00').getTime() - new Date(b.vtv + 'T00:00:00').getTime())
    [0] ?? null

  const todayMs = new Date(new Date().toDateString()).getTime()

  const stats = {
    total: vehicles?.length ?? 0,
    active: vehicles?.filter(v => v.status === 'activo').length ?? 0,
    in_repair: vehicles?.filter(v => v.status === 'en_reparacion').length ?? 0,
    available: vehicles?.filter(v => v.status === 'disponible').length ?? 0,
    off: vehicles?.filter(v => v.status === 'baja').length ?? 0,
    month_expenses: monthExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0,
    next_vtv: nextVtvVehicle ? {
      plate: nextVtvVehicle.plate,
      vehicle_name: nextVtvVehicle.vehicle_name,
      model: nextVtvVehicle.model,
      days: Math.round((new Date(nextVtvVehicle.vtv + 'T00:00:00').getTime() - todayMs) / 86400000),
    } : null,
  }

  return (
    <div className="animate-fadeIn space-y-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8" style={{ margin: '2%' }}>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 capitalize">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center" style={{ gap: '1.5rem' }}>
          {params?.error === 'unauthorized' && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              No tenés permisos para esa sección
            </p>
          )}
          {isAdmin && (
            <Link href="/vehicles/new" className="btn-primary">
              <Car size={16} />
              Agregar vehículo
            </Link>
          )}
          {isAdmin && (
            <Link href="/expenses/new" className="btn-primary">
              <DollarSign size={16} />
              Agregar gasto
            </Link>
          )}
        </div>
      </div>

      <DashboardStats stats={stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3" style={{ margin: '1%', gap: '1.5rem' }}>
        <div>
          <RecentExpenses expenses={recentExpenses ?? []} />
        </div>
        <div className="xl:col-span-2">
          <VehicleTable vehicles={vehicles ?? []} />
        </div>
      </div>
    </div>
  )
}
