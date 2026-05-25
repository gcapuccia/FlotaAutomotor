import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'
import FilesTable from '@/components/files/FilesTable'

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: files } = await supabase
    .from('vehicle_files')
    .select('*, vehicle:vehicles(plate, vehicle_name, model), uploaded_by_profile:profiles(full_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 animate-fadeIn">
      <PageHeader
        title="ARCHIVOS"
        subtitle={`${files?.length ?? 0} archivos almacenados`}
      />

      <FilesTable files={files ?? []} />
    </div>
  )
}
