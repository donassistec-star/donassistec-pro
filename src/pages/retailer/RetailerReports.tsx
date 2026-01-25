import { useMemo, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  Activity,
  Video,
  Smartphone,
  CheckCircle2,
} from "lucide-react";
import RetailerLayout from "@/components/retailer/RetailerLayout";
import { useModels } from "@/hooks/useModels";
import { useBrands } from "@/hooks/useBrands";
import { useAuth } from "@/contexts/AuthContext";
import { ordersService, OrderWithItems } from "@/services/ordersService";

const RetailerReports = () => {
  const { models, loading: loadingModels } = useModels();
  const { brands, loading: loadingBrands } = useBrands();
  const { user } = useAuth();

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

  const isLoading = loadingModels || loadingBrands || loadingOrders;

  const {
    totalModels,
    totalBrands,
    modelsPerBrand,
    modelsWithVideos,
    totalVideos,
    servicesStats,
    orderStats,
  } = useMemo(() => {
    const totalModels = models.length;
    const totalBrands = brands.length;

    const modelsPerBrand: Record<string, number> = {};
    let modelsWithVideos = 0;
    let totalVideos = 0;

    let reconstructionCount = 0;
    let glassCount = 0;
    let partsCount = 0;

    // Estatísticas de pedidos
    const totalOrders = orders.length;
    let pendingOrders = 0;
    let completedOrders = 0;

    models.forEach((m) => {
      modelsPerBrand[m.brand] = (modelsPerBrand[m.brand] || 0) + 1;

      if (m.videos && m.videos.length > 0) {
        modelsWithVideos += 1;
        totalVideos += m.videos.length;
      }

      if (m.services?.reconstruction) reconstructionCount += 1;
      if (m.services?.glassReplacement) glassCount += 1;
      if (m.services?.partsAvailable) partsCount += 1;
    });

    orders.forEach((order) => {
      if (order.status === "pending" || order.status === "processing") pendingOrders += 1;
      if (order.status === "completed") completedOrders += 1;
    });

    return {
      totalModels,
      totalBrands,
      modelsPerBrand,
      modelsWithVideos,
      totalVideos,
      servicesStats: {
        reconstruction: reconstructionCount,
        glassReplacement: glassCount,
        partsAvailable: partsCount,
      },
      orderStats: {
        totalOrders,
        pendingOrders,
        completedOrders,
      },
    };
  }, [models, brands, orders]);

  const getBrandName = (id: string) =>
    brands.find((b) => b.id === id)?.name || id;

  return (
    <RetailerLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" />
            Relatórios do Catálogo
          </h1>
          <p className="text-muted-foreground">
            Visão geral de modelos, marcas, serviços e vídeos do seu catálogo.
          </p>
        </div>

        {/* Top KPIs - Catálogo e Pedidos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Modelos Cadastrados
              </CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : totalModels}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Em {totalBrands} marca(s)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cobertura de Serviços
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Reconstrução de Tela
                </span>
                <span className="font-semibold">
                  {servicesStats.reconstruction}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Troca de Vidro</span>
                <span className="font-semibold">
                  {servicesStats.glassReplacement}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Peças Disponíveis</span>
                <span className="font-semibold">
                  {servicesStats.partsAvailable}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conteúdo em Vídeo
              </CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : totalVideos}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {modelsWithVideos} modelo(s) com vídeos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Totais
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "..." : orderStats.totalOrders}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isLoading
                  ? "Carregando pedidos..."
                  : `${orderStats.completedOrders} concluído(s), ${orderStats.pendingOrders} em aberto`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por marca */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Modelos por Marca
              </CardTitle>
              <CardDescription>
                Distribuição de modelos entre as marcas do catálogo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Carregando dados...
                </p>
              ) : totalModels === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum modelo cadastrado para exibir.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(modelsPerBrand)
                    .sort((a, b) => b[1] - a[1])
                    .map(([brandId, count]) => {
                      const brandName = getBrandName(brandId);
                      const percentage = Math.round(
                        (count / totalModels) * 100
                      );
                      return (
                        <div
                          key={brandId}
                          className="flex items-center justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-medium text-foreground">
                                {brandName}
                              </span>
                              <span className="text-muted-foreground">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/70"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Destaques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Destaques do Catálogo
              </CardTitle>
              <CardDescription>
                Insights rápidos sobre os modelos mais preparados para conteúdo
                e serviços.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {modelsWithVideos}
                  </span>{" "}
                  de {totalModels || 0} modelos possuem pelo menos um vídeo
                  cadastrado.
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {servicesStats.reconstruction}
                  </span>{" "}
                  modelos com serviço de{" "}
                  <span className="font-medium">reconstrução de tela</span>.
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {servicesStats.glassReplacement}
                  </span>{" "}
                  modelos com serviço de{" "}
                  <span className="font-medium">troca de vidro</span>.
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {servicesStats.partsAvailable}
                  </span>{" "}
                  modelos com{" "}
                  <span className="font-medium">peças disponíveis</span>.
                </p>
              </div>
              <div className="pt-2">
                <Badge variant="outline" className="text-xs">
                  Dados em tempo real da API do catálogo
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RetailerLayout>
  );
};

export default RetailerReports;

