import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

/** Acesso ao painel admin: apenas usuários da admin_team */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Não autenticado" });
  }
  if (req.user.source !== "admin_team") {
    return res.status(403).json({
      success: false,
      error: "Acesso negado. Área apenas para usuários da equipe admin.",
    });
  }
  next();
};

/** admin_team com role admin ou gerente pode gerenciar a equipe (adicionar/editar usuários) */
export const requireAdminTeamAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Não autenticado" });
  }
  const ok =
    req.user.source === "admin_team" &&
    (req.user.role === "admin" || req.user.role === "gerente");
  if (!ok) {
    return res.status(403).json({
      success: false,
      error: "Apenas administradores ou gerentes da equipe podem gerenciar.",
    });
  }
  next();
};
