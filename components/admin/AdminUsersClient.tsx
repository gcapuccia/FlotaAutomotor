'use client'

import { useState } from 'react'
import { Plus, Shield, Eye, Trash2, X } from 'lucide-react'
import type { Profile } from '@/types'

export default function AdminUsersClient({ users: initialUsers }: { users: Profile[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '', password: '', full_name: '', role: 'viewer',
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al crear usuario')
      setLoading(false)
    } else {
      setUsers((prev) => [data.user, ...prev])
      setShowModal(false)
      setForm({ email: '', password: '', full_name: '', role: 'viewer' })
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch('/api/admin/update-role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    })
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as 'admin' | 'viewer' } : u))
      )
    }
  }

  return (
    <>
      <div className="card" style={{ borderTop: '2px solid var(--accent-primary)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="font-display text-sm font-semibold tracking-wider uppercase" style={{ color: 'var(--text-secondary)' }}>
            {users.length} usuarios registrados
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm px-4">
            <Plus size={14} /> Crear Usuario
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Nombre', 'Email', 'Rol', 'Creado', 'Acción'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="table-row-hover border-b" style={{ borderColor: 'var(--border)' }}>
                <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {u.full_name ?? '—'}
                </td>
                <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md font-semibold ${u.role === 'admin' ? 'badge-repair' : 'badge-available'}`}>
                    {u.role === 'admin' ? <Shield size={10} /> : <Eye size={10} />}
                    {u.role === 'admin' ? 'Admin' : 'Viewer'}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(u.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-5 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-md"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <option value="viewer">Cambiar a Viewer</option>
                    <option value="admin">Cambiar a Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="card w-full max-w-md p-6" style={{ borderTop: '2px solid var(--accent-primary)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
                CREAR USUARIO
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              {[
                { label: 'Nombre completo', field: 'full_name', type: 'text', placeholder: 'Juan Pérez' },
                { label: 'Email *', field: 'email', type: 'email', placeholder: 'usuario@empresa.com' },
                { label: 'Contraseña *', field: 'password', type: 'password', placeholder: 'Mínimo 6 caracteres' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                  <input
                    type={type}
                    className="input-base"
                    placeholder={placeholder}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    required={field !== 'full_name'}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Rol</label>
                <select className="input-base" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
                  <option value="viewer">Viewer (solo lectura)</option>
                  <option value="admin">Admin (acceso completo)</option>
                </select>
              </div>

              {error && (
                <div className="text-sm px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
