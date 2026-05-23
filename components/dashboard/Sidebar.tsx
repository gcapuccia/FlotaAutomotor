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
  X,
} from 'lucide-react'



interface SidebarProps {
  profile: Profile | null
  isOpen: boolean
  onClose: () => void
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

export default function Sidebar({ profile, isOpen, onClose }: SidebarProps) {
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
      className={[
        'fixed inset-y-0 left-0 z-50 flex h-full w-60 flex-shrink-0 flex-col',
        'border-r border-slate-200/80 bg-white dark:border-slate-800/60 dark:bg-[#0d1526]',
        'transition-transform duration-200 ease-out',
        'lg:static lg:z-auto lg:h-screen lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-5 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500 text-white">
            <Car size={18} />
          </div>
          <span className="brand-title text-slate-900 dark:text-slate-100">
            FleetOps
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="btn-close-sidebar lg:hidden"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Principal
        </p>
        <div className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {profile?.role === 'admin' && (
          <>
            <p className="mb-1.5 mt-5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Admin
            </p>
            <div className="space-y-0.5">
              {adminItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`sidebar-link ${isActive(href) ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-200/80 px-2 py-3 dark:border-slate-800/60">
        <div className="mb-1 flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
            {profile?.full_name?.[0]?.toUpperCase() ?? profile?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
              {profile?.full_name ?? 'Usuario'}
            </p>
            
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
              {profile?.email}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <LogOut size={15} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
