import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { X, Filter, RotateCcw, Star, Flame, Film } from "lucide-react";
import { brands as staticBrands, serviceTypes, availabilityOptions } from "@/data/models";
import { useBrands } from "@/hooks/useBrands";
import { useServices } from "@/hooks/useServices";
import { SERVICE_ICON, DEFAULT_SERVICE_ICON } from "@/constants/serviceIcons";

/** Nomes corretos em PT-BR (evita mojibake se a API/DB ainda retornar encoding errado) */
const SERVICE_NAME: Record<string, string> = {
  service_reconstruction: "Reconstrução",
  service_glass: "Troca de Vidro",
  service_parts: "Peças Disponíveis",
  service_battery: "Troca de Bateria",
  service_screen: "Troca de Tela",
  service_camera: "Reparo de Câmera",
  service_charging: "Reparo de Carregamento",
  service_software: "Atualização/Formatação",
};

interface CatalogFiltersProps {
  selectedBrands: string[];
  selectedServices: string[];
  selectedAvailability: string[];
  selectedPremium: boolean;
  selectedPopular: boolean;
  selectedWithVideo?: boolean;
  onBrandChange: (brandId: string) => void;
  onServiceChange: (serviceId: string) => void;
  onAvailabilityChange: (availabilityId: string) => void;
  onPremiumChange: (v: boolean) => void;
  onPopularChange: (v: boolean) => void;
  onWithVideoChange?: (v: boolean) => void;
  onClearFilters: () => void;
  totalFilters: number;
  /** Contagem de modelos por marca (ex: { apple: 12 }) para exibir ao lado do nome. */
  modelCountByBrand?: Record<string, number>;
  /** Contagem por serviço (ex: { service_reconstruction: 8 }). */
  modelCountByService?: Record<string, number>;
  /** Contagem por disponibilidade (ex: { in_stock: 20 }). */
  modelCountByAvailability?: Record<string, number>;
}

const CatalogFilters = ({
  selectedBrands,
  selectedServices,
  selectedAvailability,
  selectedPremium,
  selectedPopular,
  selectedWithVideo = false,
  onBrandChange,
  onServiceChange,
  onAvailabilityChange,
  onPremiumChange,
  onPopularChange,
  onWithVideoChange,
  onClearFilters,
  totalFilters,
  modelCountByBrand = {},
  modelCountByService = {},
  modelCountByAvailability = {},
}: CatalogFiltersProps) => {
  const { brands: apiBrands } = useBrands();
  const { services: apiServices } = useServices(true);
  const brands = apiBrands.length > 0 ? apiBrands : staticBrands;

  // Lista de serviços: da API (dinâmicos) ou estáticos; formato { id, name, icon }
  // SERVICE_NAME garante rótulos corretos mesmo se a API retornar mojibake (encoding errado)
  const serviceTypesForFilter =
    apiServices.length > 0
      ? apiServices.map((s) => ({
          id: s.id,
          name: SERVICE_NAME[s.id] ?? s.name,
          icon: SERVICE_ICON[s.id] ?? DEFAULT_SERVICE_ICON,
        }))
      : serviceTypes;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Filtros</h3>
          {totalFilters > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalFilters}
            </Badge>
          )}
        </div>
        {totalFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["brands", "services", "availability", "highlights"]} className="space-y-2">
        {/* Brands Filter */}
        <AccordionItem value="brands" className="border-none">
          <AccordionTrigger className="text-sm font-medium text-foreground py-3 hover:no-underline">
            Marcas
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-3">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`brand-${brand.id}`}
                    checked={selectedBrands.includes(brand.id)}
                    onCheckedChange={() => onBrandChange(brand.id)}
                  />
                  <Label
                    htmlFor={`brand-${brand.id}`}
                    className="flex items-center gap-2 text-sm cursor-pointer flex-1"
                  >
                    {brand.logo ? (
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
                      brand.icon && <span className="text-base">{brand.icon}</span>
                    )}
                    <span className="font-medium">{brand.name}</span>
                    {modelCountByBrand[brand.id] != null && (
                      <span className="text-muted-foreground text-xs">({modelCountByBrand[brand.id]})</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Services Filter */}
        <AccordionItem value="services" className="border-none">
          <AccordionTrigger className="text-sm font-medium text-foreground py-3 hover:no-underline">
            Tipo de Serviço
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-3">
              {serviceTypesForFilter.map((service) => (
                <div key={service.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => onServiceChange(service.id)}
                  />
                  <Label
                    htmlFor={`service-${service.id}`}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <span>{service.icon}</span>
                    {service.name}
                    {modelCountByService[service.id] != null && (
                      <span className="text-muted-foreground text-xs">({modelCountByService[service.id]})</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem value="availability" className="border-none">
          <AccordionTrigger className="text-sm font-medium text-foreground py-3 hover:no-underline">
            Disponibilidade
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-3">
              {availabilityOptions.map((option) => (
                <div key={option.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`availability-${option.id}`}
                    checked={selectedAvailability.includes(option.id)}
                    onCheckedChange={() => onAvailabilityChange(option.id)}
                  />
                  <Label
                    htmlFor={`availability-${option.id}`}
                    className="text-sm cursor-pointer flex items-center gap-1"
                  >
                    {option.name}
                    {modelCountByAvailability[option.id] != null && (
                      <span className="text-muted-foreground text-xs">({modelCountByAvailability[option.id]})</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Destaques: Premium e Popular */}
        <AccordionItem value="highlights" className="border-none">
          <AccordionTrigger className="text-sm font-medium text-foreground py-3 hover:no-underline">
            Destaques
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="filter-premium"
                  checked={selectedPremium}
                  onCheckedChange={(c) => onPremiumChange(c === true)}
                />
                <Label htmlFor="filter-premium" className="flex items-center gap-2 text-sm cursor-pointer">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Premium
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="filter-popular"
                  checked={selectedPopular}
                  onCheckedChange={(c) => onPopularChange(c === true)}
                />
                <Label htmlFor="filter-popular" className="flex items-center gap-2 text-sm cursor-pointer">
                  <Flame className="w-4 h-4 text-orange-500" />
                  Popular
                </Label>
              </div>
              {onWithVideoChange && (
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="filter-with-video"
                    checked={selectedWithVideo}
                    onCheckedChange={(c) => onWithVideoChange(c === true)}
                  />
                  <Label htmlFor="filter-with-video" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Film className="w-4 h-4 text-primary" />
                    Com vídeo
                  </Label>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Active Filters Tags */}
      {totalFilters > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3">Filtros ativos:</p>
          <div className="flex flex-wrap gap-2">
            {selectedBrands.map((brandId) => {
              const brand = brands.find((b) => b.id === brandId);
              return (
                <Badge
                  key={brandId}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-destructive/10"
                  onClick={() => onBrandChange(brandId)}
                >
                  {brand?.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              );
            })}
            {selectedServices.map((serviceId) => {
              const service = serviceTypesForFilter.find((s) => s.id === serviceId);
              return (
                <Badge
                  key={serviceId}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-destructive/10"
                  onClick={() => onServiceChange(serviceId)}
                >
                  {service?.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              );
            })}
            {selectedAvailability.map((availabilityId) => {
              const availability = availabilityOptions.find((a) => a.id === availabilityId);
              return (
                <Badge
                  key={availabilityId}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-destructive/10"
                  onClick={() => onAvailabilityChange(availabilityId)}
                >
                  {availability?.name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              );
            })}
            {selectedPremium && (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-destructive/10"
                onClick={() => onPremiumChange(false)}
              >
                Premium
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {selectedPopular && (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-destructive/10"
                onClick={() => onPopularChange(false)}
              >
                Popular
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {selectedWithVideo && onWithVideoChange && (
              <Badge
                variant="outline"
                className="text-xs cursor-pointer hover:bg-destructive/10"
                onClick={() => onWithVideoChange(false)}
              >
                Com vídeo
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogFilters;
