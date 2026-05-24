"use client";

import { useState, useMemo } from "react";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { Search, Wrench, AlertTriangle, Clock, CheckCircle, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import type { Vehicle } from "@/types";
import * as XLSX from "xlsx";

const TODAY_MS = Date.now();
const PAGE_SIZE = 12;

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  activo:        { label: "Activo",        cls: "badge-active" },
  en_reparacion: { label: "En Reparación", cls: "badge-repair" },
  disponible:    { label: "Disponible",    cls: "badge-available" },
  baja:          { label: "De Baja",       cls: "badge-off" },
};

const TYPE_LABELS: Record<string, string> = {
  sedan: "Sedán", suv: "SUV", pickup: "Pick-up",
  van: "Van", truck: "Camión", motorcycle: "Moto", otro: "Otro",
};

function VtvBadge({ vtv }: { vtv: string | null }) {
  if (!vtv) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const ms = new Date(vtv + "T00:00:00").getTime();
  const dias = Math.floor((ms - TODAY_MS) / 86400000);
  const label = new Date(vtv + "T00:00:00").toLocaleDateString("es-AR");

  if (dias < 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
        <AlertTriangle size={10} /> {label}
      </span>
    );
  if (dias <= 30)
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
        <Clock size={10} /> {label} ({dias}d)
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold"
      style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
      <CheckCircle size={10} /> {label}
    </span>
  );
}

const TYPES = ["todos", "sedan", "suv", "pickup", "van", "truck", "motorcycle", "otro"];

type SortKey = "interno" | "plate" | "vehicle_name" | "model" | "titular" | "driver" | "type" | "flota" | "vtv" | "status";

const COLUMNS: { key: SortKey | null; label: string }[] = [
  { key: "interno",      label: "Int." },
  { key: "plate",        label: "Patente" },
  { key: "vehicle_name", label: "Vehículo" },
  { key: "model",        label: "Modelo" },
  { key: "titular",      label: "Titular" },
  { key: "driver",       label: "Chofer" },
  { key: "type",         label: "Tipo" },
  { key: "flota",        label: "Flota" },
  { key: "vtv",          label: "VTV" },
  { key: "status",       label: "Estado" },
  { key: null,           label: "" },
];

export default function VehiclesTable({ vehicles, isAdmin }: { vehicles: Vehicle[]; isAdmin: boolean }) {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("todos");
  const [typeFilter, setType]     = useState("todos");
  const [vtvFilter, setVtv]       = useState("todos");
  const [sortKey, setSortKey]     = useState<SortKey>("plate");
  const [sortDir, setSortDir]     = useState<"asc" | "desc">("asc");
  const [page, setPage]           = useState(1);

  const handleSearch  = (v: string) => { setSearch(v); setPage(1); };
  const handleStatus  = (v: string) => { setStatus(v); setPage(1); };
  const handleType    = (v: string) => { setType(v);   setPage(1); };
  const handleVtv     = (v: string) => { setVtv(v);    setPage(1); };
  const handleSortCol = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const list = vehicles.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.plate.toLowerCase().includes(q) ||
        v.vehicle_name.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        (v.titular ?? "").toLowerCase().includes(q) ||
        (v.driver ?? "").toLowerCase().includes(q) ||
        (v.interno ?? "").toLowerCase().includes(q) ||
        (v.flota ?? "").toLowerCase().includes(q);

      const matchStatus = statusFilter === "todos" || v.status === statusFilter;
      const matchType   = typeFilter   === "todos" || v.type   === typeFilter;

      let matchVtv = true;
      if (vtvFilter === "vencida")
        matchVtv = !!v.vtv && new Date(v.vtv + "T00:00:00").getTime() < TODAY_MS;
      if (vtvFilter === "por_vencer") {
        if (!v.vtv) {
          matchVtv = false;
        } else {
          const dias = Math.floor((new Date(v.vtv + "T00:00:00").getTime() - TODAY_MS) / 86400000);
          matchVtv = dias >= 0 && dias <= 30;
        }
      }
      if (vtvFilter === "sin_vtv") matchVtv = !v.vtv;

      return matchSearch && matchStatus && matchType && matchVtv;
    });

    list.sort((a, b) => {
      if (sortKey === "vtv") {
        const ta = a.vtv ? new Date(a.vtv + "T00:00:00").getTime() : (sortDir === "asc" ? Infinity : -Infinity);
        const tb = b.vtv ? new Date(b.vtv + "T00:00:00").getTime() : (sortDir === "asc" ? Infinity : -Infinity);
        return sortDir === "asc" ? ta - tb : tb - ta;
      }
      const va = String((a as any)[sortKey] ?? "");
      const vb = String((b as any)[sortKey] ?? "");
      const cmp = va.localeCompare(vb, "es", { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [vehicles, search, statusFilter, typeFilter, vtvFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportToExcel = () => {
    const rows = filtered.map((v) => ({
      Interno: v.interno ?? "",
      Patente: v.plate,
      Vehículo: v.vehicle_name,
      Modelo: v.model,
      Titular: v.titular,
      Chofer: v.driver ?? "",
      Tipo: TYPE_LABELS[v.type] ?? v.type,
      Flota: v.flota ?? "",
      Estado: STATUS_MAP[v.status]?.label ?? v.status,
      Motor: v.motor ?? "",
      Chasis: v.chasis ?? "",
      Llave: v.llave ?? "",
      Título: v.titulo ?? "",
      VTV: v.vtv ? new Date(v.vtv + "T00:00:00").toLocaleDateString("es-AR") : "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vehículos");
    XLSX.writeFile(wb, `vehiculos_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="card" style={{ borderTop: "2px solid var(--accent-primary)" }}>

      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4"
        style={{ borderColor: "var(--border)" }}>

        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar patente, vehículo, chofer, titular..."
            className="input-base py-2 pl-8 text-sm"
          />
        </div>

        <select className="input-select" value={statusFilter} onChange={(e) => handleStatus(e.target.value)}>
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="disponible">Disponible</option>
          <option value="en_reparacion">En Reparación</option>
          <option value="baja">De Baja</option>
        </select>

        <select className="input-select" value={typeFilter} onChange={(e) => handleType(e.target.value)}>
          <option value="todos">Todos los tipos</option>
          {TYPES.filter((t) => t !== "todos").map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </select>

        <select className="input-select" value={vtvFilter} onChange={(e) => handleVtv(e.target.value)}>
          <option value="todos">Toda VTV</option>
          <option value="vencida">VTV Vencida</option>
          <option value="por_vencer">VTV por vencer</option>
          <option value="sin_vtv">Sin VTV</option>
        </select>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={exportToExcel}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold"
            style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
          >
            ⬇ Exportar Excel
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {COLUMNS.map((col) => (
                <th
                  key={col.label || "actions"}
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color: col.key && sortKey === col.key ? "var(--accent-primary)" : "var(--text-muted)",
                    cursor: col.key ? "pointer" : undefined,
                    userSelect: "none",
                  }}
                  onClick={() => col.key && handleSortCol(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.key && (
                      sortKey === col.key
                        ? (sortDir === "asc" ? <ChevronUp size={11} /> : <ChevronDown size={11} />)
                        : <ArrowUpDown size={11} style={{ opacity: 0.3 }} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((v) => {
              const status = STATUS_MAP[v.status] ?? { label: v.status, cls: "" };
              return (
                <tr key={v.id} className="table-row-hover border-b" style={{ borderColor: "var(--border)" }}>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{v.interno ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-display font-bold tracking-widest" style={{ color: "var(--accent-primary)" }}>
                      {v.plate}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>{v.vehicle_name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{v.model}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{v.titular}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {v.driver ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{TYPE_LABELS[v.type] ?? v.type}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {v.flota ?? <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td className="px-4 py-3"><VtvBadge vtv={v.vtv} /></td>
                  <td className="px-4 py-3">
                    <span className={"text-xs px-2 py-1 rounded-md font-semibold whitespace-nowrap " + status.cls}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={"/vehicles/" + v.id} className="btn-ghost px-3 py-1 text-xs">Ver</Link>
                      <Link
                        href={"/expenses?vehicle=" + v.id}
                        className="flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold"
                        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}
                      >
                        <Wrench size={11} /> Gastos
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-5 py-12 text-center"
                  style={{ color: "var(--text-muted)" }}>
                  No se encontraron vehículos con esos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginador */}
      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
