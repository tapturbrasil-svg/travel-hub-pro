import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, User, Hotel as HotelIcon } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getTripBySlug, formatBRL, formatDate, type Trip } from "@/data/trips";
import { SeatPicker } from "@/components/checkout/SeatPicker";

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

type Step = 1 | 2 | 3 | 4;

type Passenger = {
  name: string;
  document: string;
  type: "adulto" | "crianca";
};

function CheckoutPage() {
  const { trip } = Route.useLoaderData();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [withHotel, setWithHotel] = useState(true);

  const total = useMemo(() => {
    const seats = selectedSeats.length || 1;
    return seats * trip.priceAdult + (withHotel ? 0 : -200 * seats);
  }, [selectedSeats, trip.priceAdult, withHotel]);

  const goNext = () => setStep((s) => Math.min(4, (s + 1) as Step));
  const goBack = () => setStep((s) => Math.max(1, (s - 1) as Step));

  const canProceed =
    (step === 1 && selectedSeats.length > 0) ||
    (step === 2 &&
      passengers.length === selectedSeats.length &&
      passengers.every((p) => p.name.trim() && p.document.trim())) ||
    step === 3;

  // Sync passengers count with seats
  const ensurePassengers = () => {
    if (passengers.length !== selectedSeats.length) {
      setPassengers(
        selectedSeats.map(
          (_, i) =>
            passengers[i] ?? { name: "", document: "", type: "adulto" as const },
        ),
      );
    }
  };

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
        <Stepper step={step} />
      </div>

      <div className="mx-auto mt-10 max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft md:p-10">
            {step === 1 && (
              <StepSeats
                trip={trip}
                selected={selectedSeats}
                onChange={(s) => {
                  setSelectedSeats(s);
                  ensurePassengers();
                }}
              />
            )}
            {step === 2 && (
              <StepPassengers
                seats={selectedSeats}
                passengers={passengers}
                setPassengers={setPassengers}
              />
            )}
            {step === 3 && (
              <StepHotel
                trip={trip}
                withHotel={withHotel}
                setWithHotel={setWithHotel}
              />
            )}
            {step === 4 && <StepPayment trip={trip} total={total} />}
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Adultos × {selectedSeats.length || 1}
                  </span>
                  <span>
                    {formatBRL(trip.priceAdult * (selectedSeats.length || 1))}
                  </span>
                </div>
                {!withHotel && (
                  <div className="flex justify-between text-success">
                    <span>Sem hotel</span>
                    <span>−{formatBRL(200 * (selectedSeats.length || 1))}</span>
                  </div>
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
              {step > 1 && step < 4 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  Voltar
                </button>
              )}
              {step < 4 && (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canProceed}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continuar <ArrowRight className="h-4 w-4" />
                </button>
              )}
              {step === 4 && (
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

function Stepper({ step }: { step: Step }) {
  const steps = ["Assentos", "Passageiros", "Hospedagem", "Pagamento"];
  return (
    <ol className="flex items-center gap-3 overflow-x-auto no-scrollbar">
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex flex-none items-center gap-3">
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
              {done ? <Check className="h-4 w-4" /> : n}
            </div>
            <span
              className={
                "text-sm font-medium " +
                (active || done ? "text-foreground" : "text-muted-foreground")
              }
            >
              {label}
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

function StepSeats({
  trip,
  selected,
  onChange,
}: {
  trip: Trip;
  selected: number[];
  onChange: (s: number[]) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Escolha seus assentos
      </h2>
      <p className="mt-2 text-muted-foreground">
        {trip.vehicle} · {trip.capacity} lugares · selecionados: {selected.length}
      </p>

      <div className="mt-8">
        <SeatPicker
          capacity={trip.capacity}
          selected={selected}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

function StepPassengers({
  seats,
  passengers,
  setPassengers,
}: {
  seats: number[];
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
        Quem vai viajar?
      </h2>
      <p className="mt-2 text-muted-foreground">
        Preencha os dados de cada passageiro conforme o documento.
      </p>

      <div className="mt-8 space-y-6">
        {seats.map((seat, i) => (
          <div
            key={seat}
            className="rounded-2xl border border-border p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Assento {String(seat).padStart(2, "0")}
                </p>
                <p className="font-display text-base font-semibold">
                  Passageiro {i + 1}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nome completo"
                value={passengers[i]?.name ?? ""}
                onChange={(v) => update(i, { name: v })}
                placeholder="Como no documento"
              />
              <Field
                label="CPF"
                value={passengers[i]?.document ?? ""}
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

function StepHotel({
  trip,
  withHotel,
  setWithHotel,
}: {
  trip: Trip;
  withHotel: boolean;
  setWithHotel: (b: boolean) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        Hospedagem
      </h2>
      <p className="mt-2 text-muted-foreground">
        Você pode incluir hospedagem ou cuidar disso por conta própria.
      </p>

      <div className="mt-8 space-y-3">
        <HotelOption
          selected={withHotel}
          onSelect={() => setWithHotel(true)}
          title={trip.hotel.name}
          subtitle={`${trip.hotel.stars}★ · ${trip.hotel.meal} · ${trip.nights} diárias`}
          badge="Recomendado"
          price="Incluso"
        />
        <HotelOption
          selected={!withHotel}
          onSelect={() => setWithHotel(false)}
          title="Sem hospedagem"
          subtitle="Só o transporte. Você cuida da estadia."
          price="−R$ 200 / pessoa"
        />
      </div>
    </div>
  );
}

function HotelOption({
  selected,
  onSelect,
  title,
  subtitle,
  badge,
  price,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  badge?: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        "flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all " +
        (selected
          ? "border-accent bg-accent/5 ring-2 ring-accent/30"
          : "border-border bg-surface hover:border-border-strong")
      }
    >
      <div
        className={
          "flex h-11 w-11 flex-none items-center justify-center rounded-xl " +
          (selected ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground/60")
        }
      >
        <HotelIcon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-display text-base font-semibold">{title}</p>
          {badge && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <p className="text-sm font-semibold">{price}</p>
    </button>
  );
}

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
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}
