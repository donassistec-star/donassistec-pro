import api from "./api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UploadResponse {
  filename: string;
  originalname: string;
  url: string;
  size: number;
}

export const uploadService = {
  async uploadImage(file: File): Promise<UploadResponse | null> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post<ApiResponse<UploadResponse>>(
        "/upload/image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao fazer upload:", error);
      throw new Error(error.response?.data?.error || "Erro ao fazer upload da imagem");
    }
  },
};
