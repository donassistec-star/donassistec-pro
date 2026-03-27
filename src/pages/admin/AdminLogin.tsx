import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Mail, Lock, HelpCircle, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { validation } from "@/utils/validation";

/** Só usuários da admin_team acessam o painel admin */
function canAccessAdminPanel(u: { source?: string } | null): boolean {
  return u?.source === "admin_team";
}

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, loginWithBootstrap, isAuthenticated, user, isLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bootstrapAvailable, setBootstrapAvailable] = useState(false);
  const [showBootstrapModal, setShowBootstrapModal] = useState(false);
  const [bootstrapSubmitting, setBootstrapSubmitting] = useState(false);
  const [bootstrapForm, setBootstrapForm] = useState({ email: "", password: "", name: "Admin" });

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      authService.bootstrapAvailable().then((r) => {
        if (r.success && r.available) setBootstrapAvailable(true);
      });
    }
  }, [isLoading, isAuthenticated]);

  // Aguardar carregamento inicial (token + /me) antes de redirecionar
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // Redirect se já estiver autenticado: admin vai ao painel, caso contrário ao login lojista
  if (isAuthenticated && user) {
    return <Navigate to={canAccessAdminPanel(user) ? "/admin/dashboard" : "/lojista/login"} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error("Preencha email e senha");
      return;
    }

    if (!validation.isValidEmail(loginData.email)) {
      toast.error("Email inválido");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        const userStr = localStorage.getItem("donassistec_auth");
        if (userStr) {
          const u = JSON.parse(userStr);
          if (canAccessAdminPanel(u)) {
            toast.success("Login realizado com sucesso!");
            navigate("/admin/dashboard");
          } else {
            toast.error("Acesso negado. Esta área é apenas para a equipe administrativa.");
            navigate("/lojista/login");
          }
        } else {
          toast.error("Acesso negado. Dados do usuário não encontrados.");
          navigate("/lojista/login");
        }
      } else {
        toast.error("Email ou senha inválidos");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bootstrapForm.email || !bootstrapForm.password || !bootstrapForm.name) {
      toast.error("Preencha e-mail, senha e nome");
      return;
    }
    if (!validation.isValidEmail(bootstrapForm.email)) {
      toast.error("E-mail inválido");
      return;
    }
    if (bootstrapForm.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    setBootstrapSubmitting(true);
    try {
      const res = await authService.bootstrapAdmin({
        email: bootstrapForm.email,
        password: bootstrapForm.password,
        name: bootstrapForm.name,
      });
      if (res.success && res.token && res.user) {
        loginWithBootstrap({ token: res.token, user: res.user });
        toast.success("Primeiro administrador criado. Entrando...");
        setShowBootstrapModal(false);
        navigate("/admin/dashboard");
      } else {
        toast.error(res.error || "Erro ao criar administrador");
      }
    } catch {
      toast.error("Erro ao criar administrador");
    } finally {
      setBootstrapSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">Admin</span>
              <span className="text-2xl font-bold text-primary">Panel</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Área Administrativa
          </h1>
          <p className="text-muted-foreground">
            Acesso restrito para administradores
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Entrar como Administrador</CardTitle>
            <CardDescription>
              Acesse o painel administrativo e gerencie o site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@donassistec.com"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {bootstrapAvailable && (
          <Card className="mt-4 border-2 border-dashed border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-3">
                Nenhum administrador cadastrado ainda. Crie o primeiro para acessar o painel.
              </p>
              <Button
                type="button"
                variant="default"
                className="w-full"
                onClick={() => setShowBootstrapModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar primeiro administrador
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6 space-y-2">
          <Link
            to="/lojista/login"
            className="text-sm text-muted-foreground hover:text-primary transition-colors block"
          >
            Sou lojista - Acessar área do lojista
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors block"
          >
            ← Voltar para o site
          </Link>
        </div>

        {/* Ajuda 401 — visível para quem toma 401 em produção */}
        <details className="mt-6 rounded-lg border bg-muted/40 text-left">
          <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-4 w-4" />
            Erro 401 ou "Email ou senha inválidos" e não consigo entrar
          </summary>
          <div className="border-t px-4 py-3 text-xs text-muted-foreground space-y-2">
            <p>O painel admin usa a tabela <strong>admin_team</strong> no MySQL do servidor. Se ela estiver vazia ou a senha incorreta, a API retorna 401.</p>
            <p><strong>No servidor</strong> (onde a API de donassistec.com.br roda), na pasta <strong>backend</strong>:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li><code className="bg-muted px-1 rounded">node scripts/diagnostic-admin-login.js</code> — mostra o que está errado</li>
              <li><code className="bg-muted px-1 rounded">node scripts/reset-and-create-admin.js</code> — apaga e cria 1 admin (admin@donassistec.com / admin123)</li>
            </ol>
            <p>Ou com seu e-mail/senha: <code className="bg-muted px-1 rounded text-[10px]">email=seu@email.com senha=SuaSenha123 nome=Admin node scripts/reset-and-create-admin.js</code></p>
            <p>Depois, faça login com esse e-mail e senha. Veja <strong>RESOLVER-401-LOGIN.md</strong> no repositório.</p>
          </div>
        </details>

        {/* Modal: Criar primeiro administrador */}
        <Dialog open={showBootstrapModal} onOpenChange={setShowBootstrapModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar primeiro administrador</DialogTitle>
              <DialogDescription>
                Defina e-mail, nome e senha. Este usuário terá acesso total ao painel admin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBootstrap} className="grid gap-4 py-4">
              <div>
                <Label htmlFor="boot-name">Nome</Label>
                <Input
                  id="boot-name"
                  value={bootstrapForm.name}
                  onChange={(e) => setBootstrapForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Admin"
                />
              </div>
              <div>
                <Label htmlFor="boot-email">E-mail</Label>
                <Input
                  id="boot-email"
                  type="email"
                  value={bootstrapForm.email}
                  onChange={(e) => setBootstrapForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="admin@donassistec.com"
                />
              </div>
              <div>
                <Label htmlFor="boot-password">Senha (mín. 6 caracteres)</Label>
                <Input
                  id="boot-password"
                  type="password"
                  value={bootstrapForm.password}
                  onChange={(e) => setBootstrapForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowBootstrapModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={bootstrapSubmitting}>
                  {bootstrapSubmitting ? "Criando..." : "Criar e entrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminLogin;
