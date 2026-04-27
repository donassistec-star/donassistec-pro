import pool from "../config/database";
import mysql2 from "mysql2";

export interface AuditLog {
  id?: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

class AuditLogModel {
  async create(log: Omit<AuditLog, "id" | "created_at">): Promise<AuditLog> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const oldValuesJson = log.old_values ? JSON.stringify(log.old_values) : null;
    const newValuesJson = log.new_values ? JSON.stringify(log.new_values) : null;

    await pool.execute(
      `INSERT INTO audit_logs 
       (id, user_id, user_email, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        log.user_id || null,
        log.user_email || null,
        log.action,
        log.entity_type || null,
        log.entity_id || null,
        oldValuesJson,
        newValuesJson,
        log.ip_address || null,
        log.user_agent || null,
      ]
    );

    const created = await this.findById(id);
    if (!created) {
      throw new Error("Erro ao criar log de auditoria");
    }
    return created;
  }

  async findById(id: string): Promise<AuditLog | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM audit_logs WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      user_id: row.user_id,
      user_email: row.user_email,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      old_values: row.old_values ? (typeof row.old_values === 'string' ? JSON.parse(row.old_values) : row.old_values) : null,
      new_values: row.new_values ? (typeof row.new_values === 'string' ? JSON.parse(row.new_values) : row.new_values) : null,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: row.created_at,
    };
  }

  async findAll(filters?: {
    user_id?: string;
    action?: string;
    entity_type?: string;
    entity_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<AuditLog[]> {
    let query = "SELECT * FROM audit_logs WHERE 1=1";
    const params: any[] = [];

    if (filters?.user_id) {
      query += " AND user_id = ?";
      params.push(filters.user_id);
    }

    if (filters?.action) {
      query += " AND action = ?";
      params.push(filters.action);
    }

    if (filters?.entity_type) {
      query += " AND entity_type = ?";
      params.push(filters.entity_type);
    }

    if (filters?.entity_id) {
      query += " AND entity_id = ?";
      params.push(filters.entity_id);
    }

    query += " ORDER BY created_at DESC";

    if (filters?.limit) {
      query += " LIMIT ?";
      params.push(filters.limit);
    }

    if (filters?.offset) {
      query += " OFFSET ?";
      params.push(filters.offset);
    }

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(query, params);

    return rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      user_email: row.user_email,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      old_values: row.old_values ? (typeof row.old_values === 'string' ? JSON.parse(row.old_values) : row.old_values) : null,
      new_values: row.new_values ? (typeof row.new_values === 'string' ? JSON.parse(row.new_values) : row.new_values) : null,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: row.created_at,
    }));
  }
}

export default new AuditLogModel();
