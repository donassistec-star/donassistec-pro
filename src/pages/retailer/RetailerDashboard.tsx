import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ShoppingCart,
  ArrowRight,
  DollarSign,
  Users,
  BarChart3,
  LineChart,
  TrendingDown,
  Target,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { useModels } from "@/hooks/useModels";
import { useBrands } from "@/hooks/useBrands";
import { ordersService, OrderWithItems } from "@/services/ordersService";
import { LineChart as RechartsLineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency, formatDate } from "@/utils/format";
import ProductRecommendations from "@/components/recommendations/ProductRecommendations";

const RetailerDashboard = () => {
  const { user } = useAuth();

  // Dados do catálogo vindos da API (modelos e marcas)
  const { models, loading: loadingModels } = useModels();
  const { brands, loading: loadingBrands } = useBrands();

  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const retailerId = user?.email;
        const data = await ordersService.getAll(retailerId);
        setOrders(data);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [user]);

  const isLoading = loadingModels || loadingBrands;

  // Estatísticas básicas calculadas a partir dos modelos
  const totalModels = models.length;
  const premiumModels = models.filter((m) => m.premium).length;
  const popularModels = models.filter((m) => m.popular).length;
  const inStockModels = models.filter((m) => m.availability === "in_stock").length;

  const catalogCoverage =
    brands.length > 0 ? Math.round((totalModels / (brands.length * 50)) * 100) : 0;

  // Estatísticas de pedidos a partir da API (com fallback para zero)
  const { stats, recentOrders, orderTrends, recommendations } = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        stats: {
          totalOrders: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalSpent: 0,
          thisMonth: 0,
          averageOrderValue: 0,
          growthRate: 0,
        },
        recentOrders: [] as Array<{
          id: string;
          date: string;
          items: number;
          status: string;
          total: number;
        }>,
        orderTrends: [] as Array<{ date: string; orders: number; revenue: number }>,
        recommendations: [] as Array<{ model: any; reason: string; score: number }>,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let pending = 0;
    let completed = 0;
    let totalSpent = 0;
    let thisMonth = 0;
    let lastMonth = 0;

    // Calcular tendências (últimos 6 meses)
    const trendsMap = new Map<string, { orders: number; revenue: number }>();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toISOString().slice(0, 7); // YYYY-MM
    });

    last6Months.forEach((month) => {
      trendsMap.set(month, { orders: 0, revenue: 0 });
    });

    orders.forEach((order) => {
      if (order.status === "pending" || order.status === "processing") pending += 1;
      if (order.status === "completed") completed += 1;

      if (order.total > 0) {
        totalSpent += order.total;

        if (order.created_at) {
          const d = new Date(order.created_at);
          const monthKey = d.toISOString().slice(0, 7);
          
          if (trendsMap.has(monthKey)) {
            const trend = trendsMap.get(monthKey)!;
            trend.orders += 1;
            trend.revenue += order.total;
          }

          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            thisMonth += order.total;
          }

          // Mês anterior
          const lastMonthDate = new Date();
          lastMonthDate.setMonth(currentMonth - 1);
          if (d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === currentYear) {
            lastMonth += order.total;
          }
        }
      }
    });

    const orderTrends = last6Months.map((month) => {
      const trend = trendsMap.get(month) || { orders: 0, revenue: 0 };
      const date = new Date(month + "-01");
      return {
        date: date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        orders: trend.orders,
        revenue: trend.revenue,
      };
    });

    // Calcular taxa de crescimento
    const growthRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    // Média de valor por pedido
    const averageOrderValue = orders.length > 0 && totalSpent > 0 ? totalSpent / orders.length : 0;

    const sorted = [...orders].sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });

    const recent = sorted.slice(0, 5).map((order) => ({
      id: order.id,
      date: order.created_at || new Date().toISOString(),
      items: order.items.length,
      status: order.status,
      total: order.total,
    }));

    // Gerar recomendações baseadas em histórico de pedidos
    const modelCounts = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const count = modelCounts.get(item.model_id) || 0;
        modelCounts.set(item.model_id, count + item.quantity);
      });
    });

    // Produtos mais comprados
    const topModels = Array.from(modelCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([modelId]) => modelId);

    // Gerar recomendações
    const recommendations = models
      .filter((m) => {
        // Priorizar modelos premium/populares que não foram comprados ainda
        return (m.premium || m.popular) && !topModels.includes(m.id);
      })
      .slice(0, 6)
      .map((model) => ({
        model,
        reason: model.premium
          ? "Modelo premium com alta qualidade"
          : model.popular
          ? "Modelo popular e bem avaliado"
          : "Disponível no catálogo",
        score: (model.premium ? 9 : model.popular ? 7 : 5) + Math.random() * 2,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      stats: {
        totalOrders: orders.length,
        pendingOrders: pending,
        completedOrders: completed,
        totalSpent,
        thisMonth,
        averageOrderValue,
        growthRate,
      },
      recentOrders: recent,
      orderTrends,
      recommendations,
    };
  }, [orders, models]);

  return (
    <RetailerLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {user?.contactName || "Lojista"}!
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus pedidos e acompanhe seu histórico de compras
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Todos os pedidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Aguardando processamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Concluídos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Finalizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalSpent)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  Este mês: {formatCurrency(stats.thisMonth)}
                </p>
                {stats.growthRate !== 0 && (
                  <Badge
                    variant={stats.growthRate > 0 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {stats.growthRate > 0 ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(stats.growthRate).toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Tendências */}
        {orderTrends.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="w-5 h-5" />
                  Tendência de Pedidos (Últimos 6 Meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={orderTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8884d8"
                      name="Pedidos"
                      strokeWidth={2}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Receita por Mês (Últimos 6 Meses)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Estatísticas Avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.averageOrderValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Valor médio por pedido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.growthRate > 0 ? "+" : ""}
                {stats.growthRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Comparado ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Previsão do Próximo Mês</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.thisMonth * (1 + stats.growthRate / 100))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Baseado na tendência atual
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Catálogo e Marcas (dados em tempo real da API) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modelos no Catálogo</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : totalModels}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading
                  ? "Carregando dados do catálogo..."
                  : `Distribuídos em ${brands.length} marcas`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modelos Premium & Populares</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">
                  {isLoading ? "..." : premiumModels}
                </span>
                <span className="text-xs text-muted-foreground">
                  premium
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading
                  ? "Carregando..."
                  : `${popularModels} modelos marcados como populares`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobertura do Catálogo</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading || catalogCoverage < 0
                  ? "..."
                  : `${Math.min(catalogCoverage, 100)}%`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading
                  ? "Analisando marcas e modelos..."
                  : "Estimativa baseada em volume médio de modelos por marca"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recomendações Inteligentes */}
        {recommendations.length > 0 && (
          <ProductRecommendations recommendations={recommendations} />
        )}

        {/* Recomendações de modelos do catálogo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <Card>
            <CardHeader>
              <CardTitle>Resumo de Estoque</CardTitle>
              <CardDescription>
                Visão rápida da disponibilidade dos modelos no catálogo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Carregando informações de estoque...
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Em estoque</span>
                    <span className="font-semibold">{inStockModels}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sob encomenda</span>
                    <span className="font-semibold">
                      {models.filter((m) => m.availability === "order").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sem estoque</span>
                    <span className="font-semibold">
                      {models.filter((m) => m.availability === "out_of_stock").length}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/catalogo">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  Explorar Catálogo
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/lojista/pedidos">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Package className="w-5 h-5 mr-3" />
                  Ver Todos os Pedidos
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/lojista/perfil">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Users className="w-5 h-5 mr-3" />
                  Meu Perfil
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link to="/lojista/relatorios">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Ver Relatórios do Catálogo
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>
                Seus últimos pedidos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">
                          {order.id}
                        </span>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {order.status === "completed"
                            ? "Concluído"
                            : "Pendente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.date).toLocaleDateString("pt-BR")} •{" "}
                        {order.items} {order.items === 1 ? "item" : "itens"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        R$ {order.total.toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/lojista/pedidos">
                <Button variant="ghost" className="w-full mt-4">
                  Ver Todos os Pedidos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </RetailerLayout>
  );
};

export default RetailerDashboard;
