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
  numero: number;
  session_id: string | null;
  items_json: PrePedidoItemRequest[];
  created_at: string;
  contact_name?: string | null;
  contact_company?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  need_by?: string | null;
  is_urgent?: number;
  retailer_id?: string | null;
  /** ID do pedido quando já convertido */
  order_id?: string | null;
  order_numero?: number | null;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const prePedidosService = {
  async getById(id: string): Promise<PrePedidoRecord | null> {
    const res = await api.get<ApiResponse<PrePedidoRecord>>(`pre-pedidos/${id}`);
    return res.data?.success && res.data?.data ? res.data.data : null;
  },

  async getAll(): Promise<PrePedidoRecord[]> {
    const res = await api.get<ApiResponse<PrePedidoRecord[]>>(`pre-pedidos?_=${Date.now()}`);
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
    need_by?: string;
    is_urgent?: boolean;
    retailer_id?: string;
  }): Promise<PrePedidoRecord> {
    const res = await api.post<ApiResponse<PrePedidoRecord>>("pre-pedidos", data);
    if (!res.data?.success || !res.data?.data) throw new Error(res.data?.error || "Erro ao registrar pré-pedido");
    return res.data.data;
  },
};
