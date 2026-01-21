import pool from "../config/database";
import { Brand } from "../types";
import mysql2 from "mysql2";

class BrandModel {
  async findAll(): Promise<Brand[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM brands ORDER BY name ASC"
    );
    return rows as Brand[];
  }

  async findById(id: string): Promise<Brand | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM brands WHERE id = ?",
      [id]
    );
    return (rows as Brand[])[0] || null;
  }

  async create(brand: Omit<Brand, "created_at" | "updated_at">): Promise<Brand> {
    const { id, name, logo_url, icon_name } = brand;
    await pool.execute(
      "INSERT INTO brands (id, name, logo_url, icon_name) VALUES (?, ?, ?, ?)",
      [id, name, logo_url || null, icon_name || null]
    );
    return (await this.findById(id))!;
  }

  async update(id: string, brand: Partial<Brand>): Promise<Brand | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (brand.name) {
      fields.push("name = ?");
      values.push(brand.name);
    }
    if (brand.logo_url !== undefined) {
      fields.push("logo_url = ?");
      values.push(brand.logo_url);
    }
    if (brand.icon_name !== undefined) {
      fields.push("icon_name = ?");
      values.push(brand.icon_name);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE brands SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "DELETE FROM brands WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new BrandModel();
