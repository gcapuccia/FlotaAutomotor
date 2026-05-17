'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  // En app/login/page.tsx, leer el searchParam
  const expired = useSearchParams?.get('expired')

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
      {/* Background grid effect */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="w-full max-w-md animate-fadeIn">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4"
            style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)' }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M4 22L8 10h16l4 12H4z" fill="var(--accent-primary)" opacity="0.9"/>
              <rect x="7" y="22" width="4" height="3" rx="2" fill="var(--accent-primary)"/>
              <rect x="21" y="22" width="4" height="3" rx="2" fill="var(--accent-primary)"/>
              <path d="M9 15h14M10 18h3M19 18h3" stroke="var(--bg-primary)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-wide mb-1" style={{ color: 'var(--text-primary)' }}>
            FLEET<span style={{ color: 'var(--accent-primary)' }}>OPS</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sistema de Gestión de Flota Vehicular
          </p>
        </div>

        {/* Card */}
        <div className="card p-8" style={{ borderTop: '2px solid var(--accent-primary)' }}>
          <h2 className="font-display text-xl font-semibold mb-6" style={{ color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-base"
                placeholder="usuario@empresa.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="text-sm px-3 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </div>
            )}
            {expired && (
                <div className="text-sm px-3 py-2 rounded-md" 
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                  Tu sesión expiró por inactividad. Ingresá nuevamente.
                </div>
              )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
              style={{ width: '100%' }}
            >
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
