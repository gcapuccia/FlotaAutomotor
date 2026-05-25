"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import * as XLSX from "xlsx";

const CATEGORY_LABELS: Record<string, string> = {
  combustible: "⛽ Combustible",
  mantenimiento: "🔧 Mantenimiento",
  reparacion: "🛠️ Reparación",
  seguro: "🛡️ Seguro",
  patente: "📋 Patente",
  lavado: "🚿 Lavado",
  neumaticos: "⭕ Neumáticos",
  otro: "📌 Otro"
};

export default function ExpensesTable({
  expenses,
  isAdmin
}: {
  expenses: any[];
  isAdmin: boolean;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCat] = useState("todos");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");

  const filtered = useMemo(() => {
    let list = expenses.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (e.vehicle?.plate ?? "").toLowerCase().includes(q) ||
        (e.vehicle?.vehicle_name ?? "").toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q) ||
        (e.workshop_name ?? "").toLowerCase().includes(q) ||
        (e.mechanic_name ?? "").toLowerCase().includes(q);
      const matchCat = catFilter === "todos" || e.category === catFilter;
      return matchSearch && matchCat;
    });

    list.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "desc" ? -diff : diff;
    });

    return list;
  }, [expenses, search, catFilter, sortDir]);

  const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  const selectStyle = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    borderRadius: "6px",
    padding: "0.4rem 0.6rem",
    fontSize: "0.8rem"
  };

  const exportToExcel = () => {
    const rows = filtered.map((e) => ({
      Fecha: new Date(e.date + "T00:00:00").toLocaleDateString("es-AR"),
      Patente: e.vehicle?.plate ?? "",
      Vehículo: e.vehicle?.vehicle_name ?? "",
      Modelo: e.vehicle?.model ?? "",
      Categoría: CATEGORY_LABELS[e.category] ?? e.category,
      Taller: e.workshop_name ?? "",
      Mecánico: e.mechanic_name ?? "",
      Descripción: e.description ?? "",
      Factura: e.invoice_number ?? "",
      Importe: Number(e.amount)
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    XLSX.writeFile(wb, `gastos_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="card" style={{ borderTop: "2px solid #a78bfa" }}>
      {/* Filtros */}

      <div className="ml-auto flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {filtered.length} registros
          </p>
          <p
            className="text-sm font-bold font-display"
            style={{ color: "#a78bfa" }}
          >
            Total: ${total.toLocaleString("es-AR")}
          </p>
        </div>
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
      </div>
      <div
        className="flex flex-wrap items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar patente, vehículo, taller..."
            className="input-base pl-8 text-sm py-2"
          />
        </div>

        <select
          style={selectStyle}
          value={catFilter}
          onChange={(e) => setCat(e.target.value)}
        >
          <option value="todos">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>

        <select
          style={selectStyle}
          value={sortDir}
          onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
        >
          <option value="desc">Más recientes primero</option>
          <option value="asc">Más antiguos primero</option>
        </select>

        <div className="ml-auto text-right">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {filtered.length} registros
          </p>
          <p
            className="text-sm font-bold font-display"
            style={{ color: "#a78bfa" }}
          >
            Total: ${total.toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {[
                "Fecha",
                "Vehículo",
                "Categoría",
                "Taller / Mecánico",
                "Descripción",
                "Factura",
                "Importe",
                ""
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr
                key={e.id}
                className="table-row-hover border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <td
                  className="px-5 py-3 whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {new Date(e.date + "T00:00:00").toLocaleDateString("es-AR")}
                </td>
                <td className="px-5 py-3">
                  {e.vehicle ? (
                    <>
                      <Link
                        href={"/vehicles/" + e.vehicle.id}
                        className="font-display font-bold tracking-wider hover:underline"
                        style={{ color: "var(--accent-primary)" }}
                      >
                        {e.vehicle.plate}
                      </Link>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {e.vehicle.vehicle_name} {e.vehicle.model}
                      </p>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td
                  className="px-5 py-3 whitespace-nowrap"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {CATEGORY_LABELS[e.category] ?? e.category}
                </td>
                <td
                  className="px-5 py-3 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {e.workshop_name && <p>{e.workshop_name}</p>}
                  {e.mechanic_name && <p>👤 {e.mechanic_name}</p>}
                  {!e.workshop_name && !e.mechanic_name && "—"}
                </td>
                <td
                  className="px-5 py-3 max-w-[200px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <p className="truncate">{e.description ?? "—"}</p>
                </td>
                <td
                  className="px-5 py-3 text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  {e.invoice_number ?? "—"}
                </td>
                <td
                  className="px-5 py-3 font-bold font-display whitespace-nowrap"
                  style={{ color: "#a78bfa" }}
                >
                  ${Number(e.amount).toLocaleString("es-AR")}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={"/expenses/" + e.id}
                      className="btn-ghost text-xs px-3 py-1"
                    >
                      Ver
                    </Link>
                    {isAdmin && (
                      <Link
                        href={"/expenses/" + e.id + "/edit"}
                        className="btn-ghost text-xs px-3 py-1"
                      >
                        Editar
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-10 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  No se encontraron gastos con esos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
