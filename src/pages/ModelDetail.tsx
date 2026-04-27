import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Monitor, Wrench, Package, Star, ArrowLeft, MessageCircle, Play, Video, Heart, Plus, Minus, FileText, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Loading } from "@/components/ui/loading";
import { useModel } from "@/hooks/useModels";
import { useBrands } from "@/hooks/useBrands";
import { useSettings } from "@/hooks/useSettings";
import { SERVICE_ICON, DEFAULT_SERVICE_ICON } from "@/constants/serviceIcons";
import { phoneModels, brands, serviceTypes } from "@/data/models";
import { useCart, SelectedService } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoThumbnail from "@/components/video/VideoThumbnail";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { servicesService, ModelService } from "@/services/servicesService";
import { productViewsService } from "@/services/productViewsService";
import { formatCurrency } from "@/utils/format";
import { buildPreOrcamentoMessageModel } from "@/utils/whatsappOrcamento";
import { validation } from "@/utils/validation";

const ModelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, getItemCount } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [modelServices, setModelServices] = useState<ModelService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const { settings } = useSettings();

  // Buscar dados da API
  const { model: apiModel, loading: modelLoading, error: modelError } = useModel(id);
  const { brands: apiBrands } = useBrands();

  // Resetar fallback de imagem ao trocar de modelo
  useEffect(() => {
    setImageError(false);
  }, [id]);
  
  // Fallback para dados estáticos
  const staticModel = phoneModels.find((m) => m.id === id);
  const staticBrand = staticModel ? brands.find((b) => b.id === staticModel.brand) : null;
  
  const model = apiModel || staticModel || null;
  const brand = model ? (apiBrands.find((b) => b.id === model.brand) || brands.find((b) => b.id === model.brand)) : null;
  const itemCount = model ? getItemCount(model.id) : 0;
  const favorite = model ? isFavorite(model.id) : false;

  // Buscar serviços dinâmicos do modelo
  useEffect(() => {
    if (id) {
      loadModelServices(id);
      // Registrar visualização do produto
      recordProductView(id);
    }
  }, [id]);

  // Função para registrar visualização
  const recordProductView = async (modelId: string) => {
    try {
      // Gerar ou recuperar session ID
      let sessionId = sessionStorage.getItem("donassistec_session_id");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem("donassistec_session_id", sessionId);
      }
      
      await productViewsService.recordView(modelId, sessionId);
    } catch (error) {
      // Silenciar erros de visualização - não é crítico
      console.debug("Erro ao registrar visualização:", error);
    }
  };

  const loadModelServices = async (modelId: string) => {
    try {
      setLoadingServices(true);
      const services = await servicesService.getModelServices(modelId);
      // Filtrar apenas serviços disponíveis
      setModelServices(services.filter(s => s.available));
    } catch (error) {
      console.error("Erro ao carregar serviços do modelo:", error);
      // Manter vazio em caso de erro
      setModelServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleToggleFavorite = () => {
    if (model) {
      toggleFavorite(model.id);
      toast.success(favorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
    }
  };

  if (modelLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="bg-muted/30 py-4">
            <div className="container mx-auto px-4">
              <Breadcrumbs
                items={[
                  { label: "Catálogo", href: "/catalogo" },
                  { label: "Carregando..." },
                ]}
              />
            </div>
          </section>
          <div className="container mx-auto px-4 py-16">
            <Loading size="lg" text="Carregando modelo..." />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!model || !brand) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="pt-20">
          <section className="bg-muted/30 py-4">
            <div className="container mx-auto px-4">
              <Breadcrumbs
                items={[
                  { label: "Catálogo", href: "/catalogo" },
                  { label: "Modelo não encontrado" },
                ]}
              />
            </div>
          </section>
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold mb-4">Modelo não encontrado</h1>
            {modelError && (
              <p className="text-muted-foreground mb-6">
                Erro ao carregar: {modelError}
              </p>
            )}
            <Button onClick={() => navigate("/catalogo")}>
              Voltar ao Catálogo
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const availabilityConfig = {
    in_stock: { label: "Em Estoque", className: "bg-[hsl(142_70%_45%)] text-primary-foreground" },
    order: { label: "Sob Encomenda", className: "bg-secondary text-secondary-foreground" },
    out_of_stock: { label: "Indisponível", className: "bg-muted text-muted-foreground" },
  };

  const availability = availabilityConfig[model.availability];

  // Vídeo de capa (principal): catálogo e área da imagem na página do modelo
  const videoCapaUrl = model.videoUrl || model.videos?.[0]?.url;
  const videoCapaTitle = model.videos?.[0]?.title || `Vídeo ${model.name}`;
  // Vídeo tutorial: "Assistir Vídeo Tutorial" dentro da página do modelo (quando há 2+, usa o segundo)
  const videoTutorialUrl = (model.videos && model.videos.length >= 2)
    ? model.videos[1].url
    : (model.videos?.[0]?.url || model.videoUrl);
  const videoTutorialTitle = (model.videos && model.videos.length >= 2)
    ? model.videos[1].title
    : (model.videos?.[0]?.title || `Tutorial ${model.name}`);

  const handleAddToPreOrcamento = () => {
    const services = model.services || {
      reconstruction: false,
      glassReplacement: false,
      partsAvailable: false,
    };
    addItem(model, services, quantity, undefined, selectedServices.length > 0 ? selectedServices : undefined);
    toast.success(`${model.name} adicionado ao pré-orçamento com ${selectedServices.length > 0 ? selectedServices.length + " serviço(s)" : "orçamento sob consulta"}!`);
  };

  const toggleService = (s: { id: string; name: string; price: number }) => {
    setSelectedServices((prev) => {
      const i = prev.findIndex((x) => x.service_id === s.id);
      if (i >= 0) return prev.filter((_, idx) => idx !== i);
      return [...prev, { service_id: s.id, name: s.name, price: s.price }];
    });
  };

  const isServiceSelected = (serviceId: string) => selectedServices.some((s) => s.service_id === serviceId);

  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const hasConsultPrice = selectedServices.some((s) => s.price <= 0);
  const subtotalLabel = hasConsultPrice ? "Sob consulta" : formatCurrency(subtotal * quantity);

  const handleOrcamento = () => {
    const wa = validation.cleanWhatsAppNumber(settings?.contactWhatsApp || settings?.contactPhoneRaw || "");
    if (!wa) {
      toast.error("WhatsApp comercial não configurado.");
      return;
    }
    const msg = buildPreOrcamentoMessageModel(model, brand, selectedServices, quantity, subtotalLabel);
    const w = window.open(validation.generateWhatsAppUrl(wa, msg), "_blank");
    if (!w) {
      toast.error("Permita pop-ups para abrir o WhatsApp e tente novamente.");
      return;
    }
  };

  // Serviços/peças disponíveis: da API (com preço) ou fallback estático (preço sob consulta)
  const availableServices = modelServices.length > 0
    ? modelServices.map((ms) => ({
        id: ms.service_id,
        name: ms.service?.name || "Serviço",
        description: ms.service?.description || "",
        icon: SERVICE_ICON[ms.service_id] ?? DEFAULT_SERVICE_ICON,
        price: ms.price ?? 0,
      }))
    : serviceTypes
        .filter((service) => {
          if (service.id === "service_reconstruction") return model.services?.reconstruction || false;
          if (service.id === "service_glass") return model.services?.glassReplacement || false;
          if (service.id === "service_parts") return model.services?.partsAvailable || false;
          return false;
        })
        .map((s) => ({ id: s.id, name: s.name, description: "", icon: SERVICE_ICON[s.id] ?? s.icon ?? DEFAULT_SERVICE_ICON, price: 0 }));

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-20">
        {/* Breadcrumb */}
        <section className="bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { label: "Catálogo", href: "/catalogo" },
                { label: model.name },
              ]}
            />
          </div>
        </section>

        {/* Product Detail */}
        <section className="py-10 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Image & Video */}
              <div className="space-y-4">
                <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted/30">
                  {imageError ? (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-muted/50 text-muted-foreground">
                      <Smartphone className="w-16 h-16 mb-2" />
                      <span className="text-sm font-medium px-4 text-center">{model.name}</span>
                    </div>
                  ) : (
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  )}
                  <div className="absolute left-3 top-3 flex flex-col gap-2 sm:left-4 sm:top-4">
                    {model.premium && (
                      <Badge className="bg-secondary text-secondary-foreground">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Premium
                      </Badge>
                    )}
                    {model.popular && (
                      <Badge variant="outline" className="bg-card/90 backdrop-blur-sm">
                        🔥 Popular
                      </Badge>
                    )}
                  </div>
                  <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                    <Badge className={availability.className}>
                      {availability.label}
                    </Badge>
                  </div>
                  
                  {/* Vídeo de capa (principal) na área da imagem */}
                  {videoCapaUrl && (
                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                      <VideoPlayer
                        videoUrl={videoCapaUrl}
                        title={videoCapaTitle}
                        trigger={
                          <Button
                            size="lg"
                            className="bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm hover:bg-primary sm:h-11"
                          >
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Ver vídeo
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6 min-w-0">
                <div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-6 w-auto object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    ) : (
                      brand.icon && <span className="text-2xl">{brand.icon}</span>
                    )}
                    <span className="font-semibold text-base">{brand.name}</span>
                  </div>
                  <h1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                    {model.name}
                  </h1>
                  <p className="text-base text-muted-foreground sm:text-lg">
                    Produto B2B para lojistas. Solicite um orçamento personalizado para seus clientes.
                  </p>
                </div>

                <Separator />

                {/* Vídeos: "Assistir Vídeo Tutorial" (tutorial) + lista de vídeos */}
                {(videoCapaUrl || videoTutorialUrl) && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Video className="w-5 h-5 text-primary" />
                      Vídeos Tutoriais
                    </h2>
                    {videoTutorialUrl && (
                      <div className="mb-4">
                        <VideoPlayer
                          videoUrl={videoTutorialUrl}
                          title={videoTutorialTitle}
                          trigger={
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              <Play className="w-5 h-5 mr-2 fill-current" />
                              Assistir Vídeo Tutorial
                            </Button>
                          }
                        />
                      </div>
                    )}
                    {model.videos && model.videos.length > 0 && (
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {model.videos.map((video) => (
                          <VideoThumbnail key={video.id} video={video} />
                        ))}
                      </div>
                    )}
                    <Separator className="mb-6" />
                  </div>
                )}

                {/* Services Available */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Serviços Disponíveis</h2>
                  {loadingServices ? (
                    <p className="text-muted-foreground">Carregando serviços...</p>
                  ) : availableServices.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {availableServices.map((service) => {
                        const price = (service as any).price ?? 0;
                        const selected = isServiceSelected(service.id);
                        return (
                          <Card
                            key={service.id}
                            className={`border-border transition-all cursor-pointer ${selected ? "border-primary ring-2 ring-primary/30 shadow-md" : "hover:border-primary/50"}`}
                            onClick={() => toggleService({ id: service.id, name: service.name, price })}
                          >
                            <CardContent className="p-4 overflow-hidden">
                              <div className="space-y-2">
                                <div className="flex items-start gap-3 min-w-0">
                                  <Checkbox
                                    checked={selected}
                                    onCheckedChange={() => toggleService({ id: service.id, name: service.name, price })}
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Incluir ${service.name} no orçamento`}
                                    className="shrink-0"
                                  />
                                  <div className="text-2xl shrink-0">{(service as any).icon || DEFAULT_SERVICE_ICON}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{service.name}</p>
                                    {service.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {service.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  {price > 0 ? (
                                    <Badge variant="default" className="text-xs whitespace-nowrap">
                                      {formatCurrency(price)}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-muted-foreground italic">Sob consulta</span>
                                  )}
                                </div>
                                <div className="flex items-center pt-2 border-t">
                                  <Badge variant="outline" className="text-xs">
                                    Disponível
                                  </Badge>
                                  <span className="text-xs text-muted-foreground ml-2 truncate">
                                    {selected ? "✓ Incluído no orçamento" : "Clique para incluir"}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum serviço disponível no momento.</p>
                  )}
                </div>

                <Separator />

                {/* Resumo do seu orçamento */}
                <Card className="border-primary/30 bg-primary/5 lg:sticky lg:top-24 lg:self-start">
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Resumo do seu orçamento
                    </h2>
                    {selectedServices.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {selectedServices.map((s) => (
                          <div key={s.service_id} className="flex justify-between text-sm">
                            <span className="text-foreground">{s.name}</span>
                            <span>{s.price > 0 ? formatCurrency(s.price) : "Sob consulta"}</span>
                          </div>
                        ))}
                        <div className="flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center justify-between gap-2 sm:justify-start">
                            <span className="text-sm text-muted-foreground">Quantidade:</span>
                            <div className="flex items-center gap-1 border border-border rounded-lg">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-10 text-center font-semibold">{quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setQuantity((q) => q + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <span className="font-semibold sm:text-right">{subtotalLabel}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-4">
                        <p className="text-sm text-muted-foreground">
                          Selecione os serviços ou peças acima para montar seu orçamento. Você também pode adicionar sem seleção para orçamento sob consulta.
                        </p>
                        <div className="flex items-center justify-between gap-2 sm:justify-start">
                          <span className="text-sm text-muted-foreground">Quantidade:</span>
                          <div className="flex items-center gap-1 border border-border rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center font-semibold">{quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setQuantity((q) => q + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <Button
                        size="lg"
                        className="w-full flex-1 sm:min-w-[200px] sm:w-auto"
                        onClick={handleOrcamento}
                        disabled={model.availability === "out_of_stock"}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Orçamento (WhatsApp)
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleAddToPreOrcamento}
                        className="w-full sm:w-auto"
                        disabled={model.availability === "out_of_stock"}
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Adicionar ao Pré-orçamento
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={handleToggleFavorite}
                        className={`w-full sm:w-auto ${favorite ? "border-red-500 text-red-500 hover:bg-red-50" : ""}`}
                      >
                        <Heart className={`w-5 h-5 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pré-orçamento Info */}
                {itemCount > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-primary font-medium">
                      Você tem <strong>{itemCount}</strong> unidade(s) deste modelo no pré-orçamento.
                    </p>
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={() => navigate("/catalogo")}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Catálogo
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info */}
        <section className="bg-muted/30 py-10 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="mb-6 text-2xl font-bold">Informações Importantes</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">📦</div>
                      <div>
                        <h3 className="font-semibold mb-2">Disponibilidade</h3>
                        <p className="text-sm text-muted-foreground">
                          {model.availability === "in_stock"
                            ? "Produto disponível para entrega imediata."
                            : model.availability === "order"
                            ? "Produto disponível sob encomenda. Prazo a confirmar."
                            : "Produto temporariamente indisponível."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🛡️</div>
                      <div>
                        <h3 className="font-semibold mb-2">Garantia</h3>
                        <p className="text-sm text-muted-foreground">
                          Todos os serviços e peças contam com garantia de qualidade.
                          Detalhes serão fornecidos no orçamento.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <ReviewsSection modelId={model.id} />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default ModelDetail;
