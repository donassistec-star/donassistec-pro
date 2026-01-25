import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Smartphone,
  Tag,
  Download,
  FileText,
  ChevronDown,
  FileSpreadsheet,
  File
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AdminLayout from "@/components/admin/AdminLayout";
import { ordersService, OrderWithItems } from "@/services/ordersService";
import { retailersService } from "@/services/retailersService";
import { useModels } from "@/hooks/useModels";
import { useBrands } from "@/hooks/useBrands";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/format";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

interface ReportStats {
  totalOrders: number;
  totalRetailers: number;
  totalModels: number;
  totalBrands: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    completed: number;
    cancelled: number;
  };
  totalRevenue: number;
  averageOrderValue: number;
  topBrands: { name: string; count: number }[];
}

const AdminReports = () => {
  const { models } = useModels();
  const { brands } = useBrands();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [retailers, setRetailers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReportStats>({
    totalOrders: 0,
    totalRetailers: 0,
    totalModels: 0,
    totalBrands: 0,
    ordersByStatus: {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
    },
    totalRevenue: 0,
    averageOrderValue: 0,
    topBrands: [],
  });

  useEffect(() => {
    loadData();
  }, [models, brands]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [ordersData, retailersData] = await Promise.all([
        ordersService.getAll(),
        retailersService.getAll(),
      ]);

      setOrders(ordersData);
      setRetailers(retailersData);

      // Calcular estatísticas
      const ordersByStatus = {
        pending: ordersData.filter((o) => o.status === "pending").length,
        processing: ordersData.filter((o) => o.status === "processing").length,
        completed: ordersData.filter((o) => o.status === "completed").length,
        cancelled: ordersData.filter((o) => o.status === "cancelled").length,
      };

      const totalRevenue = ordersData.reduce((sum, order) => {
        const orderTotal = order.items.reduce(
          (itemSum, item) => itemSum + item.price * item.quantity,
          0
        );
        return sum + orderTotal;
      }, 0);

      const averageOrderValue =
        ordersData.length > 0 ? totalRevenue / ordersData.length : 0;

      // Top brands (baseado em modelos)
      const brandCounts: Record<string, number> = {};
      models.forEach((model) => {
        if (model.brand) {
          brandCounts[model.brand] = (brandCounts[model.brand] || 0) + 1;
        }
      });

      const topBrands = Object.entries(brandCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalOrders: ordersData.length,
        totalRetailers: retailersData.filter((r) => r.active).length,
        totalModels: models.length,
        totalBrands: brands.length,
        ordersByStatus,
        totalRevenue,
        averageOrderValue,
        topBrands,
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0 || price === null || price === undefined) {
      return "R$ 0,00";
    }
    return formatCurrency(price);
  };

  const handleExportReport = async (format: "txt" | "xlsx" | "pdf") => {
    const reportData = {
      data: new Date().toLocaleString("pt-BR"),
      totalOrders: stats.totalOrders,
      totalRetailers: stats.totalRetailers,
      totalModels: stats.totalModels,
      totalBrands: stats.totalBrands,
      totalRevenue: stats.totalRevenue,
      averageOrderValue: stats.averageOrderValue,
      ordersByStatus: stats.ordersByStatus,
      topBrands: stats.topBrands,
    };

    const fileName = `relatorio-donassistec-${new Date().toISOString().split("T")[0]}`;

    if (format === "txt") {
      const reportText = `
RELATÓRIO DONASSISTEC
Data: ${reportData.data}

ESTATÍSTICAS GERAIS
-------------------
Total de Pedidos: ${reportData.totalOrders}
Total de Lojistas: ${reportData.totalRetailers}
Total de Modelos: ${reportData.totalModels}
Total de Marcas: ${reportData.totalBrands}

RECEITA
-------
Receita Total: ${formatPrice(reportData.totalRevenue)}
Ticket Médio: ${formatPrice(reportData.averageOrderValue)}

PEDIDOS POR STATUS
------------------
Pendentes: ${reportData.ordersByStatus.pending}
Processando: ${reportData.ordersByStatus.processing}
Concluídos: ${reportData.ordersByStatus.completed}
Cancelados: ${reportData.ordersByStatus.cancelled}

TOP 5 MARCAS
------------
${reportData.topBrands.map((brand, index) => `${index + 1}. ${brand.name} - ${brand.count} modelo(s)`).join("\n")}
      `.trim();

      const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Relatório TXT exportado com sucesso!");
    } else if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();

      const generalData = [
        ["Relatório DonAssistec", ""],
        ["Data", reportData.data],
        ["", ""],
        ["ESTATÍSTICAS GERAIS", ""],
        ["Total de Pedidos", reportData.totalOrders],
        ["Total de Lojistas", reportData.totalRetailers],
        ["Total de Modelos", reportData.totalModels],
        ["Total de Marcas", reportData.totalBrands],
        ["", ""],
        ["RECEITA", ""],
        ["Receita Total", formatPrice(reportData.totalRevenue)],
        ["Ticket Médio", formatPrice(reportData.averageOrderValue)],
      ];

      const statusData = [
        ["PEDIDOS POR STATUS", ""],
        ["Pendentes", reportData.ordersByStatus.pending],
        ["Processando", reportData.ordersByStatus.processing],
        ["Concluídos", reportData.ordersByStatus.completed],
        ["Cancelados", reportData.ordersByStatus.cancelled],
      ];

      const brandsData = [
        ["TOP 5 MARCAS", ""],
        ["Posição", "Marca", "Quantidade de Modelos"],
        ...reportData.topBrands.map((brand, index) => [
          index + 1,
          brand.name,
          brand.count,
        ]),
      ];

      const ws1 = workbook.addWorksheet("Relatório Geral");
      [...generalData, ...statusData].forEach((row) => ws1.addRow(row));

      const ws2 = workbook.addWorksheet("Top Marcas");
      brandsData.forEach((row) => ws2.addRow(row));

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Relatório Excel exportado com sucesso!");
    } else if (format === "pdf") {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(18);
      doc.text("Relatório DonAssistec", 14, 20);
      
      doc.setFontSize(12);
      doc.text(`Data: ${reportData.data}`, 14, 30);

      // Estatísticas Gerais
      doc.setFontSize(14);
      doc.text("Estatísticas Gerais", 14, 45);
      
      const generalRows = [
        ["Total de Pedidos", reportData.totalOrders.toString()],
        ["Total de Lojistas", reportData.totalRetailers.toString()],
        ["Total de Modelos", reportData.totalModels.toString()],
        ["Total de Marcas", reportData.totalBrands.toString()],
        ["Receita Total", formatPrice(reportData.totalRevenue)],
        ["Ticket Médio", formatPrice(reportData.averageOrderValue)],
      ];

      autoTable(doc, {
        startY: 50,
        head: [["Métrica", "Valor"]],
        body: generalRows,
        theme: "striped",
      });

      // Pedidos por Status
      const statusRows = [
        ["Pendentes", reportData.ordersByStatus.pending.toString()],
        ["Processando", reportData.ordersByStatus.processing.toString()],
        ["Concluídos", reportData.ordersByStatus.completed.toString()],
        ["Cancelados", reportData.ordersByStatus.cancelled.toString()],
      ];

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["Status", "Quantidade"]],
        body: statusRows,
        theme: "striped",
      });

      // Top Marcas
      const brandsRows = reportData.topBrands.map((brand, index) => [
        (index + 1).toString(),
        brand.name,
        brand.count.toString(),
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["Posição", "Marca", "Modelos"]],
        body: brandsRows,
        theme: "striped",
      });

      doc.save(`${fileName}.pdf`);
      toast.success("Relatório PDF exportado com sucesso!");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando relatórios..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios e Estatísticas</h1>
            <p className="text-muted-foreground mt-2">
              Visão geral completa do sistema
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportReport("txt")}>
                <FileText className="w-4 h-4 mr-2" />
                Exportar como TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport("xlsx")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar como Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport("pdf")}>
                <File className="w-4 h-4 mr-2" />
                Exportar como PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Todos os pedidos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lojistas Ativos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRetailers}</div>
              <p className="text-xs text-muted-foreground">
                Lojistas cadastrados e ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Modelos</CardTitle>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalModels}</div>
              <p className="text-xs text-muted-foreground">
                Modelos cadastrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Marcas</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBrands}</div>
              <p className="text-xs text-muted-foreground">
                Marcas cadastradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Receita Total
              </CardTitle>
              <CardDescription>
                Soma de todos os pedidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {stats.totalOrders} pedidos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Ticket Médio
              </CardTitle>
              <CardDescription>
                Valor médio por pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatPrice(stats.averageOrderValue)}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Baseado em {stats.totalOrders} pedidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Pedidos por Status
            </CardTitle>
            <CardDescription>
              Distribuição de pedidos por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.ordersByStatus.pending}
                </div>
                <div className="text-sm text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.ordersByStatus.processing}
                </div>
                <div className="text-sm text-muted-foreground">Processando</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.ordersByStatus.completed}
                </div>
                <div className="text-sm text-muted-foreground">Concluídos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.ordersByStatus.cancelled}
                </div>
                <div className="text-sm text-muted-foreground">Cancelados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Brands */}
        {stats.topBrands.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Top 5 Marcas
              </CardTitle>
              <CardDescription>
                Marcas com mais modelos cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topBrands.map((brand, index) => (
                  <div key={brand.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{brand.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {brand.count} modelo{brand.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {((brand.count / stats.totalModels) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>Saúde do Sistema</CardTitle>
            <CardDescription>
              Status geral do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium">Taxa de Conversão</p>
                <p className="text-2xl font-bold">
                  {stats.totalRetailers > 0
                    ? ((stats.totalOrders / stats.totalRetailers) * 100).toFixed(1)
                    : "0"}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Pedidos por lojista
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">
                  {stats.totalOrders > 0
                    ? ((stats.ordersByStatus.completed / stats.totalOrders) * 100).toFixed(1)
                    : "0"}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Pedidos concluídos
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Cobertura de Catálogo</p>
                <p className="text-2xl font-bold">
                  {stats.totalBrands > 0
                    ? Math.round((stats.totalModels / (stats.totalBrands * 50)) * 100)
                    : "0"}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Modelos por marca
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
