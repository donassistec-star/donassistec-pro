import api from "./api";

export interface Service {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ModelService {
  model_id: string;
  service_id: string;
  price: number;
  available: boolean;
  created_at?: string;
  updated_at?: string;
  service?: Service;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ServicesService {
  async getAll(activeOnly: boolean = false): Promise<Service[]> {
    try {
      const response = await api.get<ApiResponse<Service[]>>(
        `/services${activeOnly ? "?activeOnly=true" : ""}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      return [];
    }
  }

  async getById(id: string): Promise<Service | null> {
    try {
      const response = await api.get<ApiResponse<Service>>(`/services/${id}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar serviço");
    }
  }

  async create(service: Omit<Service, "created_at" | "updated_at">): Promise<Service | null> {
    try {
      const response = await api.post<ApiResponse<Service>>("/services", service);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao criar serviço");
    }
  }

  async update(id: string, service: Partial<Service>): Promise<Service | null> {
    try {
      const response = await api.put<ApiResponse<Service>>(`/services/${id}`, service);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao atualizar serviço");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/services/${id}`);
      return response.data.success || false;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao deletar serviço");
    }
  }

  // Model Services
  async getModelServices(modelId: string): Promise<ModelService[]> {
    try {
      const response = await api.get<ApiResponse<ModelService[]>>(
        `/services/model/${modelId}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Erro ao buscar serviços do modelo:", error);
      return [];
    }
  }

  async setModelService(
    modelId: string,
    serviceId: string,
    price: number,
    available: boolean
  ): Promise<ModelService | null> {
    try {
      const response = await api.post<ApiResponse<ModelService>>(
        `/services/model/${modelId}/${serviceId}`,
        { price, available }
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao definir serviço do modelo");
    }
  }

  async removeModelService(modelId: string, serviceId: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(
        `/services/model/${modelId}/${serviceId}`
      );
      return response.data.success || false;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao remover serviço do modelo");
    }
  }
}

export const servicesService = new ServicesService();
