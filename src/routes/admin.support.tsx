import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  Check,
  Clock,
  Headphones,
  MessageSquare,
  Mail,
  Phone,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/support")({
  component: SupportPage,
});

const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-gray-100 text-gray-700 border-gray-200",
};

function SupportPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*, agencies(name)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTickets(data);
      }
      setLoading(false);
    }
    loadTickets();
  }, []);

  const filtered = tickets.filter((t) => {
    if (activeTab !== "all" && t.status !== activeTab) return false;
    const agencyName = t.agencies?.name || t.agency;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !agencyName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    open: tickets.filter((t) => t.status === "open").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Suporte</h1>
          <p className="mt-1 text-muted-foreground">Gerencie os chamados das agências</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Novo Chamado
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:border-primary" onClick={() => setActiveTab("open")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abertos</p>
                <p className="text-3xl font-bold">{stats.open}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-primary" onClick={() => setActiveTab("pending")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:border-primary" onClick={() => setActiveTab("resolved")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
                <p className="text-3xl font-bold">{stats.resolved}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar chamado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="open">Abertos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-lg border p-4 transition-colors hover:bg-surface-elevated/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{ticket.subject}</p>
                      <Badge className={`border ${PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]}`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{ticket.agencies?.name || ticket.agency}</span>
                      <span>•</span>
                      <span>{ticket.user}</span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {ticket.status === "open" ? (
                      <Badge variant="destructive">Aberto</Badge>
                    ) : ticket.status === "pending" ? (
                      <Badge variant="outline" className="bg-yellow-50">Pendente</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">Resolvido</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <MessageSquare className="h-4 w-4" /> Responder
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Mail className="h-4 w-4" /> Email
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Phone className="h-4 w-4" /> Ligar
                  </Button>
                  {ticket.status !== "resolved" && (
                    <Button size="sm" className="gap-1">
                      <Check className="h-4 w-4" /> Resolver
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}