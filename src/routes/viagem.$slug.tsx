import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Star, MapPin, Calendar, Bus, Hotel, Check, ArrowLeft } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getTripBySlug, formatBRL, formatDate, type Trip } from "@/data/trips";

export const Route = createFileRoute("/viagem/$slug")({
  component: TripPage,
  loader: ({ params }): { trip: Trip } => {
    const trip = getTripBySlug(params.slug);
    if (!trip) throw notFound();
    return { trip };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { trip } = loaderData;
    return {
      meta: [
        { title: `${trip.destination}, ${trip.state} — ${trip.nights} noites | TapTur` },
        { name: "description", content: trip.description.slice(0, 155) },
        { property: "og:title", content: `${trip.destination} com TapTur` },
        { property: "og:description", content: trip.description.slice(0, 155) },
        { property: "og:image", content: trip.image },
        { name: "twitter:image", content: trip.image },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold">Viagem não encontrada</h1>
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">
          Voltar para a home
        </Link>
      </div>
    </div>
  ),
});

function TripPage() {
  const { trip } = Route.useLoaderData() as { trip: Trip };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-6 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>

      {/* Header section */}
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 font-medium text-foreground">
            <Star className="h-4 w-4 fill-foreground" /> {trip.rating.toFixed(1)}
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{trip.reviews} avaliações</span>
          <span className="text-muted-foreground">·</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {trip.destination}, {trip.state}
          </span>
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {trip.destination} — {trip.nights} noites
        </h1>
        <p className="mt-2 text-muted-foreground">
          Operado por{" "}
          <Link
            to="/agencia/$slug"
            params={{ slug: trip.agencySlug }}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {trip.agency}
          </Link>
        </p>
      </div>

      {/* Gallery */}
      <div className="mx-auto mt-8 max-w-7xl px-6">
        <div className="grid h-[60vh] max-h-[560px] gap-2 overflow-hidden rounded-3xl md:grid-cols-4 md:grid-rows-2">
          <img
            src={trip.gallery[0]}
            alt={trip.destination}
            className="h-full w-full object-cover md:col-span-2 md:row-span-2"
            width={1280}
            height={960}
          />
          <img
            src={trip.gallery[1]}
            alt=""
            className="hidden h-full w-full object-cover md:block"
            loading="lazy"
            width={1280}
            height={960}
          />
          <img
            src={trip.gallery[2]}
            alt=""
            className="hidden h-full w-full object-cover md:block"
            loading="lazy"
            width={1280}
            height={960}
          />
          <img
            src={trip.gallery[1]}
            alt=""
            className="hidden h-full w-full object-cover md:block"
            loading="lazy"
            width={1280}
            height={960}
          />
          <img
            src={trip.gallery[2]}
            alt=""
            className="hidden h-full w-full object-cover md:block"
            loading="lazy"
            width={1280}
            height={960}
          />
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 pt-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div>
            <div className="flex flex-wrap gap-3">
              {trip.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground"
                >
                  {h}
                </span>
              ))}
            </div>

            <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">
              Sobre essa viagem
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-foreground/80">
              {trip.description}
            </p>

            <div className="mt-12 grid gap-6 border-t border-border pt-12 sm:grid-cols-2">
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Ida"
                value={formatDate(trip.departureDate)}
              />
              <InfoRow
                icon={<Calendar className="h-4 w-4" />}
                label="Volta"
                value={formatDate(trip.returnDate)}
              />
              <InfoRow
                icon={<Bus className="h-4 w-4" />}
                label="Transporte"
                value={trip.vehicle}
              />
              <InfoRow
                icon={<Hotel className="h-4 w-4" />}
                label="Hospedagem"
                value={`${trip.hotel.name} · ${trip.hotel.stars}★`}
              />
            </div>

            <h2 className="mt-16 font-display text-2xl font-semibold tracking-tight">
              O que está incluso
            </h2>
            <ul className="mt-6 space-y-3">
              {trip.includes.map((i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/80">
                  <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Check className="h-3 w-3" />
                  </div>
                  {i}
                </li>
              ))}
            </ul>
          </div>

          {/* Booking card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold">
                  {formatBRL(trip.priceAdult)}
                </span>
                <span className="text-sm text-muted-foreground">/ adulto</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                ou {trip.installments}x de{" "}
                {formatBRL(trip.priceAdult / trip.installments)} sem juros
              </p>

              <div className="mt-6 space-y-2 rounded-2xl border border-border p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saindo de</span>
                  <span className="font-medium">{trip.departureCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data</span>
                  <span className="font-medium">
                    {formatDate(trip.departureDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criança</span>
                  <span className="font-medium">{formatBRL(trip.priceChild)}</span>
                </div>
              </div>

              <Link
                to="/checkout/$slug"
                params={{ slug: trip.slug }}
                className="mt-6 flex w-full items-center justify-center rounded-2xl bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-soft transition-all hover:opacity-95 active:scale-[0.99]"
              >
                Reservar agora
              </Link>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Você ainda não será cobrado
              </p>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-secondary text-foreground/70">
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
