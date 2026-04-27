import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Hotel as HotelIcon,
  Baby,
  BedDouble,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  getTripBySlug,
  formatBRL,
  formatDate,
  type Trip,
} from "@/data/trips";
import { SeatPicker } from "@/components/checkout/SeatPicker";
import { RoomPicker, type RoomSelection } from "@/components/checkout/RoomPicker";

export const Route = createFileRoute("/checkout/$slug")({
  component: CheckoutPage,
  loader: ({ params }): { trip: Trip } => {
    const trip = getTripBySlug(params.slug);
    if (!trip) throw notFound();
    return { trip };
  },
  head: () => ({
    meta: [{ title: "Finalizar reserva | TapTur" }],
  }),
});

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type PassengerCategory = "adult" | "child_paid" | "child_half" | "child_lap";

type Passenger = {
  name: string;
  document: string;
  category: PassengerCategory;
  ageYears?: number;
  /** assento associado (null para criança no colo) */
  seat: number | null;
};

type Step = 1 | 2 | 3 | 4 | 5;

/* ------------------------------------------------------------------ */
/* Pricing helpers                                                     */
/* ------------------------------------------------------------------ */

function pricePerCategory(trip: Trip, cat: PassengerCategory): number {
  switch (cat) {
    case "adult":
      return trip.priceAdult;
    case "child_paid":
      // 5–12 anos, paga meia (regra: trip.priceChild = meia)
      return trip.priceChild;
    case "child_half":
      // alias preservado
      return trip.priceChild;
    case "child_lap":
      // criança até 5 anos no colo: gratuita
      return 0;
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function CheckoutPage() {
  const { trip } = Route.useLoaderData() as { trip: Trip };
  const navigate = useNavigate();

  /* ---------- Tipo de pacote escolhido ---------- */
  // initial value baseado nas regras da agência
  const initialMode: "transport_only" | "lodging_only" | "full" =
    trip.packageType === "transport"
      ? "transport_only"
      : trip.packageType === "lodging"
        ? "lodging_only"
        : "full";

  const [packageMode, setPackageMode] =
    useState<"transport_only" | "lodging_only" | "full">(initialMode);

  const includesTransport = packageMode !== "lodging_only";
  const includesLodging = packageMode !== "transport_only";

  /* ---------- Estado principal ---------- */
  const [step, setStep] = useState<Step>(1);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState<{ ageYears: number; lap: boolean }[]>(
    [],
  );
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [roomSelections, setRoomSelections] = useState<RoomSelection[]>([]);

  /* ---------- Categorias derivadas ---------- */
  const categories: PassengerCategory[] = useMemo(() => {
    const cats: PassengerCategory[] = [];
    for (let i = 0; i < adults; i++) cats.push("adult");
    for (const c of children) {
      if (c.ageYears < 5 && c.lap) cats.push("child_lap");
      else if (c.ageYears < 5 && !c.lap) cats.push("child_paid");
      else if (c.ageYears <= 12) cats.push("child_half");
      else cats.push("adult");
    }
    return cats;
  }, [adults, children]);

  /** quantidade de assentos necessária (todos exceto colo, e só se viagem inclui transporte) */
  const seatsNeeded = useMemo(() => {
    if (!includesTransport) return 0;
    return categories.filter((c) => c !== "child_lap").length;
  }, [categories, includesTransport]);

  /* ---------- Sincronização de passageiros ---------- */
  // Resetar assentos se mudar quantidade de pessoas
  useEffect(() => {
    setSelectedSeats((prev) => prev.slice(0, seatsNeeded));
  }, [seatsNeeded]);

  // Manter passageiros sincronizados com categorias e assentos
  useEffect(() => {
    setPassengers((prev) => {
      const next: Passenger[] = [];
      let seatIdx = 0;
      categories.forEach((cat, i) => {
        const existing = prev[i];
        const needsSeat = cat !== "child_lap" && includesTransport;
        const seat = needsSeat ? selectedSeats[seatIdx++] ?? null : null;
        next.push({
          name: existing?.name ?? "",
          document: existing?.document ?? "",
          category: cat,
          ageYears: existing?.ageYears,
          seat,
        });
      });
      return next;
    });
  }, [categories, selectedSeats, includesTransport]);

  /* ---------- Cálculo do total ---------- */
  const selectedRoom: Room | undefined = useMemo(
    () => trip.hotel.rooms.find((r) => r.id === selectedRoomId),
    [selectedRoomId, trip.hotel.rooms],
  );

  const subtotal = useMemo(() => {
    return categories.reduce((sum, c) => sum + pricePerCategory(trip, c), 0);
  }, [categories, trip]);

  const lodgingAdjust = useMemo(() => {
    if (!includesLodging) return -(trip.hotelDiscount ?? 0) * adults;
    if (!selectedRoom) return 0;
    // pricePerPerson aplicada apenas a quem ocupa assento (cama)
    const payingHeads = categories.filter((c) => c !== "child_lap").length;
    return selectedRoom.pricePerPerson * payingHeads;
  }, [includesLodging, trip.hotelDiscount, selectedRoom, categories, adults]);

  const total = Math.max(0, subtotal + lodgingAdjust);

  /* ---------- Navegação dos passos ---------- */
  // Steps dinâmicos: 1 People, 2 Seats (se transporte), 3 Hotel (se lodging com escolha de quarto), 4 Passenger Data, 5 Pagamento
  // Para simplificar, sempre 5 steps mas pulamos os opcionais
  const stepLabels: { key: Step; label: string; show: boolean }[] = [
    { key: 1, label: "Quem viaja", show: true },
    { key: 2, label: "Assentos", show: includesTransport },
    { key: 3, label: "Hospedagem", show: includesLodging },
    { key: 4, label: "Dados", show: true },
    { key: 5, label: "Pagamento", show: true },
  ];

  const visibleSteps = stepLabels.filter((s) => s.show);

  const goNext = () => {
    const idx = visibleSteps.findIndex((s) => s.key === step);
    const next = visibleSteps[idx + 1];
    if (next) setStep(next.key);
  };
  const goBack = () => {
    const idx = visibleSteps.findIndex((s) => s.key === step);
    const prev = visibleSteps[idx - 1];
    if (prev) setStep(prev.key);
  };

  const canProceed = (() => {
    if (step === 1) return adults + children.length > 0;
    if (step === 2) return selectedSeats.length === seatsNeeded;
    if (step === 3) return !includesLodging || !!selectedRoomId;
    if (step === 4)
      return passengers.every(
        (p) => (p?.name ?? "").trim().length > 1 && (p?.document ?? "").trim().length > 3,
      );
    return true;
  })();

  const isLastStep = step === 5;

  /* ---------- Render ---------- */
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-6 pt-6">
        <Link
          to="/viagem/$slug"
          params={{ slug: trip.slug }}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a viagem
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Finalize sua reserva
        </h1>
        <p className="mt-2 text-muted-foreground">
          {trip.destination}, {trip.state} · {formatDate(trip.departureDate)}
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-6">
        <Stepper steps={visibleSteps} current={step} />
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-6 pb-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft md:p-10">
            {step === 1 && (
              <StepPeople
                trip={trip}
                packageMode={packageMode}
                setPackageMode={setPackageMode}
                adults={adults}
                setAdults={setAdults}
                children={children}
                setChildren={setChildren}
              />
            )}

            {step === 2 && includesTransport && (
              <StepSeats
                trip={trip}
                seatsNeeded={seatsNeeded}
                selected={selectedSeats}
                onChange={setSelectedSeats}
              />
            )}

            {step === 3 && includesLodging && (
              <StepHotel
                trip={trip}
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
                payingHeads={categories.filter((c) => c !== "child_lap").length}
              />
            )}

            {step === 4 && (
              <StepPassengers
                passengers={passengers}
                setPassengers={setPassengers}
              />
            )}

            {step === 5 && <StepPayment trip={trip} total={total} />}
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={trip.image}
                  alt={trip.destination}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">
                {trip.destination}
              </h3>
              <p className="text-sm text-muted-foreground">
                {trip.nights} noites · {trip.vehicle}
              </p>

              <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
                <SummaryRow
                  label={`Adultos × ${adults}`}
                  value={formatBRL(trip.priceAdult * adults)}
                />
                {categories.filter((c) => c === "child_half" || c === "child_paid").length >
                  0 && (
                  <SummaryRow
                    label={`Crianças × ${
                      categories.filter(
                        (c) => c === "child_half" || c === "child_paid",
                      ).length
                    }`}
                    value={formatBRL(
                      categories
                        .filter((c) => c === "child_half" || c === "child_paid")
                        .reduce((s, c) => s + pricePerCategory(trip, c), 0),
                    )}
                  />
                )}
                {categories.filter((c) => c === "child_lap").length > 0 && (
                  <SummaryRow
                    label={`Colo × ${
                      categories.filter((c) => c === "child_lap").length
                    }`}
                    value="Grátis"
                    success
                  />
                )}
                {!includesLodging && trip.hotelDiscount && (
                  <SummaryRow
                    label="Sem hospedagem"
                    value={`−${formatBRL(trip.hotelDiscount * adults)}`}
                    success
                  />
                )}
                {includesLodging && selectedRoom && selectedRoom.pricePerPerson !== 0 && (
                  <SummaryRow
                    label={selectedRoom.name}
                    value={`${selectedRoom.pricePerPerson > 0 ? "+" : "−"}${formatBRL(
                      Math.abs(
                        selectedRoom.pricePerPerson *
                          categories.filter((c) => c !== "child_lap").length,
                      ),
                    )}`}
                  />
                )}

                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatBRL(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ou {trip.installments}x de{" "}
                  {formatBRL(total / trip.installments)} sem juros
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              {visibleSteps.findIndex((s) => s.key === step) > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Voltar
                </button>
              )}
              {!isLastStep && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canProceed}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              )}
              {isLastStep && (
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/reserva-confirmada/$slug",
                      params: { slug: trip.slug },
                    })
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:opacity-95"
                >
                  Confirmar reserva <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* UI bits                                                             */
/* ------------------------------------------------------------------ */

function Stepper({
  steps,
  current,
}: {
  steps: { key: Step; label: string; show: boolean }[];
  current: Step;
}) {
  return (
    <ol className="flex items-center gap-3 overflow-x-auto no-scrollbar">
      {steps.map((s, i) => {
        const active = s.key === current;
        const done = steps.findIndex((x) => x.key === current) > i;
        return (
          <li key={s.key} className="flex flex-none items-center gap-3">
            <div
              className={
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors " +
                (done
                  ? "bg-foreground text-background"
                  : active
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-muted-foreground")
              }
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={
                "text-sm font-medium " +
                (active || done ? "text-foreground" : "text-muted-foreground")
              }
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className="h-px w-10 bg-border md:w-16" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SummaryRow({
  label,
  value,
  success,
}: {
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div
      className={
        "flex justify-between " +
        (success ? "text-success" : "text-foreground")
      }
    >
      <span className={success ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — People & package mode                                      */
/* ------------------------------------------------------------------ */

function StepPeople({
  trip,
  packageMode,
  setPackageMode,
  adults,
  setAdults,
  children,
  setChildren,
}: {
  trip: Trip;
  packageMode: "transport_only" | "lodging_only" | "full";
  setPackageMode: (m: "transport_only" | "lodging_only" | "full") => void;
  adults: number;
  setAdults: (n: number) => void;
  children: { ageYears: number; lap: boolean }[];
  setChildren: (c: { ageYears: number; lap: boolean }[]) => void;
}) {
  const canChoose = trip.packageType === "flexible";
  const showPackageOptions = canChoose;

  return (
    <div className="space-y-10">
      {showPackageOptions && (
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            O que deseja contratar?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Esta agência oferece flexibilidade — escolha como prefere viajar.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <PackageOption
              selected={packageMode === "full"}
              onSelect={() => setPackageMode("full")}
              title="Pacote completo"
              subtitle="Transporte + hospedagem"
              badge="Recomendado"
            />
            <PackageOption
              selected={packageMode === "transport_only"}
              onSelect={() => setPackageMode("transport_only")}
              title="Só transporte"
              subtitle={
                trip.hotelDiscount
                  ? `Você economiza ${formatBRL(trip.hotelDiscount)} por adulto`
                  : "Cuide você da hospedagem"
              }
            />
          </div>
        </section>
      )}

      {!canChoose && trip.packageType === "full" && (
        <section className="rounded-2xl border border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
          Esta viagem é vendida apenas como <strong>pacote completo</strong>{" "}
          (transporte + hospedagem juntos).
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Quem vai viajar?
        </h2>
        <p className="mt-2 text-muted-foreground">
          Adultos pagam integral. Crianças de 5 a 12 anos pagam meia. Menores de 5
          podem ir no colo gratuitamente.
        </p>

        <div className="mt-6 space-y-4">
          <Counter
            icon={<User className="h-4 w-4" />}
            label="Adultos"
            sub="A partir de 13 anos"
            value={adults}
            min={1}
            onChange={setAdults}
          />
          <Counter
            icon={<Baby className="h-4 w-4" />}
            label="Crianças"
            sub="0 a 12 anos"
            value={children.length}
            min={0}
            onChange={(n) => {
              if (n > children.length) {
                setChildren([
                  ...children,
                  ...Array.from({ length: n - children.length }, () => ({
                    ageYears: 6,
                    lap: false,
                  })),
                ]);
              } else {
                setChildren(children.slice(0, n));
              }
            }}
          />
        </div>

        {children.length > 0 && (
          <div className="mt-6 space-y-3">
            <p className="text-sm font-semibold text-foreground">
              Idade de cada criança
            </p>
            {children.map((c, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Baby className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-semibold">Criança {i + 1}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Idade</span>
                    <input
                      type="number"
                      min={0}
                      max={17}
                      value={c.ageYears}
                      onChange={(e) => {
                        const next = [...children];
                        next[i] = {
                          ...next[i],
                          ageYears: Math.max(0, Math.min(17, +e.target.value || 0)),
                        };
                        setChildren(next);
                      }}
                      className="w-20 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </label>

                  {c.ageYears < 5 && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={c.lap}
                        onChange={(e) => {
                          const next = [...children];
                          next[i] = { ...next[i], lap: e.target.checked };
                          setChildren(next);
                        }}
                        className="h-4 w-4 rounded border-border accent-accent"
                      />
                      <span>Vai no colo (grátis)</span>
                    </label>
                  )}

                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                    {c.ageYears < 5 && c.lap
                      ? "Grátis (colo)"
                      : c.ageYears < 5
                        ? `Assento próprio · ${formatBRL(trip.priceChild)}`
                        : c.ageYears <= 12
                          ? `Meia · ${formatBRL(trip.priceChild)}`
                          : `Adulto · ${formatBRL(trip.priceAdult)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function PackageOption({
  selected,
  onSelect,
  title,
  subtitle,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "rounded-2xl border p-5 text-left transition-all " +
        (selected
          ? "border-accent bg-accent/5 ring-2 ring-accent/30"
          : "border-border bg-surface hover:border-border-strong")
      }
    >
      <div className="flex items-center gap-2">
        <p className="font-display text-base font-semibold">{title}</p>
        {badge && (
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
            {badge}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </button>
  );
}

function Counter({
  icon,
  label,
  sub,
  value,
  min = 0,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  value: number;
  min?: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-9 w-9 rounded-full border border-border text-base font-semibold transition hover:bg-secondary disabled:opacity-40"
          disabled={value <= min}
          aria-label="Diminuir"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="h-9 w-9 rounded-full border border-border text-base font-semibold transition hover:bg-secondary"
          aria-label="Aumentar"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Seats                                                      */
/* ------------------------------------------------------------------ */

function StepSeats({
  trip,
  seatsNeeded,
  selected,
  onChange,
}: {
  trip: Trip;
  seatsNeeded: number;
  selected: number[];
  onChange: (s: number[]) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Escolha {seatsNeeded === 1 ? "seu assento" : `${seatsNeeded} assentos`}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {trip.vehicle} · {trip.capacity} lugares · selecionados: {selected.length}/
        {seatsNeeded}
      </p>

      <div className="mt-8">
        <SeatPicker
          capacity={trip.capacity}
          selected={selected}
          onChange={(next) => {
            // limit to seatsNeeded
            if (next.length <= seatsNeeded) onChange(next);
            else onChange(next.slice(0, seatsNeeded));
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Hotel & rooms                                              */
/* ------------------------------------------------------------------ */

function StepHotel({
  trip,
  selectedRoomId,
  setSelectedRoomId,
  payingHeads,
}: {
  trip: Trip;
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;
  payingHeads: number;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Escolha seu quarto
      </h2>
      <p className="mt-2 text-muted-foreground">
        {trip.hotel.name} · {trip.hotel.stars}★ · {trip.hotel.meal} ·{" "}
        {trip.nights} diárias
      </p>

      <div className="mt-8 space-y-3">
        {trip.hotel.rooms.map((room) => {
          const selected = selectedRoomId === room.id;
          const fits = payingHeads <= room.capacity;
          return (
            <button
              key={room.id}
              type="button"
              disabled={!fits}
              onClick={() => setSelectedRoomId(room.id)}
              className={
                "flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all " +
                (selected
                  ? "border-accent bg-accent/5 ring-2 ring-accent/30"
                  : "border-border bg-surface hover:border-border-strong") +
                (!fits ? " cursor-not-allowed opacity-50" : "")
              }
            >
              <div
                className={
                  "flex h-11 w-11 flex-none items-center justify-center rounded-xl " +
                  (selected
                    ? "bg-accent text-accent-foreground"
                    : "bg-secondary text-foreground/60")
                }
              >
                <BedDouble className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-base font-semibold">
                    {room.name}
                  </p>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Até {room.capacity} pessoa{room.capacity > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {room.description}
                </p>
                {!fits && (
                  <p className="mt-1 text-xs text-warning-foreground">
                    Capacidade insuficiente para {payingHeads} pessoas.
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">por pessoa</p>
                <p className="text-sm font-semibold">
                  {room.pricePerPerson === 0
                    ? "Padrão"
                    : `${room.pricePerPerson > 0 ? "+" : "−"}${formatBRL(
                        Math.abs(room.pricePerPerson),
                      )}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        <HotelIcon className="mr-2 inline h-4 w-4" />
        {trip.hotel.meal} incluso · check-in em{" "}
        {formatDate(trip.departureDate)}.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Passenger data                                             */
/* ------------------------------------------------------------------ */

function StepPassengers({
  passengers,
  setPassengers,
}: {
  passengers: Passenger[];
  setPassengers: (p: Passenger[]) => void;
}) {
  const update = (i: number, patch: Partial<Passenger>) => {
    const next = [...passengers];
    next[i] = { ...next[i], ...patch };
    setPassengers(next);
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Dados dos passageiros
      </h2>
      <p className="mt-2 text-muted-foreground">
        Preencha conforme o documento de cada um.
      </p>

      <div className="mt-8 space-y-6">
        {passengers.map((p, i) => (
          <div key={i} className="rounded-2xl border border-border p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                {p.category === "child_lap" || p.category === "child_paid" || p.category === "child_half" ? (
                  <Baby className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {p.category === "adult"
                    ? "Adulto"
                    : p.category === "child_lap"
                      ? "Criança no colo"
                      : p.category === "child_half"
                        ? "Criança · meia"
                        : "Criança"}{" "}
                  {p.seat
                    ? `· Assento ${String(p.seat).padStart(2, "0")}`
                    : p.category === "child_lap"
                      ? "· Sem assento"
                      : ""}
                </p>
                <p className="font-display text-base font-semibold">
                  Passageiro {i + 1}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome completo"
                value={p.name ?? ""}
                onChange={(v) => update(i, { name: v })}
                placeholder="Como no documento"
              />
              <Field
                label={p.category === "adult" ? "CPF" : "CPF ou Certidão"}
                value={p.document ?? ""}
                onChange={(v) => update(i, { document: v })}
                placeholder="000.000.000-00"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — Payment                                                    */
/* ------------------------------------------------------------------ */

function StepPayment({ trip, total }: { trip: Trip; total: number }) {
  const [method, setMethod] = useState<"credit" | "pix">("credit");
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Como você quer pagar?
      </h2>
      <p className="mt-2 text-muted-foreground">
        Pagamento 100% seguro. Seus dados são protegidos.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <PayOption
          selected={method === "credit"}
          onSelect={() => setMethod("credit")}
          title="Cartão de crédito"
          subtitle={`Em até ${trip.installments}x sem juros`}
        />
        <PayOption
          selected={method === "pix"}
          onSelect={() => setMethod("pix")}
          title="PIX"
          subtitle="5% de desconto à vista"
        />
      </div>

      {method === "credit" && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Field label="Número do cartão" value="" onChange={() => {}} placeholder="0000 0000 0000 0000" />
          <Field label="Nome no cartão" value="" onChange={() => {}} placeholder="Como impresso" />
          <Field label="Validade" value="" onChange={() => {}} placeholder="MM/AA" />
          <Field label="CVV" value="" onChange={() => {}} placeholder="000" />
        </div>
      )}

      {method === "pix" && (
        <div className="mt-8 rounded-2xl border border-border bg-secondary/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">Total à vista</p>
          <p className="mt-1 font-display text-3xl font-semibold">
            {formatBRL(total * 0.95)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Você receberá o QR Code após confirmar a reserva.
          </p>
        </div>
      )}
    </div>
  );
}

function PayOption({
  selected,
  onSelect,
  title,
  subtitle,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "rounded-2xl border p-5 text-left transition-all " +
        (selected
          ? "border-accent bg-accent/5 ring-2 ring-accent/30"
          : "border-border bg-surface hover:border-border-strong")
      }
    >
      <p className="font-display text-base font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Generic field                                                       */
/* ------------------------------------------------------------------ */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}
