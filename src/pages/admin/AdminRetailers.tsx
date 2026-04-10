import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  UserCheck,
  UserX,
  Mail,
  Building2,
  Phone,
  Shield,
  Trash2,
  AlertTriangle,
  ShoppingBag
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { retailersService, Retailer } from "@/services/retailersService";
import { ordersService } from "@/services/ordersService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

const AdminRetailers = () => {
  const { user: currentUser } = useAuth();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletionFilter, setDeletionFilter] = useState<string>("all");
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermanentDeleteDialog, setShowPermanentDeleteDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ordersCount, setOrdersCount] = useState<Record<string, number>>({});
  const pendingApprovalCount = retailers.filter((retailer) => retailer.approval_status === "pending").length;
  const approvedCount = retailers.filter((retailer) => retailer.approval_status === "approved").length;
  const rejectedCount = retailers.filter((retailer) => retailer.approval_status === "rejected").length;

  useEffect(() => {
    loadRetailers();
  }, []);

  const loadRetailers = async () => {
    try {
      setLoading(true);
      const data = await retailersService.getAll();
      setRetailers(data);
      const orders = await ordersService.getAll();
      const counts: Record<string, number> = {};
      for (const order of orders) {
        counts[order.retailer_id] = (counts[order.retailer_id] || 0) + 1;
      }
      setOrdersCount(counts);
    } catch (error) {
      console.error("Erro ao carregar lojistas:", error);
      toast.error("Erro ao carregar lojistas");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (retailer: Retailer) => {
    try {
      setProcessing(true);
      await retailersService.updateStatus(retailer.id, !retailer.active);
      toast.success(retailer.active ? "Lojista desativado com sucesso" : "Lojista ativado com sucesso");
      await loadRetailers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar status do lojista");
    } finally {
      setProcessing(false);
    }
  };

  const handleApprovalStatus = async (
    retailer: Retailer,
    approvalStatus: "pending" | "approved" | "rejected"
  ) => {
    const shouldNotifyOnWhatsApp = approvalStatus === "approved";
    const popupRef =
      shouldNotifyOnWhatsApp && retailer.phone && typeof window !== "undefined"
        ? window.open("", "_blank", "noopener,noreferrer")
        : null;

    try {
      setProcessing(true);
      const result = await retailersService.updateApprovalStatus(retailer.id, approvalStatus);
      const messageMap = {
        pending: "Cadastro marcado como pendente",
        approved: "Lojista aprovado com sucesso",
        rejected: "Cadastro rejeitado com sucesso",
      } as const;
      toast.success(messageMap[approvalStatus]);

      if (shouldNotifyOnWhatsApp) {
        if (result?.whatsapp_url) {
          if (popupRef) {
            popupRef.location.href = result.whatsapp_url;
          } else if (typeof window !== "undefined") {
            window.open(result.whatsapp_url, "_blank", "noopener,noreferrer");
          }
          toast.success("Mensagem de aprovação preparada no WhatsApp do lojista.");
        } else {
          popupRef?.close();
          toast.warning("Lojista aprovado, mas sem WhatsApp válido para envio da mensagem.");
        }
      } else {
        popupRef?.close();
      }

      await loadRetailers();
    } catch (error: any) {
      popupRef?.close();
      toast.error(error.message || "Erro ao atualizar aprovação do lojista");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRetailer) return;

    try {
      setProcessing(true);
      await retailersService.delete(selectedRetailer.id);
      toast.success("Lojista desativado com sucesso");
      setShowDeleteDialog(false);
      setSelectedRetailer(null);
      await loadRetailers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao desativar lojista");
    } finally {
      setProcessing(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedRetailer) return;

    try {
      setProcessing(true);
      await retailersService.deletePermanent(selectedRetailer.id);
      toast.success("Lojista excluído permanentemente com sucesso");
      setShowPermanentDeleteDialog(false);
      setSelectedRetailer(null);
      await loadRetailers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir lojista permanentemente");
    } finally {
      setProcessing(false);
    }
  };

  const filteredRetailers = retailers.filter((retailer) => {
    const matchesSearch =
      retailer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      retailer.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      retailer.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      retailer.cnpj?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && retailer.active) ||
      (statusFilter === "inactive" && !retailer.active);

    const canDeletePermanently = !retailer.active;
    const matchesDeletion =
      deletionFilter === "all" ||
      (deletionFilter === "ready" && canDeletePermanently) ||
      (deletionFilter === "active_only" && retailer.active);

    return matchesSearch && matchesStatus && matchesDeletion;
  });

  const readyForPermanentDeletionCount = retailers.filter((retailer) => !retailer.active).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando lojistas..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Lojistas</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e gerencie todos os lojistas cadastrados
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Lojistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retailers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approvedCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {pendingApprovalCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {rejectedCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Prontos para exclusao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {readyForPermanentDeletionCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Busque e filtre lojistas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por email, nome, empresa ou CPF/CNPJ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
              <div className="w-full md:w-56">
                <select
                  value={deletionFilter}
                  onChange={(e) => setDeletionFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">Todos os cadastros</option>
                  <option value="ready">Prontos para exclusao</option>
                  <option value="active_only">Somente ativos</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retailers List */}
        {filteredRetailers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum lojista encontrado"
            description={retailers.length === 0 
              ? "Ainda não há lojistas cadastrados no sistema."
              : "Nenhum lojista corresponde aos filtros aplicados."}
          />
        ) : (
          <div className="space-y-4">
            {filteredRetailers.map((retailer) => (
              <Card key={retailer.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{retailer.company_name}</CardTitle>
                        {retailer.role === "admin" && (
                          <Badge variant="default" className="gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </Badge>
                        )}
                        <Badge variant={retailer.active ? "default" : "secondary"}>
                          {retailer.active ? "Ativo" : "Inativo"}
                        </Badge>
                        {retailer.approval_status === "approved" && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                            Aprovado
                          </Badge>
                        )}
                        {retailer.approval_status === "pending" && (
                          <Badge variant="outline" className="text-amber-700 border-amber-300">
                            Aguardando aprovacao
                          </Badge>
                        )}
                        {retailer.approval_status === "rejected" && (
                          <Badge variant="destructive">
                            Rejeitado
                          </Badge>
                        )}
                        {!retailer.active && (
                          <Badge variant="outline" className="text-amber-700 border-amber-300">
                            Pronto para exclusao
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {retailer.email}
                          </span>
                          {retailer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {retailer.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            {retailer.contact_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="w-4 h-4" />
                            {ordersCount[retailer.id] || 0} pedido(s)
                          </span>
                        </div>
                        {retailer.cnpj && (
                          <div className="mt-2">
                            <span className="text-sm">CPF/CNPJ: {retailer.cnpj}</span>
                          </div>
                        )}
                        {retailer.created_at && (
                          <div className="mt-2 text-xs">
                            Cadastrado em {format(new Date(retailer.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {retailer.approval_status !== "approved" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprovalStatus(retailer, "approved")}
                        disabled={processing}
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    )}
                    {retailer.approval_status !== "rejected" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprovalStatus(retailer, "rejected")}
                        disabled={processing}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Rejeitar
                      </Button>
                    )}
                    {retailer.approval_status !== "pending" && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApprovalStatus(retailer, "pending")}
                        disabled={processing}
                      >
                        Marcar pendente
                      </Button>
                    )}
                    <Button
                      variant={retailer.active ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleStatus(retailer)}
                      disabled={processing || currentUser?.id === retailer.id}
                    >
                      {retailer.active ? (
                        <>
                          <UserX className="w-4 h-4 mr-2" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          Ativar
                        </>
                      )}
                    </Button>
                    {currentUser?.id !== retailer.id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedRetailer(retailer);
                          setShowDeleteDialog(true);
                        }}
                        disabled={processing}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Desativar
                      </Button>
                    )}
                    {!retailer.active && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedRetailer(retailer);
                          setShowPermanentDeleteDialog(true);
                        }}
                        disabled={processing}
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Excluir permanente
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desativação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar o lojista <strong>{selectedRetailer?.company_name}</strong>?
              Esta ação pode ser revertida posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPermanentDeleteDialog} onOpenChange={setShowPermanentDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente o lojista{" "}
              <strong>{selectedRetailer?.company_name}</strong>?
              <br />
              <br />
              Esta ação é definitiva e só fica disponível para lojistas já inativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? "Excluindo..." : "Excluir permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminRetailers;
