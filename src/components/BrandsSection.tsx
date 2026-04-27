import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brands as staticBrands } from "@/data/models";
import { ArrowRight } from "lucide-react";
import { useBrands } from "@/hooks/useBrands";
import { useModels } from "@/hooks/useModels";
import { LoadingSkeleton } from "@/components/ui/loading";
import { useHomeContent } from "@/contexts/HomeContentContext";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";
import { getPublicContactInfo } from "@/utils/publicContact";

const BrandsSection = () => {
  const { brands: apiBrands, loading } = useBrands();
  const { models, loading: loadingModels } = useModels();
  const { content } = useHomeContent();
  const { settings } = useSettings();
  const brands = apiBrands && apiBrands.length > 0 ? apiBrands : staticBrands;
  const loadingData = loading || loadingModels;
  const selectedBrandIds = content.homeBrandIds || [];
  const { contactWhatsappRaw, hasWhatsApp } = getPublicContactInfo(settings);

  const brandsWithStats = brands
    .map((brand) => {
      const brandModels = models.filter((model) => model.brand === brand.id);
      return {
        ...brand,
        modelsCount: brandModels.length,
        hasReconstruction: brandModels.some((model) => model.services.reconstruction),
      };
    })
    .filter((brand) => brand.logo || brand.modelsCount > 0 || apiBrands.length > 0);

  const orderedBrands =
    selectedBrandIds.length > 0
      ? selectedBrandIds
          .map((id) => brandsWithStats.find((brand) => brand.id === id))
          .filter((brand): brand is NonNullable<typeof brand> => Boolean(brand))
      : brandsWithStats;

  if (loadingData) {
    return (
      <section id="marcas" className="bg-transparent py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Catálogo</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Escolha a <span className="text-primary">Marca</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            <LoadingSkeleton count={6} className="h-40" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="marcas" className="bg-transparent py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Catálogo</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha a <span className="text-primary">Marca</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trabalhamos com as principais marcas do mercado. Selecione para ver modelos, 
            peças disponíveis e serviços de reconstrução.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {orderedBrands.map((brand) => (
            <a
              key={brand.id}
              href={
                hasWhatsApp
                  ? validation.generateWhatsAppUrl(
                      contactWhatsappRaw,
                      `Olá! Gostaria de ver mais modelos da marca ${brand.name}.`
                    )
                  : "/contato"
              }
              target={hasWhatsApp ? "_blank" : undefined}
              rel={hasWhatsApp ? "noreferrer" : undefined}
            >
                <Card
                  className="group relative cursor-pointer overflow-hidden border border-white/10 bg-gradient-to-br from-card via-card to-muted/60 shadow-[0_18px_50px_rgba(2,8,23,0.18)] backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_28px_70px_rgba(14,165,233,0.16)]"
                >
                  {/* Gradient Background */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                    style={{ 
                      background: `radial-gradient(circle at center, ${brand.color || "currentColor"} 0%, transparent 70%)`
                    }}
                  />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  
                  <CardContent className="p-6 text-center relative z-10">
                  {/* Logo */}
                  <div className="mb-4 flex items-center justify-center h-20 relative">
                    {brand.logo ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-14 w-auto object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 ease-out"
                          style={{ maxWidth: "120px" }}
                          onError={(e) => {
                            // Fallback para ícone SVG se imagem não carregar
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="text-5xl font-bold transition-transform duration-300 group-hover:scale-110" style="color: ${brand.color || '#666'}">${brand.name.charAt(0)}</div>`;
                            }
                          }}
                        />
                        {/* Glow effect on hover */}
                        <div 
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"
                          style={{ backgroundColor: brand.color || "currentColor" }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="text-5xl font-bold transition-transform duration-300 group-hover:scale-110"
                        style={{ color: brand.color || "#666" }}
                      >
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>

                    {/* Brand Name */}
                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                      {brand.name}
                    </h3>

                    {/* Models Count */}
                    <p className="text-sm font-medium text-muted-foreground mb-4">
                      {brand.modelsCount} {brand.modelsCount === 1 ? "modelo" : "modelos"}
                    </p>

                    {/* Reconstruction Badge */}
                    {brand.hasReconstruction && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs font-semibold mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Reconstrução
                      </Badge>
                    )}

                    {/* Arrow Indicator */}
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors mt-2">
                      <span>Ver mais modelos</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>

                  {/* Hover Effect Border */}
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </Card>
              </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
