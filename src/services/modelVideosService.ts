import api from "./api";
import { ApiResponse, ApiPhoneModel } from "./modelsService";

export interface ApiModelVideo {
  id: number;
  model_id: string;
  title: string;
  url: string;
  thumbnail_url?: string;
  duration?: string;
  video_order: number;
}

export interface ModelVideoFrontend {
  id?: number;
  modelId: string;
  title: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  order?: number;
}

const convertApiVideoToFrontend = (video: ApiModelVideo): ModelVideoFrontend => ({
  id: video.id,
  modelId: video.model_id,
  title: video.title,
  url: video.url,
  thumbnail: video.thumbnail_url,
  duration: video.duration,
  order: video.video_order,
});

const convertFrontendVideoToApi = (video: ModelVideoFrontend): Partial<ApiModelVideo> => ({
  id: video.id ?? 0,
  model_id: video.modelId,
  title: video.title,
  url: video.url,
  thumbnail_url: video.thumbnail,
  duration: video.duration,
  video_order: video.order ?? 0,
});

export const modelVideosService = {
  async getAll(modelId: string): Promise<ModelVideoFrontend[]> {
    try {
      const response = await api.get<ApiResponse<ApiModelVideo[]>>(
        `/models/${modelId}/videos`
      );

      if (response.data.success && response.data.data) {
        return response.data.data.map(convertApiVideoToFrontend);
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar vídeos do modelo:", error);
      return [];
    }
  },

  async create(modelId: string, video: Omit<ModelVideoFrontend, "id" | "modelId">): Promise<ModelVideoFrontend | null> {
    try {
      const apiVideo = convertFrontendVideoToApi({
        ...video,
        modelId,
      });

      const response = await api.post<ApiResponse<ApiModelVideo>>(
        `/models/${modelId}/videos`,
        apiVideo
      );

      if (response.data.success && response.data.data) {
        return convertApiVideoToFrontend(response.data.data);
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao criar vídeo:", error);
      throw new Error(error.response?.data?.error || "Erro ao criar vídeo");
    }
  },

  async update(modelId: string, videoId: number, video: Partial<ModelVideoFrontend>): Promise<ModelVideoFrontend | null> {
    try {
      const apiVideo = convertFrontendVideoToApi({
        ...video,
        modelId,
        id: videoId,
      } as ModelVideoFrontend);

      const response = await api.put<ApiResponse<ApiModelVideo>>(
        `/models/${modelId}/videos/${videoId}`,
        apiVideo
      );

      if (response.data.success && response.data.data) {
        return convertApiVideoToFrontend(response.data.data);
      }

      return null;
    } catch (error: any) {
      console.error("Erro ao atualizar vídeo:", error);
      throw new Error(error.response?.data?.error || "Erro ao atualizar vídeo");
    }
  },

  async delete(modelId: string, videoId: number): Promise<boolean> {
    try {
      const response = await api.delete<ApiResponse<null>>(
        `/models/${modelId}/videos/${videoId}`
      );

      return response.data.success || false;
    } catch (error: any) {
      console.error("Erro ao deletar vídeo:", error);
      throw new Error(error.response?.data?.error || "Erro ao deletar vídeo");
    }
  },
};

