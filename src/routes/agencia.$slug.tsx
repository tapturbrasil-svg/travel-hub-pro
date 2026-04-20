import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Star, MapPin, ArrowLeft, ShieldCheck, Calendar } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TripCard } from "@/components/site/TripCard";
import { getAgencyBySlug, getTripsByAgency, type Agency } from "@/data/agencies";
import { type Trip } from "@/data/trips";

export const Route = createFileRoute("/agencia/$slug")({
  component: AgencyPage,
  loader: ({ params }): { agency: Agency; trips: Trip[] } => {
    const agency = getAgencyBySlug(params.slug);
    if (!agency) throw notFound();
    return { agency, trips: getTripsByAgency(params.slug) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { agency } = loaderData;
    return {
      meta: [
        { title: `${agency.name} — viagens e excursões | TapTur` },
        { name: "description", content: agency.description.slice(0, 155) },
        { property: "og:title", content: `${agency.name} no TapTur` },
        { property: "og:description", content: agency.tagline },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold">Agência não encontrada</h1>
        <Link to="/" className="mt-4 inline-block text-accent hover:underline">
          Voltar para a home
        </Link>
      </div>
    </div>
  ),
});

function AgencyPage() {
  const { agency, trips } = Route.useLoaderData() as {
    agency: Agency;
    trips: Trip[];
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-6 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Todas as agências
        </Link>
      </div>

      {/* Brand banner */}
      <section className="mx-auto mt-6 max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-16 md:px-14 md:py-20"
          style={{
            background: `linear-gradient(135deg, ${agency.brandColor}, oklch(0.22 0.02 250))`,
          }}
        >
          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-10">
            <div
              className="flex h-24 w-24 flex-none items-center justify-center rounded-3xl bg-surface font-display text-3xl font-bold text-foreground shadow-card"
              aria-hidden
            >
              {agency.initials}
            </div>
            <div className="flex-1 text-primary-foreground">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                  <ShieldCheck className="h-3 w-3" /> Verificada
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                  <Star className="h-3 w-3 fill-current" />
                  {agency.rating.toFixed(1)} · {agency.reviews} avaliações
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                  <MapPin className="h-3 w-3" />
                  {agency.city}, {agency.state}
                </span>
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                {agency.name}
              </h1>
              <p className="mt-2 text-lg text-primary-foreground/80">
                {agency.tagline}
              </p>
            </div>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          />
        </div>
      </section>

      {/* About */}
      <section className="mx-auto mt-16 max-w-3xl px-6">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Sobre a agência
        </h2>
        <p className="mt-4 text-pretty leading-relaxed text-foreground/80">
          {agency.description}
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <Stat label="Anos de mercado" value={`${agency.yearsActive}+`} />
          <Stat label="Avaliação média" value={agency.rating.toFixed(1)} />
          <Stat label="Avaliações" value={agency.reviews.toLocaleString("pt-BR")} />
        </div>
      </section>

      {/* Trips */}
      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div>
          <p className="text-sm font-medium text-accent">Catálogo</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Viagens da {agency.name}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {trips.length} {trips.length === 1 ? "viagem disponível" : "viagens disponíveis"}
          </p>
        </div>

        {trips.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-border bg-surface p-16 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Nenhuma viagem publicada no momento.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
