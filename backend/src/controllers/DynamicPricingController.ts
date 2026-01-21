import { Response } from "express";
import DynamicPricingModel from "../models/DynamicPricingModel";
import { AuthRequest } from "../middleware/auth";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class DynamicPricingController {
  async getByModel(req: AuthRequest, res: Response) {
    try {
      const { modelId } = req.params;
      const pricings = await DynamicPricingModel.findByModel(modelId);
      const response: ApiResponse<any> = { success: true, data: pricings };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao buscar preços dinâmicos" };
      res.status(500).json(response);
    }
  }

  async getPrice(req: AuthRequest, res: Response) {
    try {
      const { modelId } = req.params;
      const { quantity } = req.query;

      if (!quantity) {
        const response: ApiResponse<null> = { success: false, error: "Quantidade não informada" };
        return res.status(400).json(response);
      }

      const pricing = await DynamicPricingModel.findByModelAndQuantity(modelId, parseInt(quantity as string));
      
      if (!pricing) {
        const response: ApiResponse<null> = { success: false, error: "Preço não encontrado para esta quantidade" };
        return res.status(404).json(response);
      }

      const response: ApiResponse<any> = { success: true, data: pricing };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao buscar preço" };
      res.status(500).json(response);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const pricing = await DynamicPricingModel.create(req.body);
      const response: ApiResponse<any> = { success: true, data: pricing, message: "Preço dinâmico criado com sucesso" };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao criar preço dinâmico" };
      res.status(500).json(response);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await DynamicPricingModel.update(id, req.body);

      if (!updated) {
        const response: ApiResponse<null> = { success: false, error: "Preço dinâmico não encontrado" };
        return res.status(404).json(response);
      }

      const response: ApiResponse<any> = { success: true, data: updated, message: "Preço dinâmico atualizado com sucesso" };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao atualizar preço dinâmico" };
      res.status(500).json(response);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await DynamicPricingModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = { success: false, error: "Preço dinâmico não encontrado" };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = { success: true, message: "Preço dinâmico excluído com sucesso" };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao excluir preço dinâmico" };
      res.status(500).json(response);
    }
  }
}

export default new DynamicPricingController();
