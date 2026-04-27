import { createFileRoute } from "@tanstack/react-router";
import { Copy, Tag } from "lucide-react";
import { TRAVELER_COUPONS, formatBookingDate } from "@/data/traveler";

export const Route = createFileRoute("/conta/descontos")({
  component: DiscountsPage,
});

function DiscountsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Meus descontos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cupons exclusivos para sua próxima viagem. Use no checkout.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {TRAVELER_COUPONS.map((c) => (
          <article
            key={c.id}
            className={
              "relative overflow-hidden rounded-3xl border p-6 shadow-soft transition-all " +
              (c.used
                ? "border-border bg-secondary/40 opacity-60"
                : "border-border bg-surface hover:shadow-card")
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Tag className="h-5 w-5" />
              </div>
              <span
                className={
                  "rounded-full px-3 py-1 text-xs font-semibold " +
                  (c.used
                    ? "bg-secondary text-muted-foreground"
                    : "bg-success/10 text-success")
                }
              >
                {c.used ? "Utilizado" : "Disponível"}
              </span>
            </div>

            <p className="mt-5 font-display text-2xl font-semibold">
              {c.discount}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-dashed border-border bg-background px-4 py-3">
              <span className="font-mono text-sm font-semibold tracking-wider">
                {c.code}
              </span>
              <button
                type="button"
                disabled={c.used}
                onClick={() => navigator.clipboard?.writeText(c.code)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline disabled:opacity-40"
              >
                <Copy className="h-3.5 w-3.5" /> Copiar
              </button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Válido até {formatBookingDate(c.expiresAt)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
