import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Smartphone,
  Filter,
  X,
  Video,
  Download,
  Copy,
  CheckSquare,
  Square,
  BarChart3,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  MoreVertical,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { modelsService, brandsService } from "@/services/modelsService";
import { PhoneModel, Brand } from "@/data/models";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExcelJS from "exceljs";
import { formatDate } from "@/utils/format";

const ModelsAdmin = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [filterPremium, setFilterPremium] = useState<string>("all"); // "all", "yes", "no"
  const [filterPopular, setFilterPopular] = useState<string>("all"); // "all", "yes", "no"
  const [filterService, setFilterService] = useState<string>("all"); // "all", "reconstruction", "glass", "parts"
  const [sortBy, setSortBy] = useState<string>("name"); // "name", "brand", "availability", "created"
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const pageSize = 10;

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

  const handleDeleteClick = (id: string, name: string) => {
    setItemToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      setDeleting(true);
      await modelsService.delete(itemToDelete.id);
      toast.success("Modelo deletado com sucesso!");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar modelo");
    } finally {
      setDeleting(false);
    }
  };

  const filteredAndSortedModels = models
    .filter((model) => {
      const matchesSearch =
        !searchQuery ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brands.find((b) => b.id === model.brand)?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand = filterBrand === "all" || model.brand === filterBrand;

      const matchesAvailability =
        filterAvailability === "all" || model.availability === filterAvailability;

      const matchesPremium =
        filterPremium === "all" ||
        (filterPremium === "yes" && model.premium) ||
        (filterPremium === "no" && !model.premium);

      const matchesPopular =
        filterPopular === "all" ||
        (filterPopular === "yes" && model.popular) ||
        (filterPopular === "no" && !model.popular);

      const matchesService =
        filterService === "all" ||
        (filterService === "reconstruction" && model.services.reconstruction) ||
        (filterService === "glass" && model.services.glassReplacement) ||
        (filterService === "parts" && model.services.partsAvailable);

      return matchesSearch && matchesBrand && matchesAvailability && matchesPremium && matchesPopular && matchesService;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "brand":
          const brandA = brands.find((b) => b.id === a.brand)?.name || "";
          const brandB = brands.find((b) => b.id === b.brand)?.name || "";
          comparison = brandA.localeCompare(brandB);
          break;
        case "availability":
          comparison = a.availability.localeCompare(b.availability);
          break;
        case "created":
          // Se não houver data, manter ordem original
          comparison = 0;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  const filteredModels = filteredAndSortedModels;

  const totalPages = Math.max(1, Math.ceil(filteredModels.length / pageSize));
  const paginatedModels = filteredModels.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getBrandName = (brandId: string) => {
    return brands.find((b) => b.id === brandId)?.name || brandId;
  };

  const getAvailabilityLabel = (availability: string) => {
    const labels: Record<string, string> = {
      in_stock: "Em Estoque",
      order: "Sob Encomenda",
      out_of_stock: "Indisponível",
    };
    return labels[availability] || availability;
  };

  const getAvailabilityVariant = (availability: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      in_stock: "default",
      order: "secondary",
      out_of_stock: "destructive",
    };
    return variants[availability] || "secondary";
  };

  // Estatísticas
  const stats = {
    total: models.length,
    inStock: models.filter((m) => m.availability === "in_stock").length,
    premium: models.filter((m) => m.premium).length,
    popular: models.filter((m) => m.popular).length,
    withReconstruction: models.filter((m) => m.services.reconstruction).length,
    withGlass: models.filter((m) => m.services.glassReplacement).length,
    withParts: models.filter((m) => m.services.partsAvailable).length,
    byBrand: brands.map((brand) => ({
      brand: brand.name,
      count: models.filter((m) => m.brand === brand.id).length,
    })),
  };

  // Duplicar modelo
  const handleDuplicate = async (model: PhoneModel) => {
    try {
      const duplicatedModel: Partial<PhoneModel> = {
        ...model,
        id: `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${model.name} (Cópia)`,
      };
      delete duplicatedModel.id; // Remove o ID antigo para criar novo
      await modelsService.create(duplicatedModel as PhoneModel);
      toast.success("Modelo duplicado com sucesso!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao duplicar modelo");
    }
  };

  // Exportar modelos
  const handleExport = async (format: "excel" | "csv") => {
    const dataToExport = filteredModels.map((model) => ({
      ID: model.id,
      Nome: model.name,
      Marca: getBrandName(model.brand),
      Disponibilidade: getAvailabilityLabel(model.availability),
      Premium: model.premium ? "Sim" : "Não",
      Popular: model.popular ? "Sim" : "Não",
      "Reconstrução": model.services.reconstruction ? "Sim" : "Não",
      "Troca de Vidro": model.services.glassReplacement ? "Sim" : "Não",
      "Peças Disponíveis": model.services.partsAvailable ? "Sim" : "Não",
      "URL da Imagem": model.image || "",
      "URL do Vídeo": model.videoUrl || "",
    }));

    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Modelos");
      const keys = Object.keys(dataToExport[0] || {});
      sheet.addRow(keys);
      dataToExport.forEach((row) => sheet.addRow(keys.map((k) => (row as Record<string, unknown>)[k])));
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `modelos_${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success("Modelos exportados para Excel!");
    } else {
      // CSV
      const headers = Object.keys(dataToExport[0] || {}).join(",");
      const rows = dataToExport.map((row) => Object.values(row).join(","));
      const csv = [headers, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `modelos_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      toast.success("Modelos exportados para CSV!");
    }
  };

  // Ações em lote
  const handleSelectAll = () => {
    if (selectedModels.size === paginatedModels.length) {
      setSelectedModels(new Set());
    } else {
      setSelectedModels(new Set(paginatedModels.map((m) => m.id)));
    }
  };

  const handleToggleSelect = (modelId: string) => {
    const newSelected = new Set(selectedModels);
    if (newSelected.has(modelId)) {
      newSelected.delete(modelId);
    } else {
      newSelected.add(modelId);
    }
    setSelectedModels(newSelected);
  };

  const handleBulkAction = async (action: "delete" | "togglePremium" | "togglePopular") => {
    if (selectedModels.size === 0) {
      toast.error("Selecione pelo menos um modelo");
      return;
    }

    try {
      for (const modelId of selectedModels) {
        const model = models.find((m) => m.id === modelId);
        if (!model) continue;

        switch (action) {
          case "delete":
            await modelsService.delete(modelId);
            break;
          case "togglePremium":
            await modelsService.update(modelId, { premium: !model.premium });
            break;
          case "togglePopular":
            await modelsService.update(modelId, { popular: !model.popular });
            break;
        }
      }

      toast.success(`${selectedModels.size} modelo(s) atualizado(s) com sucesso!`);
      setSelectedModels(new Set());
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Erro ao executar ação em lote");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Administração de Modelos
            </h1>
            <p className="text-muted-foreground">
              Gerencie os modelos do catálogo: criar, editar e remover
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowStats(!showStats)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Estatísticas
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar para Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar para CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => navigate("/admin/modelos/novo")}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Modelo
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        {showStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas do Catálogo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Estoque</p>
                  <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Premium</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.premium}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Popular</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.popular}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reconstrução</p>
                  <p className="text-2xl font-bold">{stats.withReconstruction}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vidro</p>
                  <p className="text-2xl font-bold">{stats.withGlass}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Peças</p>
                  <p className="text-2xl font-bold">{stats.withParts}</p>
                </div>
              </div>
              {stats.byBrand.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium mb-3">Distribuição por Marca</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stats.byBrand.map((item) => (
                      <div key={item.brand} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{item.brand}</span>
                        <Badge>{item.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Filtros Avançados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros e Ordenação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou marca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterBrand} onValueChange={setFilterBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por marca" />
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

              <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                <SelectTrigger>
                  <SelectValue placeholder="Disponibilidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="in_stock">Em Estoque</SelectItem>
                  <SelectItem value="order">Sob Encomenda</SelectItem>
                  <SelectItem value="out_of_stock">Indisponível</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="brand">Marca</SelectItem>
                    <SelectItem value="availability">Disponibilidade</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  title={sortOrder === "asc" ? "Crescente" : "Decrescente"}
                >
                  <ArrowUpDown className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={filterPremium} onValueChange={setFilterPremium}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar Premium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="yes">Apenas Premium</SelectItem>
                  <SelectItem value="no">Não Premium</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPopular} onValueChange={setFilterPopular}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar Popular" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="yes">Apenas Populares</SelectItem>
                  <SelectItem value="no">Não Populares</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Serviços</SelectItem>
                  <SelectItem value="reconstruction">Reconstrução</SelectItem>
                  <SelectItem value="glass">Troca de Vidro</SelectItem>
                  <SelectItem value="parts">Peças Disponíveis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || filterBrand !== "all" || filterAvailability !== "all" || 
              filterPremium !== "all" || filterPopular !== "all" || filterService !== "all") && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBrand("all");
                    setFilterAvailability("all");
                    setFilterPremium("all");
                    setFilterPopular("all");
                    setFilterService("all");
                    setCurrentPage(1);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar filtros
                </Button>
                <span className="text-sm text-muted-foreground">
                  {filteredModels.length} modelo(s) encontrado(s)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ações em Lote */}
        {selectedModels.size > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedModels.size} modelo(s) selecionado(s)
                </span>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4 mr-2" />
                        Ações em Lote
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleBulkAction("togglePremium")}>
                        Alternar Premium
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction("togglePopular")}>
                        Alternar Popular
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja deletar ${selectedModels.size} modelo(s)?`)) {
                            handleBulkAction("delete");
                          }
                        }}
                        className="text-destructive"
                      >
                        Deletar Selecionados
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedModels(new Set())}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Modelos */}
        <Card>
          <CardHeader>
            <CardTitle>Modelos ({filteredModels.length})</CardTitle>
            <CardDescription>
              Lista completa de modelos cadastrados no catálogo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton count={5} className="h-16" />
            ) : filteredModels.length === 0 ? (
              <EmptyState
                icon={Smartphone}
                title={
                  searchQuery || filterBrand !== "all" || filterAvailability !== "all"
                    ? "Nenhum modelo encontrado"
                    : "Nenhum modelo cadastrado"
                }
                description={
                  searchQuery || filterBrand !== "all" || filterAvailability !== "all"
                    ? "Tente ajustar os filtros de busca para encontrar o que procura."
                    : "Comece adicionando seu primeiro modelo ao catálogo."
                }
                action={
                  !searchQuery && filterBrand === "all" && filterAvailability === "all"
                    ? {
                        label: "Criar Primeiro Modelo",
                        onClick: () => navigate("/admin/modelos/novo"),
                        variant: "default",
                      }
                    : undefined
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedModels.size === paginatedModels.length && paginatedModels.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Disponibilidade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Serviços</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedModels.map((model) => (
                      <TableRow key={model.id} className={selectedModels.has(model.id) ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedModels.has(model.id)}
                            onCheckedChange={() => handleToggleSelect(model.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {model.image && (
                              <img
                                src={model.image}
                                alt={model.name}
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            )}
                            <div>
                              <div className="font-medium">{model.name}</div>
                              <div className="text-xs text-muted-foreground">
                                ID: {model.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getBrandName(model.brand)}</TableCell>
                        <TableCell>
                          <Badge variant={getAvailabilityVariant(model.availability)}>
                            {getAvailabilityLabel(model.availability)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {model.premium && (
                              <Badge variant="default" className="text-xs">
                                Premium
                              </Badge>
                            )}
                            {model.popular && (
                              <Badge variant="secondary" className="text-xs">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {model.services.reconstruction && (
                              <Badge variant="outline" className="text-xs">
                                Reconstrução
                              </Badge>
                            )}
                            {model.services.glassReplacement && (
                              <Badge variant="outline" className="text-xs">
                                Vidro
                              </Badge>
                            )}
                            {model.services.partsAvailable && (
                              <Badge variant="outline" className="text-xs">
                                Peças
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/modelo/${model.id}`)}
                              title="Ver no site"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDuplicate(model)}
                              title="Duplicar modelo"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/modelos/${model.id}/editar`)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/modelos/${model.id}/videos`)}
                              title="Gerenciar vídeos"
                            >
                              <Video className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(model.id, model.name)}
                              title="Deletar"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                    <span>
                      Página {currentPage} de {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o modelo <strong>"{itemToDelete?.name}"</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita. Todos os dados relacionados a este modelo serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ModelsAdmin;
