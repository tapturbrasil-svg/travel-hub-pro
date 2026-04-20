import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { CURRENT_AGENCY_SLUG, getOccupancy } from "@/data/dashboard";
import { TRIPS, formatBRL, formatDate } from "@/data/trips";

export const Route = createFileRoute("/dashboard/viagens/")({
  component: TripsList,
});

function TripsList() {
  const [q, setQ] = useState("");
  const myTrips = TRIPS.filter((t) => t.agencySlug === CURRENT_AGENCY_SLUG);
  const filtered = q
    ? myTrips.filter((t) =>
        (t.destination + " " + t.state)
          .toLowerCase()
          .includes(q.toLowerCase()),
      )
    : myTrips;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Viagens
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie todas as viagens publicadas pela sua agência.
          </p>
        </div>
        <Link
          to="/dashboard/viagens/nova"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> Nova viagem
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por destino…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Viagem</th>
              <th className="px-5 py-3 text-left font-semibold">Saída</th>
              <th className="px-5 py-3 text-left font-semibold">Ocupação</th>
              <th className="px-5 py-3 text-left font-semibold">Preço</th>
              <th className="px-5 py-3 text-right font-semibold" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const occ = getOccupancy(t.id, t.capacity);
              return (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-secondary">
                        <img
                          src={t.image}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{t.destination}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.nights} noites · {t.vehicle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatDate(t.departureDate)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                          style={{ width: `${occ.percent}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {occ.sold}/{occ.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {formatBRL(t.priceAdult)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to="/dashboard/viagens/$tripId"
                      params={{ tripId: t.id }}
                      className="text-sm font-medium text-foreground hover:text-accent"
                    >
                      Detalhes →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  Nenhuma viagem encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
