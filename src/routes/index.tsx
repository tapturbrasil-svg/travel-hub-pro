import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, ShieldCheck, Headphones } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SearchBar } from "@/components/site/SearchBar";
import { TripCard } from "@/components/site/TripCard";
import { TRIPS } from "@/data/trips";
import heroBeach from "@/assets/hero-beach.jpg";

export const Route = createFileRoute("/")({
  component: Index,
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
  const featured = TRIPS.slice(0, 3);
  const all = TRIPS;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-10 md:pt-16">
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
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Destaques */}
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

      {/* Por que TapTur */}
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

      {/* Todas */}
      <section id="todas" className="mx-auto max-w-7xl px-6 pt-32">
        <div>
          <p className="text-sm font-medium text-accent">Explore</p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Todas as viagens disponíveis
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Selecionamos experiências únicas em destinos incríveis. Escolha a sua e reserve em
            poucos cliques.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
        </div>
      </section>

      {/* CTA agências */}
      <section id="agencias" className="mx-auto mt-32 max-w-7xl px-6">
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
            <button
              type="button"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95"
            >
              Cadastrar minha agência <ArrowRight className="h-4 w-4" />
            </button>
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
