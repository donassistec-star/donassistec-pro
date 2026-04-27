import api from "./api";
import { HomeContent } from "@/data/homeContent";
import { ApiResponse } from "./modelsService";
import { normalizeMediaUrl } from "@/utils/mediaUrl";

const normalizeHomeContent = (content: HomeContent): HomeContent => ({
  ...content,
  heroImage: normalizeMediaUrl(content.heroImage),
  servicesImage: normalizeMediaUrl(content.servicesImage),
});

export const homeContentService = {
  // Buscar conteúdo da home
  async get(): Promise<HomeContent | null> {
    try {
      const response = await api.get<ApiResponse<HomeContent>>("/home-content");
      
      if (response.data.success && response.data.data) {
        return normalizeHomeContent(response.data.data);
      }
      
      return null;
    } catch (error: any) {
      // Silenciar erros de rede (backend pode não estar rodando)
      // O contexto já tem fallback para dados padrão
      if (error.code === "ERR_NETWORK" || error.code === "ERR_CONNECTION_REFUSED") {
        // Não logar erros de conexão - é esperado se o backend não estiver rodando
        return null;
      }
      console.error("Erro ao buscar conteúdo da home:", error);
      return null;
    }
  },

  // Atualizar conteúdo da home
  async update(content: HomeContent): Promise<HomeContent | null> {
    try {
      const response = await api.put<ApiResponse<HomeContent>>("/home-content", content);
      
      if (response.data.success && response.data.data) {
        return normalizeHomeContent(response.data.data);
      }
      
      return null;
    } catch (error) {
      console.error("Erro ao atualizar conteúdo da home:", error);
      return null;
    }
  },
};
