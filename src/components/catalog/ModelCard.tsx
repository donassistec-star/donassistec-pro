import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Wrench, Package, MessageCircle, Star, ArrowRight } from "lucide-react";
import { PhoneModel, brands } from "@/data/models";

interface ModelCardProps {
  model: PhoneModel;
  onContact: (model: PhoneModel) => void;
}

const ModelCard = ({ model, onContact }: ModelCardProps) => {
  const brand = brands.find((b) => b.id === model.brand);

  const availabilityConfig = {
    in_stock: { label: "Em Estoque", className: "bg-[hsl(142_70%_45%)] text-primary-foreground" },
    order: { label: "Sob Encomenda", className: "bg-secondary text-secondary-foreground" },
    out_of_stock: { label: "Indisponível", className: "bg-muted text-muted-foreground" },
  };

  const availability = availabilityConfig[model.availability];

  return (
    <Card className="group overflow-hidden border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-muted/30 overflow-hidden">
        <img
          src={model.image}
          alt={model.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
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
        <div className="absolute top-3 right-3">
          <Badge className={availability.className}>
            {availability.label}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Brand & Model Name */}
        <div className="mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <span>{brand?.icon}</span>
            <span>{brand?.name}</span>
          </div>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {model.name}
          </h3>
        </div>

        {/* Services Available */}
        <div className="flex flex-wrap gap-2 mb-4">
          {model.services.reconstruction && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <Monitor className="w-3 h-3 text-primary" />
              Reconstrução
            </div>
          )}
          {model.services.glassReplacement && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <Wrench className="w-3 h-3 text-primary" />
              Vidro
            </div>
          )}
          {model.services.partsAvailable && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <Package className="w-3 h-3 text-primary" />
              Peças
            </div>
          )}
        </div>

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
          <Button size="sm" className="flex-1">
            Detalhes
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelCard;
