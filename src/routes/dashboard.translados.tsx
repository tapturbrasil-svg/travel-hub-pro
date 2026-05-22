import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Truck,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  Edit,
  Trash2,
  Eye,
  X,
  Phone,
  Calendar,
  Bus,
  CheckCircle2,
  Bed,
  ArrowUpDown,
  GripVertical,
  Save,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/translados")({
  component: TransladosPage,
  head: () => ({ meta: [{ title: "Translados | TapTur" }] }),
});

type PointType = "embarque" | "descida" | "ponto_encontro";

type Seat = {
  id: string;
  number: number;
  row: number;
  column: number;
  name: string;
  type: "normal" | "janela" | "corredor" | "blocado";
};

type VehicleLayout = {
  id: string;
  name: string;
  rows: number;
  columns: number;
  layout: "2+1" | "2+2" | "3+1" | "custom";
  seats: Seat[];
};

type TransferPoint = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: PointType;
  time: string;
  order: number;
};

type TripAssignment = {
  tripId: string;
  tripDestination: string;
  departureDate: string;
  returnDate: string;
  soldSeats: number;
  totalSeats: number;
};

type Transfer = {
  id: string;
  name: string;
  description: string;
  vehicleType: "onibus_leito" | "onibus_executivo" | "van_premium" | "aviao" | "outro";
  plate?: string;
  driver?: string;
  driverPhone?: string;
  capacity: number;
  hasLayout: boolean;
  layout?: VehicleLayout;
  pickupPoints: TransferPoint[];
  status: "ativo" | "inativo";
  createdAt: string;
  tripHistory: TripAssignment[];
};

const POINT_TYPE_CONFIG: Record<PointType, { label: string; className: string }> = {
  embarque: { label: "Embarque", className: "bg-success/10 text-success" },
  descida: { label: "Descida", className: "bg-destructive/10 text-destructive" },
  ponto_encontro: { label: "Ponto de Encontro", className: "bg-accent/10 text-accent" },
};

const VEHICLE_TYPES = [
  { value: "onibus_leito", label: "Ônibus Leito", icon: Bus },
  { value: "onibus_executivo", label: "Ônibus Executivo", icon: Bus },
  { value: "van_premium", label: "Van Premium", icon: Truck },
  { value: "aviao", label: "Avião", icon: Bus },
  { value: "outro", label: "Outro", icon: Truck },
];

function generateDefaultLayout(rows: number, columns: number, layout: VehicleLayout["layout"]): Seat[] {
  const seats: Seat[] = [];
  let seatNumber = 1;

  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= columns; c++) {
      let type: Seat["type"] = "normal";

      if (layout === "2+1") {
        type = c >= 2 ? "corredor" : "janela";
      } else if (layout === "2+2") {
        type = c === 2 || c === 3 ? "corredor" : "janela";
      } else if (layout === "3+1") {
        type = c === 1 || c === 4 ? "janela" : "normal";
      }

      seats.push({
        id: `seat-${seatNumber}`,
        number: seatNumber,
        row: r,
        column: c,
        name: `${String.fromCharCode(64 + r)}${seatNumber}`,
        type,
      });
      seatNumber++;
    }
  }
  return seats;
}

function getDefaultCapacity(vehicleType: Transfer["vehicleType"]): number {
  const configs: Record<string, number> = {
    onibus_leito: 46,
    onibus_executivo: 42,
    van_premium: 16,
    aviao: 180,
    outro: 20,
  };
  return configs[vehicleType] || 20;
}

const MOCK_TRANSFERS: Transfer[] = [
  {
    id: "tr1",
    name: "Ônibus Leito 46 Lugares",
    description: "Ônibus leito com poltronas reclináveis e ar condicionado.",
    vehicleType: "onibus_leito",
    plate: "ABC-1234",
    driver: "José Silva",
    driverPhone: "(11) 98765-4321",
    capacity: 46,
    hasLayout: true,
    layout: {
      id: "layout-1",
      name: "Ônibus Leito 46",
      rows: 12,
      columns: 4,
      layout: "2+2",
      seats: generateDefaultLayout(12, 4, "2+2"),
    },
    pickupPoints: [],
    status: "ativo",
    createdAt: "2025-06-15",
    tripHistory: [
      { tripId: "t1", tripDestination: "Rio de Janeiro", departureDate: "2026-05-15", returnDate: "2026-05-19", soldSeats: 32, totalSeats: 46 },
    ],
  },
  {
    id: "tr2",
    name: "Van Premium 16 Lugares",
    description: "Van premium para grupos menores com muito conforto.",
    vehicleType: "van_premium",
    plate: "XYZ-5678",
    driver: "Carlos Santos",
    driverPhone: "(11) 99876-5432",
    capacity: 16,
    hasLayout: false,
    pickupPoints: [],
    status: "ativo",
    createdAt: "2025-09-10",
    tripHistory: [],
  },
  {
    id: "tr3",
    name: "Ônibus Executivo 42",
    description: "Ônibus executivo com banheiro.",
    vehicleType: "onibus_executivo",
    capacity: 42,
    hasLayout: true,
    layout: {
      id: "layout-2",
      name: "Exec 42",
      rows: 11,
      columns: 4,
      layout: "2+2",
      seats: generateDefaultLayout(11, 4, "2+2"),
    },
    pickupPoints: [],
    status: "ativo",
    createdAt: "2025-11-20",
    tripHistory: [],
  },
];

function TransladosPage() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTransfer, setEditTransfer] = useState<Transfer | null>(null);

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("translados")
      .select("*, trips(destination)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading transfers:", error);
    } else if (data) {
      setTransfers(data as Transfer[]);
    }
    setLoading(false);
  };

  const filtered = transfers.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || (statusFilter === "ativo" && t.status === "ativo") || (statusFilter === "inativo" && t.status === "inativo");
    return matchSearch && matchStatus;
  });

  const stats = {
    total: transfers.length,
    ativos: transfers.filter((t) => t.status === "ativo").length,
    comLayout: transfers.filter((t) => t.hasLayout).length,
    totalVagas: transfers.reduce((acc, t) => acc + t.capacity, 0),
  };

  const handleSave = async (transfer: Omit<Transfer, "id" | "createdAt" | "tripHistory">) => {
    if (editTransfer) {
      const { error } = await supabase
        .from("translados")
        .update(transfer)
        .eq("id", editTransfer.id);

      if (!error) {
        setTransfers((prev) => prev.map((t) => (t.id === editTransfer.id ? { ...t, ...transfer } : t)));
      }
    } else {
      const { data, error } = await supabase
        .from("translados")
        .insert({ ...transfer, tripHistory: [] })
        .select()
        .single();

      if (!error && data) {
        setTransfers((prev) => [...prev, data as Transfer]);
      }
    }
    setIsCreateOpen(false);
    setEditTransfer(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("translados").delete().eq("id", id);
    if (!error) {
      setTransfers((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleToggleStatus = async (id: string) => {
    const transfer = transfers.find((t) => t.id === id);
    if (!transfer) return;
    const newStatus = transfer.status === "ativo" ? "inativo" : "ativo";

    const { error } = await supabase
      .from("translados")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
    }
  };

  const handleCreateLayout = (transferId: string) => {
    console.log("Navigate to layout:", transferId);
    window.location.href = `/dashboard/translados/layout/${transferId}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Translados</h1>
          <p className="mt-2 text-muted-foreground">
            Cadastre translados e crie seus próprios layouts de assentos.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Translado
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Truck className="h-5 w-5" />} label="Total de translados" value={stats.total} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Ativos" value={stats.ativos} color="text-success" />
        <StatCard icon={<Bed className="h-5 w-5" />} label="Com layout" value={stats.comLayout} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total vagas" value={stats.totalVagas} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar translado..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <Truck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum translado encontrado</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((transfer) => {
            const VehicleIcon = VEHICLE_TYPES.find((v) => v.value === transfer.vehicleType)?.icon || Bus;
            return (
              <div
                key={transfer.id}
                className={`group rounded-3xl border border-border bg-background p-5 transition-shadow hover:shadow-card ${transfer.status === "inativo" ? "opacity-60" : ""}`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                      <VehicleIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{transfer.name}</h3>
                      <Badge className="mt-1 text-[10px] bg-secondary text-secondary-foreground">
                        {VEHICLE_TYPES.find((v) => v.value === transfer.vehicleType)?.label}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={transfer.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                    {transfer.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Capacidade</span>
                    <span className="font-medium">{transfer.capacity} lugares</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Layout</span>
                    <span className={transfer.hasLayout ? "text-success" : "text-warning"}>
                      {transfer.hasLayout ? "✓ Configurado" : "✗ Não criado"}
                    </span>
                  </div>
                  {transfer.pickupPoints.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Pontos</span>
                      <span className="font-medium">{transfer.pickupPoints.length}</span>
                    </div>
                  )}
                </div>

                {transfer.hasLayout && transfer.layout && (
                  <div className="mb-4 rounded-xl bg-surface p-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Preview</p>
                    <div className="flex flex-wrap gap-1">
                      {transfer.layout.seats.slice(0, 16).map((seat) => (
                        <div
                          key={seat.id}
                          className={`h-6 w-6 rounded text-[10px] font-medium ${
                            seat.type === "janela" ? "bg-accent/20 text-accent" : seat.type === "corredor" ? "bg-muted" : "bg-secondary"
                          }`}
                        >
                          {seat.number}
                        </div>
                      ))}
                      {transfer.layout.seats.length > 16 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-secondary text-[10px]">
                          +{transfer.layout.seats.length - 16}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!transfer.hasLayout && (
                  <Link to="/dashboard/translados/layout/$transferId/viewer" params={{ transferId: transfer.id }}>
                    <Button variant="outline" className="mb-4 w-full gap-2">
                      <PlusCircle className="h-4 w-4" /> Criar Layout
                    </Button>
                  </Link>
                )}

                {transfer.tripHistory.length > 0 && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {transfer.tripHistory.length} viagem(ns) realizada(s)
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedTransfer(transfer); }}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTransfer(transfer); setIsCreateOpen(true); }}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(transfer.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(transfer.id)}>
                    {transfer.status === "ativo" ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TransferDialog
        open={isCreateOpen}
        onOpenChange={(open) => { if (!open) { setIsCreateOpen(false); setEditTransfer(null); } }}
        onSave={handleSave}
        transfer={editTransfer}
      />

      <TransferDetailModal
        open={!!selectedTransfer}
        onOpenChange={(open) => !open && setSelectedTransfer(null)}
        transfer={selectedTransfer}
        onCreateLayout={() => selectedTransfer && handleCreateLayout(selectedTransfer.id)}
      />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-display text-xl font-semibold ${color || ""}`}>{value}</p>
      </div>
    </div>
  );
}

function TransferDialog({
  open,
  onOpenChange,
  onSave,
  transfer,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (transfer: Omit<Transfer, "id" | "createdAt" | "tripHistory">) => void;
  transfer: Transfer | null;
}) {
  const [form, setForm] = useState<Omit<Transfer, "id" | "createdAt" | "tripHistory">>({
    name: "",
    description: "",
    vehicleType: "onibus_leito",
    plate: "",
    driver: "",
    driverPhone: "",
    capacity: 46,
    hasLayout: false,
    layout: undefined,
    pickupPoints: [],
    status: "ativo",
  });

  useState(() => {
    if (transfer) {
      setForm({
        name: transfer.name,
        description: transfer.description,
        vehicleType: transfer.vehicleType,
        plate: transfer.plate || "",
        driver: transfer.driver || "",
        driverPhone: transfer.driverPhone || "",
        capacity: transfer.capacity,
        hasLayout: transfer.hasLayout,
        layout: transfer.layout,
        pickupPoints: [...transfer.pickupPoints],
        status: transfer.status,
      });
    }
  });

  const handleVehicleTypeChange = (newType: Transfer["vehicleType"]) => {
    const newCapacity = getDefaultCapacity(newType);
    setForm((f) => ({ ...f, vehicleType: newType, capacity: newCapacity }));
  };

  const handleSave = () => {
    onSave(form);
    setForm({
      name: "",
      description: "",
      vehicleType: "onibus_leito",
      plate: "",
      driver: "",
      driverPhone: "",
      capacity: 46,
      hasLayout: false,
      layout: undefined,
      pickupPoints: [],
      status: "ativo",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{transfer ? "Editar Translado" : "Novo Translado"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do translado</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Ônibus Leito 46 Lugares"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descreva o translado..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de veículo</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3"
                value={form.vehicleType}
                onChange={(e) => handleVehicleTypeChange(e.target.value as Transfer["vehicleType"])}
              >
                {VEHICLE_TYPES.map((v) => (
                  <option key={v.value} value={v.value}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Capacidade</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
                min={1}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Placa (opcional)</Label>
            <Input
              value={form.plate}
              onChange={(e) => setForm((f) => ({ ...f, plate: e.target.value }))}
              placeholder="ABC-1234"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Motorista (opcional)</Label>
              <Input
                value={form.driver}
                onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}
                placeholder="Nome do motorista"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone (opcional)</Label>
              <Input
                value={form.driverPhone}
                onChange={(e) => setForm((f) => ({ ...f, driverPhone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          {transfer && (
            <div className="rounded-2xl border border-dashed border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Layout do veículo</p>
                  <p className="text-xs text-muted-foreground">Após criar, você pode editar e personalizar o layout</p>
                </div>
                {form.hasLayout ? (
                  <Badge className="bg-success/10 text-success">✓ Configurado</Badge>
                ) : (
                  <Badge className="bg-warning/10 text-warning">Não criado</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name}>Salvar Translado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TransferDetailModal({
  open,
  onOpenChange,
  transfer,
  onCreateLayout,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer: Transfer | null;
  onCreateLayout?: () => void;
}) {
  if (!transfer) return null;

  const VehicleIcon = VEHICLE_TYPES.find((v) => v.value === transfer.vehicleType)?.icon || Bus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                <VehicleIcon className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="font-display text-xl">{transfer.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{transfer.capacity} lugares</p>
              </div>
            </div>
            <Badge className={transfer.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
              {transfer.status === "ativo" ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {transfer.description && <p className="text-sm text-muted-foreground">{transfer.description}</p>}

          {(transfer.plate || transfer.driver || transfer.driverPhone) && (
            <div className="grid gap-4 sm:grid-cols-3">
              {transfer.plate && (
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-xs text-muted-foreground">Placa</p>
                  <p className="font-medium">{transfer.plate}</p>
                </div>
              )}
              {transfer.driver && (
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-xs text-muted-foreground">Motorista</p>
                  <p className="font-medium">{transfer.driver}</p>
                </div>
              )}
              {transfer.driverPhone && (
                <div className="rounded-xl bg-surface p-3">
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="flex items-center gap-1 font-medium">
                    <Phone className="h-3 w-3" /> {transfer.driverPhone}
                  </p>
                </div>
              )}
            </div>
          )}

          {!transfer.hasLayout ? (
            <div className="rounded-2xl border-2 border-dashed border-accent/30 bg-accent/5 p-6 text-center">
              <Bed className="mx-auto mb-2 h-8 w-8 text-accent" />
              <p className="font-medium text-accent">Layout não criado</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Clique no botão abaixo para criar o layout deste translado
              </p>
              <Button onClick={onCreateLayout} className="mt-4 gap-2">
                <PlusCircle className="h-4 w-4" /> Criar Layout Padrão
              </Button>
            </div>
          ) : transfer.layout && (
            <div className="rounded-2xl border border-border bg-surface-elevated p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Layout completo</p>
                <p className="text-xs text-muted-foreground">{transfer.layout.seats.length} assentos</p>
              </div>
              <div className="mb-4 flex flex-wrap gap-1">
                {transfer.layout.seats.map((seat) => {
                  const bgColor = seat.type === "janela" ? "bg-accent/20" : seat.type === "corredor" ? "bg-muted" : "bg-secondary";
                  return (
                    <div key={seat.id} className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium ${bgColor}`} title={`${seat.name} - ${seat.type}`}>
                      {seat.name}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><div className="h-4 w-4 rounded bg-secondary" /> Normal</div>
                <div className="flex items-center gap-1"><div className="h-4 w-4 rounded bg-accent/20" /> Janela</div>
                <div className="flex items-center gap-1"><div className="h-4 w-4 rounded bg-muted" /> Corredor</div>
              </div>
            </div>
          )}

          <div>
            <h4 className="mb-3 font-medium">Histórico de viagens</h4>
            {transfer.tripHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Nenhuma viagem atribuída ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transfer.tripHistory.map((trip, i) => (
                  <div key={i} className="flex items-center justify-between rounded-2xl border border-border p-4">
                    <div>
                      <p className="font-medium">{trip.tripDestination}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(trip.departureDate).toLocaleDateString("pt-BR")} — {new Date(trip.returnDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-success">{trip.soldSeats}/{trip.totalSeats}</p>
                      <p className="text-xs text-muted-foreground">ocupados</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
