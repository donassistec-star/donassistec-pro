import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  retailerPriceTablesService,
  PriceTrendPoint,
  PriceChangeStats,
  DailyChangeReport,
  ServicePriceVariance,
  PriceHistoryRecord,
} from "@/services/retailerPriceTablesService";
import { formatCurrency } from "@/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

interface PriceAnalyticsViewProps {
  slug: string;
  title: string;
}

export const PriceAnalyticsView: React.FC<PriceAnalyticsViewProps> = ({ slug, title }) => {
  const [stats, setStats] = useState<PriceChangeStats | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyChangeReport[]>([]);
  const [volatileServices, setVolatileServices] = useState<ServicePriceVariance[]>([]);
  const [topIncreases, setTopIncreases] = useState<PriceHistoryRecord[]>([]);
  const [topDecreases, setTopDecreases] = useState<PriceHistoryRecord[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [slug, days]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, dailyData, volatileData, increasesData, decreasesData] = await Promise.all([
        retailerPriceTablesService.getPriceStats(slug, days),
        retailerPriceTablesService.getDailyReport(slug),
        retailerPriceTablesService.getVolatileServices(slug),
        retailerPriceTablesService.getTopIncreases(slug, days),
        retailerPriceTablesService.getTopDecreases(slug, days),
      ]);

      setStats(statsData);
      setDailyReport(dailyData);
      setVolatileServices(volatileData);
      setTopIncreases(increasesData);
      setTopDecreases(decreasesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar analytics");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Erro ao carregar análises</CardTitle>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dengan selector dias */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title} - Análise de Preços</h2>
          <p className="text-sm text-gray-500">Últimos {days} dias</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90, 365].map((d) => (
            <Button
              key={d}
              variant={days === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </>
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Mudanças Totais</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.total_changes}</p>
                <p className="text-xs text-gray-500">{stats.unique_services} serviços</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Aumentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{stats.total_increases}</p>
                <p className="text-xs text-green-500">
                  Média: +{stats.avg_increase_percent.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Reduções</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{stats.total_decreases}</p>
                <p className="text-xs text-red-500">
                  Média: {stats.avg_decrease_percent.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Maior Aumento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  +{stats.max_increase_percent.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats.total_increase_value)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Maior Redução</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">
                  {(stats.max_decrease_percent * -1).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(stats.total_decrease_value)}
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Relatório Diário</TabsTrigger>
          <TabsTrigger value="volatile">Serviços Voláteis</TabsTrigger>
          <TabsTrigger value="topChanges">Top Mudanças</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mudanças por Dia</CardTitle>
              <CardDescription>
                Serviços alterados, aumentos e reduções por data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-80" />
              ) : dailyReport.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dailyReport}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: any) => {
                        if (typeof value === "number") {
                          return value.toFixed(2);
                        }
                        return value;
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="services_changed" fill="#3b82f6" name="Serviços Alterados" />
                    <Bar yAxisId="left" dataKey="price_increases" fill="#10b981" name="Aumentos" />
                    <Bar yAxisId="left" dataKey="price_decreases" fill="#ef4444" name="Reduções" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avg_change_percent"
                      stroke="#f59e0b"
                      name="Mudança Média %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-gray-500">Nenhum dado para este período</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volatile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Serviços Mais Voláteis</CardTitle>
              <CardDescription>
                Serviços com maior variação de preço (amplitude / média)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-80" />
              ) : volatileServices.length > 0 ? (
                <div className="space-y-3">
                  {volatileServices.slice(0, 10).map((service) => (
                    <div key={service.service_key} className="space-y-2 border-b pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{service.service_name}</p>
                          <p className="text-sm text-gray-500">{service.service_key}</p>
                        </div>
                        <Badge variant="destructive">
                          {service.volatility_percent.toFixed(1)}% volatilidade
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
                        <div>
                          <p className="text-gray-500">Mudanças</p>
                          <p className="font-semibold">{service.change_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Mín.</p>
                          <p className="font-semibold">{formatCurrency(service.min_price)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Máx.</p>
                          <p className="font-semibold">{formatCurrency(service.max_price)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Amplitude</p>
                          <p className="font-semibold">{formatCurrency(service.price_range)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Média</p>
                          <p className="font-semibold">{formatCurrency(service.avg_price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">Nenhum dado para este período</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topChanges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maiores Aumentos</CardTitle>
                <CardDescription>Serviços com maior % de aumento</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64" />
                ) : topIncreases.length > 0 ? (
                  <div className="space-y-2">
                    {topIncreases.slice(0, 5).map((item) => (
                      <div key={`${item.service_key}-${item.date}`} className="space-y-1 border-b pb-2">
                        <p className="font-medium text-sm">{item.service_name}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {formatCurrency(item.old_price || 0)} →{" "}
                            {formatCurrency(item.new_price)}
                          </span>
                          <Badge className="bg-green-100 text-green-800">
                            +{item.price_change_percent?.toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-gray-500">Nenhum aumento</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maiores Reduções</CardTitle>
                <CardDescription>Serviços com maior % de redução</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64" />
                ) : topDecreases.length > 0 ? (
                  <div className="space-y-2">
                    {topDecreases.slice(0, 5).map((item) => (
                      <div key={`${item.service_key}-${item.date}`} className="space-y-1 border-b pb-2">
                        <p className="font-medium text-sm">{item.service_name}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {formatCurrency(item.old_price || 0)} →{" "}
                            {formatCurrency(item.new_price)}
                          </span>
                          <Badge className="bg-red-100 text-red-800">
                            {item.price_change_percent?.toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{item.date}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-gray-500">Nenhuma redução</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
