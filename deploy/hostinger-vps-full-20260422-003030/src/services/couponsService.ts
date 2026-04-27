import api from "./api";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class CouponsService {
  async getAll(): Promise<Coupon[]> {
    try {
      const response = await api.get<ApiResponse<Coupon[]>>("/coupons");
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar cupons:", error);
      return [];
    }
  }

  async getById(id: string): Promise<Coupon | null> {
    try {
      const response = await api.get<ApiResponse<Coupon>>(`/coupons/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar cupom:", error);
      return null;
    }
  }

  async validate(code: string, orderValue: number): Promise<{ coupon: Coupon; discount: number } | null> {
    try {
      const response = await api.post<ApiResponse<{ coupon: Coupon; discount: number }>>(
        "/coupons/validate",
        { code, orderValue }
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao validar cupom");
    }
  }

  async create(coupon: Omit<Coupon, "created_at" | "updated_at" | "used_count">): Promise<Coupon | null> {
    try {
      const response = await api.post<ApiResponse<Coupon>>("/coupons", coupon);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao criar cupom");
    }
  }

  async update(id: string, coupon: Partial<Coupon>): Promise<Coupon | null> {
    try {
      const response = await api.put<ApiResponse<Coupon>>(`/coupons/${id}`, coupon);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao atualizar cupom");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/coupons/${id}`);
      return response.data.success || false;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao deletar cupom");
    }
  }

  async getUsage(): Promise<any[]> {
    try {
      const response = await api.get<ApiResponse<any[]>>("/coupons/usage");
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar histórico de cupons:", error);
      return [];
    }
  }
}

export const couponsService = new CouponsService();
