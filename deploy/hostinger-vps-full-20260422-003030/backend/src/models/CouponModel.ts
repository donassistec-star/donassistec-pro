import pool from "../config/database";
import mysql2 from "mysql2";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CouponUsage {
  id?: number;
  coupon_id: string;
  retailer_id: string;
  order_id: string;
  discount_amount: number;
  used_at?: string;
}

class CouponModel {
  async findAll(): Promise<Coupon[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM coupons ORDER BY created_at DESC"
    );
    return rows as Coupon[];
  }

  async findById(id: string): Promise<Coupon | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM coupons WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? (rows[0] as Coupon) : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM coupons WHERE code = ? AND active = TRUE",
      [code.toUpperCase()]
    );
    return rows.length > 0 ? (rows[0] as Coupon) : null;
  }

  async validateCoupon(code: string, orderValue: number): Promise<{ valid: boolean; coupon: Coupon | null; error?: string; discount?: number }> {
    const coupon = await this.findByCode(code);
    
    if (!coupon) {
      return { valid: false, coupon: null, error: "Cupom não encontrado ou inativo" };
    }

    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      return { valid: false, coupon, error: "Cupom ainda não está válido" };
    }

    if (now > validUntil) {
      return { valid: false, coupon, error: "Cupom expirado" };
    }

    if (coupon.min_order_value && orderValue < coupon.min_order_value) {
      return { valid: false, coupon, error: `Valor mínimo do pedido: ${coupon.min_order_value.toFixed(2)}` };
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return { valid: false, coupon, error: "Cupom esgotado" };
    }

    // Calcular desconto
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (orderValue * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else {
      discount = coupon.discount_value;
      if (discount > orderValue) {
        discount = orderValue;
      }
    }

    return { valid: true, coupon, discount };
  }

  async create(coupon: Omit<Coupon, "created_at" | "updated_at" | "used_count">): Promise<Coupon> {
    await pool.execute(
      `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_value, 
       max_discount, usage_limit, valid_from, valid_until, active, used_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        coupon.id,
        coupon.code.toUpperCase(),
        coupon.description || null,
        coupon.discount_type,
        coupon.discount_value,
        coupon.min_order_value || 0,
        coupon.max_discount || null,
        coupon.usage_limit || null,
        coupon.valid_from,
        coupon.valid_until,
        coupon.active,
      ]
    );
    return (await this.findById(coupon.id))!;
  }

  async update(id: string, coupon: Partial<Coupon>): Promise<Coupon | null> {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(coupon).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at" && key !== "updated_at" && value !== undefined) {
        if (key === "code") {
          fields.push(`${key} = ?`);
          values.push((value as string).toUpperCase());
        } else {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
    });

    if (fields.length === 0) return await this.findById(id);

    values.push(id);
    await pool.execute(
      `UPDATE coupons SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "DELETE FROM coupons WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  async recordUsage(couponId: string, retailerId: string, orderId: string, discountAmount: number): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Incrementar contador de uso
      await connection.execute(
        "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
        [couponId]
      );

      // Registrar uso
      await connection.execute(
        `INSERT INTO coupon_usage (coupon_id, retailer_id, order_id, discount_amount)
         VALUES (?, ?, ?, ?)`,
        [couponId, retailerId, orderId, discountAmount]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getUsageByRetailer(retailerId: string): Promise<CouponUsage[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT cu.*, c.code, c.description 
       FROM coupon_usage cu
       JOIN coupons c ON cu.coupon_id = c.id
       WHERE cu.retailer_id = ?
       ORDER BY cu.used_at DESC`,
      [retailerId]
    );
    return rows as CouponUsage[];
  }
}

export default new CouponModel();
