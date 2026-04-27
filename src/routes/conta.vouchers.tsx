import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import { TRAVELER_BOOKINGS } from "@/data/traveler";
import { formatDate } from "@/data/trips";

export const Route = createFileRoute("/conta/vouchers")({
  component: VouchersPage,
});

function VouchersPage() {
  const active = TRAVELER_BOOKINGS.filter(
    (b) => b.status === "confirmed" || b.status === "pending",
  );
  const [openId, setOpenId] = useState<string | null>(active[0]?.id ?? null);
  const current = active.find((b) => b.id === openId) ?? active[0];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Vouchers
        </h1>
        <p className="mt-2 text-muted-foreground">
          Apresente o QR code ao embarcar. O agenciador escaneia e libera sua
          entrada.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {active.map((b) => {
            const isOpen = current?.id === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setOpenId(b.id)}
                className={
                  "w-full rounded-2xl border p-4 text-left transition-all " +
                  (isOpen
                    ? "border-accent bg-accent/5 ring-2 ring-accent/30"
                    : "border-border bg-surface hover:border-border-strong")
                }
              >
                <p className="text-xs font-mono text-muted-foreground">
                  {b.code}
                </p>
                <p className="mt-1 font-display text-base font-semibold">
                  {b.trip.destination}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(b.trip.departureDate)}
                </p>
              </button>
            );
          })}
        </div>

        {current && (
          <article className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
            {/* top */}
            <div className="border-b border-dashed border-border bg-foreground p-6 text-background">
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                Voucher TapTur
              </p>
              <p className="mt-3 font-display text-2xl font-semibold">
                {current.trip.destination}, {current.trip.state}
              </p>
              <p className="text-sm opacity-80">{current.trip.agency}</p>
            </div>

            {/* perforation */}
            <div className="relative h-4">
              <span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
              <span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-background" />
            </div>

            <div className="grid gap-6 p-6 md:grid-cols-[1fr_220px]">
              <div className="space-y-3 text-sm">
                <Row label="Código" value={current.code} mono />
                <Row
                  label="Embarque"
                  value={`${formatDate(current.trip.departureDate)} · ${current.trip.departureCity}`}
                />
                <Row label="Veículo" value={current.trip.vehicle} />
                <Row
                  label="Assentos"
                  value={
                    current.seats.length
                      ? current.seats
                          .map((n) => String(n).padStart(2, "0"))
                          .join(", ")
                      : "—"
                  }
                />
                {current.room && <Row label="Quarto" value={current.room} />}
                <Row
                  label="Passageiros"
                  value={`${current.passengers} pessoa${current.passengers > 1 ? "s" : ""}`}
                />
              </div>

              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-secondary p-5">
                <div className="rounded-2xl bg-surface p-3">
                  <QRCodeSVG
                    value={`https://taptur.app/v/${current.code}`}
                    size={160}
                    level="H"
                  />
                </div>
                <p className="font-mono text-xs tracking-widest text-muted-foreground">
                  {current.code}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border bg-secondary/40 p-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" /> Baixar PDF
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary"
              >
                <Share2 className="h-4 w-4" /> Compartilhar
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-dashed border-border pb-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span
        className={
          "text-right text-sm font-medium " + (mono ? "font-mono" : "")
        }
      >
        {value}
      </span>
    </div>
  );
}
