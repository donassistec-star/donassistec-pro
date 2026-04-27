import api from "./api";

export interface Retailer {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone?: string;
  cnpj?: string;
  role: "retailer" | "admin";
  active: boolean;
  approval_status: "pending" | "approved" | "rejected";
  approved_at?: string | null;
  approved_by?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  whatsapp_url?: string;
}

export interface RetailerApprovalResult {
  retailer: Retailer;
  message?: string;
  whatsapp_url?: string;
}

export const retailersService = {
  async getAll(): Promise<Retailer[]> {
    try {
      const response = await api.get<ApiResponse<Retailer[]>>("/retailers");

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar lojistas:", error);
      return [];
    }
  },

  async getById(id: string): Promise<Retailer | null> {
    try {
      const response = await api.get<ApiResponse<Retailer>>(`/retailers/${id}`);

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar lojista:", error);
      return null;
    }
  },

  async updateStatus(id: string, active: boolean): Promise<Retailer | null> {
    try {
      const response = await api.put<ApiResponse<Retailer>>(
        `/retailers/${id}/status`,
        { active }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao atualizar status do lojista:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar status do lojista");
    }
  },

  async updateApprovalStatus(
    id: string,
    approvalStatus: "pending" | "approved" | "rejected"
  ): Promise<RetailerApprovalResult | null> {
    try {
      const response = await api.put<ApiResponse<Retailer>>(
        `/retailers/${id}/approval`,
        { approval_status: approvalStatus }
      );

      if (response.data.success && response.data.data) {
        return {
          retailer: response.data.data,
          message: response.data.message,
          whatsapp_url: response.data.whatsapp_url,
        };
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao atualizar aprovação do lojista:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar aprovação do lojista");
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/retailers/${id}`);

      return response.data.success || false;
    } catch (error: any) {
      console.error("Erro ao deletar lojista:", error);
      throw new Error(error.response?.data?.error || "Erro ao deletar lojista");
    }
  },

  async deletePermanent(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/retailers/${id}/permanent`);

      return response.data.success || false;
    } catch (error: any) {
      console.error("Erro ao excluir lojista permanentemente:", error);
      throw new Error(
        error.response?.data?.error || "Erro ao excluir lojista permanentemente"
      );
    }
  },
};
