import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import AuditLogModel from "../models/AuditLogModel";

export const auditLog = (action: string, entityType?: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Executar a requisição primeiro
    const originalSend = res.send;
    const originalJson = res.json;

    let responseBody: any;
    res.json = function (body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    res.send = function (body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    await next();

    // Registrar log após a execução (apenas para ações de sucesso)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const entityId = req.params.id || (responseBody?.data?.id || responseBody?.data?.id);
        const oldValues = req.body.oldValues || null;
        const newValues = req.body.newValues || (entityType && responseBody?.data ? { ...responseBody.data } : null);

        await AuditLogModel.create({
          user_id: req.user?.id,
          user_email: req.user?.email,
          action,
          entity_type: entityType,
          entity_id: entityId,
          old_values: oldValues,
          new_values: newValues,
          ip_address: req.ip || req.socket.remoteAddress || undefined,
          user_agent: req.get("user-agent") || undefined,
        });
      } catch (error) {
        // Não interromper a resposta em caso de erro no log
        console.error("Erro ao registrar log de auditoria:", error);
      }
    }
  };
};
