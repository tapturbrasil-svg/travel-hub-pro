import { useMemo } from "react";

type Props = {
  capacity: number;
  selected: number[];
  onChange: (s: number[]) => void;
  /** seats already booked (mock) */
  occupied?: number[];
};

/**
 * Renders a coach-style seat layout: 4 seats per row split 2+2 with an aisle.
 * Front row reserved for driver, back row may be 5-across.
 */
export function SeatPicker({
  capacity,
  selected,
  onChange,
  occupied = [3, 7, 14, 18, 22, 31, 33, 40],
}: Props) {
  const seats = useMemo(
    () => Array.from({ length: capacity }, (_, i) => i + 1),
    [capacity],
  );

  // Group into rows of 4 (last row may have fewer)
  const rows: number[][] = [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }

  const toggle = (n: number) => {
    if (occupied.includes(n)) return;
    if (selected.includes(n)) onChange(selected.filter((s) => s !== n));
    else if (selected.length >= 8) return;
    else onChange([...selected, n]);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface-elevated p-6">
      {/* legend */}
      <div className="mb-6 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
        <Legend swatch="bg-secondary border-border" label="Disponível" />
        <Legend swatch="bg-accent text-accent-foreground" label="Selecionado" />
        <Legend swatch="bg-muted text-muted-foreground/50" label="Ocupado" />
      </div>

      <div className="mx-auto max-w-sm">
        {/* Driver */}
        <div className="mb-6 flex justify-end">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-dashed border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            🚐
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-[1fr_24px_1fr] gap-2">
              <div className="flex justify-end gap-2">
                {row.slice(0, 2).map((n) => (
                  <Seat
                    key={n}
                    n={n}
                    state={
                      occupied.includes(n)
                        ? "occupied"
                        : selected.includes(n)
                          ? "selected"
                          : "available"
                    }
                    onClick={() => toggle(n)}
                  />
                ))}
              </div>
              <div aria-hidden />
              <div className="flex gap-2">
                {row.slice(2, 4).map((n) => (
                  <Seat
                    key={n}
                    n={n}
                    state={
                      occupied.includes(n)
                        ? "occupied"
                        : selected.includes(n)
                          ? "selected"
                          : "available"
                    }
                    onClick={() => toggle(n)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Seat({
  n,
  state,
  onClick,
}: {
  n: number;
  state: "available" | "selected" | "occupied";
  onClick: () => void;
}) {
  const base =
    "flex h-11 w-11 items-center justify-center rounded-xl text-xs font-semibold transition-all";
  const variants = {
    available:
      "bg-secondary text-foreground border border-border hover:border-accent hover:bg-accent/5",
    selected:
      "bg-accent text-accent-foreground shadow-soft scale-105",
    occupied:
      "bg-muted text-muted-foreground/40 cursor-not-allowed line-through",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "occupied"}
      className={`${base} ${variants[state]}`}
      aria-label={`Assento ${n} ${state}`}
    >
      {String(n).padStart(2, "0")}
    </button>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-5 w-5 rounded-md ${swatch}`} />
      <span>{label}</span>
    </div>
  );
}
