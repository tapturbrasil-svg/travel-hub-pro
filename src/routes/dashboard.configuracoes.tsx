import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Globe,
  Mail,
  Smartphone,
  Key,
  Save,
  Upload,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { CURRENT_AGENCY_SLUG } from "@/data/dashboard";

export const Route = createFileRoute("/dashboard/configuracoes")({
  component: ConfiguracoesPage,
  head: () => ({ meta: [{ title: "Configurações | TapTur" }] }),
});

function ConfiguracoesPage() {
  const [agency, setAgency] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgency() {
      const { data, error } = await supabase
        .from("agencies")
        .select("*")
        .eq("slug", CURRENT_AGENCY_SLUG)
        .single();

      if (data && !error) {
        setAgency(data);
      }
      setLoading(false);
    }
    loadAgency();
  }, []);

  const [companyData, setCompanyData] = useState({
    name: "",
    tagline: "",
    description: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    whatsapp: "",
    instagram: "",
    website: "",
  });

  useEffect(() => {
    if (agency) {
      setCompanyData({
        name: agency.name || "",
        tagline: agency.tagline || "",
        description: agency.description || "",
        city: agency.city || "",
        state: agency.state || "",
        phone: agency.phone || "",
        email: agency.email || "",
        whatsapp: agency.whatsapp || "",
        instagram: agency.instagram || "",
        website: agency.website || "",
      });
    }
  }, [agency]);

  const [integrations, setIntegrations] = useState({
    mercadoPago: true,
    pix: true,
    cartaoCredito: true,
    cielo: false,
    pagSeguro: false,
  });

  const [notifications, setNotifications] = useState({
    emailReserva: true,
    emailPagamento: true,
    emailConfirmação: true,
    whatsappReserva: true,
    whatsappPagamento: true,
    smsLembrete: false,
  });

  const handleSave = async () => {
    const { error } = await supabase
      .from("agencies")
      .update(companyData)
      .eq("slug", CURRENT_AGENCY_SLUG);

    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (loading || !agency) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-muted" />
          <div className="h-64 rounded-3xl bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="mt-2 text-muted-foreground">
          Dados da empresa, integrações de pagamento, e-mail e preferências gerais.
        </p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="h-4 w-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="gap-2">
            <CreditCard className="h-4 w-4" /> Pagamentos
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="h-4 w-4" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="gap-2">
            <Shield className="h-4 w-4" /> Segurança
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="gap-2">
            <Globe className="h-4 w-4" /> Integrações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">Dados da Empresa</h2>

            <div className="mb-6 flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary text-2xl font-bold">
                  {agency.initials}
                </div>
                <button className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow">
                  <Upload className="h-4 w-4" />
                </button>
              </div>
              <div>
                <p className="font-medium">Logo da empresa</p>
                <p className="text-sm text-muted-foreground">PNG ou JPG, máximo 2MB</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>Nome da empresa</Label>
                <Input
                  value={companyData.name}
                  onChange={(e) => setCompanyData((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Tagline</Label>
                <Input
                  value={companyData.tagline}
                  onChange={(e) => setCompanyData((d) => ({ ...d, tagline: e.target.value }))}
                  placeholder="Uma frase que representa sua marca"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Descrição</Label>
                <Textarea
                  value={companyData.description}
                  onChange={(e) => setCompanyData((d) => ({ ...d, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={companyData.city}
                  onChange={(e) => setCompanyData((d) => ({ ...d, city: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input
                  value={companyData.state}
                  onChange={(e) => setCompanyData((d) => ({ ...d, state: e.target.value }))}
                  maxLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={companyData.phone}
                  onChange={(e) => setCompanyData((d) => ({ ...d, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData((d) => ({ ...d, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={companyData.whatsapp}
                  onChange={(e) => setCompanyData((d) => ({ ...d, whatsapp: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={companyData.instagram}
                  onChange={(e) => setCompanyData((d) => ({ ...d, instagram: e.target.value }))}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} className="gap-2">
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Salvo!" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-6">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">Formas de Pagamento</h2>

            <div className="space-y-4">
              <PaymentToggle
                label="PIX"
                description="Receba via PIX instantâneo"
                icon={Smartphone}
                enabled={integrations.pix}
                onChange={(v) => setIntegrations((i) => ({ ...i, pix: v }))}
              />
              <Separator />
              <PaymentToggle
                label="Cartão de Crédito"
                description="Parcele em até 12x"
                icon={CreditCard}
                enabled={integrations.cartaoCredito}
                onChange={(v) => setIntegrations((i) => ({ ...i, cartaoCredito: v }))}
              />
              <Separator />
              <PaymentToggle
                label="MercadoPago"
                description="Integração completa com MercadoPago"
                icon={Globe}
                enabled={integrations.mercadoPago}
                onChange={(v) => setIntegrations((i) => ({ ...i, mercadoPago: v }))}
              />
              <Separator />
              <PaymentToggle
                label="Cielo"
                description="Processamento de cartão via Cielo"
                icon={CreditCard}
                enabled={integrations.cielo}
                onChange={(v) => setIntegrations((i) => ({ ...i, cielo: v }))}
              />
              <Separator />
              <PaymentToggle
                label="PagSeguro"
                description="Integração com PagSeguro/UOL"
                icon={CreditCard}
                enabled={integrations.pagSeguro}
                onChange={(v) => setIntegrations((i) => ({ ...i, pagSeguro: v }))}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">Taxas e Comissões</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Taxa PIX (%)</Label>
                <Input type="number" defaultValue="1.2" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Taxa Cartão (%)</Label>
                <Input type="number" defaultValue="3.5" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Comissão plataforma (%)</Label>
                <Input type="number" defaultValue="5" step="0.5" />
              </div>
              <div className="space-y-2">
                <Label>Juros parcelamento (%)</Label>
                <Input type="number" defaultValue="0" step="0.5" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} className="gap-2">
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Salvo!" : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">Notificações por E-mail</h2>

            <div className="space-y-4">
              <NotificationToggle
                label="Nova reserva"
                description="Quando um cliente fizer uma nova reserva"
                enabled={notifications.emailReserva}
                onChange={(v) => setNotifications((n) => ({ ...n, emailReserva: v }))}
              />
              <Separator />
              <NotificationToggle
                label="Pagamento confirmado"
                description="Quando um pagamento for aprovado"
                enabled={notifications.emailPagamento}
                onChange={(v) => setNotifications((n) => ({ ...n, emailPagamento: v }))}
              />
              <Separator />
              <NotificationToggle
                label="Confirmação de viagem"
                description="3 dias antes da viagem"
                enabled={notifications.emailConfirmação}
                onChange={(v) => setNotifications((n) => ({ ...n, emailConfirmação: v }))}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">Notificações WhatsApp</h2>

            <div className="space-y-4">
              <NotificationToggle
                label="Nova reserva"
                description="Enviar mensagem quando criar reserva"
                enabled={notifications.whatsappReserva}
                onChange={(v) => setNotifications((n) => ({ ...n, whatsappReserva: v }))}
              />
              <Separator />
              <NotificationToggle
                label="Pagamento confirmado"
                description="Enviar comprovante via WhatsApp"
                enabled={notifications.whatsappPagamento}
                onChange={(v) => setNotifications((n) => ({ ...n, whatsappPagamento: v }))}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface-elevated p-4">
              <Key className="mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">Webhook WhatsApp Business</p>
              <p className="mt-1 text-sm text-muted-foreground">Configure o webhook para receber mensagens</p>
              <Input className="mt-3 font-mono text-sm" placeholder="https://api.whatsapp.com/webhook..." />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seguranca" className="space-y-6">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">Segurança da Conta</h2>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Autenticação em duas etapas (2FA)</p>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Button variant="outline">Ativar</Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alterar senha</p>
                    <p className="text-sm text-muted-foreground">Última alteração há 30 dias</p>
                  </div>
                  <Button variant="outline">Alterar</Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sessões ativas</p>
                    <p className="text-sm text-muted-foreground">2 dispositivos conectados</p>
                  </div>
                  <Button variant="outline">Gerenciar</Button>
                </div>
              </div>

              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                <p className="font-medium text-destructive">Zona de perigo</p>
                <p className="mt-1 text-sm text-muted-foreground">Ações irreversíveis. Tenha cuidado.</p>
                <Button variant="destructive" className="mt-4">
                  Excluir conta
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="integracoes" className="space-y-6">
          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">API e Webhooks</h2>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">API Key</p>
                    <p className="text-sm text-muted-foreground">Use para integrações via API</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Mostrar</Button>
                    <Button variant="outline" size="sm">Regenerar</Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    readOnly
                    value="sk_live_xxxxxxxxxxxxxxxxxxxx"
                    className="font-mono text-sm"
                  />
                  <Button variant="ghost" size="icon">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <p className="font-medium">Webhook para reservas</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Receba notificações em tempo real quando houver mudanças
                </p>
                <Input
                  className="mt-3 font-mono text-sm"
                  placeholder="https://seu-sistema.com/webhook/reservas"
                />
              </div>

              <div className="rounded-2xl border border-border p-4">
                <p className="font-medium">Webhook para pagamentos</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Receba confirmações de pagamento automaticamente
                </p>
                <Input
                  className="mt-3 font-mono text-sm"
                  placeholder="https://seu-sistema.com/webhook/pagamentos"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} className="gap-2">
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saved ? "Salvo!" : "Salvar alterações"}
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-background p-6">
            <h2 className="mb-6 font-display text-xl font-semibold">Integrações Disponíveis</h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <IntegrationCard name="MercadoPago" status="connected" />
              <IntegrationCard name="WhatsApp Business" status="connected" />
              <IntegrationCard name="Hotmart" status="available" />
              <IntegrationCard name="Eduzz" status="available" />
              <IntegrationCard name="Telegram" status="available" />
              <IntegrationCard name="Zapier" status="available" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentToggle({
  label,
  description,
  icon: Icon,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  icon: typeof CreditCard;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}

function IntegrationCard({ name, status }: { name: string; status: "connected" | "available" }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border p-4">
      <div>
        <p className="font-medium">{name}</p>
        <Badge
          className={
            status === "connected"
              ? "bg-success/10 text-success"
              : "bg-secondary text-muted-foreground"
          }
        >
          {status === "connected" ? "Conectado" : "Disponível"}
        </Badge>
      </div>
      <Button variant={status === "connected" ? "outline" : "default"} size="sm">
        {status === "connected" ? "Configurar" : "Conectar"}
      </Button>
    </div>
  );
}