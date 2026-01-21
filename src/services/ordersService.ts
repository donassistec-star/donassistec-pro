import api from "./api";

export interface Order {
  id: string;
  retailer_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  total: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderItem {
  id?: number;
  order_id: string;
  model_id: string;
  model_name: string;
  brand_name?: string;
  quantity: number;
  reconstruction: boolean;
  glass_replacement: boolean;
  parts_available: boolean;
  notes?: string;
  created_at?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const ordersService = {
  async getAll(retailerId?: string): Promise<OrderWithItems[]> {
    try {
      const params = retailerId ? `?retailerId=${encodeURIComponent(retailerId)}` : "";
      const response = await api.get<ApiResponse<OrderWithItems[]>>(`/orders${params}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      return [];
    }
  },

  async getById(id: string, retailerId?: string): Promise<OrderWithItems | null> {
    try {
      const params = retailerId ? `?retailerId=${encodeURIComponent(retailerId)}` : "";
      const response = await api.get<ApiResponse<OrderWithItems>>(`/orders/${id}${params}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      return null;
    }
  },

  async create(order: Order, items: OrderItem[], couponCode?: string): Promise<OrderWithItems | null> {
    try {
      const response = await api.post<ApiResponse<OrderWithItems>>("/orders", { 
        order, 
        items,
        couponCode 
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao criar pedido:", error);
      throw new Error(error.response?.data?.error || "Erro ao criar pedido");
    }
  },

  async updateStatus(
    id: string,
    status: Order["status"],
    retailerId?: string
  ): Promise<OrderWithItems | null> {
    try {
      const params = retailerId ? `?retailerId=${encodeURIComponent(retailerId)}` : "";
      const response = await api.put<ApiResponse<OrderWithItems>>(
        `/orders/${id}/status${params}`,
        { status }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao atualizar status do pedido:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar status do pedido");
    }
  },

  async delete(id: string, retailerId?: string): Promise<boolean> {
    try {
      const params = retailerId ? `?retailerId=${encodeURIComponent(retailerId)}` : "";
      const response = await api.delete<ApiResponse<null>>(`/orders/${id}${params}`);

      return response.data.success || false;
    } catch (error: any) {
      console.error("Erro ao deletar pedido:", error);
      throw new Error(error.response?.data?.error || "Erro ao deletar pedido");
    }
  },
};
