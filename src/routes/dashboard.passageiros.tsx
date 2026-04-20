import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Download } from "lucide-react";
import { BOOKINGS } from "@/data/dashboard";
import { TRIPS, formatBRL, formatDate } from "@/data/trips";
import { StatusBadge } from "./dashboard.index";

export const Route = createFileRoute("/dashboard/passageiros")({
  component: Passengers,
});

function Passengers() {
  const [q, setQ] = useState("");
  const [tripFilter, setTripFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmada" | "pendente" | "cancelada">("all");

  const filtered = BOOKINGS.filter((b) => {
    if (q && !b.passengerName.toLowerCase().includes(q.toLowerCase()) && !b.code.toLowerCase().includes(q.toLowerCase())) return false;
    if (tripFilter && b.tripId !== tripFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    return true;
  });

  const myTrips = TRIPS.filter((t) =>
    BOOKINGS.some((b) => b.tripId === t.id),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Passageiros
          </h1>
          <p className="mt-1 text-muted-foreground">
            Todas as reservas das suas viagens.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-elevated"
        >
          <Download className="h-4 w-4" /> Exportar
        </button>
      </div>

      {/* Filters */}
      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome ou código…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <select
          value={tripFilter}
          onChange={(e) => setTripFilter(e.target.value)}
          className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none"
        >
          <option value="">Todas as viagens</option>
          {myTrips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.destination}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "confirmada" | "pendente" | "cancelada")}
          className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-medium outline-none"
        >
          <option value="all">Todos os status</option>
          <option value="confirmada">Confirmada</option>
          <option value="pendente">Pendente</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Código</th>
              <th className="px-5 py-3 text-left font-semibold">Passageiro</th>
              <th className="px-5 py-3 text-left font-semibold">Viagem</th>
              <th className="px-5 py-3 text-left font-semibold">Saída</th>
              <th className="px-5 py-3 text-left font-semibold">Assento</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Valor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const trip = TRIPS.find((t) => t.id === b.tripId)!;
              return (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-5 py-4 font-mono text-xs">{b.code}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{b.passengerName}</p>
                    <p className="text-xs text-muted-foreground">{b.passengerDoc}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {trip.destination}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatDate(trip.departureDate)}
                  </td>
                  <td className="px-5 py-4 tabular-nums">
                    {String(b.seat).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-medium">
                    {formatBRL(b.total)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                  Nenhum passageiro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
