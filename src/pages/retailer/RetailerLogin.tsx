import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Mail, Lock, Building2, User, Phone, FileText, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validation } from "@/utils/validation";
import { Alert, AlertDescription } from "@/components/ui/alert";

const RetailerLogin = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactName: "",
    phone: "",
    cnpj: "",
  });

  // Redirect se já estiver autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/lojista/dashboard");
    }
  }, [isAuthenticated, authLoading, navigate]);

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
        toast.success("Login realizado com sucesso!");
        navigate("/lojista/dashboard");
      } else {
        setError(result.error || "Email ou senha inválidos");
      }
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (!registerData.email || !registerData.password || !registerData.companyName || !registerData.contactName) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (!validation.isValidEmail(registerData.email)) {
      setError("Email inválido");
      return;
    }

    const passwordValidation = validation.isValidPassword(registerData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || "Senha inválida");
      return;
    }

    if (!validation.passwordsMatch(registerData.password, registerData.confirmPassword)) {
      setError("As senhas não coincidem");
      return;
    }

    if (registerData.phone && !validation.isValidPhone(registerData.phone)) {
      setError("Telefone inválido");
      return;
    }

    if (registerData.cnpj && !validation.isValidCNPJ(registerData.cnpj)) {
      setError("CNPJ inválido");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email: registerData.email,
        password: registerData.password,
        companyName: registerData.companyName,
        contactName: registerData.contactName,
        phone: registerData.phone,
        cnpj: registerData.cnpj || undefined,
      });

      if (result.success) {
        toast.success("Cadastro realizado com sucesso!");
        navigate("/lojista/dashboard");
      } else {
        setError(result.error || "Erro ao criar conta. Tente novamente.");
      }
    } catch (error) {
      setError("Erro ao criar conta. Tente novamente.");
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
              <Smartphone className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">Don</span>
              <span className="text-2xl font-bold text-primary">Assistec</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Área do Lojista
          </h1>
          <p className="text-muted-foreground">
            Acesse sua conta ou cadastre-se
          </p>
        </div>

        <Card className="border-2">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Entrar na sua conta</CardTitle>
                <CardDescription>
                  Acesse o dashboard e gerencie seus pedidos
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
                    <Label htmlFor="login-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
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
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
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
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Criar conta de lojista</CardTitle>
                <CardDescription>
                  Cadastre-se para ter acesso ao catálogo B2B e fazer pedidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, email: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          value={registerData.password}
                          onChange={(e) =>
                            setRegisterData({ ...registerData, password: e.target.value })
                          }
                          className="pl-10"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Confirmar *</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, confirmPassword: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-company">Nome da Empresa *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-company"
                        placeholder="Minha Loja LTDA"
                        value={registerData.companyName}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, companyName: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome do Contato *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        placeholder="João Silva"
                        value={registerData.contactName}
                        onChange={(e) =>
                          setRegisterData({ ...registerData, contactName: e.target.value })
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Telefone *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-phone"
                          placeholder="(11) 99999-9999"
                          value={registerData.phone}
                          onChange={(e) => {
                            const formatted = validation.formatPhone(e.target.value);
                            setRegisterData({ ...registerData, phone: formatted });
                          }}
                          className="pl-10"
                          required
                          maxLength={15}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-cnpj">CNPJ</Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-cnpj"
                          placeholder="00.000.000/0000-00"
                          value={registerData.cnpj}
                          onChange={(e) => {
                            const formatted = validation.formatCNPJ(e.target.value);
                            setRegisterData({ ...registerData, cnpj: formatted });
                          }}
                          className="pl-10"
                          maxLength={18}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RetailerLogin;
