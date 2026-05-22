import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Plane,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBRL } from "@/data/trips";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/dashboard/relatorios")({
  component: RelatoriosPage,
  head: () => ({ meta: [{ title: "Relatórios | TapTur" }] }),
});

function RelatoriosPage() {
  const [period, setPeriod] = useState("2026");
  const [selectedTrip, setSelectedTrip] = useState<string>("todos");
  const [trips, setTrips] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [{ data: tripsData }, { data: reservationsData }] = await Promise.all([
        supabase.from("trips").select("*").order("departure_date", { ascending: true }),
        supabase.from("reservations").select("*, trips(*)").order("created_at", { ascending: false }),
      ]);
      setTrips(tripsData || []);
      setReservations(reservationsData || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredTrips = trips;

  const confirmedReservations = useMemo(() => 
    reservations.filter((r: any) => r.status === "confirmed"),
    [reservations]
  );

  const stats = useMemo(() => {
    const totalRevenue = confirmedReservations.reduce((sum: number, r: any) => sum + (r.total_value || 0), 0);
    const ticketCount = confirmedReservations.length;
    const avgTicket = ticketCount > 0 ? totalRevenue / ticketCount : 0;
    
    const tripOccupancy: Record<string, number> = {};
    const tripCapacity: Record<string, number> = {};
    trips.forEach((t: any) => {
      tripOccupancy[t.id] = 0;
      tripCapacity[t.id] = t.total_seats || 0;
    });
    reservations.forEach((r: any) => {
      if (r.trip_id && tripOccupancy[r.trip_id] !== undefined) {
        tripOccupancy[r.trip_id] += 1;
      }
    });
    const occupancies = Object.values(tripOccupancy) as number[];
    const capacities = Object.values(tripCapacity) as number[];
    const avgOccupancy = capacities.reduce((sum, c, i) => sum + (c > 0 ? (occupancies[i] / c) * 100 : 0), 0) / capacities.filter(c => c > 0).length || 0;

    return {
      revenue: { value: totalRevenue, change: 0, label: "Receita total" },
      tickets: { value: ticketCount, change: 0, label: "Passagens vendidas" },
      avgTicket: { value: Math.round(avgTicket), change: 0, label: "Ticket médio" },
      occupancy: { value: Math.round(avgOccupancy), change: 0, label: "Ocupação média" },
    };
  }, [confirmedReservations, reservations, trips]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { revenue: number; bookings: number }> = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    monthNames.forEach(m => { months[m] = { revenue: 0, bookings: 0 }; });
    
    confirmedReservations.forEach((r: any) => {
      if (r.created_at) {
        const date = new Date(r.created_at);
        const month = monthNames[date.getMonth()];
        if (months[month]) {
          months[month].revenue += r.total_value || 0;
          months[month].bookings += 1;
        }
      }
    });
    
    return monthNames.map(m => ({ month: m, ...months[m] }));
  }, [confirmedReservations]);

  const topDestinations = useMemo(() => {
    const destData: Record<string, { bookings: number; revenue: number }> = {};
    confirmedReservations.forEach((r: any) => {
      const dest = r.trips?.destination || "Outro";
      if (!destData[dest]) destData[dest] = { bookings: 0, revenue: 0 };
      destData[dest].bookings += 1;
      destData[dest].revenue += r.total_value || 0;
    });
    
    const total = Object.values(destData).reduce((sum, d) => sum + d.revenue, 0);
    return Object.entries(destData)
      .map(([destination, data]) => ({
        destination,
        bookings: data.bookings,
        revenue: data.revenue,
        percent: total > 0 ? Math.round((data.revenue / total) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [confirmedReservations]);

  const paymentMethods = useMemo(() => {
    const methods: Record<string, { amount: number; count: number }> = {};
    confirmedReservations.forEach((r: any) => {
      const method = r.payment_method || "Outro";
      if (!methods[method]) methods[method] = { amount: 0, count: 0 };
      methods[method].amount += r.total_value || 0;
      methods[method].count += 1;
    });
    
    const total = Object.values(methods).reduce((sum, m) => sum + m.amount, 0);
    return Object.entries(methods)
      .map(([method, data]) => ({
        method,
        amount: data.amount,
        count: data.count,
        percent: total > 0 ? Math.round((data.amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [confirmedReservations]);

  const dreData = useMemo(() => {
    const revenue = stats.revenue.value;
    const cardTax = Math.round(revenue * 0.035);
    const pixTax = Math.round(revenue * 0.012);
    const commission = Math.round(revenue * 0.05);
    const taxes = Math.round(revenue * 0.0925);
    const netRevenue = revenue - cardTax - pixTax - commission - taxes;
    
    return [
      { item: "Receita bruta", value: revenue, type: "income" },
      { item: "Taxa de cartão (3.5%)", value: -cardTax, type: "expense" },
      { item: "Taxa PIX (1.2%)", value: -pixTax, type: "expense" },
      { item: "Comissão plataforma", value: -commission, type: "expense" },
      { item: "Impostos (9.25%)", value: -taxes, type: "expense" },
      { item: "Receita líquida", value: netRevenue, type: "total" },
    ];
  }, [stats.revenue.value]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-center text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Relatórios</h1>
          <p className="mt-2 text-muted-foreground">
            DRE, ocupação por viagem, top destinos e exportaciones em CSV.
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard {...stats.revenue} icon={<DollarSign className="h-5 w-5" />} />
        <MetricCard {...stats.tickets} icon={<Plane className="h-5 w-5" />} />
        <MetricCard {...stats.avgTicket} icon={<TrendingUp className="h-5 w-5" />} />
        <MetricCard {...stats.occupancy} icon={<Users className="h-5 w-5" />} suffix="%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-border bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold">Receita mensal</h2>
              <Select value={selectedTrip} onValueChange={setSelectedTrip}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filtrar viagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as viagens</SelectItem>
                  {filteredTrips.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>{t.destination}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <BarChart data={monthlyData} />
          </div>
        </div>

        <div>
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">Top destinos</h2>
            <div className="space-y-4">
              {topDestinations.map((dest: any, i: number) => (
                <div key={dest.destination} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-[10px] font-bold text-accent">
                        {i + 1}
                      </span>
                      <span className="font-medium">{dest.destination}</span>
                    </div>
                    <span className="font-medium">{formatBRL(dest.revenue)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${dest.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{dest.bookings} reservas</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-background p-6">
          <h2 className="mb-6 font-display text-xl font-semibold">Formas de pagamento</h2>
          <div className="space-y-4">
            {paymentMethods.map((pm: any) => (
              <div key={pm.method} className="flex items-center justify-between rounded-2xl bg-surface p-4">
                <div>
                  <p className="font-medium">{pm.method}</p>
                  <p className="text-sm text-muted-foreground">{pm.count} transações</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-semibold">{formatBRL(pm.amount)}</p>
                  <p className="text-sm text-muted-foreground">{pm.percent}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-background p-6">
          <h2 className="mb-6 font-display text-xl font-semibold">Demonstrativo (DRE)</h2>
          <div className="space-y-3">
            {dreData.map((item: any) => (
              <div
                key={item.item}
                className={`flex items-center justify-between rounded-xl p-3 ${
                  item.type === "total"
                    ? "bg-accent/10 font-semibold"
                    : item.type === "expense"
                    ? "bg-surface"
                    : "bg-surface"
                }`}
              >
                <span className={item.type === "expense" ? "text-destructive" : ""}>{item.item}</span>
                <span
                  className={`font-mono ${
                    item.type === "expense"
                      ? "text-destructive"
                      : item.type === "total"
                      ? "text-success"
                      : ""
                  }`}
                >
                  {item.type === "expense" ? "-" : ""}
                  {formatBRL(Math.abs(item.value))}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Período: {period} | Último fechamento: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  value,
  change,
  label,
  icon,
  suffix = "",
}: {
  value: number;
  change: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
}) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
          {icon}
        </div>
        <div className={`flex items-center gap-0.5 text-sm ${isPositive ? "text-success" : "text-destructive"}`}>
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="font-display text-2xl font-semibold">
        {value.toLocaleString("pt-BR")}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function BarChart({ data }: { data: { month: string; revenue: number; bookings: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="space-y-4">
      <div className="flex h-48 items-end gap-3">
        {data.map((d) => (
          <div key={d.month} className="group relative flex flex-1 flex-col items-center">
            <div
              className="w-full rounded-t-lg bg-accent/20 transition-all group-hover:bg-accent/30"
              style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
            />
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-lg bg-primary px-2 py-1 text-xs font-medium text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100"
              style={{ bottom: `${(d.revenue / maxRevenue) * 100}%` }}
            >
              {formatBRL(d.revenue)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        {data.map((d) => (
          <div key={d.month} className="flex-1 text-center">
            <p className="text-sm font-medium">{d.month}</p>
            <p className="text-xs text-muted-foreground">{d.bookings} reservas</p>
          </div>
        ))}
      </div>
    </div>
  );
}