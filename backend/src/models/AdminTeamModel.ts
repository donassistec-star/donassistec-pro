import pool from "../config/database";
import bcrypt from "bcrypt";
import mysql2 from "mysql2";
import { ALL_ADMIN_MODULES } from "../constants/adminModules";

export type AdminTeamRole = "admin" | "gerente" | "tecnico" | "user";

export interface AdminTeamMember {
  id: string;
  email: string;
  name: string;
  role: AdminTeamRole;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminTeamCreateData {
  email: string;
  password: string;
  name: string;
  role: AdminTeamRole;
}

async function runQuery<T>(q: string, vals: unknown[] = []): Promise<T> {
  const [rows] = await pool.execute(q, vals);
  return rows as T;
}

class AdminTeamModel {
  async findByEmail(email: string): Promise<AdminTeamMember | null> {
    try {
      const rows = await runQuery<mysql2.RowDataPacket[]>(
        "SELECT id, email, name, role, active, created_at, updated_at FROM admin_team WHERE email = ? AND active = TRUE",
        [email]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role as AdminTeamRole,
        active: Boolean(r.active),
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    } catch {
      return null;
    }
  }

  async findById(id: string): Promise<AdminTeamMember | null> {
    try {
      const rows = await runQuery<mysql2.RowDataPacket[]>(
        "SELECT id, email, name, role, active, created_at, updated_at FROM admin_team WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role as AdminTeamRole,
        active: Boolean(r.active),
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    } catch {
      return null;
    }
  }

  async verifyPassword(email: string, password: string): Promise<AdminTeamMember | null> {
    try {
      const rows = await runQuery<mysql2.RowDataPacket[]>(
        "SELECT id, email, password_hash, name, role, active FROM admin_team WHERE email = ? AND active = TRUE",
        [email]
      );
      if (rows.length === 0) return null;
      const r = rows[0];
      const ok = await bcrypt.compare(password, r.password_hash);
      if (!ok) return null;
      return {
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role as AdminTeamRole,
        active: Boolean(r.active),
      };
    } catch {
      return null;
    }
  }

  /** Quantidade de usuários na admin_team. Falha se a tabela não existir. */
  async getCount(): Promise<number> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>("SELECT COUNT(*) AS c FROM admin_team");
    return Number(rows[0]?.c ?? 0);
  }

  async create(data: AdminTeamCreateData): Promise<AdminTeamMember> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new Error("E-mail já cadastrado na equipe");

    const id = `ateam-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const hash = await bcrypt.hash(data.password, 10);

    await pool.execute(
      `INSERT INTO admin_team (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      [id, data.email, hash, data.name, data.role]
    );
    return (await this.findById(id))!;
  }

  async findAll(): Promise<(AdminTeamMember & { has_module_overrides?: boolean })[]> {
    try {
      const rows = await runQuery<mysql2.RowDataPacket[]>(
        `SELECT at.id, at.email, at.name, at.role, at.active, at.created_at, at.updated_at,
         (SELECT COUNT(*) FROM admin_user_module_overrides o WHERE o.user_id = at.id) AS override_count
         FROM admin_team at ORDER BY at.created_at DESC`
      );
      return rows.map((r) => ({
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role as AdminTeamRole,
        active: Boolean(r.active),
        created_at: r.created_at,
        updated_at: r.updated_at,
        has_module_overrides: Number(r.override_count || 0) > 0,
      }));
    } catch {
      return [];
    }
  }

  /** Módulos padrão de uma função (sem overrides de usuário) */
  async getDefaultModulesForRole(role: AdminTeamRole): Promise<string[]> {
    if (role === "admin") return [...ALL_ADMIN_MODULES];
    try {
      const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
        "SELECT module_key FROM admin_role_modules WHERE role = ?",
        [role]
      );
      return (rows as { module_key: string }[]).map((r) => r.module_key);
    } catch {
      return [];
    }
  }

  /** Duplica um usuário: mesmo role e overrides; novo email, nome e senha */
  async duplicate(
    sourceId: string,
    data: { email: string; name: string; password: string }
  ): Promise<AdminTeamMember> {
    const src = await this.findById(sourceId);
    if (!src) throw new Error("Usuário de origem não encontrado");
    const existing = await this.findByEmail(data.email);
    if (existing) throw new Error("E-mail já cadastrado na equipe");

    const created = await this.create({
      email: data.email,
      password: data.password,
      name: data.name,
      role: src.role,
    });

    const overrides = await this.getModuleOverrides(sourceId);
    if (Object.keys(overrides).length > 0) {
      await this.setModuleOverrides(created.id, overrides);
    }
    return (await this.findById(created.id))!;
  }

  async update(id: string, data: { name?: string; email?: string; role?: AdminTeamRole }): Promise<AdminTeamMember | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    if (data.name != null) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.email != null) {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.role != null) {
      updates.push("role = ?");
      values.push(data.role);
    }
    if (updates.length === 0) return this.findById(id);
    values.push(id);
    await pool.execute(`UPDATE admin_team SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return this.findById(id);
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>("SELECT password_hash FROM admin_team WHERE id = ?", [id]);
    if (rows.length === 0) return false;
    const ok = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!ok) return false;
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE admin_team SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [hash, id]);
    return true;
  }

  async setPassword(id: string, newPassword: string): Promise<boolean> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>("SELECT 1 FROM admin_team WHERE id = ?", [id]);
    if (rows.length === 0) return false;
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE admin_team SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [hash, id]);
    return true;
  }

  async updateStatus(id: string, active: boolean): Promise<AdminTeamMember | null> {
    await pool.execute("UPDATE admin_team SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [active, id]);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const [r] = await pool.execute<mysql2.ResultSetHeader>("DELETE FROM admin_team WHERE id = ?", [id]);
    return r.affectedRows > 0;
  }

  /** Módulos efetivos para o usuário (considerando role e overrides) */
  async getModulesForUser(userId: string, role: AdminTeamRole): Promise<string[]> {
    try {
      if (role === "admin") return [...ALL_ADMIN_MODULES];

      const [roleRows] = await pool.execute<mysql2.RowDataPacket[]>(
        "SELECT module_key FROM admin_role_modules WHERE role = ?",
        [role]
      );
      const base = (roleRows as { module_key: string }[]).map((r) => r.module_key);

      const [ovRows] = await pool.execute<mysql2.RowDataPacket[]>(
        "SELECT module_key, visible FROM admin_user_module_overrides WHERE user_id = ?",
        [userId]
      );
      const overrides = new Map<string, boolean>();
      for (const r of ovRows as { module_key: string; visible: number }[]) {
        overrides.set(r.module_key, Boolean(r.visible));
      }

      const set = new Set<string>(base);
      for (const [key, visible] of overrides) {
        if (visible) set.add(key);
        else set.delete(key);
      }
      return [...set];
    } catch {
      return role === "admin" ? [...ALL_ADMIN_MODULES] : [];
    }
  }

  async getModuleOverrides(userId: string): Promise<Record<string, boolean>> {
    try {
      const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
        "SELECT module_key, visible FROM admin_user_module_overrides WHERE user_id = ?",
        [userId]
      );
      const out: Record<string, boolean> = {};
      for (const r of rows as { module_key: string; visible: number }[]) {
        out[r.module_key] = Boolean(r.visible);
      }
      return out;
    } catch {
      return {};
    }
  }

  async setModuleOverrides(userId: string, overrides: Record<string, boolean>): Promise<void> {
    await pool.execute("DELETE FROM admin_user_module_overrides WHERE user_id = ?", [userId]);
    for (const [key, visible] of Object.entries(overrides)) {
      await pool.execute(
        "INSERT INTO admin_user_module_overrides (user_id, module_key, visible) VALUES (?, ?, ?)",
        [userId, key, visible ? 1 : 0]
      );
    }
  }
}

export default new AdminTeamModel();
