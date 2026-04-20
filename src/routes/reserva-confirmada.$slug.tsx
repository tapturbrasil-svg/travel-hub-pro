import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Calendar, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getTripBySlug, formatDate, type Trip } from "@/data/trips";

export const Route = createFileRoute("/reserva-confirmada/$slug")({
  component: Confirmed,
  loader: ({ params }): { trip: Trip } => {
    const trip = getTripBySlug(params.slug);
    if (!trip) throw notFound();
    return { trip };
  },
  head: () => ({
    meta: [{ title: "Reserva confirmada | TapTur" }],
  }),
});

function Confirmed() {
  const { trip } = Route.useLoaderData();
  const code = "TT" + Math.floor(Math.random() * 900000 + 100000);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Sua viagem está confirmada!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enviamos os detalhes para o seu e-mail. Boa viagem!
        </p>

        <div className="mt-10 rounded-3xl border border-border bg-surface p-8 text-left shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Código da reserva
            </span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {code}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-display text-lg font-semibold">
                  {trip.destination}, {trip.state}
                </p>
                <p className="text-sm text-muted-foreground">
                  Operado por {trip.agency}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm">
                  <strong>Ida:</strong> {formatDate(trip.departureDate)}
                </p>
                <p className="text-sm">
                  <strong>Volta:</strong> {formatDate(trip.returnDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Link
          to="/"
          className="mt-10 inline-flex items-center justify-center rounded-2xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
        >
          Explorar mais viagens
        </Link>
      </div>

      <Footer />
    </div>
  );
}
