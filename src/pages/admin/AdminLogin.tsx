import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validation } from "@/utils/validation";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Redirect se já estiver autenticado como admin
  if (isAuthenticated) {
    const userStr = localStorage.getItem("donassistec_auth");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    }
    return null;
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

    setIsLoading(true);

    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        const userStr = localStorage.getItem("donassistec_auth");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === "admin") {
            toast.success("Login realizado com sucesso!");
            navigate("/admin/dashboard");
          } else {
            toast.error("Acesso negado. Esta área é apenas para administradores.");
            navigate("/lojista/login");
          }
        }
      } else {
        toast.error("Email ou senha inválidos");
      }
    } catch (error) {
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
};

export default AdminLogin;
