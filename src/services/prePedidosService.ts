import api from "./api";

export interface PrePedidoItemRequest {
  model_id: string;
  model_name: string;
  brand_name?: string;
  quantity: number;
  selected_services?: { service_id: string; name: string; price: number }[];
}

export interface PrePedidoRecord {
  id: string;
  session_id: string | null;
  items_json: PrePedidoItemRequest[];
  created_at: string;
  contact_name?: string | null;
  contact_company?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  is_urgent?: number;
  retailer_id?: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const prePedidosService = {
  async getAll(): Promise<PrePedidoRecord[]> {
    const res = await api.get<ApiResponse<PrePedidoRecord[]>>("/pre-pedidos");
    return res.data?.data ?? [];
  },

  async create(data: {
    items: PrePedidoItemRequest[];
    session_id?: string;
    contact_name?: string;
    contact_company?: string;
    contact_phone?: string;
    contact_email?: string;
    notes?: string;
    is_urgent?: boolean;
    retailer_id?: string;
  }): Promise<void> {
    await api.post("/pre-pedidos", data);
  },
};
