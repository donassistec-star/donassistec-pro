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
  raw_text: string;
  service_templates: RetailerPriceTableServiceTemplate[];
  parsed_data: ParsedRetailerPriceTable;
  created_at?: string;
  updated_at?: string;
}

class RetailerPriceTableModel {
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
      raw_text: row.raw_text,
      service_templates: this.normalizeServiceTemplates(serviceTemplates),
      parsed_data: parsed,
      created_at: row.created_at,
      updated_at: row.updated_at,
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

  async upsert(data: {
    slug: string;
    title?: string;
    effectiveDate?: string | null;
    visibleToRetailers: boolean;
    featuredToRetailers?: boolean;
    rawText: string;
    serviceTemplates?: RetailerPriceTableServiceTemplate[];
  }): Promise<RetailerPriceTableRecord> {
    const parsed = parseRetailerPriceTable(data.rawText);
    const title = data.title?.trim() || parsed.title || "Tabela de Preços";
    const effectiveDate = data.effectiveDate?.trim() || parsed.effectiveDate || null;
    const existing = await this.findBySlug(data.slug);
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
      [data.slug, title, effectiveDate, data.visibleToRetailers, featuredToRetailers, sortOrder, data.rawText, parsedJson, serviceTemplatesJson]
    );

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
}

export default new RetailerPriceTableModel();
