import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, LayoutGrid, List, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import MobileFiltersSheet from "@/components/catalog/MobileFiltersSheet";
import ModelCard from "@/components/catalog/ModelCard";
import { phoneModels, brands, PhoneModel } from "@/data/models";

type SortOption = "name" | "brand" | "popular";

const Catalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const totalFilters =
    selectedBrands.length + selectedServices.length + selectedAvailability.length;

  const handleBrandChange = (brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((id) => id !== brandId)
        : [...prev, brandId]
    );
  };

  const handleServiceChange = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAvailabilityChange = (availabilityId: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(availabilityId)
        ? prev.filter((id) => id !== availabilityId)
        : [...prev, availabilityId]
    );
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setSelectedServices([]);
    setSelectedAvailability([]);
    setSearchQuery("");
  };

  const handleContact = (model: PhoneModel) => {
    const brand = brands.find((b) => b.id === model.brand);
    const message = encodeURIComponent(
      `Olá! Sou lojista e gostaria de um orçamento para o modelo ${model.name} (${brand?.name}). Tenho interesse em saber mais sobre os serviços disponíveis.`
    );
    window.open(`https://wa.me/5511999999999?text=${message}`, "_blank");
  };

  const filteredModels = useMemo(() => {
    let result = [...phoneModels];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (model) =>
          model.name.toLowerCase().includes(query) ||
          brands.find((b) => b.id === model.brand)?.name.toLowerCase().includes(query)
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((model) => selectedBrands.includes(model.brand));
    }

    // Service filter
    if (selectedServices.length > 0) {
      result = result.filter((model) => {
        return selectedServices.some((service) => {
          if (service === "reconstruction") return model.services.reconstruction;
          if (service === "glassReplacement") return model.services.glassReplacement;
          if (service === "partsAvailable") return model.services.partsAvailable;
          return false;
        });
      });
    }

    // Availability filter
    if (selectedAvailability.length > 0) {
      result = result.filter((model) =>
        selectedAvailability.includes(model.availability)
      );
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "brand") {
      result.sort((a, b) => a.brand.localeCompare(b.brand));
    } else if (sortBy === "popular") {
      result.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        if (a.premium && !b.premium) return -1;
        if (!a.premium && b.premium) return 1;
        return 0;
      });
    }

    return result;
  }, [searchQuery, selectedBrands, selectedServices, selectedAvailability, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Page Header */}
        <section className="bg-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Smartphone className="w-3 h-3 mr-1" />
                Catálogo B2B
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-card mb-4">
                Catálogo de <span className="text-secondary">Modelos</span>
              </h1>
              <p className="text-lg text-card/70">
                Encontre peças, serviços de reconstrução e troca de vidro para todos os modelos.
                Filtre por marca, serviço ou disponibilidade.
              </p>
            </div>
          </div>
        </section>

        {/* Catalog Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-24">
                  <CatalogFilters
                    selectedBrands={selectedBrands}
                    selectedServices={selectedServices}
                    selectedAvailability={selectedAvailability}
                    onBrandChange={handleBrandChange}
                    onServiceChange={handleServiceChange}
                    onAvailabilityChange={handleAvailabilityChange}
                    onClearFilters={handleClearFilters}
                    totalFilters={totalFilters}
                  />
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {/* Search & Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {/* Mobile Filters */}
                  <MobileFiltersSheet
                    selectedBrands={selectedBrands}
                    selectedServices={selectedServices}
                    selectedAvailability={selectedAvailability}
                    onBrandChange={handleBrandChange}
                    onServiceChange={handleServiceChange}
                    onAvailabilityChange={handleAvailabilityChange}
                    onClearFilters={handleClearFilters}
                    totalFilters={totalFilters}
                  />

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por modelo ou marca..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent className="bg-card z-50">
                      <SelectItem value="popular">Mais Populares</SelectItem>
                      <SelectItem value="name">Nome A-Z</SelectItem>
                      <SelectItem value="brand">Marca</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Mode Toggle */}
                  <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("grid")}
                      className="rounded-none"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setViewMode("list")}
                      className="rounded-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredModels.length}</span>{" "}
                    modelos encontrados
                  </p>
                </div>

                {/* Models Grid */}
                {filteredModels.length > 0 ? (
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {filteredModels.map((model) => (
                      <ModelCard
                        key={model.id}
                        model={model}
                        onContact={handleContact}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Smartphone className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Nenhum modelo encontrado
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Tente ajustar os filtros ou buscar por outro termo.
                    </p>
                    <Button variant="outline" onClick={handleClearFilters}>
                      Limpar Filtros
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Catalog;
