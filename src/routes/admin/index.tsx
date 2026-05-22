import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
  head: () => ({ meta: [{ title: "Admin SaaS | TapTur" }] }),
});

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  CreditCard,
  DollarSign,
  Gift,
  Headphones,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export async function loader() {
  const [agencies, users, rifas, tickets, subscriptions] = await Promise.all([
    supabase.from("agencies").select("*").order("created_at", { ascending: false }),
    supabase.from("users").select("*").order("created_at", { ascending: false }),
    supabase.from("rifas").select("*").order("created_at", { ascending: false }),
    supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*").eq("status", "active"),
  ]);

  const mrr = subscriptions.data?.reduce((acc, s) => acc + (s.price || 0), 0) || 0;

  return {
    agencies: agencies.data || [],
    users: users.data || [],
    rifas: rifas.data || [],
    tickets: tickets.data || [],
    mrr,
  };
}

export function AdminDashboard({ useLoaderData }: { useLoaderData: typeof loader }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [agencies, users, rifas, tickets, subscriptions] = await Promise.all([
          supabase.from("agencies").select("*").order("created_at", { ascending: false }),
          supabase.from("users").select("*").order("created_at", { ascending: false }),
          supabase.from("rifas").select("*").order("created_at", { ascending: false }),
          supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
          supabase.from("subscriptions").select("*").eq("status", "active"),
        ]);

        const mrr = subscriptions.data?.reduce((acc: number, s: any) => acc + (s.price || 0), 0) || 0;

        setData({
          agencies: agencies.data || [],
          users: users.data || [],
          rifas: rifas.data || [],
          tickets: tickets.data || [],
          mrr,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Visão Geral</h1>
          <p className="mt-1 text-muted-foreground">Dados em tempo real do banco</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/seed">
            <Button variant="outline" size="sm">Criar Dados</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Agências</p>
                <p className="text-3xl font-bold">{data?.agencies?.length || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-3xl font-bold">{data?.users?.length || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MRR</p>
                <p className="text-3xl font-bold">R$ {data?.mrr || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                <CreditCard className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rifas</p>
                <p className="text-3xl font-bold">{data?.rifas?.length || 0}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                <Gift className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agências Recentes</CardTitle>
            <CardDescription>Últimas agências cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.agencies?.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma agência ainda.</p>
            ) : (
              <div className="space-y-3">
                {data?.agencies?.slice(0, 5).map((agency: any) => (
                  <div key={agency.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                        {agency.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{agency.name}</p>
                        <p className="text-sm text-muted-foreground">{agency.email}</p>
                      </div>
                    </div>
                    <Badge variant={agency.status === "active" ? "default" : "secondary"} className="capitalize">
                      {agency.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chamados de Suporte</CardTitle>
            <CardDescription>Tickets recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {data?.tickets?.length === 0 ? (
              <p className="text-muted-foreground">Nenhum ticket.</p>
            ) : (
              <div className="space-y-3">
                {data?.tickets?.slice(0, 5).map((ticket: any) => (
                  <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.agency_id || "Sistema"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ticket.priority === "high" || ticket.priority === "critical"
                          ? "destructive"
                          : ticket.status === "resolved"
                          ? "default"
                          : "outline"
                      }
                      className="capitalize"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}