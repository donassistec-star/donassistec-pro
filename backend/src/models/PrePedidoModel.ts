import pool from "../config/database";

export interface PrePedidoItem {
  model_id: string;
  model_name: string;
  brand_name?: string;
  quantity: number;
  selected_services?: { service_id: string; name: string; price: number }[];
}

export interface PrePedidoRecord {
  id: string;
  session_id: string | null;
  items_json: PrePedidoItem[];
  created_at: string;
  contact_name?: string | null;
  contact_company?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  is_urgent?: number;
  retailer_id?: string | null;
}

const COLS =
  "id, session_id, items_json, created_at, contact_name, contact_company, contact_phone, contact_email, notes, is_urgent, retailer_id";

function mapRow(row: any): PrePedidoRecord {
  return {
    id: row.id,
    session_id: row.session_id,
    items_json: typeof row.items_json === "string" ? JSON.parse(row.items_json) : row.items_json,
    created_at: row.created_at,
    contact_name: row.contact_name ?? null,
    contact_company: row.contact_company ?? null,
    contact_phone: row.contact_phone ?? null,
    contact_email: row.contact_email ?? null,
    notes: row.notes ?? null,
    is_urgent: row.is_urgent ?? 0,
    retailer_id: row.retailer_id ?? null,
  };
}

export interface PrePedidoCreateOpts {
  contact_name?: string | null;
  contact_company?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  is_urgent?: boolean;
  retailer_id?: string | null;
}

class PrePedidoModel {
  async findAll(): Promise<PrePedidoRecord[]> {
    const [rows] = await pool.execute(
      `SELECT ${COLS} FROM pre_pedidos ORDER BY created_at DESC`
    );
    return (rows as any[]).map(mapRow);
  }

  async create(
    id: string,
    items: PrePedidoItem[],
    sessionId?: string,
    opts?: PrePedidoCreateOpts
  ): Promise<PrePedidoRecord> {
    await pool.execute(
      `INSERT INTO pre_pedidos (id, session_id, items_json, contact_name, contact_company, contact_phone, contact_email, notes, is_urgent, retailer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sessionId || null,
        JSON.stringify(items),
        opts?.contact_name ?? null,
        opts?.contact_company ?? null,
        opts?.contact_phone ?? null,
        opts?.contact_email ?? null,
        opts?.notes ?? null,
        opts?.is_urgent ? 1 : 0,
        opts?.retailer_id ?? null,
      ]
    );
    const [rows] = await pool.execute(`SELECT ${COLS} FROM pre_pedidos WHERE id = ?`, [id]);
    return mapRow((rows as any[])[0]);
  }
}

export default new PrePedidoModel();
