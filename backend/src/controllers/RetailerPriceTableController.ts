import { Response } from "express";
import RetailerPriceTableModel from "../models/RetailerPriceTableModel";
import { AuthRequest } from "../middleware/auth";

class RetailerPriceTableController {
  async getAdminList(_req: AuthRequest, res: Response) {
    try {
      const records = await RetailerPriceTableModel.findAll();
      return res.json({ success: true, data: records });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao listar tabelas" });
    }
  }

  async getRetailerList(_req: AuthRequest, res: Response) {
    try {
      const records = await RetailerPriceTableModel.findAllVisible();
      return res.json({ success: true, data: records });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao listar tabelas" });
    }
  }

  async getAdminBySlug(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const record = await RetailerPriceTableModel.findBySlug(slug);

      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      return res.json({ success: true, data: record });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao buscar tabela" });
    }
  }

  async upsert(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const { title, effectiveDate, visibleToRetailers = true, featuredToRetailers = false, rawText } = req.body || {};

      if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
        return res.status(400).json({ success: false, error: "Informe o texto bruto da tabela para importar" });
      }

      const record = await RetailerPriceTableModel.upsert({
        slug,
        title,
        effectiveDate,
        visibleToRetailers: Boolean(visibleToRetailers),
        featuredToRetailers: Boolean(featuredToRetailers),
        rawText,
      });

      return res.json({
        success: true,
        data: record,
        message: "Tabela de preços salva com sucesso",
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao salvar tabela" });
    }
  }

  async getRetailerActive(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const record = await RetailerPriceTableModel.findVisibleBySlug(slug);

      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela de preços não disponível" });
      }

      return res.json({ success: true, data: record });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao buscar tabela" });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const deleted = await RetailerPriceTableModel.deleteBySlug(slug);

      if (!deleted) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      return res.json({ success: true, message: "Tabela removida com sucesso" });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao remover tabela" });
    }
  }

  async reorder(req: AuthRequest, res: Response) {
    try {
      const { slugs } = req.body || {};

      if (!Array.isArray(slugs) || slugs.length === 0 || slugs.some((slug) => typeof slug !== "string")) {
        return res.status(400).json({ success: false, error: "Informe a lista de slugs para reordenar" });
      }

      const records = await RetailerPriceTableModel.reorder(slugs);
      return res.json({ success: true, data: records, message: "Ordem atualizada com sucesso" });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao reordenar tabelas" });
    }
  }
}

export default new RetailerPriceTableController();
