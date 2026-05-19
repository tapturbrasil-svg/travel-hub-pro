import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/conta/")({
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/sign-in", { replace: true });
        return;
      }
      
      setUser(session.user);
      setForm({
        name: session.user.user_metadata?.name || "",
        email: session.user.email || "",
        phone: session.user.user_metadata?.phone || "",
      });
      setLoading(false);
    }
    loadUser();
  }, [navigate]);

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase.auth.updateUser({
      data: {
        name: form.name,
        phone: form.phone,
      },
    });

    setSaving(false);
    
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const name = form.name || form.email?.split("@")[0] || "Usuário";

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Olá, {name.split(" ")[0]} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie seus dados pessoais.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold">Dados pessoais</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Mantenha suas informações atualizadas para uma viagem tranquilo.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Nome completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input
              type="email"
              value={form.email}
              disabled
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 opacity-60"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3"
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : saved ? (
              "Salvo!"
            ) : (
              <>
                <Save className="h-4 w-4" /> Salvar alterações
              </>
            )}
          </button>
          {saved && (
            <span className="text-sm text-success">Dados salvos com sucesso!</span>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-surface p-8 shadow-soft">
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold">Segurança</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie sua senha e configurações de segurança.
          </p>
        </div>

        <button
          onClick={() => navigate("/sign-in")}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-medium"
        >
          Alterar senha
        </button>
      </section>
    </div>
  );
}