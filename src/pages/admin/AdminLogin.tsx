import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validation } from "@/utils/validation";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Redirect se já estiver autenticado como admin
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        // User is authenticated but not admin
        setError("Acesso negado. Esta área é apenas para administradores.");
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginData.email || !loginData.password) {
      setError("Preencha email e senha");
      return;
    }

    if (!validation.isValidEmail(loginData.email)) {
      setError("Email inválido");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(loginData.email, loginData.password);
      
      if (result.success) {
        // Wait a bit for the role to be fetched
        setTimeout(() => {
          // The useEffect will handle the redirect based on role
        }, 500);
      } else {
        setError(result.error || "Email ou senha inválidos");
      }
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@exemplo.com"
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
