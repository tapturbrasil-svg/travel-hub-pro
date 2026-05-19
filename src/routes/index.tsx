import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, ShieldCheck, Headphones, Frown, Building2, MapPin, Star } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SearchBar } from "@/components/site/SearchBar";
import { TripCard } from "@/components/site/TripCard";
import { supabase } from "@/lib/supabase";
import heroBeach from "@/assets/hero-beach.jpg";

const searchSchema = z.object({
  destino: fallback(z.string(), "").default(""),
  mes: fallback(z.string(), "").default(""),
  precoMax: fallback(z.number(), 5000).default(5000),
});

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "TapTur — Viagens e excursões com as melhores agências do Brasil" },
      {
        name: "description",
        content:
          "Encontre e reserve viagens em grupo, excursões e pacotes com agências de confiança. Escolha seu assento, pague parcelado e viaje tranquilo.",
      },
      { property: "og:title", content: "TapTur — Sua próxima viagem começa aqui" },
      {
        property: "og:description",
        content:
          "Marketplace premium de viagens e excursões. Agências verificadas, reserva de assento em tempo real e parcelamento em até 12x.",
      },
    ],
  }),
});

function Index() {
  const { destino, mes, precoMax } = Route.useSearch();
  const [scrollY, setScrollY] = useState(0);
  const [trips, setTrips] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const parallaxEnabled = true;
  const parallaxSpeed = 0.5;

  useEffect(() => {
    async function loadData() {
      const [tripsRes, agenciesRes] = await Promise.all([
        supabase
          .from("trips")
          .select("*, agencies(name, slug)")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("agencies")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ]);

      if (!tripsRes.error && tripsRes.data) {
        const mapped = tripsRes.data.map((t: any) => ({
          ...t,
          agency: t.agencies?.name || "",
          agencySlug: t.agencies?.slug || "",
          image: t.image_url || "",
          departureDate: t.departure_date,
          returnDate: t.return_date,
          priceAdult: t.price_adult,
          priceChild: t.price_child,
          departureCity: t.departure_city,
          vehicle: t.vehicle_type,
          nights: t.nights_count,
          packageType: t.package_type,
          rating: 5.0,
          reviews: 0,
        }));
        setTrips(mapped);
      }

      if (!agenciesRes.error && agenciesRes.data) {
        setAgencies(agenciesRes.data);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!parallaxEnabled) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [parallaxEnabled]);

  const filtered = trips.filter((t: any) => {
    if (destino) {
      const term = destino.toLowerCase().split(",")[0].trim();
      if (
        !t.destination?.toLowerCase().includes(term) &&
        !t.state?.toLowerCase().includes(term)
      )
        return false;
    }
    if (mes && !t.departureDate?.startsWith(mes)) return false;
    if (t.priceAdult > precoMax) return false;
    return true;
  });

  const featured = trips.slice(0, 3);
  const hasFilters = !!destino || !!mes || precoMax !== 5000;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {parallaxEnabled && (
          <div 
            className="absolute inset-0 z-0"
            style={{ 
              transform: `translateY(${scrollY * parallaxSpeed}px)`,
              willChange: 'transform'
            }}
          >
            <img
              src={heroBeach}
              alt=""
              className="h-[120%] w-full object-cover opacity-40"
              aria-hidden="true"
            />
          </div>
        )}
        
        <div className={`mx-auto max-w-7xl px-6 pb-8 pt-10 md:pt-16 ${parallaxEnabled ? 'relative z-10' : ''}`}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-accent" />
                Agências verificadas em todo o Brasil
              </span>
              <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground text-balance md:text-6xl lg:text-7xl">
                Viaje para lugares que{" "}
                <span className="italic text-accent">mudam tudo</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
                Descubra viagens em grupo e excursões com as agências mais confiáveis do país.
                Escolha seu assento, parcele em até 12x e embarque com tranquilidade.
              </p>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary shadow-card lg:aspect-[5/6]">
              <img
                src={heroBeach}
                alt="Praia paradisíaca com águas cristalinas"
                width={1920}
                height={1280}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="relative z-10 mt-10 md:-mt-8">
            <SearchBar initial={{ destino, mes, precoMax }} />
          </div>
        </div>
      </section>

      {/* Agências */}
      <section id="agencias" className="mx-auto max-w-7xl px-6 pt-16">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-accent">Agências</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Escolha sua agência favorita
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse rounded-2xl bg-secondary h-48" />
            ))}
          </div>
        ) : agencies.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground">Nenhuma agência disponível.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {agencies.map((agency) => (
              <Link
                key={agency.id}
                to="/agencia/$slug"
                params={{ slug: agency.slug }}
                className="group block"
              >
                <div 
                  className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-primary hover:shadow-lg"
                  style={{ borderLeftColor: agency.brand_color || '#0EA5E9', borderLeftWidth: '4px' }}
                >
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex h-14 w-14 flex-none items-center justify-center rounded-xl text-white font-bold"
                      style={{ backgroundColor: agency.brand_color || '#0EA5E9' }}
                    >
                      {agency.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-semibold truncate">{agency.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground truncate">{agency.email}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="capitalize">{agency.plan}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span className="font-medium">{(agency.rating || 5).toFixed(1)}</span>
                      <span className="text-muted-foreground">({agency.reviews || 0})</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm text-primary">
                      Ver ofertas <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Destaques (only when no filters) */}
      {!hasFilters && trips.length > 0 && (
        <section id="destaques" className="mx-auto max-w-7xl px-6 pt-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-accent">Em destaque</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
                Viagens que estão bombando
              </h2>
            </div>
            <a
              href="#todas"
              className="hidden items-center gap-1 text-sm font-medium text-foreground hover:text-accent md:inline-flex"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        </section>
      )}

      {/* Por que TapTur — only when no filters */}
      {!hasFilters && (
        <section id="sobre" className="mx-auto max-w-7xl px-6 pt-32">
          <div className="grid gap-12 md:grid-cols-3">
            <Benefit
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Agências verificadas"
              body="Todas as agências passam por validação. Seu dinheiro e sua viagem estão sempre seguros."
            />
            <Benefit
              icon={<Sparkles className="h-5 w-5" />}
              title="Escolha seu assento"
              body="Mapa de assentos em tempo real. Reserve seu lugar favorito em segundos."
            />
            <Benefit
              icon={<Headphones className="h-5 w-5" />}
              title="Suporte humano"
              body="Atendimento de verdade, 7 dias por semana. Fale com quem entende de viagem."
            />
          </div>
        </section>
      )}

      {/* Resultados */}
      <section id="todas" className={"mx-auto max-w-7xl px-6 " + (hasFilters ? "pt-16" : "pt-32")}>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-accent">
              {hasFilters
                ? "Resultados da busca"
                : "Todas as viagens disponíveis"}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {hasFilters
                ? `${filtered.length} ${filtered.length === 1 ? "viagem encontrada" : "viagens encontradas"}`
                : `${trips.length} viagens`}
            </h2>
          </div>

          {hasFilters && (
            <Link
              to="/"
              search={{ destino: "", mes: "", precoMax: 5000 }}
              className="hidden text-sm font-medium text-muted-foreground hover:text-foreground md:inline-block"
            >
              Limpar filtros
            </Link>
          )}
        </div>

        {loading ? (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="animate-pulse rounded-3xl bg-secondary aspect-[4/5]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-border bg-surface p-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Frown className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold">
              Nenhuma viagem encontrada
            </h3>
            <p className="mt-2 text-muted-foreground">
              Tente ajustar os filtros ou explorar outras datas.
            </p>
            <Link
              to="/"
              search={{ destino: "", mes: "", precoMax: 5000 }}
              className="mt-6 inline-block rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background"
            >
              Ver todas as viagens
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        )}
      </section>

      {/* CTA agências */}
      <section className="mx-auto mt-32 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-primary-foreground md:px-16 md:py-24">
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm font-medium text-accent">Para agências</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-5xl">
              Leve sua agência para outro nível.
            </h2>
            <p className="mt-5 text-lg text-primary-foreground/80">
              A TapTur é o sistema completo para agências de viagem: vendas online, controle de
              assentos, financeiro e página própria para sua marca.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95"
            >
              Acessar dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-foreground">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-muted-foreground">{body}</p>
    </div>
  );
}