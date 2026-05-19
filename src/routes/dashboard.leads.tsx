import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Eye,
  X,
  ChevronRight,
  Calendar,
  Tag,
  User,
  Download,
  MoreHorizontal,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatBRL } from "@/data/trips";

export const Route = createFileRoute("/dashboard/leads")({
  component: LeadsPage,
  head: () => ({ meta: [{ title: "Leads | TapTur" }] }),
});

type LeadStage = "novo" | "qualificado" | "proposta" | "fechou" | "perdido";
type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  trip_interest?: string;
  notes: string;
  created_at: string;
  last_contact?: string;
  tickets?: number;
  conversion_value?: number;
};

const STAGE_CONFIG: Record<LeadStage, { label: string; className: string; count: number }> = {
  novo: { label: "Novo", className: "bg-blue-500/10 text-blue-600", count: 0 },
  qualificado: { label: "Qualificado", className: "bg-purple-500/10 text-purple-600", count: 0 },
  proposta: { label: "Proposta", className: "bg-warning/10 text-warning", count: 0 },
  fechou: { label: "Fechou!", className: "bg-success/10 text-success", count: 0 },
  perdido: { label: "Perdido", className: "bg-destructive/10 text-destructive", count: 0 },
};

const SOURCE_OPTIONS = ["Instagram", "Facebook", "Google Ads", "WhatsApp", "Indicação", "Site", "TikTok"];

function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("todas");
  const [activeTab, setActiveTab] = useState<LeadStage | "todos">("todos");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setLeads(data);
    }
    setLoading(false);
  };

  const counts = Object.fromEntries(
    Object.keys(STAGE_CONFIG).map((stage) => [stage, leads.filter((l) => l.stage === stage).length])
  );

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchSource = sourceFilter === "todas" || l.source === sourceFilter;
    const matchStage = activeTab === "todos" || l.stage === activeTab;
    return matchSearch && matchSource && matchStage;
  });

  const stats = {
    total: leads.length,
    conversionRate: Math.round((counts["fechou"] / (leads.length || 1)) * 100),
    revenue: leads.filter((l) => l.stage === "fechou").reduce((acc, l) => acc + (l.conversion_value || 0), 0),
    avgTickets: Math.round(leads.filter((l) => l.tickets).reduce((acc, l) => acc + (l.tickets || 0), 0) / (leads.filter((l) => l.tickets).length || 1)),
  };

  const handleStageChange = async (leadId: string, stage: LeadStage) => {
    const { error } = await supabase.from("leads").update({ stage }).eq("id", leadId);
    if (!error) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage } : l)));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-2 text-muted-foreground">
            Captação, qualificação e conversão de potenciais viajantes.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar
          </Button>
          <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
            <UserPlus className="h-4 w-4" /> Novo Lead
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<User className="h-5 w-5" />} label="Total de leads" value={stats.total} />
        <StatCard icon={<Star className="h-5 w-5" />} label="Taxa de conversão" value={`${stats.conversionRate}%`} color="text-success" />
        <StatCard icon={<MessageSquare className="h-5 w-5" />} label="Tickets médios" value={stats.avgTickets || "-"} />
        <StatCard icon={<Tag className="h-5 w-5" />} label="Receita gerada" value={formatBRL(stats.revenue)} highlight />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as LeadStage | "todos")}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="todos" className="gap-1.5">
            Todos <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{leads.length}</span>
          </TabsTrigger>
          {(Object.keys(STAGE_CONFIG) as LeadStage[]).map((stage) => (
            <TabsTrigger key={stage} value={stage} className="gap-1.5">
              {STAGE_CONFIG[stage].label}
              <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px]">{counts[stage]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="todas">Todas as fontes</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
              <p className="text-muted-foreground">Carregando leads...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
              <UserPlus className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum lead encontrado</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filtered.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onClick={() => setSelectedLead(lead)}
                  onStageChange={(stage) => handleStageChange(lead.id, stage)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <LeadDetailModal
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
        lead={selectedLead}
      />

      <AddLeadDialog open={isAddOpen} onOpenChange={setIsAddOpen} leads={leads} setLeads={setLeads} />
    </div>
  );
}

function StatCard({ icon, label, value, color, highlight }: { icon: React.ReactNode; label: string; value: string | number; color?: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`font-display text-xl font-semibold ${color || ""} ${highlight ? "text-accent" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function LeadRow({ lead, onClick, onStageChange }: { lead: Lead; onClick: () => void; onStageChange: (stage: LeadStage) => void }) {
  const stage = STAGE_CONFIG[lead.stage];

  return (
    <div
      className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-shadow hover:shadow-card cursor-pointer"
      onClick={onClick}
    >
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-secondary font-medium">
        {lead.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{lead.name}</p>
          {lead.tickets && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              {lead.tickets} pax
            </span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {lead.email}</span>
          <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</span>
          {lead.trip_interest && <span>{lead.trip_interest}</span>}
        </div>
      </div>

      <div className="hidden items-center gap-4 lg:flex">
        <Badge className={stage.className}>{stage.label}</Badge>
        <span className="rounded-full bg-secondary px-2 py-1 text-xs">{lead.source}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function LeadDetailModal({ open, onOpenChange, lead }: { open: boolean; onOpenChange: (open: boolean) => void; lead: Lead | null }) {
  if (!lead) return null;

  const stage = STAGE_CONFIG[lead.stage];
  const stages: LeadStage[] = ["novo", "qualificado", "proposta", "fechou", "perdido"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl">{lead.name}</DialogTitle>
            <Badge className={stage.className}>{stage.label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface p-4">
              <p className="mb-1 text-xs text-muted-foreground">E-mail</p>
              <p className="font-medium">{lead.email}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="mb-1 text-xs text-muted-foreground">Telefone</p>
              <p className="font-medium">{lead.phone}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {lead.trip_interest && (
              <div className="rounded-full bg-accent/10 px-3 py-1 text-sm text-accent">
                Interessado em: {lead.trip_interest}
              </div>
            )}
            <div className="rounded-full bg-secondary px-3 py-1 text-sm">
              Fonte: {lead.source}
            </div>
            {lead.tickets && (
              <div className="rounded-full bg-secondary px-3 py-1 text-sm">
                {lead.tickets} passageiros
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border p-4">
            <h4 className="mb-2 font-medium">Notas</h4>
            <p className="text-sm text-muted-foreground">{lead.notes}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Criado em {new Date(lead.created_at).toLocaleDateString("pt-BR")}</span>
            </div>
            {lead.last_contact && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Último contato {new Date(lead.last_contact).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
          </div>

          {lead.conversion_value && (
            <div className="rounded-2xl bg-success/10 p-4 text-center">
              <p className="text-sm text-success">Valor convertido</p>
              <p className="font-display text-2xl font-semibold text-success">{formatBRL(lead.conversion_value)}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" /> WhatsApp</Button>
          <Button>Editar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddLeadDialog({ open, onOpenChange, leads, setLeads }: { open: boolean; onOpenChange: (open: boolean) => void; leads: Lead[]; setLeads: React.Dispatch<React.SetStateAction<Lead[]>> }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    source: "Instagram",
    stage: "novo" as LeadStage,
    trip_interest: "",
    notes: "",
  });

  const handleSave = async () => {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        ...form,
        last_contact: new Date().toISOString().split("T")[0],
      })
      .select();
    if (!error && data) {
      setLeads([...data, ...leads]);
    }
    setForm({ name: "", email: "", phone: "", source: "Instagram", stage: "novo", trip_interest: "", notes: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome completo</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do lead" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@exemplo.com" />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="(00) 00000-0000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}>
                {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Interesse (viagem)</Label>
              <Input value={form.trip_interest} onChange={(e) => setForm((f) => ({ ...f, trip_interest: e.target.value }))} placeholder="Destino" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Observações..." rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name}>Adicionar Lead</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}