import { Request, Response } from "express";
import PrePedidoModel, { PrePedidoItem } from "../models/PrePedidoModel";
import { ApiResponse } from "../types";

class PrePedidoController {
  async getAll(req: Request, res: Response) {
    try {
      const list = await PrePedidoModel.findAll();
      const response: ApiResponse<typeof list> = { success: true, data: list };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao listar pré-pedidos",
      };
      res.status(500).json(response);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const body = req.body as {
        items: PrePedidoItem[];
        session_id?: string;
        contact_name?: string;
        contact_company?: string;
        contact_phone?: string;
        contact_email?: string;
        notes?: string;
        is_urgent?: boolean;
        retailer_id?: string;
      };
      const { items, session_id, contact_name, contact_company, contact_phone, contact_email, notes, is_urgent, retailer_id } = body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        const response: ApiResponse<null> = {
          success: false,
          error: "Lista de itens inválida",
        };
        return res.status(400).json(response);
      }

      const id = `PRE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const created = await PrePedidoModel.create(id, items, session_id, {
        contact_name: contact_name || null,
        contact_company: contact_company || null,
        contact_phone: contact_phone || null,
        contact_email: contact_email || null,
        notes: notes || null,
        is_urgent: !!is_urgent,
        retailer_id: retailer_id || null,
      });

      const response: ApiResponse<typeof created> = {
        success: true,
        data: created,
        message: "Pré-pedido registrado",
      };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao registrar pré-pedido",
      };
      res.status(500).json(response);
    }
  }
}

export default new PrePedidoController();
