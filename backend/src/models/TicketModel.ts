import pool from "../config/database";
import mysql2 from "mysql2";

export interface Ticket {
  id?: string;
  retailer_id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at?: string;
  updated_at?: string;
}

export interface TicketMessage {
  id?: string;
  ticket_id: string;
  sender_id: string;
  sender_type: "retailer" | "admin";
  message: string;
  created_at?: string;
}

export interface TicketWithMessages extends Ticket {
  messages?: TicketMessage[];
}

class TicketModel {
  async findAll(filters?: {
    retailer_id?: string;
    status?: Ticket["status"];
    priority?: Ticket["priority"];
  }): Promise<Ticket[]> {
    let query = "SELECT * FROM support_tickets WHERE 1=1";
    const params: any[] = [];

    if (filters?.retailer_id) {
      query += " AND retailer_id = ?";
      params.push(filters.retailer_id);
    }
    if (filters?.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }
    if (filters?.priority) {
      query += " AND priority = ?";
      params.push(filters.priority);
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(query, params);
    return rows as Ticket[];
  }

  async findById(id: string): Promise<TicketWithMessages | null> {
    const [ticketRows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM support_tickets WHERE id = ?",
      [id]
    );

    if (ticketRows.length === 0) return null;

    const ticket = ticketRows[0] as Ticket;

    // Buscar mensagens
    const [messageRows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC",
      [id]
    );

    return {
      ...ticket,
      messages: messageRows as TicketMessage[],
    };
  }

  async create(ticket: Omit<Ticket, "id" | "created_at" | "updated_at">): Promise<Ticket> {
    const id = `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await pool.execute(
      `INSERT INTO support_tickets 
       (id, retailer_id, subject, description, status, priority)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        ticket.retailer_id,
        ticket.subject,
        ticket.description,
        ticket.status,
        ticket.priority,
      ]
    );

    const created = await this.findById(id);
    if (!created) {
      throw new Error("Erro ao criar ticket");
    }
    return created;
  }

  async update(id: string, ticket: Partial<Ticket>): Promise<Ticket | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (ticket.status !== undefined) {
      fields.push("status = ?");
      values.push(ticket.status);
    }
    if (ticket.priority !== undefined) {
      fields.push("priority = ?");
      values.push(ticket.priority);
    }
    if (ticket.subject !== undefined) {
      fields.push("subject = ?");
      values.push(ticket.subject);
    }
    if (ticket.description !== undefined) {
      fields.push("description = ?");
      values.push(ticket.description);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await pool.execute(
      `UPDATE support_tickets SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async addMessage(message: Omit<TicketMessage, "id" | "created_at">): Promise<TicketMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await pool.execute(
      `INSERT INTO ticket_messages 
       (id, ticket_id, sender_id, sender_type, message)
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        message.ticket_id,
        message.sender_id,
        message.sender_type,
        message.message,
      ]
    );

    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(
      "SELECT * FROM ticket_messages WHERE id = ?",
      [id]
    );

    return rows[0] as TicketMessage;
  }
}

export default new TicketModel();
