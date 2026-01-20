import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const brands = [
  { name: "Apple", icon: "🍎", models: 45, hasReconstruction: true },
  { name: "Samsung", icon: "📱", models: 120, hasReconstruction: true },
  { name: "Xiaomi", icon: "📲", models: 85, hasReconstruction: true },
  { name: "Motorola", icon: "📞", models: 60, hasReconstruction: true },
  { name: "LG", icon: "📺", models: 35, hasReconstruction: false },
  { name: "Huawei", icon: "🌐", models: 40, hasReconstruction: true },
];

const BrandsSection = () => {
  return (
    <section id="marcas" className="py-20 bg-background">
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
          {brands.map((brand) => (
            <Card
              key={brand.name}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border hover:border-primary/50"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{brand.icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{brand.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{brand.models} modelos</p>
                {brand.hasReconstruction && (
                  <Badge variant="secondary" className="text-xs">
                    Reconstrução
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
