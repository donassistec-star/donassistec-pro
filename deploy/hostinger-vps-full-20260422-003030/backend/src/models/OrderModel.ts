import pool from "../config/database";
import { Order, OrderItem, OrderWithItems } from "../types";
import mysql2 from "mysql2";

class OrderModel {
  async findAll(retailerIds?: string[]): Promise<OrderWithItems[]> {
    const runQuery = (q: string, vals: any[]) => pool.execute(q, vals).then(([r]) => r as any[]);
    const ids = (retailerIds ?? []).filter(Boolean);
    const whereIn = ids.length > 0 ? " WHERE o.retailer_id IN (" + ids.map(() => "?").join(",") + ")" : "";

    let query = `
      SELECT o.*, pp.numero as pre_pedido_numero,
             oi.id as item_id, oi.model_id, oi.model_name, oi.brand_name, 
             oi.quantity, oi.reconstruction, oi.glass_replacement, oi.parts_available, oi.notes as item_notes
      FROM orders o
      LEFT JOIN pre_pedidos pp ON o.pre_pedido_id = pp.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    ` + whereIn + `
 ORDER BY o.created_at DESC, oi.id ASC`;
    const values: any[] = [...ids];

    let rows: any[];
    let hasItems = true;
    try {
      rows = await runQuery(query, values);
    } catch (e1) {
      try {
        // Fallback 1: colunas base (sem numero, pre_pedido_id) – schema sem migration 27
        const baseCols = "o.id, o.retailer_id, o.company_name, o.contact_name, o.email, o.phone, o.cnpj, o.address, o.city, o.state, o.zip_code, o.notes, o.status, o.total, o.created_at, o.updated_at";
        query = `
          SELECT ${baseCols},
                 oi.id as item_id, oi.model_id, oi.model_name, oi.brand_name,
                 oi.quantity, oi.reconstruction, oi.glass_replacement, oi.parts_available, oi.notes as item_notes
          FROM orders o
          LEFT JOIN order_items oi ON o.id = oi.order_id
        ` + whereIn + " ORDER BY o.created_at DESC, oi.id ASC";
        rows = await runQuery(query, values);
      } catch (e2) {
        // Fallback 2: só orders (order_items não existe) – retorna pedidos com items=[]
        if (ids.length > 0) {
          query = `SELECT o.* FROM orders o WHERE o.retailer_id IN (` + ids.map(() => "?").join(",") + `) ORDER BY o.created_at DESC`;
          rows = await runQuery(query, ids);
        } else {
          query = `SELECT o.* FROM orders o ORDER BY o.created_at DESC`;
          rows = await runQuery(query, []);
        }
        hasItems = false;
      }
    }

    const ordersMap = new Map<string, OrderWithItems>();
    for (const row of rows) {
      const orderId = row.id;
      if (!orderId) continue;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: row.id,
          numero: row.numero ?? undefined,
          pre_pedido_id: row.pre_pedido_id ?? undefined,
          pre_pedido_numero: row.pre_pedido_numero ?? undefined,
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
          total: Number(row.total ?? 0),
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: [],
        });
      }
      if (hasItems && row.item_id) {
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

  async findById(id: string, retailerIdOrIds?: string | string[]): Promise<OrderWithItems | null> {
    const ids = Array.isArray(retailerIdOrIds) ? retailerIdOrIds : retailerIdOrIds ? [retailerIdOrIds] : [];
    const values: any[] = [id];
    const retailerFilter =
      ids.length > 0 ? ` AND o.retailer_id IN (${ids.map(() => "?").join(",")})` : "";
    if (ids.length > 0) values.push(...ids);

    let rows: any[];
    let hasItems = true;
    try {
      let q = `SELECT o.*, pp.numero as pre_pedido_numero, oi.id as item_id, oi.model_id, oi.model_name, oi.brand_name, oi.quantity, oi.reconstruction, oi.glass_replacement, oi.parts_available, oi.notes as item_notes
        FROM orders o LEFT JOIN pre_pedidos pp ON o.pre_pedido_id = pp.id LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.id = ?${retailerFilter}`;
      q += " ORDER BY oi.id ASC";
      const [r] = await pool.execute(q, values);
      rows = r as any[];
    } catch {
      let q = `SELECT o.* FROM orders o WHERE o.id = ?${retailerFilter}`;
      const [r] = await pool.execute(q, values);
      rows = r as any[];
      hasItems = false;
    }

    if (rows.length === 0) return null;
    const firstRow = rows[0];
    const order: OrderWithItems = {
      id: firstRow.id,
      numero: firstRow.numero ?? undefined,
      pre_pedido_id: firstRow.pre_pedido_id ?? undefined,
      pre_pedido_numero: firstRow.pre_pedido_numero ?? undefined,
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
      total: Number(firstRow.total ?? 0),
      created_at: firstRow.created_at,
      updated_at: firstRow.updated_at,
      items: [],
    };
    if (hasItems) {
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
    }
    return order;
  }

  async existsByPrePedidoId(prePedidoId: string): Promise<boolean> {
    const [rows] = await pool.execute("SELECT 1 FROM orders WHERE pre_pedido_id = ? LIMIT 1", [prePedidoId]);
    return (rows as any[]).length > 0;
  }

  async create(order: Order, items: OrderItem[]): Promise<OrderWithItems> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [lockRows] = await connection.execute("SELECT GET_LOCK('order_numero', 10) AS l");
      const lockOk = (lockRows as any[])[0]?.l === 1;
      if (!lockOk) {
        await connection.rollback();
        throw new Error("Não foi possível obter bloqueio para gerar número do pedido");
      }
      const [maxRows] = await connection.execute("SELECT COALESCE(MAX(numero), 0) AS m FROM orders");
      const nextNumero = ((maxRows as any[])[0]?.m ?? 0) + 1;
      
      // Inserir pedido
      await connection.execute(
        `INSERT INTO orders (id, numero, pre_pedido_id, retailer_id, company_name, contact_name, email, phone, cnpj, 
         address, city, state, zip_code, notes, status, total) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          order.id,
          nextNumero,
          order.pre_pedido_id ?? null,
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
      
      await connection.execute("SELECT RELEASE_LOCK('order_numero')").catch(() => {});
      await connection.commit();
      
      return (await this.findById(order.id))!;
    } catch (error) {
      await connection.execute("SELECT RELEASE_LOCK('order_numero')").catch(() => {});
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateStatus(id: string, status: Order["status"], retailerIds?: string[]): Promise<OrderWithItems | null> {
    let query = "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    const values: any[] = [status, id];
    const ids = (retailerIds ?? []).filter(Boolean);
    if (ids.length > 0) {
      query += " AND retailer_id IN (" + ids.map(() => "?").join(",") + ")";
      values.push(...ids);
    }
    await pool.execute(query, values);
    return this.findById(id, ids.length > 0 ? ids : undefined);
  }

  async delete(id: string, retailerIds?: string[]): Promise<boolean> {
    let query = "DELETE FROM orders WHERE id = ?";
    const values: any[] = [id];
    const ids = (retailerIds ?? []).filter(Boolean);
    if (ids.length > 0) {
      query += " AND retailer_id IN (" + ids.map(() => "?").join(",") + ")";
      values.push(...ids);
    }
    const [result] = await pool.execute<mysql2.ResultSetHeader>(query, values);
    return result.affectedRows > 0;
  }
}

export default new OrderModel();
