import { useMemo } from "react";
import { BedSingle, BedDouble, Users, Crown, X } from "lucide-react";
import type { Room } from "@/data/trips";
import { formatBRL } from "@/data/trips";

export type RoomSelection = {
  roomId: string;
  /** índices dos passageiros (na lista global, exceto colo) alocados aqui */
  occupants: number[];
};

type Props = {
  rooms: Room[];
  /** lista de passageiros que precisam de cama (excluindo colo) com nome de exibição */
  payingPassengers: { label: string; sub: string }[];
  selections: RoomSelection[];
  onChange: (next: RoomSelection[]) => void;
  /** quartos já ocupados (por outras reservas) — id => quantidade indisponível */
  occupied?: Record<string, number>;
};

/** Quantas unidades simulamos por tipo de quarto (mock). */
const UNITS_PER_TYPE = 6;

const ICONS: Record<number, typeof BedSingle> = {
  1: BedSingle,
  2: BedDouble,
  3: Users,
  4: Users,
};

/**
 * Layout visual de quartos do hotel.
 * - Mostra grade de quartos disponíveis por tipo (single, duplo, triplo, quádruplo, suíte).
 * - Cliente escolhe quantos quartos quiser, mas precisa preencher capacidade máxima de cada um.
 * - Atribui cada passageiro a uma cama dentro de um quarto.
 */
export function RoomPicker({
  rooms,
  payingPassengers,
  selections,
  onChange,
  occupied = {},
}: Props) {
  const totalNeeded = payingPassengers.length;

  /** total de pessoas já alocadas */
  const totalAllocated = useMemo(
    () => selections.reduce((s, r) => s + r.occupants.length, 0),
    [selections],
  );

  /** unidades já usadas por tipo de quarto na seleção */
  const usedByType = useMemo(() => {
    const map: Record<string, number> = {};
    selections.forEach((s) => {
      map[s.roomId] = (map[s.roomId] ?? 0) + 1;
    });
    return map;
  }, [selections]);

  const toggleRoom = (room: Room) => {
    // adiciona um novo quarto desse tipo
    const used = usedByType[room.id] ?? 0;
    const occ = occupied[room.id] ?? 0;
    if (used + occ >= UNITS_PER_TYPE) return;
    onChange([...selections, { roomId: room.id, occupants: [] }]);
  };

  const removeRoom = (idx: number) => {
    onChange(selections.filter((_, i) => i !== idx));
  };

  /** atribui um passageiro a um quarto/cama */
  const assignPassenger = (passengerIdx: number, roomIdx: number) => {
    const next = selections.map((sel, i) => ({
      ...sel,
      occupants: sel.occupants.filter((p) => p !== passengerIdx),
    }));
    const room = rooms.find((r) => r.id === next[roomIdx].roomId);
    if (!room) return;
    if (next[roomIdx].occupants.length >= room.capacity) return;
    next[roomIdx] = {
      ...next[roomIdx],
      occupants: [...next[roomIdx].occupants, passengerIdx],
    };
    onChange(next);
  };

  /** remove passageiro de qualquer quarto */
  const unassignPassenger = (passengerIdx: number) => {
    onChange(
      selections.map((sel) => ({
        ...sel,
        occupants: sel.occupants.filter((p) => p !== passengerIdx),
      })),
    );
  };

  const unassigned = payingPassengers
    .map((_, i) => i)
    .filter((i) => !selections.some((s) => s.occupants.includes(i)));

  const allFull = selections.every((sel) => {
    const room = rooms.find((r) => r.id === sel.roomId);
    return room && sel.occupants.length === room.capacity;
  });

  return (
    <div className="space-y-8">
      {/* Catálogo de quartos disponíveis */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">
            Quartos disponíveis
          </h3>
          <span className="text-xs text-muted-foreground">
            {totalAllocated}/{totalNeeded} pessoas alocadas
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rooms.map((room) => {
            const used = usedByType[room.id] ?? 0;
            const occ = occupied[room.id] ?? 0;
            const remaining = UNITS_PER_TYPE - used - occ;
            const Icon = ICONS[room.capacity] ?? Crown;

            return (
              <button
                key={room.id}
                type="button"
                onClick={() => toggleRoom(room)}
                disabled={remaining <= 0}
                className={
                  "group relative flex flex-col items-start gap-2 rounded-2xl border bg-surface p-4 text-left transition-all " +
                  (remaining <= 0
                    ? "cursor-not-allowed border-border opacity-40"
                    : "border-border hover:border-accent hover:shadow-soft")
                }
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {room.capacity}p
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{room.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {remaining} disponíve{remaining === 1 ? "l" : "is"}
                  </p>
                </div>
                <p className="text-xs font-medium">
                  {room.pricePerPerson === 0
                    ? "Padrão"
                    : `${room.pricePerPerson > 0 ? "+" : "−"}${formatBRL(
                        Math.abs(room.pricePerPerson),
                      )}/pessoa`}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quartos selecionados pelo cliente */}
      {selections.length > 0 && (
        <section>
          <h3 className="mb-3 font-display text-base font-semibold">
            Seus quartos
          </h3>
          <div className="space-y-3">
            {selections.map((sel, roomIdx) => {
              const room = rooms.find((r) => r.id === sel.roomId);
              if (!room) return null;
              const Icon = ICONS[room.capacity] ?? Crown;
              const isFull = sel.occupants.length === room.capacity;

              return (
                <div
                  key={roomIdx}
                  className={
                    "rounded-2xl border bg-surface p-5 transition-colors " +
                    (isFull
                      ? "border-success/30 bg-success/5"
                      : "border-accent/40 bg-accent/5")
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background text-accent">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-display text-sm font-semibold">
                          {room.name}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            #{roomIdx + 1}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sel.occupants.length}/{room.capacity} pessoas ·{" "}
                          {isFull ? "completo" : "preencha a capacidade total"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRoom(roomIdx)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                      aria-label="Remover quarto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Camas */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {Array.from({ length: room.capacity }).map((_, bedIdx) => {
                      const passengerIdx = sel.occupants[bedIdx];
                      const passenger =
                        passengerIdx !== undefined
                          ? payingPassengers[passengerIdx]
                          : null;
                      return (
                        <div
                          key={bedIdx}
                          className={
                            "flex items-center gap-2 rounded-xl border p-3 text-sm " +
                            (passenger
                              ? "border-success/30 bg-background"
                              : "border-dashed border-border bg-background/50")
                          }
                        >
                          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-secondary text-[10px] font-semibold text-muted-foreground">
                            {bedIdx + 1}
                          </div>
                          {passenger ? (
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">
                                {passenger.label}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {passenger.sub}
                              </p>
                            </div>
                          ) : (
                            <span className="flex-1 text-xs text-muted-foreground">
                              Cama livre
                            </span>
                          )}
                          {passenger && (
                            <button
                              type="button"
                              onClick={() => unassignPassenger(passengerIdx!)}
                              className="text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              tirar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pessoas a alocar */}
      {unassigned.length > 0 && selections.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface-elevated p-5">
          <h3 className="font-display text-sm font-semibold">
            Quem fica em qual quarto?
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Toque em uma cama para colocar a pessoa lá.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {unassigned.map((idx) => (
              <PassengerChip
                key={idx}
                label={payingPassengers[idx].label}
                sub={payingPassengers[idx].sub}
                onAssign={(roomIdx) => assignPassenger(idx, roomIdx)}
                rooms={selections.map((sel, i) => {
                  const room = rooms.find((r) => r.id === sel.roomId);
                  return {
                    idx: i,
                    label: room?.name ?? "",
                    full:
                      !!room && sel.occupants.length >= room.capacity,
                  };
                })}
              />
            ))}
          </div>
        </section>
      )}

      {/* Validação final */}
      {selections.length > 0 && totalAllocated === totalNeeded && allFull && (
        <div className="rounded-2xl border border-success/30 bg-success/5 p-4 text-sm text-foreground">
          ✓ Todos os {totalNeeded} hóspedes alocados nos quartos selecionados.
        </div>
      )}
      {selections.length > 0 && !allFull && (
        <div className="rounded-2xl border border-warning/40 bg-warning/5 p-4 text-sm text-foreground">
          ⚠ Cada quarto precisa estar completo (capacidade máxima preenchida)
          antes de continuar.
        </div>
      )}
    </div>
  );
}

function PassengerChip({
  label,
  sub,
  rooms,
  onAssign,
}: {
  label: string;
  sub: string;
  rooms: { idx: number; label: string; full: boolean }[];
  onAssign: (roomIdx: number) => void;
}) {
  // Atribui automaticamente ao primeiro quarto não-cheio ao clicar
  const next = rooms.find((r) => !r.full);
  return (
    <button
      type="button"
      disabled={!next}
      onClick={() => next && onAssign(next.idx)}
      className="group flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-accent hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] text-accent">
        {label.charAt(0).toUpperCase()}
      </span>
      <span>{label}</span>
      <span className="text-[10px] font-normal text-muted-foreground">
        · {sub}
      </span>
    </button>
  );
}
