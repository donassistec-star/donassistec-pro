import { useState, useMemo, useEffect } from "react";
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
import { Search, LayoutGrid, List, Smartphone, Video, GitCompare, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import CatalogFilters from "@/components/catalog/CatalogFilters";
import MobileFiltersSheet from "@/components/catalog/MobileFiltersSheet";
import ModelCard from "@/components/catalog/ModelCard";
import VideoThumbnail from "@/components/video/VideoThumbnail";
import ComparisonModal from "@/components/ComparisonModal";
import SearchSuggestions from "@/components/catalog/SearchSuggestions";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Loading, LoadingSkeleton } from "@/components/ui/loading";
import { useModels } from "@/hooks/useModels";
import { useBrands } from "@/hooks/useBrands";
import { PhoneModel, phoneModels, brands as staticBrands } from "@/data/models";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type SortOption = "name" | "brand" | "popular";

const Catalog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [comparisonModels, setComparisonModels] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

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

  const handleToggleComparison = (modelId: string) => {
    setComparisonModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }
      if (prev.length >= 3) {
        toast.error("Você pode comparar até 3 modelos por vez");
        return prev;
      }
      return [...prev, modelId];
    });
  };

  // Buscar dados da API com filtros
  const { models: apiModels, loading: modelsLoading, error: modelsError } = useModels({
    brand: selectedBrands.length > 0 ? selectedBrands : undefined,
    service: selectedServices.length > 0 ? selectedServices : undefined,
    availability: selectedAvailability.length > 0 ? selectedAvailability : undefined,
    search: searchQuery || undefined,
  });

  const { brands: apiBrands, loading: brandsLoading } = useBrands();

  // Usar dados da API ou fallback para dados estáticos
  const useApi = !modelsError && apiModels.length > 0;
  const models = useApi ? apiModels : phoneModels;
  const brands = useApi && !brandsLoading ? apiBrands : staticBrands;

  const filteredModels = useMemo(() => {
    // Se estiver usando API e já tiver filtros aplicados, retornar diretamente
    if (useApi && (selectedBrands.length > 0 || selectedServices.length > 0 || selectedAvailability.length > 0 || searchQuery)) {
      // A API já aplica os filtros, então retornar os modelos da API
      let result = [...apiModels];

      // Aplicar ordenação localmente
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
    }

    // Fallback para filtros locais (dados estáticos)
    let result = [...models];

    // Advanced Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const brand = brands.find((b) => b.name.toLowerCase().includes(query));
      const brandId = brand?.id || "";
      
      result = result.filter((model) => {
        // Search by model name
        if (model.name.toLowerCase().includes(query)) return true;
        
        // Search by brand name
        if (model.brand.toLowerCase().includes(query) || model.brand === brandId) return true;
        
        // Search by brand display name
        const modelBrand = brands.find((b) => b.id === model.brand);
        if (modelBrand?.name.toLowerCase().includes(query)) return true;
        
        // Search by service type
        if (
          (query.includes("reconstru") && model.services.reconstruction) ||
          (query.includes("vidro") && model.services.glassReplacement) ||
          (query.includes("peça") && model.services.partsAvailable) ||
          (query.includes("tela") && (model.services.reconstruction || model.services.glassReplacement))
        ) return true;
        
        // Search by availability
        if (
          (query.includes("estoque") && model.availability === "in_stock") ||
          (query.includes("encomenda") && model.availability === "order") ||
          (query.includes("disponível") && model.availability !== "out_of_stock")
        ) return true;
        
        // Search by premium/popular
        if (
          (query.includes("premium") && model.premium) ||
          (query.includes("popular") && model.popular)
        ) return true;
        
        return false;
      });
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
  }, [useApi, modelsError, apiModels, models, brands, searchQuery, selectedBrands, selectedServices, selectedAvailability, sortBy]);

  const comparisonModelsData = filteredModels.filter((model) =>
    comparisonModels.includes(model.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-20">
        {/* Breadcrumbs */}
        <section className="bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { label: "Catálogo", href: "/catalogo" },
              ]}
            />
          </div>
        </section>

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

        {/* Featured Videos Section */}
        {filteredModels.length > 0 && filteredModels.some(m => m.videos && m.videos.length > 0) && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
                  <Video className="w-6 h-6 text-primary" />
                  Vídeos Tutoriais em Destaque
                </h2>
                <p className="text-muted-foreground">
                  Aprenda com nossos tutoriais de reparo e reconstrução
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels
                  .filter((m) => m.videos && m.videos.length > 0)
                  .slice(0, 6)
                  .map((model) => {
                    const brand = brands.find((b) => b.id === model.brand);
                    return (
                      model.videos?.[0] && (
                        <div key={`${model.id}-${model.videos[0].id}`} className="relative">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            {brand?.logo && (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="h-4 w-auto object-contain opacity-70"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            )}
                            <span>{brand?.name}</span>
                          </div>
                          <div className="text-xs font-medium text-foreground mb-2">
                            {model.name}
                          </div>
                          <VideoThumbnail video={model.videos[0]} />
                        </div>
                      )
                    );
                  })}
              </div>
            </div>
          </section>
        )}

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
                      placeholder="Buscar por modelo, marca, serviço..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchSuggestions(true);
                      }}
                      onFocus={() => setShowSearchSuggestions(true)}
                      className="pl-10 pr-10"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setShowSearchSuggestions(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xl leading-none w-5 h-5 flex items-center justify-center"
                        aria-label="Limpar busca"
                      >
                        ×
                      </button>
                    )}
                    <SearchSuggestions
                      searchQuery={searchQuery}
                      onSelectModel={(model) => {
                        navigate(`/modelo/${model.id}`);
                        setShowSearchSuggestions(false);
                        setSearchQuery("");
                      }}
                      onClose={() => setShowSearchSuggestions(false)}
                      isOpen={showSearchSuggestions}
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

                {/* Results Count & Comparison */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredModels.length}</span>{" "}
                    modelos encontrados
                  </p>
                  {comparisonModels.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-sm">
                        {comparisonModels.length} selecionado(s) para comparação
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowComparison(true)}
                      >
                        <GitCompare className="w-4 h-4 mr-2" />
                        Comparar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setComparisonModels([])}
                      >
                        Limpar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Models Grid */}
                {modelsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    <LoadingSkeleton count={6} className="h-80" />
                  </div>
                ) : filteredModels.length > 0 ? (
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {filteredModels.map((model) => (
                      <div key={model.id} className="relative">
                        <ModelCard
                          model={model}
                          onContact={handleContact}
                        />
                        {/* Comparison Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <button
                            onClick={() => handleToggleComparison(model.id)}
                            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                              comparisonModels.includes(model.id)
                                ? "bg-primary text-primary-foreground"
                                : "bg-card/90 text-foreground hover:bg-card"
                            }`}
                            title={
                              comparisonModels.includes(model.id)
                                ? "Remover da comparação"
                                : "Adicionar à comparação"
                            }
                          >
                            <GitCompare className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
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
      
      {/* Comparison Modal */}
      <ComparisonModal
        models={comparisonModelsData}
        open={showComparison}
        onOpenChange={setShowComparison}
      />
    </div>
  );
};

export default Catalog;
