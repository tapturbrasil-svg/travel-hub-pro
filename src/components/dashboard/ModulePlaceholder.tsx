import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";

/** Placeholder reutilizável para módulos do dashboard. */
export function ModulePlaceholder({
  title,
  description,
  icon: Icon = Sparkles,
  children,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>

      {children ?? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-semibold">
            Em breve nesta agência
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Este módulo está sendo preparado. Em breve você poderá gerenciar
            tudo a partir daqui de forma centralizada e segura.
          </p>
        </div>
      )}
    </div>
  );
}
