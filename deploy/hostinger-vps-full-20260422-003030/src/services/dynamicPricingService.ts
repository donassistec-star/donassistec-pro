import api from "./api";

export interface DynamicPricing {
  id?: string;
  model_id: string;
  min_quantity: number;
  max_quantity?: number;
  price: number;
  discount_percentage?: number;
  valid_from?: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class DynamicPricingService {
  async getByModel(modelId: string): Promise<DynamicPricing[]> {
    try {
      const response = await api.get<ApiResponse<DynamicPricing[]>>(
        `/dynamic-pricing/model/${modelId}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar preços dinâmicos:", error);
      return [];
    }
  }

  async getPrice(modelId: string, quantity: number): Promise<DynamicPricing | null> {
    try {
      const response = await api.get<ApiResponse<DynamicPricing>>(
        `/dynamic-pricing/model/${modelId}/price?quantity=${quantity}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar preço:", error);
      return null;
    }
  }

  async create(pricing: Omit<DynamicPricing, "id" | "created_at" | "updated_at">): Promise<DynamicPricing | null> {
    try {
      const response = await api.post<ApiResponse<DynamicPricing>>("/dynamic-pricing", pricing);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao criar preço dinâmico");
    }
  }

  async update(id: string, pricing: Partial<DynamicPricing>): Promise<DynamicPricing | null> {
    try {
      const response = await api.put<ApiResponse<DynamicPricing>>(`/dynamic-pricing/${id}`, pricing);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao atualizar preço dinâmico");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/dynamic-pricing/${id}`);
      return response.data.success || false;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao deletar preço dinâmico");
    }
  }
}

export const dynamicPricingService = new DynamicPricingService();
