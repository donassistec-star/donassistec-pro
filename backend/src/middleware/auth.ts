import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/security";

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

export const authenticateToken = (
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
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Token inválido ou expirado",
    });
  }
};
