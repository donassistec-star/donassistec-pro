import { Request, Response } from "express";
import RetailerModel from "../models/RetailerModel";
import { AuthResponse, RetailerRegisterData, RetailerLoginData } from "../types";
import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is required.");
}
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as string;

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RetailerRegisterData = req.body;

      // Validações básicas
      if (!data.email || !data.password || !data.company_name || !data.contact_name) {
        const response: AuthResponse = {
          success: false,
          error: "Dados incompletos. Preencha email, senha, nome da empresa e nome de contato.",
        };
        return res.status(400).json(response);
      }

      if (data.password.length < 6) {
        const response: AuthResponse = {
          success: false,
          error: "A senha deve ter no mínimo 6 caracteres",
        };
        return res.status(400).json(response);
      }

      // Criar usuário
      const retailer = await RetailerModel.create(data);

      // Gerar token JWT
      const token = jwt.sign(
        { id: retailer.id, email: retailer.email, role: retailer.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          id: retailer.id,
          email: retailer.email,
          company_name: retailer.company_name,
          contact_name: retailer.contact_name,
          phone: retailer.phone,
          cnpj: retailer.cnpj,
          role: retailer.role,
        },
        message: "Cadastro realizado com sucesso",
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: AuthResponse = {
        success: false,
        error: error.message || "Erro ao criar conta",
      };
      res.status(500).json(response);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: RetailerLoginData = req.body;

      if (!data.email || !data.password) {
        const response: AuthResponse = {
          success: false,
          error: "Email e senha são obrigatórios",
        };
        return res.status(400).json(response);
      }

      // Verificar credenciais
      const retailer = await RetailerModel.verifyPassword(data.email, data.password);

      if (!retailer) {
        const response: AuthResponse = {
          success: false,
          error: "Email ou senha inválidos",
        };
        return res.status(401).json(response);
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: retailer.id, email: retailer.email, role: retailer.role },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          id: retailer.id,
          email: retailer.email,
          company_name: retailer.company_name,
          contact_name: retailer.contact_name,
          phone: retailer.phone,
          cnpj: retailer.cnpj,
          role: retailer.role,
        },
        message: "Login realizado com sucesso",
      };

      res.json(response);
    } catch (error: any) {
      const response: AuthResponse = {
        success: false,
        error: error.message || "Erro ao fazer login",
      };
      res.status(500).json(response);
    }
  }

  async me(req: Request, res: Response) {
    try {
      // O middleware de autenticação deve adicionar req.user
      const userId = (req as any).user?.id;

      if (!userId) {
        const response: AuthResponse = {
          success: false,
          error: "Token inválido ou expirado",
        };
        return res.status(401).json(response);
      }

      const retailer = await RetailerModel.findById(userId);

      if (!retailer) {
        const response: AuthResponse = {
          success: false,
          error: "Usuário não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: AuthResponse = {
        success: true,
        user: {
          id: retailer.id,
          email: retailer.email,
          company_name: retailer.company_name,
          contact_name: retailer.contact_name,
          phone: retailer.phone,
          cnpj: retailer.cnpj,
          role: retailer.role,
        },
      };

      res.json(response);
    } catch (error: any) {
      const response: AuthResponse = {
        success: false,
        error: error.message || "Erro ao buscar dados do usuário",
      };
      res.status(500).json(response);
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        const response: AuthResponse = {
          success: false,
          error: "Token inválido ou expirado",
        };
        return res.status(401).json(response);
      }

      const { company_name, contact_name, phone, cnpj } = req.body;

      const retailer = await RetailerModel.update(userId, {
        company_name,
        contact_name,
        phone,
        cnpj,
      });

      if (!retailer) {
        const response: AuthResponse = {
          success: false,
          error: "Usuário não encontrado",
        };
        return res.status(404).json(response);
      }

      const response: AuthResponse = {
        success: true,
        user: {
          id: retailer.id,
          email: retailer.email,
          company_name: retailer.company_name,
          contact_name: retailer.contact_name,
          phone: retailer.phone,
          cnpj: retailer.cnpj,
          role: retailer.role,
        },
        message: "Perfil atualizado com sucesso",
      };

      res.json(response);
    } catch (error: any) {
      const response: AuthResponse = {
        success: false,
        error: error.message || "Erro ao atualizar perfil",
      };
      res.status(500).json(response);
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        const response: AuthResponse = {
          success: false,
          error: "Token inválido ou expirado",
        };
        return res.status(401).json(response);
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        const response: AuthResponse = {
          success: false,
          error: "Senha atual e nova senha são obrigatórias",
        };
        return res.status(400).json(response);
      }

      if (newPassword.length < 6) {
        const response: AuthResponse = {
          success: false,
          error: "A nova senha deve ter no mínimo 6 caracteres",
        };
        return res.status(400).json(response);
      }

      const success = await RetailerModel.updatePassword(userId, currentPassword, newPassword);

      if (!success) {
        const response: AuthResponse = {
          success: false,
          error: "Senha atual incorreta",
        };
        return res.status(401).json(response);
      }

      const response: AuthResponse = {
        success: true,
        message: "Senha alterada com sucesso",
      };

      res.json(response);
    } catch (error: any) {
      const response: AuthResponse = {
        success: false,
        error: error.message || "Erro ao alterar senha",
      };
      res.status(500).json(response);
    }
  }
}

export default new AuthController();
