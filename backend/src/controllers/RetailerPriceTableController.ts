import { Response } from "express";
import RetailerPriceTableModel from "../models/RetailerPriceTableModel";
import RetailerPriceHistoryModel from "../models/RetailerPriceHistoryModel";
import { AuthRequest } from "../middleware/auth";
import { validateRetailerPriceTable } from "../utils/retailerPriceTableValidation";
import {
  extractPricesFromParsed,
  compareSnapshots,
} from "../utils/priceHistoryUtils";

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
      const {
        title,
        effectiveDate,
        visibleToRetailers = true,
        featuredToRetailers = false,
        rawText,
        serviceTemplates = [],
      } = req.body || {};

      console.log(`[upsert] Recebida requisição para slug: ${slug}, rawText length: ${rawText?.length || 0}`);

      if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
        return res.status(400).json({ success: false, error: "Informe o texto bruto da tabela para importar" });
      }

      let validation;
      try {
        validation = validateRetailerPriceTable({
          title,
          rawText,
          visibleToRetailers: Boolean(visibleToRetailers),
          featuredToRetailers: Boolean(featuredToRetailers),
        });
      } catch (validationError: any) {
        console.error("[upsert] Erro na validação:", validationError.message);
        return res.status(400).json({ success: false, error: "Erro ao validar tabela: " + validationError.message });
      }

      if (validation.issues.length > 0) {
        return res.status(400).json({
          success: false,
          error: validation.issues[0].label,
        });
      }

      const adminId = (req as any).user?.id ?? null;
      const previousRecord = await RetailerPriceTableModel.findBySlug(slug);

      let record;
      try {
        record = await RetailerPriceTableModel.upsert({
          slug,
          title,
          effectiveDate,
          visibleToRetailers: Boolean(visibleToRetailers),
          featuredToRetailers: Boolean(featuredToRetailers),
          rawText,
          serviceTemplates: Array.isArray(serviceTemplates) ? serviceTemplates : [],
        }, {
          changedBy: adminId,
          changeReason: previousRecord ? "Atualização manual via painel admin" : "Criação manual via painel admin",
        });
      } catch (upsertError: any) {
        console.error("[upsert] Erro no upsert:", upsertError.message, upsertError.stack);
        return res.status(500).json({ success: false, error: "Erro ao salvar tabela: " + upsertError.message });
      }

      // Track price changes for analytics
      try {
        if (previousRecord && record.id) {
          const oldPrices = previousRecord.parsed_data
            ? extractPricesFromParsed(previousRecord.parsed_data)
            : new Map();
          const newPrices = record.parsed_data
            ? extractPricesFromParsed(record.parsed_data)
            : new Map();

          const changes = compareSnapshots(
            oldPrices,
            newPrices,
            previousRecord.parsed_data || null,
            record.parsed_data
          );

          if (changes.length > 0) {
            await Promise.all(
              changes.map((change) =>
                RetailerPriceHistoryModel.recordPriceChanges([
                  {
                    ...change,
                    table_id: record.id,
                    admin_user_id: adminId,
                    change_source: "manual_edit",
                  },
                ])
              )
            );
          }
        }
      } catch (historyError) {
        console.error("Erro ao registrar histórico de preços:", historyError);
        // Não falha a requisição se histórico falhar
      }

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

  async getHistory(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const limit = req.query.limit ? Math.min(Number(req.query.limit), 100) : 50;

      const history = await RetailerPriceTableModel.findHistoryBySlug(slug, limit);

      if (history.length === 0) {
        return res.status(404).json({ success: false, error: "Nenhum histórico encontrado para esta tabela" });
      }

      return res.json({
        success: true,
        data: history,
        message: `${history.length} versões encontradas`,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao buscar histórico" });
    }
  }

  async getHistoryVersion(req: AuthRequest, res: Response) {
    try {
      const { slug, version } = req.params;
      const versionNum = Number(version);

      if (isNaN(versionNum) || versionNum < 1) {
        return res.status(400).json({ success: false, error: "Versão inválida" });
      }

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const historyRecord = await RetailerPriceTableModel.findHistoryVersion(record.id, versionNum);
      if (!historyRecord) {
        return res.status(404).json({ success: false, error: `Versão ${versionNum} não encontrada` });
      }

      return res.json({
        success: true,
        data: historyRecord,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message || "Erro ao buscar versão" });
    }
  }

  async rollbackToVersion(req: AuthRequest, res: Response) {
    try {
      const { slug, version } = req.params;
      const { reason } = req.body || {};
      const versionNum = Number(version);

      if (isNaN(versionNum) || versionNum < 1) {
        return res.status(400).json({ success: false, error: "Versão inválida" });
      }

      const adminId = (req as any).user?.id;

      const record = await RetailerPriceTableModel.rollbackToVersion(
        slug,
        versionNum,
        adminId,
        reason || `Revertido para versão ${versionNum} via API`
      );

      return res.json({
        success: true,
        data: record,
        message: `Tabela revertida para versão ${versionNum} com sucesso`,
      });
    } catch (error: any) {
      if (error.message.includes("não encontrada")) {
        return res.status(404).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: error.message || "Erro ao reverter tabela" });
    }
  }

  async getVersionComparison(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const { version1, version2 } = req.query;

      const v1 = Number(version1);
      const v2 = Number(version2);

      if (isNaN(v1) || isNaN(v2) || v1 < 1 || v2 < 1) {
        return res.status(400).json({ success: false, error: "Versões inválidas. Informe version1 e version2" });
      }

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const comparison = await RetailerPriceTableModel.getVersionComparison(record.id, v1, v2);
      if (!comparison) {
        return res.status(404).json({
          success: false,
          error: `Uma ou ambas as versões (${v1}, ${v2}) não foram encontradas`,
        });
      }

      return res.json({
        success: true,
        data: comparison,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao comparar versões",
      });
    }
  }

  // Price History & Analytics Endpoints

  async getPriceHistory(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const limit = Math.min(Number(req.query.limit) || 100, 500);
      const offset = Number(req.query.offset) || 0;

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const history = await RetailerPriceHistoryModel.getTablePriceHistory(record.id, limit, offset);

      return res.json({
        success: true,
        data: history,
        message: `${history.length} registros de mudança encontrados`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao buscar histórico de preços",
      });
    }
  }

  async getPriceTrend(req: AuthRequest, res: Response) {
    try {
      const { slug, serviceKey } = req.params;
      const days = Math.min(Number(req.query.days) || 90, 365);

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const trend = await RetailerPriceHistoryModel.getServicePriceTrend(
        record.id,
        serviceKey,
        days
      );

      if (trend.length === 0) {
        return res.status(404).json({
          success: false,
          error: `Nenhum histórico encontrado para serviço: ${serviceKey}`,
        });
      }

      return res.json({
        success: true,
        data: trend,
        message: `${trend.length} pontos históricos encontrados`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao buscar tendência de preço",
      });
    }
  }

  async getPriceStats(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const days = Math.min(Number(req.query.days) || 30, 365);

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const stats = await RetailerPriceHistoryModel.getPriceChangeStats(record.id, days);

      return res.json({
        success: true,
        data: stats,
        message: `Estatísticas dos últimos ${days} dias`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao buscar estatísticas",
      });
    }
  }

  async getDailyReport(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const report = await RetailerPriceHistoryModel.getDailyChangeReport(
        record.id,
        startDate,
        endDate
      );

      return res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao buscar relatório diário",
      });
    }
  }

  async getVolatileServices(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const limit = Math.min(Number(req.query.limit) || 20, 100);

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const volatile = await RetailerPriceHistoryModel.getMostVolatileServices(
        record.id,
        limit
      );

      return res.json({
        success: true,
        data: volatile,
        message: `${volatile.length} serviços com maior volatilidade`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao buscar serviços voláteis",
      });
    }
  }

  async getTopIncreases(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const days = Math.min(Number(req.query.days) || 30, 365);
      const limit = Math.min(Number(req.query.limit) || 20, 100);

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const increases = await RetailerPriceHistoryModel.getPriceIncreases(
        record.id,
        days,
        limit
      );

      return res.json({
        success: true,
        data: increases,
        message: `${increases.length} maiores aumentos nos últimos ${days} dias`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao buscar aumentos",
      });
    }
  }

  async getTopDecreases(req: AuthRequest, res: Response) {
    try {
      const { slug } = req.params;
      const days = Math.min(Number(req.query.days) || 30, 365);
      const limit = Math.min(Number(req.query.limit) || 20, 100);

      const record = await RetailerPriceTableModel.findBySlug(slug);
      if (!record) {
        return res.status(404).json({ success: false, error: "Tabela não encontrada" });
      }

      const decreases = await RetailerPriceHistoryModel.getPriceDecreases(
        record.id,
        days,
        limit
      );

      return res.json({
        success: true,
        data: decreases,
        message: `${decreases.length} maiores reduções nos últimos ${days} dias`,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Erro ao buscar reduções",
      });
    }
  }
}

export default new RetailerPriceTableController();
