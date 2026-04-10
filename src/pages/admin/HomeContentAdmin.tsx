import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useHomeContent } from "@/contexts/HomeContentContext";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/image-upload";
import { Checkbox } from "@/components/ui/checkbox";
import { useBrands } from "@/hooks/useBrands";
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";

const HomeContentAdmin = () => {
  const { content, updateContent, resetContent } = useHomeContent();
  const { brands } = useBrands();
  const homeModules = [
    { key: "showHero", label: "Hero", description: "Seção principal no topo da home." },
    { key: "showBrands", label: "Marcas", description: "Bloco com marcas atendidas." },
    { key: "showServices", label: "Serviços", description: "Bloco com serviços oferecidos." },
    { key: "showFeatures", label: "Diferenciais", description: "Seção de diferenciais da home." },
    { key: "showStats", label: "Números", description: "Seção com indicadores e resultados." },
    { key: "showProcess", label: "Processo", description: "Passo a passo de funcionamento." },
    { key: "showTestimonials", label: "Depoimentos", description: "Seção de depoimentos." },
    { key: "showDifferentials", label: "Diferenciais Extras", description: "Bloco complementar de benefícios." },
    { key: "showCta", label: "CTA Final", description: "Chamada final para ação." },
  ] as const;

  const handleHeroChange = async (
    field:
      | "heroTitle"
      | "heroSubtitle"
      | "heroCtaLabel"
      | "heroSecondaryCtaLabel"
      | "heroBadge"
      | "heroImage"
      | "heroCtaLink"
      | "heroSecondaryCtaLink",
    value: string
  ) => {
    await updateContent({ [field]: value });
  };

  const handleFeatureChange = async (index: number, field: "title" | "description", value: string) => {
    const features = [...content.features];
    features[index] = { ...features[index], [field]: value };
    await updateContent({ features });
  };

  const handleServicesChange = async (
    field:
      | "servicesBadge"
      | "servicesTitle"
      | "servicesSubtitle"
      | "servicesImage"
      | "servicesImageTitle"
      | "servicesImageDescription",
    value: string
  ) => {
    await updateContent({ [field]: value });
  };

  const handleServiceCardChange = async (
    index: number,
    field: "title" | "description" | "badge",
    value: string
  ) => {
    const servicesCards = [...content.servicesCards];
    servicesCards[index] = { ...servicesCards[index], [field]: value };
    await updateContent({ servicesCards });
  };

  const handleServiceCardFeaturesChange = async (index: number, value: string) => {
    const servicesCards = [...content.servicesCards];
    servicesCards[index] = {
      ...servicesCards[index],
      features: value
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean),
    };
    await updateContent({ servicesCards });
  };

  const handleServiceHighlightChange = async (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    const servicesHighlights = [...content.servicesHighlights];
    servicesHighlights[index] = { ...servicesHighlights[index], [field]: value };
    await updateContent({ servicesHighlights });
  };

  const handleStatChange = async (
    index: number,
    field: "value" | "label" | "description",
    value: string
  ) => {
    const stats = [...content.stats];
    stats[index] = { ...stats[index], [field]: value };
    await updateContent({ stats });
  };

  const handleStepChange = async (
    index: number,
    field: "title" | "description" | "action" | "href",
    value: string
  ) => {
    const steps = [...content.steps];
    steps[index] = { ...steps[index], [field]: value };
    await updateContent({ steps });
  };

  const handleSave = async () => {
    await updateContent({}); // Força uma atualização completa
    toast.success("Conteúdo da home salvo com sucesso!");
  };

  const selectedHomeBrandIds = content.homeBrandIds || brands.map((brand) => brand.id);

  const handleToggleHomeBrand = async (brandId: string, checked: boolean) => {
    const current = content.homeBrandIds || [];
    const next = checked
      ? [...current, brandId]
      : current.filter((id) => id !== brandId);
    await updateContent({ homeBrandIds: next });
  };

  const handleMoveHomeBrand = async (brandId: string, direction: "up" | "down") => {
    const current = [...selectedHomeBrandIds];
    const index = current.indexOf(brandId);
    if (index === -1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    [current[index], current[targetIndex]] = [current[targetIndex], current[index]];
    await updateContent({ homeBrandIds: current });
  };

  const handleReset = async () => {
    await resetContent();
    toast.success("Conteúdo da home restaurado para o padrão.");
  };

  const getLinkState = (value: string, fallback: string) => {
    const resolved = (value || fallback).trim();
    const isExternal = /^https?:\/\//i.test(resolved);
    const isWhatsapp = /^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(resolved);
    const isInternal = resolved.startsWith("/");
    const isValid = Boolean(resolved) && (isExternal || isInternal);

    return {
      resolved,
      isValid,
      typeLabel: isWhatsapp ? "WhatsApp" : isExternal ? "Externo" : isInternal ? "Interno" : "Inválido",
    };
  };

  const renderHeroButtonEditor = ({
    title,
    description,
    visible,
    onToggle,
    labelValue,
    onLabelChange,
    labelPlaceholder,
    linkValue,
    onLinkChange,
    linkPlaceholder,
  }: {
    title: string;
    description: string;
    visible: boolean;
    onToggle: (checked: boolean) => void;
    labelValue: string;
    onLabelChange: (value: string) => void;
    labelPlaceholder: string;
    linkValue: string;
    onLinkChange: (value: string) => void;
    linkPlaceholder: string;
  }) => (
    <div className="rounded-xl border border-border p-4 space-y-4 bg-muted/20">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Checkbox checked={visible} onCheckedChange={(checked) => onToggle(checked as boolean)} />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Texto do botão</label>
        <Input
          value={labelValue}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder={labelPlaceholder}
          disabled={!visible}
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-foreground">Link de redirecionamento</label>
        <Input
          value={linkValue}
          onChange={(e) => onLinkChange(e.target.value)}
          placeholder={linkPlaceholder}
          disabled={!visible}
        />
        {(() => {
          const linkState = getLinkState(linkValue, linkPlaceholder);
          return (
            <div className="rounded-lg border border-dashed border-border p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Preview: <span className="font-medium text-foreground">{linkState.resolved}</span>
                </p>
                <Badge variant={linkState.isValid ? "outline" : "destructive"}>
                  {linkState.typeLabel}
                </Badge>
              </div>
              <p className={`text-xs ${linkState.isValid ? "text-muted-foreground" : "text-destructive"}`}>
                {linkState.isValid
                  ? "Link válido para redirecionamento."
                  : "Use um caminho interno (/pagina) ou URL completa (https://...)."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!visible || !linkState.isValid}
                onClick={() => window.open(linkState.resolved, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Testar link
              </Button>
            </div>
          );
        })()}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Conteúdo da Página Inicial
          </h1>
          <p className="text-muted-foreground">
            Administre os textos principais da home sem precisar alterar o código.
          </p>
        </div>

        {/* Hero + Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Hero (Seção Principal)</CardTitle>
              <CardDescription>
                Título, subtítulo e CTAs exibidos no topo da página inicial.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Badge (Etiqueta)
                </label>
                <Input
                  value={content.heroBadge || ""}
                  onChange={(e) => handleHeroChange("heroBadge", e.target.value as any)}
                  placeholder="Laboratório Premium B2B"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Título principal
                </label>
                <Input
                  value={content.heroTitle}
                  onChange={(e) => handleHeroChange("heroTitle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Subtítulo
                </label>
                <Textarea
                  value={content.heroSubtitle}
                  onChange={(e) => handleHeroChange("heroSubtitle", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  URL da Imagem do Hero
                </label>
                <Input
                  value={content.heroImage || ""}
                  onChange={(e) => handleHeroChange("heroImage", e.target.value as any)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Você pode colar uma URL externa ou usar o upload abaixo.
                </p>
              </div>
              <div className="space-y-3">
                <ImageUpload
                  value={content.heroImage || ""}
                  onChange={(url) => {
                    handleHeroChange("heroImage", url).catch(console.error);
                  }}
                  label="Upload da Imagem do Hero"
                />
                {content.heroImage ? (
                  <div className="rounded-lg border border-border p-3 space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      Preview da imagem atual
                    </p>
                    <img
                      src={content.heroImage}
                      alt="Hero atual"
                      className="w-full max-h-56 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleHeroChange("heroImage", "").catch(console.error)}
                    >
                      Remover imagem do hero
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderHeroButtonEditor({
                  title: "Botão principal",
                  description: "Controle o CTA principal exibido no hero.",
                  visible: content.showHeroPrimaryCta !== false,
                  onToggle: (checked) =>
                    updateContent({ showHeroPrimaryCta: checked }).catch(console.error),
                  labelValue: content.heroCtaLabel,
                  onLabelChange: (value) =>
                    handleHeroChange("heroCtaLabel", value).catch(console.error),
                  labelPlaceholder: "Explorar Catálogo",
                  linkValue: content.heroCtaLink || "",
                  onLinkChange: (value) =>
                    handleHeroChange("heroCtaLink", value).catch(console.error),
                  linkPlaceholder: "/catalogo",
                })}
                {renderHeroButtonEditor({
                  title: "Botão secundário",
                  description: "Controle o CTA secundário exibido no hero.",
                  visible: content.showHeroSecondaryCta !== false,
                  onToggle: (checked) =>
                    updateContent({ showHeroSecondaryCta: checked }).catch(console.error),
                  labelValue: content.heroSecondaryCtaLabel,
                  onLabelChange: (value) =>
                    handleHeroChange("heroSecondaryCtaLabel", value).catch(console.error),
                  labelPlaceholder: "Área do Lojista",
                  linkValue: content.heroSecondaryCtaLink || "",
                  onLinkChange: (value) =>
                    handleHeroChange("heroSecondaryCtaLink", value).catch(console.error),
                  linkPlaceholder: "/lojista/login",
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>
                Salve ou restaure o conteúdo padrão da home.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleSave}>
                Salvar alterações
              </Button>
              <Button variant="outline" className="w-full" onClick={handleReset}>
                Restaurar conteúdo padrão
              </Button>
              <p className="text-xs text-muted-foreground">
                As alterações deste CMS sao enviadas para a API e persistidas no conteudo da home.
              </p>
              <Badge variant="outline" className="text-xs">
                Módulo CMS leve
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Módulos da Home</CardTitle>
            <CardDescription>
              Escolha quais seções da página inicial ficam visíveis no site.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {homeModules.map((module) => (
              <div
                key={module.key}
                className="flex items-start justify-between gap-4 rounded-lg border border-border p-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium text-foreground">
                    {module.label}
                  </label>
                  <p className="text-xs text-muted-foreground">
                    {module.description}
                  </p>
                </div>
                <Checkbox
                  checked={content[module.key] !== false}
                  onCheckedChange={(checked) =>
                    updateContent({ [module.key]: checked as boolean }).catch(console.error)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Marcas da Home</CardTitle>
            <CardDescription>
              Escolha quais marcas aparecem na home e organize a ordem de exibição.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {brands.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Cadastre marcas em `/admin/marcas` para gerenciar esta seção.
              </p>
            ) : (
              brands.map((brand) => {
                const isSelected = selectedHomeBrandIds.includes(brand.id);
                const position = selectedHomeBrandIds.indexOf(brand.id);
                return (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleToggleHomeBrand(brand.id, checked as boolean).catch(console.error)
                        }
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{brand.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {brand.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <Badge variant="outline">Posição {position + 1}</Badge>
                      ) : (
                        <Badge variant="secondary">Oculta</Badge>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={!isSelected || position <= 0}
                        onClick={() => handleMoveHomeBrand(brand.id, "up").catch(console.error)}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={!isSelected || position === -1 || position >= selectedHomeBrandIds.length - 1}
                        onClick={() => handleMoveHomeBrand(brand.id, "down").catch(console.error)}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nossos Serviços</CardTitle>
            <CardDescription>
              Edite os textos, cards, destaques e a imagem principal do módulo de serviços.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Badge da seção
                </label>
                <Input
                  value={content.servicesBadge}
                  onChange={(e) =>
                    handleServicesChange("servicesBadge", e.target.value).catch(console.error)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Título da seção
                </label>
                <Input
                  value={content.servicesTitle}
                  onChange={(e) =>
                    handleServicesChange("servicesTitle", e.target.value).catch(console.error)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Subtítulo da seção
              </label>
              <Textarea
                value={content.servicesSubtitle}
                onChange={(e) =>
                  handleServicesChange("servicesSubtitle", e.target.value).catch(console.error)
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Título sobre a imagem
                </label>
                <Input
                  value={content.servicesImageTitle}
                  onChange={(e) =>
                    handleServicesChange("servicesImageTitle", e.target.value).catch(console.error)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  URL da imagem
                </label>
                <Input
                  value={content.servicesImage || ""}
                  onChange={(e) =>
                    handleServicesChange("servicesImage", e.target.value).catch(console.error)
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Descrição sobre a imagem
              </label>
              <Textarea
                value={content.servicesImageDescription}
                onChange={(e) =>
                  handleServicesChange("servicesImageDescription", e.target.value).catch(console.error)
                }
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <ImageUpload
                value={content.servicesImage || ""}
                onChange={(url) => {
                  handleServicesChange("servicesImage", url).catch(console.error);
                }}
                label="Upload da imagem de destaque"
              />
              {content.servicesImage ? (
                <div className="rounded-lg border border-border p-3 space-y-3">
                  <p className="text-sm font-medium text-foreground">
                    Preview da imagem atual
                  </p>
                  <img
                    src={content.servicesImage}
                    alt="Serviços atual"
                    className="w-full max-h-56 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleServicesChange("servicesImage", "").catch(console.error)}
                  >
                    Remover imagem da seção
                  </Button>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.servicesCards.map((service, index) => (
                <div
                  key={service.id}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <Badge variant="outline" className="text-xs mb-1">
                    Card {index + 1}
                  </Badge>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Título
                    </label>
                    <Input
                      value={service.title}
                      onChange={(e) =>
                        handleServiceCardChange(index, "title", e.target.value).catch(console.error)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Selo
                    </label>
                    <Input
                      value={service.badge}
                      onChange={(e) =>
                        handleServiceCardChange(index, "badge", e.target.value).catch(console.error)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Descrição
                    </label>
                    <Textarea
                      value={service.description}
                      onChange={(e) =>
                        handleServiceCardChange(index, "description", e.target.value).catch(console.error)
                      }
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Itens do card
                    </label>
                    <Textarea
                      value={service.features.join("\n")}
                      onChange={(e) =>
                        handleServiceCardFeaturesChange(index, e.target.value).catch(console.error)
                      }
                      rows={4}
                      placeholder={"Um item por linha"}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.servicesHighlights.map((highlight, index) => (
                <div
                  key={highlight.id}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <Badge variant="secondary" className="text-xs">
                    Destaque {index + 1}
                  </Badge>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Rótulo
                    </label>
                    <Input
                      value={highlight.label}
                      onChange={(e) =>
                        handleServiceHighlightChange(index, "label", e.target.value).catch(console.error)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Valor
                    </label>
                    <Input
                      value={highlight.value}
                      onChange={(e) =>
                        handleServiceHighlightChange(index, "value", e.target.value).catch(console.error)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Diferenciais (Features) */}
        <Card>
          <CardHeader>
            <CardTitle>Diferenciais (Features)</CardTitle>
            <CardDescription>
              Texto da seção e cards de diferenciais exibidos na home.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Título da seção
                </label>
                <Input
                  value={content.featuresTitle}
                  onChange={(e) =>
                    updateContent({ featuresTitle: e.target.value }).catch(console.error)
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Subtítulo da seção
                </label>
                <Textarea
                  value={content.featuresSubtitle}
                  onChange={(e) =>
                    updateContent({ featuresSubtitle: e.target.value }).catch(console.error)
                  }
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.features.map((feature, index) => (
                <div
                  key={feature.id}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <Badge variant="outline" className="text-xs mb-1">
                    ID: {feature.id}
                  </Badge>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Título
                    </label>
                    <Input
                      value={feature.title}
                      onChange={(e) =>
                        handleFeatureChange(index, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Descrição
                    </label>
                    <Textarea
                      value={feature.description}
                      onChange={(e) =>
                        handleFeatureChange(index, "description", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Números (Stats) */}
        <Card>
          <CardHeader>
            <CardTitle>Números (Stats)</CardTitle>
            <CardDescription>
              Valores e descrições mostrados na seção de resultados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Título da seção
              </label>
              <Input
                value={content.statsTitle}
                onChange={(e) =>
                  updateContent({ statsTitle: e.target.value }).catch(console.error)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Subtítulo da seção
              </label>
              <Textarea
                value={content.statsSubtitle}
                onChange={(e) =>
                  updateContent({ statsSubtitle: e.target.value }).catch(console.error)
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {content.stats.map((stat, index) => (
                <div
                  key={stat.id}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <Badge variant="outline" className="text-xs mb-1">
                    ID: {stat.id}
                  </Badge>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Valor
                    </label>
                    <Input
                      value={stat.value}
                      onChange={(e) =>
                        handleStatChange(index, "value", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Rótulo
                    </label>
                    <Input
                      value={stat.label}
                      onChange={(e) =>
                        handleStatChange(index, "label", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Descrição
                    </label>
                    <Textarea
                      value={stat.description}
                      onChange={(e) =>
                        handleStatChange(index, "description", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Processo (Steps) */}
        <Card>
          <CardHeader>
            <CardTitle>Processo (Passos)</CardTitle>
            <CardDescription>
              Passos exibidos na seção &quot;Como funciona o processo?&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Título da seção
              </label>
              <Input
                value={content.processTitle}
                onChange={(e) =>
                  updateContent({ processTitle: e.target.value }).catch(console.error)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Subtítulo da seção
              </label>
              <Textarea
                value={content.processSubtitle}
                onChange={(e) =>
                  updateContent({ processSubtitle: e.target.value }).catch(console.error)
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {content.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <Badge variant="outline" className="text-xs mb-1">
                    Passo {step.number} • ID: {step.id}
                  </Badge>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Título
                    </label>
                    <Input
                      value={step.title}
                      onChange={(e) =>
                        handleStepChange(index, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Descrição
                    </label>
                    <Textarea
                      value={step.description}
                      onChange={(e) =>
                        handleStepChange(index, "description", e.target.value)
                      }
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Texto do botão (opcional)
                    </label>
                    <Input
                      value={step.action || ""}
                      onChange={(e) =>
                        handleStepChange(index, "action", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-foreground">
                      Link do botão (opcional)
                    </label>
                    <Input
                      value={step.href || ""}
                      onChange={(e) =>
                        handleStepChange(index, "href", e.target.value)
                      }
                      placeholder="/catalogo, /lojista/login, /contato..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default HomeContentAdmin;
