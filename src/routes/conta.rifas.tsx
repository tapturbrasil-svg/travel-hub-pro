import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Trophy } from "lucide-react";
import { TRAVELER_RAFFLES, formatBookingDate } from "@/data/traveler";

export const Route = createFileRoute("/conta/rifas")({
  component: RafflesPage,
});

function RafflesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Minhas rifas
        </h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe seus números e participe de novos sorteios.
        </p>
      </header>

      <div className="space-y-4">
        {TRAVELER_RAFFLES.map((r) => {
          const won = r.status === "drawn" && r.numbers.includes(r.winningNumber ?? "");
          return (
            <article
              key={r.id}
              className="rounded-3xl border border-border bg-surface p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    {r.status === "drawn" ? (
                      <Trophy className="h-5 w-5" />
                    ) : (
                      <Sparkles className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">
                      {r.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{r.prize}</p>
                  </div>
                </div>
                <span
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold " +
                    (r.status === "open"
                      ? "bg-success/10 text-success"
                      : won
                        ? "bg-accent/10 text-accent"
                        : "bg-secondary text-muted-foreground")
                  }
                >
                  {r.status === "open"
                    ? "Aberta"
                    : won
                      ? "Você ganhou!"
                      : "Sorteada"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Seus números
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.numbers.map((n) => (
                      <span
                        key={n}
                        className={
                          "rounded-xl border px-3 py-1.5 font-mono text-sm font-semibold " +
                          (r.winningNumber === n
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background")
                        }
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {r.status === "open" ? "Sorteio em" : "Sorteado em"}
                  </p>
                  <p className="mt-2 font-display text-base font-semibold">
                    {formatBookingDate(r.drawDate)}
                  </p>
                  {r.status === "drawn" && r.winningNumber && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Número sorteado:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {r.winningNumber}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="rounded-3xl border border-dashed border-border bg-secondary/40 p-8 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-accent" />
        <h3 className="mt-3 font-display text-lg font-semibold">
          Em breve mais rifas
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Novas oportunidades de ganhar viagens incríveis estarão disponíveis.
        </p>
      </section>
    </div>
  );
}
