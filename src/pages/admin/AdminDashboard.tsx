import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  User, 
  Smartphone,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Home,
  Tag,
  BarChart3,
  Settings,
  Wrench,
  ClipboardList
  ,
  PlayCircle,
  HelpCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService } from "@/services/ordersService";
import { retailersService } from "@/services/retailersService";
import { productViewsService } from "@/services/productViewsService";
import { prePedidosService } from "@/services/prePedidosService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, Activity } from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRetailers: number;
  totalProductViews: number;
  prePedidosCount: number;
  prePedidosLast7: number;
  topViewedProducts: { model_id: string; total_views: number }[];
}

interface OrderTrend {
  date: string;
  orders: number;
  revenue: number;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRetailers: 0,
    totalProductViews: 0,
    prePedidosCount: 0,
    prePedidosLast7: 0,
    topViewedProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [orderTrends, setOrderTrends] = useState<OrderTrend[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number }[]>([]);
  const [productViews, setProductViews] = useState<{ model_id: string; total_views: number }[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Buscar todos os pedidos, lojistas e estatísticas de visualizações
        const [orders, retailers, mostViewed] = await Promise.all([
          ordersService.getAll(),
          retailersService.getAll(),
          productViewsService.getMostViewed(10),
        ]);
        
        const totalOrders = orders.length;
        const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "processing").length;
        const completedOrders = orders.filter(o => o.status === "completed").length;
        const totalRetailers = retailers.filter(r => r.active).length;
        const totalProductViews = mostViewed.reduce((sum, item) => sum + item.total_views, 0);

        let prePedidosCount = 0;
        let prePedidosLast7 = 0;
        try {
          const preList = await prePedidosService.getAll();
          prePedidosCount = preList.length;
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          prePedidosLast7 = preList.filter((r) => new Date(r.created_at) >= sevenDaysAgo).length;
        } catch { void 0; /* prePedidos fetch failed; stats use defaults */ }

        setStats({
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRetailers,
          totalProductViews,
          prePedidosCount,
          prePedidosLast7,
          topViewedProducts: mostViewed.slice(0, 5),
        });

        setProductViews(mostViewed.slice(0, 5));

        // Preparar dados para gráficos
        // Tendência de pedidos (últimos 7 dias)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date.toISOString().split("T")[0];
        });

        const trends = last7Days.map(date => {
          const dayOrders = orders.filter(o => o.created_at?.startsWith(date));
          const dayRevenue = dayOrders.reduce((sum, order) => {
            const orderTotal = order.total || 0;
            return sum + orderTotal;
          }, 0);

          return {
            date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            orders: dayOrders.length,
            revenue: dayRevenue,
          };
        });

        setOrderTrends(trends);

        // Distribuição por status
        const statusData = [
          { name: "Pendentes", value: orders.filter(o => o.status === "pending").length },
          { name: "Processando", value: orders.filter(o => o.status === "processing").length },
          { name: "Concluídos", value: orders.filter(o => o.status === "completed").length },
          { name: "Cancelados", value: orders.filter(o => o.status === "cancelled").length },
        ].filter(item => item.value > 0);

        setStatusDistribution(statusData);
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088fe"];

  const quickActions = [
    {
      title: "Gerenciar Conteúdo",
      description: "Administre o conteúdo da home",
      href: "/admin/home-content",
      icon: Home,
    },
    {
      title: "Gerenciar Modelos",
      description: "Adicione e edite modelos de celulares",
      href: "/admin/modelos",
      icon: Smartphone,
    },
    {
      title: "Gerenciar Marcas",
      description: "Administre as marcas disponíveis",
      href: "/admin/marcas",
      icon: Tag,
    },
    {
      title: "Gerenciar Serviços",
      description: "Administre os serviços disponíveis",
      href: "/admin/servicos",
      icon: Wrench,
    },
    {
      title: "Gerenciar Pedidos",
      description: "Visualize e gerencie todos os pedidos",
      href: "/admin/pedidos",
      icon: Package,
    },
    {
      title: "Pré-pedidos",
      description: "Registros do fluxo Finalizar (pré-orçamento)",
      href: "/admin/pre-pedidos",
      icon: ClipboardList,
    },
    {
      title: "Gerenciar Lojistas",
      description: "Visualize e gerencie todos os lojistas",
      href: "/admin/lojistas",
      icon: User,
    },
    {
      title: "Relatórios",
      description: "Visualize relatórios e estatísticas",
      href: "/admin/relatorios",
      icon: BarChart3,
    },
    {
      title: "Página Ajuda",
      description: "Edite o conteúdo e as FAQs da página de ajuda",
      href: "/admin/ajuda",
      icon: HelpCircle,
    },
    {
      title: "Configurações",
      description: "Configure o sistema",
      href: "/admin/configuracoes",
      icon: Settings,
    },
    {
      title: "Vídeos do Lojista",
      description: "Cadastre os vídeos explicativos da área do lojista",
      href: "/admin/videos-lojista",
      icon: PlayCircle,
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando estatísticas..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo, {user?.contactName || "Administrador"}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Todos os pedidos do sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando processamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Concluídos</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Finalizados com sucesso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lojistas Cadastrados</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRetailers}</div>
              <p className="text-xs text-muted-foreground">
                Total de lojistas ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações de Produtos</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalProductViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total de visualizações registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalOrders > 0 
                  ? ((stats.totalProductViews / stats.totalOrders).toFixed(1))
                  : "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                Visualizações por pedido
              </p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pré-pedidos</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.prePedidosCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats.prePedidosLast7} nos últimos 7 dias
              </p>
              <Link to="/admin/pre-pedidos" className="text-xs text-primary hover:underline mt-1 inline-block">
                Ver todos →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Order Trends */}
          {orderTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Pedidos (7 dias)</CardTitle>
                <CardDescription>
                  Pedidos e receita dos últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={orderTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="orders"
                      stroke="#8884d8"
                      name="Pedidos"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#82ca9d"
                      name="Receita (R$)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Status Distribution */}
          {statusDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>
                  Pedidos agrupados por status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Most Viewed Products */}
          {productViews.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Produtos Mais Visualizados</CardTitle>
                <CardDescription>
                  Top 5 produtos mais visualizados pelos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productViews.map(pv => ({
                    name: pv.model_id,
                    views: pv.total_views
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" fill="#8884d8" name="Visualizações" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Ações Rápidas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} to={action.href}>
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="w-6 h-6 text-primary" />
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                      </div>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
