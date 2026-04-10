import api from "./api";
import { PhoneModel, Brand } from "@/data/models";
import { normalizeMediaUrl } from "@/utils/mediaUrl";

export interface ApiPhoneModel {
  id: string;
  brand_id: string;
  name: string;
  image_url?: string;
  video_url?: string;
  availability: "in_stock" | "order" | "out_of_stock";
  premium: boolean;
  popular: boolean;
  brand?: {
    id: string;
    name: string;
    logo_url?: string;
    icon_name?: string;
  };
  services?: {
    model_id: string;
    reconstruction: boolean;
    glass_replacement: boolean;
    parts_available: boolean;
  };
  videos?: {
    id: number;
    model_id: string;
    title: string;
    url: string;
    thumbnail_url?: string;
    duration?: string;
    video_order: number;
  }[];
  /** Serviços dinâmicos (model_services com service_id). Se existir, prevalece sobre services. */
  modelServices?: {
    service_id: string;
    price: number;
    available: boolean;
    service?: { id: string; name: string; description?: string; active?: boolean };
  }[];
}

export interface ApiBrand {
  id: string;
  name: string;
  logo_url?: string;
  icon_name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Converter modelo da API para formato do frontend
const convertApiModelToFrontend = (apiModel: ApiPhoneModel): PhoneModel => {
  const ms = (apiModel as any).modelServices;
  const servicesFromModelServices =
    ms && ms.length > 0
      ? {
          reconstruction: ms.some((m: any) => m.service_id === "service_reconstruction" && m.available),
          glassReplacement: ms.some((m: any) => m.service_id === "service_glass" && m.available),
          partsAvailable: ms.some((m: any) => m.service_id === "service_parts" && m.available),
        }
      : null;

  const result: PhoneModel & { modelServices?: any[] } = {
    id: apiModel.id,
    brand: apiModel.brand_id,
    name: apiModel.name,
    image: normalizeMediaUrl(apiModel.image_url),
    videoUrl: apiModel.video_url,
    videos: apiModel.videos?.map((v) => ({
      id: v.id.toString(),
      title: v.title,
      url: v.url,
      thumbnail: normalizeMediaUrl(v.thumbnail_url),
      duration: v.duration,
    })),
    services: servicesFromModelServices ?? {
      reconstruction: apiModel.services?.reconstruction || false,
      glassReplacement: apiModel.services?.glass_replacement || false,
      partsAvailable: apiModel.services?.parts_available || false,
    },
    availability: apiModel.availability,
    premium: apiModel.premium,
    popular: apiModel.popular,
  };
  if (ms && ms.length > 0) result.modelServices = ms;
  return result;
};

// Converter marca da API para formato do frontend
const convertApiBrandToFrontend = (apiBrand: ApiBrand): Brand => {
  return {
    id: apiBrand.id,
    name: apiBrand.name,
    logo: normalizeMediaUrl(apiBrand.logo_url),
    icon: apiBrand.icon_name,
  };
};

// Converter modelo do frontend para formato da API
const convertFrontendModelToApi = (model: Partial<PhoneModel>): any => {
  return {
    id: model.id,
    brand_id: model.brand,
    name: model.name,
    image_url: model.image || null,
    video_url: model.videoUrl || null,
    availability: model.availability || "in_stock",
    premium: model.premium || false,
    popular: model.popular || false,
  };
};

export const modelsService = {
  // Buscar todos os modelos
  async getAll(filters?: {
    brand?: string[];
    availability?: string[];
    premium?: boolean;
    popular?: boolean;
    service?: string[];
    search?: string;
  }): Promise<PhoneModel[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) {
        params.append("search", filters.search);
      }
      if (filters?.brand) {
        filters.brand.forEach((b) => params.append("brand", b));
      }
      if (filters?.availability) {
        filters.availability.forEach((a) => params.append("availability", a));
      }
      if (filters?.premium !== undefined) {
        params.append("premium", filters.premium.toString());
      }
      if (filters?.popular !== undefined) {
        params.append("popular", filters.popular.toString());
      }
      if (filters?.service) {
        filters.service.forEach((s) => params.append("service", s));
      }

      const response = await api.get<ApiResponse<ApiPhoneModel[]>>(
        `/models?${params.toString()}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.map(convertApiModelToFrontend);
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar modelos:", error);
      return [];
    }
  },

  // Buscar modelo por ID
  async getById(id: string): Promise<PhoneModel | null> {
    try {
      const response = await api.get<ApiResponse<ApiPhoneModel>>(`/models/${id}`);

      if (response.data.success && response.data.data) {
        return convertApiModelToFrontend(response.data.data);
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar modelo:", error);
      return null;
    }
  },

  // Buscar modelos por marca
  async getByBrand(brandId: string): Promise<PhoneModel[]> {
    try {
      const response = await api.get<ApiResponse<ApiPhoneModel[]>>(
        `/models/brand/${brandId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.map(convertApiModelToFrontend);
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar modelos da marca:", error);
      return [];
    }
  },

  // Criar modelo
  async create(model: Partial<PhoneModel>): Promise<PhoneModel | null> {
    try {
      const apiModel = convertFrontendModelToApi(model);
      const response = await api.post<ApiResponse<ApiPhoneModel>>("/models", apiModel);

      if (response.data.success && response.data.data) {
        return convertApiModelToFrontend(response.data.data);
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao criar modelo:", error);
      throw new Error(error.response?.data?.error || "Erro ao criar modelo");
    }
  },

  // Atualizar modelo
  async update(id: string, model: Partial<PhoneModel>): Promise<PhoneModel | null> {
    try {
      const apiModel = convertFrontendModelToApi(model);
      const response = await api.put<ApiResponse<ApiPhoneModel>>(`/models/${id}`, apiModel);

      if (response.data.success && response.data.data) {
        return convertApiModelToFrontend(response.data.data);
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao atualizar modelo:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar modelo");
    }
  },

  // Deletar modelo
  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/models/${id}`);

      return response.data.success || false;
    } catch (error: any) {
      console.error("Erro ao deletar modelo:", error);
      throw new Error(error.response?.data?.error || "Erro ao deletar modelo");
    }
  },
};

// Converter marca do frontend para formato da API
const convertFrontendBrandToApi = (brand: Partial<Brand>): any => {
  return {
    id: brand.id,
    name: brand.name,
    logo_url: brand.logo || null,
    icon_name: brand.icon || null,
  };
};

export const brandsService = {
  // Buscar todas as marcas
  async getAll(): Promise<Brand[]> {
    try {
      const response = await api.get<ApiResponse<ApiBrand[]>>("/brands");

      if (response.data.success && response.data.data) {
        return response.data.data.map(convertApiBrandToFrontend);
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar marcas:", error);
      return [];
    }
  },

  // Buscar marca por ID
  async getById(id: string): Promise<Brand | null> {
    try {
      const response = await api.get<ApiResponse<ApiBrand>>(`/brands/${id}`);

      if (response.data.success && response.data.data) {
        return convertApiBrandToFrontend(response.data.data);
      }

      return null;
    } catch (error) {
      console.error("Erro ao buscar marca:", error);
      return null;
    }
  },

  // Criar marca
  async create(brand: Partial<Brand>): Promise<Brand | null> {
    try {
      const apiBrand = convertFrontendBrandToApi(brand);
      const response = await api.post<ApiResponse<ApiBrand>>("/brands", apiBrand);

      if (response.data.success && response.data.data) {
        return convertApiBrandToFrontend(response.data.data);
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao criar marca:", error);
      throw new Error(error.response?.data?.error || "Erro ao criar marca");
    }
  },

  // Atualizar marca
  async update(id: string, brand: Partial<Brand>): Promise<Brand | null> {
    try {
      const apiBrand = convertFrontendBrandToApi(brand);
      const response = await api.put<ApiResponse<ApiBrand>>(`/brands/${id}`, apiBrand);

      if (response.data.success && response.data.data) {
        return convertApiBrandToFrontend(response.data.data);
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao atualizar marca:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar marca");
    }
  },

  // Deletar marca
  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/brands/${id}`);

      return response.data.success || false;
    } catch (error: any) {
      console.error("Erro ao deletar marca:", error);
      throw new Error(error.response?.data?.error || "Erro ao deletar marca");
    }
  },
};
