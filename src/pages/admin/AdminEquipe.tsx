import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Trash2,
  Plus,
  Pencil,
  Key,
  LayoutGrid,
  MoreVertical,
  Copy,
  Download,
  RotateCcw,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  adminTeamService,
  AdminTeamMember,
  AdminTeamRole,
  AdminModule,
  getRoleLabel,
} from "@/services/adminTeamService";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

const ROLES: { value: AdminTeamRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "gerente", label: "Gerente" },
  { value: "tecnico", label: "Técnico" },
  { value: "user", label: "Usuário" },
];

const AdminEquipe = () => {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const canAccessEquipe =
    (currentUser?.source === "admin_team" && (currentUser?.role === "admin" || currentUser?.role === "gerente")) ||
    (!!(currentUser?.modules?.length) && (currentUser?.role === "admin" || currentUser?.role === "gerente"));

  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [processing, setProcessing] = useState(false);

  // Modal criar/editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingMember, setEditingMember] = useState<AdminTeamMember | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<AdminTeamRole>("user");
  const [formPassword, setFormPassword] = useState("");

  // Modal senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMember, setPasswordMember] = useState<AdminTeamMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  // Modal módulos
  const [showModulesModal, setShowModulesModal] = useState(false);
  const [modulesMember, setModulesMember] = useState<AdminTeamMember | null>(null);
  const [allModules, setAllModules] = useState<AdminModule[]>([]);
  const [moduleVisible, setModuleVisible] = useState<Record<string, boolean>>({});
  const [modulesLoading, setModulesLoading] = useState(false);

  // Excluir
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<AdminTeamMember | null>(null);

  // Duplicar
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateSource, setDuplicateSource] = useState<AdminTeamMember | null>(null);
  const [dupName, setDupName] = useState("");
  const [dupEmail, setDupEmail] = useState("");
  const [dupPassword, setDupPassword] = useState("");

  useEffect(() => {
    if (canAccessEquipe) loadMembers();
    else setLoading(false);
  }, [canAccessEquipe]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await adminTeamService.getAll();
      setMembers(data);
    } catch (e) {
      console.error(e);
      toast.error("Erro ao carregar equipe");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingMember(null);
    setFormName("");
    setFormEmail("");
    setFormRole("user");
    setFormPassword("");
    setShowFormModal(true);
  };

  const openEdit = (m: AdminTeamMember) => {
    setEditingMember(m);
    setFormName(m.name);
    setFormEmail(m.email);
    setFormRole(m.role);
    setFormPassword("");
    setShowFormModal(true);
  };

  const handleSaveForm = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      toast.error("Nome e e-mail são obrigatórios");
      return;
    }
    if (!editingMember && !formPassword) {
      toast.error("Senha é obrigatória ao criar usuário");
      return;
    }
    if (!editingMember && formPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    try {
      setProcessing(true);
      if (editingMember) {
        await adminTeamService.update(editingMember.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
        });
        toast.success("Usuário atualizado");
      } else {
        await adminTeamService.create({
          name: formName.trim(),
          email: formEmail.trim(),
          password: formPassword,
          role: formRole,
        });
        toast.success("Usuário adicionado à equipe");
      }
      setShowFormModal(false);
      loadMembers();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    } finally {
      setProcessing(false);
    }
  };

  const openPassword = (m: AdminTeamMember) => {
    setPasswordMember(m);
    setNewPassword("");
    setNewPasswordConfirm("");
    setShowPasswordModal(true);
  };

  const handleSavePassword = async () => {
    if (!passwordMember) return;
    if (!newPassword || newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error("As senhas não coincidem");
      return;
    }
    try {
      setProcessing(true);
      await adminTeamService.setPassword(passwordMember.id, newPassword);
      toast.success("Senha definida com sucesso");
      setShowPasswordModal(false);
      setPasswordMember(null);
    } catch (e: any) {
      toast.error(e.message || "Erro ao definir senha");
    } finally {
      setProcessing(false);
    }
  };

  const openModules = async (m: AdminTeamMember) => {
    setModulesMember(m);
    setShowModulesModal(true);
    setModulesLoading(true);
    try {
      const [mods, perms] = await Promise.all([
        adminTeamService.getModules(),
        adminTeamService.getModulePermissions(m.id),
      ]);
      setAllModules(mods);
      const vis: Record<string, boolean> = {};
      mods.forEach((mo) => {
        vis[mo.key] = perms ? perms.effective.includes(mo.key) : false;
      });
      setModuleVisible(vis);
    } catch (e) {
      toast.error("Erro ao carregar módulos");
      setShowModulesModal(false);
    } finally {
      setModulesLoading(false);
    }
  };

  const handleModuleToggle = (key: string, checked: boolean) => {
    setModuleVisible((p) => ({ ...p, [key]: checked }));
  };

  const handleSaveModules = async () => {
    if (!modulesMember) return;
    try {
      setProcessing(true);
      await adminTeamService.setModuleOverrides(modulesMember.id, { ...moduleVisible });
      toast.success("Módulos atualizados");
      setShowModulesModal(false);
      setModulesMember(null);
      loadMembers();
    } catch (e: any) {
      toast.error(e.message || "Erro ao atualizar módulos");
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (m: AdminTeamMember) => {
    try {
      setProcessing(true);
      await adminTeamService.updateStatus(m.id, !m.active);
      toast.success(m.active ? "Usuário desativado" : "Usuário ativado");
      loadMembers();
    } catch (e: any) {
      toast.error(e.message || "Erro ao alterar status");
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMember) return;
    try {
      setProcessing(true);
      await adminTeamService.delete(selectedMember.id);
      toast.success("Usuário removido da equipe");
      setShowDeleteDialog(false);
      setSelectedMember(null);
      loadMembers();
    } catch (e: any) {
      toast.error(e.message || "Erro ao remover");
    } finally {
      setProcessing(false);
    }
  };

  const openDuplicate = (m: AdminTeamMember) => {
    setDuplicateSource(m);
    setDupName(`Cópia de ${m.name}`);
    setDupEmail("");
    setDupPassword("");
    setShowDuplicateModal(true);
  };

  const handleDuplicate = async () => {
    if (!duplicateSource) return;
    if (!dupName.trim() || !dupEmail.trim() || !dupPassword) {
      toast.error("Preencha nome, e-mail e senha");
      return;
    }
    if (dupPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    try {
      setProcessing(true);
      await adminTeamService.duplicate(duplicateSource.id, {
        name: dupName.trim(),
        email: dupEmail.trim(),
        password: dupPassword,
      });
      toast.success("Usuário duplicado com mesma função e módulos");
      setShowDuplicateModal(false);
      setDuplicateSource(null);
      loadMembers();
    } catch (e: any) {
      toast.error(e.message || "Erro ao duplicar");
    } finally {
      setProcessing(false);
    }
  };

  const applyModulesPreset = async (preset: "all" | "none" | "role") => {
    if (!modulesMember) return;
    if (preset === "all") {
      const next: Record<string, boolean> = {};
      allModules.forEach((mo) => { next[mo.key] = true; });
      setModuleVisible(next);
      return;
    }
    if (preset === "none") {
      const next: Record<string, boolean> = {};
      allModules.forEach((mo) => { next[mo.key] = false; });
      setModuleVisible(next);
      return;
    }
    if (preset === "role") {
      try {
        const keys = await adminTeamService.getDefaultModulesForRole(modulesMember.role);
        const next: Record<string, boolean> = {};
        allModules.forEach((mo) => { next[mo.key] = keys.includes(mo.key); });
        setModuleVisible(next);
      } catch {
        toast.error("Erro ao carregar padrão da função");
      }
    }
  };

  const handleRestoreDefaultModules = async () => {
    if (!modulesMember) return;
    try {
      setProcessing(true);
      await adminTeamService.setModuleOverrides(modulesMember.id, {});
      const keys = await adminTeamService.getDefaultModulesForRole(modulesMember.role);
      const next: Record<string, boolean> = {};
      allModules.forEach((mo) => { next[mo.key] = keys.includes(mo.key); });
      setModuleVisible(next);
      toast.success("Módulos restaurados para o padrão da função");
    } catch (e: any) {
      toast.error(e.message || "Erro ao restaurar");
    } finally {
      setProcessing(false);
    }
  };

  const exportCSV = () => {
    const headers = ["Nome", "E-mail", "Função", "Status", "Módulos customizados", "Cadastrado em"];
    const rows = filteredMembers.map((m) => [
      m.name,
      m.email,
      getRoleLabel(m.role),
      m.active ? "Ativo" : "Inativo",
      m.has_module_overrides ? "Sim" : "Não",
      m.created_at ? format(new Date(m.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "",
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `equipe-admin-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success("CSV exportado");
  };

  const filteredMembers = members
    .filter((m) => {
      const matchSearch =
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && m.active) ||
        (statusFilter === "inactive" && !m.active);
      const matchRole = roleFilter === "all" || m.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    })
    .sort((a, b) => {
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "email") return (a.email || "").localeCompare(b.email || "");
      if (sortBy === "role") return (a.role || "").localeCompare(b.role || "");
      if (sortBy === "status") return (a.active ? 1 : 0) - (b.active ? 1 : 0);
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });

  if (!canAccessEquipe) {
    return (
      <AdminLayout>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Área restrita à equipe
            </CardTitle>
            <CardDescription>
              A gestão de usuários da equipe e dos módulos visíveis no painel é feita apenas por
              <strong> administradores ou gerentes</strong> da admin_team (role admin ou gerente).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Só administradores da <strong>admin_team</strong> (role admin) acessam esta página.
              Para criar ou resetar o usuário admin, no <strong>servidor</strong> (pasta backend):
            </p>
            <ol className="text-sm list-decimal list-inside space-y-1 text-muted-foreground">
              <li><code className="bg-muted px-1 rounded">node scripts/reset-and-create-admin.js</code> — apaga todos e cria um admin (padrão: <strong>admin@donassistec.com</strong> / <strong>admin123</strong>).</li>
              <li>Ou: <code className="bg-muted px-1 rounded">email=seu@email.com senha=SuaSenha nome=SeuNome node scripts/reset-and-create-admin.js</code></li>
              <li>Depois: logout, entre em /admin/login com esse e-mail e senha.</li>
            </ol>
            <Button
              onClick={() => {
                logout();
                navigate("/admin/login");
              }}
            >
              Fazer logout e ir para o login
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Carregando equipe..." />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Equipe Admin</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários da equipe, funções e módulos visíveis no painel
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {members.filter((m) => m.active).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {members.filter((m) => !m.active).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Filtros e ordenação</CardTitle>
                <CardDescription>Buscar, filtrar por função e status, ordenar e exportar</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={exportCSV} disabled={filteredMembers.length === 0}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar usuário
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:flex-wrap gap-3">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full md:w-40 h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">Todas as funções</option>
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full md:w-36 h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full md:w-36 h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum usuário na equipe"
            description={
              members.length === 0
                ? "Adicione o primeiro usuário para começar."
                : "Nenhum usuário corresponde aos filtros."
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredMembers.map((m) => (
              <Card key={m.id} className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 min-w-0">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                        {getInitials(m.name)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-lg">{m.name}</CardTitle>
                          <Badge variant={m.role === "admin" ? "default" : "secondary"} className="gap-1">
                            {m.role === "admin" && <Shield className="w-3 h-3" />}
                            {getRoleLabel(m.role)}
                          </Badge>
                          <Badge variant={m.active ? "default" : "outline"}>
                            {m.active ? "Ativo" : "Inativo"}
                          </Badge>
                          {m.has_module_overrides && (
                            <Badge variant="outline" className="text-xs">
                              <LayoutGrid className="w-3 h-3 mr-1" />
                              Módulos customizados
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {m.email}
                          </span>
                          {m.created_at && (
                            <div className="mt-2 text-xs">
                              Cadastrado em{" "}
                              {format(new Date(m.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </div>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(m)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openPassword(m)}>
                          <Key className="w-4 h-4 mr-2" />
                          Definir senha
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openModules(m)}>
                          <LayoutGrid className="w-4 h-4 mr-2" />
                          Módulos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDuplicate(m)} disabled={processing}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar (mesma função e módulos)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(m)}
                          disabled={processing || currentUser?.id === m.id}
                        >
                          {m.active ? (
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
                        </DropdownMenuItem>
                        {currentUser?.id !== m.id && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedMember(m);
                              setShowDeleteDialog(true);
                            }}
                            disabled={processing}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover da equipe
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Editar usuário" : "Adicionar usuário"}</DialogTitle>
            <DialogDescription>
              {editingMember
                ? "Altere nome, e-mail ou função. Use \"Definir senha\" no menu para trocar a senha."
                : "Preencha os dados do novo usuário da equipe."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="form-name">Nome</Label>
              <Input
                id="form-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex.: João Silva"
              />
            </div>
            <div>
              <Label htmlFor="form-email">E-mail</Label>
              <Input
                id="form-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="joao@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="form-role">Função</Label>
              <select
                id="form-role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as AdminTeamRole)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            {!editingMember && (
              <div>
                <Label htmlFor="form-password">Senha (mín. 6 caracteres)</Label>
                <Input
                  id="form-password"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFormModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveForm} disabled={processing}>
              {processing ? "Salvando..." : editingMember ? "Atualizar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Senha */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Definir nova senha</DialogTitle>
            <DialogDescription>
              Para {passwordMember?.name} ({passwordMember?.email}). Mínimo 6 caracteres.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="new-password-confirm">Confirmar senha</Label>
              <Input
                id="new-password-confirm"
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePassword} disabled={processing}>
              {processing ? "Salvando..." : "Definir senha"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Módulos */}
      <Dialog open={showModulesModal} onOpenChange={setShowModulesModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Módulos visíveis</DialogTitle>
            <DialogDescription>
              Para {modulesMember?.name}. A função "{getRoleLabel(modulesMember?.role || "user")}" define o padrão.
              Use os atalhos ou marque manualmente.
            </DialogDescription>
          </DialogHeader>
          {modulesLoading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
            <div className="flex flex-wrap gap-2 py-2">
              <Button type="button" variant="outline" size="sm" onClick={() => applyModulesPreset("all")}>
                Todos
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyModulesPreset("none")}>
                Nenhum
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyModulesPreset("role")}>
                Padrão da função
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRestoreDefaultModules}
                disabled={processing}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Restaurar padrão (salvar)
              </Button>
            </div>
            <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto">
              {allModules.map((mo) => (
                <div key={mo.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`mod-${mo.key}`}
                    checked={!!moduleVisible[mo.key]}
                    onCheckedChange={(c) => handleModuleToggle(mo.key, !!c)}
                  />
                  <Label htmlFor={`mod-${mo.key}`} className="font-normal cursor-pointer">
                    {mo.label}
                  </Label>
                </div>
              ))}
            </div>
            </>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModulesModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveModules} disabled={processing || modulesLoading}>
              {processing ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Excluir */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover da equipe</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{selectedMember?.name}</strong> da equipe? O
              usuário não poderá mais acessar o painel admin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal Duplicar */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Duplicar usuário</DialogTitle>
            <DialogDescription>
              Criar novo usuário com a mesma função e módulos de <strong>{duplicateSource?.name}</strong>.
              Defina e-mail, nome e senha.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="dup-name">Nome</Label>
              <Input
                id="dup-name"
                value={dupName}
                onChange={(e) => setDupName(e.target.value)}
                placeholder="Ex.: Cópia de João"
              />
            </div>
            <div>
              <Label htmlFor="dup-email">E-mail</Label>
              <Input
                id="dup-email"
                type="email"
                value={dupEmail}
                onChange={(e) => setDupEmail(e.target.value)}
                placeholder="novo@email.com"
              />
            </div>
            <div>
              <Label htmlFor="dup-password">Senha (mín. 6 caracteres)</Label>
              <Input
                id="dup-password"
                type="password"
                value={dupPassword}
                onChange={(e) => setDupPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleDuplicate} disabled={processing}>
              {processing ? "Duplicando..." : "Duplicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminEquipe;
