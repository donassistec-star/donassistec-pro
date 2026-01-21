import { Request, Response } from "express";
import ServiceModel, { Service, ModelService } from "../models/ServiceModel";
import { ApiResponse } from "../types";
import { AuthRequest } from "../middleware/auth";

class ServiceController {
  async getAll(req: Request, res: Response) {
    try {
      const activeOnly = req.query.activeOnly === "true";
      const services = await ServiceModel.findAll(activeOnly);
      
      const response: ApiResponse<Service[]> = {
        success: true,
        data: services,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar serviços",
      };
      res.status(500).json(response);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const service = await ServiceModel.findById(id);

      if (!service) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Serviço não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Service> = {
        success: true,
        data: service,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar serviço",
      };
      res.status(500).json(response);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const serviceData = req.body as Omit<Service, "created_at" | "updated_at">;

      if (!serviceData.id || !serviceData.name) {
        const response: ApiResponse<null> = {
          success: false,
          error: "ID e nome são obrigatórios",
        };
        return res.status(400).json(response);
      }

      const service = await ServiceModel.create(serviceData);

      const response: ApiResponse<Service> = {
        success: true,
        data: service,
        message: "Serviço criado com sucesso",
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao criar serviço",
      };
      res.status(500).json(response);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const serviceData = req.body as Partial<Service>;

      const service = await ServiceModel.update(id, serviceData);

      if (!service) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Serviço não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Service> = {
        success: true,
        data: service,
        message: "Serviço atualizado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar serviço",
      };
      res.status(500).json(response);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await ServiceModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Serviço não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Serviço deletado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao deletar serviço",
      };
      res.status(500).json(response);
    }
  }

  // Model Services (preços por modelo)
  async getModelServices(req: Request, res: Response) {
    try {
      const { modelId } = req.params;
      const services = await ServiceModel.getModelServices(modelId);

      const response: ApiResponse<ModelService[]> = {
        success: true,
        data: services,
      };
      res.json(response);
    } catch (error: any) {
      console.error("Erro no controller getModelServices:", error);
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar serviços do modelo",
      };
      res.status(500).json(response);
    }
  }

  async setModelService(req: Request, res: Response) {
    try {
      const { modelId, serviceId } = req.params;
      const { price, available } = req.body;

      if (price === undefined || available === undefined) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Preço e disponibilidade são obrigatórios",
        };
        return res.status(400).json(response);
      }

      const modelService = await ServiceModel.setModelService(
        modelId,
        serviceId,
        parseFloat(price),
        Boolean(available)
      );

      const response: ApiResponse<ModelService> = {
        success: true,
        data: modelService,
        message: "Serviço do modelo atualizado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar serviço do modelo",
      };
      res.status(500).json(response);
    }
  }

  async removeModelService(req: Request, res: Response) {
    try {
      const { modelId, serviceId } = req.params;
      const deleted = await ServiceModel.removeModelService(modelId, serviceId);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Serviço do modelo não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Serviço removido do modelo com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao remover serviço do modelo",
      };
      res.status(500).json(response);
    }
  }
}

export default new ServiceController();
