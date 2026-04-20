import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, MapPin, Bus, Bed, Coins } from "lucide-react";

export const Route = createFileRoute("/dashboard/viagens/nova")({
  component: NewTrip,
  head: () => ({ meta: [{ title: "Nova viagem | TapTur" }] }),
});

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1, label: "Dados básicos", icon: MapPin },
  { n: 2, label: "Transporte", icon: Bus },
  { n: 3, label: "Hospedagem", icon: Bed },
  { n: 4, label: "Preço", icon: Coins },
] as const;

const VEHICLE_LAYOUTS = [
  { id: "leito-46", name: "Ônibus Leito", capacity: 46, layout: "2+2", desc: "Poltronas reclináveis" },
  { id: "exec-42", name: "Ônibus Executivo", capacity: 42, layout: "2+2", desc: "Conforto padrão" },
  { id: "van-16", name: "Van Premium", capacity: 16, layout: "2+1", desc: "Grupos pequenos" },
];

function NewTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  // Form state
  const [destination, setDestination] = useState("");
  const [state, setState] = useState("");
  const [departureCity, setDepartureCity] = useState("São Paulo");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [vehicleId, setVehicleId] = useState(VEHICLE_LAYOUTS[0].id);
  const [withHotel, setWithHotel] = useState(true);
  const [hotelName, setHotelName] = useState("");
  const [hotelStars, setHotelStars] = useState(4);
  const [priceAdult, setPriceAdult] = useState(1290);
  const [priceChild, setPriceChild] = useState(690);

  const next = () => setStep((s) => Math.min(4, s + 1) as Step);
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  const canNext =
    (step === 1 && destination && state && departureDate && returnDate) ||
    (step === 2 && vehicleId) ||
    (step === 3 && (!withHotel || hotelName)) ||
    step === 4;

  const submit = () => {
    // mock — would POST to backend
    navigate({ to: "/dashboard/viagens" });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-12">
      <Link
        to="/dashboard/viagens"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight md:text-4xl">
        Nova viagem
      </h1>
      <p className="mt-1 text-muted-foreground">
        Configure os detalhes em 4 passos.
      </p>

      {/* Stepper */}
      <ol className="mt-10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STEPS.map(({ n, label, icon: Icon }) => {
          const active = n === step;
          const done = n < step;
          return (
            <li key={n} className="flex flex-none items-center gap-2">
              <div
                className={
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors " +
                  (done
                    ? "bg-foreground text-background"
                    : active
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground")
                }
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span
                className={
                  "text-sm font-medium " +
                  (active || done ? "text-foreground" : "text-muted-foreground")
                }
              >
                {label}
              </span>
              {n < 4 && <div className="mx-2 h-px w-8 bg-border md:w-12" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {/* Body */}
      <div className="mt-8 rounded-3xl border border-border bg-background p-6 shadow-soft md:p-10">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Para onde vai a viagem?
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Destino" value={destination} onChange={setDestination} placeholder="Ex.: Rio de Janeiro" />
              <Input label="Estado" value={state} onChange={setState} placeholder="RJ" />
              <Input label="Cidade de saída" value={departureCity} onChange={setDepartureCity} />
              <div />
              <DateInput label="Data de ida" value={departureDate} onChange={setDepartureDate} />
              <DateInput label="Data de volta" value={returnDate} onChange={setReturnDate} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Escolha o transporte
            </h2>
            <p className="text-sm text-muted-foreground">
              O layout de assentos será gerado automaticamente conforme o veículo.
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              {VEHICLE_LAYOUTS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleId(v.id)}
                  className={
                    "rounded-2xl border p-5 text-left transition-all " +
                    (vehicleId === v.id
                      ? "border-accent bg-accent/5 ring-2 ring-accent/30"
                      : "border-border bg-surface hover:border-border-strong")
                  }
                >
                  <Bus className="h-5 w-5 text-foreground/70" />
                  <p className="mt-3 font-display text-base font-semibold">
                    {v.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {v.capacity} lugares · {v.layout}
                  </p>
                  <p className="mt-2 text-xs text-foreground/60">{v.desc}</p>
                </button>
              ))}
            </div>

            {/* Mini seat preview */}
            <div className="rounded-2xl border border-border bg-surface-elevated p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pré-visualização do layout
              </p>
              <div className="mt-4 flex items-end justify-center gap-1">
                {Array.from({
                  length:
                    VEHICLE_LAYOUTS.find((v) => v.id === vehicleId)?.capacity ?? 0,
                }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-md bg-secondary"
                    style={{
                      marginLeft: i % 4 === 2 ? 12 : 0,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Hospedagem
            </h2>

            <div className="space-y-3">
              <ToggleOption
                selected={withHotel}
                onSelect={() => setWithHotel(true)}
                title="Com hospedagem"
                desc="Inclua hotel no pacote (recomendado)"
              />
              <ToggleOption
                selected={!withHotel}
                onSelect={() => setWithHotel(false)}
                title="Apenas transporte"
                desc="Cliente cuida da estadia"
              />
            </div>

            {withHotel && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nome do hotel" value={hotelName} onChange={setHotelName} placeholder="Hotel Atlântico" />
                <div>
                  <Label>Classificação</Label>
                  <div className="mt-2 flex gap-1">
                    {[3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setHotelStars(s)}
                        className={
                          "rounded-xl border px-4 py-2 text-sm font-medium transition-all " +
                          (hotelStars === s
                            ? "border-accent bg-accent/5 text-accent"
                            : "border-border text-foreground/70 hover:bg-secondary")
                        }
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-display text-xl font-semibold tracking-tight">
              Preços
            </h2>
            <p className="text-sm text-muted-foreground">
              Defina o valor por pessoa. Você pode editar depois.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberInput
                label="Preço adulto (R$)"
                value={priceAdult}
                onChange={setPriceAdult}
              />
              <NumberInput
                label="Preço criança (R$)"
                value={priceChild}
                onChange={setPriceChild}
              />
            </div>

            <div className="rounded-2xl bg-accent/5 p-5 text-sm">
              <p className="font-semibold">Resumo</p>
              <p className="mt-1 text-muted-foreground">
                {destination || "—"}, {state || "—"} · {departureDate || "—"} a{" "}
                {returnDate || "—"}
              </p>
              <p className="mt-1 text-muted-foreground">
                {VEHICLE_LAYOUTS.find((v) => v.id === vehicleId)?.name} ·{" "}
                {withHotel ? hotelName || "Hotel a definir" : "Sem hotel"}
              </p>
              <p className="mt-2 font-display text-xl font-semibold">
                R$ {priceAdult.toLocaleString("pt-BR")}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / adulto
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-surface-elevated disabled:opacity-40"
        >
          Voltar
        </button>
        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            disabled={!canNext}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95 disabled:opacity-40"
          >
            Continuar <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-95"
          >
            Publicar viagem <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}

function Input({
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
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}

function ToggleOption({
  selected,
  onSelect,
  title,
  desc,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  desc: string;
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
          "h-5 w-5 flex-none rounded-full border-2 transition-colors " +
          (selected ? "border-accent bg-accent" : "border-border")
        }
      />
      <div>
        <p className="font-display text-base font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      </div>
    </button>
  );
}
