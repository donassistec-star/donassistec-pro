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
  version: number;
  changed_by?: number | null;
  change_reason?: string | null;
  raw_text: string;
  service_templates: RetailerPriceTableServiceTemplate[];
  parsed_data: {
    title: string;
    effectiveDate?: string | null;
    intro: string[];
    categories: RetailerPriceTableCategory[];
    brands?: RetailerPriceTableBrand[];
  };
  created_at?: string;
  updated_at?: string;
}

export interface RetailerPriceTableHistoryRecord {
  id: number;
  table_id: number;
  version: number;
  slug: string;
  title: string;
  effective_date: string | null;
  raw_text: string;
  parsed_data: {
    title: string;
    effectiveDate?: string | null;
    intro: string[];
    categories: RetailerPriceTableCategory[];
    brands?: RetailerPriceTableBrand[];
  };
  service_templates: RetailerPriceTableServiceTemplate[];
  visible_to_retailers: boolean;
  featured_to_retailers: boolean;
  changed_by?: number | null;
  change_reason?: string | null;
  created_at: string;
}

export interface VersionDiffInfo {
  currentVersion: number;
  previousVersion: number;
  changes: {
    title?: { old: string; new: string };
    visible_to_retailers?: { old: boolean; new: boolean };
    featured_to_retailers?: { old: boolean; new: boolean };
    effective_date?: { old: string | null; new: string | null };
    prices_changed?: number;
  };
}

export interface PriceHistoryRecord {
  id: number;
  table_id: number;
  date: string;
  service_key: string;
  service_name: string;
  old_price: number | null;
  new_price: number;
  price_change_percent: number | null;
  price_change_amount: number | null;
  admin_user_id?: number | null;
  change_source?: string | null;
  notes?: string | null;
  recorded_at: string;
}

export interface PriceTrendPoint {
  date: string;
  price: number;
  change_percent?: number;
}

export interface PriceChangeStats {
  total_changes: number;
  unique_services: number;
  total_increases: number;
  total_decreases: number;
  avg_increase_percent: number;
  avg_decrease_percent: number;
  max_increase_percent: number;
  max_decrease_percent: number;
  total_increase_value: number;
  total_decrease_value: number;
}

export interface DailyChangeReport {
  date: string;
  services_changed: number;
  price_increases: number;
  price_decreases: number;
  avg_change_percent: number;
  total_increase_amount: number;
  total_decrease_amount: number;
}

export interface ServicePriceVariance {
  service_key: string;
  service_name: string;
  change_count: number;
  avg_price: number;
  min_price: number;
  max_price: number;
  price_range: number;
  volatility_percent: number;
  last_changed: string;
  first_recorded: string;
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

  async getHistory(slug: string, limit = 50): Promise<RetailerPriceTableHistoryRecord[]> {
    try {
      const response = await api.get<ApiResponse<RetailerPriceTableHistoryRecord[]>>(
        `/retailer-price-tables/admin/${slug}/history?limit=${limit}`
      );
      return response.data.success ? response.data.data || [] : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar histórico");
    }
  }

  async getHistoryVersion(slug: string, version: number): Promise<RetailerPriceTableHistoryRecord | null> {
    try {
      const response = await api.get<ApiResponse<RetailerPriceTableHistoryRecord>>(
        `/retailer-price-tables/admin/${slug}/history/${version}`
      );
      return response.data.success ? response.data.data || null : null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar versão");
    }
  }

  async rollbackToVersion(slug: string, version: number, reason?: string): Promise<RetailerPriceTableRecord | null> {
    try {
      const response = await api.post<ApiResponse<RetailerPriceTableRecord>>(
        `/retailer-price-tables/admin/${slug}/rollback/${version}`,
        { reason }
      );
      return response.data.success ? response.data.data || null : null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao reverter tabela");
    }
  }

  async compareVersions(slug: string, version1: number, version2: number): Promise<VersionDiffInfo | null> {
    try {
      const response = await api.get<ApiResponse<VersionDiffInfo>>(
        `/retailer-price-tables/admin/${slug}/diff?version1=${version1}&version2=${version2}`
      );
      return response.data.success ? response.data.data || null : null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao comparar versões");
    }
  }

  // Price History & Analytics Methods

  async getPriceHistory(slug: string, limit = 100, offset = 0): Promise<PriceHistoryRecord[]> {
    try {
      const response = await api.get<ApiResponse<PriceHistoryRecord[]>>(
        `/retailer-price-tables/admin/${slug}/price-history?limit=${limit}&offset=${offset}`
      );
      return response.data.success ? response.data.data || [] : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar histórico de preços");
    }
  }

  async getPriceTrend(slug: string, serviceKey: string, days = 90): Promise<PriceTrendPoint[]> {
    try {
      const response = await api.get<ApiResponse<PriceTrendPoint[]>>(
        `/retailer-price-tables/admin/${slug}/price-history/${serviceKey}?days=${days}`
      );
      return response.data.success ? response.data.data || [] : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar tendência de preço");
    }
  }

  async getPriceStats(slug: string, days = 30): Promise<PriceChangeStats | null> {
    try {
      const response = await api.get<ApiResponse<PriceChangeStats>>(
        `/retailer-price-tables/admin/${slug}/analytics/stats?days=${days}`
      );
      return response.data.success ? response.data.data || null : null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar estatísticas");
    }
  }

  async getDailyReport(
    slug: string,
    startDate?: string,
    endDate?: string
  ): Promise<DailyChangeReport[]> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await api.get<ApiResponse<DailyChangeReport[]>>(
        `/retailer-price-tables/admin/${slug}/analytics/daily?${params}`
      );
      return response.data.success ? response.data.data || [] : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar relatório diário");
    }
  }

  async getVolatileServices(slug: string, limit = 20): Promise<ServicePriceVariance[]> {
    try {
      const response = await api.get<ApiResponse<ServicePriceVariance[]>>(
        `/retailer-price-tables/admin/${slug}/analytics/volatile?limit=${limit}`
      );
      return response.data.success ? response.data.data || [] : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar serviços voláteis");
    }
  }

  async getTopIncreases(slug: string, days = 30, limit = 20): Promise<PriceHistoryRecord[]> {
    try {
      const response = await api.get<ApiResponse<PriceHistoryRecord[]>>(
        `/retailer-price-tables/admin/${slug}/analytics/increases?days=${days}&limit=${limit}`
      );
      return response.data.success ? response.data.data || [] : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar aumentos");
    }
  }

  async getTopDecreases(slug: string, days = 30, limit = 20): Promise<PriceHistoryRecord[]> {
    try {
      const response = await api.get<ApiResponse<PriceHistoryRecord[]>>(
        `/retailer-price-tables/admin/${slug}/analytics/decreases?days=${days}&limit=${limit}`
      );
      return response.data.success ? response.data.data || [] : [];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao buscar reduções");
    }
  }
}

export const retailerPriceTablesService = new RetailerPriceTablesService();
