import { Response } from "express";
import OrderModel from "../models/OrderModel";
import PrePedidoModel from "../models/PrePedidoModel";
import CouponModel from "../models/CouponModel";
import { ApiResponse, Order, OrderItem, OrderWithItems } from "../types";
import { AuthRequest } from "../middleware/auth";

class OrderController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Não autenticado" });
      }
      const retailerIds: string[] | undefined =
        req.user.role === "admin"
          ? undefined
          : [req.user.id, req.user.email].filter(Boolean);
      const orders = await OrderModel.findAll(retailerIds);
      const response: ApiResponse<OrderWithItems[]> = {
        success: true,
        data: orders,
      };
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.json(response);
    } catch (error: any) {
      console.error("[OrderController.getAll] Erro ao buscar pedidos:", error?.message || error);
      const response: ApiResponse<null> = {
        success: false,
        error: error?.message || "Erro ao buscar pedidos",
      };
      res.status(500).json(response);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const retailerIdOrIds: string | string[] | undefined =
        !req.user || req.user.role === "admin"
          ? (req.query.retailerId as string | undefined)
          : [req.user.id, req.user.email].filter(Boolean);
      const order = await OrderModel.findById(id, retailerIdOrIds);

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

  async createFromPrePedido(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Não autenticado" });
      }
      const { pre_pedido_id } = req.body as { pre_pedido_id?: string };
      if (!pre_pedido_id) {
        return res.status(400).json({ success: false, error: "pre_pedido_id é obrigatório" });
      }

      const pp = await PrePedidoModel.findById(pre_pedido_id);
      if (!pp) {
        return res.status(404).json({ success: false, error: "Pré-pedido não encontrado" });
      }

      const already = await OrderModel.existsByPrePedidoId(pre_pedido_id);
      if (already) {
        return res.status(400).json({ success: false, error: "Este pré-pedido já foi convertido em pedido" });
      }

      const canConvert =
        req.user.role === "admin" ||
        (pp.retailer_id && [req.user.id, req.user.email].includes(pp.retailer_id));
      if (!canConvert) {
        return res.status(403).json({ success: false, error: "Você não pode converter este pré-pedido" });
      }

      const retailerId =
        pp.retailer_id ||
        pp.contact_email ||
        (req.user.role === "admin" ? (req.user.email as string) : req.user.id);

      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const notes = [pp.notes, pp.need_by ? `Preciso até: ${pp.need_by}` : null].filter(Boolean).join(" | ") || undefined;

      const order: Order = {
        id: orderId,
        pre_pedido_id: pp.id,
        retailer_id: retailerId,
        company_name: pp.contact_company || pp.contact_name || "N/A",
        contact_name: pp.contact_name || "N/A",
        email: pp.contact_email || "",
        phone: pp.contact_phone || undefined,
        notes,
        status: "pending",
        total: 0,
      };

      const mapService = (s: { service_id?: string; name?: string }) => {
        const id = (s.service_id || "").toLowerCase();
        const name = (s.name || "").toLowerCase();
        return {
          re: id.includes("reconstruction") || id.includes("recons") || name.includes("recons"),
          glass: id.includes("glass") || id.includes("vidro") || name.includes("vidro") || name.includes("glass"),
          parts: id.includes("parts") || id.includes("pecas") || name.includes("pecas") || name.includes("parts"),
        };
      };

      const items: OrderItem[] = (pp.items_json || []).map((it) => {
        const svc = (it.selected_services || []).map(mapService);
        const reconstruction = svc.some((m) => m.re);
        const glass_replacement = svc.some((m) => m.glass);
        const parts_available = svc.some((m) => m.parts);
        const svcNotes = (it.selected_services || []).map((s) => s.name).filter(Boolean);
        return {
          order_id: orderId,
          model_id: it.model_id,
          model_name: it.model_name,
          brand_name: it.brand_name || undefined,
          quantity: it.quantity,
          reconstruction,
          glass_replacement,
          parts_available,
          notes: svcNotes.length ? `Serviços: ${svcNotes.join(", ")}` : undefined,
        };
      });

      if (items.length === 0) {
        return res.status(400).json({ success: false, error: "O pré-pedido não possui itens" });
      }

      const created = await OrderModel.create(order, items);
      res.set("Cache-Control", "no-store, no-cache, must-revalidate");
      res.status(201).json({
        success: true,
        data: created,
        message: "Pedido criado a partir do pré-pedido",
      });
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error?.message || "Erro ao converter pré-pedido em pedido",
      };
      res.status(500).json(response);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { order, items, couponCode } = req.body as { order: Order; items: OrderItem[]; couponCode?: string };
      
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
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Não autenticado" });
      }
      const { id } = req.params;
      const { status } = req.body;
      const retailerIds: string[] | undefined =
        req.user.role === "admin" ? undefined : [req.user.id, req.user.email].filter(Boolean);

      if (!["pending", "processing", "completed", "cancelled"].includes(status)) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Status inválido",
        };
        return res.status(400).json(response);
      }

      const order = await OrderModel.updateStatus(id, status, retailerIds);

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
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Não autenticado" });
      }
      const { id } = req.params;
      const retailerIds: string[] | undefined =
        req.user.role === "admin" ? undefined : [req.user.id, req.user.email].filter(Boolean);
      const deleted = await OrderModel.delete(id, retailerIds);

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
