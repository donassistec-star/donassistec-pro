import pool from "../config/database";

export interface Service {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ModelService {
  id: string;
  model_id: string;
  service_id: string;
  price: number;
  available: boolean;
  created_at?: string;
  updated_at?: string;
  service?: Service; // Populado ao buscar com JOIN
}

class ServiceModel {
  async findAll(activeOnly: boolean = false): Promise<Service[]> {
    const connection = await pool.getConnection();
    try {
      const query = activeOnly
        ? "SELECT * FROM services WHERE active = TRUE ORDER BY name ASC"
        : "SELECT * FROM services ORDER BY name ASC";
      
      const [rows] = await connection.execute(query);
      return rows as Service[];
    } finally {
      connection.release();
    }
  }

  async findById(id: string): Promise<Service | null> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM services WHERE id = ?",
        [id]
      );
      const services = rows as Service[];
      return services.length > 0 ? services[0] : null;
    } finally {
      connection.release();
    }
  }

  async create(service: Omit<Service, "created_at" | "updated_at">): Promise<Service> {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO services (id, name, description, active) 
         VALUES (?, ?, ?, ?)`,
        [service.id, service.name, service.description || null, service.active !== false]
      );
      
      return (await this.findById(service.id))!;
    } finally {
      connection.release();
    }
  }

  async update(id: string, updates: Partial<Service>): Promise<Service | null> {
    const connection = await pool.getConnection();
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (updates.name !== undefined) {
        fields.push("name = ?");
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push("description = ?");
        values.push(updates.description);
      }
      if (updates.active !== undefined) {
        fields.push("active = ?");
        values.push(updates.active);
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      values.push(id);
      await connection.execute(
        `UPDATE services SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } finally {
      connection.release();
    }
  }

  async delete(id: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        "DELETE FROM services WHERE id = ?",
        [id]
      ) as any;
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Métodos para Model Services (preços por serviço por modelo)
  async getModelServices(modelId: string): Promise<ModelService[]> {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        `SELECT ms.*, s.name as service_name, s.description as service_description, s.active as service_active
         FROM model_services ms
         LEFT JOIN services s ON ms.service_id = s.id
         WHERE ms.model_id = ?
         ORDER BY s.name ASC`,
        [modelId]
      );
      
      const results = rows as any[];
      if (!results || results.length === 0) {
        return [];
      }
      
      return results.map((row) => ({
        id: row.id || `${row.model_id}_${row.service_id}`,
        model_id: row.model_id,
        service_id: row.service_id,
        price: parseFloat(row.price) || 0,
        available: Boolean(row.available),
        created_at: row.created_at,
        updated_at: row.updated_at,
        service: row.service_name ? {
          id: row.service_id,
          name: row.service_name,
          description: row.service_description || null,
          active: Boolean(row.service_active !== false),
        } : undefined,
      }));
    } catch (error: any) {
      console.error("Erro ao buscar serviços do modelo:", error);
      // Se a tabela não existir ou houver erro SQL, retornar array vazio
      if (error.code === "ER_NO_SUCH_TABLE" || error.code === "ER_BAD_FIELD_ERROR") {
        console.warn("Tabela model_services ou services não encontrada, retornando array vazio");
        return [];
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async setModelService(
    modelId: string,
    serviceId: string,
    price: number,
    available: boolean
  ): Promise<ModelService> {
    const connection = await pool.getConnection();
    try {
      // Verificar a estrutura da tabela
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM model_services`
      ) as any[];
      
      const columnNames = columns.map((col: any) => col.Field);
      const hasServiceId = columnNames.includes('service_id');
      const hasId = columnNames.includes('id');
      
      if (!hasServiceId) {
        // Estrutura antiga - precisa migrar a tabela
        console.error("Tabela model_services tem estrutura antiga (sem service_id).");
        console.error("Execute a migration: backend/database/migrations/15_migrate_model_services_auto.sql");
        throw new Error("A tabela model_services precisa ser migrada para a nova estrutura. Execute a migration 15_migrate_model_services_auto.sql no banco de dados.");
      }
      
      if (hasId) {
        // Nova estrutura com coluna id
        const id = `model_service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await connection.execute(
          `INSERT INTO model_services (id, model_id, service_id, price, available) 
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE price = ?, available = ?`,
          [id, modelId, serviceId, price, available, price, available]
        );
      } else {
        // Nova estrutura sem coluna id - usar UNIQUE KEY (model_id, service_id)
        await connection.execute(
          `INSERT INTO model_services (model_id, service_id, price, available) 
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE price = ?, available = ?`,
          [modelId, serviceId, price, available, price, available]
        );
      }

      // Buscar o registro atualizado
      const [rows] = await connection.execute(
        `SELECT ms.*, s.name as service_name, s.description as service_description 
         FROM model_services ms
         LEFT JOIN services s ON ms.service_id = s.id
         WHERE ms.model_id = ? AND ms.service_id = ?`,
        [modelId, serviceId]
      );
      
      const result = (rows as any[])[0];
      if (!result) {
        throw new Error("Erro ao salvar serviço do modelo");
      }
      
      return {
        id: result.id || `${result.model_id}_${result.service_id}`,
        model_id: result.model_id,
        service_id: result.service_id,
        price: parseFloat(result.price) || 0,
        available: Boolean(result.available),
        created_at: result.created_at,
        updated_at: result.updated_at,
        service: result.service_name ? {
          id: result.service_id,
          name: result.service_name,
          description: result.service_description || null,
          active: true,
        } : undefined,
      };
    } catch (error: any) {
      console.error("Erro ao salvar serviço do modelo:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async removeModelService(modelId: string, serviceId: string): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        "DELETE FROM model_services WHERE model_id = ? AND service_id = ?",
        [modelId, serviceId]
      ) as any;
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  async updateModelServicePrice(
    modelId: string,
    serviceId: string,
    price: number
  ): Promise<boolean> {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        "UPDATE model_services SET price = ? WHERE model_id = ? AND service_id = ?",
        [price, modelId, serviceId]
      ) as any;
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new ServiceModel();
