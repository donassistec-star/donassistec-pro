import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search, 
  Calendar,
  Eye,
  Filter
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "react-router-dom";
import { ordersService, OrderWithItems } from "@/services/ordersService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency, formatPedidoNumero, formatPrePedidoNumero } from "@/utils/format";
import { toast } from "sonner";

const AdminOrders = () => {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      setOrders([]);
      toast.error("Erro ao carregar pedidos. Verifique a conexão e tente novamente.");
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

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const byNumero = order.numero != null && formatPedidoNumero(order.numero).toLowerCase().includes(q);
    const byPreNumero = order.pre_pedido_numero != null && formatPrePedidoNumero(order.pre_pedido_numero).toLowerCase().includes(q);
    const matchesSearch =
      order.id.toLowerCase().includes(q) ||
      order.retailer_id?.toLowerCase().includes(q) ||
      order.contact_name?.toLowerCase().includes(q) ||
      order.email?.toLowerCase().includes(q) ||
      byNumero ||
      byPreNumero;

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando pedidos..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Pedidos</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e gerencie todos os pedidos do sistema
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busque e filtre pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por ID, lojista, cliente ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="pending">Pendente</option>
                  <option value="processing">Em Processamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum pedido encontrado"
            description={orders.length === 0 
              ? "Ainda não há pedidos cadastrados no sistema."
              : "Nenhum pedido corresponde aos filtros aplicados."}
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const total = typeof order.total === "number" ? order.total : order.items?.reduce(
                (sum: number, item: { price?: number; quantity?: number }) => sum + (item?.price ?? 0) * (item?.quantity ?? 0),
                0
              ) ?? 0;

              return (
                <Card key={order.id} className="hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg" title={order.id}>
                            {order.numero != null ? formatPedidoNumero(order.numero) : `#${order.id}`}
                          </CardTitle>
                          {getStatusBadge(order.status)}
                        </div>
                        <CardDescription>
                          <div className="flex flex-wrap gap-4 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(order.created_at || 0), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                            <span>Lojista: {order.retailer_id || "N/A"}</span>
                            {order.pre_pedido_numero != null && (
                              <span className="text-primary">Origem: {formatPrePedidoNumero(order.pre_pedido_numero)}</span>
                            )}
                          </div>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{formatPrice(total)}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Cliente:</p>
                        <p className="text-sm text-muted-foreground">
                          {order.contact_name || order.company_name} ({order.email})
                        </p>
                        {order.phone && (
                          <p className="text-sm text-muted-foreground">
                            Telefone: {order.phone}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Link to={`/admin/pedidos/${order.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Stats Summary */}
        {orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <div className="text-sm text-muted-foreground">Total de Pedidos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {orders.filter((o) => o.status === "pending" || o.status === "processing").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Pendentes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {orders.filter((o) => o.status === "completed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Concluídos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {formatPrice(orders.reduce((sum, o) => sum + (Number(o.total) ?? 0), 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Valor Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
