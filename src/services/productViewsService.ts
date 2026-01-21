import api from "./api";

export interface ProductViewStats {
  model_id: string;
  total_views: number;
  unique_views: number;
  last_viewed_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ProductViewsService {
  async recordView(modelId: string, sessionId?: string): Promise<boolean> {
    try {
      const headers: Record<string, string> = {};
      if (sessionId) {
        headers["x-session-id"] = sessionId;
      }
      
      const response = await api.post<ApiResponse<null>>(
        `/product-views/${modelId}`,
        {},
        { headers }
      );
      return response.data.success || false;
    } catch (error) {
      // Silenciar erros de visualização - não é crítico
      console.debug("Erro ao registrar visualização:", error);
      return false;
    }
  }

  async getModelStats(modelId: string): Promise<ProductViewStats | null> {
    try {
      const response = await api.get<ApiResponse<ProductViewStats>>(
        `/product-views/stats/${modelId}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return null;
    }
  }

  async getMostViewed(limit: number = 10): Promise<ProductViewStats[]> {
    try {
      const response = await api.get<ApiResponse<ProductViewStats[]>>(
        `/product-views/most-viewed?limit=${limit}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar mais visualizados:", error);
      return [];
    }
  }

  async getUserHistory(limit: number = 20): Promise<string[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>(
        `/product-views/history?limit=${limit}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data.map((item) => item.model_id);
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return [];
    }
  }
}

export const productViewsService = new ProductViewsService();
