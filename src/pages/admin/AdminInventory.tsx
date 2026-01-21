import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Search,
  AlertTriangle,
  TrendingDown,
  Edit,
  Save,
  X,
  Filter,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { modelsService, PhoneModel } from "@/services/modelsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { brandsService } from "@/services/modelsService";

const AdminInventory = () => {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStock, setEditingStock] = useState<{ quantity: number; minLevel: number }>({
    quantity: 0,
    minLevel: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modelsData, brandsData] = await Promise.all([
        modelsService.getAll(),
        brandsService.getAll(),
      ]);
      setModels(modelsData);
      setBrands(brandsData);
    } catch (error) {
      toast.error("Erro ao carregar dados");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      !searchQuery ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brands.find((b) => b.id === model.brand)?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = filterBrand === "all" || model.brand === filterBrand;

    const matchesStock =
      filterStock === "all" ||
      (filterStock === "low" && model.stock_quantity !== undefined && model.min_stock_level !== undefined && model.stock_quantity <= model.min_stock_level) ||
      (filterStock === "out" && model.stock_quantity === 0) ||
      (filterStock === "ok" && model.stock_quantity !== undefined && model.min_stock_level !== undefined && model.stock_quantity > model.min_stock_level);

    return matchesSearch && matchesBrand && matchesStock;
  });

  const handleEdit = (model: PhoneModel) => {
    setEditingId(model.id);
    setEditingStock({
      quantity: model.stock_quantity || 0,
      minLevel: model.min_stock_level || 0,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      await modelsService.update(editingId, {
        stock_quantity: editingStock.quantity,
        min_stock_level: editingStock.minLevel,
      });
      toast.success("Estoque atualizado com sucesso!");
      setEditingId(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar estoque");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingStock({ quantity: 0, minLevel: 0 });
  };

  const getStockStatus = (model: PhoneModel) => {
    const quantity = model.stock_quantity || 0;
    const minLevel = model.min_stock_level || 0;

    if (quantity === 0) {
      return { label: "Sem Estoque", variant: "destructive" as const, icon: AlertTriangle };
    }
    if (quantity <= minLevel) {
      return { label: "Estoque Baixo", variant: "secondary" as const, icon: TrendingDown };
    }
    return { label: "Em Estoque", variant: "default" as const, icon: Package };
  };

  const getBrandName = (brandId: string) => {
    return brands.find((b) => b.id === brandId)?.name || brandId;
  };

  const lowStockCount = models.filter(
    (m) => m.stock_quantity !== undefined && m.min_stock_level !== undefined && m.stock_quantity <= m.min_stock_level
  ).length;

  const outOfStockCount = models.filter((m) => (m.stock_quantity || 0) === 0).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando estoque..." />
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestão de Estoque
            </h1>
            <p className="text-muted-foreground">
              Controle e gerencie o estoque de todos os produtos
            </p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{models.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-orange-500" />
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Sem Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{outOfStockCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por modelo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStock} onValueChange={setFilterStock}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ok">Em Estoque</SelectItem>
                  <SelectItem value="low">Estoque Baixo</SelectItem>
                  <SelectItem value="out">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
              {(searchQuery || filterBrand !== "all" || filterStock !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBrand("all");
                    setFilterStock("all");
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        {filteredModels.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto encontrado"
            description="Não há produtos para exibir com os filtros aplicados."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produtos ({filteredModels.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Nível Mínimo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.map((model) => {
                      const status = getStockStatus(model);
                      const StatusIcon = status.icon;
                      const isEditing = editingId === model.id;

                      return (
                        <TableRow key={model.id}>
                          <TableCell className="font-medium">{model.name}</TableCell>
                          <TableCell>{getBrandName(model.brand)}</TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                value={editingStock.quantity}
                                onChange={(e) =>
                                  setEditingStock({
                                    ...editingStock,
                                    quantity: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-24"
                              />
                            ) : (
                              <span className="font-medium">
                                {model.stock_quantity ?? 0}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {isEditing ? (
                              <Input
                                type="number"
                                min="0"
                                value={editingStock.minLevel}
                                onChange={(e) =>
                                  setEditingStock({
                                    ...editingStock,
                                    minLevel: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-24"
                              />
                            ) : (
                              <span>{model.min_stock_level ?? 0}</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleSave}
                                  title="Salvar"
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleCancel}
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(model)}
                                title="Editar Estoque"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInventory;
