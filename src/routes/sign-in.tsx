import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
  head: () => ({ meta: [{ title: "Entrar | TapTur" }] }),
});

const ROLE_REDIRECT: Record<string, string> = {
  admin: "/admin",
  agency_owner: "/dashboard",
  agency_user: "/dashboard",
  affiliate: "/dashboard",
  customer: "/conta",
};

function getRedirectPath(role: string): string {
  return ROLE_REDIRECT[role] || "/conta";
}

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("email", session.user.email)
          .single();
        const role = userData?.role || "customer";
        window.location.href = getRedirectPath(role);
      }
    });
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("email", email)
      .single();

    const role = userData?.role || "customer";
    window.location.href = getRedirectPath(role);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="mx-auto max-w-md px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <h1 className="font-display text-3xl font-semibold">Entrar na sua conta</h1>
        <p className="mt-2 text-muted-foreground">Bem-vindo de volta!</p>

        <form onSubmit={handleSignIn} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error === "Invalid login credentials" 
                ? "Email ou senha incorretos." 
                : error}
            </div>
          )}

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
            <label className="text-sm font-medium">Senha</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-12"
                placeholder="••••••••"
                required
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
                <Loader2 className="h-4 w-4 animate-spin" /> Entrando...
              </span>
            ) : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/sign-up" className="text-primary hover:underline">
            Criar conta
          </Link>
        </p>
      </div>

      <Footer />
    </div>
  );
}