import api from "./api";

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class AuditLogsService {
  async getAll(): Promise<AuditLog[]> {
    try {
      const response = await api.get<ApiResponse<AuditLog[]>>("/audit-logs");
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar logs de auditoria:", error);
      return [];
    }
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      CREATE_MODEL: "Criar Modelo",
      UPDATE_MODEL: "Atualizar Modelo",
      DELETE_MODEL: "Deletar Modelo",
      CREATE_BRAND: "Criar Marca",
      UPDATE_BRAND: "Atualizar Marca",
      DELETE_BRAND: "Deletar Marca",
      UPDATE_HOME_CONTENT: "Atualizar Conteúdo da Home",
      UPDATE_ORDER_STATUS: "Atualizar Status do Pedido",
      LOGIN_SUCCESS: "Login Realizado",
      LOGIN_FAILED: "Tentativa de Login Falhou",
      BRAND_ACTION: "Ação em Marca",
      MODEL_ACTION: "Ação em Modelo",
      HOME_CONTENT_ACTION: "Ação em Conteúdo",
      RETAILER_ACTION: "Ação em Lojista",
      SETTINGS_ACTION: "Ação em Configurações",
    };
    return labels[action] || action;
  }
}

export const auditLogsService = new AuditLogsService();
