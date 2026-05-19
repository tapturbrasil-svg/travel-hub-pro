import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Star,
  Layers,
  Users,
  Check,
  Bed,
  MapPin,
  Phone,
  Image,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/hospedagens")({
  component: HospedagensPage,
  head: () => ({ meta: [{ title: "Hospedagens | TapTur" }] }),
});

type RoomType = {
  id: string;
  name: string;
  capacity: number;
  pricePerPerson: number;
  description: string;
  available: number;
};

type Hospedagem = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  stars: number;
  description: string;
  meals: string;
  amenities: string[];
  rooms: RoomType[];
  photos: string[];
  providerId?: string;
  active: boolean;
  createdAt: string;
};

function HospedagensPage() {
  const navigate = useNavigate();
  const [hospedagens, setHospedagens] = useState<Hospedagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editHospedagem, setEditHospedagem] = useState<Hospedagem | null>(null);
  const [viewHospedagem, setViewHospedagem] = useState<Hospedagem | null>(null);

  useEffect(() => {
    loadHospedagens();
  }, []);

  const loadHospedagens = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hospedagens")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      const mapped = data.map((h: any) => ({
        id: h.id,
        name: h.name,
        address: h.address,
        city: h.city,
        state: h.state,
        stars: h.stars,
        description: h.description,
        meals: h.meals,
        amenities: h.amenities || [],
        rooms: h.rooms || [],
        photos: h.photos || [],
        active: h.active ?? true,
        createdAt: h.created_at,
      }));
      setHospedagens(mapped);
    }
    setLoading(false);
  };

  const filtered = hospedagens.filter((h) => {
    const matchSearch =
      !search ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "todos" ||
      (statusFilter === "ativo" && h.active) ||
      (statusFilter === "inativo" && !h.active);
    return matchSearch && matchStatus;
  });

  const stats = {
    total: hospedagens.length,
    ativos: hospedagens.filter((h) => h.active).length,
    totalQuartos: hospedagens.reduce((acc, h) => acc + h.rooms.length, 0),
    vagas: hospedagens.reduce((acc, h) => acc + h.rooms.reduce((a, r) => a + r.available, 0), 0),
  };

  const handleSave = async (hospedagem: Omit<Hospedagem, "id" | "createdAt">) => {
    if (editHospedagem) {
      const { error } = await supabase
        .from("hospedagens")
        .update({
          name: hospedagem.name,
          address: hospedagem.address,
          city: hospedagem.city,
          state: hospedagem.state,
          stars: hospedagem.stars,
          description: hospedagem.description,
          meals: hospedagem.meals,
          amenities: hospedagem.amenities,
          rooms: hospedagem.rooms,
          photos: hospedagem.photos,
          active: hospedagem.active,
        })
        .eq("id", editHospedagem.id);
      if (!error) {
        loadHospedagens();
      }
    } else {
      const { error } = await supabase.from("hospedagens").insert({
        name: hospedagem.name,
        address: hospedagem.address,
        city: hospedagem.city,
        state: hospedagem.state,
        stars: hospedagem.stars,
        description: hospedagem.description,
        meals: hospedagem.meals,
        amenities: hospedagem.amenities,
        rooms: hospedagem.rooms,
        photos: hospedagem.photos,
        active: hospedagem.active,
      });
      if (!error) {
        loadHospedagens();
      }
    }
    setIsCreateOpen(false);
    setEditHospedagem(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("hospedagens").delete().eq("id", id);
    if (!error) {
      setHospedagens((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("hospedagens").update({ active }).eq("id", id);
    if (!error) {
      setHospedagens((prev) => prev.map((h) => h.id === id ? { ...h, active } : h));
    }
  };

  const handleCreateLayout = (hospedagemId: string) => {
    window.location.href = `/dashboard/hospedagens/layout/${hospedagemId}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Hospedagens</h1>
          <p className="mt-2 text-muted-foreground">
            Cadastre e gerencie as hospedagens disponíveis para suas viagens.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Nova Hospedagem
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total de hospedagens" value={stats.total} />
        <StatCard label="Ativas" value={stats.ativos} color="text-success" />
        <StatCard label="Tipos de quarto" value={stats.totalQuartos} />
        <StatCard label="Vagas disponíveis" value={stats.vagas} />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar hospedagem..."
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
          <option value="todos">Todos</option>
          <option value="ativo">Ativas</option>
          <option value="inativo">Inativas</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <Building2 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">Nenhuma hospedagem encontrada</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((hospedagem) => (
            <div
              key={hospedagem.id}
              className={`group rounded-3xl border border-border bg-background p-5 transition-shadow hover:shadow-card ${
                !hospedagem.active ? "opacity-60" : ""
              }`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="font-display font-semibold">{hospedagem.name}</h3>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {hospedagem.city} - {hospedagem.state}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-sm font-medium">{hospedagem.stars}</span>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-1">
                {hospedagem.amenities.slice(0, 4).map((amenity) => (
                  <Badge key={amenity} className="bg-secondary text-secondary-foreground text-[10px]">
                    {amenity}
                  </Badge>
                ))}
                {hospedagem.amenities.length > 4 && (
                  <Badge className="bg-secondary text-secondary-foreground text-[10px]">
                    +{hospedagem.amenities.length - 4}
                  </Badge>
                )}
              </div>

              <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-surface p-2">
                  <p className="text-xs text-muted-foreground">Refeições</p>
                  <p className="font-medium">{hospedagem.meals}</p>
                </div>
                <div className="rounded-xl bg-surface p-2">
                  <p className="text-xs text-muted-foreground">Quartos</p>
                  <p className="font-medium">{hospedagem.rooms.length} tipos</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewHospedagem(hospedagem)}>
                    <Bed className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditHospedagem(hospedagem); setIsCreateOpen(true); }}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Link to="/dashboard/hospedagens/layout/$hospedagemId/viewer" params={{ hospedagemId: hospedagem.id }}>
                      <Layers className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(hospedagem.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleToggleActive(hospedagem.id, !hospedagem.active)}>
                  {hospedagem.active ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HospedagemDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) { setIsCreateOpen(false); setEditHospedagem(null); }
        }}
        onSave={handleSave}
        hospedagem={editHospedagem}
      />

      <HospedagemDetailModal
        open={!!viewHospedagem}
        onOpenChange={(open) => !open && setViewHospedagem(null)}
        hospedagem={viewHospedagem}
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

function HospedagemDialog({
  open,
  onOpenChange,
  onSave,
  hospedagem,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (h: Omit<Hospedagem, "id" | "createdAt">) => void;
  hospedagem: Hospedagem | null;
}) {
  const [form, setForm] = useState<Omit<Hospedagem, "id" | "createdAt">>({
    name: "",
    address: "",
    city: "",
    state: "",
    stars: 3,
    description: "",
    meals: "",
    amenities: [],
    rooms: [],
    photos: [],
    active: true,
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [roomForm, setRoomForm] = useState<RoomType>({ id: "", name: "", capacity: 2, pricePerPerson: 0, description: "", available: 0 });

  useState(() => {
    if (hospedagem) {
      setForm({
        name: hospedagem.name,
        address: hospedagem.address,
        city: hospedagem.city,
        state: hospedagem.state,
        stars: hospedagem.stars,
        description: hospedagem.description,
        meals: hospedagem.meals,
        amenities: [...hospedagem.amenities],
        rooms: [...hospedagem.rooms],
        photos: [...hospedagem.photos],
        active: hospedagem.active,
      });
    }
  });

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setForm((f) => ({ ...f, amenities: [...f.amenities, amenityInput.trim()] }));
      setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setForm((f) => ({ ...f, amenities: f.amenities.filter((_, i) => i !== index) }));
  };

  const addRoom = () => {
    if (roomForm.name) {
      setForm((f) => ({ ...f, rooms: [...f.rooms, { ...roomForm, id: `r${Date.now()}` }] }));
      setRoomForm({ id: "", name: "", capacity: 2, pricePerPerson: 0, description: "", available: 0 });
    }
  };

  const removeRoom = (id: string) => {
    setForm((f) => ({ ...f, rooms: f.rooms.filter((r) => r.id !== id) }));
  };

  const handleSave = () => {
    onSave(form);
    setForm({ name: "", address: "", city: "", state: "", stars: 3, description: "", meals: "", amenities: [], rooms: [], photos: [], active: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{hospedagem ? "Editar Hospedagem" : "Nova Hospedagem"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome da hospedagem" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} maxLength={2} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estrelas</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={form.stars} onChange={(e) => setForm((f) => ({ ...f, stars: Number(e.target.value) }))}>
                {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{s} ★</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Refeições</Label>
              <Input value={form.meals} onChange={(e) => setForm((f) => ({ ...f, meals: e.target.value }))} placeholder="Ex: All inclusive" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Comodidades</Label>
            <div className="flex gap-2">
              <Input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} placeholder="Ex: Wi-Fi" onKeyDown={(e) => e.key === "Enter" && addAmenity()} />
              <Button onClick={addAmenity}>Adicionar</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.amenities.map((a, i) => (
                <Badge key={i} className="gap-1 cursor-pointer" onClick={() => removeAmenity(i)}>
                  {a} <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tipos de Quarto</Label>
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <Input placeholder="Nome" value={roomForm.name} onChange={(e) => setRoomForm((r) => ({ ...r, name: e.target.value }))} />
                <Input type="number" placeholder="Capacidade" value={roomForm.capacity} onChange={(e) => setRoomForm((r) => ({ ...r, capacity: Number(e.target.value) }))} />
                <Input type="number" placeholder="Preço/pessoa" value={roomForm.pricePerPerson} onChange={(e) => setRoomForm((r) => ({ ...r, pricePerPerson: Number(e.target.value) }))} />
                <Input placeholder="Disponíveis" type="number" value={roomForm.available} onChange={(e) => setRoomForm((r) => ({ ...r, available: Number(e.target.value) }))} />
              </div>
              <Input placeholder="Descrição" value={roomForm.description} onChange={(e) => setRoomForm((r) => ({ ...r, description: e.target.value }))} />
              <Button variant="outline" onClick={addRoom}>Adicionar Quarto</Button>
            </div>
            {form.rooms.length > 0 && (
              <div className="space-y-2 mt-2">
                {form.rooms.map((room) => (
                  <div key={room.id} className="flex items-center justify-between rounded-lg bg-surface p-2">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{room.name}</span>
                      <span className="text-sm text-muted-foreground">Cap: {room.capacity}</span>
                      <span className="text-sm text-muted-foreground">R$ {room.pricePerPerson}/pessoa</span>
                      <span className="text-sm text-muted-foreground">{room.available} disponíveis</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRoom(room.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!form.name}>Salvar Hospedagem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HospedagemDetailModal({ open, onOpenChange, hospedagem }: { open: boolean; onOpenChange: (open: boolean) => void; hospedagem: Hospedagem | null }) {
  if (!hospedagem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display text-xl">{hospedagem.name}</DialogTitle>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-medium">{hospedagem.stars}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {hospedagem.address}, {hospedagem.city} - {hospedagem.state}
          </div>

          <p className="text-sm">{hospedagem.description}</p>

          <div className="flex flex-wrap gap-2">
            {hospedagem.amenities.map((a) => (
              <Badge key={a} className="bg-secondary text-secondary-foreground">{a}</Badge>
            ))}
          </div>

          <div>
            <h4 className="mb-3 font-medium">Tipos de Quarto</h4>
            <div className="space-y-3">
              {hospedagem.rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-muted-foreground">{room.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-semibold text-accent">
                      {room.pricePerPerson >= 0 ? `+ R$ ${room.pricePerPerson}` : `- R$ ${Math.abs(room.pricePerPerson)}`}/pessoa
                    </p>
                    <p className="text-sm text-muted-foreground">{room.available} disponíveis</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
