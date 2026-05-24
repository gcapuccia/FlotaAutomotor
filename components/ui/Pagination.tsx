'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

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
    <div className="pagination-wrap">
      <p className="pagination-info">
        Mostrando <strong>{from}–{to}</strong> de <strong>{totalItems}</strong> registros
      </p>

      <div className="pagination-controls">
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="pagination-btn"
          aria-label="Primera página"
        >
          <ChevronsLeft size={13} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="pagination-btn"
          aria-label="Página anterior"
        >
          <ChevronLeft size={13} />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              className={`pagination-btn${p === page ? ' active' : ''}`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="pagination-btn"
          aria-label="Página siguiente"
        >
          <ChevronRight size={13} />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className="pagination-btn"
          aria-label="Última página"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  )
}
