import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Ban,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agencyService } from "@/lib/supabase";

export const Route = createFileRoute("/admin/agencies")({
  component: AgenciesPage,
});

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  starter: "bg-blue-100 text-blue-600",
  professional: "bg-purple-100 text-purple-600",
  enterprise: "bg-amber-100 text-amber-600",
};

function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgencies() {
      try {
        setLoading(true);
        const data = await agencyService.getAll();
        setAgencies(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAgencies();
  }, []);

  const filtered = agencies.filter(
    (a) =>
      !search ||
      a.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase()) ||
      a.slug?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: filtered.length,
    active: filtered.filter((a) => a.status === "active").length,
    revenue: filtered.reduce((acc, a) => acc + (a.revenue || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Agências</h1>
          <p className="mt-1 text-muted-foreground">
            {stats.total} agências • {stats.active} ativas
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Nova Agência
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Nenhuma agência encontrada.</p>
              <Button className="mt-4 gap-2">
                <Plus className="h-4 w-4" /> Criar primeira agência
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-3 text-left font-medium">Agência</th>
                    <th className="pb-3 text-left font-medium">Plano</th>
                    <th className="pb-3 text-left font-medium">Status</th>
                    <th className="pb-3 text-left font-medium">Criada em</th>
                    <th className="pb-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((agency) => (
                    <tr key={agency.id} className="border-b hover:bg-surface-elevated/50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                            {agency.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{agency.name}</p>
                            <p className="text-xs text-muted-foreground">@{agency.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge className={`capitalize ${PLAN_COLORS[agency.plan] || ""}`}>
                          {agency.plan || "free"}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge
                          variant={
                            agency.status === "active"
                              ? "default"
                              : agency.status === "pending"
                              ? "outline"
                              : "destructive"
                          }
                          className="capitalize"
                        >
                          {agency.status === "active" ? (
                            <Check className="mr-1 h-3 w-3" />
                          ) : agency.status === "suspended" ? (
                            <Ban className="mr-1 h-3 w-3" />
                          ) : null}
                          {agency.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-muted-foreground">
                        {agency.created_at
                          ? new Date(agency.created_at).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          {agency.status === "active" ? (
                            <Button variant="ghost" size="icon">
                              <Ban className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon">
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}