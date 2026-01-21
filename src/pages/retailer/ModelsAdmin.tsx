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
} from "lucide-react";
import RetailerLayout from "@/components/retailer/RetailerLayout";
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

const ModelsAdmin = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
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

  const filteredModels = models.filter((model) => {
    const matchesSearch =
      !searchQuery ||
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brands.find((b) => b.id === model.brand)?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = filterBrand === "all" || model.brand === filterBrand;

    const matchesAvailability =
      filterAvailability === "all" || model.availability === filterAvailability;

    return matchesSearch && matchesBrand && matchesAvailability;
  });

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

  return (
    <RetailerLayout>
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
          <Button onClick={() => navigate("/lojista/modelos/novo")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Modelo
          </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <SelectValue placeholder="Filtrar por disponibilidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="in_stock">Em Estoque</SelectItem>
                  <SelectItem value="order">Sob Encomenda</SelectItem>
                  <SelectItem value="out_of_stock">Indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || filterBrand !== "all" || filterAvailability !== "all") && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterBrand("all");
                    setFilterAvailability("all");
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
                        onClick: () => navigate("/lojista/modelos/novo"),
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
                      <TableRow key={model.id}>
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
                              onClick={() => navigate(`/lojista/modelos/${model.id}/editar`)}
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/lojista/modelos/${model.id}/videos`)}
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
    </RetailerLayout>
  );
};

export default ModelsAdmin;
