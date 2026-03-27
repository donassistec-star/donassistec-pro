import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService } from "@/services/authService";

interface User {
  id: string;
  email: string;
  companyName: string;
  contactName: string;
  phone: string;
  cnpj?: string;
  role: string;
  /** admin_team = equipe; retailer = lojista */
  source?: "admin_team" | "retailer";
  /** Módulos visíveis no admin (apenas para source=admin_team) */
  modules?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithBootstrap: (data: { token: string; user: { id: string; email: string; company_name?: string; contact_name: string; phone?: string; cnpj?: string; role: string; source?: string; modules?: string[] } }) => void;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  companyName: string;
  contactName: string;
  phone: string;
  cnpj?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "donassistec_auth";
const TOKEN_STORAGE_KEY = "donassistec_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregar usuário e token do localStorage
    const loadUser = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verificar se o token ainda é válido
          const meResponse = await authService.me(storedToken);
          if (meResponse.success && meResponse.user) {
            // Atualizar dados do usuário
            const updatedUser: User = {
              id: meResponse.user.id,
              email: meResponse.user.email,
              companyName: meResponse.user.company_name ?? "",
              contactName: meResponse.user.contact_name,
              phone: meResponse.user.phone || "",
              cnpj: meResponse.user.cnpj,
              role: meResponse.user.role,
              source: meResponse.user.source,
              modules: meResponse.user.modules,
            };
            setUser(updatedUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
          } else {
            // Token inválido, limpar
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setUser(null);
          }
        } catch {
          // Ignore invalid data
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      
      if (response.success && response.token && response.user) {
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          companyName: response.user.company_name ?? "",
          contactName: response.user.contact_name,
          phone: response.user.phone || "",
          cnpj: response.user.cnpj,
          role: response.user.role,
          source: response.user.source,
          modules: response.user.modules,
        };

        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const loginWithBootstrap = (data: { token: string; user: { id: string; email: string; company_name?: string; contact_name: string; phone?: string; cnpj?: string; role: string; source?: string; modules?: string[] } }) => {
    const userData: User = {
      id: data.user.id,
      email: data.user.email,
      companyName: data.user.company_name ?? "",
      contactName: data.user.contact_name,
      phone: data.user.phone || "",
      cnpj: data.user.cnpj,
      role: data.user.role,
      source: (data.user.source as "admin_team" | "retailer") || "admin_team",
      modules: data.user.modules,
    };
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await authService.register({
        email: data.email,
        password: data.password,
        company_name: data.companyName,
        contact_name: data.contactName,
        phone: data.phone,
        cnpj: data.cnpj,
      });

      if (response.success && response.token && response.user) {
        const userData: User = {
          id: response.user.id,
          email: response.user.email,
          companyName: response.user.company_name ?? "",
          contactName: response.user.contact_name,
          phone: response.user.phone || "",
          cnpj: response.user.cnpj,
          role: response.user.role,
          source: response.user.source ?? "retailer",
          modules: response.user.modules,
        };

        setUser(userData);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
        localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithBootstrap,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
