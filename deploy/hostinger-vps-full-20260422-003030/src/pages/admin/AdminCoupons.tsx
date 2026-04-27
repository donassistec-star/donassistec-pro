import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  DollarSign,
  Percent,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { couponsService, Coupon } from "@/services/couponsService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/utils/format";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; code: string } | null>(null);

  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_value: 0,
    max_discount: undefined,
    usage_limit: undefined,
    valid_from: "",
    valid_until: "",
    active: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponsService.getAll();
      setCoupons(data);
    } catch (error) {
      toast.error("Erro ao carregar cupons");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_order_value: 0,
      max_discount: undefined,
      usage_limit: undefined,
      valid_from: "",
      valid_until: "",
      active: true,
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setIsCreating(false);
    setFormData({
      ...coupon,
      valid_from: coupon.valid_from.split("T")[0] + "T" + coupon.valid_from.split("T")[1]?.split(":")[0] + ":00",
      valid_until: coupon.valid_until.split("T")[0] + "T" + coupon.valid_until.split("T")[1]?.split(":")[0] + ":00",
    });
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discount_value || !formData.valid_from || !formData.valid_until) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      if (editingId) {
        await couponsService.update(editingId, formData);
        toast.success("Cupom atualizado com sucesso!");
      } else {
        if (!formData.id) {
          formData.id = `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        await couponsService.create(formData as Coupon);
        toast.success("Cupom criado com sucesso!");
      }

      setIsCreating(false);
      setEditingId(null);
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_value: 0,
        max_discount: undefined,
        usage_limit: undefined,
        valid_from: "",
        valid_until: "",
        active: true,
      });
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar cupom");
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      min_order_value: 0,
      max_discount: undefined,
      usage_limit: undefined,
      valid_from: "",
      valid_until: "",
      active: true,
    });
  };

  const handleDeleteClick = (id: string, code: string) => {
    setItemToDelete({ id, code });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await couponsService.delete(itemToDelete.id);
      toast.success("Cupom deletado com sucesso!");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar cupom");
    }
  };

  const isCouponValid = (coupon: Coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    return coupon.active && now >= validFrom && now <= validUntil && 
           (!coupon.usage_limit || coupon.used_count < coupon.usage_limit);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando cupons..." />
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
              Cupons e Descontos
            </h1>
            <p className="text-muted-foreground">
              Gerencie cupons promocionais e descontos
            </p>
          </div>
          {!isCreating && !editingId && (
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cupom
            </Button>
          )}
        </div>

        {/* Formulário */}
        {(isCreating || editingId) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Editar Cupom" : "Novo Cupom"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Código do Cupom *</Label>
                  <Input
                    id="code"
                    value={formData.code || ""}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="EX: DESCONTO10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Tipo de Desconto *</Label>
                  <Select
                    value={formData.discount_type || "percentage"}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    {formData.discount_type === "percentage" ? "Desconto (%) *" : "Desconto (R$) *"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount_value || ""}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_order_value">Valor Mínimo do Pedido (R$)</Label>
                  <Input
                    id="min_order_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.min_order_value || ""}
                    onChange={(e) => setFormData({ ...formData, min_order_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {formData.discount_type === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="max_discount">Desconto Máximo (R$)</Label>
                    <Input
                      id="max_discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.max_discount || ""}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Limite de Uso</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    min="1"
                    value={formData.usage_limit || ""}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Ilimitado se vazio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Válido De *</Label>
                  <Input
                    id="valid_from"
                    type="datetime-local"
                    value={formData.valid_from || ""}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valid_until">Válido Até *</Label>
                  <Input
                    id="valid_until"
                    type="datetime-local"
                    value={formData.valid_until || ""}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Descrição do cupom (opcional)"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked as boolean })}
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Cupom Ativo
                </label>
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

        {/* Lista de Cupons */}
        {coupons.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="Nenhum cupom cadastrado"
            description="Crie seu primeiro cupom promocional."
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Cupons Cadastrados ({coupons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Desconto</TableHead>
                      <TableHead>Uso</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => {
                      const isValid = isCouponValid(coupon);
                      return (
                        <TableRow key={coupon.id}>
                          <TableCell className="font-mono font-semibold">
                            {coupon.code}
                          </TableCell>
                          <TableCell>
                            {coupon.discount_type === "percentage" ? (
                              <Badge variant="secondary">
                                <Percent className="w-3 h-3 mr-1" />
                                Percentual
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Fixo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {coupon.discount_type === "percentage" ? (
                              <span>{coupon.discount_value}%</span>
                            ) : (
                              <span>{formatCurrency(coupon.discount_value)}</span>
                            )}
                            {coupon.max_discount && coupon.discount_type === "percentage" && (
                              <span className="text-xs text-muted-foreground ml-1">
                                (máx. {formatCurrency(coupon.max_discount)})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {coupon.used_count}
                            {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{formatDate(coupon.valid_from)}</div>
                              <div className="text-muted-foreground">
                                até {formatDate(coupon.valid_until)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {isValid ? (
                              <Badge variant="default">Válido</Badge>
                            ) : (
                              <Badge variant="secondary">Inválido</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(coupon)}
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(coupon.id, coupon.code)}
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
            </CardContent>
          </Card>
        )}

        {/* Dialog de Confirmação */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar o cupom{" "}
                <span className="font-semibold">{itemToDelete?.code}</span>? Esta ação não pode ser desfeita.
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

export default AdminCoupons;
