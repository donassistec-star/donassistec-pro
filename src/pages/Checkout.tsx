import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, ShoppingCart, Ticket, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { brands } from "@/data/models";
import { ordersService, Order, OrderItem } from "@/services/ordersService";
import { couponsService, Coupon } from "@/services/couponsService";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotalItems, clearCart } = useCart();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ coupon: Coupon; discount: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    cnpj: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  });

  const totalItems = getTotalItems();
  // Valor estimado para validação do cupom (pode ser ajustado)
  const estimatedOrderValue = items.length * 100; // Valor estimado por item

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Digite um código de cupom");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para usar cupons");
      return;
    }

    try {
      setValidatingCoupon(true);
      const result = await couponsService.validate(couponCode.trim(), estimatedOrderValue);
      
      if (result) {
        setAppliedCoupon(result);
        toast.success(`Cupom aplicado! Desconto de ${formatCurrency(result.discount)}`);
      } else {
        toast.error("Cupom inválido ou expirado");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao validar cupom");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Cupom removido");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error("Seu pré-orçamento está vazio");
      return;
    }

    setIsSubmitting(true);

    try {
      // Gerar ID único para o pedido
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Preparar dados do pedido (id quando logado, para bater com a listagem do lojista)
      const retailerId = user?.id || user?.email || formData.email;
      
      const order: Order = {
        id: orderId,
        retailer_id: retailerId,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone || undefined,
        cnpj: formData.cnpj || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zip_code: formData.zipCode || undefined,
        notes: formData.notes || undefined,
        status: "pending",
        total: 0, // Orçamento sob consulta
      };

      // Preparar itens do pedido (derivar reconstruction/glass/parts de selectedServices quando existir)
      const orderItems: OrderItem[] = items.map((item) => {
        const brand = brands.find((b) => b.id === item.model.brand);
        const sel = item.selectedServices;
        const reconstruction = sel?.some((s) => s.service_id === "service_reconstruction") ?? item.services?.reconstruction ?? false;
        const glass_replacement = sel?.some((s) => s.service_id === "service_glass") ?? item.services?.glassReplacement ?? false;
        const parts_available = sel?.some((s) => s.service_id === "service_parts") ?? item.services?.partsAvailable ?? false;
        let notes = item.notes;
        if (sel && sel.length > 0) {
          const svc = "Serviços: " + sel.map((s) => s.name).join(", ");
          notes = notes ? `${notes} | ${svc}` : svc;
        }
        return {
          order_id: orderId,
          model_id: item.model.id,
          model_name: item.model.name,
          brand_name: brand?.name,
          quantity: item.quantity,
          reconstruction,
          glass_replacement,
          parts_available,
          notes,
        };
      });

      // Criar pedido na API (incluindo cupom se aplicado)
      const createdOrder = await ordersService.create(order, orderItems, appliedCoupon?.coupon.code);

      if (createdOrder) {
        // Registrar uso do cupom se aplicado
        if (appliedCoupon && user) {
          try {
            // O backend deve registrar o uso do cupom automaticamente
            // Aqui apenas confirmamos que foi aplicado
            toast.success(`Cupom ${appliedCoupon.coupon.code} aplicado no pedido!`);
          } catch (error) {
            console.error("Erro ao registrar uso do cupom:", error);
          }
        }

        setOrderId(createdOrder.id);
        setIsSubmitted(true);
        clearCart();
        setAppliedCoupon(null);
        setCouponCode("");
        toast.success("Pedido enviado com sucesso!");
      } else {
        toast.error("Erro ao criar pedido. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      toast.error(error.message || "Erro ao enviar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Seu pré-orçamento está vazio</h1>
              <p className="text-muted-foreground mb-8">
                Adicione itens ao pré-orçamento para continuar.
              </p>
              <Button onClick={() => navigate("/catalogo")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Catálogo
              </Button>
            </div>
          </section>
        </main>
        <Footer />
        <WhatsAppFloat />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-16">
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Check className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Pedido Enviado com Sucesso!</h1>
              {orderId && (
                <p className="text-sm text-muted-foreground mb-2">
                  Número do pedido: <strong className="text-foreground">{orderId}</strong>
                </p>
              )}
              <p className="text-muted-foreground mb-8">
                Recebemos seu pedido e nossa equipe entrará em contato em breve com o orçamento personalizado.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/catalogo")}>
                  Continuar Comprando
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

      <main className="pt-20 pb-16">
        {/* Header */}
        <section className="bg-foreground py-12">
          <div className="container mx-auto px-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-card mb-2">
                Finalizar Pedido
              </h1>
              <p className="text-card/70">
                Preencha os dados abaixo para solicitar seu orçamento personalizado
              </p>
            </div>
          </div>
        </section>

        {/* Checkout Form */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Informações da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <Label htmlFor="companyName">Nome da Empresa *</Label>
                          <Input
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            required
                            placeholder="Nome da sua empresa"
                          />
                        </div>

                        <div>
                          <Label htmlFor="contactName">Nome do Contato *</Label>
                          <Input
                            id="contactName"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleInputChange}
                            required
                            placeholder="Seu nome completo"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="seu@email.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            placeholder="(11) 99999-9999"
                          />
                        </div>

                        <div>
                          <Label htmlFor="cnpj">CPF ou CNPJ</Label>
                          <Input
                            id="cnpj"
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleInputChange}
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="zipCode">CEP</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            placeholder="00000-000"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="address">Endereço</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Rua, número, complemento"
                          />
                        </div>

                        <div>
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Sua cidade"
                          />
                        </div>

                        <div>
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label htmlFor="notes">Observações Adicionais</Label>
                          <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="Informações adicionais sobre seu pedido..."
                            rows={4}
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting}
                          className="flex-1"
                        >
                          {isSubmitting ? "Enviando..." : "Enviar Pedido"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={() => navigate("/carrinho")}
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Voltar ao pré-orçamento
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-border">
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Cupom Section */}
                    {user && (
                      <div className="mb-6 p-4 bg-muted/30 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Ticket className="w-4 h-4 text-primary" />
                          <Label className="text-sm font-medium">Cupom de Desconto</Label>
                        </div>
                        {appliedCoupon ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                              <div>
                                <p className="font-mono font-semibold text-sm">{appliedCoupon.coupon.code}</p>
                                <p className="text-xs text-muted-foreground">
                                  Desconto: {formatCurrency(appliedCoupon.discount)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveCoupon}
                                className="h-6 w-6"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Código do cupom"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                              className="flex-1 text-sm"
                            />
                            <Button
                              onClick={handleApplyCoupon}
                              disabled={validatingCoupon || !couponCode.trim()}
                              size="sm"
                            >
                              {validatingCoupon ? "..." : "Aplicar"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Itens ({totalItems})</span>
                        <span className="font-medium">Orçamento sob consulta</span>
                      </div>

                      <Separator />

                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {items.map((item) => {
                          const brand = brands.find((b) => b.id === item.model.brand);
                          return (
                            <div key={item.model.id} className="flex gap-3">
                              <div className="relative w-16 h-16 bg-muted/30 rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={item.model.image}
                                  alt={item.model.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {item.model.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {brand?.name} • Qtd: {item.quantity}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        💡 Orçamento Personalizado
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Nossa equipe entrará em contato em até 24 horas com o orçamento detalhado.
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

export default Checkout;
