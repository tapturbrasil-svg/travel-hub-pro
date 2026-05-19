import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Star, MapPin, Calendar, Bus, Hotel, Check, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/viagem/$slug")({
  component: TripPage,
  head: ({ loaderData }: any) => {
    if (!loaderData?.trip) return {};
    const { trip } = loaderData;
    return {
      meta: [
        { title: `${trip.destination} — ${trip.nights || 0} noites | TapTur` },
        { name: "description", content: trip.description?.slice(0, 155) || "" },
        { property: "og:title", content: `${trip.destination} com TapTur` },
        { property: "og:description", content: trip.description?.slice(0, 155) || "" },
        { property: "og:image", content: trip.image_url || "" },
        { name: "twitter:image", content: trip.image_url || "" },
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
  const [trip, setTrip] = useState<any>(null);
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const slug = window.location.pathname.split("/").pop() || "";
      
      const { data: tripData } = await supabase
        .from("trips")
        .select("*, agencies(*)")
        .eq("slug", slug)
        .single();

      if (tripData) {
        setTrip(tripData);
        setAgency(tripData.agencies || null);
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

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold">Viagem não encontrada</h1>
            <Link to="/" className="mt-4 inline-block text-accent hover:underline">
              Voltar para a home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rating = trip.rating || 5.0;
  const reviews = trip.reviews || 0;
  const nights = trip.nights_count || 0;
  const departureDate = trip.departure_date;
  const returnDate = trip.return_date;

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
            <Star className="h-4 w-4 fill-foreground" /> {rating.toFixed(1)}
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{reviews} avaliações</span>
          <span className="text-muted-foreground">·</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {trip.destination}, {trip.state}
          </span>
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          {trip.destination} — {nights} noites
        </h1>
        <p className="mt-2 text-muted-foreground">
          Operado por{" "}
          <Link
            to="/agencia/$slug"
            params={{ slug: agency?.slug || "" }}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {agency?.name || "Agência"}
          </Link>
        </p>
      </div>

      {/* Image */}
      <div className="mx-auto mt-8 max-w-7xl px-6">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-secondary">
          <img
            src={trip.image_url || ""}
            alt={trip.destination}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Details */}
          <div className="space-y-10 lg:col-span-2">
            <section>
              <h2 className="font-display text-2xl font-semibold">Sobre a viagem</h2>
              <p className="mt-4 leading-relaxed text-foreground/80">
                {trip.description || "Viagem incríveis com tudo incluído."}
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold">O que inclui</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Hospedagem</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Translado</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Guia turístico</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-success" />
                  <span>Seguro viagem</span>
                </li>
              </ul>
            </section>
          </div>

          {/* Booking card */}
          <div>
            <div className="sticky top-8 rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Adulto</p>
                  <p className="text-2xl font-bold">
                    R$ {trip.price_adult?.toLocaleString("pt-BR")}
                  </p>
                </div>
                {trip.price_child > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Criança (até 12 anos)</p>
                    <p className="text-xl font-semibold">
                      R$ {trip.price_child?.toLocaleString("pt-BR")}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {departureDate} até {returnDate}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vagas disponíveis</p>
                  <p className="font-medium">{trip.available_seats} de {trip.total_seats}</p>
                </div>
              </div>

              <Link
                to="/checkout/$slug"
                params={{ slug: trip.slug }}
                className="mt-6 block w-full rounded-xl bg-primary py-3 text-center font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Reservar agora
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}