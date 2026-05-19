import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Ticket, Search, Download, Filter, Eye, X, CreditCard, Smartphone, Barcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRIPS, formatBRL, formatDate } from "@/data/trips";

type Booking = {
  id: string;
  code: string;
  trip_id: string;
  passenger_name: string;
  passenger_doc: string;
  seat: number;
  status: "confirmada" | "pendente" | "cancelada";
  payment_method: "Cartão" | "PIX" | "Boleto";
  total: number;
  created_at: string;
  trips?: {
    id: string;
    destination: string;
    departure_date: string;
    return_date: string;
    vehicle: string;
  };
  passengers?: {
    name: string;
    document: string;
  };
  users?: {
    name: string;
  };
};

export const Route = createFileRoute("/dashboard/reservas")({
  component: ReservasPage,
  head: () => ({ meta: [{ title: "Reservas | TapTur" }] }),
});

const STATUS_COLORS: Record<string, string> = {
  confirmada: "bg-success/10 text-success",
  pendente: "bg-warning/10 text-warning",
  cancelada: "bg-destructive/10 text-destructive",
};

const PAYMENT_ICONS: Record<string, typeof CreditCard> = {
  Cartão: CreditCard,
  PIX: Smartphone,
  Boleto: Barcode,
};

function ReservasPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservations() {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, trips(*), passengers(*), users(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reservations:", error);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    }

    fetchReservations();
  }, []);

  const confirmPayment = async (id: string) => {
    const { error } = await supabase
      .from("reservations")
      .update({ status: "confirmada" })
      .eq("id", id);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "confirmada" } : b))
      );
      setSelectedBooking((prev) =>
        prev ? { ...prev, status: "confirmada" } : null
      );
    }
  };

  const filtered = bookings.filter((b) => {
    const trip = TRIPS.find((t) => t.id === b.trip_id);
    const matchSearch =
      !search ||
      (b.passenger_name || b.passengers?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      b.code.includes(search) ||
      (b.passenger_doc || b.passengers?.document || "").includes(search);
    const matchStatus = statusFilter === "todas" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: bookings.length,
    confirmadas: bookings.filter((b) => b.status === "confirmada").length,
    pendentes: bookings.filter((b) => b.status === "pendente").length,
    canceladas: bookings.filter((b) => b.status === "cancelada").length,
    receita: bookings.filter((b) => b.status === "confirmada").reduce((acc, b) => acc + b.total, 0),
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-muted-foreground">Carregando reservas...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Reservas</h1>
          <p className="mt-2 text-muted-foreground">
            Acompanhe todas as reservas em tempo real, status de pagamento e check-in.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total de reservas" value={stats.total} />
        <StatCard label="Confirmadas" value={stats.confirmadas} color="success" />
        <StatCard label="Pendentes" value={stats.pendentes} color="warning" />
        <StatCard label="Canceladas" value={stats.canceladas} color="destructive" />
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, código ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos os status</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Passageiro</TableHead>
              <TableHead>Viagem</TableHead>
              <TableHead>Assento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  Nenhuma reserva encontrada
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((booking) => {
                const trip = booking.trips || TRIPS.find((t) => t.id === booking.trip_id);
                const passengerName = booking.passenger_name || booking.passengers?.name || "";
                const passengerDoc = booking.passenger_doc || booking.passengers?.document || "";
                const PaymentIcon = PAYMENT_ICONS[booking.payment_method] || CreditCard;
                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">{booking.code}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{passengerName}</p>
                        <p className="text-xs text-muted-foreground">{passengerDoc}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{trip?.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        {trip && formatDate(trip.departure_date)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-secondary text-xs font-medium">
                        {booking.seat}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[booking.status]}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <PaymentIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {booking.payment_method}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatBRL(booking.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(booking)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          trip={selectedBooking.trips || TRIPS.find((t) => t.id === selectedBooking.trip_id)}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${color ? `text-${color}` : ""}`}>
        {value}
      </p>
    </div>
  );
}

function BookingModal({
  booking,
  trip,
  onClose,
}: {
  booking: Booking;
  trip?: {
    id: string;
    destination: string;
    departure_date: string;
    return_date: string;
    vehicle: string;
  };
  onClose: () => void;
}) {
  const passengerName = booking.passenger_name || booking.passengers?.name || "";
  const passengerDoc = booking.passenger_doc || booking.passengers?.document || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-background p-6 shadow-floating">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Detalhes da Reserva</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-surface p-4">
            <div>
              <p className="text-sm text-muted-foreground">Código da reserva</p>
              <p className="font-mono text-lg font-semibold">{booking.code}</p>
            </div>
            <Badge className={STATUS_COLORS[booking.status]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-sm text-muted-foreground">Passageiro</p>
              <p className="font-medium">{passengerName}</p>
              <p className="text-sm text-muted-foreground">{passengerDoc}</p>
            </div>
            <div className="rounded-2xl bg-surface p-4">
              <p className="text-sm text-muted-foreground">Assento</p>
              <p className="font-medium">Nº {booking.seat}</p>
              <p className="text-sm text-muted-foreground">{trip?.vehicle}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Viagem</p>
            <p className="font-medium">{trip?.destination}</p>
            <p className="text-sm text-muted-foreground">
              {trip && formatDate(trip.departure_date)} — {trip && formatDate(trip.return_date)}
            </p>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-surface p-4">
            <div>
              <p className="text-sm text-muted-foreground">Forma de pagamento</p>
              <p className="font-medium">{booking.payment_method}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor total</p>
              <p className="font-display text-2xl font-semibold text-accent">
                {formatBRL(booking.total)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Fechar
          </Button>
          {booking.status === "pendente" && (
            <Button
              className="flex-1 gap-2"
              onClick={() => {
                confirmPayment(booking.id);
                onClose();
              }}
            >
              Confirmar pagamento
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="border-b border-border bg-surface-elevated">{children}</thead>;
}

function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="transition-colors hover:bg-surface-elevated">{children}</tr>;
}

function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm ${className}`}>{children}</td>;
}