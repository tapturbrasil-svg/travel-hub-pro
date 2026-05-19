import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Download,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import supabase from "@/lib/supabase";

export const Route = createFileRoute("/admin/financial")({
  component: FinancialPage,
});

function FinancialPage() {
  const [period, setPeriod] = useState("12m");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMRR, setTotalMRR] = useState(0);
  const [totalAnnual, setTotalAnnual] = useState(0);
  const [avgTicket, setAvgTicket] = useState(0);
  const [paidAgencies, setPaidAgencies] = useState(0);
  const [planDistribution, setPlanDistribution] = useState<{ enterprise: number; professional: number; starter: number }>({ enterprise: 0, professional: 0, starter: 0 });

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const { data: mrrData } = await supabase
        .from("subscriptions")
        .select("price")
        .eq("status", "active");

      const { data: transactionsData } = await supabase
        .from("subscriptions")
        .select("*, agencies(name)")
        .order("created_at", { ascending: false });

      if (mrrData) {
        const mrr = mrrData.reduce((sum, sub) => sum + (sub.price || 0), 0);
        setTotalMRR(mrr);
        setTotalAnnual(mrr * 12);
        setPaidAgencies(mrrData.length);
        setAvgTicket(mrrData.length > 0 ? Math.round(mrr / mrrData.length) : 0);

        const enterprise = mrrData.filter(s => s.price >= 900).length;
        const professional = mrrData.filter(s => s.price >= 250 && s.price < 900).length;
        const starter = mrrData.filter(s => s.price < 250).length;
        setPlanDistribution({ enterprise, professional, starter });
      }

      if (transactionsData) {
        setTransactions(transactionsData);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Financeiro</h1>
          <p className="mt-1 text-muted-foreground">Visão geral das receitas e transações</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <DollarSign className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-2xl font-bold">R$ {totalMRR.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10">
                <TrendingUp className="h-7 w-7 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Anual</p>
                <p className="text-2xl font-bold">R$ {totalAnnual.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                <CreditCard className="h-7 w-7 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {avgTicket}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10">
                <Building2 className="h-7 w-7 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agências Pagas</p>
                <p className="text-2xl font-bold">{paidAgencies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Receita Mensal</CardTitle>
                <CardDescription>Evolução dos últimos 12 meses</CardDescription>
              </div>
              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList>
                  <TabsTrigger value="6m">6M</TabsTrigger>
                  <TabsTrigger value="12m">12M</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground">Carregando...</div>
            ) : (
              <>
                <div className="flex h-64 items-end gap-2">
                  <div className="group relative flex flex-1 flex-col items-center">
                    <div className="w-full rounded-t-lg bg-gradient-to-t from-primary to-primary/60 transition-all hover:from-primary/80" style={{ height: "100%" }} />
                    <div className="invisible absolute -top-10 z-10 rounded bg-surface px-2 py-1 text-xs shadow-lg group-hover:visible">
                      R$ {totalMRR.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>MRR Atual</span>
                  <span>R$ {totalMRR.toLocaleString()}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por Plano</CardTitle>
            <CardDescription>Distribuição atual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  Enterprise (R$ 997)
                </span>
                <span className="font-medium">R$ {planDistribution.enterprise * 997}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${paidAgencies > 0 ? (planDistribution.enterprise / paidAgencies) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-500" />
                  Professional (R$ 299)
                </span>
                <span className="font-medium">R$ {planDistribution.professional * 299}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-purple-500" style={{ width: `${paidAgencies > 0 ? (planDistribution.professional / paidAgencies) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-blue-500" />
                  Starter (R$ 99)
                </span>
                <span className="font-medium">R$ {planDistribution.starter * 99}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${paidAgencies > 0 ? (planDistribution.starter / paidAgencies) * 100 : 0}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas transações realizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Data</th>
                  <th className="pb-3 text-left font-medium">Agência</th>
                  <th className="pb-3 text-left font-medium">Descrição</th>
                  <th className="pb-3 text-right font-medium">Valor</th>
                  <th className="pb-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b">
                    <td className="py-3">{new Date(t.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 font-medium">{t.agencies?.name || "-"}</td>
                    <td className="py-3 text-muted-foreground">Assinatura {t.plan}</td>
                    <td className="py-3 text-right font-medium">R$ {t.price?.toLocaleString()}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          t.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {t.status === "active" ? "Ativo" : t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}