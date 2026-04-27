import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import CatalogFilters from "./CatalogFilters";

interface MobileFiltersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Quantidade de modelos após os filtros (para o botão "Ver X resultados"). */
  resultsCount: number;
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
  modelCountByBrand?: Record<string, number>;
  modelCountByService?: Record<string, number>;
  modelCountByAvailability?: Record<string, number>;
}

const MobileFiltersSheet = ({
  open,
  onOpenChange,
  resultsCount,
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
}: MobileFiltersSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filtros
          {totalFilters > 0 && (
            <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {totalFilters}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Filtrar Modelos</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <CatalogFilters
            selectedBrands={selectedBrands}
            selectedServices={selectedServices}
            selectedAvailability={selectedAvailability}
            selectedPremium={selectedPremium}
            selectedPopular={selectedPopular}
            selectedWithVideo={selectedWithVideo}
            onBrandChange={onBrandChange}
            onServiceChange={onServiceChange}
            onAvailabilityChange={onAvailabilityChange}
            onPremiumChange={onPremiumChange}
            onPopularChange={onPopularChange}
            onWithVideoChange={onWithVideoChange}
            onClearFilters={onClearFilters}
            totalFilters={totalFilters}
            modelCountByBrand={modelCountByBrand}
            modelCountByService={modelCountByService}
            modelCountByAvailability={modelCountByAvailability}
          />
        </div>
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Ver {resultsCount} resultado{resultsCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFiltersSheet;
