import { Response } from "express";
import AuditLogModel from "../models/AuditLogModel";
import { AuthRequest } from "../middleware/auth";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AuditLogController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { user_id, action, entity_type, entity_id, limit = "100", offset = "0" } = req.query;

      const filters: any = {};
      if (user_id) filters.user_id = user_id as string;
      if (action) filters.action = action as string;
      if (entity_type) filters.entity_type = entity_type as string;
      if (entity_id) filters.entity_id = entity_id as string;
      if (limit) filters.limit = parseInt(limit as string, 10);
      if (offset) filters.offset = parseInt(offset as string, 10);

      const logs = await AuditLogModel.findAll(filters);
      const response: ApiResponse<any> = { success: true, data: logs };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao buscar logs de auditoria" };
      res.status(500).json(response);
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const log = await AuditLogModel.findById(id);

      if (!log) {
        const response: ApiResponse<null> = { success: false, error: "Log de auditoria não encontrado" };
        return res.status(404).json(response);
      }

      const response: ApiResponse<any> = { success: true, data: log };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { success: false, error: error.message || "Erro ao buscar log de auditoria" };
      res.status(500).json(response);
    }
  }
}

export default new AuditLogController();
