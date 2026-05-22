import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Ticket,
  Tag,
  Sparkles,
  Plane,
  LogOut,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { supabase } from "@/lib/supabase";
import type { ReactNode } from "react";

const NAV: { to: string; label: string; icon: ReactNode }[] = [
  { to: "/conta", label: "Minha conta", icon: <UserIcon className="h-4 w-4" /> },
  { to: "/conta/viagens", label: "Minhas viagens", icon: <Plane className="h-4 w-4" /> },
  { to: "/conta/vouchers", label: "Vouchers", icon: <Ticket className="h-4 w-4" /> },
  { to: "/conta/descontos", label: "Descontos", icon: <Tag className="h-4 w-4" /> },
  { to: "/conta/rifas", label: "Rifas", icon: <Sparkles className="h-4 w-4" /> },
];

export function TravelerShell({ children }: { children?: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/sign-in", { replace: true });
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    }
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Usuário";
  const userEmail = user.email || "";
  const avatarInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-base font-semibold text-accent-foreground">
                  {avatarInitials}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-semibold">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {userEmail}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-secondary p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pontos TapTur
                </p>
                <p className="mt-1 font-display text-2xl font-semibold">
                  0
                </p>
              </div>

              <nav className="mt-6 space-y-1">
                {NAV.map((item) => {
                  const active =
                    location.pathname === item.to ||
                    (item.to !== "/conta" && location.pathname.startsWith(item.to));
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                        (active
                          ? "bg-foreground text-background"
                          : "text-foreground/70 hover:bg-secondary hover:text-foreground")
                      }
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          </aside>

          <main>{children ?? <Outlet />}</main>
        </div>
      </div>

      <Footer />
    </div>
  );
}