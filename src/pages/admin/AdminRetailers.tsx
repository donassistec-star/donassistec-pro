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
  Eye
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { retailersService, Retailer } from "@/services/retailersService";
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
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRetailers();
  }, []);

  const loadRetailers = async () => {
    try {
      setLoading(true);
      const data = await retailersService.getAll();
      setRetailers(data);
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

    return matchesSearch && matchesStatus;
  });

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
        <div className="grid gap-4 md:grid-cols-3">
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
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {retailers.filter((r) => r.active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {retailers.filter((r) => !r.active).length}
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
                    placeholder="Buscar por email, nome, empresa ou CNPJ..."
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
                        </div>
                        {retailer.cnpj && (
                          <div className="mt-2">
                            <span className="text-sm">CNPJ: {retailer.cnpj}</span>
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
    </AdminLayout>
  );
};

export default AdminRetailers;
