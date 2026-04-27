import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { TRAVELER_BOOKINGS, formatBookingDate } from "@/data/traveler";
import { formatBRL, formatDate } from "@/data/trips";

export const Route = createFileRoute("/conta/viagens")({
  component: TripsPage,
});

const STATUS_LABEL = {
  confirmed: { label: "Confirmada", color: "bg-success/10 text-success" },
  pending: { label: "Pendente", color: "bg-warning/20 text-warning-foreground" },
  completed: { label: "Concluída", color: "bg-secondary text-foreground" },
  canceled: { label: "Cancelada", color: "bg-destructive/10 text-destructive" },
} as const;

function TripsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Minhas viagens
        </h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe suas reservas e acesse seus vouchers.
        </p>
      </header>

      <div className="space-y-4">
        {TRAVELER_BOOKINGS.map((b) => {
          const status = STATUS_LABEL[b.status];
          return (
            <article
              key={b.id}
              className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
            >
              <div className="grid md:grid-cols-[260px_1fr]">
                <div className="aspect-[4/3] md:aspect-auto">
                  <img
                    src={b.trip.image}
                    alt={b.trip.destination}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {b.code}
                      </p>
                      <h3 className="mt-1 font-display text-xl font-semibold">
                        {b.trip.destination}, {b.trip.state}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {b.trip.agency}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                    <Info
                      icon={<Calendar className="h-3.5 w-3.5" />}
                      label="Embarque"
                      value={formatDate(b.trip.departureDate)}
                    />
                    <Info
                      icon={<MapPin className="h-3.5 w-3.5" />}
                      label="Saída"
                      value={b.trip.departureCity}
                    />
                    <Info
                      icon={<Users className="h-3.5 w-3.5" />}
                      label="Pessoas"
                      value={`${b.passengers}`}
                    />
                    <Info
                      icon={<Calendar className="h-3.5 w-3.5" />}
                      label="Comprado"
                      value={formatBookingDate(b.purchasedAt)}
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total pago</p>
                      <p className="font-display text-lg font-semibold">
                        {formatBRL(b.totalPaid)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        to="/conta/vouchers"
                        className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
                      >
                        Ver voucher
                      </Link>
                      <Link
                        to="/viagem/$slug"
                        params={{ slug: b.trip.slug }}
                        className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:opacity-95"
                      >
                        Detalhes <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
