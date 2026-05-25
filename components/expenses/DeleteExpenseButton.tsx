'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export default function DeleteExpenseButton({ expenseId }: { expenseId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId)
    if (error) {
      setError('Error al eliminar: ' + error.message)
      setLoading(false)
      setConfirming(false)
    } else {
      router.push('/expenses')
      router.refresh()
    }
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            ¿Confirmar eliminación?
          </span>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-md font-semibold"
            style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            {loading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="btn-ghost text-xs px-3 py-1.5"
          >
            Cancelar
          </button>
        </div>
        {error && (
          <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
        )}
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-md font-semibold"
      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
    >
      <Trash2 size={13} /> Eliminar
    </button>
  )
}
