'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
}

function getPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '…')[] = []

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', total)
  } else if (current >= total - 3) {
    pages.push(1, '…', total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '…', current - 1, current, current + 1, '…', total)
  }

  return pages
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)
  const pages = getPages(page, totalPages)

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/80 px-4 py-3 dark:border-slate-800/60 sm:flex-row sm:px-5">
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Mostrando {from}–{to} de {totalItems} registros
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="grid h-8 w-8 place-items-center rounded-md border border-slate-200/80 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Página anterior"
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`ellipsis-${i}`}
              className="grid h-8 w-8 place-items-center text-xs text-slate-400 dark:text-slate-500"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={[
                'grid h-8 w-8 place-items-center rounded-md border text-xs font-medium transition',
                p === page
                  ? 'border-orange-300 bg-orange-500 text-white dark:border-orange-500'
                  : 'border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
              ].join(' ')}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="grid h-8 w-8 place-items-center rounded-md border border-slate-200/80 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-30 dark:border-slate-700/60 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Página siguiente"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
