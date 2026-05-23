"use client";

import { useState, useMemo } from "react";
import Pagination from "@/components/ui/Pagination";
import Link from "next/link";
import { Search } from "lucide-react";
import * as XLSX from "xlsx";

const PAGE_SIZE = 12;

const CATEGORY_LABELS: Record<string, string> = {
  combustible:  "Combustible",
  mantenimiento:"Mantenimiento",
  reparacion:   "Reparación",
  seguro:       "Seguro",
  patente:      "Patente",
  lavado:       "Lavado",
  neumaticos:   "Neumáticos",
  otro:         "Otro",
};

const selectStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  color: "var(--text-secondary)",
  borderRadius: "6px",
  padding: "0.4rem 0.6rem",
  fontSize: "0.8rem",
};

export default function ExpensesTable({ expenses, isAdmin }: { expenses: any[]; isAdmin: boolean }) {
  const [search, setSearch]   = useState("");
  const [catFilter, setCat]   = useState("todos");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage]       = useState(1);

  const handleSearch  = (v: string) => { setSearch(v);  setPage(1); };
  const handleCat     = (v: string) => { setCat(v);     setPage(1); };
  const handleSort    = (v: "asc" | "desc") => { setSortDir(v); setPage(1); };

  const filtered = useMemo(() => {
    const list = expenses.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (e.vehicle?.plate        ?? "").toLowerCase().includes(q) ||
        (e.vehicle?.vehicle_name ?? "").toLowerCase().includes(q) ||
        (e.description           ?? "").toLowerCase().includes(q) ||
        (e.workshop_name         ?? "").toLowerCase().includes(q) ||
        (e.mechanic_name         ?? "").toLowerCase().includes(q);
      const matchCat = catFilter === "todos" || e.category === catFilter;
      return matchSearch && matchCat;
    });

    list.sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "desc" ? -diff : diff;
    });

    return list;
  }, [expenses, search, catFilter, sortDir]);

  const total      = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportToExcel = () => {
    const rows = filtered.map((e) => ({
      Fecha:       new Date(e.date + "T00:00:00").toLocaleDateString("es-AR"),
      Patente:     e.vehicle?.plate ?? "",
      Vehículo:    e.vehicle?.vehicle_name ?? "",
      Modelo:      e.vehicle?.model ?? "",
      Categoría:   CATEGORY_LABELS[e.category] ?? e.category,
      Taller:      e.workshop_name ?? "",
      Mecánico:    e.mechanic_name ?? "",
      Descripción: e.description ?? "",
      Factura:     e.invoice_number ?? "",
      Importe:     Number(e.amount),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    XLSX.writeFile(wb, `gastos_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="card" style={{ borderTop: "2px solid #a78bfa" }}>

      {/* Barra de filtros */}
      <div className="flex flex-wrap items-center gap-3 border-b px-5 py-4"
        style={{ borderColor: "var(--border)" }}>

        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar patente, vehículo, taller..."
            className="input-base py-2 pl-8 text-sm"
          />
        </div>

        <select style={selectStyle} value={catFilter} onChange={(e) => handleCat(e.target.value)}>
          <option value="todos">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>

        <select style={selectStyle} value={sortDir}
          onChange={(e) => handleSort(e.target.value as "asc" | "desc")}>
          <option value="desc">Más recientes primero</option>
          <option value="asc">Más antiguos primero</option>
        </select>

        <div className="ml-auto flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {filtered.length} registro{filtered.length !== 1 ? "s" : ""}
            </p>
            <p className="font-display text-sm font-bold" style={{ color: "#a78bfa" }}>
              Total: ${total.toLocaleString("es-AR")}
            </p>
          </div>
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
              {["Fecha", "Vehículo", "Categoría", "Taller / Mecánico", "Descripción", "Factura", "Importe", ""].map((h) => (
                <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((e) => (
              <tr key={e.id} className="table-row-hover border-b" style={{ borderColor: "var(--border)" }}>
                <td className="whitespace-nowrap px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                  {new Date(e.date + "T00:00:00").toLocaleDateString("es-AR")}
                </td>
                <td className="px-5 py-3">
                  {e.vehicle ? (
                    <>
                      <Link href={"/vehicles/" + e.vehicle.id}
                        className="font-display font-bold tracking-wider hover:underline"
                        style={{ color: "var(--accent-primary)" }}>
                        {e.vehicle.plate}
                      </Link>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {e.vehicle.vehicle_name} {e.vehicle.model}
                      </p>
                    </>
                  ) : "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                  {CATEGORY_LABELS[e.category] ?? e.category}
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {e.workshop_name && <p>{e.workshop_name}</p>}
                  {e.mechanic_name && <p>{e.mechanic_name}</p>}
                  {!e.workshop_name && !e.mechanic_name && "—"}
                </td>
                <td className="max-w-[200px] px-5 py-3" style={{ color: "var(--text-secondary)" }}>
                  <p className="truncate">{e.description ?? "—"}</p>
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {e.invoice_number ?? "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-3 font-display font-bold" style={{ color: "#a78bfa" }}>
                  ${Number(e.amount).toLocaleString("es-AR")}
                </td>
                <td className="px-5 py-3">
                  {isAdmin && (
                    <Link href={"/expenses/" + e.id + "/edit"} className="btn-ghost px-3 py-1 text-xs">
                      Editar
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  No se encontraron gastos con esos filtros
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
