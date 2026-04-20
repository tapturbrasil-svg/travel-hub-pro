import { MapPin, Calendar, Users, Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-2 shadow-floating">
      <div className="grid grid-cols-1 gap-1 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <Field icon={<MapPin className="h-4 w-4" />} label="Destino" value="Para onde?" />
        <Field icon={<Calendar className="h-4 w-4" />} label="Quando" value="Selecione a data" />
        <Field icon={<Users className="h-4 w-4" />} label="Viajantes" value="2 adultos" />
        <button
          type="button"
          className="flex h-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-soft transition-all hover:opacity-95 active:scale-[0.98]"
        >
          <Search className="h-4 w-4" />
          <span>Buscar</span>
        </button>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <button
      type="button"
      className="group flex items-center gap-3 rounded-2xl px-5 py-3 text-left transition-colors hover:bg-secondary"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground/70 transition-colors group-hover:bg-surface">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </button>
  );
}
