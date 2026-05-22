import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Sparkles, Trophy } from "lucide-react";
import { formatBookingDate } from "@/data/traveler";

export const Route = createFileRoute("/conta/rifas")({
  component: RafflesPage,
});

function RafflesPage() {
  const [rifas, setRifas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRifas() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let query = supabase
          .from("rifas")
          .select("*, rifa_participants(count)")
          .order("created_at", { ascending: false });
        
        if (user) {
          query = query.eq("user_id", user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setRifas(data || []);
      } catch (err) {
        console.error("Error loading rifas:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadRifas();
  }, []);

  if (loading) {
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
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

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
        {rifas.map((r) => {
          const status = r.status === "ativa" ? "open" : "drawn";
          const won = status === "drawn" && r.numbers?.includes(r.winningNumber ?? "");
          const participantCount = r.rifa_participants?.[0]?.count || 0;
          return (
            <article
              key={r.id}
              className="rounded-3xl border border-border bg-surface p-6 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    {status === "drawn" ? (
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
                    (status === "open"
                      ? "bg-success/10 text-success"
                      : won
                        ? "bg-accent/10 text-accent"
                        : "bg-secondary text-muted-foreground")
                  }
                >
                  {status === "open"
                    ? "Aberta"
                    : won
                      ? "Você ganhou!"
                      : "Sorteada"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Participações
                  </p>
                  <p className="mt-2 font-mono text-lg font-semibold">
                    {participantCount}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {status === "open" ? "Sorteio em" : "Sorteado em"}
                  </p>
                  <p className="mt-2 font-display text-base font-semibold">
                    {formatBookingDate(r.draw_date || r.created_at)}
                  </p>
                  {status === "drawn" && r.winning_number && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Número sorteado:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {r.winning_number}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {rifas.length === 0 && (
        <section className="rounded-3xl border border-dashed border-border bg-secondary/40 p-8 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-accent" />
          <h3 className="mt-3 font-display text-lg font-semibold">
            Em breve mais rifas
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Novas oportunidades de ganhar viagens incríveis estarão disponíveis.
          </p>
        </section>
      )}
    </div>
  );
}
