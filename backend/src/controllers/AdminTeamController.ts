import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import AdminTeamModel, { AdminTeamMember, AdminTeamRole } from "../models/AdminTeamModel";
import { ApiResponse } from "../types";
import { ALL_ADMIN_MODULES, ADMIN_MODULE_LABELS } from "../constants/adminModules";

const ROLES: AdminTeamRole[] = ["admin", "gerente", "tecnico", "user"];
const ROLE_LABELS: Record<AdminTeamRole, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  tecnico: "Técnico",
  user: "Usuário",
};

class AdminTeamController {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const list = await AdminTeamModel.findAll();
      return res.json({ success: true, data: list } as ApiResponse<AdminTeamMember[]>);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Erro ao listar equipe" });
    }
  }

  async getById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const u = await AdminTeamModel.findById(id);
      if (!u) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      const overrides = await AdminTeamModel.getModuleOverrides(id);
      return res.json({
        success: true,
        data: { ...u, module_overrides: overrides },
      } as ApiResponse<AdminTeamMember & { module_overrides: Record<string, boolean> }>);
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Erro ao buscar usuário" });
    }
  }

  async getModules(_req: AuthRequest, res: Response) {
    const modules = ALL_ADMIN_MODULES.map((key) => ({ key, label: ADMIN_MODULE_LABELS[key] || key }));
    return res.json({ success: true, data: modules });
  }

  async getDefaultModulesForRole(req: AuthRequest, res: Response) {
    try {
      const { role } = req.params;
      if (!ROLES.includes(role as AdminTeamRole)) {
        return res.status(400).json({ success: false, error: "Função inválida" });
      }
      const keys = await AdminTeamModel.getDefaultModulesForRole(role as AdminTeamRole);
      return res.json({ success: true, data: keys });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Erro ao buscar padrão" });
    }
  }

  async getModulePermissions(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const u = await AdminTeamModel.findById(id);
      if (!u) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      const overrides = await AdminTeamModel.getModuleOverrides(id);
      const modules = await AdminTeamModel.getModulesForUser(id, u.role);
      return res.json({
        success: true,
        data: { effective: modules, overrides, role: u.role },
      });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Erro ao buscar permissões" });
    }
  }

  async create(req: AuthRequest, res: Response) {
    try {
      const { email, password, name, role } = req.body;
      if (!email || !password || !name || !role) {
        return res.status(400).json({ success: false, error: "Email, senha, nome e função são obrigatórios" });
      }
      if (!ROLES.includes(role)) {
        return res.status(400).json({ success: false, error: "Função inválida. Use: admin, gerente, tecnico, user" });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: "A senha deve ter no mínimo 6 caracteres" });
      }
      const created = await AdminTeamModel.create({ email, password, name, role });
      return res.status(201).json({ success: true, data: created, message: "Usuário adicionado à equipe" });
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message || "Erro ao criar usuário" });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
      if (role != null && !ROLES.includes(role)) {
        return res.status(400).json({ success: false, error: "Função inválida" });
      }
      const updated = await AdminTeamModel.update(id, { name, email, role });
      if (!updated) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      return res.json({ success: true, data: updated, message: "Usuário atualizado" });
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message || "Erro ao atualizar" });
    }
  }

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      if (typeof active !== "boolean") {
        return res.status(400).json({ success: false, error: "active deve ser true ou false" });
      }
      const updated = await AdminTeamModel.updateStatus(id, active);
      if (!updated) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      return res.json({ success: true, data: updated, message: active ? "Usuário ativado" : "Usuário desativado" });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Erro ao alterar status" });
    }
  }

  async setPassword(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, error: "Nova senha deve ter no mínimo 6 caracteres" });
      }
      const ok = await AdminTeamModel.setPassword(id, newPassword);
      if (!ok) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      return res.json({ success: true, message: "Senha definida com sucesso" });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Erro ao definir senha" });
    }
  }

  async setModuleOverrides(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { overrides } = req.body as { overrides?: Record<string, boolean> };
      if (!overrides || typeof overrides !== "object") {
        return res.status(400).json({ success: false, error: "overrides deve ser um objeto { module_key: boolean }" });
      }
      const u = await AdminTeamModel.findById(id);
      if (!u) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      await AdminTeamModel.setModuleOverrides(id, overrides);
      const effective = await AdminTeamModel.getModulesForUser(id, u.role);
      return res.json({ success: true, data: { effective }, message: "Módulos atualizados" });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Erro ao atualizar módulos" });
    }
  }

  async duplicate(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ success: false, error: "E-mail, nome e senha são obrigatórios" });
      }
      if (password.length < 6) {
        return res.status(400).json({ success: false, error: "A senha deve ter no mínimo 6 caracteres" });
      }
      if (req.user?.id === id) {
        return res.status(400).json({ success: false, error: "Use «Adicionar usuário» para criar outro com seus dados" });
      }
      const created = await AdminTeamModel.duplicate(id, { email, name, password });
      return res.status(201).json({ success: true, data: created, message: "Usuário duplicado com mesma função e módulos" });
    } catch (e: any) {
      return res.status(400).json({ success: false, error: e.message || "Erro ao duplicar" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      if (req.user?.id === id) {
        return res.status(400).json({ success: false, error: "Você não pode remover a si mesmo" });
      }
      const ok = await AdminTeamModel.delete(id);
      if (!ok) return res.status(404).json({ success: false, error: "Usuário não encontrado" });
      return res.json({ success: true, message: "Usuário removido da equipe" });
    } catch (e: any) {
      return res.status(500).json({ success: false, error: e.message || "Erro ao remover" });
    }
  }
}

export const ROLES_LIST = ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] }));
export default new AdminTeamController();
