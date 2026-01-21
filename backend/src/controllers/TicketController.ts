import { Response } from "express";
import TicketModel from "../models/TicketModel";
import { AuthRequest } from "../middleware/auth";
import { sendNotification } from "../services/socket";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class TicketController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { status, priority } = req.query;
      const retailer_id = req.user?.role === "admin" ? undefined : req.user?.id;

      const tickets = await TicketModel.findAll({
        retailer_id,
        status: status as any,
        priority: priority as any,
      });

      const response: ApiResponse<any> = { success: true, data: tickets };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao buscar tickets" };
      res.status(500).json(response);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await TicketModel.findById(id);

      if (!ticket) {
        const response: ApiResponse<null> = { success: false, error: "Ticket não encontrado" };
        return res.status(404).json(response);
      }

      // Verificar permissão
      if (req.user?.role !== "admin" && ticket.retailer_id !== req.user?.id) {
        const response: ApiResponse<null> = { success: false, error: "Acesso negado" };
        return res.status(403).json(response);
      }

      const response: ApiResponse<any> = { success: true, data: ticket };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao buscar ticket" };
      res.status(500).json(response);
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const ticket = await TicketModel.create({
        ...req.body,
        retailer_id: req.user?.id || req.body.retailer_id,
      });

      // Notificar admin
      sendNotification("admin", "new-ticket", ticket);

      const response: ApiResponse<any> = { success: true, data: ticket, message: "Ticket criado com sucesso" };
      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao criar ticket" };
      res.status(500).json(response);
    }
  }

  async addMessage(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const ticket = await TicketModel.findById(id);

      if (!ticket) {
        const response: ApiResponse<null> = { success: false, error: "Ticket não encontrado" };
        return res.status(404).json(response);
      }

      const sender_type = req.user?.role === "admin" ? "admin" : "retailer";
      const message = await TicketModel.addMessage({
        ticket_id: id,
        sender_id: req.user?.id || "",
        sender_type,
        message: req.body.message,
      });

      // Notificar via Socket.IO
      const room = req.user?.role === "admin" ? ticket.retailer_id : "admin";
      sendNotification(room, "ticket-message", { ticket_id: id, message });

      const response: ApiResponse<any> = { success: true, data: message, message: "Mensagem enviada com sucesso" };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao enviar mensagem" };
      res.status(500).json(response);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await TicketModel.update(id, req.body);

      if (!updated) {
        const response: ApiResponse<null> = { success: false, error: "Ticket não encontrado" };
        return res.status(404).json(response);
      }

      const response: ApiResponse<any> = { success: true, data: updated, message: "Ticket atualizado com sucesso" };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao atualizar ticket" };
      res.status(500).json(response);
    }
  }
}

export default new TicketController();
