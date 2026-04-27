import { Request, Response } from "express";
import ProductViewModel from "../models/ProductViewModel";
import { ApiResponse } from "../types";
import { AuthRequest } from "../middleware/auth";

class ProductViewController {
  async recordView(req: AuthRequest, res: Response) {
    try {
      const { modelId } = req.params;
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.get("user-agent") || undefined;
      const sessionId = req.headers["x-session-id"] as string | undefined;

      await ProductViewModel.recordView(
        modelId,
        req.user?.id,
        req.user?.email,
        ipAddress,
        userAgent,
        sessionId
      );

      const response: ApiResponse<null> = {
        success: true,
        message: "Visualização registrada com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao registrar visualização",
      };
      res.status(500).json(response);
    }
  }

  async getModelStats(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const stats = await ProductViewModel.getModelStats(modelId);

      if (!stats) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Estatísticas não encontradas",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<any> = {
        success: true,
        data: stats,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar estatísticas",
      };
      res.status(500).json(response);
    }
  }

  async getMostViewed(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const stats = await ProductViewModel.getMostViewed(limit);

      const response: ApiResponse<any[]> = {
        success: true,
        data: stats,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar mais visualizados",
      };
      res.status(500).json(response);
    }
  }

  async getUserHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Usuário não autenticado",
        };
        return res.status(401).json(response);
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const history = await ProductViewModel.getUserViewHistory(req.user.id, limit);

      const response: ApiResponse<any[]> = {
        success: true,
        data: history,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar histórico",
      };
      res.status(500).json(response);
    }
  }
}

export default new ProductViewController();
