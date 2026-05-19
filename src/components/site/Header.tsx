import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, User, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const LOGO_URL = "https://i.imgur.com/QtFXyTi.png";

export function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            href="#destaques"
            className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
          >
            Destinos
          </a>
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
          ) : user ? (
            <Link
              to="/conta"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:shadow-card"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Minha conta</span>
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