'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'

interface Vehicle {
  id: string
  plate: string
  vehicle_name: string
  model: string
}

interface Props {
  vehicles: Vehicle[]
  value: string
  onChange: (id: string) => void
}

export default function VehicleSelect({ vehicles, value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef  = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = vehicles.find(v => v.id === value) ?? null

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = query
    ? vehicles.filter(v => {
        const q = query.toLowerCase()
        return (
          v.plate.toLowerCase().includes(q) ||
          v.vehicle_name.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q)
        )
      })
    : vehicles

  const handleSelect = (v: Vehicle) => {
    onChange(v.id)
    setOpen(false)
    setQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setQuery('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const displayValue = open
    ? query
    : selected
      ? `${selected.plate} — ${selected.vehicle_name} ${selected.model}`
      : ''

  return (
    <div ref={wrapRef} className="vehicle-select">
      <div className="vehicle-select-trigger">
        <Search size={14} className="vehicle-select-icon" />
        <input
          ref={inputRef}
          type="text"
          className="vehicle-select-input"
          value={displayValue}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar patente o vehículo..."
        />
        {value ? (
          <button type="button" className="vehicle-select-clear" onClick={handleClear}>
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="vehicle-select-icon" />
        )}
      </div>

      {open && (
        <div className="vehicle-select-dropdown">
          {filtered.length === 0 ? (
            <p className="vehicle-select-empty">Sin resultados</p>
          ) : (
            filtered.map(v => (
              <button
                key={v.id}
                type="button"
                className="vehicle-select-option"
                data-selected={v.id === value ? 'true' : undefined}
                onClick={() => handleSelect(v)}
              >
                <span className="vehicle-select-plate">{v.plate}</span>
                <span className="vehicle-select-meta">{v.vehicle_name} · {v.model}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
