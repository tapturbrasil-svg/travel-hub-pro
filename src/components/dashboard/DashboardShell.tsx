import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Plane,
  Users,
  Plus,
  Bell,
  ChevronLeft,
} from "lucide-react";
import { CURRENT_AGENCY_SLUG } from "@/data/dashboard";
import { getAgencyBySlug } from "@/data/agencies";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/dashboard", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/viagens", label: "Viagens", icon: Plane },
  { to: "/dashboard/passageiros", label: "Passageiros", icon: Users },
];

export function DashboardShell() {
  const agency = getAgencyBySlug(CURRENT_AGENCY_SLUG)!;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-surface-elevated">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-none border-r border-border bg-background lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-display text-sm font-bold">T</span>
            </div>
            <span className="font-display text-base font-semibold tracking-tight">
              TapTur
            </span>
          </Link>
        </div>

        <div className="border-b border-border px-4 py-5">
          <div className="flex items-center gap-3 rounded-2xl bg-surface-elevated p-3">
            <div
              className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ background: agency.brandColor }}
            >
              {agency.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{agency.name}</p>
              <p className="text-xs text-muted-foreground">Plano Pro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={
                  "mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:bg-surface-elevated hover:text-foreground")
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <Link
            to="/dashboard/viagens/nova"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Nova viagem
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar para o site
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-elevated"
              aria-label="Notificações"
            >
              <Bell className="h-4 w-4" />
            </button>
            <Link
              to="/agencia/$slug"
              params={{ slug: agency.slug }}
              className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-foreground hover:bg-surface-elevated"
            >
              Ver página pública
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
