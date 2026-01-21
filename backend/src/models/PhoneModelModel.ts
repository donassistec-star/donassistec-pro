import pool from "../config/database";
import { PhoneModel, ModelService, ModelVideo } from "../types";
import mysql2 from "mysql2";

class PhoneModelModel {
  async findAll(): Promise<PhoneModel[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT pm.*, b.name as brand_name, b.logo_url as brand_logo_url, b.icon_name as brand_icon_name
       FROM phone_models pm
       LEFT JOIN brands b ON pm.brand_id = b.id
       ORDER BY pm.popular DESC, pm.premium DESC, pm.name ASC`
    );
    return this.mapRowsToModels(rows);
  }

  async findById(id: string): Promise<PhoneModel | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT pm.*, b.name as brand_name, b.logo_url as brand_logo_url, b.icon_name as brand_icon_name
       FROM phone_models pm
       LEFT JOIN brands b ON pm.brand_id = b.id
       WHERE pm.id = ?`,
      [id]
    );

    if (rows.length === 0) return null;

    const models = await this.mapRowsToModels(rows);
    return models[0];
  }

  async findByBrand(brandId: string): Promise<PhoneModel[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT pm.*, b.name as brand_name, b.logo_url as brand_logo_url, b.icon_name as brand_icon_name
       FROM phone_models pm
       LEFT JOIN brands b ON pm.brand_id = b.id
       WHERE pm.brand_id = ?
       ORDER BY pm.popular DESC, pm.premium DESC, pm.name ASC`,
      [brandId]
    );
    return this.mapRowsToModels(rows);
  }

  async search(query: string): Promise<PhoneModel[]> {
    const searchTerm = `%${query}%`;
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      `SELECT pm.*, b.name as brand_name, b.logo_url as brand_logo_url, b.icon_name as brand_icon_name
       FROM phone_models pm
       LEFT JOIN brands b ON pm.brand_id = b.id
       WHERE pm.name LIKE ? OR b.name LIKE ? OR pm.brand_id LIKE ?
       ORDER BY pm.popular DESC, pm.name ASC`,
      [searchTerm, searchTerm, searchTerm]
    );
    return this.mapRowsToModels(rows);
  }

  async filter(filters: {
    brands?: string[];
    availability?: string[];
    premium?: boolean;
    popular?: boolean;
    services?: string[];
  }): Promise<PhoneModel[]> {
    let query = `SELECT pm.*, b.name as brand_name, b.logo_url as brand_logo_url, b.icon_name as brand_icon_name
                 FROM phone_models pm
                 LEFT JOIN brands b ON pm.brand_id = b.id
                 LEFT JOIN model_services ms ON pm.id = ms.model_id
                 WHERE 1=1`;
    const values: any[] = [];

    if (filters.brands && filters.brands.length > 0) {
      query += ` AND pm.brand_id IN (${filters.brands.map(() => "?").join(",")})`;
      values.push(...filters.brands);
    }

    if (filters.availability && filters.availability.length > 0) {
      query += ` AND pm.availability IN (${filters.availability.map(() => "?").join(",")})`;
      values.push(...filters.availability);
    }

    if (filters.premium !== undefined) {
      query += ` AND pm.premium = ?`;
      values.push(filters.premium);
    }

    if (filters.popular !== undefined) {
      query += ` AND pm.popular = ?`;
      values.push(filters.popular);
    }

    if (filters.services && filters.services.length > 0) {
      const serviceConditions: string[] = [];
      if (filters.services.includes("reconstruction")) {
        serviceConditions.push("ms.reconstruction = TRUE");
      }
      if (filters.services.includes("glassReplacement")) {
        serviceConditions.push("ms.glass_replacement = TRUE");
      }
      if (filters.services.includes("partsAvailable")) {
        serviceConditions.push("ms.parts_available = TRUE");
      }
      if (serviceConditions.length > 0) {
        query += ` AND (${serviceConditions.join(" OR ")})`;
      }
    }

    query += ` GROUP BY pm.id ORDER BY pm.popular DESC, pm.premium DESC, pm.name ASC`;

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(query, values);
    return this.mapRowsToModels(rows);
  }

  async getServices(modelId: string): Promise<ModelService | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM model_services WHERE model_id = ?",
      [modelId]
    );
    return (rows as ModelService[])[0] || null;
  }

  async getVideos(modelId: string): Promise<ModelVideo[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM model_videos WHERE model_id = ? ORDER BY video_order ASC, id ASC",
      [modelId]
    );
    return rows as ModelVideo[];
  }

  async createVideo(video: Omit<ModelVideo, "id" | "created_at">): Promise<ModelVideo> {
    const { model_id, title, url, thumbnail_url, duration, video_order } = video;
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "INSERT INTO model_videos (model_id, title, url, thumbnail_url, duration, video_order) VALUES (?, ?, ?, ?, ?, ?)",
      [model_id, title, url, thumbnail_url || null, duration || null, video_order ?? 0]
    );

    const insertId = result.insertId;
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM model_videos WHERE id = ?",
      [insertId]
    );

    return (rows as ModelVideo[])[0];
  }

  async updateVideo(id: number, video: Partial<ModelVideo>): Promise<ModelVideo | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (video.title !== undefined) {
      fields.push("title = ?");
      values.push(video.title);
    }
    if (video.url !== undefined) {
      fields.push("url = ?");
      values.push(video.url);
    }
    if (video.thumbnail_url !== undefined) {
      fields.push("thumbnail_url = ?");
      values.push(video.thumbnail_url);
    }
    if (video.duration !== undefined) {
      fields.push("duration = ?");
      values.push(video.duration);
    }
    if (video.video_order !== undefined) {
      fields.push("video_order = ?");
      values.push(video.video_order);
    }

    if (fields.length === 0) {
      const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
        "SELECT * FROM model_videos WHERE id = ?",
        [id]
      );
      return (rows as ModelVideo[])[0] || null;
    }

    values.push(id);
    await pool.execute(
      `UPDATE model_videos SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM model_videos WHERE id = ?",
      [id]
    );
    return (rows as ModelVideo[])[0] || null;
  }

  async deleteVideo(id: number): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "DELETE FROM model_videos WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }

  private async mapRowsToModels(rows: mysql2.RowDataPacket[]): Promise<any[]> {
    const models: any[] = [];

    for (const row of rows) {
      const model: any = {
        id: row.id,
        brand_id: row.brand_id,
        name: row.name,
        image_url: row.image_url,
        video_url: row.video_url,
        availability: row.availability,
        premium: Boolean(row.premium),
        popular: Boolean(row.popular),
        created_at: row.created_at,
        updated_at: row.updated_at,
        brand: row.brand_name
          ? {
              id: row.brand_id,
              name: row.brand_name,
              logo_url: row.brand_logo_url,
              icon_name: row.brand_icon_name,
            }
          : undefined,
      };

      // Buscar serviços e vídeos
      const [services, videos] = await Promise.all([
        this.getServices(model.id),
        this.getVideos(model.id),
      ]);

      if (services) {
        model.services = services;
      }

      if (videos.length > 0) {
        model.videos = videos;
      }

      models.push(model);
    }

    return models;
  }

  async create(model: any): Promise<any> {
    // Mapear campos do frontend para o formato do banco
    const brand_id = model.brand_id || model.brand;
    const image_url = model.image_url || model.image;
    const video_url = model.video_url || model.videoUrl;
    
    if (!model.id || !brand_id || !model.name) {
      throw new Error("ID, brand_id e name são obrigatórios");
    }

    await pool.execute(
      "INSERT INTO phone_models (id, brand_id, name, image_url, video_url, availability, premium, popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        model.id,
        brand_id,
        model.name,
        image_url || null,
        video_url || null,
        model.availability || "in_stock",
        model.premium || false,
        model.popular || false,
      ]
    );
    return (await this.findById(model.id))!;
  }

  async update(id: string, model: Partial<PhoneModel> | any): Promise<PhoneModel | null> {
    const fields: string[] = [];
    const values: any[] = [];

    // Mapear campos do frontend para o formato do banco
    const modelAny = model as any;
    if (modelAny.brand_id || modelAny.brand) {
      fields.push("brand_id = ?");
      values.push(modelAny.brand_id || modelAny.brand);
    }
    if (modelAny.name) {
      fields.push("name = ?");
      values.push(modelAny.name);
    }
    if (modelAny.image_url !== undefined || modelAny.image !== undefined) {
      fields.push("image_url = ?");
      values.push(modelAny.image_url || modelAny.image || null);
    }
    if (modelAny.video_url !== undefined || modelAny.videoUrl !== undefined) {
      fields.push("video_url = ?");
      values.push(modelAny.video_url || modelAny.videoUrl || null);
    }
    if (modelAny.availability) {
      fields.push("availability = ?");
      values.push(modelAny.availability);
    }
    if (modelAny.premium !== undefined) {
      fields.push("premium = ?");
      values.push(modelAny.premium);
    }
    if (modelAny.popular !== undefined) {
      fields.push("popular = ?");
      values.push(modelAny.popular);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE phone_models SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "DELETE FROM phone_models WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new PhoneModelModel();
