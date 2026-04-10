import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/security";
import RetailerModel from "../models/RetailerModel";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    /** admin_team = usuário da equipe; retailer = lojista (ou ausente para tokens antigos) */
    source?: "admin_team" | "retailer";
  };
}

export const isAdminTeamUser = (user?: AuthRequest["user"]): boolean => {
  return user?.source === "admin_team";
};

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token de autenticação não fornecido",
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: string; email: string; role: string; source?: "admin_team" | "retailer" };
    req.user = decoded;

    if ((decoded.source || "retailer") === "retailer") {
      const retailer = await RetailerModel.findByIdIncludingInactive(decoded.id);
      if (!retailer) {
        return res.status(403).json({
          success: false,
          error: "Usuário lojista não encontrado",
        });
      }

      if (!retailer.active) {
        return res.status(403).json({
          success: false,
          error: "Seu cadastro de lojista está inativo. Fale com o administrador.",
        });
      }

      if (retailer.approval_status === "pending") {
        return res.status(403).json({
          success: false,
          error: "Seu cadastro está aguardando aprovação do administrador.",
        });
      }

      if (retailer.approval_status === "rejected") {
        return res.status(403).json({
          success: false,
          error: "Seu cadastro foi recusado. Entre em contato com o administrador.",
        });
      }
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Token inválido ou expirado",
    });
  }
};
