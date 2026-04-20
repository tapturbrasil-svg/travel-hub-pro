import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { formatBRL, formatDateShort, type Trip } from "@/data/trips";

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      to="/viagem/$slug"
      params={{ slug: trip.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-secondary">
        <img
          src={trip.image}
          alt={trip.destination}
          loading="lazy"
          width={1280}
          height={960}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-soft backdrop-blur">
          <Star className="h-3 w-3 fill-foreground" />
          {trip.rating.toFixed(1)}
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-foreground">
            {trip.destination}, {trip.state}
          </h3>
          <span className="text-xs text-muted-foreground">{trip.nights} noites</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Saindo de {trip.departureCity} • {formatDateShort(trip.departureDate)} a{" "}
          {formatDateShort(trip.returnDate)}
        </p>
        <p className="pt-2 text-sm">
          <span className="font-display text-lg font-semibold text-foreground">
            {formatBRL(trip.priceAdult)}
          </span>
          <span className="text-muted-foreground"> / pessoa</span>
        </p>
      </div>
    </Link>
  );
}
