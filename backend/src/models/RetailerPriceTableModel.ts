import pool from "../config/database";
import mysql2 from "mysql2";
import {
  ParsedRetailerPriceTable,
  parseRetailerPriceTable,
} from "../utils/retailerPriceTableParser";

export interface RetailerPriceTableServiceTemplate {
  id: string;
  name: string;
  serviceNames: string[];
}

export interface RetailerPriceTableRecord {
  id: number;
  slug: string;
  title: string;
  effective_date: string | null;
  visible_to_retailers: boolean;
  featured_to_retailers: boolean;
  sort_order: number;
  version: number;
  changed_by?: number | null;
  change_reason?: string | null;
  raw_text: string;
  service_templates: RetailerPriceTableServiceTemplate[];
  parsed_data: ParsedRetailerPriceTable;
  created_at?: string;
  updated_at?: string;
}

export interface RetailerPriceTableHistoryRecord {
  id: number;
  table_id: number;
  version: number;
  slug: string;
  title: string;
  effective_date: string | null;
  raw_text: string;
  parsed_data: ParsedRetailerPriceTable;
  service_templates: RetailerPriceTableServiceTemplate[];
  visible_to_retailers: boolean;
  featured_to_retailers: boolean;
  changed_by?: number | null;
  change_reason?: string | null;
  created_at: string;
}

export interface VersionDiffInfo {
  currentVersion: number;
  previousVersion: number;
  changes: {
    title?: { old: string; new: string };
    visible_to_retailers?: { old: boolean; new: boolean };
    featured_to_retailers?: { old: boolean; new: boolean };
    effective_date?: { old: string | null; new: string | null };
    prices_changed?: number;
  };
}

class RetailerPriceTableModel {
  private async supportsVersioningColumns(): Promise<boolean> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = 'retailer_price_tables'
         AND column_name IN ('version', 'changed_by', 'change_reason')`
    );

    return Number(rows[0]?.total || 0) === 3;
  }

  private async supportsHistoryTable(): Promise<boolean> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM information_schema.tables
       WHERE table_schema = DATABASE()
         AND table_name = 'retailer_price_tables_history'`
    );

    return Number(rows[0]?.total || 0) > 0;
  }

  private normalizeServiceTemplates(input: unknown): RetailerPriceTableServiceTemplate[] {
    if (!Array.isArray(input)) return [];

    return input
      .map((item, index) => {
        if (!item || typeof item !== "object") return null;

        const template = item as Record<string, unknown>;
        const serviceNames = Array.isArray(template.serviceNames)
          ? Array.from(
              new Set(
                template.serviceNames
                  .map((serviceName) => (typeof serviceName === "string" ? serviceName.replace(/\s+/g, " ").trim() : ""))
                  .filter(Boolean)
              )
            )
          : [];

        const name =
          typeof template.name === "string" ? template.name.replace(/\s+/g, " ").trim() : "";

        if (!name || serviceNames.length === 0) return null;

        return {
          id:
            typeof template.id === "string" && template.id.trim().length > 0
              ? template.id.trim()
              : `template-${index + 1}`,
          name,
          serviceNames,
        };
      })
      .filter((template): template is RetailerPriceTableServiceTemplate => Boolean(template));
  }

  private mapRow(row: mysql2.RowDataPacket): RetailerPriceTableRecord {
    const parsed =
      typeof row.parsed_data === "string"
        ? JSON.parse(row.parsed_data)
        : row.parsed_data;
    const serviceTemplates =
      typeof row.service_templates === "string"
        ? JSON.parse(row.service_templates)
        : row.service_templates;

    return {
      id: Number(row.id),
      slug: row.slug,
      title: row.title,
      effective_date: row.effective_date,
      visible_to_retailers: Boolean(row.visible_to_retailers),
      featured_to_retailers: Boolean(row.featured_to_retailers),
      sort_order: Number(row.sort_order || 0),
      version: Number(row.version || 1),
      changed_by: row.changed_by ? Number(row.changed_by) : null,
      change_reason: row.change_reason || null,
      raw_text: row.raw_text,
      service_templates: this.normalizeServiceTemplates(serviceTemplates),
      parsed_data: parsed,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private mapHistoryRow(row: mysql2.RowDataPacket): RetailerPriceTableHistoryRecord {
    const parsed =
      typeof row.parsed_data === "string"
        ? JSON.parse(row.parsed_data)
        : row.parsed_data;
    const serviceTemplates =
      typeof row.service_templates === "string"
        ? JSON.parse(row.service_templates)
        : row.service_templates;

    return {
      id: Number(row.id),
      table_id: Number(row.table_id),
      version: Number(row.version),
      slug: row.slug,
      title: row.title,
      effective_date: row.effective_date,
      raw_text: row.raw_text,
      parsed_data: parsed,
      service_templates: this.normalizeServiceTemplates(serviceTemplates),
      visible_to_retailers: Boolean(row.visible_to_retailers),
      featured_to_retailers: Boolean(row.featured_to_retailers),
      changed_by: row.changed_by ? Number(row.changed_by) : null,
      change_reason: row.change_reason || null,
      created_at: row.created_at,
    };
  }

  async findAll(): Promise<RetailerPriceTableRecord[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM retailer_price_tables ORDER BY featured_to_retailers DESC, sort_order ASC, updated_at DESC, id DESC"
    );

    return rows.map((row) => this.mapRow(row));
  }

  async findAllVisible(): Promise<RetailerPriceTableRecord[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM retailer_price_tables WHERE visible_to_retailers = TRUE ORDER BY featured_to_retailers DESC, sort_order ASC, updated_at DESC, id DESC"
    );

    return rows.map((row) => this.mapRow(row));
  }

  async findBySlug(slug: string): Promise<RetailerPriceTableRecord | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM retailer_price_tables WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findVisibleBySlug(slug: string): Promise<RetailerPriceTableRecord | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM retailer_price_tables WHERE slug = ? AND visible_to_retailers = TRUE LIMIT 1",
      [slug]
    );

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]);
  }

  async deleteBySlug(slug: string): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "DELETE FROM retailer_price_tables WHERE slug = ?",
      [slug]
    );
    return result.affectedRows > 0;
  }

  async upsert(
    data: {
      slug: string;
      title?: string;
      effectiveDate?: string | null;
      visibleToRetailers: boolean;
      featuredToRetailers?: boolean;
      rawText: string;
      serviceTemplates?: RetailerPriceTableServiceTemplate[];
    },
    metadata?: {
      changedBy?: number | null;
      changeReason?: string | null;
    }
  ): Promise<RetailerPriceTableRecord> {
    const parsed = parseRetailerPriceTable(data.rawText);
    const title = data.title?.trim() || parsed.title || "Tabela de Preços";
    const effectiveDate = data.effectiveDate?.trim() || parsed.effectiveDate || null;
    const existing = await this.findBySlug(data.slug);
    const supportsVersioning = await this.supportsVersioningColumns();
    const featuredToRetailers = Boolean(
      data.visibleToRetailers && (data.featuredToRetailers ?? existing?.featured_to_retailers ?? false)
    );
    const sortOrder = existing?.sort_order ?? (await this.getNextSortOrder());
    const parsedJson = JSON.stringify({
      ...parsed,
      title,
      effectiveDate,
    });
    const serviceTemplatesJson = JSON.stringify(
      this.normalizeServiceTemplates(data.serviceTemplates ?? existing?.service_templates ?? [])
    );

    if (featuredToRetailers) {
      await pool.execute(
        "UPDATE retailer_price_tables SET featured_to_retailers = FALSE, updated_at = CURRENT_TIMESTAMP WHERE slug <> ?",
        [data.slug]
      );
    }

    if (supportsVersioning) {
      await pool.execute(
        `INSERT INTO retailer_price_tables (slug, title, effective_date, visible_to_retailers, featured_to_retailers, sort_order, raw_text, parsed_data, service_templates, changed_by, change_reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           effective_date = VALUES(effective_date),
           visible_to_retailers = VALUES(visible_to_retailers),
           featured_to_retailers = VALUES(featured_to_retailers),
           raw_text = VALUES(raw_text),
           parsed_data = VALUES(parsed_data),
           service_templates = VALUES(service_templates),
           version = version + 1,
           changed_by = VALUES(changed_by),
           change_reason = VALUES(change_reason),
           updated_at = CURRENT_TIMESTAMP`,
        [
          data.slug,
          title,
          effectiveDate,
          data.visibleToRetailers,
          featuredToRetailers,
          sortOrder,
          data.rawText,
          parsedJson,
          serviceTemplatesJson,
          metadata?.changedBy || null,
          metadata?.changeReason || null,
        ]
      );
    } else {
      await pool.execute(
        `INSERT INTO retailer_price_tables (slug, title, effective_date, visible_to_retailers, featured_to_retailers, sort_order, raw_text, parsed_data, service_templates)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           effective_date = VALUES(effective_date),
           visible_to_retailers = VALUES(visible_to_retailers),
           featured_to_retailers = VALUES(featured_to_retailers),
           raw_text = VALUES(raw_text),
           parsed_data = VALUES(parsed_data),
           service_templates = VALUES(service_templates),
           updated_at = CURRENT_TIMESTAMP`,
        [
          data.slug,
          title,
          effectiveDate,
          data.visibleToRetailers,
          featuredToRetailers,
          sortOrder,
          data.rawText,
          parsedJson,
          serviceTemplatesJson,
        ]
      );
    }

    const updated = await this.findBySlug(data.slug);
    if (!updated) throw new Error("Erro ao carregar tabela de preços salva");
    return updated;
  }

  private async getNextSortOrder(): Promise<number> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order FROM retailer_price_tables"
    );

    return Number(rows[0]?.next_sort_order || 1);
  }

  async reorder(slugs: string[]): Promise<RetailerPriceTableRecord[]> {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (let index = 0; index < slugs.length; index += 1) {
        await connection.execute(
          "UPDATE retailer_price_tables SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE slug = ?",
          [index + 1, slugs[index]]
        );
      }

      await connection.commit();
      return this.findAll();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findHistory(tableId: number, limit = 50): Promise<RetailerPriceTableHistoryRecord[]> {
    if (!(await this.supportsHistoryTable())) return [];

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT * FROM retailer_price_tables_history 
       WHERE table_id = ? 
       ORDER BY version DESC 
       LIMIT ?`,
      [tableId, limit]
    );

    return rows.map((row) => this.mapHistoryRow(row));
  }

  async findHistoryBySlug(slug: string, limit = 50): Promise<RetailerPriceTableHistoryRecord[]> {
    const existing = await this.findBySlug(slug);
    if (!existing) return [];
    return this.findHistory(existing.id, limit);
  }

  async findHistoryVersion(tableId: number, version: number): Promise<RetailerPriceTableHistoryRecord | null> {
    if (!(await this.supportsHistoryTable())) return null;

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT * FROM retailer_price_tables_history 
       WHERE table_id = ? AND version = ? 
       LIMIT 1`,
      [tableId, version]
    );

    if (rows.length === 0) return null;
    return this.mapHistoryRow(rows[0]);
  }

  async rollbackToVersion(
    slug: string,
    version: number,
    rollbackBy?: number,
    rollbackReason?: string
  ): Promise<RetailerPriceTableRecord> {
    const existing = await this.findBySlug(slug);
    if (!existing) throw new Error("Tabela não encontrada");

    const historyRecord = await this.findHistoryVersion(existing.id, version);
    if (!historyRecord) throw new Error(`Versão ${version} não encontrada`);

    return this.upsert(
      {
        slug,
        title: historyRecord.title,
        effectiveDate: historyRecord.effective_date,
        visibleToRetailers: historyRecord.visible_to_retailers,
        featuredToRetailers: historyRecord.featured_to_retailers,
        rawText: historyRecord.raw_text,
        serviceTemplates: historyRecord.service_templates,
      },
      {
        changedBy: rollbackBy || null,
        changeReason: rollbackReason || `Revertido da versão ${version}`,
      }
    );
  }

  async getVersionComparison(
    tableId: number,
    version1: number,
    version2: number
  ): Promise<VersionDiffInfo | null> {
    const h1 = await this.findHistoryVersion(tableId, version1);
    const h2 = await this.findHistoryVersion(tableId, version2);

    if (!h1 || !h2) return null;

    const changes: VersionDiffInfo["changes"] = {};

    if (h1.title !== h2.title) {
      changes.title = { old: h1.title, new: h2.title };
    }

    if (h1.visible_to_retailers !== h2.visible_to_retailers) {
      changes.visible_to_retailers = {
        old: h1.visible_to_retailers,
        new: h2.visible_to_retailers,
      };
    }

    if (h1.featured_to_retailers !== h2.featured_to_retailers) {
      changes.featured_to_retailers = {
        old: h1.featured_to_retailers,
        new: h2.featured_to_retailers,
      };
    }

    if (h1.effective_date !== h2.effective_date) {
      changes.effective_date = {
        old: h1.effective_date,
        new: h2.effective_date,
      };
    }

    // Count price differences
    const items1 = h1.parsed_data?.categories || [];
    const items2 = h2.parsed_data?.categories || [];
    let pricesChanged = 0;

    if (items1.length > 0 && items2.length > 0) {
      const prices1 = new Map(
        items1
          .flatMap((cat) => cat.items)
          .map((item) => [item.name, item.priceText])
      );
      const prices2 = new Map(
        items2
          .flatMap((cat) => cat.items)
          .map((item) => [item.name, item.priceText])
      );

      prices1.forEach((price1, name) => {
        const price2 = prices2.get(name);
        if (price2 !== price1) pricesChanged++;
      });
    }

    if (pricesChanged > 0) {
      changes.prices_changed = pricesChanged;
    }

    return {
      currentVersion: version2,
      previousVersion: version1,
      changes,
    };
  }
}

export default new RetailerPriceTableModel();
