import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { TRAVELER, formatBookingDate } from "@/data/traveler";

export const Route = createFileRoute("/conta/")({
  component: AccountPage,
});

function AccountPage() {
  const [form, setForm] = useState(TRAVELER);

  const update = (k: keyof typeof form, v: string) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Olá, {form.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cliente desde {formatBookingDate(form.memberSince)}.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold">Dados pessoais</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mantenha suas informações atualizadas para uma viagem tranquila.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Nome completo"
            value={form.name}
            onChange={(v) => update("name", v)}
          />
          <Field
            label="E-mail"
            value={form.email}
            onChange={(v) => update("email", v)}
            type="email"
          />
          <Field
            label="Telefone"
            value={form.phone}
            onChange={(v) => update("phone", v)}
          />
          <Field
            label="CPF"
            value={form.cpf}
            onChange={(v) => update("cpf", v)}
          />
          <Field
            label="Data de nascimento"
            value={form.birthDate}
            onChange={(v) => update("birthDate", v)}
            type="date"
          />
          <Field
            label="Cidade / UF"
            value={`${form.city} / ${form.state}`}
            onChange={() => {}}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:opacity-95"
          >
            <Save className="h-4 w-4" />
            Salvar alterações
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Segurança</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Altere sua senha e gerencie a autenticação em duas etapas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Alterar senha
          </button>
          <button
            type="button"
            className="rounded-2xl border border-border bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Ativar 2FA
          </button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </label>
  );
}
