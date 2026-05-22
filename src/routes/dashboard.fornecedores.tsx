import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Truck,
  Home,
  Bus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/fornecedores")({
  component: FornecedoresPage,
  head: () => ({ meta: [{ title: "Fornecedores | TapTur" }] }),
});

type ProviderType = "transporte" | "hospedagem" | "alimentacao" | "entretenimento" | "outros";

type Provider = {
  id: string;
  name: string;
  type: ProviderType;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes: string;
  rating: number;
  active: boolean;
  createdAt: string;
};

const TYPE_CONFIG: Record<ProviderType, { label: string; icon: typeof Truck; className: string }> = {
  transporte: { label: "Transporte", icon: Bus, className: "bg-blue-500/10 text-blue-600" },
  hospedagem: { label: "Hospedagem", icon: Home, className: "bg-purple-500/10 text-purple-600" },
  alimentacao: { label: "Alimentação", icon: Package, className: "bg-warning/10 text-warning" },
  entretenimento: { label: "Entretenimento", icon: Package, className: "bg-success/10 text-success" },
  outros: { label: "Outros", icon: Package, className: "bg-secondary text-secondary-foreground" },
};

const MOCK_PROVIDERS: Provider[] = [
  {
    id: "f1",
    name: "Viação Expresso São Paulo",
    type: "transporte",
    document: "12.345.678/0001-90",
    email: "contato@viacaoexpresso.com.br",
    phone: "(11) 3456-7890",
    address: "Av. do Transporte, 500",
    city: "São Paulo",
    state: "SP",
    notes: "Ônibus leito e executivo. Bom atendimento.",
    rating: 4.8,
    active: true,
    createdAt: "2025-06-15",
  },
  {
    id: "f2",
    name: "Pousada Mar Azul",
    type: "hospedagem",
    document: "98.765.432/0001-10",
    email: "reservas@pousadamarazul.com.br",
    phone: "(48) 3322-1122",
    address: "Rua das Palmeiras, 100",
    city: "Florianópolis",
    state: "SC",
    notes: "Pousada beira-mar, café incluso.",
    rating: 4.5,
    active: true,
    createdAt: "2025-08-20",
  },
  {
    id: "f3",
    name: "Restaurante Sabor da Terra",
    type: "alimentacao",
    document: "55.444.333/0001-22",
    email: "contato@sabordaterra.com.br",
    phone: "(21) 2233-4455",
    address: "Av. Gastro, 200",
    city: "Rio de Janeiro",
    state: "RJ",
    notes: "Buffet regional. Atende 200 pessoas.",
    rating: 4.2,
    active: true,
    createdAt: "2025-09-10",
  },
  {
    id: "f4",
    name: "City Tour Rio",
    type: "entretenimento",
    document: "33.222.111/0001-44",
    email: "reservas@citytourrio.com.br",
    phone: "(21) 98765-4321",
    address: "Centro, 300",
    city: "Rio de Janeiro",
    state: "RJ",
    notes: "Guias certificados. Tour Cristo e Pão de Açúcar.",
    rating: 4.9,
    active: true,
    createdAt: "2025-10-05",
  },
  {
    id: "f5",
    name: "Frete Rápido Logística",
    type: "transporte",
    document: "77.888.999/0001-55",
    email: "contato@freterapido.com.br",
    phone: "(11) 99988-7766",
    address: "Logística, 400",
    city: "São Paulo",
    state: "SP",
    notes: "Van premium para traslados.",
    rating: 4.6,
    active: false,
    createdAt: "2025-11-20",
  },
];

const PROVIDER_TYPES: ProviderType[] = ["transporte", "hospedagem", "alimentacao", "entretenimento", "outros"];

function FornecedoresPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editProvider, setEditProvider] = useState<Provider | null>(null);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setProviders(data as Provider[]);
    }
    setLoading(false);
  };

  const filtered = providers.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "todos" || p.type === typeFilter;
    const matchStatus =
      statusFilter === "todos" ||
      (statusFilter === "ativo" && p.active) ||
      (statusFilter === "inativo" && !p.active);
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: providers.length,
    ativos: providers.filter((p) => p.active).length,
    transporte: providers.filter((p) => p.type === "transporte").length,
    hospedagem: providers.filter((p) => p.type === "hospedagem").length,
  };

  const handleSave = async (provider: Omit<Provider, "id" | "createdAt">) => {
    if (editProvider) {
      const { error } = await supabase
        .from("suppliers")
        .update(provider)
        .eq("id", editProvider.id);
      if (!error) {
        setProviders((prev) => prev.map((p) => (p.id === editProvider.id ? { ...p, ...provider } : p)));
      }
    } else {
      const { data, error } = await supabase
        .from("suppliers")
        .insert([provider])
        .select()
        .single();
      if (!error && data) {
        setProviders((prev) => [...prev, data as Provider]);
      }
    }
    setIsCreateOpen(false);
    setEditProvider(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (!error) {
      setProviders((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleToggleActive = async (provider: Provider) => {
    const newActive = !provider.active;
    const { error } = await supabase
      .from("suppliers")
      .update({ active: newActive })
      .eq("id", provider.id);
    if (!error) {
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, active: newActive } : p))
      );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Fornecedores</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie seus fornecedores de transporte, hospedagem e outros serviços.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Ativos" value={stats.ativos} color="text-success" />
        <StatCard label="Transporte" value={stats.transporte} />
        <StatCard label="Hospedagem" value={stats.hospedagem} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="todos">Todos os tipos</option>
          {PROVIDER_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
          ))}
        </select>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhum fornecedor encontrado</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((provider) => {
            const config = TYPE_CONFIG[provider.type];
            const TypeIcon = config.icon;
            return (
              <div
                key={provider.id}
                className={`group rounded-3xl border border-border bg-background p-5 transition-shadow hover:shadow-card ${
                  !provider.active ? "opacity-60" : ""
                }`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">{provider.name}</h3>
                      <Badge className={`${config.className} mt-1 text-[10px]`}>{config.label}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditProvider(provider);
                        setIsCreateOpen(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(provider.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {provider.city} - {provider.state}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {provider.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {provider.email}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">{(provider.rating || 0).toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">/ 5.0</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(provider)}
                  >
                    {provider.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProviderDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditProvider(null);
          }
        }}
        onSave={handleSave}
        provider={editProvider}
      />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-display text-2xl font-semibold ${color || ""}`}>{value}</p>
    </div>
  );
}

function ProviderDialog({
  open,
  onOpenChange,
  onSave,
  provider,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (provider: Omit<Provider, "id" | "createdAt">) => void;
  provider: Provider | null;
}) {
  const [form, setForm] = useState<Omit<Provider, "id" | "createdAt">>({
    name: "",
    type: "transporte",
    document: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    notes: "",
    rating: 5,
    active: true,
  });

  useEffect(() => {
    if (provider) {
      setForm({
        name: provider.name,
        type: provider.type,
        document: provider.document,
        email: provider.email,
        phone: provider.phone,
        address: provider.address,
        city: provider.city,
        state: provider.state,
        notes: provider.notes,
        rating: provider.rating,
        active: provider.active,
      });
    } else {
      setForm({
        name: "",
        type: "transporte",
        document: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        notes: "",
        rating: 5,
        active: true,
      });
    }
  }, [provider]);

  const handleSave = () => {
    onSave(form);
    setForm({
      name: "",
      type: "transporte",
      document: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      notes: "",
      rating: 5,
      active: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{provider ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome do fornecedor"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ProviderType }))}
              >
                {PROVIDER_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>CNPJ/CPF</Label>
              <Input
                value={form.document}
                onChange={(e) => setForm((f) => ({ ...f, document: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Endereço completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!form.name}>
            {provider ? "Salvar" : "Cadastrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}