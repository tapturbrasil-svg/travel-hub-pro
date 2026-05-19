import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Gift,
  Plus,
  Search,
  Users,
  Ticket,
  Calendar,
  Edit,
  Trash2,
  X,
  Eye,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBRL } from "@/data/trips";

export const Route = createFileRoute("/dashboard/rifas")({
  component: RifasPage,
  head: () => ({ meta: [{ title: "Rifas | TapTur" }] }),
});

type RifaStatus = "ativa" | "encerrada" | "raspelada";

type Rifa = {
  id: string;
  title: string;
  description: string;
  image?: string;
  tripId?: string;
  destination: string;
  prize: string;
  prizeValue: number;
  ticketPrice: number;
  totalTickets: number;
  soldTickets: number;
  drawDate: string;
  status: RifaStatus;
  createdAt: string;
  participants: number;
  revenue: number;
  primaryColor?: string;
  secondaryColor?: string;
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-success/10 text-success" },
  encerrada: { label: "Encerrada", className: "bg-muted text-muted-foreground" },
  raspelhada: { label: "Sorteada", className: "bg-accent/10 text-accent" },
};

const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.ativa;

function RifasPage() {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadRifas();
  }, []);

  const loadRifas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rifas")
      .select("*, rifa_participants(count)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar rifas:", error);
      setLoading(false);
      return;
    }

    const rifasData = (data || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      image: r.image,
      tripId: r.trip_id,
      destination: r.destination,
      prize: r.prize,
      prizeValue: r.prize_value,
      ticketPrice: r.ticket_price,
      totalTickets: r.total_tickets,
      soldTickets: r.sold_tickets || 0,
      drawDate: r.draw_date,
      status: r.status,
      createdAt: r.created_at,
      participants: r.rifa_participants?.[0]?.count || 0,
      revenue: (r.sold_tickets || 0) * r.ticket_price,
      primaryColor: r.primary_color,
      secondaryColor: r.secondary_color,
    }));

    setRifas(rifasData);
    setLoading(false);
  };

  const handleCreateRifa = async (newRifa: Omit<Rifa, "id" | "createdAt" | "participants" | "revenue" | "soldTickets">) => {
    const { data, error } = await supabase.from("rifas").insert([{
      title: newRifa.title,
      description: newRifa.description,
      image: newRifa.image,
      destination: newRifa.destination,
      prize: newRifa.prize,
      prize_value: newRifa.prizeValue,
      ticket_price: newRifa.ticketPrice,
      total_tickets: newRifa.totalTickets,
      draw_date: newRifa.drawDate,
      status: newRifa.status,
      primary_color: newRifa.primaryColor,
      secondary_color: newRifa.secondaryColor,
    }]).select().single();

    if (error) {
      console.error("Erro ao criar rifa:", error);
      return;
    }

    await loadRifas();
    setIsCreateOpen(false);
  };

  const filtered = rifas.filter((r) => {
    const matchSearch =
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todas" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: rifas.length,
    ativas: rifas.filter((r) => r.status === "ativa").length,
    totalVendido: rifas.reduce((acc, r) => acc + r.soldTickets, 0),
    receita: rifas.reduce((acc, r) => acc + r.revenue, 0),
  };

  const handleCopyLink = (rifaId: string) => {
    const link = `https://taptur.com.br/rifa/${rifaId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Rifas</h1>
          <p className="mt-2 text-muted-foreground">
            Crie rifas para captar leads, aumentar a base e divulgar viagens.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Nova Rifa
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Gift className="h-5 w-5" />}
          label="Total de rifas"
          value={stats.total}
        />
        <StatCard
          icon={<Check className="h-5 w-5" />}
          label="Ativas"
          value={stats.ativas}
          color="text-success"
        />
        <StatCard
          icon={<Ticket className="h-5 w-5" />}
          label="Tickets vendidos"
          value={stats.totalVendido}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Receita total"
          value={formatBRL(stats.receita)}
          highlight
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar rifa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todas">Todos os status</option>
          <option value="ativa">Ativa</option>
          <option value="encerrada">Encerrada</option>
          <option value="raspelada">Sorteada</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
            <Gift className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Carregando rifas...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
            <Gift className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhuma rifa encontrada</p>
          </div>
        ) : (
          filtered.map((rifa) => (
            <RifaCard
              key={rifa.id}
              rifa={rifa}
              onView={() => {
                setSelectedRifa(rifa);
                setIsDetailOpen(true);
              }}
              onEdit={() => {
                setSelectedRifa(rifa);
                setIsCreateOpen(true);
              }}
              onDelete={() => setRifas((prev) => prev.filter((r) => r.id !== rifa.id))}
              onCopyLink={() => handleCopyLink(rifa.id)}
            />
          ))
        )}
      </div>

      <CreateRifaDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={handleCreateRifa}
        editRifa={selectedRifa}
        onClearEdit={() => setSelectedRifa(null)}
      />

      <RifaDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        rifa={selectedRifa}
        onCopyLink={() => selectedRifa && handleCopyLink(selectedRifa.id)}
        copied={copied}
        onViewAllParticipants={() => window.alert("Exportar lista em Excel")}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-display text-xl font-semibold ${color || ""} ${highlight ? "text-accent" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function RifaCard({
  rifa,
  onView,
  onEdit,
  onDelete,
  onCopyLink,
}: {
  rifa: Rifa;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
}) {
  const percent = Math.round((rifa.soldTickets / rifa.totalTickets) * 100);
  const status = getStatusConfig(rifa.status);

  return (
    <div className="group rounded-3xl border border-border bg-background p-5 transition-shadow hover:shadow-card">
      <div className="mb-4 flex items-start justify-between">
        <Badge className={status.className}>{status.label}</Badge>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCopyLink}>
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {rifa.image && (
        <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-surface">
          <img src={rifa.image} alt={rifa.title} className="h-full w-full object-cover" />
        </div>
      )}

      <h3 className="font-display text-lg font-semibold leading-tight">{rifa.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{rifa.description}</p>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <Ticket className="h-4 w-4 text-muted-foreground" />
        <span>{formatBRL(rifa.ticketPrice)} por número</span>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {rifa.soldTickets}/{rifa.totalTickets} vendidos
          </span>
          <span className="font-medium">{percent}%</span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {rifa.participants}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(rifa.drawDate).toLocaleDateString("pt-BR")}
          </div>
        </div>
        <span className="font-display font-semibold text-accent">{formatBRL(rifa.revenue)}</span>
      </div>

      <Button variant="outline" className="mt-4 w-full gap-2" onClick={onView}>
        <Eye className="h-4 w-4" /> Ver detalhes
      </Button>
    </div>
  );
}

function CreateRifaDialog({
  open,
  onOpenChange,
  onSave,
  editRifa,
  onClearEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (rifa: Omit<Rifa, "id" | "createdAt" | "participants" | "revenue" | "soldTickets">) => void;
  editRifa: Rifa | null;
  onClearEdit: () => void;
}) {
  const [form, setForm] = useState({
    title: editRifa?.title || "",
    description: editRifa?.description || "",
    image: editRifa?.image || "",
    destination: editRifa?.destination || "",
    prize: editRifa?.prize || "",
    prizeValue: editRifa?.prizeValue || 0,
    ticketPrice: editRifa?.ticketPrice || 10,
    totalTickets: editRifa?.totalTickets || 100,
    drawDate: editRifa?.drawDate || "",
    status: editRifa?.status || "ativa" as RifaStatus,
    primaryColor: editRifa?.primaryColor || "#0EA5E9",
    secondaryColor: editRifa?.secondaryColor || "#FFFFFF",
  });

  useState(() => {
    if (editRifa) {
      setForm({
        title: editRifa.title,
        description: editRifa.description,
        image: editRifa.image || "",
        destination: editRifa.destination,
        prize: editRifa.prize,
        prizeValue: editRifa.prizeValue,
        ticketPrice: editRifa.ticketPrice,
        totalTickets: editRifa.totalTickets,
        drawDate: editRifa.drawDate,
        status: editRifa.status,
      });
    }
  });

  const handleSave = () => {
    onSave({
      ...form,
      soldTickets: editRifa?.soldTickets || 0,
      participants: editRifa?.participants || 0,
      revenue: editRifa?.revenue || 0,
    });
    onOpenChange(false);
    onClearEdit();
    setForm({
      title: "",
      description: "",
      destination: "",
      prize: "",
      prizeValue: 0,
      ticketPrice: 10,
      totalTickets: 100,
      drawDate: "",
      status: "ativa",
      primaryColor: "#0EA5E9",
      secondaryColor: "#FFFFFF",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editRifa ? "Editar Rifa" : "Nova Rifa"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Título da rifa</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Sorteio Viagem para Porto Seguro"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descreva a rifa..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Imagem de capa</Label>
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-surface flex items-center justify-center">
                {form.image ? (
                  <img src={form.image} alt="Capa" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Sem imagem</span>
                )}
              </div>
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG ou GIF. Máx 5MB</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor principal</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.primaryColor || "#0EA5E9"}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <Input
                  value={form.primaryColor || "#0EA5E9"}
                  onChange={(e) => setForm((f) => ({ ...f, primaryColor: e.target.value }))}
                  placeholder="#0EA5E9"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cor secundária</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={form.secondaryColor || "#FFFFFF"}
                  onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <Input
                  value={form.secondaryColor || "#FFFFFF"}
                  onChange={(e) => setForm((f) => ({ ...f, secondaryColor: e.target.value }))}
                  placeholder="#FFFFFF"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Destino</Label>
              <Input
                value={form.destination}
                onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                placeholder="Ex: Porto Seguro"
              />
            </div>
            <div className="space-y-2">
              <Label>Prêmio</Label>
              <Input
                value={form.prize}
                onChange={(e) => setForm((f) => ({ ...f, prize: e.target.value }))}
                placeholder="Ex: Pacote completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor do ticket (R$)</Label>
              <Input
                type="number"
                value={form.ticketPrice}
                onChange={(e) => setForm((f) => ({ ...f, ticketPrice: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Total de tickets</Label>
              <Input
                type="number"
                value={form.totalTickets}
                onChange={(e) => setForm((f) => ({ ...f, totalTickets: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data do sorteio</Label>
              <Input
                type="date"
                value={form.drawDate}
                onChange={(e) => setForm((f) => ({ ...f, drawDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as RifaStatus }))}
            >
              <option value="ativa">Ativa</option>
              <option value="encerrada">Encerrada</option>
              <option value="raspelada">Sorteada</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!form.title || !form.destination}>
            {editRifa ? "Salvar alterações" : "Criar Rifa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RifaDetailDialog({
  open,
  onOpenChange,
  rifa,
  onCopyLink,
  copied,
  onViewAllParticipants,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rifa: Rifa | null;
  onCopyLink: () => void;
  copied: boolean;
  onViewAllParticipants?: () => void;
}) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (open && rifa?.id) {
      loadParticipants();
    }
  }, [open, rifa?.id]);

  const loadParticipants = async () => {
    if (!rifa?.id) return;
    setLoadingParticipants(true);
    const { data, error } = await supabase
      .from("rifa_participants")
      .select("*")
      .eq("rifa_id", rifa.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar participantes:", error);
    } else {
      const formatted = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        email: p.email || "",
        tickets: p.tickets || [],
        date: p.created_at,
        valor: (p.tickets?.length || 0) * rifa.ticketPrice,
      }));
      setParticipants(formatted);
    }
    setLoadingParticipants(false);
  };

  if (!rifa) return null;

  const percent = Math.round((rifa.soldTickets / rifa.totalTickets) * 100);
  const status = getStatusConfig(rifa.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl">{rifa.title}</DialogTitle>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{rifa.description}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-accent">{formatBRL(rifa.ticketPrice)}</p>
              <p className="text-sm text-muted-foreground">por ticket</p>
            </div>
            <div className="rounded-2xl bg-surface p-4 text-center">
              <p className="text-2xl font-bold">{rifa.soldTickets}/{rifa.totalTickets}</p>
              <p className="text-sm text-muted-foreground">vendidos</p>
            </div>
            <div className="rounded-2xl bg-surface p-4 text-center">
              <p className="text-2xl font-bold text-success">{formatBRL(rifa.revenue)}</p>
              <p className="text-sm text-muted-foreground">arrecadado</p>
            </div>
            <div className="rounded-2xl bg-surface p-4 text-center">
              <p className="text-2xl font-bold">{rifa.participants}</p>
              <p className="text-sm text-muted-foreground">participantes</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso da venda</span>
              <span className="font-medium">{percent}%</span>
            </div>
            <Progress value={percent} className="h-3" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border p-4">
              <h4 className="mb-2 font-medium">Prêmio</h4>
              <p className="text-sm text-muted-foreground">{rifa.prize}</p>
              <p className="mt-1 text-sm font-medium">Valor: {formatBRL(rifa.prizeValue)}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <h4 className="mb-2 font-medium">Sorteio</h4>
              <p className="text-sm text-muted-foreground">Data: {new Date(rifa.drawDate).toLocaleDateString("pt-BR")}</p>
              <p className="mt-1 text-sm text-muted-foreground">Destino: {rifa.destination}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <h4 className="mb-3 font-medium">Participantes ({participants.length})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 text-left">Nome</th>
                    <th className="pb-2 text-left">Telefone</th>
                    <th className="pb-2 text-left">Email</th>
                    <th className="pb-2 text-right">Tickets</th>
                    <th className="pb-2 text-right">Valor</th>
                    <th className="pb-2 text-right">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2">{p.name}</td>
                      <td className="py-2 text-muted-foreground">{p.phone}</td>
                      <td className="py-2 text-muted-foreground">{p.email}</td>
                      <td className="py-2 text-right font-mono">{p.tickets.join(", ")}</td>
                      <td className="py-2 text-right text-success">{formatBRL(p.valor)}</td>
                      <td className="py-2 text-right text-muted-foreground">{new Date(p.date).toLocaleDateString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={`https://taptur.com.br/rifa/${rifa.id}`}
              className="font-mono text-sm"
            />
            <Button variant="outline" onClick={onCopyLink} className="gap-2">
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={onViewAllParticipants}>
            Exportar lista (Excel)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
