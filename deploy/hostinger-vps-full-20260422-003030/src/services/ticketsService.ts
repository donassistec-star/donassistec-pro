import api from "./api";

export interface Ticket {
  id?: string;
  retailer_id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at?: string;
  updated_at?: string;
}

export interface TicketMessage {
  id?: string;
  ticket_id: string;
  sender_id: string;
  sender_type: "retailer" | "admin";
  message: string;
  created_at?: string;
}

export interface TicketWithMessages extends Ticket {
  messages?: TicketMessage[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class TicketsService {
  async getAll(filters?: {
    status?: Ticket["status"];
    priority?: Ticket["priority"];
  }): Promise<Ticket[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);

      const url = `/tickets${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await api.get<ApiResponse<Ticket[]>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
      return [];
    }
  }

  async getById(id: string): Promise<TicketWithMessages | null> {
    try {
      const response = await api.get<ApiResponse<TicketWithMessages>>(`/tickets/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar ticket:", error);
      return null;
    }
  }

  async create(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket | null> {
    try {
      const response = await api.post<ApiResponse<Ticket>>("/tickets", ticket);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao criar ticket");
    }
  }

  async addMessage(ticketId: string, message: string): Promise<TicketMessage | null> {
    try {
      const response = await api.post<ApiResponse<TicketMessage>>(
        `/tickets/${ticketId}/messages`,
        { message }
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao enviar mensagem");
    }
  }

  async update(id: string, ticket: Partial<Ticket>): Promise<Ticket | null> {
    try {
      const response = await api.put<ApiResponse<Ticket>>(`/tickets/${id}`, ticket);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao atualizar ticket");
    }
  }
}

export const ticketsService = new TicketsService();
