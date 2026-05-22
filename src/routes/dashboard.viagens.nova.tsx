import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Bus,
  Bed,
  Coins,
  Image,
  Video,
  Calendar,
  Plus,
  X,
  Trash2,
  GripVertical,
  Save,
  Eye,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/viagens/nova")({
  component: NewTrip,
  head: () => ({ meta: [{ title: "Nova viagem | TapTur" }] }),
});

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = [
  { n: 1, label: "Dados básicos", icon: MapPin },
  { n: 2, label: "Transporte", icon: Bus },
  { n: 3, label: "Hospedagem", icon: Bed },
  { n: 4, label: "Galeria", icon: Image },
  { n: 5, label: "Itinerário", icon: Calendar },
  { n: 6, label: "Preços", icon: Coins },
] as const;

const MOCK_TRANSFERS = [
  { id: "tr1", name: "Ônibus Leito 46 lugares", vehicle: "onibus_leito", capacity: 46, pickupPoints: 3 },
  { id: "tr2", name: "Ônibus Executivo 42 lugares", vehicle: "onibus_executivo", capacity: 42, pickupPoints: 2 },
  { id: "tr3", name: "Van Premium 16 lugares", vehicle: "van_premium", capacity: 16, pickupPoints: 1 },
];

const MOCK_HOSPEDAGENS = [
  { id: "h1", name: "Hotel Atlântico Copacabana", stars: 4, rooms: 5 },
  { id: "h2", name: "Pousada Mar Azul", stars: 4, rooms: 3 },
  { id: "h3", name: "Resort Coroa Vermelha", stars: 5, rooms: 3 },
  { id: "h4", name: "Hotel Bavária Boutique", stars: 4, rooms: 2 },
];

const DAY_PLAN_SUGGESTIONS = [
  "Check-in no hotel",
  "Café da manhã",
  "City tour pelo centro histórico",
  "Almoço no restaurante local",
  "Tempo livre na praia",
  "Jantar de boas-vindas",
  "Apresentação cultural",
];

type DayPlan = {
  day: number;
  title: string;
  activities: string[];
};

function NewTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [isDraft, setIsDraft] = useState(false);

  // Step 1: Basic data
  const [destination, setDestination] = useState("");
  const [state, setState] = useState("");
  const [departureCity, setDepartureCity] = useState("São Paulo");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [nights, setNights] = useState(4);
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState("");

  // Step 2: Transport
  const [hasTransport, setHasTransport] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState<string>("");
  const [vehicleLayout, setVehicleLayout] = useState<"2+2" | "2+1">("2+2");

  // Step 3: Accommodation
  const [hasAccommodation, setHasAccommodation] = useState(true);
  const [selectedHospedagem, setSelectedHospedagem] = useState<string>("");

  // Step 4: Gallery
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [videoInput, setVideoInput] = useState("");

  // Step 5: Itinerary
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);

  // Step 6: Pricing
  const [priceAdult, setPriceAdult] = useState(1290);
  const [priceChild, setPriceChild] = useState(690);
  const [installments, setInstallments] = useState(12);
  const [includes, setIncludes] = useState<string[]>([]);
  const [notIncludes, setNotIncludes] = useState<string[]>([]);
  const [includeInput, setIncludeInput] = useState("");
  const [notIncludeInput, setNotIncludeInput] = useState("");

  const next = () => setStep((s) => Math.min(6, s + 1) as Step);
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  const addHighlight = () => {
    if (highlightInput.trim()) {
      setHighlights((prev) => [...prev, highlightInput.trim()]);
      setHighlightInput("");
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setImages((prev) => [...prev, imageInput.trim()]);
      setImageInput("");
    }
  };

  const addVideo = () => {
    if (videoInput.trim()) {
      setVideos((prev) => [...prev, videoInput.trim()]);
      setVideoInput("");
    }
  };

  const addInclude = () => {
    if (includeInput.trim()) {
      setIncludes((prev) => [...prev, includeInput.trim()]);
      setIncludeInput("");
    }
  };

  const addNotInclude = () => {
    if (notIncludeInput.trim()) {
      setNotIncludes((prev) => [...prev, notIncludeInput.trim()]);
      setNotIncludeInput("");
    }
  };

  const addDayPlan = () => {
    setDayPlans((prev) => [...prev, { day: prev.length + 1, title: "", activities: [] }]);
  };

  const updateDayPlan = (index: number, field: keyof DayPlan, value: any) => {
    setDayPlans((prev) => prev.map((dp, i) => (i === index ? { ...dp, [field]: value } : dp)));
  };

  const handleSave = (asDraft: boolean) => {
    setIsDraft(asDraft);
    // In real app, save to backend
    setTimeout(() => navigate({ to: "/dashboard/viagens" }), 500);
  };

  const canNext =
    (step === 1 && destination && state && departureDate && returnDate) ||
    (step === 2 && (!hasTransport || selectedTransfer)) ||
    (step === 3 && (!hasAccommodation || selectedHospedagem)) ||
    step === 4 ||
    step === 5 ||
    step === 6;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        to="/dashboard/viagens"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
        {step === 1 ? "Nova viagem" : `Viagem: ${destination || "..."}`}
      </h1>
      <p className="mt-1 text-muted-foreground">
        Configure todos os detalhes da viagem em {STEPS.length} passos.
      </p>

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {STEPS.map(({ n, label, icon: Icon }) => {
          const active = n === step;
          const done = n < step;
          return (
            <li key={n} className="flex flex-none items-center gap-2">
              <div
                className={
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors " +
                  (done ? "bg-foreground text-background" : active ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground")
                }
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={"text-sm font-medium hidden sm:inline " + (active || done ? "text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
              {n < 6 && <div className="mx-2 h-px w-6 bg-border" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {/* Body */}
      <div className="mt-8 rounded-3xl border border-border bg-background p-6 shadow-soft">
        {/* Step 1: Basic Data */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Dados básicos</h2>
              <p className="mt-1 text-sm text-muted-foreground">Informações gerais da viagem</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Destino</Label>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex: Rio de Janeiro" />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="RJ" maxLength={2} />
              </div>
              <div className="space-y-2">
                <Label>Cidade de saída</Label>
                <Input value={departureCity} onChange={(e) => setDepartureCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data de ida</Label>
                <Input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data de volta</Label>
                <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Noites</Label>
                <Input type="number" value={nights} onChange={(e) => setNights(Number(e.target.value))} min={1} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Descreva a viagem..." />
            </div>

            <div className="space-y-2">
              <Label>Destaques</Label>
              <div className="flex gap-2">
                <Input
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  placeholder="Ex: Cristo Redentor"
                  onKeyDown={(e) => e.key === "Enter" && addHighlight()}
                />
                <Button onClick={addHighlight}>Adicionar</Button>
              </div>
              {highlights.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {highlights.map((h, i) => (
                    <Badge key={i} className="gap-1 cursor-pointer" onClick={() => setHighlights((prev) => prev.filter((_, idx) => idx !== i))}>
                      {h} <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Transport */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Transporte</h2>
              <p className="mt-1 text-sm text-muted-foreground">Configure o translado da viagem</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setHasTransport(true)}
                className={"flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all " + (hasTransport ? "border-accent bg-accent/5 ring-2 ring-accent/30" : "border-border bg-surface hover:border-border-strong")}
              >
                <div className={"h-5 w-5 rounded-full border-2 " + (hasTransport ? "border-accent bg-accent" : "border-border")} />
                <div>
                  <p className="font-display font-semibold">Com transporte</p>
                  <p className="text-sm text-muted-foreground">Incluir translado no pacote</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setHasTransport(false)}
                className={"flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all " + (!hasTransport ? "border-accent bg-accent/5 ring-2 ring-accent/30" : "border-border bg-surface hover:border-border-strong")}
              >
                <div className={"h-5 w-5 rounded-full border-2 " + (!hasTransport ? "border-accent bg-accent" : "border-border")} />
                <div>
                  <p className="font-display font-semibold">Apenas hospedagem</p>
                  <p className="text-sm text-muted-foreground">Cliente cuida do transporte</p>
                </div>
              </button>
            </div>

            {hasTransport && (
              <div className="space-y-4">
                <Label>Selecione o translado</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {MOCK_TRANSFERS.map((transfer) => (
                    <button
                      key={transfer.id}
                      type="button"
                      onClick={() => setSelectedTransfer(transfer.id)}
                      className={"rounded-2xl border p-4 text-left transition-all " + (selectedTransfer === transfer.id ? "border-accent bg-accent/5 ring-2 ring-accent/30" : "border-border bg-surface hover:border-border-strong")}
                    >
                      <p className="font-medium">{transfer.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{transfer.pickupPoints} pontos de embarque</p>
                    </button>
                  ))}
                </div>

                {selectedTransfer && (
                  <div className="rounded-2xl border border-border bg-surface-elevated p-4">
                    <p className="mb-3 text-sm font-medium">Layout do veículo</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setVehicleLayout("2+2")}
                        className={"flex-1 rounded-xl border p-3 text-center transition-all " + (vehicleLayout === "2+2" ? "border-accent bg-accent/5" : "border-border")}
                      >
                        <p className="font-medium">2+2</p>
                        <p className="text-xs text-muted-foreground">Fileiras duplas</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVehicleLayout("2+1")}
                        className={"flex-1 rounded-xl border p-3 text-center transition-all " + (vehicleLayout === "2+1" ? "border-accent bg-accent/5" : "border-border")}
                      >
                        <p className="font-medium">2+1</p>
                        <p className="text-xs text-muted-foreground">Poltronas extras</p>
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1">
                      {Array.from({ length: vehicleLayout === "2+2" ? 12 : 9 }).map((_, i) => (
                        <div key={i} className={"h-6 w-6 rounded-md " + (i % (vehicleLayout === "2+2" ? 4 : 3) === 0 && i > 0 ? "ml-3" : "") + " bg-secondary"} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Accommodation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Hospedagem</h2>
              <p className="mt-1 text-sm text-muted-foreground">Configure a hospedagem da viagem</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setHasAccommodation(true)}
                className={"flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all " + (hasAccommodation ? "border-accent bg-accent/5 ring-2 ring-accent/30" : "border-border bg-surface hover:border-border-strong")}
              >
                <div className={"h-5 w-5 rounded-full border-2 " + (hasAccommodation ? "border-accent bg-accent" : "border-border")} />
                <div>
                  <p className="font-display font-semibold">Com hospedagem</p>
                  <p className="text-sm text-muted-foreground">Incluir hotel no pacote</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setHasAccommodation(false)}
                className={"flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all " + (!hasAccommodation ? "border-accent bg-accent/5 ring-2 ring-accent/30" : "border-border bg-surface hover:border-border-strong")}
              >
                <div className={"h-5 w-5 rounded-full border-2 " + (!hasAccommodation ? "border-accent bg-accent" : "border-border")} />
                <div>
                  <p className="font-display font-semibold">Apenas transporte</p>
                  <p className="text-sm text-muted-foreground">Cliente cuida da estadia</p>
                </div>
              </button>
            </div>

            {hasAccommodation && (
              <div className="space-y-4">
                <Label>Selecione a hospedagem</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {MOCK_HOSPEDAGENS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedHospedagem(h.id)}
                      className={"rounded-2xl border p-4 text-left transition-all " + (selectedHospedagem === h.id ? "border-accent bg-accent/5 ring-2 ring-accent/30" : "border-border bg-surface hover:border-border-strong")}
                    >
                      <p className="font-medium">{h.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{h.stars}★</span>
                        <span className="text-sm text-muted-foreground">{h.rooms} tipos de quarto</span>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedHospedagem && (
                  <div className="rounded-2xl border border-border bg-surface-elevated p-4">
                    <p className="mb-3 text-sm font-medium">Layout dos quartos disponível no checkout</p>
                    <p className="text-sm text-muted-foreground">
                      Os tipos de quarto serão carregados automaticamente para seleção durante o checkout.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Gallery */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Galeria</h2>
              <p className="mt-1 text-sm text-muted-foreground">Imagens e vídeos da viagem</p>
            </div>

            <div className="space-y-4">
              <Label>Imagens (URLs)</Label>
              <div className="flex gap-2">
                <Input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <Button onClick={addImage}>Adicionar</Button>
              </div>
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-video rounded-xl border border-border bg-surface">
                      <img src={img} alt="" className="h-full w-full object-cover rounded-xl" onError={(e) => e.currentTarget.src = ""} />
                      <button
                        type="button"
                        onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Ou arraste e solte imagens aqui</p>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Vídeos (URLs do YouTube)</Label>
              <div className="flex gap-2">
                <Input
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <Button onClick={addVideo}>Adicionar</Button>
              </div>
              {videos.length > 0 && (
                <div className="space-y-2">
                  {videos.map((vid, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
                      <div className="flex items-center gap-3">
                        <Video className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm truncate">{vid}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Itinerary */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold">Itinerário</h2>
                <p className="mt-1 text-sm text-muted-foreground">Planeje o roteiro dia a dia</p>
              </div>
              <Button variant="outline" onClick={addDayPlan} className="gap-2">
                <Plus className="h-4 w-4" /> Adicionar dia
              </Button>
            </div>

            {dayPlans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Nenhum dia adicionado</p>
                <p className="mt-1 text-xs text-muted-foreground">Clique em "Adicionar dia" para criar o itinerário</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dayPlans.map((day, i) => (
                  <div key={i} className="rounded-2xl border border-border p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
                      <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">Dia {day.day}</span>
                      <Input
                        value={day.title}
                        onChange={(e) => updateDayPlan(i, "title", e.target.value)}
                        placeholder="Título do dia (opcional)"
                        className="flex-1"
                      />
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDayPlans((prev) => prev.filter((_, idx) => idx !== i))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="ml-7 space-y-2">
                      {day.activities.map((activity, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-success" />
                          <span>{activity}</span>
                          <button type="button" onClick={() => updateDayPlan(i, "activities", day.activities.filter((_, idx) => idx !== j))} className="ml-auto text-muted-foreground hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      <Input
                        placeholder="Adicionar atividade..."
                        className="mt-2"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value) {
                            updateDayPlan(i, "activities", [...day.activities, e.currentTarget.value]);
                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-border bg-surface-elevated p-4">
              <p className="mb-3 text-sm font-medium">Sugestões rápidas</p>
              <div className="flex flex-wrap gap-2">
                {DAY_PLAN_SUGGESTIONS.map((suggestion, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => {
                      if (dayPlans.length > 0) {
                        updateDayPlan(dayPlans.length - 1, "activities", [...dayPlans[dayPlans.length - 1].activities, suggestion]);
                      }
                    }}
                  >
                    + {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Pricing */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold">Preços</h2>
              <p className="mt-1 text-sm text-muted-foreground">Defina os valores da viagem</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Preço adulto (R$)</Label>
                <Input type="number" value={priceAdult} onChange={(e) => setPriceAdult(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Preço criança (R$)</Label>
                <Input type="number" value={priceChild} onChange={(e) => setPriceChild(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Parcelamento</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-transparent px-3" value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                  {[6, 10, 12].map((n) => <option key={n} value={n}>até {n}x</option>)}
                </select>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>O que está incluso</Label>
                <div className="flex gap-2">
                  <Input value={includeInput} onChange={(e) => setIncludeInput(e.target.value)} placeholder="Ex: Transporte ida e volta" onKeyDown={(e) => e.key === "Enter" && addInclude()} />
                  <Button onClick={addInclude}>Adicionar</Button>
                </div>
                {includes.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {includes.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-success/10 p-2 text-sm">
                        <Check className="h-4 w-4 text-success" />
                        <span className="flex-1">{item}</span>
                        <button type="button" onClick={() => setIncludes((prev) => prev.filter((_, idx) => idx !== i))}>
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>O que NÃO está incluso</Label>
                <div className="flex gap-2">
                  <Input value={notIncludeInput} onChange={(e) => setNotIncludeInput(e.target.value)} placeholder="Ex: Gastos pessoais" onKeyDown={(e) => e.key === "Enter" && addNotInclude()} />
                  <Button variant="outline" onClick={addNotInclude}>Adicionar</Button>
                </div>
                {notIncludes.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {notIncludes.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-sm">
                        <span className="flex-1">{item}</span>
                        <button type="button" onClick={() => setNotIncludes((prev) => prev.filter((_, idx) => idx !== i))}>
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap justify-between gap-3">
        <Button variant="outline" onClick={back} disabled={step === 1} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Button>

        <div className="flex gap-2">
          {step === 6 && (
            <>
              <Button variant="outline" onClick={() => handleSave(true)} className="gap-2">
                <Save className="h-4 w-4" /> Salvar rascunho
              </Button>
              <Button onClick={() => handleSave(false)} className="gap-2">
                <Eye className="h-4 w-4" /> Publicar
              </Button>
            </>
          )}
          {step < 6 && (
            <Button onClick={next} disabled={!canNext} className="gap-2">
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}