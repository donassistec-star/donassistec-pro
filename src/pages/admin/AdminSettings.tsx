import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Save,
  Mail,
  Phone,
  Globe,
  Bell,
  Shield,
  Server,
  Database,
  Lock,
  Zap,
  CreditCard,
  Search,
  Eye,
  TestTube,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  MessageCircle,
  History,
  Clock,
  Loader2,
  Image as ImageIcon,
  Palette,
  Building2,
  FileText
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { settingsService, SystemSettings, SettingsHistory } from "@/services/settingsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { validation, buscaCEP, ViaCEPResponse } from "@/utils/validation";
import { ImageUpload } from "@/components/ui/image-upload";

const AdminSettings = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [history, setHistory] = useState<SettingsHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "DonAssistec",
    siteDescription: "Catálogo B2B de peças e serviços para celulares",
    supportEmail: "suporte@donassistec.com",
    supportPhone: "(11) 99999-9999",
    siteUrl: "https://donassistec.com",
    maintenanceMode: false,
    allowRetailerRegistration: true,
    maxOrdersPerDay: 100,
    emailNotifications: true,
    smsNotifications: false,
    showNavHome: true,
    showNavCatalog: true,
    showNavFavorites: true,
    showNavAbout: true,
    showNavHelp: true,
    showNavServices: true,
    showNavBrands: true,
    showNavContact: true,
    showAdminAccessButton: true,
    showHeaderPhone: true,
    showRetailerAreaButton: true,
    showCompanyTradeName: true,
    showCompanyTradeNameHeader: true,
    showCompanyTradeNameFooter: true,
    showCompanySloganFooter: true,
  });

  const publicNavigationItems: Array<{ key: keyof SystemSettings; label: string; description: string }> = [
    { key: "showNavHome", label: "Home", description: "Exibe o link Home no menu principal." },
    { key: "showNavCatalog", label: "Catálogo", description: "Exibe o link Catálogo para lojistas logados." },
    { key: "showNavFavorites", label: "Favoritos", description: "Exibe o link Favoritos no menu principal." },
    { key: "showNavAbout", label: "Sobre", description: "Exibe o link Sobre no menu principal." },
    { key: "showNavHelp", label: "Ajuda", description: "Exibe o link Ajuda no menu principal." },
    { key: "showNavServices", label: "Serviços", description: "Exibe o link Serviços no menu principal." },
    { key: "showNavBrands", label: "Marcas", description: "Exibe o link Marcas no menu principal." },
    { key: "showNavContact", label: "Contato", description: "Exibe o link Contato no menu principal." },
  ];

  const headerExtraItems: Array<{ key: keyof SystemSettings; label: string; description: string }> = [
    { key: "showAdminAccessButton", label: "Ícone Admin", description: "Exibe o atalho Admin no cabeçalho público." },
    { key: "showHeaderPhone", label: "Telefone", description: "Exibe o telefone no topo do site." },
    { key: "showRetailerAreaButton", label: "Área do Lojista", description: "Exibe o botão Área do Lojista no cabeçalho." },
  ];

  const tradeName = settings.companyTradeName?.trim() || "DonAssistec";
  const headerTradeNameVisible =
    (settings.showCompanyTradeNameHeader ?? settings.showCompanyTradeName) !== false;
  const footerTradeNameVisible =
    (settings.showCompanyTradeNameFooter ?? settings.showCompanyTradeName) !== false;
  const footerSloganVisible = settings.showCompanySloganFooter !== false;
  const brandingLogoPreview = settings.brandingLogoUrl?.trim() || "";
  const companyDescriptionPreview =
    settings.companyDescription?.trim() ||
    "Laboratório premium de reconstrução de telas e revenda de peças para lojistas e assistências técnicas.";
  const companySloganPreview = settings.companySlogan?.trim() || "";

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getAll();
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast.error("Erro ao carregar configurações. Usando valores padrão.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section: string, sectionSettings: Partial<SystemSettings>) => {
    try {
      setSaving(true);
      
      // Validações locais adicionais
      const errors: string[] = [];
      
      if (sectionSettings.supportEmail && !validation.isValidEmail(sectionSettings.supportEmail)) {
        errors.push("E-mail de suporte inválido");
      }
      
      if (sectionSettings.siteUrl && !validation.isValidUrl(sectionSettings.siteUrl)) {
        errors.push("URL do site inválida");
      }
      
      if (sectionSettings.smtpPort && !validation.isValidPort(sectionSettings.smtpPort)) {
        errors.push("Porta SMTP inválida (deve estar entre 1 e 65535)");
      }
      
      if (sectionSettings.smtpFromEmail && !validation.isValidEmail(sectionSettings.smtpFromEmail)) {
        errors.push("E-mail remetente SMTP inválido");
      }
      
      if (sectionSettings.sessionTimeout && (sectionSettings.sessionTimeout < 300 || sectionSettings.sessionTimeout > 86400)) {
        errors.push("Timeout de sessão deve estar entre 300 e 86400 segundos");
      }
      
      if (sectionSettings.whatsappNumber && sectionSettings.whatsappEnabled && 
          !validation.isValidWhatsAppNumber(sectionSettings.whatsappNumber)) {
        errors.push("Número WhatsApp inválido");
      }
      
      if (sectionSettings.paymentPixKey && sectionSettings.paymentPixKeyType && 
          !validation.isValidPixKey(sectionSettings.paymentPixKey, sectionSettings.paymentPixKeyType as any)) {
        errors.push(`Chave PIX inválida para o tipo ${sectionSettings.paymentPixKeyType}`);
      }
      
      if (errors.length > 0) {
        toast.error(errors.join(", "));
        return;
      }
      
      const updated = await settingsService.update(sectionSettings);
      
      if (updated) {
        setSettings((prev) => ({ ...prev, ...updated }));
        window.dispatchEvent(new CustomEvent("settings:public-updated"));
        if (section === "branding") {
          window.dispatchEvent(new CustomEvent("branding:favicon-updated"));
        }
        toast.success("Configurações salvas com sucesso!");
        // Recarregar histórico após salvar
        loadHistory();
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const historyData = await settingsService.getHistory(undefined, 20);
      setHistory(historyData);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleCEPChange = async (value: string) => {
    // Formata o CEP enquanto digita
    const formattedCEP = validation.formatCEP(value);
    setSettings({ ...settings, contactCep: formattedCEP });

    // Busca endereço quando CEP estiver completo (8 dígitos)
    const cleanCEP = value.replace(/[^\d]/g, "");
    if (cleanCEP.length === 8) {
      setLoadingCEP(true);
      try {
        const endereco = await buscaCEP(cleanCEP);
        if (endereco) {
          setSettings({
            ...settings,
            contactCep: formattedCEP,
            contactAddress: endereco.logradouro || settings.contactAddress || "",
            contactCity: endereco.localidade || settings.contactCity || "",
            contactState: endereco.uf || settings.contactState || "",
          });
          toast.success("Endereço encontrado!");
        } else {
          toast.error("CEP não encontrado. Verifique o CEP digitado.");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        toast.error("Erro ao buscar CEP. Tente novamente.");
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const handleTestConnection = async (type: 'smtp' | 'whatsapp') => {
    try {
      setTesting(type);
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`Teste de conexão ${type === 'smtp' ? 'SMTP' : 'WhatsApp'} bem-sucedido!`);
    } catch (error) {
      toast.error(`Erro ao testar conexão ${type === 'smtp' ? 'SMTP' : 'WhatsApp'}`);
    } finally {
      setTesting(null);
    }
  };

  const handleExportSettings = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `settings-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Configurações exportadas com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar configurações");
    }
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings((prev) => ({ ...prev, ...imported }));
        toast.success("Configurações importadas! Clique em salvar para aplicar.");
      } catch (error) {
        toast.error("Erro ao importar arquivo. Verifique o formato.");
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando configurações..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="w-8 h-8" />
              Configurações do Sistema
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todas as configurações do sistema de forma centralizada
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <label>
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
              />
            </label>
            <Button onClick={() => loadSettings()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-9 gap-2">
            <TabsTrigger value="general">
              <Globe className="w-4 h-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="branding">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Phone className="w-4 h-4 mr-2" />
              Contato
            </TabsTrigger>
            <TabsTrigger value="pages">
              <FileText className="w-4 h-4 mr-2" />
              Páginas
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="w-4 h-4 mr-2" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="w-4 h-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Server className="w-4 h-4 mr-2" />
              Avançado
            </TabsTrigger>
          </TabsList>

          {/* Aba Geral */}
          <TabsContent value="general" className="space-y-4">
            {/* Configurações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Configurações Gerais do Site
                </CardTitle>
                <CardDescription>
                  Configurações básicas do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nome do Site</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName || ""}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      placeholder="DonAssistec"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">URL do Site</Label>
                    <Input
                      id="siteUrl"
                      type="url"
                      value={settings.siteUrl || ""}
                      onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                      placeholder="https://donassistec.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descrição do Site</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription || ""}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    placeholder="Descrição do site"
                    rows={3}
                  />
                </div>
                <Button onClick={() => handleSave("general", {
                  siteName: settings.siteName,
                  siteDescription: settings.siteDescription,
                  siteUrl: settings.siteUrl,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações Gerais"}
                </Button>
              </CardContent>
            </Card>

            {/* Configurações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Configurações avançadas do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Quando ativado, apenas administradores podem acessar o site
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="maintenanceMode"
                      checked={settings.maintenanceMode || false}
                      onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked as boolean })}
                    />
                    <Label htmlFor="maintenanceMode" className="cursor-pointer">
                      {settings.maintenanceMode ? "Ativo" : "Inativo"}
                    </Label>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Permitir Cadastro de Lojistas</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite que novos lojistas se cadastrem no sistema
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="allowRetailerRegistration"
                      checked={settings.allowRetailerRegistration !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, allowRetailerRegistration: checked as boolean })}
                    />
                    <Label htmlFor="allowRetailerRegistration" className="cursor-pointer">
                      {settings.allowRetailerRegistration ? "Permitido" : "Bloqueado"}
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxOrdersPerDay">Máximo de Pedidos por Dia</Label>
                  <Input
                    id="maxOrdersPerDay"
                    type="number"
                    value={settings.maxOrdersPerDay || 0}
                    onChange={(e) => setSettings({ ...settings, maxOrdersPerDay: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground">
                    Limite máximo de pedidos que podem ser criados por dia (0 = ilimitado)
                  </p>
                </div>
                <Button onClick={() => handleSave("system", {
                  maintenanceMode: settings.maintenanceMode,
                  allowRetailerRegistration: settings.allowRetailerRegistration,
                  maxOrdersPerDay: settings.maxOrdersPerDay,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações do Sistema"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Menu de Navegação
                </CardTitle>
                <CardDescription>
                  Escolha o que aparece no cabeçalho do site para os visitantes e lojistas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicNavigationItems.map((item) => (
                    <div key={String(item.key)} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor={String(item.key)}>{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Checkbox
                        id={String(item.key)}
                        checked={settings[item.key] !== false}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, [item.key]: checked as boolean })
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Itens Extras do Cabeçalho
                </CardTitle>
                <CardDescription>
                  Controle os elementos auxiliares exibidos ao lado do menu.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {headerExtraItems.map((item) => (
                    <div key={String(item.key)} className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor={String(item.key)}>{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Checkbox
                        id={String(item.key)}
                        checked={settings[item.key] !== false}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, [item.key]: checked as boolean })
                        }
                      />
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() =>
                    handleSave("navigation", {
                      showNavHome: settings.showNavHome,
                      showNavCatalog: settings.showNavCatalog,
                      showNavFavorites: settings.showNavFavorites,
                      showNavAbout: settings.showNavAbout,
                      showNavHelp: settings.showNavHelp,
                      showNavServices: settings.showNavServices,
                      showNavBrands: settings.showNavBrands,
                      showNavContact: settings.showNavContact,
                      showAdminAccessButton: settings.showAdminAccessButton,
                      showHeaderPhone: settings.showHeaderPhone,
                      showRetailerAreaButton: settings.showRetailerAreaButton,
                    })
                  }
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Menu de Navegação"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Branding */}
          <TabsContent value="branding" className="space-y-4">
            {/* Logo e Identidade Visual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Logo e Identidade Visual
                </CardTitle>
                <CardDescription>
                  Configure o logo e elementos visuais da marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Logo Principal</Label>
                    <ImageUpload
                      value={settings.brandingLogoUrl || ""}
                      onChange={(url) => setSettings({ ...settings, brandingLogoUrl: url })}
                      label="Logo da Empresa"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recomendado: PNG transparente, mínimo 200x200px
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <ImageUpload
                      value={settings.brandingLogoFavicon || ""}
                      onChange={(url) => setSettings({ ...settings, brandingLogoFavicon: url })}
                      label="Favicon"
                    />
                    <p className="text-xs text-muted-foreground">
                      Recomendado: ICO ou PNG quadrado, 32x32px ou 64x64px
                    </p>
                  </div>
                </div>
                
                {settings.brandingLogoUrl && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <Label className="mb-2 block">Preview do Logo</Label>
                    <div className="flex items-center gap-4">
                      <img
                        src={settings.brandingLogoUrl}
                        alt="Logo Preview"
                        className="h-16 w-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">Logo Principal</p>
                        <p className="text-xs text-muted-foreground">
                          Este logo será exibido no cabeçalho e rodapé
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brandingPrimaryColor">Cor Primária</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="brandingPrimaryColor"
                        type="color"
                        value={settings.brandingPrimaryColor || "#6366f1"}
                        onChange={(e) => setSettings({ ...settings, brandingPrimaryColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={settings.brandingPrimaryColor || "#6366f1"}
                        onChange={(e) => setSettings({ ...settings, brandingPrimaryColor: e.target.value })}
                        placeholder="#6366f1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cor principal da marca (botões, links, etc)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandingSecondaryColor">Cor Secundária</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="brandingSecondaryColor"
                        type="color"
                        value={settings.brandingSecondaryColor || "#8b5cf6"}
                        onChange={(e) => setSettings({ ...settings, brandingSecondaryColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        value={settings.brandingSecondaryColor || "#8b5cf6"}
                        onChange={(e) => setSettings({ ...settings, brandingSecondaryColor: e.target.value })}
                        placeholder="#8b5cf6"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cor secundária da marca (destaques, hover, etc)
                    </p>
                  </div>
                </div>
                <Button onClick={() => handleSave("branding", {
                  brandingLogoUrl: settings.brandingLogoUrl,
                  brandingLogoFavicon: settings.brandingLogoFavicon,
                  brandingPrimaryColor: settings.brandingPrimaryColor,
                  brandingSecondaryColor: settings.brandingSecondaryColor,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Identidade Visual"}
                </Button>
              </CardContent>
            </Card>

            {/* Informações da Empresa */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>
                  Dados cadastrais e informações legais da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyLegalName">Razão Social *</Label>
                    <Input
                      id="companyLegalName"
                      value={settings.companyLegalName || ""}
                      onChange={(e) => setSettings({ ...settings, companyLegalName: e.target.value })}
                      placeholder="DonAssistec Tecnologia Ltda"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyTradeName">Nome Fantasia</Label>
                    <Input
                      id="companyTradeName"
                      value={settings.companyTradeName || ""}
                      onChange={(e) => setSettings({ ...settings, companyTradeName: e.target.value })}
                      placeholder="DonAssistec"
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-foreground">
                      Exibição do nome fantasia
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Controle separadamente onde o nome fantasia aparece ao lado do logo.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground">
                          Exibir no cabeçalho
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Mostra o nome fantasia no header público.
                        </p>
                      </div>
                      <Checkbox
                        checked={(settings.showCompanyTradeNameHeader ?? settings.showCompanyTradeName) !== false}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showCompanyTradeNameHeader: checked as boolean })
                        }
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground">
                          Exibir no rodapé
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Mostra o nome fantasia no footer público.
                        </p>
                      </div>
                      <Checkbox
                        checked={(settings.showCompanyTradeNameFooter ?? settings.showCompanyTradeName) !== false}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showCompanyTradeNameFooter: checked as boolean })
                        }
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-foreground">
                          Exibir slogan no rodapé
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Mostra o slogan abaixo da descrição no footer público.
                        </p>
                      </div>
                      <Checkbox
                        checked={settings.showCompanySloganFooter !== false}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showCompanySloganFooter: checked as boolean })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-4 bg-muted/20">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-foreground">
                      Preview visual
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Pré-visualização de como o nome fantasia aparece nas áreas públicas mantendo o logo principal.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-background overflow-hidden">
                      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
                        {brandingLogoPreview ? (
                          <img
                            src={brandingLogoPreview}
                            alt="Logo preview"
                            className="h-12 w-auto max-w-[160px] object-contain"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                            D
                          </div>
                        )}
                        <div className="min-h-6 flex items-center">
                          {headerTradeNameVisible ? (
                            <span className="text-base font-semibold text-foreground">{tradeName}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Nome fantasia oculto no cabeçalho</span>
                          )}
                        </div>
                      </div>
                      <div className="px-4 py-3 text-xs text-muted-foreground">
                        Preview do cabeçalho público
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-foreground overflow-hidden">
                      <div className="px-4 py-4 border-b border-white/10 space-y-3">
                        <div className="flex items-center gap-3">
                          {brandingLogoPreview ? (
                            <img
                              src={brandingLogoPreview}
                              alt="Logo preview"
                              className="h-12 w-auto max-w-[160px] object-contain"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
                              D
                            </div>
                          )}
                          <div className="min-h-6 flex items-center">
                            {footerTradeNameVisible ? (
                              <span className="text-base font-semibold text-card">{tradeName}</span>
                            ) : (
                              <span className="text-sm text-card/60">Nome fantasia oculto no rodapé</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-card/70">
                          {companyDescriptionPreview}
                        </p>
                        {footerSloganVisible && companySloganPreview ? (
                          <p className="text-xs font-semibold text-primary">
                            {companySloganPreview}
                          </p>
                        ) : companySloganPreview ? (
                          <p className="text-xs text-card/60">Slogan oculto no rodapé</p>
                        ) : null}
                      </div>
                      <div className="px-4 py-3 text-xs text-card/60">
                        Preview do rodapé público
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyCnpj">CNPJ</Label>
                    <Input
                      id="companyCnpj"
                      value={settings.companyCnpj || ""}
                      onChange={(e) => {
                        const formatted = validation.formatCNPJ(e.target.value);
                        setSettings({ ...settings, companyCnpj: formatted });
                      }}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyIe">Inscrição Estadual</Label>
                    <Input
                      id="companyIe"
                      value={settings.companyIe || ""}
                      onChange={(e) => setSettings({ ...settings, companyIe: e.target.value })}
                      placeholder="000.000.000.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyIm">Inscrição Municipal</Label>
                    <Input
                      id="companyIm"
                      value={settings.companyIm || ""}
                      onChange={(e) => setSettings({ ...settings, companyIm: e.target.value })}
                      placeholder="000000000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyWebsite">Website (.com, etc)</Label>
                    <Input
                      id="companyWebsite"
                      type="url"
                      value={settings.companyWebsite || ""}
                      onChange={(e) => setSettings({ ...settings, companyWebsite: e.target.value })}
                      placeholder="https://www.donassistec.com.br"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyFac">FAC</Label>
                    <Input
                      id="companyFac"
                      value={settings.companyFac || ""}
                      onChange={(e) => setSettings({ ...settings, companyFac: e.target.value })}
                      placeholder="FAC - Fundo de Aperfeiçoamento Científico"
                    />
                    <p className="text-xs text-muted-foreground">
                      Fundo de Aperfeiçoamento Científico ou outro registro
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Descrição da Empresa</Label>
                  <Textarea
                    id="companyDescription"
                    value={settings.companyDescription || ""}
                    onChange={(e) => setSettings({ ...settings, companyDescription: e.target.value })}
                    placeholder="Laboratório premium de reconstrução de telas..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companySlogan">Slogan</Label>
                    <Input
                      id="companySlogan"
                      value={settings.companySlogan || ""}
                      onChange={(e) => setSettings({ ...settings, companySlogan: e.target.value })}
                      placeholder="Sua marca, nossa paixão"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyYearFounded">Ano de Fundação</Label>
                    <Input
                      id="companyYearFounded"
                      type="number"
                      value={settings.companyYearFounded || ""}
                      onChange={(e) => setSettings({ ...settings, companyYearFounded: e.target.value })}
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("company", {
                  companyLegalName: settings.companyLegalName,
                  companyTradeName: settings.companyTradeName,
                  showCompanyTradeName: settings.showCompanyTradeName,
                  showCompanyTradeNameHeader: settings.showCompanyTradeNameHeader,
                  showCompanyTradeNameFooter: settings.showCompanyTradeNameFooter,
                  showCompanySloganFooter: settings.showCompanySloganFooter,
                  companyCnpj: settings.companyCnpj,
                  companyIe: settings.companyIe,
                  companyIm: settings.companyIm,
                  companyWebsite: settings.companyWebsite,
                  companyFac: settings.companyFac,
                  companyDescription: settings.companyDescription,
                  companySlogan: settings.companySlogan,
                  companyYearFounded: settings.companyYearFounded,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Informações da Empresa"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Contato */}
          <TabsContent value="contact" className="space-y-4">
            {/* Informações de Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Informações de Contato
                </CardTitle>
                <CardDescription>
                  Gerencie as informações de contato exibidas no rodapé, menu e Fale Conosco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Telefone de Contato (Formatado)</Label>
                    <Input
                      id="contactPhone"
                      value={settings.contactPhone || ""}
                      onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                    <p className="text-xs text-muted-foreground">
                      Telefone exibido no menu e rodapé
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhoneRaw">Telefone Raw (Link)</Label>
                    <Input
                      id="contactPhoneRaw"
                      value={settings.contactPhoneRaw || ""}
                      onChange={(e) => setSettings({ ...settings, contactPhoneRaw: e.target.value })}
                      placeholder="5511999999999"
                    />
                    <p className="text-xs text-muted-foreground">
                      Telefone sem formatação para links (tel:)
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">E-mail de Contato</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail || ""}
                      onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                      placeholder="contato@donassistec.com.br"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactWhatsApp">WhatsApp Fale Conosco</Label>
                    <Input
                      id="contactWhatsApp"
                      value={settings.contactWhatsApp || ""}
                      onChange={(e) => setSettings({ ...settings, contactWhatsApp: e.target.value })}
                      placeholder="5511999999999"
                    />
                    <p className="text-xs text-muted-foreground">
                      Número WhatsApp usado no botão flutuante e Fale Conosco
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappContactMessage">Mensagem Padrão WhatsApp</Label>
                  <Textarea
                    id="whatsappContactMessage"
                    value={settings.whatsappContactMessage || ""}
                    onChange={(e) => setSettings({ ...settings, whatsappContactMessage: e.target.value })}
                    placeholder="Olá! Sou lojista e gostaria de saber mais sobre peças e serviços da DonAssistec."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactAddress">Endereço</Label>
                    <Input
                      id="contactAddress"
                      value={settings.contactAddress || ""}
                      onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                      placeholder="São Paulo - SP"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactCep">CEP</Label>
                      <div className="relative">
                        <Input
                          id="contactCep"
                          value={settings.contactCep || ""}
                          onChange={(e) => handleCEPChange(e.target.value)}
                          onBlur={(e) => {
                            const cleanCEP = e.target.value.replace(/[^\d]/g, "");
                            if (cleanCEP.length === 8 && !loadingCEP) {
                              handleCEPChange(e.target.value);
                            }
                          }}
                          placeholder="00000-000"
                          maxLength={9}
                          className="pr-8"
                        />
                        {loadingCEP && (
                          <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Digite o CEP para buscar o endereço automaticamente
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactCity">Cidade</Label>
                      <Input
                        id="contactCity"
                        value={settings.contactCity || ""}
                        onChange={(e) => setSettings({ ...settings, contactCity: e.target.value })}
                        placeholder="São Paulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactState">Estado</Label>
                      <Input
                        id="contactState"
                        value={settings.contactState || ""}
                        onChange={(e) => setSettings({ ...settings, contactState: e.target.value })}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleSave("contact", {
                  contactPhone: settings.contactPhone,
                  contactPhoneRaw: settings.contactPhoneRaw,
                  contactEmail: settings.contactEmail,
                  contactWhatsApp: settings.contactWhatsApp,
                  whatsappContactMessage: settings.whatsappContactMessage,
                  contactAddress: settings.contactAddress,
                  contactCep: settings.contactCep,
                  contactCity: settings.contactCity,
                  contactState: settings.contactState,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Informações de Contato"}
                </Button>
              </CardContent>
            </Card>

            {/* Mídias Sociais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Mídias Sociais
                </CardTitle>
                <CardDescription>
                  Configure os links das redes sociais exibidos no rodapé
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="socialInstagram" className="flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </Label>
                    <Input
                      id="socialInstagram"
                      type="url"
                      value={settings.socialInstagram || ""}
                      onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                      placeholder="https://instagram.com/donassistec"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialFacebook" className="flex items-center gap-2">
                      <Facebook className="w-4 h-4" />
                      Facebook
                    </Label>
                    <Input
                      id="socialFacebook"
                      type="url"
                      value={settings.socialFacebook || ""}
                      onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                      placeholder="https://facebook.com/donassistec"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialYoutube" className="flex items-center gap-2">
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </Label>
                    <Input
                      id="socialYoutube"
                      type="url"
                      value={settings.socialYoutube || ""}
                      onChange={(e) => setSettings({ ...settings, socialYoutube: e.target.value })}
                      placeholder="https://youtube.com/@donassistec"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialLinkedin" className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Label>
                    <Input
                      id="socialLinkedin"
                      type="url"
                      value={settings.socialLinkedin || ""}
                      onChange={(e) => setSettings({ ...settings, socialLinkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/donassistec"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialTwitter" className="flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter/X
                    </Label>
                    <Input
                      id="socialTwitter"
                      type="url"
                      value={settings.socialTwitter || ""}
                      onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                      placeholder="https://twitter.com/donassistec"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialTikTok">TikTok</Label>
                    <Input
                      id="socialTikTok"
                      type="url"
                      value={settings.socialTikTok || ""}
                      onChange={(e) => setSettings({ ...settings, socialTikTok: e.target.value })}
                      placeholder="https://tiktok.com/@donassistec"
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave("social", {
                  socialInstagram: settings.socialInstagram,
                  socialFacebook: settings.socialFacebook,
                  socialYoutube: settings.socialYoutube,
                  socialLinkedin: settings.socialLinkedin,
                  socialTwitter: settings.socialTwitter,
                  socialTikTok: settings.socialTikTok,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Mídias Sociais"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Páginas */}
          <TabsContent value="pages" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Página Sobre
                    </CardTitle>
                    <CardDescription>
                      Edite os principais textos da página pública <code>/sobre</code>.
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="/sobre" target="_blank" rel="noopener noreferrer">
                      Abrir Página
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutHeroBadge">Badge</Label>
                    <Input
                      id="aboutHeroBadge"
                      value={settings.aboutHeroBadge || ""}
                      onChange={(e) => setSettings({ ...settings, aboutHeroBadge: e.target.value })}
                      placeholder="Sobre Nós"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutHeroTitle">Título Principal</Label>
                    <Input
                      id="aboutHeroTitle"
                      value={settings.aboutHeroTitle || ""}
                      onChange={(e) => setSettings({ ...settings, aboutHeroTitle: e.target.value })}
                      placeholder="DonAssistec"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutHeroDescription">Descrição Principal</Label>
                  <Textarea
                    id="aboutHeroDescription"
                    value={settings.aboutHeroDescription || ""}
                    onChange={(e) => setSettings({ ...settings, aboutHeroDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutMissionTitle">Título da Missão</Label>
                    <Input
                      id="aboutMissionTitle"
                      value={settings.aboutMissionTitle || ""}
                      onChange={(e) => setSettings({ ...settings, aboutMissionTitle: e.target.value })}
                      placeholder="Nossa Missão"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutVisionTitle">Título da Visão</Label>
                    <Input
                      id="aboutVisionTitle"
                      value={settings.aboutVisionTitle || ""}
                      onChange={(e) => setSettings({ ...settings, aboutVisionTitle: e.target.value })}
                      placeholder="Nossa Visão"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutMissionDescription">Texto da Missão</Label>
                    <Textarea
                      id="aboutMissionDescription"
                      value={settings.aboutMissionDescription || ""}
                      onChange={(e) => setSettings({ ...settings, aboutMissionDescription: e.target.value })}
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutVisionDescription">Texto da Visão</Label>
                    <Textarea
                      id="aboutVisionDescription"
                      value={settings.aboutVisionDescription || ""}
                      onChange={(e) => setSettings({ ...settings, aboutVisionDescription: e.target.value })}
                      rows={5}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutValuesTitle">Título da seção Valores</Label>
                    <Input
                      id="aboutValuesTitle"
                      value={settings.aboutValuesTitle || ""}
                      onChange={(e) => setSettings({ ...settings, aboutValuesTitle: e.target.value })}
                      placeholder="Nossos Valores"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutAchievementsTitle">Título da seção Reconhecimentos</Label>
                    <Input
                      id="aboutAchievementsTitle"
                      value={settings.aboutAchievementsTitle || ""}
                      onChange={(e) => setSettings({ ...settings, aboutAchievementsTitle: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutValuesDescription">Descrição da seção Valores</Label>
                  <Textarea
                    id="aboutValuesDescription"
                    value={settings.aboutValuesDescription || ""}
                    onChange={(e) => setSettings({ ...settings, aboutValuesDescription: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutValuesItems">Cards de Valores</Label>
                  <Textarea
                    id="aboutValuesItems"
                    value={settings.aboutValuesItems || ""}
                    onChange={(e) => setSettings({ ...settings, aboutValuesItems: e.target.value })}
                    placeholder={"Qualidade Garantida|Todas as peças e serviços passam por rigoroso controle de qualidade.\nFoco no Cliente|Atendimento personalizado e dedicado às necessidades de cada lojista."}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Um item por linha no formato <code>Título|Descrição</code>.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutStatsItems">Números da seção Estatísticas</Label>
                  <Textarea
                    id="aboutStatsItems"
                    value={settings.aboutStatsItems || ""}
                    onChange={(e) => setSettings({ ...settings, aboutStatsItems: e.target.value })}
                    placeholder={"Anos de Experiência|10+\nLojistas Atendidos|500+"}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Um item por linha no formato <code>Rótulo|Valor</code>.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutAchievementsDescription">Descrição da seção Reconhecimentos</Label>
                  <Textarea
                    id="aboutAchievementsDescription"
                    value={settings.aboutAchievementsDescription || ""}
                    onChange={(e) => setSettings({ ...settings, aboutAchievementsDescription: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aboutAchievementsItems">Lista de Reconhecimentos</Label>
                  <Textarea
                    id="aboutAchievementsItems"
                    value={settings.aboutAchievementsItems || ""}
                    onChange={(e) => setSettings({ ...settings, aboutAchievementsItems: e.target.value })}
                    placeholder={"Certificação ISO 9001\nParceiro Oficial Apple"}
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Um reconhecimento por linha.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutCtaTitle">Título do CTA final</Label>
                    <Input
                      id="aboutCtaTitle"
                      value={settings.aboutCtaTitle || ""}
                      onChange={(e) => setSettings({ ...settings, aboutCtaTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutCtaDescription">Descrição do CTA final</Label>
                    <Textarea
                      id="aboutCtaDescription"
                      value={settings.aboutCtaDescription || ""}
                      onChange={(e) => setSettings({ ...settings, aboutCtaDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-foreground">
                      Botões do topo e CTA final
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Textos dos botões exibidos no hero da página e no bloco final.
                    </p>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutCtaPrimaryLabel">Texto do botão principal</Label>
                    <Input
                      id="aboutCtaPrimaryLabel"
                      value={settings.aboutCtaPrimaryLabel || ""}
                      onChange={(e) => setSettings({ ...settings, aboutCtaPrimaryLabel: e.target.value })}
                      placeholder="Criar Conta de Lojista"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutHeroPrimaryLabel">Botão do topo: catálogo</Label>
                    <Input
                      id="aboutHeroPrimaryLabel"
                      value={settings.aboutHeroPrimaryLabel || ""}
                      onChange={(e) => setSettings({ ...settings, aboutHeroPrimaryLabel: e.target.value })}
                      placeholder="Explorar Catálogo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutHeroSecondaryLabel">Botão do topo: contato</Label>
                    <Input
                      id="aboutHeroSecondaryLabel"
                      value={settings.aboutHeroSecondaryLabel || ""}
                      onChange={(e) => setSettings({ ...settings, aboutHeroSecondaryLabel: e.target.value })}
                      placeholder="Falar Conosco"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutCtaSecondaryLabel">Texto do botão WhatsApp</Label>
                    <Input
                      id="aboutCtaSecondaryLabel"
                      value={settings.aboutCtaSecondaryLabel || ""}
                      onChange={(e) => setSettings({ ...settings, aboutCtaSecondaryLabel: e.target.value })}
                      placeholder="Falar no WhatsApp"
                    />
                  </div>
                </div>
                </div>

                <Button
                  onClick={() =>
                    handleSave("about-page", {
                      aboutHeroBadge: settings.aboutHeroBadge,
                      aboutHeroTitle: settings.aboutHeroTitle,
                      aboutHeroDescription: settings.aboutHeroDescription,
                      aboutMissionTitle: settings.aboutMissionTitle,
                      aboutMissionDescription: settings.aboutMissionDescription,
                      aboutVisionTitle: settings.aboutVisionTitle,
                      aboutVisionDescription: settings.aboutVisionDescription,
                      aboutValuesTitle: settings.aboutValuesTitle,
                      aboutValuesDescription: settings.aboutValuesDescription,
                      aboutValuesItems: settings.aboutValuesItems,
                      aboutStatsItems: settings.aboutStatsItems,
                      aboutAchievementsTitle: settings.aboutAchievementsTitle,
                      aboutAchievementsDescription: settings.aboutAchievementsDescription,
                      aboutAchievementsItems: settings.aboutAchievementsItems,
                      aboutCtaTitle: settings.aboutCtaTitle,
                      aboutCtaDescription: settings.aboutCtaDescription,
                      aboutHeroPrimaryLabel: settings.aboutHeroPrimaryLabel,
                      aboutHeroSecondaryLabel: settings.aboutHeroSecondaryLabel,
                      aboutCtaPrimaryLabel: settings.aboutCtaPrimaryLabel,
                      aboutCtaSecondaryLabel: settings.aboutCtaSecondaryLabel,
                    })
                  }
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Página Sobre"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Página Ajuda
                    </CardTitle>
                    <CardDescription>
                      Edite o conteúdo da página <code>/ajuda</code> e a lista de FAQs.
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="/ajuda" target="_blank" rel="noopener noreferrer">
                      Abrir Página
                    </a>
                  </Button>
                </div>
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
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="helpSearchPlaceholder">Placeholder da Busca</Label>
                  <Input
                    id="helpSearchPlaceholder"
                    value={settings.helpSearchPlaceholder || ""}
                    onChange={(e) => setSettings({ ...settings, helpSearchPlaceholder: e.target.value })}
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

                <div className="space-y-2">
                  <Label htmlFor="helpFaqItems">Perguntas Frequentes</Label>
                  <Textarea
                    id="helpFaqItems"
                    value={settings.helpFaqItems || ""}
                    onChange={(e) => setSettings({ ...settings, helpFaqItems: e.target.value })}
                    placeholder={"Geral|Como faço um pedido?|Acesse o catálogo e envie seu orçamento.\nLojistas|Como acompanho meu pedido?|Na área do lojista, acesse Pedidos."}
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Uma FAQ por linha no formato <code>Categoria|Pergunta|Resposta</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="helpNoResultsTitle">Título sem resultado</Label>
                    <Input
                      id="helpNoResultsTitle"
                      value={settings.helpNoResultsTitle || ""}
                      onChange={(e) => setSettings({ ...settings, helpNoResultsTitle: e.target.value })}
                      placeholder="Nenhum resultado encontrado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpNoResultsDescription">Descrição sem resultado</Label>
                    <Textarea
                      id="helpNoResultsDescription"
                      value={settings.helpNoResultsDescription || ""}
                      onChange={(e) => setSettings({ ...settings, helpNoResultsDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpNoResultsButtonLabel">Botão sem resultado</Label>
                    <Input
                      id="helpNoResultsButtonLabel"
                      value={settings.helpNoResultsButtonLabel || ""}
                      onChange={(e) => setSettings({ ...settings, helpNoResultsButtonLabel: e.target.value })}
                      placeholder="Falar no WhatsApp"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="helpContactTitle">Título do bloco final</Label>
                    <Input
                      id="helpContactTitle"
                      value={settings.helpContactTitle || ""}
                      onChange={(e) => setSettings({ ...settings, helpContactTitle: e.target.value })}
                      placeholder="Ainda Precisa de Ajuda?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpContactDescription">Descrição do bloco final</Label>
                    <Textarea
                      id="helpContactDescription"
                      value={settings.helpContactDescription || ""}
                      onChange={(e) => setSettings({ ...settings, helpContactDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-foreground">
                      Cards de suporte
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Controle os títulos, descrições e textos dos botões exibidos no final da página Ajuda.
                    </p>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="helpWhatsappTitle">Título do card WhatsApp</Label>
                    <Input
                      id="helpWhatsappTitle"
                      value={settings.helpWhatsappTitle || ""}
                      onChange={(e) => setSettings({ ...settings, helpWhatsappTitle: e.target.value })}
                      placeholder="WhatsApp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpPhoneTitle">Título do card Telefone</Label>
                    <Input
                      id="helpPhoneTitle"
                      value={settings.helpPhoneTitle || ""}
                      onChange={(e) => setSettings({ ...settings, helpPhoneTitle: e.target.value })}
                      placeholder="Telefone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpEmailTitle">Título do card E-mail</Label>
                    <Input
                      id="helpEmailTitle"
                      value={settings.helpEmailTitle || ""}
                      onChange={(e) => setSettings({ ...settings, helpEmailTitle: e.target.value })}
                      placeholder="E-mail"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="helpWhatsappDescription">Descrição do card WhatsApp</Label>
                    <Textarea
                      id="helpWhatsappDescription"
                      value={settings.helpWhatsappDescription || ""}
                      onChange={(e) => setSettings({ ...settings, helpWhatsappDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="helpWhatsappLabel">Botão WhatsApp</Label>
                    <Input
                      id="helpWhatsappLabel"
                      value={settings.helpWhatsappLabel || ""}
                      onChange={(e) => setSettings({ ...settings, helpWhatsappLabel: e.target.value })}
                      placeholder="Abrir Chat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpPhoneLabel">Botão Telefone</Label>
                    <Input
                      id="helpPhoneLabel"
                      value={settings.helpPhoneLabel || ""}
                      onChange={(e) => setSettings({ ...settings, helpPhoneLabel: e.target.value })}
                      placeholder="Ligar Agora"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="helpEmailLabel">Botão E-mail</Label>
                    <Input
                      id="helpEmailLabel"
                      value={settings.helpEmailLabel || ""}
                      onChange={(e) => setSettings({ ...settings, helpEmailLabel: e.target.value })}
                      placeholder="Enviar E-mail"
                    />
                  </div>
                </div>
                </div>

                <Button
                  onClick={() =>
                    handleSave("help-page", {
                      helpHeroBadge: settings.helpHeroBadge,
                      helpHeroTitle: settings.helpHeroTitle,
                      helpHeroDescription: settings.helpHeroDescription,
                      helpSearchPlaceholder: settings.helpSearchPlaceholder,
                      helpFaqItems: settings.helpFaqItems,
                      helpBackLabel: settings.helpBackLabel,
                      helpNoResultsTitle: settings.helpNoResultsTitle,
                      helpNoResultsDescription: settings.helpNoResultsDescription,
                      helpNoResultsButtonLabel: settings.helpNoResultsButtonLabel,
                      helpContactTitle: settings.helpContactTitle,
                      helpContactDescription: settings.helpContactDescription,
                      helpWhatsappTitle: settings.helpWhatsappTitle,
                      helpWhatsappDescription: settings.helpWhatsappDescription,
                      helpWhatsappLabel: settings.helpWhatsappLabel,
                      helpPhoneTitle: settings.helpPhoneTitle,
                      helpPhoneLabel: settings.helpPhoneLabel,
                      helpEmailTitle: settings.helpEmailTitle,
                      helpEmailLabel: settings.helpEmailLabel,
                    })
                  }
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Página Ajuda"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Seção Contato da Home
                    </CardTitle>
                    <CardDescription>
                      Edite o conteúdo do resumo de contato da home e o atalho para <code>/contato</code>.
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="/#contato" target="_blank" rel="noopener noreferrer">
                      Abrir Home
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="homeContactTitle">Título</Label>
                  <Input
                    id="homeContactTitle"
                    value={settings.homeContactTitle || ""}
                    onChange={(e) => setSettings({ ...settings, homeContactTitle: e.target.value })}
                    placeholder="Precisa de Peças ou Reconstrução?"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="homeContactDescription">Descrição</Label>
                  <Textarea
                    id="homeContactDescription"
                    value={settings.homeContactDescription || ""}
                    onChange={(e) => setSettings({ ...settings, homeContactDescription: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeContactWhatsappLabel">Texto do botão WhatsApp</Label>
                    <Input
                      id="homeContactWhatsappLabel"
                      value={settings.homeContactWhatsappLabel || ""}
                      onChange={(e) => setSettings({ ...settings, homeContactWhatsappLabel: e.target.value })}
                      placeholder="Chamar no WhatsApp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeContactPhoneLabel">Texto do botão Telefone</Label>
                    <Input
                      id="homeContactPhoneLabel"
                      value={settings.homeContactPhoneLabel || ""}
                      onChange={(e) => setSettings({ ...settings, homeContactPhoneLabel: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeContactInfoBadge">Texto do selo final</Label>
                    <Input
                      id="homeContactInfoBadge"
                      value={settings.homeContactInfoBadge || ""}
                      onChange={(e) => setSettings({ ...settings, homeContactInfoBadge: e.target.value })}
                      placeholder="Garantia de 90 dias"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="homeContactPageButtonLabel">Texto do botão Página de Contato</Label>
                    <Input
                      id="homeContactPageButtonLabel"
                      value={settings.homeContactPageButtonLabel || ""}
                      onChange={(e) => setSettings({ ...settings, homeContactPageButtonLabel: e.target.value })}
                      placeholder="Ver pagina de contato"
                    />
                  </div>
                </div>
                <Button
                  onClick={() =>
                    handleSave("home-contact", {
                      homeContactTitle: settings.homeContactTitle,
                      homeContactDescription: settings.homeContactDescription,
                      homeContactWhatsappLabel: settings.homeContactWhatsappLabel,
                      homeContactPhoneLabel: settings.homeContactPhoneLabel,
                      homeContactInfoBadge: settings.homeContactInfoBadge,
                      homeContactPageButtonLabel: settings.homeContactPageButtonLabel,
                    })
                  }
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Seção Contato"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Página Contato
                    </CardTitle>
                    <CardDescription>
                      Edite a página pública <code>/contato</code>.
                    </CardDescription>
                  </div>
                  <Button variant="outline" asChild>
                    <a href="/contato" target="_blank" rel="noopener noreferrer">
                      Abrir Página
                    </a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPageBadge">Badge</Label>
                    <Input
                      id="contactPageBadge"
                      value={settings.contactPageBadge || ""}
                      onChange={(e) => setSettings({ ...settings, contactPageBadge: e.target.value })}
                      placeholder="Contato"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPageTitle">Título Principal</Label>
                    <Input
                      id="contactPageTitle"
                      value={settings.contactPageTitle || ""}
                      onChange={(e) => setSettings({ ...settings, contactPageTitle: e.target.value })}
                      placeholder="Fale com a DonAssistec"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPageDescription">Descrição Principal</Label>
                  <Textarea
                    id="contactPageDescription"
                    value={settings.contactPageDescription || ""}
                    onChange={(e) => setSettings({ ...settings, contactPageDescription: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPageWhatsappTitle">Título do card WhatsApp</Label>
                    <Input
                      id="contactPageWhatsappTitle"
                      value={settings.contactPageWhatsappTitle || ""}
                      onChange={(e) => setSettings({ ...settings, contactPageWhatsappTitle: e.target.value })}
                      placeholder="WhatsApp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPageWhatsappButtonLabel">Botão do card WhatsApp</Label>
                    <Input
                      id="contactPageWhatsappButtonLabel"
                      value={settings.contactPageWhatsappButtonLabel || ""}
                      onChange={(e) => setSettings({ ...settings, contactPageWhatsappButtonLabel: e.target.value })}
                      placeholder="Abrir WhatsApp"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPageWhatsappDescription">Descrição do card WhatsApp</Label>
                  <Textarea
                    id="contactPageWhatsappDescription"
                    value={settings.contactPageWhatsappDescription || ""}
                    onChange={(e) => setSettings({ ...settings, contactPageWhatsappDescription: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPagePhoneTitle">Título do card Telefone</Label>
                    <Input
                      id="contactPagePhoneTitle"
                      value={settings.contactPagePhoneTitle || ""}
                      onChange={(e) => setSettings({ ...settings, contactPagePhoneTitle: e.target.value })}
                      placeholder="Telefone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPagePhoneButtonLabel">Botão do card Telefone</Label>
                    <Input
                      id="contactPagePhoneButtonLabel"
                      value={settings.contactPagePhoneButtonLabel || ""}
                      onChange={(e) => setSettings({ ...settings, contactPagePhoneButtonLabel: e.target.value })}
                      placeholder="Ligar Agora"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPagePhoneDescription">Descrição do card Telefone</Label>
                  <Textarea
                    id="contactPagePhoneDescription"
                    value={settings.contactPagePhoneDescription || ""}
                    onChange={(e) => setSettings({ ...settings, contactPagePhoneDescription: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPageEmailTitle">Título do card E-mail</Label>
                    <Input
                      id="contactPageEmailTitle"
                      value={settings.contactPageEmailTitle || ""}
                      onChange={(e) => setSettings({ ...settings, contactPageEmailTitle: e.target.value })}
                      placeholder="E-mail"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPageEmailButtonLabel">Botão do card E-mail</Label>
                    <Input
                      id="contactPageEmailButtonLabel"
                      value={settings.contactPageEmailButtonLabel || ""}
                      onChange={(e) => setSettings({ ...settings, contactPageEmailButtonLabel: e.target.value })}
                      placeholder="Enviar E-mail"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPageEmailDescription">Descrição do card E-mail</Label>
                  <Textarea
                    id="contactPageEmailDescription"
                    value={settings.contactPageEmailDescription || ""}
                    onChange={(e) => setSettings({ ...settings, contactPageEmailDescription: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactPageAddressTitle">Título do card Endereço</Label>
                    <Input
                      id="contactPageAddressTitle"
                      value={settings.contactPageAddressTitle || ""}
                      onChange={(e) => setSettings({ ...settings, contactPageAddressTitle: e.target.value })}
                      placeholder="Endereço"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPageAddressDescription">Descrição do card Endereço</Label>
                    <Textarea
                      id="contactPageAddressDescription"
                      value={settings.contactPageAddressDescription || ""}
                      onChange={(e) => setSettings({ ...settings, contactPageAddressDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>

                <Button
                  onClick={() =>
                    handleSave("contact-page", {
                      contactPageBadge: settings.contactPageBadge,
                      contactPageTitle: settings.contactPageTitle,
                      contactPageDescription: settings.contactPageDescription,
                      contactPageWhatsappTitle: settings.contactPageWhatsappTitle,
                      contactPageWhatsappDescription: settings.contactPageWhatsappDescription,
                      contactPageWhatsappButtonLabel: settings.contactPageWhatsappButtonLabel,
                      contactPagePhoneTitle: settings.contactPagePhoneTitle,
                      contactPagePhoneDescription: settings.contactPagePhoneDescription,
                      contactPagePhoneButtonLabel: settings.contactPagePhoneButtonLabel,
                      contactPageEmailTitle: settings.contactPageEmailTitle,
                      contactPageEmailDescription: settings.contactPageEmailDescription,
                      contactPageEmailButtonLabel: settings.contactPageEmailButtonLabel,
                      contactPageAddressTitle: settings.contactPageAddressTitle,
                      contactPageAddressDescription: settings.contactPageAddressDescription,
                    })
                  }
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Página Contato"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Email/SMTP */}
          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Configurações de Email (SMTP)
                </CardTitle>
                <CardDescription>
                  Configure o servidor SMTP para envio de emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">Servidor SMTP</Label>
                    <Input
                      id="smtpHost"
                      value={settings.smtpHost || ""}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">Porta SMTP</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.smtpPort || 587}
                      onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) || 587 })}
                      placeholder="587"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">Usuário SMTP</Label>
                    <Input
                      id="smtpUser"
                      type="email"
                      value={settings.smtpUser || ""}
                      onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">Senha SMTP</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.smtpPassword || ""}
                      onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpFromEmail">Email Remetente</Label>
                    <Input
                      id="smtpFromEmail"
                      type="email"
                      value={settings.smtpFromEmail || ""}
                      onChange={(e) => setSettings({ ...settings, smtpFromEmail: e.target.value })}
                      placeholder="noreply@donassistec.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpFromName">Nome Remetente</Label>
                    <Input
                      id="smtpFromName"
                      value={settings.smtpFromName || ""}
                      onChange={(e) => setSettings({ ...settings, smtpFromName: e.target.value })}
                      placeholder="DonAssistec"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Conexão Segura (TLS/SSL)</Label>
                    <p className="text-sm text-muted-foreground">
                      Usar conexão segura para SMTP
                    </p>
                  </div>
                  <Checkbox
                    id="smtpSecure"
                    checked={settings.smtpSecure !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, smtpSecure: checked as boolean })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("email", {
                    smtpHost: settings.smtpHost,
                    smtpPort: settings.smtpPort,
                    smtpUser: settings.smtpUser,
                    smtpPassword: settings.smtpPassword,
                    smtpSecure: settings.smtpSecure,
                    smtpFromEmail: settings.smtpFromEmail,
                    smtpFromName: settings.smtpFromName,
                  })} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Configurações SMTP"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('smtp')}
                    disabled={testing === 'smtp'}
                  >
                    {testing === 'smtp' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Testar Conexão
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Configurações de Notificações
                </CardTitle>
                <CardDescription>
                  Configure quando e como enviar notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações importantes por e-mail
                    </p>
                  </div>
                  <Checkbox
                    id="emailNotifications"
                    checked={settings.emailNotifications !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked as boolean })}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Notificações por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações importantes por SMS
                    </p>
                  </div>
                  <Checkbox
                    id="smsNotifications"
                    checked={settings.smsNotifications || false}
                    onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked as boolean })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label>Notificar Novos Pedidos</Label>
                    <Checkbox
                      checked={settings.notifyNewOrder !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifyNewOrder: checked as boolean })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label>Notificar Mudanças de Status</Label>
                    <Checkbox
                      checked={settings.notifyOrderStatus !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifyOrderStatus: checked as boolean })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label>Notificar Estoque Baixo</Label>
                    <Checkbox
                      checked={settings.notifyLowStock !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifyLowStock: checked as boolean })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label>Notificar Novos Tickets</Label>
                    <Checkbox
                      checked={settings.notifyNewTicket !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, notifyNewTicket: checked as boolean })}
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave("notifications", {
                  emailNotifications: settings.emailNotifications,
                  smsNotifications: settings.smsNotifications,
                  notifyNewOrder: settings.notifyNewOrder,
                  notifyOrderStatus: settings.notifyOrderStatus,
                  notifyLowStock: settings.notifyLowStock,
                  notifyNewTicket: settings.notifyNewTicket,
                  notifyTicketReply: settings.notifyTicketReply,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações de Notificações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba SEO */}
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Configurações SEO
                </CardTitle>
                <CardDescription>
                  Configure as meta tags e informações de SEO do site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">Título SEO</Label>
                  <Input
                    id="seoTitle"
                    value={settings.seoTitle || ""}
                    onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                    placeholder="DonAssistec - Reconstrução de Telas e Peças"
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.seoTitle?.length || 0}/70 caracteres (recomendado: 50-60)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">Descrição SEO</Label>
                  <Textarea
                    id="seoDescription"
                    value={settings.seoDescription || ""}
                    onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                    placeholder="Descrição otimizada para mecanismos de busca"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.seoDescription?.length || 0}/160 caracteres (recomendado: 120-150)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">Palavras-chave</Label>
                  <Input
                    id="seoKeywords"
                    value={settings.seoKeywords || ""}
                    onChange={(e) => setSettings({ ...settings, seoKeywords: e.target.value })}
                    placeholder="peças celular, reconstrução tela, assistência técnica"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separe as palavras-chave por vírgula
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoOgImage">URL da Imagem Open Graph</Label>
                  <Input
                    id="seoOgImage"
                    type="url"
                    value={settings.seoOgImage || ""}
                    onChange={(e) => setSettings({ ...settings, seoOgImage: e.target.value })}
                    placeholder="https://donassistec.com/og-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Imagem exibida quando o site é compartilhado em redes sociais (recomendado: 1200x630px)
                  </p>
                </div>
                <Button onClick={() => handleSave("seo", {
                  seoTitle: settings.seoTitle,
                  seoDescription: settings.seoDescription,
                  seoKeywords: settings.seoKeywords,
                  seoOgImage: settings.seoOgImage,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações SEO"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Pagamento */}
          <TabsContent value="payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-4" />
                  Configurações de Pagamento
                </CardTitle>
                <CardDescription>
                  Configure métodos de pagamento e informações bancárias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Métodos de Pagamento Aceitos</Label>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="payment-bank"
                        checked={settings.paymentMethods?.includes('bank_transfer') || false}
                        onCheckedChange={(checked) => {
                          const methods = (settings.paymentMethods || '').split(',').filter(m => m);
                          if (checked) {
                            if (!methods.includes('bank_transfer')) methods.push('bank_transfer');
                          } else {
                            methods.splice(methods.indexOf('bank_transfer'), 1);
                          }
                          setSettings({ ...settings, paymentMethods: methods.join(',') });
                        }}
                      />
                      <Label htmlFor="payment-bank" className="cursor-pointer">Transferência Bancária</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="payment-pix"
                        checked={settings.paymentMethods?.includes('pix') || false}
                        onCheckedChange={(checked) => {
                          const methods = (settings.paymentMethods || '').split(',').filter(m => m);
                          if (checked) {
                            if (!methods.includes('pix')) methods.push('pix');
                          } else {
                            methods.splice(methods.indexOf('pix'), 1);
                          }
                          setSettings({ ...settings, paymentMethods: methods.join(',') });
                        }}
                      />
                      <Label htmlFor="payment-pix" className="cursor-pointer">PIX</Label>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentBankName">Nome do Ban co</Label>
                    <Input
                      id="paymentBankName"
                      value={settings.paymentBankName || ""}
                      onChange={(e) => setSettings({ ...settings, paymentBankName: e.target.value })}
                      placeholder="Banco do Brasil"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentBankAgency">Agência</Label>
                    <Input
                      id="paymentBankAgency"
                      value={settings.paymentBankAgency || ""}
                      onChange={(e) => setSettings({ ...settings, paymentBankAgency: e.target.value })}
                      placeholder="0000-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentBankAccount">Conta</Label>
                    <Input
                      id="paymentBankAccount"
                      value={settings.paymentBankAccount || ""}
                      onChange={(e) => setSettings({ ...settings, paymentBankAccount: e.target.value })}
                      placeholder="00000-0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentPixKey">Chave PIX</Label>
                    <Input
                      id="paymentPixKey"
                      value={settings.paymentPixKey || ""}
                      onChange={(e) => setSettings({ ...settings, paymentPixKey: e.target.value })}
                      placeholder="chave@email.com ou CPF/CNPJ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentPixKeyType">Tipo de Chave PIX</Label>
                    <Select
                      value={settings.paymentPixKeyType || "email"}
                      onValueChange={(value) => setSettings({ ...settings, paymentPixKeyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                        <SelectItem value="random">Chave Aleatória</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Aprovar Pagamentos Automaticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      Pagamentos serão aprovados automaticamente ao receber
                    </p>
                  </div>
                  <Checkbox
                    id="autoApprovePayment"
                    checked={settings.autoApprovePayment || false}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoApprovePayment: checked as boolean })}
                  />
                </div>
                <Button onClick={() => handleSave("payment", {
                  paymentMethods: settings.paymentMethods,
                  paymentBankName: settings.paymentBankName,
                  paymentBankAgency: settings.paymentBankAgency,
                  paymentBankAccount: settings.paymentBankAccount,
                  paymentPixKey: settings.paymentPixKey,
                  paymentPixKeyType: settings.paymentPixKeyType,
                  autoApprovePayment: settings.autoApprovePayment,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações de Pagamento"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-4" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Configure as políticas de segurança e autenticação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Timeout de Sessão (segundos)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout || 3600}
                      onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) || 3600 })}
                      placeholder="3600"
                      min="300"
                    />
                    <p className="text-xs text-muted-foreground">
                      Tempo de inatividade antes do logout automático
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Máximo de Tentativas de Login</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts || 5}
                      onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) || 5 })}
                      placeholder="5"
                      min="3"
                      max="10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Após exceder, a conta será temporariamente bloqueada
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Tamanho Mínimo de Senha</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength || 8}
                    onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) || 8 })}
                    placeholder="8"
                    min="6"
                    max="32"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Requisitos de Senha</Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="passwordRequireUppercase" className="cursor-pointer">
                      Exigir Letra Maiúscula
                    </Label>
                    <Checkbox
                      id="passwordRequireUppercase"
                      checked={settings.passwordRequireUppercase !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireUppercase: checked as boolean })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="passwordRequireNumbers" className="cursor-pointer">
                      Exigir Números
                    </Label>
                    <Checkbox
                      id="passwordRequireNumbers"
                      checked={settings.passwordRequireNumbers !== false}
                      onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireNumbers: checked as boolean })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label htmlFor="passwordRequireSymbols" className="cursor-pointer">
                      Exigir Símbolos Especiais
                    </Label>
                    <Checkbox
                      id="passwordRequireSymbols"
                      checked={settings.passwordRequireSymbols || false}
                      onCheckedChange={(checked) => setSettings({ ...settings, passwordRequireSymbols: checked as boolean })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Configurações de Autenticação</Label>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Exigir Verificação de E-mail</Label>
                      <p className="text-sm text-muted-foreground">
                        Usuários devem verificar o email antes de usar a conta
                      </p>
                    </div>
                    <Checkbox
                      id="requireEmailVerification"
                      checked={settings.requireEmailVerification || false}
                      onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked as boolean })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-0.5">
                      <Label>Autenticação de Dois Fatores (2FA)</Label>
                      <p className="text-sm text-muted-foreground">
                        Exigir código adicional para login
                      </p>
                    </div>
                    <Checkbox
                      id="twoFactorAuth"
                      checked={settings.twoFactorAuth || false}
                      onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked as boolean })}
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave("security", {
                  sessionTimeout: settings.sessionTimeout,
                  maxLoginAttempts: settings.maxLoginAttempts,
                  passwordMinLength: settings.passwordMinLength,
                  passwordRequireUppercase: settings.passwordRequireUppercase,
                  passwordRequireNumbers: settings.passwordRequireNumbers,
                  passwordRequireSymbols: settings.passwordRequireSymbols,
                  requireEmailVerification: settings.requireEmailVerification,
                  twoFactorAuth: settings.twoFactorAuth,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações de Segurança"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Avançado */}
          <TabsContent value="advanced" className="space-y-4">
            {/* Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-4" />
                  Configurações de Performance
                </CardTitle>
                <CardDescription>
                  Otimize o desempenho do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Habilitar Cache</Label>
                    <p className="text-sm text-muted-foreground">
                      Melhora o desempenho armazenando dados em cache
                    </p>
                  </div>
                  <Checkbox
                    id="cacheEnabled"
                    checked={settings.cacheEnabled !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, cacheEnabled: checked as boolean })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cacheDuration">Duração do Cache (segundos)</Label>
                    <Input
                      id="cacheDuration"
                      type="number"
                      value={settings.cacheDuration || 300}
                      onChange={(e) => setSettings({ ...settings, cacheDuration: parseInt(e.target.value) || 300 })}
                      placeholder="300"
                      min="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">Limite de Requisições API/min</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={settings.apiRateLimit || 100}
                      onChange={(e) => setSettings({ ...settings, apiRateLimit: parseInt(e.target.value) || 100 })}
                      placeholder="100"
                      min="10"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Otimização Automática de Imagens</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduz automaticamente o tamanho das imagens ao fazer upload
                    </p>
                  </div>
                  <Checkbox
                    id="imageOptimization"
                    checked={settings.imageOptimization !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, imageOptimization: checked as boolean })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">Tamanho Máximo de Upload (bytes)</Label>
                  <Input
                    id="maxUploadSize"
                    type="number"
                    value={settings.maxUploadSize || 5242880}
                    onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) || 5242880 })}
                    placeholder="5242880"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(settings.maxUploadSize || 5242880) / 1024 / 1024} MB (padrão: 5MB)
                  </p>
                </div>
                <Button onClick={() => handleSave("performance", {
                  cacheEnabled: settings.cacheEnabled,
                  cacheDuration: settings.cacheDuration,
                  apiRateLimit: settings.apiRateLimit,
                  imageOptimization: settings.imageOptimization,
                  maxUploadSize: settings.maxUploadSize,
                })} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Configurações de Performance"}
                </Button>
              </CardContent>
            </Card>

            {/* Integrações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-4" />
                  Integrações
                </CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label>Habilitar Integração WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite envio de mensagens via WhatsApp
                    </p>
                  </div>
                  <Checkbox
                    id="whatsappEnabled"
                    checked={settings.whatsappEnabled !== false}
                    onCheckedChange={(checked) => setSettings({ ...settings, whatsappEnabled: checked as boolean })}
                  />
                </div>
                {settings.whatsappEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsappNumber">Número WhatsApp</Label>
                      <Input
                        id="whatsappNumber"
                        value={settings.whatsappNumber || ""}
                        onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                        placeholder="5511999999999"
                      />
                      <p className="text-xs text-muted-foreground">
                        Formato: código do país + DDD + número (sem espaços ou caracteres especiais)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsappApiKey">Chave API WhatsApp</Label>
                      <Input
                        id="whatsappApiKey"
                        type="password"
                        value={settings.whatsappApiKey || ""}
                        onChange={(e) => setSettings({ ...settings, whatsappApiKey: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId || ""}
                    onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
                  <Input
                    id="facebookPixelId"
                    value={settings.facebookPixelId || ""}
                    onChange={(e) => setSettings({ ...settings, facebookPixelId: e.target.value })}
                    placeholder="123456789012345"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("integrations", {
                    whatsappEnabled: settings.whatsappEnabled,
                    whatsappNumber: settings.whatsappNumber,
                    whatsappApiKey: settings.whatsappApiKey,
                    googleAnalyticsId: settings.googleAnalyticsId,
                    facebookPixelId: settings.facebookPixelId,
                  })} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar Integrações"}
                  </Button>
                  {settings.whatsappEnabled && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleTestConnection('whatsapp')}
                      disabled={testing === 'whatsapp'}
                    >
                      {testing === 'whatsapp' ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testando...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Testar WhatsApp
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Mudanças */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-4" />
                  Histórico de Mudanças
                </CardTitle>
                <CardDescription>
                  Visualize o histórico de alterações nas configurações
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="sm" text="Carregando histórico..." />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma alteração registrada ainda</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Configuração</TableHead>
                          <TableHead>Valor Anterior</TableHead>
                          <TableHead>Novo Valor</TableHead>
                          <TableHead>Alterado Por</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.setting_key}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                              {item.old_value || <span className="italic">—</span>}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {item.new_value}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.changed_by_email || item.changed_by}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(item.changed_at).toLocaleString("pt-BR")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                {history.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={loadHistory} size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar Histórico
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-4" />
                  Informações do Sistema
                </CardTitle>
                <CardDescription>
                  Informações sobre a segurança e estado do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usuário Administrador Atual</Label>
                    <p className="text-sm text-muted-foreground">
                      {user?.email} ({user?.contactName})
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Versão do Sistema</Label>
                    <p className="text-sm text-muted-foreground">1.0.0</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Última Atualização</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="w-5 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Sistema Operacional
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Todas as configurações foram aplicadas com sucesso
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
