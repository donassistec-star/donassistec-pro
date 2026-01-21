import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search, 
  Filter,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService, OrderWithItems } from "@/services/ordersService";
import { LoadingSkeleton } from "@/components/ui/loading";
import { toast } from "sonner";
import RetailerLayout from "@/components/retailer/RetailerLayout";

const RetailerOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const retailerId = user?.email || undefined;
      const ordersData = await ordersService.getAll(retailerId);
      setOrders(ordersData);
    } catch (error) {
      toast.error("Erro ao carregar pedidos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Usar dados reais da API
  const displayOrders = orders;

  const getStatusConfig = (status: OrderWithItems["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "Pendente",
          icon: Clock,
          variant: "secondary" as const,
          color: "text-yellow-600",
        };
      case "processing":
        return {
          label: "Processando",
          icon: Package,
          variant: "default" as const,
          color: "text-blue-600",
        };
      case "completed":
        return {
          label: "Concluído",
          icon: CheckCircle2,
          variant: "default" as const,
          color: "text-green-600",
        };
      case "cancelled":
        return {
          label: "Cancelado",
          icon: XCircle,
          variant: "destructive" as const,
          color: "text-red-600",
        };
    }
  };

  const filteredOrders = displayOrders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const statusCounts = {
    all: displayOrders.length,
    pending: displayOrders.filter((o) => o.status === "pending").length,
    processing: displayOrders.filter((o) => o.status === "processing").length,
    completed: displayOrders.filter((o) => o.status === "completed").length,
    cancelled: displayOrders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <RetailerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe o status e histórico de todos os seus pedidos
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold">{statusCounts.all}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Processando</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.processing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Concluídos</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.completed}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número do pedido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {["all", "pending", "processing", "completed", "cancelled"].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === "all" && "Todos"}
                    {status === "pending" && "Pendentes"}
                    {status === "processing" && "Processando"}
                    {status === "completed" && "Concluídos"}
                    {status === "cancelled" && "Cancelados"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <LoadingSkeleton count={3} className="h-32" />
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || filterStatus !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Você ainda não realizou nenhum pedido"}
                </p>
                {!searchQuery && filterStatus === "all" && (
                  <Button onClick={() => window.location.href = "/catalogo"}>
                    Explorar Catálogo
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            Pedido {order.id}
                          </h3>
                          <Badge variant={statusConfig.variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>
                            Data: {order.created_at ? new Date(order.created_at).toLocaleDateString("pt-BR") : "N/A"}
                          </span>
                          <span>{order.items.length} {order.items.length === 1 ? "item" : "itens"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            {order.total > 0 
                              ? `R$ ${order.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                              : "Orçamento sob consulta"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/lojista/pedidos/${order.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          {order.status === "completed" && (
                            <Button variant="outline" size="sm" title="Baixar nota fiscal">
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </RetailerLayout>
  );
};

export default RetailerOrders;
