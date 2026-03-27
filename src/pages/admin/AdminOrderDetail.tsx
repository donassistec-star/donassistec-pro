import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, User, Mail, Phone, MapPin, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import { ordersService, OrderWithItems } from "@/services/ordersService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, formatPedidoNumero, formatPrePedidoNumero } from "@/utils/format";
import { toast } from "sonner";

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      setLoading(true);
      // Admin pode ver qualquer pedido (sem filtrar por lojista)
      const data = await ordersService.getById(orderId);
      if (!data) {
        toast.error("Pedido não encontrado");
        navigate("/admin/pedidos");
        return;
      }
      setOrder(data);
    } catch (error) {
      console.error("Erro ao carregar pedido:", error);
      toast.error("Erro ao carregar pedido");
      navigate("/admin/pedidos");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "outline" },
      processing: { label: "Em Processamento", variant: "secondary" },
      completed: { label: "Concluído", variant: "default" },
      cancelled: { label: "Cancelado", variant: "destructive" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    if (price === 0 || price === null || price === undefined) {
      return "Orçamento sob consulta";
    }
    return formatCurrency(price);
  };

  const handleStatusChange = async (newStatus: OrderWithItems["status"]) => {
    if (!order || updatingStatus) return;

    setUpdatingStatus(true);
    try {
      const updatedOrder = await ordersService.updateStatus(order.id, newStatus);
      if (updatedOrder) {
        setOrder(updatedOrder);
        toast.success(`Status do pedido atualizado para "${getStatusLabel(newStatus)}"`);
      } else {
        toast.error("Erro ao atualizar status do pedido");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status do pedido");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pendente",
      processing: "Em Processamento",
      completed: "Concluído",
      cancelled: "Cancelado",
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando pedido..." />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <EmptyState
          icon={Package}
          title="Pedido não encontrado"
          description="O pedido solicitado não foi encontrado."
          action={{
            label: "Voltar para Pedidos",
            href: "/admin/pedidos",
          }}
        />
      </AdminLayout>
    );
  }

  const total = typeof order.total === "number" ? order.total : order.items?.reduce(
    (sum: number, item: { price?: number; quantity?: number }) => sum + (item?.price ?? 0) * (item?.quantity ?? 1),
    0
  ) ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link to="/admin/pedidos">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground" title={order.id}>
                {order.numero != null ? formatPedidoNumero(order.numero) : `Pedido #${order.id}`}
              </h1>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-muted-foreground mt-2">
              Criado em {format(new Date(order.created_at || 0), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              {order.pre_pedido_id && (
                <span className="ml-2"> · Origem: <Link to={`/admin/pre-pedidos/${order.pre_pedido_id}`} className="text-primary hover:underline">{order.pre_pedido_numero != null ? formatPrePedidoNumero(order.pre_pedido_numero) : "Pré-pedido"}</Link></span>
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Nome</p>
                <p className="text-sm text-muted-foreground">{order.contact_name || order.company_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="text-sm text-muted-foreground">{order.email}</p>
              </div>
              {order.phone && (
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </p>
                  <p className="text-sm text-muted-foreground">{order.phone}</p>
                </div>
              )}
              {(order.address || (order.city && order.state)) && (
                <div>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço
                  </p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {[order.address, order.city, order.state, order.zip_code].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Informações do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Lojista</p>
                <p className="text-sm text-muted-foreground">{order.retailer_id || order.company_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Status Atual</p>
                <div className="mb-3">{getStatusBadge(order.status)}</div>
                <div>
                  <p className="text-sm font-medium mb-2">Alterar Status</p>
                  <Select 
                    value={order.status} 
                    onValueChange={(value) => handleStatusChange(value as OrderWithItems["status"])}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Pendente
                        </span>
                      </SelectItem>
                      <SelectItem value="processing">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Em Processamento
                        </span>
                      </SelectItem>
                      <SelectItem value="completed">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Concluído
                        </span>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <span className="flex items-center gap-2">
                          <XCircle className="w-4 h-4" />
                          Cancelado
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {updatingStatus && (
                    <p className="text-xs text-muted-foreground mt-2">Atualizando status...</p>
                  )}
                </div>
              </div>
              {order.notes && (
                <div>
                  <p className="text-sm font-medium">Observações</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens do Pedido</CardTitle>
            <CardDescription>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} no pedido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item: { model_id?: string; model_name?: string; quantity?: number; price?: number; notes?: string }, index: number) => (
                <div
                  key={item.model_id ?? `item-${index}`}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.model_name || "Item"}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity ?? 1}
                      {(item as { price?: number }).price != null && ` x ${formatPrice((item as { price: number }).price)}`}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {(item as { price?: number }).price != null && (item.quantity ?? 1)
                        ? formatPrice((item as { price: number }).price! * (item.quantity ?? 1))
                        : "—"}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-lg font-bold">Total</p>
                <p className="text-2xl font-bold">{formatPrice(total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
