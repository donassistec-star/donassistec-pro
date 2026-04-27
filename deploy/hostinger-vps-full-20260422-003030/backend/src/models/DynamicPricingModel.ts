import pool from "../config/database";
import mysql2 from "mysql2";

export interface DynamicPricing {
  id?: string;
  model_id: string;
  min_quantity: number;
  max_quantity?: number;
  price: number;
  discount_percentage?: number;
  valid_from?: string;
  valid_until?: string;
  created_at?: string;
  updated_at?: string;
}

class DynamicPricingModel {
  async findByModel(modelId: string): Promise<DynamicPricing[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM dynamic_pricing WHERE model_id = ? ORDER BY min_quantity ASC",
      [modelId]
    );
    return rows as DynamicPricing[];
  }

  async findByModelAndQuantity(modelId: string, quantity: number): Promise<DynamicPricing | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT * FROM dynamic_pricing 
       WHERE model_id = ? 
       AND min_quantity <= ? 
       AND (max_quantity IS NULL OR max_quantity >= ?)
       AND (valid_from IS NULL OR valid_from <= CURDATE())
       AND (valid_until IS NULL OR valid_until >= CURDATE())
       ORDER BY min_quantity DESC
       LIMIT 1`,
      [modelId, quantity, quantity]
    );

    if (rows.length === 0) return null;
    return rows[0] as DynamicPricing;
  }

  async create(pricing: Omit<DynamicPricing, "id" | "created_at" | "updated_at">): Promise<DynamicPricing> {
    const id = `pricing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await pool.execute(
      `INSERT INTO dynamic_pricing 
       (id, model_id, min_quantity, max_quantity, price, discount_percentage, valid_from, valid_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        pricing.model_id,
        pricing.min_quantity,
        pricing.max_quantity || null,
        pricing.price,
        pricing.discount_percentage || 0,
        pricing.valid_from || null,
        pricing.valid_until || null,
      ]
    );

    const created = await this.findById(id);
    if (!created) {
      throw new Error("Erro ao criar preço dinâmico");
    }
    return created;
  }

  async findById(id: string): Promise<DynamicPricing | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM dynamic_pricing WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;
    return rows[0] as DynamicPricing;
  }

  async update(id: string, pricing: Partial<DynamicPricing>): Promise<DynamicPricing | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (pricing.min_quantity !== undefined) {
      fields.push("min_quantity = ?");
      values.push(pricing.min_quantity);
    }
    if (pricing.max_quantity !== undefined) {
      fields.push("max_quantity = ?");
      values.push(pricing.max_quantity);
    }
    if (pricing.price !== undefined) {
      fields.push("price = ?");
      values.push(pricing.price);
    }
    if (pricing.discount_percentage !== undefined) {
      fields.push("discount_percentage = ?");
      values.push(pricing.discount_percentage);
    }
    if (pricing.valid_from !== undefined) {
      fields.push("valid_from = ?");
      values.push(pricing.valid_from);
    }
    if (pricing.valid_until !== undefined) {
      fields.push("valid_until = ?");
      values.push(pricing.valid_until);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE dynamic_pricing SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "DELETE FROM dynamic_pricing WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new DynamicPricingModel();
