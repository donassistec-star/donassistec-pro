import { Response } from "express";
import OrderModel from "../models/OrderModel";
import CouponModel from "../models/CouponModel";
import { ApiResponse, Order, OrderItem, OrderWithItems } from "../types";
import { AuthRequest } from "../middleware/auth";

class OrderController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const retailerId = req.user?.role === 'admin'
        ? (req.query.retailerId as string | undefined)
        : req.user?.id;
      const orders = await OrderModel.findAll(retailerId);
      
      const response: ApiResponse<OrderWithItems[]> = {
        success: true,
        data: orders,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar pedidos",
      };
      res.status(500).json(response);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const retailerId = req.user?.role === 'admin'
        ? (req.query.retailerId as string | undefined)
        : req.user?.id;
      const order = await OrderModel.findById(id, retailerId);

      if (!order) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Pedido não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<OrderWithItems> = {
        success: true,
        data: order,
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar pedido",
      };
      res.status(500).json(response);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { order, items, couponCode } = req.body as { order: Order; items: OrderItem[]; couponCode?: string };
      
      // Enforce ownership from JWT — prevent spoofing retailer_id
      order.retailer_id = req.user!.id;
      
      if (!order || !items || items.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Dados do pedido inválidos",
        };
        return res.status(400).json(response);
      }

      const createdOrder = await OrderModel.create(order, items);

      // Registrar uso do cupom se fornecido
      if (couponCode && req.user) {
        try {
          const retailerId = req.user.email || order.retailer_id;
          const estimatedValue = order.total || 100; // Valor estimado se não fornecido
          const validation = await CouponModel.validateCoupon(couponCode, estimatedValue);
          
          if (validation.valid && validation.discount) {
            await CouponModel.recordUsage(
              validation.coupon!.id,
              retailerId,
              createdOrder.id,
              validation.discount
            );
          }
        } catch (error) {
          console.error("Erro ao registrar uso do cupom:", error);
          // Não falha o pedido se houver erro no cupom
        }
      }
      
      const response: ApiResponse<OrderWithItems> = {
        success: true,
        data: createdOrder,
        message: "Pedido criado com sucesso",
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao criar pedido",
      };
      res.status(500).json(response);
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const retailerId = req.user?.role === 'admin'
        ? (req.query.retailerId as string | undefined)
        : req.user?.id;

      if (!["pending", "processing", "completed", "cancelled"].includes(status)) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Status inválido",
        };
        return res.status(400).json(response);
      }

      const order = await OrderModel.updateStatus(id, status, retailerId);

      if (!order) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Pedido não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<OrderWithItems> = {
        success: true,
        data: order,
        message: "Status do pedido atualizado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao atualizar status do pedido",
      };
      res.status(500).json(response);
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const retailerId = req.user?.role === 'admin'
        ? (req.query.retailerId as string | undefined)
        : req.user?.id;
      const deleted = await OrderModel.delete(id, retailerId);

      if (!deleted) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Pedido não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<null> = {
        success: true,
        message: "Pedido deletado com sucesso",
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao deletar pedido",
      };
      res.status(500).json(response);
    }
  }
}

export default new OrderController();
