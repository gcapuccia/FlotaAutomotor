"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";
import type { Vehicle, VtvStatus } from "@/types";
import * as XLSX from "xlsx";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  activo: { label: "Activo", cls: "badge-active" },
  en_reparacion: { label: "En Reparación", cls: "badge-repair" },
  disponible: { label: "Disponible", cls: "badge-available" },
  baja: { label: "De Baja", cls: "badge-off" }
};

const TYPE_LABELS: Record<string, string> = {
  sedan: "Sedán",
  suv: "SUV",
  pickup: "Pick-up",
  van: "Van",
  truck: "Camión",
  motorcycle: "Moto",
  otro: "Otro"
};

function VtvBadge({ vtv }: { vtv: string | null }) {
  if (!vtv) return <span style={{ color: "var(--text-muted)" }}>—</span>;
  const fecha = new Date(vtv + "T00:00:00");
  const hoy = new Date();
  const dias = Math.floor(
    (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
  );
  const label = fecha.toLocaleDateString("es-AR");

  if (dias < 0)
    return (
      <span
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold"
        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
      >
        <AlertTriangle size={10} />
        {label}
      </span>
    );
  if (dias <= 30)
    return (
      <span
        className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold"
        style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}
      >
        <Clock size={10} />
        {label} ({dias}d)
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-semibold"
      style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}
    >
      <CheckCircle size={10} />
      {label}
    </span>
  );
}

const STATUSES = ["todos", "activo", "disponible", "en_reparacion", "baja"];
const TYPES = [
  "todos",
  "sedan",
  "suv",
  "pickup",
  "van",
  "truck",
  "motorcycle",
  "otro"
];

export default function VehiclesTable({
  vehicles,
  isAdmin
}: {
  vehicles: Vehicle[];
  isAdmin: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState("todos");
  const [typeFilter, setType] = useState("todos");
  const [vtvFilter, setVtv] = useState("todos");

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
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
      const matchType = typeFilter === "todos" || v.type === typeFilter;

      let matchVtv = true;
      if (vtvFilter === "vencida")
        matchVtv = !!v.vtv && new Date(v.vtv) < new Date();
      if (vtvFilter === "por_vencer") {
        if (!v.vtv) {
          matchVtv = false;
        } else {
          const dias = Math.floor(
            (new Date(v.vtv).getTime() - Date.now()) / 86400000
          );
          matchVtv = dias >= 0 && dias <= 30;
        }
      }
      if (vtvFilter === "sin_vtv") matchVtv = !v.vtv;

      return matchSearch && matchStatus && matchType && matchVtv;
    });
  }, [vehicles, search, statusFilter, typeFilter, vtvFilter]);

  const selectStyle = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    borderRadius: "6px",
    padding: "0.4rem 0.6rem",
    fontSize: "0.8rem"
  };

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
      VTV: v.vtv
        ? new Date(v.vtv + "T00:00:00").toLocaleDateString("es-AR")
        : ""
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vehículos");
    XLSX.writeFile(
      wb,
      `vehiculos_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div
      className="card"
      style={{ borderTop: "2px solid var(--accent-primary)" }}
    >
      {/* Filtros */}
      <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
        {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
      </span>
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-md font-semibold"
        style={{
          background: "rgba(34,197,94,0.1)",
          color: "#22c55e",
          border: "1px solid rgba(34,197,94,0.2)"
        }}
      >
        ⬇ Exportar Excel
      </button>
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Buscador */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar patente, vehículo, chofer, titular..."
            className="input-base pl-8 text-sm py-2"
          />
        </div>

        <select
          style={selectStyle}
          value={statusFilter}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="disponible">Disponible</option>
          <option value="en_reparacion">En Reparación</option>
          <option value="baja">De Baja</option>
        </select>

        <select
          style={selectStyle}
          value={typeFilter}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="todos">Todos los tipos</option>
          {TYPES.filter((t) => t !== "todos").map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <select
          style={selectStyle}
          value={vtvFilter}
          onChange={(e) => setVtv(e.target.value)}
        >
          <option value="todos">Toda VTV</option>
          <option value="vencida">VTV Vencida</option>
          <option value="por_vencer">VTV por vencer</option>
          <option value="sin_vtv">Sin VTV</option>
        </select>

        <span
          className="text-xs ml-auto"
          style={{ color: "var(--text-muted)" }}
        >
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                "Int.",
                "Patente",
                "Vehículo",
                "Modelo",
                "Titular",
                "Chofer",
                "Tipo",
                "Flota",
                "VTV",
                "Estado",
                ""
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const status = STATUS_MAP[v.status] ?? {
                label: v.status,
                cls: ""
              };
              return (
                <tr
                  key={v.id}
                  className="table-row-hover border-b"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {v.interno ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-display font-bold tracking-widest"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {v.plate}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {v.vehicle_name}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {v.model}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {v.titular}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {v.driver ?? (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {TYPE_LABELS[v.type] ?? v.type}
                  </td>
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {v.flota ?? (
                      <span style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <VtvBadge vtv={v.vtv} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "text-xs px-2 py-1 rounded-md font-semibold whitespace-nowrap " +
                        status.cls
                      }
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={"/vehicles/" + v.id}
                        className="btn-ghost text-xs px-3 py-1"
                      >
                        Ver
                      </Link>
                      <Link
                        href={"/expenses?vehicle=" + v.id}
                        className="text-xs px-3 py-1 rounded-md font-semibold flex items-center gap-1"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          color: "#f59e0b",
                          border: "1px solid rgba(245,158,11,0.2)"
                        }}
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
                <td
                  colSpan={11}
                  className="px-5 py-10 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  No se encontraron vehículos con esos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
