import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="pt-20 pb-16">
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-2 border-dashed">
              <CardContent className="p-12">
                <div className="text-9xl font-bold text-muted-foreground/20 mb-4">
                  404
                </div>
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Página Não Encontrada
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  A página que você está procurando não existe ou foi movida.
                  Verifique o endereço ou volte para a página inicial.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/">
                    <Button size="lg" className="gap-2">
                      <Home className="w-5 h-5" />
                      Ir para Home
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar
                  </Button>
                  <Link to="/ajuda">
                    <Button size="lg" variant="outline" className="gap-2">
                      <HelpCircle className="w-5 h-5" />
                      Central de Ajuda
                    </Button>
                  </Link>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    Páginas populares:
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Link
                      to="/catalogo"
                      className="text-sm text-primary hover:underline"
                    >
                      Catálogo
                    </Link>
                    <Link
                      to="/sobre"
                      className="text-sm text-primary hover:underline"
                    >
                      Sobre Nós
                    </Link>
                    <Link
                      to="/favoritos"
                      className="text-sm text-primary hover:underline"
                    >
                      Favoritos
                    </Link>
                    <Link
                      to="/lojista/login"
                      className="text-sm text-primary hover:underline"
                    >
                      Área do Lojista
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default NotFound;
