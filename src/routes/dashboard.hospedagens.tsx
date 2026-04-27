import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BedSingle,
  BedDouble,
  Users,
  Crown,
  AlignJustify,
  ArrowUpDown,
  StretchHorizontal,
  ConciergeBell,
  Coffee,
  Gamepad2,
  MousePointer2,
  Eraser,
  Plus,
  Save,
  Upload,
  Download,
  FolderOpen,
  Building2,
  X,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/hospedagens")({
  component: HotelEditorPage,
  head: () => ({ meta: [{ title: "Editor de Hotel | TapTur" }] }),
});

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

type CellType =
  | "empty"
  | "single"
  | "double"
  | "triple"
  | "quad"
  | "suite"
  | "corridor"
  | "elevator"
  | "stairs"
  | "reception"
  | "lounge"
  | "games";

type Cell = { type: CellType; label?: string };

type Floor = {
  id: string;
  name: string;
  cols: number;
  rows: number;
  cells: Cell[];
  /** primeiro número de quarto deste andar */
  startNumber: number;
};

const TOOLS: {
  id: CellType;
  label: string;
  icon: typeof BedSingle;
  isRoom: boolean;
  capacity?: number;
  bg: string;
  border: string;
  text: string;
}[] = [
  { id: "single", label: "Single", icon: BedSingle, isRoom: true, capacity: 1, bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
  { id: "double", label: "Duplo", icon: BedDouble, isRoom: true, capacity: 2, bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800" },
  { id: "triple", label: "Triplo", icon: Users, isRoom: true, capacity: 3, bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-800" },
  { id: "quad", label: "Quádruplo", icon: Users, isRoom: true, capacity: 4, bg: "bg-emerald-200", border: "border-emerald-400", text: "text-emerald-900" },
  { id: "suite", label: "Suíte", icon: Crown, isRoom: true, capacity: 2, bg: "bg-amber-100", border: "border-amber-300", text: "text-amber-800" },
  { id: "corridor", label: "Corredor", icon: StretchHorizontal, isRoom: false, bg: "bg-slate-100", border: "border-slate-200", text: "text-slate-600" },
  { id: "elevator", label: "Elevador", icon: ArrowUpDown, isRoom: false, bg: "bg-slate-200", border: "border-slate-300", text: "text-slate-700" },
  { id: "stairs", label: "Escada", icon: AlignJustify, isRoom: false, bg: "bg-slate-200", border: "border-slate-300", text: "text-slate-700" },
  { id: "reception", label: "Recepção", icon: ConciergeBell, isRoom: false, bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-700" },
  { id: "lounge", label: "Sala de Espera", icon: Coffee, isRoom: false, bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-700" },
  { id: "games", label: "Sala de Jogos", icon: Gamepad2, isRoom: false, bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-700" },
];

function emptyFloor(name: string, cols = 6, rows = 4, startNumber = 101): Floor {
  return {
    id: crypto.randomUUID(),
    name,
    cols,
    rows,
    cells: Array.from({ length: cols * rows }, () => ({ type: "empty" })),
    startNumber,
  };
}

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

function HotelEditorPage() {
  const [hotelName, setHotelName] = useState("Novo Hotel");
  const [hotelId] = useState(() => "HTL-" + Math.random().toString(36).slice(2, 8).toUpperCase());
  const [floors, setFloors] = useState<Floor[]>([emptyFloor("1º")]);
  const [activeFloorId, setActiveFloorId] = useState(floors[0].id);
  const [tool, setTool] = useState<CellType | "select" | "erase">("double");

  const activeFloor = floors.find((f) => f.id === activeFloorId)!;
  const activeIdx = floors.findIndex((f) => f.id === activeFloorId);

  /** Numera dinamicamente os quartos (em ordem de leitura: linha por linha). */
  const roomNumbers = useMemo(() => {
    const numbers: (number | null)[] = [];
    let n = activeFloor.startNumber;
    activeFloor.cells.forEach((c) => {
      if (TOOLS.find((t) => t.id === c.type)?.isRoom) {
        numbers.push(n++);
      } else {
        numbers.push(null);
      }
    });
    return numbers;
  }, [activeFloor]);

  const totalRooms = roomNumbers.filter((n) => n !== null).length;

  const updateFloor = (patch: Partial<Floor>) => {
    setFloors((prev) =>
      prev.map((f) => (f.id === activeFloorId ? { ...f, ...patch } : f)),
    );
  };

  const setCell = (idx: number, type: CellType) => {
    const cells = [...activeFloor.cells];
    cells[idx] = { type };
    updateFloor({ cells });
  };

  const handleCellClick = (idx: number) => {
    if (tool === "select") return;
    if (tool === "erase") {
      setCell(idx, "empty");
      return;
    }
    setCell(idx, tool);
  };

  const resizeFloor = (cols: number, rows: number) => {
    const next: Cell[] = Array.from({ length: cols * rows }, () => ({ type: "empty" as CellType }));
    // copiar células existentes
    for (let r = 0; r < Math.min(rows, activeFloor.rows); r++) {
      for (let c = 0; c < Math.min(cols, activeFloor.cols); c++) {
        next[r * cols + c] = activeFloor.cells[r * activeFloor.cols + c];
      }
    }
    updateFloor({ cols, rows, cells: next });
  };

  const addFloor = () => {
    const num = floors.length + 1;
    const next = emptyFloor(`${num}º`, activeFloor.cols, activeFloor.rows, 100 * num + 1);
    setFloors([...floors, next]);
    setActiveFloorId(next.id);
  };

  const removeFloor = (id: string) => {
    if (floors.length <= 1) return;
    const next = floors.filter((f) => f.id !== id);
    setFloors(next);
    if (id === activeFloorId) setActiveFloorId(next[0].id);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-surface-elevated">
      {/* Toolbar superior */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-accent/10 px-3 py-2 text-accent">
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-semibold">Editor de Hotel</span>
        </div>

        <input
          type="text"
          value={hotelName}
          onChange={(e) => setHotelName(e.target.value)}
          className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>ID:</span>
          <code className="rounded bg-secondary px-2 py-1 font-mono">{hotelId}</code>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ToolbarButton icon={Upload} label="Importar" />
          <ToolbarButton icon={Download} label="Exportar" />
          <ToolbarButton icon={FolderOpen} label="Carregar" />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground hover:opacity-95"
          >
            <Save className="h-3.5 w-3.5" />
            Salvar
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de ferramentas */}
        <aside className="flex w-64 flex-none flex-col overflow-y-auto border-r border-border bg-background">
          <h3 className="px-4 pt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Ferramentas
          </h3>
          <div className="grid grid-cols-2 gap-2 p-3">
            <ToolButton
              active={tool === "select"}
              onClick={() => setTool("select")}
              icon={MousePointer2}
              label="Selecionar"
              tone="bg-secondary border-border text-foreground"
            />
            {TOOLS.map((t) => (
              <ToolButton
                key={t.id}
                active={tool === t.id}
                onClick={() => setTool(t.id)}
                icon={t.icon}
                label={t.label}
                badge={t.capacity ? `×${t.capacity}` : undefined}
                tone={`${t.bg} ${t.border} ${t.text}`}
              />
            ))}
            <ToolButton
              active={tool === "erase"}
              onClick={() => setTool("erase")}
              icon={Eraser}
              label="Apagar"
              tone="bg-rose-50 border-rose-200 text-rose-700"
            />
          </div>

          <p className="mx-4 mb-3 rounded-lg bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground">
            💡 Clique numa célula para aplicar a ferramenta selecionada.
          </p>

          {/* Andares */}
          <div className="mt-2 border-t border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Andares
              </h3>
              <button
                type="button"
                onClick={addFloor}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
                aria-label="Adicionar andar"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {floors.map((f) => (
                <div key={f.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => setActiveFloorId(f.id)}
                    className={
                      "rounded-lg px-3 py-1.5 text-xs font-semibold " +
                      (f.id === activeFloorId
                        ? "bg-accent text-accent-foreground"
                        : "bg-secondary text-foreground hover:bg-surface-elevated")
                    }
                  >
                    {f.name}
                  </button>
                  {floors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFloor(f.id)}
                      className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-white group-hover:flex"
                      aria-label="Remover andar"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dimensões */}
          <div className="border-t border-border px-4 py-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Dimensões — {activeFloor.name} andar
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <NumberInput
                label="Colunas"
                value={activeFloor.cols}
                min={2}
                max={12}
                onChange={(v) => resizeFloor(v, activeFloor.rows)}
              />
              <NumberInput
                label="Fileiras"
                value={activeFloor.rows}
                min={1}
                max={10}
                onChange={(v) => resizeFloor(activeFloor.cols, v)}
              />
            </div>
          </div>

          {/* Numeração */}
          <div className="border-t border-border px-4 py-3">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Renumerar — {activeFloor.name} andar
            </h3>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {totalRooms} quarto(s). Define o número inicial e renumera em
              ordem (linha a linha).
            </p>
            <NumberInput
              label="Início"
              value={activeFloor.startNumber}
              min={1}
              max={9999}
              onChange={(v) => updateFloor({ startNumber: v })}
            />
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex flex-1 flex-col overflow-auto bg-surface-elevated p-8">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
                🏢 {activeFloor.name} Andar
              </span>
              <span className="text-xs text-muted-foreground">
                {activeFloor.cols} col × {activeFloor.rows} fil · {totalRooms}{" "}
                quartos
              </span>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-border bg-background p-6 shadow-soft">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${activeFloor.cols}, minmax(0, 1fr))`,
                }}
              >
                {activeFloor.cells.map((cell, i) => {
                  const def = TOOLS.find((t) => t.id === cell.type);
                  const num = roomNumbers[i];
                  const isEmpty = cell.type === "empty";
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCellClick(i)}
                      className={
                        "aspect-square rounded-xl border-2 transition-all hover:scale-[1.03] " +
                        (isEmpty
                          ? "border-dashed border-border bg-surface hover:border-accent"
                          : `${def?.bg} ${def?.border} ${def?.text} shadow-soft`)
                      }
                      title={def?.label ?? "Vazio"}
                    >
                      {!isEmpty && def && (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                          <def.icon className="h-5 w-5" />
                          {num !== null && def.isRoom ? (
                            <span className="text-[11px] font-bold">{num}</span>
                          ) : (
                            <span className="text-[9px] font-semibold uppercase">
                              {def.label}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumo */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {TOOLS.filter((t) => t.isRoom).map((t) => {
                const count = activeFloor.cells.filter(
                  (c) => c.type === t.id,
                ).length;
                return (
                  <div
                    key={t.id}
                    className="rounded-xl border border-border bg-background p-3"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${t.bg} ${t.text}`}
                      >
                        <t.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium">{t.label}</span>
                    </div>
                    <p className="mt-2 font-display text-lg font-bold">
                      {count}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {count * (t.capacity ?? 0)} hóspede
                      {count * (t.capacity ?? 0) === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Andar atual: <strong>{activeFloor.name}</strong> · Total de
              andares: {floors.length} · Andar #{activeIdx + 1}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* UI bits                                                             */
/* ------------------------------------------------------------------ */

function ToolbarButton({
  icon: Icon,
  label,
}: {
  icon: typeof Save;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-surface-elevated"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ToolButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof BedSingle;
  label: string;
  badge?: string;
  tone: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative flex flex-col items-center gap-1 rounded-xl border p-3 text-[11px] font-semibold transition-all " +
        tone +
        (active ? " ring-2 ring-accent ring-offset-2 ring-offset-background" : " hover:scale-[1.02]")
      }
    >
      {badge && (
        <span className="absolute right-1.5 top-1.5 text-[9px] font-bold opacity-70">
          {badge}
        </span>
      )}
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function NumberInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v) && v >= min && v <= max) onChange(v);
        }}
        className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}
