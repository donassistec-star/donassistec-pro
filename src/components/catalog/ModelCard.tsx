import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Wrench, Package, MessageCircle, Star, ArrowRight, ShoppingCart, Play, Heart } from "lucide-react";
import { PhoneModel, Brand, brands as defaultBrands } from "@/data/models";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";
import VideoPlayer from "@/components/video/VideoPlayer";

interface ModelCardProps {
  model: PhoneModel;
  onContact: (model: PhoneModel) => void;
  /** Marcas (da API ou estáticas). Se não informado, usa marcas estáticas. */
  brands?: Brand[];
  /** grid = card vertical (padrão); list = linha horizontal compacta. */
  variant?: "grid" | "list";
}

const ModelCard = ({ model, onContact, brands = defaultBrands, variant = "grid" }: ModelCardProps) => {
  const navigate = useNavigate();
  const { addItem, getItemCount } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const brand = brands.find((b) => b.id === model.brand);
  const itemCount = getItemCount(model.id);
  const favorite = isFavorite(model.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(model.id);
    toast.success(favorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
  };

  const availabilityConfig = {
    in_stock: { label: "Em Estoque", className: "bg-[hsl(142_70%_45%)] text-primary-foreground" },
    order: { label: "Sob Encomenda", className: "bg-secondary text-secondary-foreground" },
    out_of_stock: { label: "Indisponível", className: "bg-muted text-muted-foreground" },
  };

  const availability = availabilityConfig[model.availability];

  const handleAddToCart = () => {
    addItem(model, model.services);
    toast.success(`${model.name} adicionado ao carrinho!`);
  };

  const handleViewDetails = () => {
    navigate(`/modelo/${model.id}`);
  };

  const servicesList = (model as any).modelServices && (model as any).modelServices.length > 0
    ? (model as any).modelServices.filter((ms: any) => ms.available).slice(0, 3)
    : [];
  const hasReconstruction = !!(model.services?.reconstruction || servicesList.some((ms: any) => ms.service_id === "service_reconstruction"));
  const hasGlass = !!(model.services?.glassReplacement || servicesList.some((ms: any) => ms.service_id === "service_glass"));
  const hasParts = !!(model.services?.partsAvailable || servicesList.some((ms: any) => ms.service_id === "service_parts"));

  if (variant === "list") {
    return (
      <Card className="group overflow-hidden border-border hover:border-primary/50 hover:shadow-md transition-all duration-300 flex flex-row">
        <div className="relative w-24 sm:w-28 shrink-0 aspect-square bg-muted/30 overflow-hidden">
          <img
            src={model.image}
            alt={model.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {(model.videoUrl || (model.videos && model.videos.length > 0)) && (
            <div className="absolute bottom-1 left-1">
              <VideoPlayer
                videoUrl={model.videoUrl || model.videos![0].url}
                title={`Tutorial ${model.name}`}
                trigger={<Button size="icon" className="h-7 w-7 bg-primary/90 hover:bg-primary text-primary-foreground"><Play className="w-3 h-3 fill-current" /></Button>}
              />
            </div>
          )}
        </div>
        <CardContent className="p-3 sm:p-4 flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {brand?.logo && <img src={brand.logo} alt="" className="h-3.5 w-auto object-contain opacity-70" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />}
              <span className="text-xs text-muted-foreground">{brand?.name}</span>
              {model.premium && <Badge className="text-[10px] py-0 h-4 bg-secondary text-secondary-foreground"><Star className="w-2.5 h-2.5 mr-0.5 fill-current" />Premium</Badge>}
              {model.popular && <Badge variant="outline" className="text-[10px] py-0 h-4">🔥</Badge>}
            </div>
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{model.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              {servicesList.length > 0 ? servicesList.map((ms: any) => (
                <span key={ms.service_id} className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"><Wrench className="w-2.5 h-2.5 inline mr-0.5 text-primary" />{ms.service?.name || "Serviço"}</span>
              )) : (
                <>
                  {hasReconstruction && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"><Monitor className="w-2.5 h-2.5 inline mr-0.5 text-primary" />Reconstrução</span>}
                  {hasGlass && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"><Wrench className="w-2.5 h-2.5 inline mr-0.5 text-primary" />Vidro</span>}
                  {hasParts && <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded"><Package className="w-2.5 h-2.5 inline mr-0.5 text-primary" />Peças</span>}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={`text-[10px] py-0 h-5 ${availability.className}`}>{availability.label}</Badge>
            {itemCount > 0 && <Badge variant="outline" className="text-[10px] py-0 h-5 bg-primary/10 text-primary"><ShoppingCart className="w-3 h-3 mr-0.5" />{itemCount}</Badge>}
            <button onClick={handleToggleFavorite} className="p-1.5 rounded-full hover:bg-muted transition-colors" aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}>
              <Heart className={`w-4 h-4 ${favorite ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"}`} />
            </button>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => onContact(model)}><MessageCircle className="w-3.5 h-3.5 mr-1" />Orçamento</Button>
            <Button size="sm" variant="secondary" onClick={handleAddToCart} disabled={model.availability === "out_of_stock"}><ShoppingCart className="w-3.5 h-3.5 mr-1" />Adicionar</Button>
            <Button size="sm" variant="ghost" onClick={handleViewDetails} className="px-2"><ArrowRight className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden group/image">
        <img
          src={model.image}
          alt={model.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
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

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
          <Badge className={availability.className}>
            {availability.label}
          </Badge>
          <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-full bg-card/90 backdrop-blur-sm hover:bg-card transition-colors shadow-md"
            aria-label={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                favorite
                  ? "fill-red-500 text-red-500"
                  : "text-foreground hover:text-red-500"
              }`}
            />
          </button>
        </div>

        {/* Video Button Overlay */}
        {(model.videoUrl || (model.videos && model.videos.length > 0)) && (
          <div className="absolute bottom-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <VideoPlayer
              videoUrl={model.videoUrl || model.videos![0].url}
              title={`Tutorial ${model.name}`}
              trigger={
                <Button
                  size="sm"
                  className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm"
                >
                  <Play className="w-4 h-4 mr-1 fill-current" />
                  Vídeo
                </Button>
              }
            />
          </div>
        )}
      </div>

      <CardContent className="p-4">
          {/* Brand & Model Name */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {brand?.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-4 w-auto object-contain opacity-70"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                  }}
                />
              ) : (
                brand?.icon && <span>{brand.icon}</span>
              )}
              <span className="font-medium">{brand?.name}</span>
            </div>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {model.name}
            </h3>
          </div>

        {/* Services Available */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Usar serviços dinâmicos se disponíveis, senão usar sistema antigo */}
          {(model as any).modelServices && (model as any).modelServices.length > 0 ? (
            (model as any).modelServices
              .filter((ms: any) => ms.available)
              .slice(0, 3) // Mostrar no máximo 3 serviços no card
              .map((ms: any) => (
                <div
                  key={ms.service_id}
                  className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md"
                  title={ms.service?.description || ms.service?.name}
                >
                  <Wrench className="w-3 h-3 text-primary" />
                  {ms.service?.name || "Serviço"}
                </div>
              ))
          ) : (
            <>
              {model.services?.reconstruction && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  <Monitor className="w-3 h-3 text-primary" />
                  Reconstrução
                </div>
              )}
              {model.services?.glassReplacement && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  <Wrench className="w-3 h-3 text-primary" />
                  Vidro
                </div>
              )}
              {model.services?.partsAvailable && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                  <Package className="w-3 h-3 text-primary" />
                  Peças
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Badge */}
        {itemCount > 0 && (
          <div className="mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <ShoppingCart className="w-3 h-3 mr-1" />
              {itemCount} no carrinho
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onContact(model)}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            Orçamento
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleAddToCart}
            disabled={model.availability === "out_of_stock"}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={handleViewDetails}
            className="px-3"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelCard;
