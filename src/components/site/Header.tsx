import { Link } from "@tanstack/react-router";
import { Search, User } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="font-display text-lg font-bold">T</span>
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-foreground">
            TapTur
          </span>
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
          <Link
            to="/conta"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-soft transition-all hover:shadow-card"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Minha conta</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
