import { Response } from "express";
import ReviewModel from "../models/ReviewModel";
import { AuthRequest } from "../middleware/auth";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ReviewController {
  async getByModel(req: AuthRequest, res: Response) {
    try {
      const { modelId } = req.params;
      const { approved = "true" } = req.query;
      const reviews = await ReviewModel.findByModel(modelId, approved === "true");
      const avgRating = await ReviewModel.getAverageRating(modelId);

      const response: ApiResponse<any> = { 
        success: true, 
        data: { reviews, averageRating: avgRating } 
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao buscar avaliações" };
      res.status(500).json(response);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const review = await ReviewModel.create({
        ...req.body,
        retailer_id: req.user?.id || req.body.retailer_id,
      });
      const response: ApiResponse<any> = { success: true, data: review, message: "Avaliação criada com sucesso" };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao criar avaliação" };
      res.status(500).json(response);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Ownership check: fetch review first
      const existing = await ReviewModel.findById(id);
      if (!existing) {
        const response: ApiResponse<null> = { success: false, error: "Avaliação não encontrada" };
        return res.status(404).json(response);
      }

      // Only the review owner or an admin can update
      if (existing.retailer_id !== req.user!.id && req.user!.role !== 'admin') {
        const response: ApiResponse<null> = { success: false, error: "Acesso negado" };
        return res.status(403).json(response);
      }

      const updated = await ReviewModel.update(id, req.body);

      const response: ApiResponse<any> = { success: true, data: updated, message: "Avaliação atualizada com sucesso" };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao atualizar avaliação" };
      res.status(500).json(response);
    }
  }

  async approve(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await ReviewModel.update(id, { approved: true });

      if (!updated) {
        const response: ApiResponse<null> = { success: false, error: "Avaliação não encontrada" };
        return res.status(404).json(response);
      }

      const response: ApiResponse<any> = { success: true, data: updated, message: "Avaliação aprovada com sucesso" };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao aprovar avaliação" };
      res.status(500).json(response);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await ReviewModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = { success: false, error: "Avaliação não encontrada" };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = { success: true, message: "Avaliação excluída com sucesso" };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao excluir avaliação" };
      res.status(500).json(response);
    }
  }
}

export default new ReviewController();
