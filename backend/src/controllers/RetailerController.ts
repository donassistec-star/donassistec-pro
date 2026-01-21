import { Request, Response } from "express";
import RetailerModel from "../models/RetailerModel";
import { Retailer } from "../types";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class RetailerController {
  // Listar todos os lojistas (apenas admin)
  async getAll(req: Request, res: Response) {
    try {
      const retailers = await RetailerModel.findAll();
      const response: ApiResponse<Retailer[]> = {
        success: true,
        data: retailers,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar lojistas",
      };
      res.status(500).json(response);
    }
  }

  // Buscar lojista por ID (apenas admin) - inclui inativos
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const retailer = await RetailerModel.findByIdIncludingInactive(id);

      if (!retailer) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Lojista não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Retailer> = {
        success: true,
        data: retailer,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar lojista",
      };
      res.status(500).json(response);
    }
  }

  // Atualizar status do lojista (ativar/desativar) - apenas admin
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { active } = req.body;

      if (typeof active !== "boolean") {
        const response: ApiResponse<null> = {
          success: false,
          error: "Status deve ser um valor booleano",
        };
        return res.status(400).json(response);
      }

      const retailer = await RetailerModel.updateStatus(id, active);

      if (!retailer) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Lojista não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Retailer> = {
        success: true,
        data: retailer,
        message: active ? "Lojista ativado com sucesso" : "Lojista desativado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar status do lojista",
      };
      res.status(500).json(response);
    }
  }

  // Deletar lojista (soft delete) - apenas admin
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Não permitir que o admin delete a si mesmo
      if (userId === id) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Você não pode desativar sua própria conta",
        };
        return res.status(400).json(response);
      }

      const success = await RetailerModel.delete(id);

      if (!success) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Lojista não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Lojista desativado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao desativar lojista",
      };
      res.status(500).json(response);
    }
  }
}

export default new RetailerController();
