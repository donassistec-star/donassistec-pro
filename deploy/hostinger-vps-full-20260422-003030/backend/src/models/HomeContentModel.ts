import pool from "../config/database";
import { HomeContent } from "../types";
import mysql2 from "mysql2";

class HomeContentModel {
  async get(): Promise<HomeContent | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT content FROM home_content WHERE section = 'main' LIMIT 1"
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const content = rows[0].content;
    // MySQL retorna JSON como string, então precisamos fazer parse
    return typeof content === 'string' ? JSON.parse(content) : content;
  }

  async update(content: HomeContent): Promise<HomeContent> {
    const contentJson = JSON.stringify(content);
    
    await pool.execute(
      `INSERT INTO home_content (section, content) 
       VALUES ('main', ?) 
       ON DUPLICATE KEY UPDATE content = ?, updated_at = CURRENT_TIMESTAMP`,
      [contentJson, contentJson]
    );
    
    const updated = await this.get();
    if (!updated) {
      throw new Error("Erro ao recuperar conteúdo atualizado");
    }
    return updated;
  }
}

export default new HomeContentModel();
