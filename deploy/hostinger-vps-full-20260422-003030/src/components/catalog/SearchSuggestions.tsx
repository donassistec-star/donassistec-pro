import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, TrendingUp } from "lucide-react";
import { phoneModels as staticModels, brands as staticBrands, PhoneModel } from "@/data/models";
import { useModels } from "@/hooks/useModels";
import { useBrands } from "@/hooks/useBrands";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  searchQuery: string;
  onSelectModel: (model: PhoneModel) => void;
  onClose: () => void;
  isOpen: boolean;
  /** Ao clicar em uma "Busca popular"; define o termo no campo e aplica a busca. */
  onPopularSearchClick?: (term: string) => void;
}

const SearchSuggestions = ({ searchQuery, onSelectModel, onClose, isOpen, onPopularSearchClick }: SearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<PhoneModel[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { models: apiModels } = useModels({});
  const { brands: apiBrands } = useBrands();
  
  const phoneModels = apiModels.length > 0 ? apiModels : staticModels;
  const brands = apiBrands.length > 0 ? apiBrands : staticBrands;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      // Mostrar modelos populares quando não há busca
      const popular = phoneModels.filter((m) => m.popular).slice(0, 5);
      setSuggestions(popular);
      setPopularSearches([
        "iPhone 15 Pro Max",
        "Galaxy S24 Ultra",
        "Reconstrução de Tela",
        "Troca de Vidro",
        "Xiaomi 14 Ultra",
      ]);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = phoneModels
        .filter((model) => {
          const brand = brands.find((b) => b.id === model.brand);
          return (
            model.name.toLowerCase().includes(query) ||
            model.brand.toLowerCase().includes(query) ||
            brand?.name.toLowerCase().includes(query)
          );
        })
        .slice(0, 8);
      setSuggestions(filtered);
      setPopularSearches([]);
    }
  }, [searchQuery, phoneModels]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border rounded-lg shadow-lg max-h-[500px] overflow-y-auto"
    >
      {searchQuery.trim() ? (
        suggestions.length > 0 ? (
          <div className="p-2">
            <div className="text-xs text-muted-foreground px-3 py-2 font-medium">
              Resultados da busca ({suggestions.length})
            </div>
            {suggestions.map((model) => {
              const brand = brands.find((b) => b.id === model.brand);
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-muted/50 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {brand?.logo && (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-4 w-auto object-contain opacity-70"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">{brand?.name}</span>
                    </div>
                    <div className="font-semibold text-foreground truncate">{model.name}</div>
                    <div className="flex gap-2 mt-1">
                      {model.services?.reconstruction && (
                        <Badge variant="outline" className="text-xs">
                          Reconstrução
                        </Badge>
                      )}
                      {model.services?.glassReplacement && (
                        <Badge variant="outline" className="text-xs">
                          Vidro
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">Nenhum resultado encontrado</p>
            <p className="text-sm">Tente buscar por marca, modelo ou serviço</p>
          </div>
        )
      ) : (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4 text-sm font-medium text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            Modelos Populares
          </div>
          <div className="space-y-2">
            {suggestions.map((model) => {
              const brand = brands.find((b) => b.id === model.brand);
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-3"
                >
                  <div className="w-12 h-12 bg-muted/50 rounded-lg overflow-hidden shrink-0">
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {brand?.logo && (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-4 w-auto object-contain opacity-70"
                        />
                      )}
                      <span className="text-xs text-muted-foreground">{brand?.name}</span>
                    </div>
                    <div className="font-semibold text-foreground truncate">{model.name}</div>
                  </div>
                  {model.popular && (
                    <Badge variant="outline" className="text-xs">
                      🔥 Popular
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          {popularSearches.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-6 mb-4 text-sm font-medium text-muted-foreground">
                <Search className="w-4 h-4" />
                Buscas Populares
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => onPopularSearchClick?.(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions;
