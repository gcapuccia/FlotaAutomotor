'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import ThemeToggle from '@/components/ui/ThemeToggle'
import type { Profile } from '@/types'

export default function DashboardShell({
  profile,
  children,
}: {
  profile: Profile | null
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-dvh bg-slate-50 text-slate-900 dark:bg-[#0a0f1a] dark:text-slate-100">
      <Sidebar
        profile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 py-5 backdrop-blur-md dark:border-slate-800/60 dark:bg-[#0a0f1a]/95 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="btn-primary !p-0 grid h-10 w-10 place-items-center lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={15} />
            </button>
            <span className="brand-title text-slate-900 dark:text-slate-100 lg:hidden">
              FleetOps
            </span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
