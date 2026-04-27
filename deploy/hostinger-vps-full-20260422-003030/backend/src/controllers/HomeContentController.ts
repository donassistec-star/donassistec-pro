import { Request, Response } from "express";
import HomeContentModel from "../models/HomeContentModel";
import { ApiResponse, HomeContent } from "../types";

class HomeContentController {
  async get(req: Request, res: Response) {
    try {
      const content = await HomeContentModel.get();
      
      if (!content) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Conteúdo não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<HomeContent> = {
        success: true,
        data: content,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar conteúdo",
      };
      res.status(500).json(response);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const content = req.body as HomeContent;
      
      // Validação básica
      if (!content.heroTitle || !content.features || !content.stats || !content.steps) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Dados inválidos. Verifique se todos os campos obrigatórios foram enviados.",
        };
        return res.status(400).json(response);
      }

      const updatedContent = await HomeContentModel.update(content);
      
      const response: ApiResponse<HomeContent> = {
        success: true,
        data: updatedContent,
        message: "Conteúdo atualizado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar conteúdo",
      };
      res.status(500).json(response);
    }
  }
}

export default new HomeContentController();
