import pool from "../config/database";
import { Retailer, RetailerRegisterData } from "../types";
import bcrypt from "bcrypt";
import mysql2 from "mysql2";
import AdminTeamModel from "./AdminTeamModel";

class RetailerModel {
  private mapRow(row: mysql2.RowDataPacket): Retailer {
    return {
      id: row.id,
      email: row.email,
      company_name: row.company_name,
      contact_name: row.contact_name,
      phone: row.phone,
      cnpj: row.cnpj,
      role: row.role,
      active: Boolean(row.active),
      approval_status: row.approval_status,
      approved_at: row.approved_at,
      approved_by: row.approved_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findAnyByEmail(email: string): Promise<Retailer | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT id, email, company_name, contact_name, phone, cnpj, role, active, approval_status, approved_at, approved_by, created_at, updated_at FROM retailers WHERE email = ?",
      [email]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findByEmail(email: string): Promise<Retailer | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT id, email, company_name, contact_name, phone, cnpj, role, active, approval_status, approved_at, approved_by, created_at, updated_at FROM retailers WHERE email = ? AND active = TRUE AND approval_status = 'approved'",
      [email]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async findById(id: string): Promise<Retailer | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT id, email, company_name, contact_name, phone, cnpj, role, active, approval_status, approved_at, approved_by, created_at, updated_at FROM retailers WHERE id = ? AND active = TRUE AND approval_status = 'approved'",
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  async create(data: RetailerRegisterData): Promise<Retailer> {
    // Verificar se email já existe
    const existing = await this.findAnyByEmail(data.email);
    if (existing) {
      throw new Error("Email já cadastrado");
    }

    const adminTeamUser = await AdminTeamModel.findByEmail(data.email);
    if (adminTeamUser) {
      throw new Error("Este e-mail já está em uso na equipe administrativa");
    }

    // Hash da senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Gerar ID único
    const id = `retailer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await pool.execute(
      `INSERT INTO retailers (id, email, password_hash, company_name, contact_name, phone, cnpj, role, approval_status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'retailer', 'pending')`,
      [
        id,
        data.email,
        passwordHash,
        data.company_name,
        data.contact_name,
        data.phone || null,
        data.cnpj || null,
      ]
    );

    return (await this.findByIdIncludingInactive(id))!;
  }

  async verifyPassword(email: string, password: string): Promise<Retailer | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT id, email, password_hash, company_name, contact_name, phone, cnpj, role, active, approval_status, approved_at, approved_by FROM retailers WHERE email = ? AND active = TRUE AND approval_status = 'approved'",
      [email]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    const passwordMatch = await bcrypt.compare(password, row.password_hash);

    if (!passwordMatch) return null;

    return {
      id: row.id,
      email: row.email,
      company_name: row.company_name,
      contact_name: row.contact_name,
      phone: row.phone,
      cnpj: row.cnpj,
      role: row.role,
      active: Boolean(row.active),
      approval_status: row.approval_status,
      approved_at: row.approved_at,
      approved_by: row.approved_by,
    };
  }

  async getAuthStatusByEmail(email: string): Promise<{
    id: string;
    email: string;
    password_hash: string;
    active: boolean;
    approval_status: "pending" | "approved" | "rejected";
  } | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT id, email, password_hash, active, approval_status FROM retailers WHERE email = ?",
      [email]
    );

    if (rows.length === 0) return null;

    return {
      id: rows[0].id,
      email: rows[0].email,
      password_hash: rows[0].password_hash,
      active: Boolean(rows[0].active),
      approval_status: rows[0].approval_status,
    };
  }

  async update(id: string, data: {
    company_name?: string;
    contact_name?: string;
    phone?: string;
    cnpj?: string;
  }): Promise<Retailer | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.company_name !== undefined) {
      updates.push("company_name = ?");
      values.push(data.company_name);
    }
    if (data.contact_name !== undefined) {
      updates.push("contact_name = ?");
      values.push(data.contact_name);
    }
    if (data.phone !== undefined) {
      updates.push("phone = ?");
      values.push(data.phone || null);
    }
    if (data.cnpj !== undefined) {
      updates.push("cnpj = ?");
      values.push(data.cnpj || null);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE retailers SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Buscar usuário e verificar senha atual
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT password_hash FROM retailers WHERE id = ? AND active = TRUE AND approval_status = 'approved'",
      [id]
    );

    if (rows.length === 0) return false;

    const passwordMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!passwordMatch) return false;

    // Hash da nova senha
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha
    await pool.execute(
      "UPDATE retailers SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [newPasswordHash, id]
    );

    return true;
  }

  // Buscar todos os lojistas (incluindo inativos) - apenas admin
  async findAll(): Promise<Retailer[]> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT id, email, company_name, contact_name, phone, cnpj, role, active, approval_status, approved_at, approved_by, created_at, updated_at FROM retailers ORDER BY created_at DESC"
    );

    return rows.map((row) => this.mapRow(row));
  }

  // Buscar por ID incluindo inativos - apenas admin
  async findByIdIncludingInactive(id: string): Promise<Retailer | null> {
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT id, email, company_name, contact_name, phone, cnpj, role, active, approval_status, approved_at, approved_by, created_at, updated_at FROM retailers WHERE id = ?",
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapRow(rows[0]);
  }

  // Atualizar status (ativar/desativar) - apenas admin
  async updateStatus(id: string, active: boolean): Promise<Retailer | null> {
    await pool.execute(
      "UPDATE retailers SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [active, id]
    );

    return this.findByIdIncludingInactive(id);
  }

  async updateApprovalStatus(
    id: string,
    approvalStatus: "pending" | "approved" | "rejected",
    approvedBy?: string
  ): Promise<Retailer | null> {
    const approvedAt = approvalStatus === "approved" ? new Date() : null;

    await pool.execute(
      `UPDATE retailers
       SET approval_status = ?, approved_at = ?, approved_by = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [approvalStatus, approvedAt, approvalStatus === "approved" ? approvedBy || null : null, id]
    );

    return this.findByIdIncludingInactive(id);
  }

  // Deletar (soft delete - desativar) - apenas admin
  async delete(id: string): Promise<boolean> {
    const result = await pool.execute(
      "UPDATE retailers SET active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    return (result[0] as any).affectedRows > 0;
  }

  // Excluir permanentemente do cadastro - apenas admin
  async deletePermanent(id: string): Promise<boolean> {
    const [result] = await pool.execute<mysql2.ResultSetHeader>(
      "DELETE FROM retailers WHERE id = ?",
      [id]
    );

    return result.affectedRows > 0;
  }
}

export default new RetailerModel();
