import { Request, Response } from "express";
import RetailerModel from "../models/RetailerModel";
import AdminTeamModel from "../models/AdminTeamModel";
import { AuthRequest } from "../middleware/auth";
import { AuthResponse, RetailerRegisterData, RetailerLoginData } from "../types";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getJwtSecret, isAdminBootstrapEnabled } from "../config/security";
import { buildRetailerApprovalRequestWhatsAppUrl } from "../utils/retailerWhatsApp";

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

class AuthController {

  async adminLogin(req: Request, res: Response) {
    try {
      const data: RetailerLoginData = req.body;

      if (!data.email || !data.password) {
        const response: AuthResponse = {
          success: false,
          error: "Email e senha são obrigatórios",
        };
        return res.status(400).json(response);
      }

      const adminTeam = await AdminTeamModel.verifyPassword(data.email, data.password);
      if (!adminTeam) {
        return res.status(401).json({
          success: false,
          error: "Email ou senha inválidos",
        });
      }

      const modules = await AdminTeamModel.getModulesForUser(adminTeam.id, adminTeam.role);
      const token = jwt.sign(
        { id: adminTeam.id, email: adminTeam.email, role: adminTeam.role, source: "admin_team" },
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: adminTeam.id,
          email: adminTeam.email,
          company_name: "",
          contact_name: adminTeam.name,
          phone: "",
          cnpj: "",
          role: adminTeam.role,
          source: "admin_team",
          modules,
        },
        message: "Login realizado com sucesso",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao fazer login administrativo",
      });
    }
  }

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
      const whatsappUrl = await buildRetailerApprovalRequestWhatsAppUrl(retailer);

      const response: AuthResponse = {
        success: true,
        approval_status: retailer.approval_status,
        whatsapp_url: whatsappUrl,
        message: "Cadastro recebido. Aguarde a aprovação do administrador para acessar as tabelas de preço.",
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error("Erro no cadastro de lojista:", error);
      const response: AuthResponse = {
        success: false,
        error: error.message || "Erro ao criar conta",
      };
      res.status(500).json(response);
    }
  }

  /** GET: indica se pode criar o primeiro admin (admin_team vazia). Só para exibir o botão no front. */
  async bootstrapAvailable(_req: Request, res: Response) {
    if (!isAdminBootstrapEnabled()) {
      return res.json({
        success: true,
        available: false,
        tableExists: true,
        message: "Bootstrap administrativo desabilitado neste ambiente.",
      });
    }

    try {
      const count = await AdminTeamModel.getCount();
      return res.json({ success: true, available: count === 0, tableExists: true });
    } catch (e: any) {
      if (e.code === "ER_NO_SUCH_TABLE") {
        return res.json({ success: true, available: false, tableExists: false });
      }
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  /** POST: cria o primeiro admin quando admin_team está vazia. Retorna token e user como no login. */
  async bootstrapAdmin(req: Request, res: Response) {
    if (!isAdminBootstrapEnabled()) {
      return res.status(403).json({
        success: false,
        error: "Bootstrap administrativo desabilitado. Use os scripts do servidor.",
      });
    }

    try {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ success: false, error: "E-mail, senha e nome são obrigatórios" });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: "A senha deve ter no mínimo 6 caracteres" });
      }

      let count: number;
      try {
        count = await AdminTeamModel.getCount();
      } catch (e: any) {
        if (e.code === "ER_NO_SUCH_TABLE") {
          return res.status(400).json({
            success: false,
            error: "Tabela admin_team não existe. No servidor, rode: npm run migrate:admin-team",
          });
        }
        throw e;
      }

      if (count > 0) {
        return res.status(403).json({
          success: false,
          error: "Já existe administrador. Use o login normal ou os scripts no servidor.",
        });
      }

      const created = await AdminTeamModel.create({
        email: String(email).trim(),
        password,
        name: String(name).trim(),
        role: "admin",
      });
      const modules = await AdminTeamModel.getModulesForUser(created.id, "admin");

      const token = jwt.sign(
        { id: created.id, email: created.email, role: created.role, source: "admin_team" },
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN }
      );

      const response: AuthResponse = {
        success: true,
        token,
        user: {
          id: created.id,
          email: created.email,
          company_name: "",
          contact_name: created.name,
          phone: "",
          cnpj: "",
          role: created.role,
          source: "admin_team",
          modules,
        },
        message: "Primeiro administrador criado. Faça login com esse e-mail e senha.",
      };

      return res.status(201).json(response);
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message || "Erro ao criar administrador" });
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

      // 1) Tentar usuário da equipe (admin_team)
      const adminTeam = await AdminTeamModel.verifyPassword(data.email, data.password);
      if (adminTeam) {
        const modules = await AdminTeamModel.getModulesForUser(adminTeam.id, adminTeam.role);
        const token = jwt.sign(
          { id: adminTeam.id, email: adminTeam.email, role: adminTeam.role, source: "admin_team" },
          getJwtSecret(),
          { expiresIn: JWT_EXPIRES_IN }
        );
        const response: AuthResponse = {
          success: true,
          token,
          user: {
            id: adminTeam.id,
            email: adminTeam.email,
            company_name: "",
            contact_name: adminTeam.name,
            phone: "",
            cnpj: "",
            role: adminTeam.role,
            source: "admin_team",
            modules,
          },
          message: "Login realizado com sucesso",
        };
        return res.json(response);
      }

      // 2) Tentar lojista (retailers)
      const authStatus = await RetailerModel.getAuthStatusByEmail(data.email);
      if (!authStatus) {
        const response: AuthResponse = {
          success: false,
          error: "Email ou senha inválidos",
        };
        return res.status(401).json(response);
      }

      const passwordMatch = await RetailerModel.verifyPassword(data.email, data.password);
      if (!passwordMatch) {
        const validPassword = await bcrypt.compare(data.password, authStatus.password_hash);
        if (!validPassword) {
          return res.status(401).json({
            success: false,
            error: "Email ou senha inválidos",
          });
        }

        if (!authStatus.active) {
          return res.status(403).json({
            success: false,
            error: "Seu cadastro de lojista está inativo. Fale com o administrador.",
          });
        }

        if (authStatus.approval_status === "pending") {
          return res.status(403).json({
            success: false,
            approval_status: "pending",
            error: "Seu cadastro está aguardando aprovação do administrador.",
          });
        }

        if (authStatus.approval_status === "rejected") {
          return res.status(403).json({
            success: false,
            approval_status: "rejected",
            error: "Seu cadastro foi recusado. Entre em contato com o administrador.",
          });
        }

        return res.status(401).json({
          success: false,
          error: "Email ou senha inválidos",
        });
      }

      const retailer = passwordMatch;

      const token = jwt.sign(
        { id: retailer.id, email: retailer.email, role: retailer.role, source: "retailer" },
        getJwtSecret(),
        { expiresIn: JWT_EXPIRES_IN }
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
          source: "retailer",
          approval_status: retailer.approval_status,
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
      const u = (req as AuthRequest).user;
      if (!u?.id) {
        return res.status(401).json({ success: false, error: "Token inválido ou expirado" });
      }

      const source = u.source || "retailer";

      if (source === "admin_team") {
        const at = await AdminTeamModel.findById(u.id);
        if (!at) {
          return res.status(404).json({ success: false, error: "Usuário não encontrado" });
        }
        const modules = await AdminTeamModel.getModulesForUser(at.id, at.role);
        return res.json({
          success: true,
          user: {
            id: at.id,
            email: at.email,
            company_name: "",
            contact_name: at.name,
            phone: "",
            cnpj: "",
            role: at.role,
            source: "admin_team",
            modules,
          },
        });
      }

      const retailer = await RetailerModel.findById(u.id);
      if (!retailer) {
        return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      }

      return res.json({
        success: true,
        user: {
          id: retailer.id,
          email: retailer.email,
          company_name: retailer.company_name,
          contact_name: retailer.contact_name,
          phone: retailer.phone,
          cnpj: retailer.cnpj,
          role: retailer.role,
          source: "retailer",
          approval_status: retailer.approval_status,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao buscar dados do usuário" });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const u = (req as AuthRequest).user;
      if (!u?.id) {
        return res.status(401).json({ success: false, error: "Token inválido ou expirado" });
      }

      if (u.source === "admin_team") {
        const { name } = req.body;
        const at = await AdminTeamModel.update(u.id, { name });
        if (!at) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
        return res.json({
          success: true,
          user: {
            id: at.id,
            email: at.email,
            company_name: "",
            contact_name: at.name,
            phone: "",
            cnpj: "",
            role: at.role,
            source: "admin_team",
          },
          message: "Perfil atualizado com sucesso",
        });
      }

      const { company_name, contact_name, phone, cnpj } = req.body;
      const retailer = await RetailerModel.update(u.id, { company_name, contact_name, phone, cnpj });
      if (!retailer) {
        return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      }
      return res.json({
        success: true,
        user: {
          id: retailer.id,
          email: retailer.email,
          company_name: retailer.company_name,
          contact_name: retailer.contact_name,
          phone: retailer.phone,
          cnpj: retailer.cnpj,
          role: retailer.role,
          source: "retailer",
          approval_status: retailer.approval_status,
        },
        message: "Perfil atualizado com sucesso",
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao atualizar perfil" });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const u = (req as AuthRequest).user;
      if (!u?.id) {
        return res.status(401).json({ success: false, error: "Token inválido ou expirado" });
      }

      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: "Senha atual e nova senha são obrigatórias" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: "A nova senha deve ter no mínimo 6 caracteres" });
      }

      const success =
        u.source === "admin_team"
          ? await AdminTeamModel.updatePassword(u.id, currentPassword, newPassword)
          : await RetailerModel.updatePassword(u.id, currentPassword, newPassword);

      if (!success) {
        return res.status(401).json({ success: false, error: "Senha atual incorreta" });
      }
      return res.json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao alterar senha" });
    }
  }
}

export default new AuthController();
