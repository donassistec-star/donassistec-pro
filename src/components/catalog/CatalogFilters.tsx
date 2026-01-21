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
import { X, Filter, RotateCcw } from "lucide-react";
import { brands as staticBrands, serviceTypes, availabilityOptions } from "@/data/models";
import { useBrands } from "@/hooks/useBrands";

interface CatalogFiltersProps {
  selectedBrands: string[];
  selectedServices: string[];
  selectedAvailability: string[];
  onBrandChange: (brandId: string) => void;
  onServiceChange: (serviceId: string) => void;
  onAvailabilityChange: (availabilityId: string) => void;
  onClearFilters: () => void;
  totalFilters: number;
}

const CatalogFilters = ({
  selectedBrands,
  selectedServices,
  selectedAvailability,
  onBrandChange,
  onServiceChange,
  onAvailabilityChange,
  onClearFilters,
  totalFilters,
}: CatalogFiltersProps) => {
  const { brands: apiBrands } = useBrands();
  const brands = apiBrands.length > 0 ? apiBrands : staticBrands;

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

      <Accordion type="multiple" defaultValue={["brands", "services", "availability"]} className="space-y-2">
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
              {serviceTypes.map((service) => (
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
                    className="text-sm cursor-pointer"
                  >
                    {option.name}
                  </Label>
                </div>
              ))}
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
              const service = serviceTypes.find((s) => s.id === serviceId);
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
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogFilters;
