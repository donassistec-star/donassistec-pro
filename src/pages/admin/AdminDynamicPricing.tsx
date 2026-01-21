import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { dynamicPricingService, DynamicPricing } from "@/services/dynamicPricingService";
import { modelsService } from "@/services/modelsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/utils/format";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PhoneModel } from "@/data/models";

const AdminDynamicPricing = () => {
  const [models, setModels] = useState<PhoneModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [pricings, setPricings] = useState<DynamicPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; model: string } | null>(null);
  
  const [formData, setFormData] = useState<Partial<DynamicPricing>>({
    min_quantity: 1,
    max_quantity: undefined,
    price: 0,
    discount_percentage: 0,
  });

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadPricings(selectedModel);
    }
  }, [selectedModel]);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await modelsService.getAll();
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0].id);
      }
    } catch (error) {
      toast.error("Erro ao carregar modelos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPricings = async (modelId: string) => {
    try {
      const data = await dynamicPricingService.getByModel(modelId);
      setPricings(data.sort((a, b) => a.min_quantity - b.min_quantity));
    } catch (error) {
      toast.error("Erro ao carregar preços dinâmicos");
      console.error(error);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      model_id: selectedModel,
      min_quantity: 1,
      max_quantity: undefined,
      price: 0,
      discount_percentage: 0,
    });
  };

  const handleEdit = (pricing: DynamicPricing) => {
    setEditingId(pricing.id || null);
    setFormData(pricing);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!selectedModel || !formData.min_quantity || !formData.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await dynamicPricingService.update(editingId, formData);
        toast.success("Preço dinâmico atualizado com sucesso!");
      } else {
        await dynamicPricingService.create({
          ...formData,
          model_id: selectedModel,
        } as DynamicPricing);
        toast.success("Preço dinâmico criado com sucesso!");
      }
      
      setEditingId(null);
      setIsCreating(false);
      setFormData({
        min_quantity: 1,
        max_quantity: undefined,
        price: 0,
        discount_percentage: 0,
      });
      
      if (selectedModel) {
        loadPricings(selectedModel);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar preço dinâmico");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({
      min_quantity: 1,
      max_quantity: undefined,
      price: 0,
      discount_percentage: 0,
    });
  };

  const handleDeleteClick = (id: string) => {
    const modelName = models.find((m) => m.id === selectedModel)?.name || "modelo";
    setItemToDelete({ id, model: modelName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await dynamicPricingService.delete(itemToDelete.id);
      toast.success("Preço dinâmico deletado com sucesso!");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      
      if (selectedModel) {
        loadPricings(selectedModel);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar preço dinâmico");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando modelos..." />
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
              Preços Dinâmicos
            </h1>
            <p className="text-muted-foreground">
              Configure preços diferenciados por quantidade de compra
            </p>
          </div>
          {selectedModel && !isCreating && !editingId && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Preço
            </Button>
          )}
        </div>

        {/* Seleção de Modelo */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Modelo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Formulário de Criação/Edição */}
        {(isCreating || editingId) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Editar Preço" : "Novo Preço Dinâmico"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_quantity">Quantidade Mínima *</Label>
                  <Input
                    id="min_quantity"
                    type="number"
                    min="1"
                    value={formData.min_quantity || ""}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_quantity">Quantidade Máxima (opcional)</Label>
                  <Input
                    id="max_quantity"
                    type="number"
                    min="1"
                    value={formData.max_quantity || ""}
                    onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_percentage">Desconto (%)</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.discount_percentage || ""}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Preços */}
        {selectedModel && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Tabela de Preços ({pricings.length})
              </CardTitle>
              <CardDescription>
                Preços configurados para {models.find((m) => m.id === selectedModel)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pricings.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="Nenhum preço dinâmico configurado"
                  description="Clique em 'Novo Preço' para adicionar uma regra de preço por quantidade."
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Desconto</TableHead>
                        <TableHead>Preço Final</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pricings.map((pricing) => {
                        const finalPrice = pricing.price - (pricing.price * (pricing.discount_percentage || 0) / 100);
                        return (
                          <TableRow key={pricing.id}>
                            <TableCell>
                              {pricing.min_quantity}
                              {pricing.max_quantity ? ` - ${pricing.max_quantity}` : "+"}
                            </TableCell>
                            <TableCell>{formatCurrency(pricing.price)}</TableCell>
                            <TableCell>
                              {pricing.discount_percentage ? (
                                <Badge variant="secondary">
                                  {pricing.discount_percentage}%
                                </Badge>
                              ) : (
                                "0%"
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatCurrency(finalPrice)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(pricing)}
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(pricing.id!)}
                                  title="Deletar"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog de Confirmação */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar este preço dinâmico? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminDynamicPricing;
