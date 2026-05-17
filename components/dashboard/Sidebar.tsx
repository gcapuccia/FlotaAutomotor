'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import {
  LayoutDashboard,
  Car,
  Wrench,
  Users,
  FileUp,
  LogOut,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  profile: Profile | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vehicles', label: 'Vehículos', icon: Car },
  { href: '/expenses', label: 'Gastos', icon: Wrench },
  { href: '/files', label: 'Archivos', icon: FileUp },
]

const adminItems = [
  { href: '/admin/users', label: 'Usuarios', icon: Users },
]

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full border-r"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)' }}>
            <Car size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <span className="font-display text-xl font-bold tracking-widest" style={{ color: 'var(--text-primary)' }}>
            FLEET<span style={{ color: 'var(--accent-primary)' }}>OPS</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          Principal
        </p>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
          >
            <Icon size={17} />
            <span>{label}</span>
            {isActive(href) && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}

        {profile?.role === 'admin' && (
          <>
            <p className="px-3 mt-4 mb-2 text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              Administración
            </p>
            {adminItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{label}</span>
                {isActive(href) && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="px-3 py-3 rounded-lg mb-2" style={{ background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)' }}>
              {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {profile?.full_name ?? 'Usuario'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {profile?.role === 'admin' ? '● Admin' : '○ Viewer'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left hover:text-red-400"
          style={{ width: '100%' }}
        >
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
