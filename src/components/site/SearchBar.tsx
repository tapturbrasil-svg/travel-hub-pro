import { useNavigate } from "@tanstack/react-router";
import { MapPin, Calendar, DollarSign, Search, X } from "lucide-react";
import { useState } from "react";
import { TRIPS } from "@/data/trips";

export type HomeFilters = {
  destino: string;
  mes: string; // "" or "YYYY-MM"
  precoMax: number;
};

const MONTHS = [
  { value: "", label: "Qualquer mês" },
  { value: "2026-05", label: "Maio 2026" },
  { value: "2026-06", label: "Junho 2026" },
  { value: "2026-07", label: "Julho 2026" },
  { value: "2026-08", label: "Agosto 2026" },
  { value: "2026-09", label: "Setembro 2026" },
  { value: "2026-10", label: "Outubro 2026" },
];

export function SearchBar({
  initial,
  onApply,
}: {
  initial: HomeFilters;
  onApply?: (f: HomeFilters) => void;
}) {
  const navigate = useNavigate();
  const [destino, setDestino] = useState(initial.destino);
  const [mes, setMes] = useState(initial.mes);
  const [precoMax, setPrecoMax] = useState(initial.precoMax);

  const apply = () => {
    const next = { destino, mes, precoMax };
    if (onApply) onApply(next);
    else
      navigate({
        to: "/",
        search: () => next,
        hash: "todas",
      });
  };

  const reset = () => {
    setDestino("");
    setMes("");
    setPrecoMax(5000);
    navigate({ to: "/", search: () => ({ destino: "", mes: "", precoMax: 5000 }) });
  };

  // Suggested destinations from data
  const suggestions = Array.from(
    new Set(TRIPS.map((t) => `${t.destination}, ${t.state}`)),
  );

  return (
    <div className="rounded-3xl border border-border bg-surface p-2 shadow-floating">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-[1.4fr_1fr_1.1fr_auto]">
        <Field
          icon={<MapPin className="h-4 w-4" />}
          label="Destino"
        >
          <input
            list="destino-suggestions"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            placeholder="Para onde?"
            className="w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          <datalist id="destino-suggestions">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>

        <Field icon={<Calendar className="h-4 w-4" />} label="Quando">
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            className="w-full cursor-pointer bg-transparent text-sm font-medium text-foreground outline-none"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          icon={<DollarSign className="h-4 w-4" />}
          label={`Até R$ ${precoMax.toLocaleString("pt-BR")}`}
        >
          <input
            type="range"
            min={500}
            max={3000}
            step={100}
            value={precoMax}
            onChange={(e) => setPrecoMax(Number(e.target.value))}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
          />
        </Field>

        <div className="flex items-center gap-1 px-1">
          {(destino || mes || precoMax !== 5000) && (
            <button
              type="button"
              onClick={reset}
              aria-label="Limpar filtros"
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={apply}
            className="flex h-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-soft transition-all hover:opacity-95 active:scale-[0.98]"
          >
            <Search className="h-4 w-4" />
            <span>Buscar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl px-5 py-3 transition-colors hover:bg-secondary">
      <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary text-foreground/70">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}
