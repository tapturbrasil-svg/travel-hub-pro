import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Calendar, Bus, Hotel } from "lucide-react";
import { TRIPS, formatBRL, formatDate, type Trip } from "@/data/trips";
import { getBookingsByTrip, getOccupancy } from "@/data/dashboard";
import { StatusBadge } from "./dashboard.index";

export const Route = createFileRoute("/dashboard/viagens/$tripId")({
  component: TripDetail,
  loader: ({ params }): { trip: Trip } => {
    const trip = TRIPS.find((t) => t.id === params.tripId);
    if (!trip) throw notFound();
    return { trip };
  },
});

function TripDetail() {
  const { trip } = Route.useLoaderData() as { trip: Trip };
  const bookings = getBookingsByTrip(trip.id);
  const occ = getOccupancy(trip.id, trip.capacity);
  const revenue = bookings
    .filter((b) => b.status !== "cancelada")
    .reduce((acc, b) => acc + b.total, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-12">
      <Link
        to="/dashboard/viagens"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
        <div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {trip.destination}, {trip.state}
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {trip.destination} — {trip.nights} noites
          </h1>
          <p className="mt-2 text-muted-foreground">
            Operada pela sua agência · ID {trip.id}
          </p>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-secondary">
          <img src={trip.image} alt="" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Ocupação" value={`${occ.percent}%`} hint={`${occ.sold} / ${occ.capacity}`} />
        <Stat label="Receita" value={formatBRL(revenue)} hint="confirmada" />
        <Stat label="Saída" value={formatDate(trip.departureDate)} hint={trip.vehicle} />
      </div>

      {/* Info */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Info icon={<Calendar />} label="Volta" value={formatDate(trip.returnDate)} />
        <Info icon={<Bus />} label="Transporte" value={trip.vehicle} />
        <Info icon={<Hotel />} label="Hotel" value={`${trip.hotel.name} · ${trip.hotel.stars}★`} />
        <Info
          icon={<Calendar />}
          label="Preço adulto"
          value={`${formatBRL(trip.priceAdult)} / ${formatBRL(trip.priceChild)} criança`}
        />
      </div>

      {/* Passengers */}
      <div className="mt-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Lista de passageiros
          </h2>
          <span className="text-sm text-muted-foreground">
            {bookings.length} {bookings.length === 1 ? "reserva" : "reservas"}
          </span>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-background">
          <table className="w-full text-sm">
            <thead className="bg-surface-elevated text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Passageiro</th>
                <th className="px-5 py-3 text-left font-semibold">CPF</th>
                <th className="px-5 py-3 text-left font-semibold">Assento</th>
                <th className="px-5 py-3 text-left font-semibold">Pagamento</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border">
                  <td className="px-5 py-4 font-medium">{b.passengerName}</td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">
                    {b.passengerDoc}
                  </td>
                  <td className="px-5 py-4 tabular-nums">
                    {String(b.seat).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {b.paymentMethod}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-5 py-4 text-right font-medium">
                    {formatBRL(b.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
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
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary text-foreground/70 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 font-medium">{value}</p>
      </div>
    </div>
  );
}
