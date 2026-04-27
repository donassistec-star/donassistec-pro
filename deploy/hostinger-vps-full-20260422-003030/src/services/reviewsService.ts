import api from "./api";

export interface Review {
  id?: string;
  model_id: string;
  retailer_id: string;
  rating: number;
  comment?: string;
  approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ReviewsService {
  async getByModel(modelId: string, approvedOnly: boolean = true): Promise<{ reviews: Review[]; averageRating: number }> {
    try {
      const response = await api.get<ApiResponse<{ reviews: Review[]; averageRating: number }>>(
        `/reviews/model/${modelId}?approved=${approvedOnly}`
      );
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return { reviews: [], averageRating: 0 };
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
      return { reviews: [], averageRating: 0 };
    }
  }

  async create(review: Omit<Review, "id" | "created_at" | "updated_at">): Promise<Review | null> {
    try {
      const response = await api.post<ApiResponse<Review>>("/reviews", review);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao criar avaliação");
    }
  }

  async update(id: string, review: Partial<Review>): Promise<Review | null> {
    try {
      const response = await api.put<ApiResponse<Review>>(`/reviews/${id}`, review);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao atualizar avaliação");
    }
  }

  async approve(id: string): Promise<Review | null> {
    try {
      const response = await api.put<ApiResponse<Review>>(`/reviews/${id}/approve`, {});
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao aprovar avaliação");
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(`/reviews/${id}`);
      return response.data.success || false;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Erro ao deletar avaliação");
    }
  }
}

export const reviewsService = new ReviewsService();
