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
  selectedBrands: string[];
  selectedServices: string[];
  selectedAvailability: string[];
  selectedPremium: boolean;
  selectedPopular: boolean;
  onBrandChange: (brandId: string) => void;
  onServiceChange: (serviceId: string) => void;
  onAvailabilityChange: (availabilityId: string) => void;
  onPremiumChange: (v: boolean) => void;
  onPopularChange: (v: boolean) => void;
  onClearFilters: () => void;
  totalFilters: number;
}

const MobileFiltersSheet = ({
  selectedBrands,
  selectedServices,
  selectedAvailability,
  selectedPremium,
  selectedPopular,
  onBrandChange,
  onServiceChange,
  onAvailabilityChange,
  onPremiumChange,
  onPopularChange,
  onClearFilters,
  totalFilters,
}: MobileFiltersSheetProps) => {
  return (
    <Sheet>
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
      <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtrar Modelos</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <CatalogFilters
            selectedBrands={selectedBrands}
            selectedServices={selectedServices}
            selectedAvailability={selectedAvailability}
            selectedPremium={selectedPremium}
            selectedPopular={selectedPopular}
            onBrandChange={onBrandChange}
            onServiceChange={onServiceChange}
            onAvailabilityChange={onAvailabilityChange}
            onPremiumChange={onPremiumChange}
            onPopularChange={onPopularChange}
            onClearFilters={onClearFilters}
            totalFilters={totalFilters}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileFiltersSheet;
