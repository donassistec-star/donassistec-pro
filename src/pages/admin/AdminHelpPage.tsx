import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ExternalLink,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { settingsService, SystemSettings } from "@/services/settingsService";
import { toast } from "sonner";

type HelpFaqDraft = {
  category: string;
  question: string;
  answer: string;
};

const parseHelpFaqItems = (value?: string): HelpFaqDraft[] =>
  (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [category = "", question = "", answer = ""] = line
        .split("|")
        .map((item) => item.trim());

      return { category, question, answer };
    })
    .filter((item) => item.category || item.question || item.answer);

const serializeHelpFaqItems = (items: HelpFaqDraft[]) =>
  items
    .map((item) => ({
      category: item.category.trim(),
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.category && item.question && item.answer)
    .map((item) => `${item.category}|${item.question}|${item.answer}`)
    .join("\n");

const HELP_SETTINGS_KEYS: Array<keyof SystemSettings> = [
  "helpHeroBadge",
  "helpHeroTitle",
  "helpHeroDescription",
  "helpSearchPlaceholder",
  "helpFaqItems",
  "helpBackLabel",
  "helpNoResultsTitle",
  "helpNoResultsDescription",
  "helpNoResultsButtonLabel",
  "helpContactTitle",
  "helpContactDescription",
  "helpWhatsappTitle",
  "helpWhatsappDescription",
  "helpWhatsappLabel",
  "helpPhoneTitle",
  "helpPhoneLabel",
  "helpEmailTitle",
  "helpEmailLabel",
];

const defaultHelpSettings: Partial<SystemSettings> = {
  helpHeroBadge: "Central de Ajuda",
  helpHeroTitle: "Como Podemos Ajudar?",
  helpHeroDescription:
    "Encontre respostas para suas dúvidas ou entre em contato com nosso suporte",
  helpSearchPlaceholder: "Buscar perguntas frequentes...",
  helpBackLabel: "Voltar para Home",
  helpNoResultsTitle: "Nenhum resultado encontrado",
  helpNoResultsDescription:
    "Tente buscar com outras palavras-chave ou entre em contato com nosso suporte.",
  helpNoResultsButtonLabel: "Falar no WhatsApp",
  helpContactTitle: "Ainda Precisa de Ajuda?",
  helpContactDescription:
    "Nossa equipe está pronta para ajudá-lo com qualquer dúvida ou problema",
  helpWhatsappTitle: "WhatsApp",
  helpWhatsappDescription: "Atendimento rápido via WhatsApp",
  helpWhatsappLabel: "Abrir Chat",
  helpPhoneTitle: "Telefone",
  helpPhoneLabel: "Ligar Agora",
  helpEmailTitle: "E-mail",
  helpEmailLabel: "Enviar E-mail",
};

const AdminHelpPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<SystemSettings>>(defaultHelpSettings);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getAll();
        if (data) {
          setSettings({ ...defaultHelpSettings, ...data });
        }
      } catch (error) {
        console.error("Erro ao carregar página Ajuda:", error);
        toast.error("Erro ao carregar configurações da página Ajuda.");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const helpFaqItems = parseHelpFaqItems(settings.helpFaqItems);
  const helpFaqCategoryCount = new Set(
    helpFaqItems.map((item) => item.category.trim()).filter(Boolean)
  ).size;

  const updateHelpFaqItems = (items: HelpFaqDraft[]) => {
    setSettings((prev) => ({
      ...prev,
      helpFaqItems: serializeHelpFaqItems(items),
    }));
  };

  const handleHelpFaqChange = (
    index: number,
    field: keyof HelpFaqDraft,
    value: string
  ) => {
    const nextItems = [...helpFaqItems];
    nextItems[index] = {
      ...nextItems[index],
      [field]: value,
    };
    updateHelpFaqItems(nextItems);
  };

  const handleAddHelpFaq = () => {
    updateHelpFaqItems([
      ...helpFaqItems,
      { category: "", question: "", answer: "" },
    ]);
  };

  const handleRemoveHelpFaq = (index: number) => {
    updateHelpFaqItems(helpFaqItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleMoveHelpFaq = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= helpFaqItems.length) return;

    const nextItems = [...helpFaqItems];
    [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
    updateHelpFaqItems(nextItems);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = HELP_SETTINGS_KEYS.reduce<Partial<SystemSettings>>((acc, key) => {
        acc[key] = settings[key];
        return acc;
      }, {});

      const updated = await settingsService.update(payload);
      if (!updated) {
        toast.error("Não foi possível salvar a página Ajuda.");
        return;
      }

      setSettings((prev) => ({ ...prev, ...updated }));
      window.dispatchEvent(new CustomEvent("settings:public-updated"));
      toast.success("Página Ajuda salva com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar a página Ajuda");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando página Ajuda..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/admin/dashboard" className="hover:text-foreground">
                Admin
              </Link>
              <span>/</span>
              <span>Página Ajuda</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-8 h-8" />
              Página Ajuda
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Edite a experiência da página <code>/ajuda</code> em uma tela dedicada,
              com foco total no hero, FAQs e contatos de suporte.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/configuracoes">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Configurações
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="/ajuda" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Página Pública
              </a>
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Página Ajuda"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">FAQs cadastradas</p>
              <p className="text-3xl font-bold text-foreground mt-2">{helpFaqItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Categorias</p>
              <p className="text-3xl font-bold text-foreground mt-2">{helpFaqCategoryCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Cards de suporte</p>
              <p className="text-3xl font-bold text-foreground mt-2">3</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Busca ativa no público</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                <Search className="w-7 h-7" />
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hero da Página</CardTitle>
            <CardDescription>
              Ajuste a área principal exibida no topo da página de ajuda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="helpHeroBadge">Badge</Label>
                <Input
                  id="helpHeroBadge"
                  value={settings.helpHeroBadge || ""}
                  onChange={(e) => setSettings({ ...settings, helpHeroBadge: e.target.value })}
                  placeholder="Central de Ajuda"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpHeroTitle">Título Principal</Label>
                <Input
                  id="helpHeroTitle"
                  value={settings.helpHeroTitle || ""}
                  onChange={(e) => setSettings({ ...settings, helpHeroTitle: e.target.value })}
                  placeholder="Como Podemos Ajudar?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="helpHeroDescription">Descrição Principal</Label>
              <Textarea
                id="helpHeroDescription"
                value={settings.helpHeroDescription || ""}
                onChange={(e) => setSettings({ ...settings, helpHeroDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="helpSearchPlaceholder">Placeholder da Busca</Label>
                <Input
                  id="helpSearchPlaceholder"
                  value={settings.helpSearchPlaceholder || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, helpSearchPlaceholder: e.target.value })
                  }
                  placeholder="Buscar perguntas frequentes..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpBackLabel">Texto do botão voltar</Label>
                <Input
                  id="helpBackLabel"
                  value={settings.helpBackLabel || ""}
                  onChange={(e) => setSettings({ ...settings, helpBackLabel: e.target.value })}
                  placeholder="Voltar para Home"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>
                  Organize as FAQs por categoria, pergunta e resposta. A ordem aqui sera a mesma exibida no site.
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleAddHelpFaq}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar FAQ
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {helpFaqItems.length > 0 ? (
              <div className="space-y-4">
                {helpFaqItems.map((faq, index) => (
                  <div key={`${faq.category}-${faq.question}-${index}`} className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-foreground">FAQ {index + 1}</p>
                          {faq.category?.trim() && <Badge variant="secondary">{faq.category}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Preencha todos os campos para que este item apareca na página pública.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveHelpFaq(index, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMoveHelpFaq(index, "down")}
                          disabled={index === helpFaqItems.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveHelpFaq(index)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Input
                          value={faq.category}
                          onChange={(e) => handleHelpFaqChange(index, "category", e.target.value)}
                          placeholder="Ex.: Geral, Lojistas, Produtos"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pergunta</Label>
                        <Input
                          value={faq.question}
                          onChange={(e) => handleHelpFaqChange(index, "question", e.target.value)}
                          placeholder="Ex.: Como faço um pedido?"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Resposta</Label>
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => handleHelpFaqChange(index, "answer", e.target.value)}
                        placeholder="Explique a resposta que sera exibida na página Ajuda."
                        rows={3}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <HelpCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium text-foreground">Nenhuma FAQ cadastrada</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Comece adicionando a primeira pergunta frequente da sua página de ajuda.
                </p>
                <Button type="button" variant="outline" onClick={handleAddHelpFaq}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira FAQ
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="helpFaqItems">Formato bruto salvo</Label>
              <Textarea
                id="helpFaqItems"
                value={settings.helpFaqItems || ""}
                onChange={(e) => setSettings({ ...settings, helpFaqItems: e.target.value })}
                placeholder={
                  "Geral|Como faço um pedido?|Acesse o catálogo e envie seu orçamento.\nLojistas|Como acompanho meu pedido?|Na área do lojista, acesse Pedidos."
                }
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                Campo avançado para colar ou ajustar o conteúdo manualmente no formato
                {" "}
                <code>Categoria|Pergunta|Resposta</code>.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sem Resultado</CardTitle>
              <CardDescription>
                Mensagens exibidas quando a busca não encontra nenhuma FAQ.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="helpNoResultsTitle">Título</Label>
                <Input
                  id="helpNoResultsTitle"
                  value={settings.helpNoResultsTitle || ""}
                  onChange={(e) => setSettings({ ...settings, helpNoResultsTitle: e.target.value })}
                  placeholder="Nenhum resultado encontrado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpNoResultsDescription">Descrição</Label>
                <Textarea
                  id="helpNoResultsDescription"
                  value={settings.helpNoResultsDescription || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, helpNoResultsDescription: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpNoResultsButtonLabel">Texto do botão</Label>
                <Input
                  id="helpNoResultsButtonLabel"
                  value={settings.helpNoResultsButtonLabel || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, helpNoResultsButtonLabel: e.target.value })
                  }
                  placeholder="Falar no WhatsApp"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bloco Final de Contato</CardTitle>
              <CardDescription>
                Configure a chamada de suporte que aparece no final da página.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="helpContactTitle">Título</Label>
                <Input
                  id="helpContactTitle"
                  value={settings.helpContactTitle || ""}
                  onChange={(e) => setSettings({ ...settings, helpContactTitle: e.target.value })}
                  placeholder="Ainda Precisa de Ajuda?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helpContactDescription">Descrição</Label>
                <Textarea
                  id="helpContactDescription"
                  value={settings.helpContactDescription || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, helpContactDescription: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cards de Suporte</CardTitle>
            <CardDescription>
              Ajuste os textos exibidos nos cards de WhatsApp, telefone e e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <p className="font-medium text-foreground">WhatsApp</p>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={settings.helpWhatsappTitle || ""}
                  onChange={(e) => setSettings({ ...settings, helpWhatsappTitle: e.target.value })}
                  placeholder="WhatsApp"
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={settings.helpWhatsappDescription || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, helpWhatsappDescription: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Botão</Label>
                <Input
                  value={settings.helpWhatsappLabel || ""}
                  onChange={(e) => setSettings({ ...settings, helpWhatsappLabel: e.target.value })}
                  placeholder="Abrir Chat"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <p className="font-medium text-foreground">Telefone</p>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={settings.helpPhoneTitle || ""}
                  onChange={(e) => setSettings({ ...settings, helpPhoneTitle: e.target.value })}
                  placeholder="Telefone"
                />
              </div>
              <div className="space-y-2">
                <Label>Botão</Label>
                <Input
                  value={settings.helpPhoneLabel || ""}
                  onChange={(e) => setSettings({ ...settings, helpPhoneLabel: e.target.value })}
                  placeholder="Ligar Agora"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <p className="font-medium text-foreground">E-mail</p>
              </div>
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={settings.helpEmailTitle || ""}
                  onChange={(e) => setSettings({ ...settings, helpEmailTitle: e.target.value })}
                  placeholder="E-mail"
                />
              </div>
              <div className="space-y-2">
                <Label>Botão</Label>
                <Input
                  value={settings.helpEmailLabel || ""}
                  onChange={(e) => setSettings({ ...settings, helpEmailLabel: e.target.value })}
                  placeholder="Enviar E-mail"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminHelpPage;
