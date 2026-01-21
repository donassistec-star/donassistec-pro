import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import { brands } from "@/data/models";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateItem, clearCart, getTotalItems } = useCart();

  const totalItems = getTotalItems();

  const handleQuantityChange = (modelId: string, change: number) => {
    const item = items.find((item) => item.model.id === modelId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      removeItem(modelId);
      toast.success("Item removido do carrinho");
    } else {
      updateItem(modelId, { quantity: newQuantity });
    }
  };

  const handleRemove = (modelId: string) => {
    removeItem(modelId);
    toast.success("Item removido do carrinho");
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Carrinho limpo");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main-content" className="pt-20 pb-16">
          {/* Breadcrumbs */}
          <section className="bg-muted/30 py-4">
            <div className="container mx-auto px-4">
              <Breadcrumbs
                items={[
                  { label: "Carrinho" },
                ]}
              />
            </div>
          </section>
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h1>
              <p className="text-muted-foreground mb-8">
                Adicione produtos ao carrinho para continuar com o pedido.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/catalogo")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Catálogo
                </Button>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Ir para Home
                </Button>
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
                { label: "Carrinho" },
              ]}
            />
          </div>
        </section>

        {/* Header */}
        <section className="bg-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-card mb-2">
                  Carrinho de Compras
                </h1>
                <p className="text-card/70">
                  {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
                </p>
              </div>
              {items.length > 0 && (
                <Button variant="outline" onClick={handleClearCart}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Carrinho
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Cart Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const brand = brands.find((b) => b.id === item.model.brand);
                  return (
                    <Card key={item.model.id} className="border-border">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Image */}
                          <div className="relative w-full sm:w-32 h-32 bg-muted/30 rounded-lg overflow-hidden shrink-0">
                            <img
                              src={item.model.image}
                              alt={item.model.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-4">
                            <div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                {brand?.logo ? (
                                  <img
                                    src={brand.logo}
                                    alt={brand.name}
                                    className="h-4 w-auto object-contain opacity-70"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  brand?.icon && <span>{brand.icon}</span>
                                )}
                                <span className="font-medium">{brand?.name}</span>
                              </div>
                              <h3 className="text-lg font-semibold text-foreground mb-2">
                                {item.model.name}
                              </h3>
                              
                              {/* Services */}
                              <div className="flex flex-wrap gap-2">
                                {item.services.reconstruction && (
                                  <Badge variant="outline" className="text-xs">
                                    🔧 Reconstrução
                                  </Badge>
                                )}
                                {item.services.glassReplacement && (
                                  <Badge variant="outline" className="text-xs">
                                    🪟 Troca de Vidro
                                  </Badge>
                                )}
                                {item.services.partsAvailable && (
                                  <Badge variant="outline" className="text-xs">
                                    📦 Peças
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Quantidade:</span>
                                <div className="flex items-center gap-2 border border-border rounded-lg">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleQuantityChange(item.model.id, -1)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-12 text-center font-semibold">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleQuantityChange(item.model.id, 1)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove(item.model.id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Notes */}
                            {item.notes && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Observações:</strong> {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Resumo do Pedido</h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Itens ({totalItems})</span>
                        <span className="font-medium">Orçamento sob consulta</span>
                      </div>
                      
                      <Separator />

                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          💡 Os preços serão informados no orçamento personalizado.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Nossa equipe entrará em contato em breve com os valores detalhados.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={() => navigate("/checkout")}
                      >
                        Finalizar Pedido
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => navigate("/catalogo")}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continuar Comprando
                      </Button>
                    </div>

                    <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-primary font-medium mb-1">
                        ✓ Atendimento Personalizado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Nossa equipe de especialistas está pronta para atender suas necessidades.
                      </p>
                    </div>
                  </CardContent>
                </Card>
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

export default Cart;
