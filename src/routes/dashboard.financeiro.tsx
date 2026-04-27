import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatBRL } from "@/data/trips";

export const Route = createFileRoute("/dashboard/financeiro")({
  component: FinanceiroPage,
  head: () => ({ meta: [{ title: "Financeiro | TapTur" }] }),
});

function FinanceiroPage() {
  const cards = [
    { label: "Receita do mês", value: 184560, icon: TrendingUp, trend: "+12%" },
    { label: "A receber", value: 96200, icon: ArrowDownRight, trend: "32 reservas" },
    { label: "A pagar", value: 41800, icon: ArrowUpRight, trend: "18 lançamentos" },
    { label: "Saldo em caixa", value: 142760, icon: Wallet, trend: "atualizado agora" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Financeiro
        </h1>
        <p className="mt-2 text-muted-foreground">
          Contas a pagar, a receber, fluxo de caixa e DRE da sua agência.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <c.icon className="h-4 w-4 text-accent" />
            </div>
            <p className="mt-3 font-display text-2xl font-semibold">
              {formatBRL(c.value)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{c.trend}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Section title="Contas a receber">
          <Row label="Reserva #2841 · Maria Silva" value={1290} due="hoje" />
          <Row label="Reserva #2840 · João Pereira" value={2580} due="3 dias" />
          <Row label="Reserva #2837 · Ana Costa" value={890} due="5 dias" />
        </Section>
        <Section title="Contas a pagar">
          <Row label="Hotel Atlântico · Maio/2026" value={8400} due="hoje" out />
          <Row label="Locação ônibus leito" value={5200} due="2 dias" out />
          <Row label="Comissão guia local" value={1800} due="7 dias" out />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <div className="mt-4 divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ label, value, due, out }: { label: string; value: number; due: string; out?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">Vence em {due}</p>
      </div>
      <span
        className={
          "text-sm font-semibold " + (out ? "text-foreground" : "text-success")
        }
      >
        {out ? "−" : "+"}
        {formatBRL(value)}
      </span>
    </div>
  );
}
