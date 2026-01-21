import { Request, Response } from "express";
import BrandModel from "../models/BrandModel";
import { ApiResponse } from "../types";

class BrandController {
  async getAll(req: Request, res: Response) {
    try {
      const brands = await BrandModel.findAll();
      const response: ApiResponse<typeof brands> = {
        success: true,
        data: brands,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar marcas",
      };
      res.status(500).json(response);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const brand = await BrandModel.findById(id);

      if (!brand) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Marca não encontrada",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof brand> = {
        success: true,
        data: brand,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar marca",
      };
      res.status(500).json(response);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const brand = await BrandModel.create(req.body);
      const response: ApiResponse<typeof brand> = {
        success: true,
        data: brand,
        message: "Marca criada com sucesso",
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao criar marca",
      };
      res.status(500).json(response);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const brand = await BrandModel.update(id, req.body);

      if (!brand) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Marca não encontrada",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof brand> = {
        success: true,
        data: brand,
        message: "Marca atualizada com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar marca",
      };
      res.status(500).json(response);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await BrandModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Marca não encontrada",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Marca deletada com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao deletar marca",
      };
      res.status(500).json(response);
    }
  }
}

export default new BrandController();
