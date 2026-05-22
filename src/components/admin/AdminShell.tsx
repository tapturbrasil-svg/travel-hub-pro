import { Link, Outlet } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  Headphones,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell,
  LogOut,
  Menu,
} from "lucide-react";

const LOGO_URL = "https://i.imgur.com/QtFXyTi.png";

const NAV = [
  { to: "/admin", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { to: "/admin/agencies", label: "Agências", icon: Building2 },
  { to: "/admin/users", label: "Usuários", icon: Users },
  { to: "/admin/subscriptions", label: "Assinaturas", icon: CreditCard },
  { to: "/admin/financial", label: "Financeiro", icon: BarChart3 },
  { to: "/admin/support", label: "Suporte", icon: Headphones },
  { to: "/admin/settings", label: "Configurações", icon: Settings },
];

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [pathname, setPathname] = useState("/admin");
  
  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-elevated">
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-background transition-all duration-300 ${
          collapsed ? "w-20" : "w-60"
        }`}
      >
        <div className={`flex h-16 items-center border-b border-border px-5 ${collapsed ? "justify-center" : ""}`}>
          <Link to="/" className="flex items-center gap-2">
            <img src={LOGO_URL} alt="TapTur" className={`${collapsed ? "h-8" : "h-9"} w-auto`} />
          </Link>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-auto mt-3 flex h-8 w-8 items-center justify-center rounded-full border bg-surface hover:bg-secondary"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {NAV.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`mt-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-foreground/70 hover:bg-surface-elevated hover:text-foreground"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? label : undefined}
              >
                <Icon className="h-5 w-5 flex-none" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            to="/"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-surface-elevated hover:text-foreground ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="h-5 w-5 flex-none" />
            {!collapsed && <span>Sair</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <button className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}