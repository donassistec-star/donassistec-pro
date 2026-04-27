import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Download,
  MessageCircle,
  Truck,
  Calendar,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { brands } from "@/data/models";
import { ordersService, OrderWithItems } from "@/services/ordersService";
import { formatPrePedidoNumero } from "@/utils/format";
import { Loading } from "@/components/ui/loading";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { toast } from "sonner";
import { useSettings } from "@/hooks/useSettings";
import { validation } from "@/utils/validation";
import { getPublicContactInfo } from "@/utils/publicContact";

const RetailerOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { contactWhatsappRaw, hasWhatsApp } = getPublicContactInfo(settings);
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id, user]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const retailerId = user?.email || undefined;
      const orderData = await ordersService.getById(orderId, retailerId);
      
      if (orderData) {
        setOrder(orderData);
      } else {
        toast.error("Pedido não encontrado");
        navigate("/lojista/pedidos");
      }
    } catch (error) {
      toast.error("Erro ao carregar pedido");
      console.error(error);
      navigate("/lojista/pedidos");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <RetailerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loading size="lg" text="Carregando pedido..." />
        </div>
      </RetailerLayout>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pendente",
          icon: Clock,
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "processing":
        return {
          label: "Processando",
          icon: Package,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "completed":
        return {
          label: "Concluído",
          icon: CheckCircle2,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "cancelled":
        return {
          label: "Cancelado",
          icon: XCircle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          label: "Desconhecido",
          icon: Package,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  // Usar dados reais do pedido
  const orderItems = order.items.map((item) => {
    const brand = item.brand_name ? brands.find((b) => b.name === item.brand_name) : null;
    return { ...item, brand };
  });

  const handleWhatsApp = () => {
    if (!hasWhatsApp || !order) {
      toast.error("WhatsApp comercial não configurado.");
      return;
    }
    const message = `Olá! Gostaria de informações sobre o pedido ${order.id}. Empresa: ${user?.companyName || ""}`;
    window.open(validation.generateWhatsAppUrl(contactWhatsappRaw, message), "_blank");
  };

  return (
    <RetailerLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/lojista/pedidos")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Pedidos
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Pedido {order.id}
            </h1>
            <p className="text-muted-foreground">
              Detalhes completos do pedido
              {order.pre_pedido_id && (
                <span className="ml-2"> · Origem: <Link to={`/lojista/pre-pedidos/${order.pre_pedido_id}`} className="text-primary hover:underline">{order.pre_pedido_numero != null ? formatPrePedidoNumero(order.pre_pedido_numero) : "Pré-pedido"}</Link></span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {order.status === "completed" && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar Nota Fiscal
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleWhatsApp}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Falar no WhatsApp
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-white ${statusConfig.color}`}>
                <StatusIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">Status: {statusConfig.label}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {order.created_at && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Data: {new Date(order.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens do Pedido</CardTitle>
            <CardDescription>
              {orderItems.length} {orderItems.length === 1 ? "item" : "itens"} no pedido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item, index) => {
                return (
                  <div key={item.id || index}>
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 bg-muted/30 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                        {item.brand?.logo ? (
                          <img
                            src={item.brand.logo}
                            alt={item.brand.name}
                            className="h-12 w-auto object-contain opacity-70"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {item.brand && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                {item.brand.logo && (
                                  <img
                                    src={item.brand.logo}
                                    alt={item.brand.name}
                                    className="h-4 w-auto object-contain opacity-70"
                                  />
                                )}
                                <span>{item.brand.name}</span>
                              </div>
                            )}
                            <h4 className="font-semibold text-foreground">{item.model_name}</h4>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
                            )}
                          </div>
                          <Badge variant="outline">Qtd: {item.quantity}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.reconstruction && (
                            <Badge variant="secondary">Reconstrução de Tela</Badge>
                          )}
                          {item.glass_replacement && (
                            <Badge variant="secondary">Troca de Vidro</Badge>
                          )}
                          {item.parts_available && (
                            <Badge variant="secondary">Peças</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < orderItems.length - 1 && <Separator className="mt-4" />}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Shipping & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">{order.company_name}</p>
                <p className="text-muted-foreground">{order.contact_name}</p>
                {order.address && <p className="text-muted-foreground">{order.address}</p>}
                {order.city && order.state && (
                  <p className="text-muted-foreground">
                    {order.city} - {order.state}
                  </p>
                )}
                {order.zip_code && <p className="text-muted-foreground">CEP: {order.zip_code}</p>}
                {order.phone && <p className="text-muted-foreground">Tel: {order.phone}</p>}
                {order.email && <p className="text-muted-foreground">Email: {order.email}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  Orçamento sob consulta
                </p>
                {order.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total:</span>
                    <span className="font-bold text-xl text-primary">
                      {order.total > 0 
                        ? `R$ ${order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "Orçamento sob consulta"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline (if processing) */}
        {order.status === "processing" && order.created_at && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acompanhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                  <div>
                    <p className="font-medium">Pedido Confirmado</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-muted mt-2"></div>
                  <div>
                    <p className="font-medium text-muted-foreground">Em Processamento</p>
                    <p className="text-sm text-muted-foreground">
                      Nossa equipe está preparando seu pedido
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RetailerLayout>
  );
};

export default RetailerOrderDetail;
