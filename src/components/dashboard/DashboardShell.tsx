import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Plane,
  Users,
  Plus,
  Bell,
  ChevronLeft,
  Ticket,
  Wallet,
  Truck,
  Building2,
  MapPin,
  Gift,
  BarChart3,
  UserPlus,
  Palette,
  UserCog,
  Settings,
  LogOut,
} from "lucide-react";
import { CURRENT_AGENCY_SLUG } from "@/data/dashboard";
import { getAgencyBySlug } from "@/data/agencies";

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/viagens", label: "Viagens", icon: Plane },
  { to: "/dashboard/reservas", label: "Reservas", icon: Ticket },
  { to: "/dashboard/passageiros", label: "Passageiros", icon: Users },
  { to: "/dashboard/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/dashboard/translados", label: "Translados", icon: Truck },
  { to: "/dashboard/hospedagens", label: "Hospedagens", icon: Building2 },
  { to: "/dashboard/itinerarios", label: "Itinerários", icon: MapPin },
  { to: "/dashboard/rifas", label: "Rifas", icon: Gift },
  { to: "/dashboard/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/dashboard/leads", label: "Leads", icon: UserPlus },
  { to: "/dashboard/landing-page", label: "Landing Page", icon: Palette },
  { to: "/dashboard/usuarios", label: "Usuários", icon: UserCog },
  { to: "/dashboard/configuracoes", label: "Configurações", icon: Settings },
];

export function DashboardShell() {
  const agency = getAgencyBySlug(CURRENT_AGENCY_SLUG)!;
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen bg-surface-elevated">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-none flex-col border-r border-border bg-background lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <span className="font-display text-base font-bold">T</span>
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              TapTur
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={
                  "mt-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/70 hover:bg-surface-elevated hover:text-foreground")
                }
              >
                <Icon className="h-4 w-4 flex-none" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-surface-elevated p-3">
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: agency.brandColor }}
            >
              {agency.initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">{agency.name}</p>
              <p className="text-[11px] text-muted-foreground">Plano Pro</p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
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
            <Link
              to="/dashboard/viagens/nova"
              className="hidden items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-95 sm:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" /> Nova viagem
            </Link>
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
