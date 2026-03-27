import api from "./api";

export interface User {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone?: string;
  cnpj?: string;
  role: "retailer" | "admin";
}

export interface RegisterData {
  email: string;
  password: string;
  company_name: string;
  contact_name: string;
  phone?: string;
  cnpj?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
  message?: string;
}

export interface BootstrapAvailableResponse {
  success: boolean;
  available?: boolean;
  tableExists?: boolean;
  error?: string;
}

export const authService = {
  async bootstrapAvailable(): Promise<BootstrapAvailableResponse> {
    try {
      const response = await api.get<BootstrapAvailableResponse>("/auth/bootstrap-available");
      return response.data;
    } catch (error: any) {
      return { success: false, available: false, error: error.response?.data?.error || "Erro ao verificar" };
    }
  },

  async bootstrapAdmin(data: { email: string; password: string; name: string }): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/bootstrap-admin", data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao criar administrador",
      };
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao criar conta",
      };
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao fazer login",
      };
    }
  },

  async me(token: string): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao buscar dados do usuário",
      };
    }
  },

  async updateProfile(data: {
    company_name?: string;
    contact_name?: string;
    phone?: string;
    cnpj?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.put<AuthResponse>("/auth/profile", data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao atualizar perfil",
      };
    }
  },

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.put<AuthResponse>("/auth/password", data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Erro ao alterar senha",
      };
    }
  },
};
