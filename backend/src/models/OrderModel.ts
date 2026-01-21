import pool from "../config/database";
import { Order, OrderItem, OrderWithItems } from "../types";
import mysql2 from "mysql2";

class OrderModel {
  async findAll(retailerId?: string): Promise<OrderWithItems[]> {
    let query = `
      SELECT o.*, 
             oi.id as item_id, oi.model_id, oi.model_name, oi.brand_name, 
             oi.quantity, oi.reconstruction, oi.glass_replacement, oi.parts_available, oi.notes as item_notes
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    
    const values: any[] = [];
    if (retailerId) {
      query += " WHERE o.retailer_id = ?";
      values.push(retailerId);
    }
    
    query += " ORDER BY o.created_at DESC, oi.id ASC";
    
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(query, values);
    
    // Agrupar itens por pedido
    const ordersMap = new Map<string, OrderWithItems>();
    
    for (const row of rows) {
      const orderId = row.id;
      
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.id,
          retailer_id: row.retailer_id,
          company_name: row.company_name,
          contact_name: row.contact_name,
          email: row.email,
          phone: row.phone,
          cnpj: row.cnpj,
          address: row.address,
          city: row.city,
          state: row.state,
          zip_code: row.zip_code,
          notes: row.notes,
          status: row.status,
          total: Number(row.total),
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: [],
        });
      }
      
      if (row.item_id) {
        const order = ordersMap.get(orderId)!;
        order.items.push({
          id: row.item_id,
          order_id: orderId,
          model_id: row.model_id,
          model_name: row.model_name,
          brand_name: row.brand_name,
          quantity: row.quantity,
          reconstruction: Boolean(row.reconstruction),
          glass_replacement: Boolean(row.glass_replacement),
          parts_available: Boolean(row.parts_available),
          notes: row.item_notes,
          created_at: row.created_at,
        });
      }
    }
    
    return Array.from(ordersMap.values());
  }

  async findById(id: string, retailerId?: string): Promise<OrderWithItems | null> {
    let query = `
      SELECT o.*, 
             oi.id as item_id, oi.model_id, oi.model_name, oi.brand_name, 
             oi.quantity, oi.reconstruction, oi.glass_replacement, oi.parts_available, oi.notes as item_notes
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = ?
    `;
    
    const values: any[] = [id];
    if (retailerId) {
      query += " AND o.retailer_id = ?";
      values.push(retailerId);
    }
    
    query += " ORDER BY oi.id ASC";
    
    const [rows] = await pool.execute<mysql2.RowDataPacket[]>(query, values);
    
    if (rows.length === 0) return null;
    
    const firstRow = rows[0];
    const order: OrderWithItems = {
      id: firstRow.id,
      retailer_id: firstRow.retailer_id,
      company_name: firstRow.company_name,
      contact_name: firstRow.contact_name,
      email: firstRow.email,
      phone: firstRow.phone,
      cnpj: firstRow.cnpj,
      address: firstRow.address,
      city: firstRow.city,
      state: firstRow.state,
      zip_code: firstRow.zip_code,
      notes: firstRow.notes,
      status: firstRow.status,
      total: Number(firstRow.total),
      created_at: firstRow.created_at,
      updated_at: firstRow.updated_at,
      items: [],
    };
    
    for (const row of rows) {
      if (row.item_id) {
        order.items.push({
          id: row.item_id,
          order_id: id,
          model_id: row.model_id,
          model_name: row.model_name,
          brand_name: row.brand_name,
          quantity: row.quantity,
          reconstruction: Boolean(row.reconstruction),
          glass_replacement: Boolean(row.glass_replacement),
          parts_available: Boolean(row.parts_available),
          notes: row.item_notes,
          created_at: row.created_at,
        });
      }
    }
    
    return order;
  }

  async create(order: Order, items: OrderItem[]): Promise<OrderWithItems> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Inserir pedido
      await connection.execute(
        `INSERT INTO orders (id, retailer_id, company_name, contact_name, email, phone, cnpj, 
         address, city, state, zip_code, notes, status, total) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          order.retailer_id,
          order.company_name,
          order.contact_name,
          order.email,
          order.phone || null,
          order.cnpj || null,
          order.address || null,
          order.city || null,
          order.state || null,
          order.zip_code || null,
          order.notes || null,
          order.status,
          order.total,
        ]
      );
      
      // Inserir itens
      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items (order_id, model_id, model_name, brand_name, quantity, 
           reconstruction, glass_replacement, parts_available, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order.id,
            item.model_id,
            item.model_name,
            item.brand_name || null,
            item.quantity,
            item.reconstruction,
            item.glass_replacement,
            item.parts_available,
            item.notes || null,
          ]
        );
      }
      
      await connection.commit();
      
      return (await this.findById(order.id))!;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateStatus(id: string, status: Order["status"], retailerId?: string): Promise<OrderWithItems | null> {
    let query = "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    const values: any[] = [status, id];
    
    if (retailerId) {
      query += " AND retailer_id = ?";
      values.push(retailerId);
    }
    
    await pool.execute(query, values);
    
    return this.findById(id, retailerId);
  }

  async delete(id: string, retailerId?: string): Promise<boolean> {
    let query = "DELETE FROM orders WHERE id = ?";
    const values: any[] = [id];
    
    if (retailerId) {
      query += " AND retailer_id = ?";
      values.push(retailerId);
    }
    
    const [result] = await pool.execute<mysql2.ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }
}

export default new OrderModel();
