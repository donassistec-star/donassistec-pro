import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";
import ModelCard from "@/components/catalog/ModelCard";
import { useFavorites } from "@/contexts/FavoritesContext";
import { phoneModels, brands, PhoneModel } from "@/data/models";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";
import { getPublicContactInfo } from "@/utils/publicContact";

const Favorites = () => {
  const { favorites, clearFavorites, removeFavorite } = useFavorites();
  const { settings } = useSettings();
  const { contactWhatsappRaw, hasWhatsApp } = getPublicContactInfo(settings);

  const favoriteModels = phoneModels.filter((model) => favorites.includes(model.id));

  const handleContact = (model: PhoneModel) => {
    if (!hasWhatsApp) {
      toast.error("WhatsApp comercial não configurado.");
      return;
    }
    const brand = brands.find((b) => b.id === model.brand);
    const message = `Olá! Sou lojista e gostaria de um orçamento para o modelo ${model.name} (${brand?.name}). Tenho interesse em saber mais sobre os serviços disponíveis.`;
    window.open(validation.generateWhatsAppUrl(contactWhatsappRaw, message), "_blank");
  };

  const handleRemoveAll = () => {
    clearFavorites();
    toast.success("Todos os favoritos foram removidos");
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="pt-20 pb-16">
          <section className="container mx-auto px-4 py-12 sm:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Seus favoritos estão vazios</h1>
              <p className="text-muted-foreground mb-8">
                Adicione modelos aos favoritos para encontrá-los rapidamente depois.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link to="/catalogo">
                  <Button className="w-full sm:w-auto">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Explorar Catálogo
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full sm:w-auto">Ir para Home</Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main id="main-content" className="pt-20 pb-16">
        {/* Breadcrumbs */}
        <section className="bg-muted/30 py-4">
          <div className="container mx-auto px-4">
            <Breadcrumbs
              items={[
                { label: "Favoritos" },
              ]}
            />
          </div>
        </section>

        {/* Header */}
        <section className="bg-foreground py-10 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-2 flex items-center gap-3 text-3xl font-bold text-card sm:text-4xl">
                  <Heart className="h-7 w-7 fill-red-500 text-red-500 sm:h-8 sm:w-8" />
                  Meus Favoritos
                </h1>
                <p className="text-card/70">
                  {favorites.length} {favorites.length === 1 ? "modelo favoritado" : "modelos favoritados"}
                </p>
              </div>
              {favorites.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleRemoveAll}
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Favoritos
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Favorites Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 sm:gap-6">
              {favoriteModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onContact={handleContact}
                  brands={brands}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Favorites;
