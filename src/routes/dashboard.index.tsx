import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, TrendingUp, Calendar, Plane, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatBRL, formatDate } from "@/data/trips";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const [agency, setAgency] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pathParts = window.location.pathname.split("/").filter(Boolean);
    const slug = pathParts[1] || "caminhos-do-sol";

    async function loadData() {
      try {
        const agencyRes = await supabase.from("agencies").select("*").eq("slug", slug).single();

        if (agencyRes.data) {
          setAgency(agencyRes.data);
          
          const [tripsData, reservationsData] = await Promise.all([
            supabase.from("trips").select("*").eq("agency_id", agencyRes.data.id),
            supabase.from("reservations").select("*, trips(*)").eq("agency_id", agencyRes.data.id)
          ]);
          
          setTrips(tripsData.data || []);
          setReservations(reservationsData.data || []);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const metrics = {
    revenue: reservations
      .filter((r) => r.status === "confirmed" || r.status === "confirmada")
      .reduce((sum, r) => sum + (r.total_value || r.total || 0), 0),
    bookingsCount: reservations.filter((r) => r.status === "confirmed" || r.status === "confirmada").length,
    tripsCount: trips.length,
    upcoming: trips.filter((t) => new Date(t.departure_date) > new Date()).length
  };

  const recent = [...reservations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Agência não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Olá, {agency.name} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            Aqui está um resumo da sua operação.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Receita confirmada"
          value={formatBRL(metrics.revenue)}
          hint="+12% vs. mês anterior"
          accent
        />
        <MetricCard
          icon={<Users className="h-4 w-4" />}
          label="Reservas"
          value={metrics.bookingsCount.toString()}
          hint="confirmadas este mês"
        />
        <MetricCard
          icon={<Plane className="h-4 w-4" />}
          label="Viagens ativas"
          value={metrics.tripsCount.toString()}
          hint="no catálogo"
        />
        <MetricCard
          icon={<Calendar className="h-4 w-4" />}
          label="Próximas saídas"
          value={metrics.upcoming.toString()}
          hint="agendadas"
        />
      </div>

      {/* Trips with occupancy */}
      <div className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Ocupação por viagem
          </h2>
          <Link
            to="/dashboard/viagens"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent"
          >
            Ver todas <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-6 space-y-3">
          {trips.slice(0, 5).map((t) => {
            const reservedSeats = reservations.filter(r => r.trip_id === t.id).reduce((sum, r) => sum + (r.passengers?.length || r.people || 0), 0);
            const capacity = t.capacity || 50;
            const percent = capacity > 0 ? Math.round((reservedSeats / capacity) * 100) : 0;
            return (
              <Link
                key={t.id}
                to="/dashboard/viagens/$tripId"
                params={{ tripId: t.id }}
                className="block rounded-2xl border border-border bg-background p-5 transition-all hover:border-border-strong hover:shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 flex-none overflow-hidden rounded-xl bg-secondary">
                      {t.image_url && (
                        <img
                          src={t.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-display text-base font-semibold">
                        {t.destination}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t.departure_date ? formatDate(t.departure_date) : "Sem data"} · {t.vehicle || "Veículo não definido"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:min-w-[200px]">
                    <div className="flex w-full items-center gap-3">
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-foreground"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {percent}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reservedSeats} / {capacity} assentos
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Reservas recentes
        </h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>Código</Th>
                <Th>Passageiro</Th>
                <Th>Viagem</Th>
                <Th>Status</Th>
                <Th className="text-right">Valor</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => {
                const trip = b.trips;
                return (
                  <tr key={b.id} className="border-t border-border">
                    <Td className="font-mono text-xs">{b.code || b.id.slice(0, 8)}</Td>
                    <Td className="font-medium">{b.passenger_name || b.passengerName || b.name || "Passageiro"}</Td>
                    <Td className="text-muted-foreground">{trip?.destination || "-"}</Td>
                    <Td>
                      <StatusBadge status={b.status || "pendente"} />
                    </Td>
                    <Td className="text-right font-medium">
                      {formatBRL(b.total_value || b.total || 0)}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border p-5 " +
        (accent
          ? "border-accent/30 bg-accent/5"
          : "border-border bg-background")
      }
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={"px-5 py-3 text-left font-semibold " + className}>{children}</th>
  );
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={"px-5 py-4 " + className}>{children}</td>;
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const map: Record<string, string> = {
    confirmada: "bg-success/10 text-success",
    confirmed: "bg-success/10 text-success",
    pendente: "bg-warning/15 text-warning-foreground",
    pending: "bg-warning/15 text-warning-foreground",
    cancelada: "bg-destructive/10 text-destructive",
    cancelled: "bg-destructive/10 text-destructive",
    canceled: "bg-destructive/10 text-destructive",
  };
  const label = status === "confirmed" ? "confirmada" : status === "pending" ? "pendente" : status === "cancelled" || status === "canceled" ? "cancelada" : status;
  return (
    <span
      className={
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize " +
        (map[status] || "bg-secondary text-muted-foreground")
      }
    >
      {label}
    </span>
  );
}
