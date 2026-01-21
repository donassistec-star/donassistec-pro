import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Monitor, Wrench, Package, Star, ArrowLeft, ShoppingCart, MessageCircle, Play, Video, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Loading } from "@/components/ui/loading";
import { useModel } from "@/hooks/useModels";
import { useBrands } from "@/hooks/useBrands";
import { phoneModels, brands, serviceTypes } from "@/data/models";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoThumbnail from "@/components/video/VideoThumbnail";
import ReviewsSection from "@/components/reviews/ReviewsSection";
import { servicesService, ModelService } from "@/services/servicesService";
import { productViewsService } from "@/services/productViewsService";
import { formatCurrency } from "@/utils/format";

const ModelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, getItemCount } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [modelServices, setModelServices] = useState<ModelService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  
  // Buscar dados da API
  const { model: apiModel, loading: modelLoading, error: modelError } = useModel(id);
  const { brands: apiBrands } = useBrands();
  
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

  const handleAddToCart = () => {
    // Manter compatibilidade com sistema antigo de serviços
    const services = model.services || {
      reconstruction: false,
      glassReplacement: false,
      partsAvailable: false,
    };
    addItem(model, services);
    toast.success(`${model.name} adicionado ao carrinho!`);
  };

  const handleContact = () => {
    const message = encodeURIComponent(
      `Olá! Sou lojista e gostaria de um orçamento para o modelo ${model.name} (${brand.name}). Tenho interesse em saber mais sobre os serviços disponíveis.`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, "_blank");
  };

  // Usar serviços dinâmicos se disponíveis, senão usar sistema antigo
  const availableServices = modelServices.length > 0
    ? modelServices.map((ms) => ({
        id: ms.service_id,
        name: ms.service?.name || "Serviço",
        description: ms.service?.description || "",
        icon: "🔧",
        price: ms.price,
      }))
    : serviceTypes.filter((service) => {
        if (service.id === "reconstruction") return model.services?.reconstruction || false;
        if (service.id === "glassReplacement") return model.services?.glassReplacement || false;
        if (service.id === "partsAvailable") return model.services?.partsAvailable || false;
        return false;
      });

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
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Image & Video */}
              <div className="space-y-4">
                <div className="relative aspect-square bg-muted/30 rounded-lg overflow-hidden group">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
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
                  <div className="absolute top-4 right-4">
                    <Badge className={availability.className}>
                      {availability.label}
                    </Badge>
                  </div>
                  
                  {/* Video Button Overlay */}
                  {(model.videoUrl || (model.videos && model.videos.length > 0)) && (
                    <div className="absolute bottom-4 left-4">
                      <VideoPlayer
                        videoUrl={model.videoUrl || model.videos![0].url}
                        title={`Tutorial ${model.name}`}
                        trigger={
                          <Button
                            size="lg"
                            className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm"
                          >
                            <Play className="w-5 h-5 mr-2 fill-current" />
                            Assistir Vídeo Tutorial
                          </Button>
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-6">
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
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                    {model.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Produto B2B para lojistas. Solicite um orçamento personalizado para seus clientes.
                  </p>
                </div>

                <Separator />

                {/* Videos Section */}
                {model.videos && model.videos.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Video className="w-5 h-5 text-primary" />
                      Vídeos Tutoriais
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      {model.videos.map((video) => (
                        <VideoThumbnail key={video.id} video={video} />
                      ))}
                    </div>
                    <Separator className="mb-6" />
                  </div>
                )}

                {/* Services Available */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">Serviços Disponíveis</h2>
                  {loadingServices ? (
                    <p className="text-muted-foreground">Carregando serviços...</p>
                  ) : availableServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableServices.map((service) => (
                        <Card key={service.id} className="border-border hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="text-2xl">{(service as any).icon || "🔧"}</div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{service.name}</p>
                                    {service.description && (
                                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {service.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {(service as any).price > 0 && (
                                  <Badge variant="default" className="shrink-0">
                                    {formatCurrency((service as any).price)}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t">
                                <Badge variant="outline" className="text-xs">
                                  Disponível
                                </Badge>
                                {!(service as any).price && (
                                  <span className="text-xs text-muted-foreground italic">
                                    Preço sob consulta
                                  </span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Nenhum serviço disponível no momento.</p>
                  )}
                </div>

                <Separator />

                {/* Cart Info */}
                {itemCount > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-primary font-medium">
                      Você tem <strong>{itemCount}</strong> unidade(s) deste modelo no carrinho.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={model.availability === "out_of_stock"}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Adicionar ao Carrinho
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1"
                    onClick={handleContact}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Solicitar Orçamento
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleToggleFavorite}
                    className={favorite ? "border-red-500 text-red-500 hover:bg-red-50" : ""}
                  >
                    <Heart className={`w-5 h-5 ${favorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                </div>

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
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Informações Importantes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6">
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
                  <CardContent className="p-6">
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
