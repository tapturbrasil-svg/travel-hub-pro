import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Palette,
  Upload,
  Image,
  Type,
  Eye,
  Save,
  Check,
  Plus,
  Trash2,
  GripVertical,
  Monitor,
  Smartphone,
  RefreshCw,
  Copy,
  ExternalLink,
  Sun,
  Moon,
  Globe,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getAgencyBySlug } from "@/data/agencies";
import { CURRENT_AGENCY_SLUG } from "@/data/dashboard";

export const Route = createFileRoute("/dashboard/landing-page")({
  component: LandingPageEditor,
  head: () => ({ meta: [{ title: "Landing Page | TapTur" }] }),
});

type Banner = {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  active: boolean;
};

type ColorTheme = {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
};

function LandingPageEditor() {
  const agency = getAgencyBySlug(CURRENT_AGENCY_SLUG)!;
  const [saved, setSaved] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  const [theme, setTheme] = useState<ColorTheme>({
    primary: agency.brandColor,
    accent: "oklch(0.66 0.18 28)",
    background: "oklch(0.992 0.003 80)",
    surface: "oklch(1 0 0)",
    text: "oklch(0.18 0.015 250)",
    muted: "oklch(0.5 0.012 250)",
  });

  const [heroConfig, setHeroConfig] = useState({
    title: "Viaje para lugares que mudam tudo.",
    subtitle: "Descubra viagens em grupo e excursões com as agências mais confiáveis do país.",
    ctaText: "Ver viagens",
    ctaLink: "/viagens",
    showSearch: true,
    heroImage: "/hero-beach.jpg",
    parallaxEffect: true,
    parallaxSpeed: 0.5,
  });

  const [banners, setBanners] = useState<Banner[]>([
    {
      id: "b1",
      image: "/banner-1.jpg",
      title: "Porto Seguro",
      subtitle: "5 noites all inclusive",
      ctaText: "Reservar",
      ctaLink: "/viagem/porto-seguro-bahia",
      active: true,
    },
    {
      id: "b2",
      image: "/banner-2.jpg",
      title: "Gramado",
      subtitle: "4 noites com café colonial",
      ctaText: "Ver detalhes",
      ctaLink: "/viagem/serra-gaucha-encantada",
      active: true,
    },
    {
      id: "b3",
      image: "/banner-3.jpg",
      title: "Maceió",
      subtitle: "Pensão completa",
      ctaText: "Reservar",
      ctaLink: "/viagem/maceio-aguas-cristalinas",
      active: false,
    },
  ]);

  const [brandConfig, setBrandConfig] = useState({
    logo: "",
    logoText: agency.name,
    favicon: "",
    metaTitle: "TapTur — Viagens e excursões com as melhores agências do Brasil",
    metaDescription: "Encontre e reserve viagens em grupo, excursões e pacotes com agências de confiança.",
    ogImage: "/og-image.jpg",
  });

  const [features, setFeatures] = useState({
    showBenefits: true,
    benefits: [
      { icon: Shield, title: "Agências verificadas", description: "Seu dinheiro e sua viagem estão sempre seguros." },
      { icon: Globe, title: "Escolha seu assento", description: "Mapa de assentos em tempo real." },
      { icon: Smartphone, title: "Suporte humano", description: "Atendimento 7 dias por semana." },
    ],
    showTestimonials: true,
    showFAQ: true,
  });

  const [footerConfig, setFooterConfig] = useState({
    aboutText: "Há mais de 15 anos criando experiências únicas pelo Brasil. Especialistas em excursões em grupo.",
    phone: "(11) 98765-4321",
    email: "contato@agencia.com",
    whatsapp: "5511987654321",
    instagram: "@agencia",
    facebook: "facebook.com/agencia",
    address: "São Paulo, SP",
    showTerms: true,
    showPrivacy: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleColorChange = (key: keyof ColorTheme, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Landing Page</h1>
            <p className="mt-2 text-muted-foreground">
              Personalize cores, logo, banners e textos da página pública da agência.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-border">
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm ${previewMode === "desktop" ? "bg-secondary" : ""}`}
                onClick={() => setPreviewMode("desktop")}
              >
                <Monitor className="h-4 w-4" />
                Desktop
              </button>
              <button
                className={`flex items-center gap-1 px-3 py-2 text-sm ${previewMode === "mobile" ? "bg-secondary" : ""}`}
                onClick={() => setPreviewMode("mobile")}
              >
                <Smartphone className="h-4 w-4" />
                Mobile
              </button>
            </div>
            <Button variant="outline" className="gap-2">
              <Eye className="h-4 w-4" /> Pré-visualizar
            </Button>
            <Button onClick={handleSave} className="gap-2">
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? "Salvo!" : "Publicar"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="identidade" className="space-y-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="identidade" className="gap-2">
              <Palette className="h-4 w-4" /> Identidade
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-2">
              <Image className="h-4 w-4" /> Banners
            </TabsTrigger>
            <TabsTrigger value="conteudo" className="gap-2">
              <Type className="h-4 w-4" /> Conteúdo
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-2">
              <Globe className="h-4 w-4" /> Footer
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <ExternalLink className="h-4 w-4" /> SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identidade" className="space-y-6">
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="mb-6 font-display text-xl font-semibold">Cores da Marca</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Customize as cores para que a página fique com a identidade visual da sua agência.
              </p>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <ColorInput
                  label="Cor primária"
                  description="Cor dos botões principais e destaques"
                  value={theme.primary}
                  onChange={(v) => handleColorChange("primary", v)}
                />
                <ColorInput
                  label="Cor de destaque"
                  description="Cor dos CTAs e elementos de atenção"
                  value={theme.accent}
                  onChange={(v) => handleColorChange("accent", v)}
                />
                <ColorInput
                  label="Cor de fundo"
                  description="Cor do background da página"
                  value={theme.background}
                  onChange={(v) => handleColorChange("background", v)}
                />
                <ColorInput
                  label="Cor das superfícies"
                  description="Cor dos cards e elementos elevados"
                  value={theme.surface}
                  onChange={(v) => handleColorChange("surface", v)}
                />
                <ColorInput
                  label="Cor do texto"
                  description="Cor principal do texto"
                  value={theme.text}
                  onChange={(v) => handleColorChange("text", v)}
                />
                <ColorInput
                  label="Cor secundária"
                  description="Cor de textos secundários"
                  value={theme.muted}
                  onChange={(v) => handleColorChange("muted", v)}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-border p-4">
                <p className="mb-3 text-sm font-medium">Prévia do tema</p>
                <div className="flex gap-4">
                  <button
                    className="h-12 flex-1 rounded-xl"
                    style={{ backgroundColor: theme.primary }}
                    title="Primary"
                  />
                  <button
                    className="h-12 flex-1 rounded-xl"
                    style={{ backgroundColor: theme.accent }}
                    title="Accent"
                  />
                  <button
                    className="h-12 flex-1 rounded-xl border"
                    style={{ backgroundColor: theme.background }}
                    title="Background"
                  />
                  <button
                    className="h-12 flex-1 rounded-xl border"
                    style={{ backgroundColor: theme.surface }}
                    title="Surface"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="mb-6 font-display text-xl font-semibold">Logo e Ícones</h2>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <Label>Logo da empresa</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-surface">
                      {brandConfig.logoText.charAt(0)}
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" /> Upload logo
                      </Button>
                      <p className="mt-1 text-xs text-muted-foreground">PNG, SVG ou JPG, máx 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-surface">
                      <Globe className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Upload className="h-4 w-4" /> Upload favicon
                      </Button>
                      <p className="mt-1 text-xs text-muted-foreground">32x32px, ICO ou PNG</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="banners" className="space-y-6">
            <div className="rounded-3xl border border-border bg-background p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-semibold">Banners Promocionais</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gerencie os banners que aparecem na página inicial
                  </p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" /> Novo Banner
                </Button>
              </div>

              <div className="space-y-4">
                {banners.map((banner, i) => (
                  <div
                    key={banner.id}
                    className={`group rounded-2xl border p-4 transition-colors ${banner.active ? "border-border" : "border-dashed opacity-60"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 cursor-move items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>

                      <div className="flex h-24 w-40 flex-none items-center justify-center rounded-xl border border-dashed border-border bg-surface">
                        <Image className="h-8 w-8 text-muted-foreground" />
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Título</Label>
                            <Input
                              value={banner.title}
                              onChange={(e) =>
                                setBanners((prev) =>
                                  prev.map((b) => (b.id === banner.id ? { ...b, title: e.target.value } : b))
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Subtítulo</Label>
                            <Input
                              value={banner.subtitle}
                              onChange={(e) =>
                                setBanners((prev) =>
                                  prev.map((b) => (b.id === banner.id ? { ...b, subtitle: e.target.value } : b))
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Link do CTA</Label>
                            <Input
                              value={banner.ctaLink}
                              onChange={(e) =>
                                setBanners((prev) =>
                                  prev.map((b) => (b.id === banner.id ? { ...b, ctaLink: e.target.value } : b))
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setBanners((prev) =>
                              prev.map((b) => (b.id === banner.id ? { ...b, active: !b.active } : b))
                            )
                          }
                        >
                          {banner.active ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setBanners((prev) => prev.filter((b) => b.id !== banner.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {banners.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                  <Image className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum banner cadastrado</p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Plus className="h-4 w-4" /> Adicionar banner
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="mb-6 font-display text-xl font-semibold">Hero da Página Inicial</h2>

              <div className="space-y-4">
                <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-surface">
                  <div className="text-center">
                    <Image className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Imagem do hero</p>
                  </div>
                </div>
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" /> Upload imagem do hero
                </Button>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Título principal</Label>
                    <Input
                      value={heroConfig.title}
                      onChange={(e) => setHeroConfig((h) => ({ ...h, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={heroConfig.subtitle}
                      onChange={(e) => setHeroConfig((h) => ({ ...h, subtitle: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">Mostrar barra de busca</p>
                    <p className="text-sm text-muted-foreground">Exibe a busca de viagens abaixo do hero</p>
                  </div>
                  <Switch
                    checked={heroConfig.showSearch}
                    onCheckedChange={(v) => setHeroConfig((h) => ({ ...h, showSearch: v }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">Efeito Parallax</p>
                    <p className="text-sm text-muted-foreground">A imagem de fundo se move ao rolar a página</p>
                  </div>
                  <Switch
                    checked={heroConfig.parallaxEffect}
                    onCheckedChange={(v) => setHeroConfig((h) => ({ ...h, parallaxEffect: v }))}
                  />
                </div>

                {heroConfig.parallaxEffect && (
                  <div className="space-y-2">
                    <Label>Velocidade do Parallax ({heroConfig.parallaxSpeed})</Label>
                    <Input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={heroConfig.parallaxSpeed}
                      onChange={(e) => setHeroConfig((h) => ({ ...h, parallaxSpeed: Number(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground">0.1 = lento, 1.0 = rápido</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conteudo" className="space-y-6">
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="mb-6 font-display text-xl font-semibold">Seções</h2>

              <div className="space-y-4">
                <SectionToggle
                  title="Benefícios"
                  description="Seção 'Por que escolher a TapTur'"
                  enabled={features.showBenefits}
                  onChange={(v) => setFeatures((f) => ({ ...f, showBenefits: v }))}
                />
                <Separator />
                <SectionToggle
                  title="Avaliações/Testemunhos"
                  description="Depoimentos de clientes"
                  enabled={features.showTestimonials}
                  onChange={(v) => setFeatures((f) => ({ ...f, showTestimonials: v }))}
                />
                <Separator />
                <SectionToggle
                  title="FAQ"
                  description="Perguntas frequentes"
                  enabled={features.showFAQ}
                  onChange={(v) => setFeatures((f) => ({ ...f, showFAQ: v }))}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="mb-6 font-display text-xl font-semibold">Benefícios</h2>

              <div className="space-y-4">
                {features.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-xl border border-border p-4">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-secondary">
                      <benefit.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <Input value={benefit.title} placeholder="Título do benefício" />
                      <Textarea value={benefit.description} placeholder="Descrição" rows={2} />
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" /> Adicionar benefício
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="footer" className="space-y-6">
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="mb-6 font-display text-xl font-semibold">Rodapé</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Texto "Sobre nós"</Label>
                  <Textarea
                    value={footerConfig.aboutText}
                    onChange={(e) => setFooterConfig((f) => ({ ...f, aboutText: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      value={footerConfig.phone}
                      onChange={(e) => setFooterConfig((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input
                      value={footerConfig.email}
                      onChange={(e) => setFooterConfig((f) => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>WhatsApp</Label>
                    <Input
                      value={footerConfig.whatsapp}
                      onChange={(e) => setFooterConfig((f) => ({ ...f, whatsapp: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      value={footerConfig.instagram}
                      onChange={(e) => setFooterConfig((f) => ({ ...f, instagram: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input
                    value={footerConfig.address}
                    onChange={(e) => setFooterConfig((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">Mostrar Termos de Uso</p>
                  </div>
                  <Switch
                    checked={footerConfig.showTerms}
                    onCheckedChange={(v) => setFooterConfig((f) => ({ ...f, showTerms: v }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">Mostrar Política de Privacidade</p>
                  </div>
                  <Switch
                    checked={footerConfig.showPrivacy}
                    onCheckedChange={(v) => setFooterConfig((f) => ({ ...f, showPrivacy: v }))}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="rounded-3xl border border-border bg-background p-6">
              <h2 className="mb-6 font-display text-xl font-semibold">SEO e Meta Tags</h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Configure como sua página aparece nos resultados de busca e redes sociais.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Título (meta title)</Label>
                  <Input
                    value={brandConfig.metaTitle}
                    onChange={(e) => setBrandConfig((b) => ({ ...b, metaTitle: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Recomendado: 50-60 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label>Descrição (meta description)</Label>
                  <Textarea
                    value={brandConfig.metaDescription}
                    onChange={(e) => setBrandConfig((b) => ({ ...b, metaDescription: e.target.value }))}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">Recomendado: 150-160 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label>Open Graph Image</Label>
                  <p className="mb-2 text-xs text-muted-foreground">Imagem para compartilhar no Facebook, WhatsApp, etc (1200x630px)</p>
                  <div className="flex items-center gap-4">
                    <div className="flex h-24 w-40 items-center justify-center rounded-xl border border-dashed border-border bg-surface">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" /> Upload imagem
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-surface-elevated p-4">
                <h4 className="mb-3 font-medium">Preview do Google</h4>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm text-muted-foreground">{brandConfig.metaTitle}</p>
                  <p className="mt-1 text-sm text-success">{window.location.origin}/</p>
                  <p className="mt-1 text-sm text-muted-foreground">{brandConfig.metaDescription}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-80 flex-shrink-0 border-l border-border bg-surface-elevated p-6 overflow-y-auto">
        <div className="mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <h3 className="font-medium">Preview</h3>
        </div>

        <div
          className={`rounded-2xl border border-border bg-background p-4 transition-all ${previewMode === "mobile" ? "max-w-[280px] mx-auto" : ""}`}
        >
          <div className="space-y-3">
            <div className="h-32 rounded-xl bg-secondary" style={{ background: theme.primary }} />

            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded" style={{ background: theme.muted, opacity: 0.3 }} />
              <div className="h-3 w-full rounded" style={{ background: theme.muted, opacity: 0.2 }} />
              <div className="h-3 w-5/6 rounded" style={{ background: theme.muted, opacity: 0.2 }} />
            </div>

            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-lg" style={{ background: theme.accent }} />
              <div className="h-8 flex-1 rounded-lg" style={{ background: theme.primary, opacity: 0.8 }} />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Copy className="h-4 w-4" /> Copiar CSS gerado
          </Button>
          <Button variant="outline" className="w-full justify-start gap-2">
            <RefreshCw className="h-4 w-4" /> Resetar para padrão
          </Button>
        </div>
      </div>
    </div>
  );
}

function ColorInput({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="flex gap-2">
        <input
          type="color"
          value={hexToRgb(value)}
          onChange={(e) => onChange(rgbToOklch(e.target.value))}
          className="h-9 w-9 cursor-pointer rounded border border-input"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-sm" />
      </div>
    </div>
  );
}

function SectionToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={onChange} />
    </div>
  );
}

function hexToRgb(oklch: string): string {
  return "#1a1a2e";
}

function rgbToOklch(rgb: string): string {
  return "oklch(0.55 0.18 35)";
}