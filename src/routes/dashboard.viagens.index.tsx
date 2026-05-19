import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search, Copy, Power, Edit, Eye, Trash2, MoreHorizontal, Calendar, MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getOccupancy } from "@/data/dashboard";
import { formatBRL, formatDate, type Trip } from "@/data/trips";
import { supabase } from "@/lib/supabase";
import { CURRENT_AGENCY_SLUG } from "@/data/dashboard";

export const Route = createFileRoute("/dashboard/viagens/")({
  component: TripsList,
});

type TripStatus = "ativa" | "rascunho" | "inativa";

function TripsList() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tripToClone, setTripToClone] = useState<Trip | null>(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    const { data, error } = await supabase
      .from("trips")
      .select("*, agency!inner(slug)")
      .order("departure_date", { ascending: true });

    if (error) {
      console.error("Error loading trips:", error);
      return;
    }

    const mapped = data?.map((t) => ({
      id: t.id,
      slug: t.slug,
      agencySlug: t.agency?.slug || CURRENT_AGENCY_SLUG,
      agencyId: t.agency_id,
      destination: t.destination,
      departureDate: t.departure_date,
      returnDate: t.return_date,
      nights: t.nights,
      capacity: t.capacity,
      priceAdult: t.price_adult,
      priceChild: t.price_child,
      image: t.image,
      vehicle: t.vehicle,
      state: t.state,
    })) || [];

    setTrips(mapped);
  };

  const myTrips = trips.filter((t) => t.agencySlug === CURRENT_AGENCY_SLUG);

  const filtered = myTrips.filter((t) => {
    const matchSearch =
      !q ||
      t.destination.toLowerCase().includes(q.toLowerCase()) ||
      t.state.toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter === "todos" || (statusFilter === "ativa" && t.capacity > 0);
    return matchSearch && matchStatus;
  });

  const handleClone = (trip: Trip) => {
    setTripToClone(trip);
  };

  const confirmClone = async (newDate: string) => {
    if (!tripToClone || !newDate) return;

    const returnDate = new Date(new Date(newDate).getTime() + tripToClone.nights * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { error } = await supabase.from("trips").insert({
      slug: `${tripToClone.slug}-copy`,
      destination: tripToClone.destination,
      departure_date: newDate,
      return_date: returnDate,
      nights: tripToClone.nights,
      capacity: tripToClone.capacity,
      price_adult: tripToClone.priceAdult,
      price_child: tripToClone.priceChild,
      image: tripToClone.image,
      vehicle: tripToClone.vehicle,
      state: tripToClone.state,
      agency_id: tripToClone.agencyId,
    });

    if (error) {
      console.error("Error cloning trip:", error);
      return;
    }

    setTripToClone(null);
    navigate({ to: "/dashboard/viagens" });
    loadTrips();
  };

  const handleToggleActive = async (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    const newCapacity = trip.capacity === 0 ? 46 : 0;

    const { error } = await supabase
      .from("trips")
      .update({ capacity: newCapacity })
      .eq("id", tripId);

    if (error) {
      console.error("Error toggling trip:", error);
      return;
    }

    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, capacity: newCapacity } : t))
    );
  };

  const handleDelete = async (tripId: string) => {
    const { error } = await supabase.from("trips").delete().eq("id", tripId);

    if (error) {
      console.error("Error deleting trip:", error);
      return;
    }

    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const stats = {
    total: myTrips.length,
    ativas: myTrips.filter((t) => t.capacity > 0).length,
    rascunhos: myTrips.filter((t) => t.capacity === 0).length,
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Viagens</h1>
          <p className="mt-2 text-muted-foreground">
            Gerencie todas as viagens publicadas pela sua agência.
          </p>
        </div>
        <Link
          to="/dashboard/viagens/nova"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" /> Nova viagem
        </Link>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total de viagens" value={stats.total} />
        <StatCard label="Ativas" value={stats.ativas} color="text-success" />
        <StatCard label="Rascunhos" value={stats.rascunhos} color="text-warning" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por destino..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todas</option>
          <option value="ativa">Ativas</option>
          <option value="rascunho">Rascunhos</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-surface-elevated text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Viagem</th>
              <th className="px-5 py-3 text-left font-semibold">Data de saída</th>
              <th className="px-5 py-3 text-left font-semibold">Status</th>
              <th className="px-5 py-3 text-left font-semibold">Ocupação</th>
              <th className="px-5 py-3 text-left font-semibold">Preço</th>
              <th className="px-5 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const occ = getOccupancy(t.id, t.capacity || 46);
              const isActive = t.capacity > 0;
              return (
                <tr key={t.id} className="border-t border-border transition-colors hover:bg-surface-elevated">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-none overflow-hidden rounded-lg bg-secondary">
                        <img src={t.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                      <div>
                        <p className="font-medium">{t.destination}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.nights} noites · {t.vehicle}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(t.departureDate)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge className={isActive ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                      {isActive ? "Ativa" : "Rascunho"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-full ${isActive ? "bg-success" : "bg-muted"}`}
                          style={{ width: `${occ.percent}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {occ.sold}/{occ.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium">{formatBRL(t.priceAdult)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/dashboard/viagens/$tripId" params={{ tripId: t.id }}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to="/dashboard/viagens/nova">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleClone(t)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(t.id)}>
                        <Power className={`h-4 w-4 ${isActive ? "text-destructive" : "text-success"}`} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(t.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                  Nenhuma viagem encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CloneTripDialog
        open={!!tripToClone}
        onOpenChange={(open) => !open && setTripToClone(null)}
        trip={tripToClone}
        onConfirm={confirmClone}
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

function CloneTripDialog({
  open,
  onOpenChange,
  trip,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: Trip | null;
  onConfirm: (newDate: string) => void;
}) {
  const [newDate, setNewDate] = useState("");

  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Clonar Viagem</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center gap-3">
              <img src={trip.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <div>
                <p className="font-medium">{trip.destination}</p>
                <p className="text-sm text-muted-foreground">
                  {trip.nights} noites · {formatBRL(trip.priceAdult)}/adulto
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Defina a nova data de partida:</p>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(newDate)} disabled={!newDate}>
            Clonar Viagem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}