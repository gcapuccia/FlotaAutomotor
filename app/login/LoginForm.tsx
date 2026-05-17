'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const expired = searchParams.get('expired')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales inválidas. Verificá tu email y contraseña.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md animate-fadeIn">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold tracking-wide mb-1" style={{ color: 'var(--text-primary)' }}>
            FLEET<span style={{ color: 'var(--accent-primary)' }}>OPS</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sistema de Gestión de Flota Vehicular
          </p>
        </div>

        <div className="card p-8" style={{ borderTop: '2px solid var(--accent-primary)' }}>
          <h2 className="font-display text-xl font-semibold mb-6" style={{ color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Iniciar Sesión
          </h2>

          {expired && (
            <div className="text-sm px-3 py-2 rounded-md mb-5" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              ⏱ Tu sesión expiró después de 4 horas. Ingresá nuevamente.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-base" placeholder="usuario@empresa.com" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-base" placeholder="••••••••" required autoComplete="current-password" />
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base" style={{ width: '100%' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          Contactá al administrador si no tenés acceso
        </p>
      </div>
    </div>
  )
}