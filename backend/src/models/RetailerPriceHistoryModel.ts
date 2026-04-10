import pool from "../config/database";
import mysql2 from "mysql2";
import {
  PriceHistoryRecord,
  PriceChangeReport,
  ServicePriceVariance,
  PriceTrendPoint,
} from "../utils/priceHistoryUtils";

interface PriceHistoryInput {
  table_id: number;
  date: string;
  service_key: string;
  service_name: string;
  old_price: number | null;
  new_price: number;
  price_change_percent: number | null;
  price_change_amount: number | null;
  admin_user_id?: number | null;
  change_source?: string | null;
  notes?: string | null;
}

class RetailerPriceHistoryModel {
  private mapRow(row: mysql2.RowDataPacket): PriceHistoryRecord {
    return {
      id: Number(row.id),
      table_id: Number(row.table_id),
      date: row.date,
      service_key: row.service_key,
      service_name: row.service_name,
      old_price: row.old_price ? Number(row.old_price) : null,
      new_price: Number(row.new_price),
      price_change_percent: row.price_change_percent
        ? Number(row.price_change_percent)
        : null,
      price_change_amount: row.price_change_amount
        ? Number(row.price_change_amount)
        : null,
      admin_user_id: row.admin_user_id ? Number(row.admin_user_id) : null,
      change_source: row.change_source || null,
      notes: row.notes || null,
      recorded_at: row.recorded_at,
    };
  }

  /**
   * Insere múltiplas entradas de histórico de preço
   */
  async recordPriceChanges(changes: PriceHistoryInput[]): Promise<number> {
    if (changes.length === 0) return 0;

    const values = changes.map((change) => [
      change.table_id,
      change.date,
      change.service_key,
      change.service_name,
      change.old_price,
      change.new_price,
      change.price_change_percent,
      change.price_change_amount,
      change.admin_user_id || null,
      change.change_source || "manual_edit",
      change.notes || null,
    ]);

    const [result] = await pool.query<mysql2.ResultSetHeader>(
      `INSERT INTO retailer_price_history
       (table_id, date, service_key, service_name, old_price, new_price, 
        price_change_percent, price_change_amount, admin_user_id, change_source, notes)
       VALUES ?
       ON DUPLICATE KEY UPDATE 
         old_price = VALUES(old_price),
         new_price = VALUES(new_price),
         price_change_percent = VALUES(price_change_percent),
         price_change_amount = VALUES(price_change_amount)`,
      [values]
    );

    return result.affectedRows;
  }

  /**
   * Busca histórico de preço de um serviço específico
   */
  async getServicePriceTrend(
    tableId: number,
    serviceKey: string,
    days = 90
  ): Promise<PriceTrendPoint[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT date, new_price, price_change_percent
       FROM retailer_price_history
       WHERE table_id = ? AND service_key = ? AND date >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY date ASC`,
      [tableId, serviceKey, days]
    );

    return rows.map((row) => ({
      date: row.date,
      price: Number(row.new_price),
      change_percent: row.price_change_percent ? Number(row.price_change_percent) : undefined,
    }));
  }

  /**
   * Busca histórico de preço completo de uma tabela
   */
  async getTablePriceHistory(
    tableId: number,
    limit = 100,
    offset = 0
  ): Promise<PriceHistoryRecord[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT * FROM retailer_price_history
       WHERE table_id = ?
       ORDER BY date DESC, recorded_at DESC
       LIMIT ? OFFSET ?`,
      [tableId, limit, offset]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Busca relatório de mudanças por dia
   */
  async getDailyChangeReport(
    tableId: number,
    startDate?: string,
    endDate?: string
  ): Promise<PriceChangeReport[]> {
    let query = `SELECT 
      date,
      COUNT(DISTINCT service_key) as services_changed,
      COUNT(CASE WHEN price_change_percent > 0 THEN 1 END) as price_increases,
      COUNT(CASE WHEN price_change_percent < 0 THEN 1 END) as price_decreases,
      AVG(ABS(price_change_percent)) as avg_change_percent,
      SUM(CASE WHEN price_change_amount > 0 THEN price_change_amount ELSE 0 END) as total_increase_amount,
      SUM(CASE WHEN price_change_amount < 0 THEN ABS(price_change_amount) ELSE 0 END) as total_decrease_amount
    FROM retailer_price_history
    WHERE table_id = ?`;

    const params: any[] = [tableId];

    if (startDate) {
      query += " AND date >= ?";
      params.push(startDate);
    }

    if (endDate) {
      query += " AND date <= ?";
      params.push(endDate);
    }

    query += " GROUP BY date ORDER BY date DESC";

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(query, params);

    return rows.map((row) => ({
      date: row.date,
      services_changed: Number(row.services_changed),
      price_increases: Number(row.price_increases),
      price_decreases: Number(row.price_decreases),
      avg_change_percent: row.avg_change_percent ? Number(row.avg_change_percent) : 0,
      total_increase_amount: row.total_increase_amount
        ? Number(row.total_increase_amount)
        : 0,
      total_decrease_amount: row.total_decrease_amount
        ? Number(row.total_decrease_amount)
        : 0,
    }));
  }

  /**
   * Identifica serviços com maior variação de preço (volatilidade)
   */
  async getMostVolatileServices(
    tableId: number,
    limit = 20
  ): Promise<ServicePriceVariance[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT 
        service_key,
        service_name,
        COUNT(*) as change_count,
        AVG(new_price) as avg_price,
        MIN(new_price) as min_price,
        MAX(new_price) as max_price,
        (MAX(new_price) - MIN(new_price)) as price_range,
        ((MAX(new_price) - MIN(new_price)) / AVG(new_price) * 100) as volatility_percent,
        MAX(date) as last_changed,
        MIN(date) as first_recorded
      FROM retailer_price_history
      WHERE table_id = ?
      GROUP BY service_key, service_name
      HAVING change_count > 1
      ORDER BY volatility_percent DESC, change_count DESC
      LIMIT ?`,
      [tableId, limit]
    );

    return rows.map((row) => ({
      service_key: row.service_key,
      service_name: row.service_name,
      change_count: Number(row.change_count),
      avg_price: Number(row.avg_price),
      min_price: Number(row.min_price),
      max_price: Number(row.max_price),
      price_range: Number(row.price_range),
      volatility_percent: Number(row.volatility_percent),
      last_changed: row.last_changed,
      first_recorded: row.first_recorded,
    }));
  }

  /**
   * Busca serviços com maior aumento de preço
   */
  async getPriceIncreases(
    tableId: number,
    days = 30,
    limit = 20
  ): Promise<PriceHistoryRecord[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT * FROM retailer_price_history
       WHERE table_id = ? 
         AND date >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND price_change_percent > 0
       ORDER BY price_change_percent DESC
       LIMIT ?`,
      [tableId, days, limit]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Busca serviços com maior redução de preço
   */
  async getPriceDecreases(
    tableId: number,
    days = 30,
    limit = 20
  ): Promise<PriceHistoryRecord[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT * FROM retailer_price_history
       WHERE table_id = ? 
         AND date >= DATE_SUB(NOW(), INTERVAL ? DAY)
         AND price_change_percent < 0
       ORDER BY price_change_percent ASC
       LIMIT ?`,
      [tableId, days, limit]
    );

    return rows.map((row) => this.mapRow(row));
  }

  /**
   * Busca estatísticas gerais de mudanças de preço
   */
  async getPriceChangeStats(tableId: number, days = 30): Promise<{
    total_changes: number;
    unique_services: number;
    total_increases: number;
    total_decreases: number;
    avg_increase_percent: number;
    avg_decrease_percent: number;
    max_increase_percent: number;
    max_decrease_percent: number;
    total_increase_value: number;
    total_decrease_value: number;
  }> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total_changes,
        COUNT(DISTINCT service_key) as unique_services,
        SUM(CASE WHEN price_change_percent > 0 THEN 1 ELSE 0 END) as total_increases,
        SUM(CASE WHEN price_change_percent < 0 THEN 1 ELSE 0 END) as total_decreases,
        AVG(CASE WHEN price_change_percent > 0 THEN price_change_percent ELSE NULL END) as avg_increase_percent,
        AVG(CASE WHEN price_change_percent < 0 THEN price_change_percent ELSE NULL END) as avg_decrease_percent,
        MAX(CASE WHEN price_change_percent > 0 THEN price_change_percent ELSE NULL END) as max_increase_percent,
        MIN(CASE WHEN price_change_percent < 0 THEN price_change_percent ELSE NULL END) as max_decrease_percent,
        SUM(CASE WHEN price_change_amount > 0 THEN price_change_amount ELSE 0 END) as total_increase_value,
        SUM(CASE WHEN price_change_amount < 0 THEN ABS(price_change_amount) ELSE 0 END) as total_decrease_value
      FROM retailer_price_history
      WHERE table_id = ? AND date >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [tableId, days]
    );

    const stats = rows[0] || {};

    return {
      total_changes: Number(stats.total_changes || 0),
      unique_services: Number(stats.unique_services || 0),
      total_increases: Number(stats.total_increases || 0),
      total_decreases: Number(stats.total_decreases || 0),
      avg_increase_percent: stats.avg_increase_percent
        ? Number(stats.avg_increase_percent)
        : 0,
      avg_decrease_percent: stats.avg_decrease_percent
        ? Number(stats.avg_decrease_percent)
        : 0,
      max_increase_percent: stats.max_increase_percent
        ? Number(stats.max_increase_percent)
        : 0,
      max_decrease_percent: stats.max_decrease_percent
        ? Number(stats.max_decrease_percent)
        : 0,
      total_increase_value: stats.total_increase_value
        ? Number(stats.total_increase_value)
        : 0,
      total_decrease_value: stats.total_decrease_value
        ? Number(stats.total_decrease_value)
        : 0,
    };
  }
}

export default new RetailerPriceHistoryModel();
