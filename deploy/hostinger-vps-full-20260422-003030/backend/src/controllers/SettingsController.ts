import { Request, Response } from "express";
import SettingsModel from "../models/SettingsModel";
import { AuthRequest } from "../middleware/auth";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class SettingsController {
  /** Configurações públicas (contato, branding, redes) – sem autenticação */
  async getPublic(_req: Request, res: Response) {
    try {
      const settings = await SettingsModel.getPublic();
      const response: ApiResponse<typeof settings> = { success: true, data: settings };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar configurações públicas",
      };
      res.status(500).json(response);
    }
  }

  /** Favicon público usado pelo HTML inicial e por crawlers */
  async getFavicon(_req: Request, res: Response) {
    try {
      const favicon = await SettingsModel.getByKey("brandingLogoFavicon");
      const nextUrl = favicon?.trim() || "/favicon.ico";

      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      return res.redirect(302, nextUrl);
    } catch (error: any) {
      const response: ApiResponse<null> = {
        success: false,
        error: error.message || "Erro ao buscar favicon",
      };
      return res.status(500).json(response);
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const settings = await SettingsModel.getAll();
      const response: ApiResponse<typeof settings> = { success: true, data: settings };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { 
        success: false, 
        error: error.message || "Erro ao buscar configurações" 
      };
      res.status(500).json(response);
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const settings = req.body;

      if (!settings || typeof settings !== "object") {
        const response: ApiResponse<null> = { 
          success: false, 
          error: "Configurações inválidas" 
        };
        return res.status(400).json(response);
      }

      // Validações básicas
      const validationErrors: string[] = [];
      
      if (settings.siteName && settings.siteName.length < 3) {
        validationErrors.push("Nome do site deve ter no mínimo 3 caracteres");
      }
      
      if (settings.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.supportEmail)) {
        validationErrors.push("E-mail de suporte inválido");
      }
      
      if (settings.smtpPort && (settings.smtpPort < 1 || settings.smtpPort > 65535)) {
        validationErrors.push("Porta SMTP deve estar entre 1 e 65535");
      }
      
      if (settings.sessionTimeout && (settings.sessionTimeout < 300 || settings.sessionTimeout > 86400)) {
        validationErrors.push("Timeout de sessão deve estar entre 300 e 86400 segundos");
      }
      
      if (validationErrors.length > 0) {
        const response: ApiResponse<null> = { 
          success: false, 
          error: validationErrors.join("; ") 
        };
        return res.status(400).json(response);
      }

      await SettingsModel.updateMany(
        settings,
        req.user?.id,
        req.user?.email
      );
      const updatedSettings = await SettingsModel.getAll();
      
      const response: ApiResponse<typeof updatedSettings> = { 
        success: true, 
        data: updatedSettings,
        message: "Configurações atualizadas com sucesso"
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { 
        success: false, 
        error: error.message || "Erro ao atualizar configurações" 
      };
      res.status(500).json(response);
    }
  }

  async getHistory(req: AuthRequest, res: Response) {
    try {
      const settingKey = req.query.settingKey as string | undefined;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const history = await SettingsModel.getHistory(settingKey, limit);
      
      const response: ApiResponse<any[]> = { 
        success: true, 
        data: history 
      };
      res.json(response);
    } catch (error: any) {
      const response: ApiResponse<null> = { 
        success: false, 
        error: error.message || "Erro ao buscar histórico" 
      };
      res.status(500).json(response);
    }
  }
}

export default new SettingsController();
