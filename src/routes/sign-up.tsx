import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
  head: () => ({ meta: [{ title: "Criar conta | TapTur" }] }),
});

type AccountType = "traveler" | "affiliate" | "establishment";

const ACCOUNT_TYPES: { value: AccountType; label: string; desc: string }[] = [
  { value: "traveler", label: "Viajante", desc: "Compre viagens e participe de rifas" },
  { value: "affiliate", label: "Afiliado", desc: "Divulgue e ganhe comissões" },
  { value: "establishment", label: "Estabelecimento", desc: "Gerencie sua agência de viagens" },
];

const ACCOUNT_ROLE: Record<AccountType, string> = {
  traveler: "customer",
  affiliate: "affiliate",
  establishment: "agency_owner",
};

function SignUpPage() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/conta", { replace: true });
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) return;
    
    setLoading(true);
    setError("");

    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          account_type: accountType,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const role = ACCOUNT_ROLE[accountType];

      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        name,
        email,
        phone,
        role,
        status: "active",
      });

      if (insertError) {
        console.error("Erro ao criar registro de usuário:", insertError);
      }

      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-md px-6 py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-semibold">Conta criada!</h1>
          <p className="mt-2 text-muted-foreground">
            Enviamos um link de confirmação para <strong>{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link
            to="/sign-in"
            className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Ir para Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="mx-auto max-w-lg px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <h1 className="font-display text-3xl font-semibold">Criar sua conta</h1>
        <p className="mt-2 text-muted-foreground">Junte-se à TapTur!</p>

        <form onSubmit={handleSignUp} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!accountType ? (
            <div>
              <label className="text-sm font-medium">Tipo de conta</label>
              <div className="mt-3 grid gap-3">
                {ACCOUNT_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.value}
                    onClick={() => setAccountType(type.value)}
                    className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4 text-left transition-all hover:border-primary hover:shadow-soft"
                  >
                    <div className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-muted-foreground">
                      <div className="h-2.5 w-2.5 rounded-full" />
                    </div>
                    <div>
                      <p className="font-semibold">{type.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{type.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                <span className="text-sm">
                  Conta: <strong>{ACCOUNT_TYPES.find(t => t.value === accountType)?.label}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setAccountType(null)}
                  className="text-xs text-primary hover:underline"
                >
                  Alterar
                </button>
              </div>

              <div>
                <label className="text-sm font-medium">Nome completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3"
                  placeholder="Seu nome"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-surface px-4 py-3"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Senha</label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-12"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Criando conta...
                  </span>
                ) : "Criar conta"}
              </button>
            </>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/sign-in" className="text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>

      <Footer />
    </div>
  );
}