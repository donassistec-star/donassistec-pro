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
  /** Número sequencial (PED-0001, PED-0002, ...) */
  numero?: number;
  /** ID do pré-pedido de origem */
  pre_pedido_id?: string | null;
  /** Número do pré-pedido de origem (para exibir "Pré-pedido PRE-0001") */
  pre_pedido_numero?: number | null;
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
  async getAll(): Promise<OrderWithItems[]> {
    try {
      const response = await api.get<ApiResponse<OrderWithItems[]>>(`orders?_=${Date.now()}`);

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
      const response = await api.get<ApiResponse<OrderWithItems>>(`orders/${id}${params}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar pedido:", error);
      return null;
    }
  },

  async createFromPrePedido(prePedidoId: string): Promise<OrderWithItems> {
    const res = await api.post<ApiResponse<OrderWithItems>>("orders/from-pre-pedido", {
      pre_pedido_id: prePedidoId,
    });
    if (!res.data?.success || !res.data?.data) {
      throw new Error(res.data?.error || "Erro ao converter pré-pedido em pedido");
    }
    return res.data.data;
  },

  async create(order: Order, items: OrderItem[], couponCode?: string): Promise<OrderWithItems | null> {
    try {
      const response = await api.post<ApiResponse<OrderWithItems>>("orders", { 
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

  async updateStatus(id: string, status: Order["status"]): Promise<OrderWithItems | null> {
    try {
      const response = await api.put<ApiResponse<OrderWithItems>>(`orders/${id}/status`, { status });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao atualizar status do pedido:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar status do pedido");
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`orders/${id}`);

      return response.data.success || false;
    } catch (error: any) {
      console.error("Erro ao deletar pedido:", error);
      throw new Error(error.response?.data?.error || "Erro ao deletar pedido");
    }
  },
};
