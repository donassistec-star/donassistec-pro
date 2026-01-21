import { Request, Response } from "express";
import PhoneModelModel from "../models/PhoneModelModel";
import { ApiResponse } from "../types";

class PhoneModelController {
  async getAll(req: Request, res: Response) {
    try {
      const {
        brand,
        availability,
        premium,
        popular,
        service,
        search,
        sortBy = "popular",
      } = req.query;

      // Se houver filtros ou busca, usar método filter
      if (search || brand || availability || premium || popular || service) {
        const filters: any = {};

        if (search && typeof search === "string") {
          const models = await PhoneModelModel.search(search);
          const response: ApiResponse<typeof models> = {
            success: true,
            data: models,
          };
          return res.json(response);
        }

        if (brand) {
          filters.brands = Array.isArray(brand) ? brand : [brand];
        }
        if (availability) {
          filters.availability = Array.isArray(availability)
            ? availability
            : [availability];
        }
        if (premium !== undefined) {
          filters.premium = premium === "true" || premium === "1";
        }
        if (popular !== undefined) {
          filters.popular = popular === "true" || popular === "1";
        }
        if (service) {
          filters.services = Array.isArray(service) ? service : [service];
        }

        const models = await PhoneModelModel.filter(filters);
        const response: ApiResponse<typeof models> = {
          success: true,
          data: models,
        };
        return res.json(response);
      }

      // Caso contrário, retornar todos
      const models = await PhoneModelModel.findAll();
      const response: ApiResponse<typeof models> = {
        success: true,
        data: models,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar modelos",
      };
      res.status(500).json(response);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const model = await PhoneModelModel.findById(id);

      if (!model) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Modelo não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof model> = {
        success: true,
        data: model,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar modelo",
      };
      res.status(500).json(response);
    }
  }

  async getByBrand(req: Request, res: Response) {
    try {
      const { brandId } = req.params;
      const models = await PhoneModelModel.findByBrand(brandId);

      const response: ApiResponse<typeof models> = {
        success: true,
        data: models,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar modelos da marca",
      };
      res.status(500).json(response);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const model = await PhoneModelModel.create(req.body);
      const response: ApiResponse<typeof model> = {
        success: true,
        data: model,
        message: "Modelo criado com sucesso",
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao criar modelo",
      };
      res.status(500).json(response);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const model = await PhoneModelModel.update(id, req.body);

      if (!model) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Modelo não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof model> = {
        success: true,
        data: model,
        message: "Modelo atualizado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar modelo",
      };
      res.status(500).json(response);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await PhoneModelModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Modelo não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Modelo deletado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao deletar modelo",
      };
      res.status(500).json(response);
    }
  }

  // Videos
  async getVideos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const videos = await PhoneModelModel.getVideos(id);
      const response: ApiResponse<typeof videos> = {
        success: true,
        data: videos,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar vídeos do modelo",
      };
      res.status(500).json(response);
    }
  }

  async createVideo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, url, thumbnail_url, duration, video_order } = req.body;

      if (!title || !url) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Título e URL são obrigatórios",
        };
        return res.status(400).json(response);
      }

      const video = await PhoneModelModel.createVideo({
        model_id: id,
        title,
        url,
        thumbnail_url,
        duration,
        video_order,
      } as any);

      const response: ApiResponse<typeof video> = {
        success: true,
        data: video,
        message: "Vídeo criado com sucesso",
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao criar vídeo",
      };
      res.status(500).json(response);
    }
  }

  async updateVideo(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      const id = Number(videoId);

      if (Number.isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: "ID do vídeo inválido",
        };
        return res.status(400).json(response);
      }

      const video = await PhoneModelModel.updateVideo(id, req.body);

      if (!video) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Vídeo não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<typeof video> = {
        success: true,
        data: video,
        message: "Vídeo atualizado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar vídeo",
      };
      res.status(500).json(response);
    }
  }

  async deleteVideo(req: Request, res: Response) {
    try {
      const { videoId } = req.params;
      const id = Number(videoId);

      if (Number.isNaN(id)) {
        const response: ApiResponse<null> = {
          success: false,
          error: "ID do vídeo inválido",
        };
        return res.status(400).json(response);
      }

      const deleted = await PhoneModelModel.deleteVideo(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Vídeo não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Vídeo deletado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao deletar vídeo",
      };
      res.status(500).json(response);
    }
  }
}

export default new PhoneModelController();
