import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Search, LayoutGrid, List, Smartphone, Video, GitCompare } from "lucide-react";
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
import { LoadingSkeleton } from "@/components/ui/loading";
import { useModels } from "@/hooks/useModels";
import { useBrands } from "@/hooks/useBrands";
import { PhoneModel, phoneModels, brands as staticBrands } from "@/data/models";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 24;
const DEBOUNCE_MS = 400;

type SortOption = "name" | "brand" | "popular" | "stock_first";

const Catalog = () => {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inicializar estado a partir da URL
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => sp.getAll("brand") || []);
  const [selectedServices, setSelectedServices] = useState<string[]>(() => sp.getAll("service") || []);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(() => sp.getAll("availability") || []);
  const [searchInput, setSearchInput] = useState(() => sp.get("search") || "");
  const [searchQuery, setSearchQuery] = useState(() => sp.get("search") || "");
  const [selectedPremium, setSelectedPremium] = useState(() => sp.get("premium") === "1");
  const [selectedPopular, setSelectedPopular] = useState(() => sp.get("popular") === "1");
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const s = sp.get("sort");
    return (s === "name" || s === "brand" || s === "stock_first" ? s : "popular") as SortOption;
  });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [comparisonModels, setComparisonModels] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const totalFilters =
    selectedBrands.length + selectedServices.length + selectedAvailability.length +
    (selectedPremium ? 1 : 0) + (selectedPopular ? 1 : 0);

  // Debounce da busca
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  // Sincronizar filtros para a URL
  useEffect(() => {
    const params = new URLSearchParams();
    selectedBrands.forEach((b) => params.append("brand", b));
    selectedServices.forEach((s) => params.append("service", s));
    selectedAvailability.forEach((a) => params.append("availability", a));
    if (searchQuery) params.set("search", searchQuery);
    if (selectedPremium) params.set("premium", "1");
    if (selectedPopular) params.set("popular", "1");
    if (sortBy !== "popular") params.set("sort", sortBy);
    setSp(params, { replace: true });
  }, [selectedBrands, selectedServices, selectedAvailability, searchQuery, selectedPremium, selectedPopular, sortBy, setSp]);

  // Resetar página ao mudar filtros
  useEffect(() => {
    setPage(1);
  }, [selectedBrands, selectedServices, selectedAvailability, searchQuery, selectedPremium, selectedPopular, sortBy]);

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
    setSearchInput("");
    setSearchQuery("");
    setSelectedPremium(false);
    setSelectedPopular(false);
    setPage(1);
  };

  const handlePremiumChange = (v: boolean) => setSelectedPremium(v);
  const handlePopularChange = (v: boolean) => setSelectedPopular(v);

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
    premium: selectedPremium || undefined,
    popular: selectedPopular || undefined,
  });

  const { brands: apiBrands, loading: brandsLoading } = useBrands();

  // Usar dados da API ou fallback para dados estáticos
  const useApi = !modelsError && apiModels.length > 0;
  const models = useApi ? apiModels : phoneModels;
  const brands = useApi && !brandsLoading ? apiBrands : staticBrands;

  const filteredModels = useMemo(() => {
    // Se estiver usando API e já tiver filtros aplicados, retornar diretamente
    if (useApi && (selectedBrands.length > 0 || selectedServices.length > 0 || selectedAvailability.length > 0 || searchQuery || selectedPremium || selectedPopular)) {
      let result = [...apiModels];
      if (selectedPremium) result = result.filter((m) => m.premium);
      if (selectedPopular) result = result.filter((m) => m.popular);

      if (sortBy === "name") {
        result.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === "brand") {
        result.sort((a, b) => a.brand.localeCompare(b.brand));
      } else if (sortBy === "stock_first") {
        const order = { in_stock: 0, order: 1, out_of_stock: 2 };
        result.sort((a, b) => {
          const ao = order[a.availability];
          const bo = order[b.availability];
          if (ao !== bo) return ao - bo;
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return a.name.localeCompare(b.name);
        });
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

    if (selectedPremium) result = result.filter((m) => m.premium);
    if (selectedPopular) result = result.filter((m) => m.popular);

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

    // Service filter (suporta ids estáticos e da API: service_reconstruction, etc.)
    if (selectedServices.length > 0) {
      result = result.filter((model) => {
        const dyn = (model as any).modelServices;
        return selectedServices.some((service) => {
          if (service === "reconstruction" || service === "service_reconstruction")
            return model.services?.reconstruction || dyn?.some((m: any) => m.service_id === "service_reconstruction" && m.available);
          if (service === "glassReplacement" || service === "service_glass")
            return model.services?.glassReplacement || dyn?.some((m: any) => m.service_id === "service_glass" && m.available);
          if (service === "partsAvailable" || service === "service_parts")
            return model.services?.partsAvailable || dyn?.some((m: any) => m.service_id === "service_parts" && m.available);
          if (typeof service === "string" && service.startsWith("service_"))
            return dyn?.some((m: any) => m.service_id === service && m.available);
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
    } else if (sortBy === "stock_first") {
      const order = { in_stock: 0, order: 1, out_of_stock: 2 };
      result.sort((a, b) => {
        const ao = order[a.availability];
        const bo = order[b.availability];
        if (ao !== bo) return ao - bo;
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });
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
  }, [useApi, modelsError, apiModels, models, brands, searchQuery, selectedBrands, selectedServices, selectedAvailability, selectedPremium, selectedPopular, sortBy]);

  const comparisonModelsData = filteredModels.filter((model) =>
    comparisonModels.includes(model.id)
  );

  const paginatedModels = useMemo(
    () => filteredModels.slice(0, page * PAGE_SIZE),
    [filteredModels, page]
  );
  const hasMore = filteredModels.length > page * PAGE_SIZE;

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
                    selectedPremium={selectedPremium}
                    selectedPopular={selectedPopular}
                    onBrandChange={handleBrandChange}
                    onServiceChange={handleServiceChange}
                    onAvailabilityChange={handleAvailabilityChange}
                    onPremiumChange={handlePremiumChange}
                    onPopularChange={handlePopularChange}
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
                    selectedPremium={selectedPremium}
                    selectedPopular={selectedPopular}
                    onBrandChange={handleBrandChange}
                    onServiceChange={handleServiceChange}
                    onAvailabilityChange={handleAvailabilityChange}
                    onPremiumChange={handlePremiumChange}
                    onPopularChange={handlePopularChange}
                    onClearFilters={handleClearFilters}
                    totalFilters={totalFilters}
                  />

                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por modelo, marca, serviço..."
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setShowSearchSuggestions(true);
                      }}
                      onFocus={() => setShowSearchSuggestions(true)}
                      className="pl-10 pr-10"
                    />
                    {searchInput && (
                      <button
                        onClick={() => {
                          setSearchInput("");
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
                      searchQuery={searchInput}
                      onSelectModel={(model) => {
                        navigate(`/modelo/${model.id}`);
                        setShowSearchSuggestions(false);
                        setSearchInput("");
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
                      <SelectItem value="stock_first">Em estoque primeiro</SelectItem>
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
                  <>
                  <div
                    className={`grid gap-6 ${
                      viewMode === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
                        : "grid-cols-1"
                    }`}
                  >
                    {paginatedModels.map((model) => (
                      <div key={model.id} className="relative">
                        <ModelCard
                          model={model}
                          onContact={handleContact}
                          brands={brands}
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
                  {hasMore && (
                    <div className="mt-8 flex justify-center">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => setPage((p) => p + 1)}
                        className="min-w-[200px]"
                      >
                        Carregar mais
                      </Button>
                    </div>
                  )}
                  </>
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
