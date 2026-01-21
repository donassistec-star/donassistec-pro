import pool from "../config/database";
import mysql2 from "mysql2";

export interface Review {
  id?: string;
  model_id: string;
  retailer_id: string;
  rating: number;
  comment?: string;
  approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

class ReviewModel {
  async findByModel(modelId: string, approvedOnly: boolean = true): Promise<Review[]> {
    let query = "SELECT * FROM product_reviews WHERE model_id = ?";
    const params: any[] = [modelId];

    if (approvedOnly) {
      query += " AND approved = TRUE";
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(query, params);
    return rows as Review[];
  }

  async findById(id: string): Promise<Review | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM product_reviews WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;
    return rows[0] as Review;
  }

  async create(review: Omit<Review, "id" | "created_at" | "updated_at">): Promise<Review> {
    const id = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await pool.execute(
      `INSERT INTO product_reviews 
       (id, model_id, retailer_id, rating, comment, approved)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        review.model_id,
        review.retailer_id,
        review.rating,
        review.comment || null,
        review.approved || false,
      ]
    );

    const created = await this.findById(id);
    if (!created) {
      throw new Error("Erro ao criar avaliação");
    }
    return created;
  }

  async update(id: string, review: Partial<Review>): Promise<Review | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (review.rating !== undefined) {
      fields.push("rating = ?");
      values.push(review.rating);
    }
    if (review.comment !== undefined) {
      fields.push("comment = ?");
      values.push(review.comment);
    }
    if (review.approved !== undefined) {
      fields.push("approved = ?");
      values.push(review.approved);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE product_reviews SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "DELETE FROM product_reviews WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  async getAverageRating(modelId: string): Promise<number> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT AVG(rating) as avg_rating FROM product_reviews WHERE model_id = ? AND approved = TRUE",
      [modelId]
    );

    if (rows.length === 0 || !rows[0].avg_rating) return 0;
    return parseFloat(rows[0].avg_rating) || 0;
  }
}

export default new ReviewModel();
