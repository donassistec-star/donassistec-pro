import { Request, Response } from "express";
import CouponModel, { Coupon } from "../models/CouponModel";
import { ApiResponse } from "../types";
import { AuthRequest } from "../middleware/auth";

class CouponController {
  async getAll(req: Request, res: Response) {
    try {
      const coupons = await CouponModel.findAll();
      const response: ApiResponse<Coupon[]> = {
        success: true,
        data: coupons,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar cupons",
      };
      res.status(500).json(response);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const coupon = await CouponModel.findById(id);

      if (!coupon) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Cupom não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Coupon> = {
        success: true,
        data: coupon,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar cupom",
      };
      res.status(500).json(response);
    }
  }

  async validate(req: AuthRequest, res: Response) {
    try {
      const { code, orderValue } = req.body;

      if (!code || !orderValue) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Código do cupom e valor do pedido são obrigatórios",
        };
        return res.status(400).json(response);
      }

      const validation = await CouponModel.validateCoupon(code, parseFloat(orderValue));

      if (!validation.valid) {
        const response: ApiResponse<null> = {
          success: false,
          error: validation.error || "Cupom inválido",
        };
        return res.status(400).json(response);
      }

      const response: ApiResponse<{ coupon: Coupon; discount: number }> = {
        success: true,
        data: {
          coupon: validation.coupon!,
          discount: validation.discount!,
        },
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao validar cupom",
      };
      res.status(500).json(response);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const couponData = req.body as Omit<Coupon, "created_at" | "updated_at" | "used_count">;

      if (!couponData.code || !couponData.discount_value || !couponData.valid_from || !couponData.valid_until) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Dados do cupom incompletos",
        };
        return res.status(400).json(response);
      }

      const coupon = await CouponModel.create(couponData);

      const response: ApiResponse<Coupon> = {
        success: true,
        data: coupon,
        message: "Cupom criado com sucesso",
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao criar cupom",
      };
      res.status(500).json(response);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const couponData = req.body as Partial<Coupon>;

      const coupon = await CouponModel.update(id, couponData);

      if (!coupon) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Cupom não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<Coupon> = {
        success: true,
        data: coupon,
        message: "Cupom atualizado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar cupom",
      };
      res.status(500).json(response);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await CouponModel.delete(id);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Cupom não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Cupom deletado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao deletar cupom",
      };
      res.status(500).json(response);
    }
  }

  async getUsageByRetailer(req: AuthRequest, res: Response) {
    try {
      const retailerId = req.user?.email || req.query.retailerId as string;

      if (!retailerId) {
        const response: ApiResponse<null> = {
          success: false,
          error: "ID do lojista não fornecido",
        };
        return res.status(400).json(response);
      }

      const usage = await CouponModel.getUsageByRetailer(retailerId);

      const response: ApiResponse<any[]> = {
        success: true,
        data: usage,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar histórico de cupons",
      };
      res.status(500).json(response);
    }
  }
}

export default new CouponController();
