import pool from "../config/database";

export interface ProductView {
  id: number;
  model_id: string;
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  viewed_at: string;
  session_id?: string;
}

export interface ProductViewStats {
  model_id: string;
  total_views: number;
  unique_views: number;
  last_viewed_at?: string;
}

class ProductViewModel {
  async recordView(
    modelId: string,
    userId?: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string,
    sessionId?: string
  ): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO product_views 
         (model_id, user_id, user_email, ip_address, user_agent, session_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [modelId, userId || null, userEmail || null, ipAddress || null, userAgent || null, sessionId || null]
      );

      // Atualizar estatísticas agregadas
      await connection.execute(
        `INSERT INTO product_view_stats (model_id, total_views, unique_views, last_viewed_at)
         VALUES (?, 1, 1, NOW())
         ON DUPLICATE KEY UPDATE 
           total_views = total_views + 1,
           last_viewed_at = NOW(),
           updated_at = NOW()`,
        [modelId]
      );
    } finally {
      connection.release();
    }
  }

  async getModelStats(modelId: string): Promise<ProductViewStats | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM product_view_stats WHERE model_id = ?`,
        [modelId]
      );
      const stats = rows as ProductViewStats[];
      return stats.length > 0 ? stats[0] : null;
    } finally {
      connection.release();
    }
  }

  async getMostViewed(limit: number = 10): Promise<ProductViewStats[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT * FROM product_view_stats 
         ORDER BY total_views DESC, last_viewed_at DESC 
         LIMIT ?`,
        [limit]
      );
      return rows as ProductViewStats[];
    } finally {
      connection.release();
    }
  }

  async getUserViewHistory(userId: string, limit: number = 20): Promise<ProductView[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT DISTINCT model_id, MAX(viewed_at) as viewed_at, MAX(id) as id
         FROM product_views 
         WHERE user_id = ?
         GROUP BY model_id
         ORDER BY viewed_at DESC 
         LIMIT ?`,
        [userId, limit]
      );
      return rows as ProductView[];
    } finally {
      connection.release();
    }
  }
}

export default new ProductViewModel();
