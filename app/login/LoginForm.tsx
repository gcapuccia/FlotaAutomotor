'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
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
    <div className="login-page">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Image
            src="/Logoflota.png"
            alt="FleetOps"
            width={0}
            height={0}
            sizes="100vw"
            className="mx-auto mb-5 rounded-2xl"
            style={{ width: 'auto', height: '240px' }}
          />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            FleetOps
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Gestión de flota vehicular
          </p>
        </div>

        {/* Form card */}
        <div className="card login-card p-6">
          <h2 className="mb-5 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Iniciar sesión
          </h2>

          {expired && (
            <div className="mb-4 rounded-md border border-orange-200/80 bg-orange-50 px-3 py-2.5 text-xs text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
              Tu sesión expiró después de 4 horas. Ingresá nuevamente.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
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
              <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
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
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Contactá al administrador si no tenés acceso.
        </p>
      </div>
    </div>
  )
}
