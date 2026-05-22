import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, User, Loader2, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase";

const LOGO_URL = "https://i.imgur.com/QtFXyTi.png";

const ROLE_REDIRECT: Record<string, { label: string; href: string }> = {
  admin: { label: "Admin", href: "/admin" },
  agency_owner: { label: "Dashboard", href: "/dashboard" },
  agency_user: { label: "Dashboard", href: "/dashboard" },
  affiliate: { label: "Dashboard", href: "/dashboard" },
  customer: { label: "Minha conta", href: "/conta" },
};

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("email", session.user.email)
          .single();
        setUserRole(userData?.role || "customer");
      }
      
      setLoading(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("email", session.user.email)
          .single();
        setUserRole(userData?.role || "customer");
      } else {
        setUserRole("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const accountInfo = userRole ? ROLE_REDIRECT[userRole] || ROLE_REDIRECT.customer : null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
        <Link to="/" className="flex items-center gap-2">
          <img src={LOGO_URL} alt="TapTur" className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Viagens
          </Link>
          <a
            href="#agencias"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Agências
          </a>
          <a
            href="#sobre"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Sobre
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Buscar"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-secondary hover:text-foreground md:inline-flex"
          >
            <Search className="h-4 w-4" />
          </button>
          
          {loading ? (
            <div className="flex h-10 items-center justify-center rounded-full border border-border bg-surface px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : accountInfo ? (
            <Link
              to={accountInfo.href}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:shadow-card"
            >
              {userRole === "admin" || userRole === "agency_owner" || userRole === "agency_user" || userRole === "affiliate"
                ? <LayoutDashboard className="h-4 w-4" />
                : <User className="h-4 w-4" />
              }
              <span className="hidden sm:inline">{accountInfo.label}</span>
            </Link>
          ) : (
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:shadow-card"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}