import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Star, MapPin, ArrowLeft, ShieldCheck, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { TripCard } from "@/components/site/TripCard";
import { supabase } from "@/lib/supabase";
import { type Trip } from "@/data/trips";

export const Route = createFileRoute("/agencia/$slug")({
  component: AgencyPage,
  head: ({ loaderData }: any) => {
    if (!loaderData?.agency) return {};
    const { agency } = loaderData;
    return {
      meta: [
        { title: `${agency.name} — viagens e excursões | TapTur` },
        { name: "description", content: (agency.description || "").slice(0, 155) },
        { property: "og:title", content: `${agency.name} no TapTur` },
        { property: "og:description", content: agency.tagline || "" },
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
  const [agency, setAgency] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const slug = window.location.pathname.split("/").pop() || "";
      
      const { data: agencyData } = await supabase
        .from("agencies")
        .select("*")
        .eq("slug", slug)
        .single();

      if (agencyData) {
        setAgency(agencyData);
        
        const { data: tripsData } = await supabase
          .from("trips")
          .select("*")
          .eq("agency_id", agencyData.id)
          .eq("status", "active");
        
        setTrips(tripsData || []);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold">Agência não encontrada</h1>
            <Link to="/" className="mt-4 inline-block text-accent hover:underline">
              Voltar para a home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rating = agency.rating || 5.0;
  const reviews = agency.reviews || 0;
  const initials = agency.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "XX";
  const brandColor = agency.brand_color || "#0EA5E9";

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
            background: `linear-gradient(135deg, ${brandColor}, oklch(0.22 0.02 250))`,
          }}
        >
          <div className="relative z-10 flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-10">
            <div
              className="flex h-24 w-24 flex-none items-center justify-center rounded-3xl bg-surface font-display text-3xl font-bold text-foreground shadow-card"
              aria-hidden
            >
              {initials}
            </div>
            <div className="flex-1 text-primary-foreground">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                  <ShieldCheck className="h-3 w-3" /> Verificada
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur">
                  <Star className="h-3 w-3 fill-current" />
                  {rating.toFixed(1)} · {reviews} avaliações
                </span>
              </div>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
                {agency.name}
              </h1>
              <p className="mt-2 text-lg text-primary-foreground/80">
                {agency.tagline || "Viagens e excursões"}
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
          {agency.description || "Agência de turismo com as melhores viagens e excursões."}
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <Stat label="Anos de mercado" value="2+" />
          <Stat label="Avaliação média" value={rating.toFixed(1)} />
          <Stat label="Avaliações" value={reviews.toLocaleString("pt-BR")} />
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

        {trips.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip: any) => (
              <TripCard
                key={trip.id}
                trip={{
                  ...trip,
                  slug: trip.slug,
                  destination: trip.destination,
                  state: trip.state || "",
                  agency: agency.name,
                  agencySlug: agency.slug,
                  image: trip.image_url || "",
                  departureDate: trip.departure_date,
                  returnDate: trip.return_date,
                  priceAdult: trip.price_adult,
                  priceChild: trip.price_child,
                  nights: 0,
                  rating: 5.0,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">
              Nenhuma viagem disponível no momento.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}