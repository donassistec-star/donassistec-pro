import api from "./api";

export interface RetailerPriceTableItem {
  name: string;
  priceText: string;
  priceValue: number | null;
}

export interface RetailerPriceTableCategory {
  name: string;
  items: RetailerPriceTableItem[];
}

export interface RetailerPriceTableDeviceService {
  name: string;
  priceText: string;
  priceValue: number | null;
}

export interface RetailerPriceTableDevice {
  name: string;
  services: RetailerPriceTableDeviceService[];
}

export interface RetailerPriceTableBrand {
  name: string;
  devices: RetailerPriceTableDevice[];
}

export interface RetailerPriceTableServiceTemplate {
  id: string;
  name: string;
  serviceNames: string[];
}

export interface RetailerPriceTableRecord {
  id: number;
  slug: string;
  title: string;
  effective_date: string | null;
  visible_to_retailers: boolean;
  featured_to_retailers: boolean;
  sort_order: number;
  raw_text: string;
  service_templates: RetailerPriceTableServiceTemplate[];
  parsed_data: {
    title: string;
    effectiveDate?: string | null;
    intro: string[];
    categories: RetailerPriceTableCategory[];
    brands?: RetailerPriceTableBrand[];
  };
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class RetailerPriceTablesService {
  async listAdmin(): Promise<RetailerPriceTableRecord[]> {
    try {
      const response = await api.get<ApiResponse<RetailerPriceTableRecord[]>>("/retailer-price-tables/admin");
      return response.data.success ? response.data.data || [] : [];
    } catch {
      return [];
    }
  }

  async listRetailer(): Promise<RetailerPriceTableRecord[]> {
    try {
      const response = await api.get<ApiResponse<RetailerPriceTableRecord[]>>("/retailer-price-tables/retailer");
      return response.data.success ? response.data.data || [] : [];
    } catch {
      return [];
    }
  }

  async getAdmin(slug: string): Promise<RetailerPriceTableRecord | null> {
    try {
      const response = await api.get<ApiResponse<RetailerPriceTableRecord>>(`/retailer-price-tables/admin/${slug}`);
      return response.data.success ? response.data.data || null : null;
    } catch {
      return null;
    }
  }

  async save(slug: string, payload: {
    title?: string;
    effectiveDate?: string | null;
    visibleToRetailers: boolean;
    featuredToRetailers?: boolean;
    rawText: string;
    serviceTemplates?: RetailerPriceTableServiceTemplate[];
  }): Promise<RetailerPriceTableRecord | null> {
    const response = await api.put<ApiResponse<RetailerPriceTableRecord>>(
      `/retailer-price-tables/admin/${slug}`,
      payload
    );
    return response.data.success ? response.data.data || null : null;
  }

  async reorderAdmin(slugs: string[]): Promise<RetailerPriceTableRecord[]> {
    const response = await api.post<ApiResponse<RetailerPriceTableRecord[]>>(
      "/retailer-price-tables/admin/reorder",
      { slugs }
    );
    return response.data.success ? response.data.data || [] : [];
  }

  async getRetailer(slug: string): Promise<RetailerPriceTableRecord | null> {
    try {
      const response = await api.get<ApiResponse<RetailerPriceTableRecord>>(`/retailer-price-tables/retailer/${slug}`);
      return response.data.success ? response.data.data || null : null;
    } catch {
      return null;
    }
  }

  async deleteAdmin(slug: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/retailer-price-tables/admin/${slug}`);
      return response.data.success || false;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao remover tabela");
    }
  }
}

export const retailerPriceTablesService = new RetailerPriceTablesService();
