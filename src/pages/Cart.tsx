import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Trash2, Plus, Minus, ArrowLeft, MessageCircle, Pencil, Smartphone, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useCart } from "@/contexts/CartContext";
import { useSettings } from "@/hooks/useSettings";
import { useBrands } from "@/hooks/useBrands";
import { brands } from "@/data/models";
import { toast } from "sonner";
import { formatCurrency, formatPrePedidoNumero } from "@/utils/format";
import { validation } from "@/utils/validation";
import { buildPreOrcamentoMessageList, buildPrePedidoMessageList } from "@/utils/whatsappOrcamento";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useAuth } from "@/contexts/AuthContext";
import { prePedidosService } from "@/services/prePedidosService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { brands: apiBrands } = useBrands();
  const { items, removeItem, updateItem, clearCart, getTotalItems } = useCart();
  const { addNotification } = useNotifications();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showFinalizarConfirm, setShowFinalizarConfirm] = useState(false);
  const [isFinalizando, setIsFinalizando] = useState(false);
  const [formData, setFormData] = useState({
    contactName: "",
    contactCompany: "",
    contactPhone: "",
    contactEmail: "",
    notes: "",
    needBy: "",
    isUrgent: false,
  });
  const [obsOrcamento, setObsOrcamento] = useState("");

  const allBrands = apiBrands?.length ? apiBrands : brands;
  const totalItems = getTotalItems();
  const wa = validation.cleanWhatsAppNumber(settings?.contactWhatsApp || settings?.contactPhoneRaw || "5511999999999") || "5511999999999";

  const handleEditItem = (modelId: string) => {
    removeItem(modelId);
    setImageErrors((p) => {
      const next = { ...p };
      delete next[modelId];
      return next;
    });
    navigate(`/modelo/${modelId}`);
    toast.info("Altere os serviços e adicione novamente ao pré-orçamento.");
  };

  const handleOrcamentoWhatsApp = () => {
    const list = items.map((item) => ({
      model: item.model,
      brand: allBrands.find((b) => b.id === item.model.brand),
      quantity: item.quantity,
      selectedServices: item.selectedServices,
    }));
    const msg = buildPreOrcamentoMessageList(list, obsOrcamento.trim() || undefined);
    const w = window.open(validation.generateWhatsAppUrl(wa, msg), "_blank");
    if (!w) {
      toast.error("Permita pop-ups para abrir o WhatsApp e tente novamente.");
      return;
    }
  };

  const prefillFormAndOpen = () => {
    setFormData({
      contactName: user?.contactName ?? "",
      contactCompany: user?.companyName ?? "",
      contactPhone: user?.phone ?? "",
      contactEmail: user?.email ?? "",
      notes: "",
      needBy: "",
      isUrgent: false,
    });
    setShowFinalizarConfirm(true);
  };

  const handleFinalizar = async () => {
    const list = items.map((item) => ({
      model: item.model,
      brand: allBrands.find((b) => b.id === item.model.brand),
      quantity: item.quantity,
      selectedServices: item.selectedServices,
    }));
    const contact = {
      contactName: formData.contactName || undefined,
      contactCompany: formData.contactCompany || undefined,
      notes: formData.notes || undefined,
      needBy: formData.needBy || undefined,
      isUrgent: formData.isUrgent,
    };
    setIsFinalizando(true);
    let numeroPrePedido: string | undefined;
    try {
      const created = await prePedidosService.create({
        items: list.map((item) => ({
          model_id: item.model.id,
          model_name: item.model.name,
          brand_name: item.brand?.name,
          quantity: item.quantity,
          selected_services:
            item.selectedServices?.map((s) => ({
              service_id: s.service_id,
              name: s.name,
              price: s.price,
            })) || [],
        })),
        session_id: sessionStorage.getItem("donassistec_session_id") || undefined,
        contact_name: formData.contactName || undefined,
        contact_company: formData.contactCompany || undefined,
        contact_phone: formData.contactPhone || undefined,
        contact_email: formData.contactEmail || undefined,
        notes: formData.notes || undefined,
        need_by: formData.needBy.trim() || undefined,
        is_urgent: formData.isUrgent,
        retailer_id: user?.id || user?.email || undefined,
      });
      numeroPrePedido = created?.numero != null ? formatPrePedidoNumero(created.numero) : undefined;
    } catch {
      // Fluxo segue: mensagem sem número
    }
    const msg = buildPrePedidoMessageList(list, contact, numeroPrePedido);
    const w = window.open(validation.generateWhatsAppUrl(wa, msg), "_blank");
    if (!w) {
      toast.error("Permita pop-ups para abrir o WhatsApp e tente novamente.");
      setShowFinalizarConfirm(false);
      setIsFinalizando(false);
      return;
    }
    clearCart();
    setImageErrors({});
    toast.success("Pré-pedido finalizado! Nossa equipe entrará em contato por WhatsApp.");
    addNotification({
      type: "success",
      title: "Pré-pedido em andamento",
      message: "Seu pré-pedido foi enviado por WhatsApp. Nossa equipe entrará em contato em breve.",
    });
    navigate("/catalogo", { state: { fromFinalizar: true } });
  };

  const handleQuantityChange = (modelId: string, change: number) => {
    const item = items.find((item) => item.model.id === modelId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) {
      removeItem(modelId);
      setImageErrors((p) => {
        const next = { ...p };
        delete next[modelId];
        return next;
      });
      toast.success("Item removido do pré-orçamento");
    } else {
      updateItem(modelId, { quantity: newQuantity });
    }
  };

  const handleRemove = (modelId: string) => {
    removeItem(modelId);
    setImageErrors((p) => {
      const next = { ...p };
      delete next[modelId];
      return next;
    });
    toast.success("Item removido do pré-orçamento");
  };

  const handleClearPreOrcamento = () => {
    clearCart();
    setImageErrors({});
    toast.success("Pré-orçamento limpo");
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
                  { label: "Pré-orçamento" },
                ]}
              />
            </div>
          </section>
          <section className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted/50 flex items-center justify-center">
                <FileText className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold mb-4">Seu pré-orçamento está vazio</h1>
              <p className="text-muted-foreground mb-8">
                Adicione itens ao pré-orçamento a partir do catálogo e envie por WhatsApp.
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
                { label: "Pré-orçamento" },
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
                  Pré-orçamento
                </h1>
                <p className="text-card/70">
                  {totalItems} {totalItems === 1 ? "item" : "itens"} no pré-orçamento
                </p>
              </div>
              {items.length > 0 && (
                <Button variant="outline" onClick={handleClearPreOrcamento}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar pré-orçamento
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Pré-orçamento Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Itens do pré-orçamento */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const brand = allBrands.find((b) => b.id === item.model.brand);
                  const imgError = imageErrors[item.model.id];
                  return (
                    <Card key={item.model.id} className="border-border">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                          {/* Image */}
                          <div className="relative w-full sm:w-32 h-32 bg-muted/30 rounded-lg overflow-hidden shrink-0">
                            {imgError ? (
                              <div className="flex flex-col items-center justify-center w-full h-full bg-muted/50 text-muted-foreground">
                                <Smartphone className="w-10 h-10 mb-1" />
                                <span className="text-xs font-medium px-2 text-center truncate">{item.model.name}</span>
                              </div>
                            ) : (
                              <img
                                src={item.model.image}
                                alt={item.model.name}
                                className="w-full h-full object-cover"
                                onError={() => setImageErrors((p) => ({ ...p, [item.model.id]: true }))}
                              />
                            )}
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
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Link
                                  to={`/modelo/${item.model.id}`}
                                  className="text-lg font-semibold text-foreground hover:text-primary hover:underline underline-offset-2"
                                >
                                  {item.model.name}
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shrink-0"
                                  onClick={() => handleEditItem(item.model.id)}
                                  title="Alterar serviços e quantidade"
                                >
                                  <Pencil className="w-4 h-4 mr-1" />
                                  Editar
                                </Button>
                              </div>
                              
                              {/* Serviços/peças selecionados ou badges legados */}
                              {item.selectedServices && item.selectedServices.length > 0 ? (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-muted-foreground">Seleção:</p>
                                  <ul className="text-sm space-y-0.5">
                                    {item.selectedServices.map((s) => (
                                      <li key={s.service_id} className="flex justify-between gap-2">
                                        <span>{s.name}</span>
                                        <span>{s.price > 0 ? formatCurrency(s.price) : "Sob consulta"}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="text-sm font-semibold pt-1">
                                    Total:{" "}
                                    {item.selectedServices.every((s) => s.price > 0)
                                      ? formatCurrency(
                                          item.selectedServices.reduce((a, b) => a + b.price, 0) * item.quantity
                                        )
                                      : "Sob consulta"}
                                  </p>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {item.services?.reconstruction && (
                                    <Badge variant="outline" className="text-xs">🔧 Reconstrução</Badge>
                                  )}
                                  {item.services?.glassReplacement && (
                                    <Badge variant="outline" className="text-xs">🪟 Troca de Vidro</Badge>
                                  )}
                                  {item.services?.partsAvailable && (
                                    <Badge variant="outline" className="text-xs">📦 Peças</Badge>
                                  )}
                                  {(!item.services?.reconstruction && !item.services?.glassReplacement && !item.services?.partsAvailable) && (
                                    <span className="text-xs text-muted-foreground">Orçamento sob consulta</span>
                                  )}
                                </div>
                              )}
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

              {/* Resumo e Orçamento */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-border">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Resumo do pré-orçamento</h2>

                    <div className="space-y-4 mb-6">
                      {(() => {
                        const lines = items.map((item) => {
                          if (item.selectedServices && item.selectedServices.length > 0 && item.selectedServices.every((s) => s.price > 0)) {
                            return item.selectedServices.reduce((a, b) => a + b.price, 0) * item.quantity;
                          }
                          return null;
                        });
                        const totalKnown = lines.reduce((a, b) => a + (b ?? 0), 0);
                        const hasConsult = lines.some((v) => v === null);
                      return (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Itens ({totalItems})</span>
                            <span className="font-medium">
                              {totalKnown > 0 && !hasConsult
                                ? formatCurrency(totalKnown)
                                : totalKnown > 0 && hasConsult
                                ? `${formatCurrency(totalKnown)} + itens sob consulta`
                                : "Orçamento sob consulta"}
                            </span>
                          </div>
                          <Separator />
                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <p className="text-xs font-medium text-primary">📋 Orçamento válido por 7 dias.</p>
                            <p className="text-sm text-muted-foreground">
                              💡 {totalKnown > 0 ? "Valores parciais dos itens com preço. " : ""}Os demais preços serão informados no orçamento personalizado.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Nossa equipe entrará em contato em breve com os valores detalhados.
                            </p>
                            <p className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                              Use <strong>Editar</strong> em um item para alterar serviços e quantidade na página do modelo.
                            </p>
                          </div>
                        </>
                      );
                      })()}
                    </div>

                    <div className="space-y-3">
                      <Button
                        size="lg"
                        className="w-full"
                        onClick={prefillFormAndOpen}
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Finalizar e enviar pré-pedido
                      </Button>
                      <Dialog open={showFinalizarConfirm} onOpenChange={(open) => { if (!isFinalizando) setShowFinalizarConfirm(open); }}>
                        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col">
                          <DialogHeader>
                            <DialogTitle>Finalizar pré-orçamento</DialogTitle>
                            <DialogDescription>
                              Informe seu contato (opcional) e observações. O pré-pedido será enviado por WhatsApp e o carrinho será esvaziado.
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="flex-1 max-h-[50vh] pr-4">
                            <div className="space-y-4 py-2">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="finalizar-name">Nome</Label>
                                  <Input
                                    id="finalizar-name"
                                    value={formData.contactName}
                                    onChange={(e) => setFormData((p) => ({ ...p, contactName: e.target.value }))}
                                    placeholder="Seu nome"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="finalizar-company">Empresa</Label>
                                  <Input
                                    id="finalizar-company"
                                    value={formData.contactCompany}
                                    onChange={(e) => setFormData((p) => ({ ...p, contactCompany: e.target.value }))}
                                    placeholder="Nome da empresa"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="finalizar-phone">Telefone / WhatsApp</Label>
                                  <Input
                                    id="finalizar-phone"
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData((p) => ({ ...p, contactPhone: e.target.value }))}
                                    placeholder="(11) 99999-9999"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="finalizar-email">E-mail</Label>
                                  <Input
                                    id="finalizar-email"
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData((p) => ({ ...p, contactEmail: e.target.value }))}
                                    placeholder="seu@email.com"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="finalizar-notes">Observações</Label>
                                <Textarea
                                  id="finalizar-notes"
                                  value={formData.notes}
                                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                                  placeholder="Observações gerais sobre o pedido, etc."
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="finalizar-needBy">Preciso até (opcional)</Label>
                                <Input
                                  id="finalizar-needBy"
                                  value={formData.needBy}
                                  onChange={(e) => setFormData((p) => ({ ...p, needBy: e.target.value }))}
                                  placeholder="Ex: 15/02/2025 ou Urgente"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="finalizar-urgent"
                                  checked={formData.isUrgent}
                                  onCheckedChange={(c) => setFormData((p) => ({ ...p, isUrgent: c === true }))}
                                />
                                <Label htmlFor="finalizar-urgent" className="cursor-pointer text-sm">Marcar como urgente</Label>
                              </div>
                            </div>
                          </ScrollArea>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setShowFinalizarConfirm(false)} disabled={isFinalizando}>
                              Cancelar
                            </Button>
                            <Button onClick={handleFinalizar} disabled={isFinalizando}>
                              {isFinalizando ? "Enviando..." : "Enviar pré-pedido"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <p className="text-xs text-muted-foreground">
                        Envia o pré-pedido por WhatsApp, finaliza o carrinho e nossa equipe entra em contato.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="obs-orcamento" className="text-xs text-muted-foreground">Observação para o orçamento (opcional)</Label>
                        <Input
                          id="obs-orcamento"
                          value={obsOrcamento}
                          onChange={(e) => setObsOrcamento(e.target.value)}
                          placeholder="Ex: Preciso até sexta"
                          className="text-sm"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={handleOrcamentoWhatsApp}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Orçamento (WhatsApp)
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Só envia por WhatsApp; o carrinho permanece. A observação acima será incluída na mensagem.
                      </p>
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => navigate("/catalogo")}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Continuar no Catálogo
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Ou{" "}
                        <Link to="/checkout" className="text-primary hover:underline font-medium">
                          solicite orçamento por formulário
                        </Link>
                      </p>
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
