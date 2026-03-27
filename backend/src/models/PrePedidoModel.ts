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
  numero: number;
  session_id: string | null;
  items_json: PrePedidoItem[];
  created_at: string;
  contact_name?: string | null;
  contact_company?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  need_by?: string | null;
  is_urgent?: number;
  retailer_id?: string | null;
  /** ID do pedido criado a partir deste pré-pedido (quando já convertido) */
  order_id?: string | null;
  /** Número do pedido (PED-0001) quando já convertido */
  order_numero?: number | null;
}

/** Formata o número para exibição (ex: 1 → "PRE-0001"). */
export function formatPrePedidoNumero(n: number): string {
  return `PRE-${String(n).padStart(4, "0")}`;
}

const COLS_BASE =
  "p.id, p.numero, p.session_id, p.items_json, p.created_at, p.contact_name, p.contact_company, p.contact_phone, p.contact_email, p.notes, p.need_by, p.is_urgent, p.retailer_id";
const COLS_LEGACY = "id, numero, session_id, items_json, created_at, contact_name, contact_company, contact_phone, contact_email, notes, need_by, is_urgent, retailer_id";

function mapRow(row: any): PrePedidoRecord {
  return {
    id: row.id,
    numero: row.numero ?? 0,
    session_id: row.session_id,
    items_json: typeof row.items_json === "string" ? JSON.parse(row.items_json) : row.items_json,
    created_at: row.created_at,
    contact_name: row.contact_name ?? null,
    contact_company: row.contact_company ?? null,
    contact_phone: row.contact_phone ?? null,
    contact_email: row.contact_email ?? null,
    notes: row.notes ?? null,
    need_by: row.need_by ?? null,
    is_urgent: row.is_urgent ?? 0,
    retailer_id: row.retailer_id ?? null,
    order_id: row.order_id ?? null,
    order_numero: row.order_numero ?? null,
  };
}

export interface PrePedidoCreateOpts {
  contact_name?: string | null;
  contact_company?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  notes?: string | null;
  need_by?: string | null;
  is_urgent?: boolean;
  retailer_id?: string | null;
}

class PrePedidoModel {
  async findAll(retailerIds?: string[]): Promise<PrePedidoRecord[]> {
    const ids = (retailerIds ?? []).filter(Boolean);
    if (retailerIds !== undefined && ids.length === 0) return [];
    const whereClause =
      ids.length > 0
        ? ` WHERE p.retailer_id IN (${ids.map(() => "?").join(",")})`
        : "";
    try {
      const sql = `SELECT ${COLS_BASE}, o.id as order_id, o.numero as order_numero
        FROM pre_pedidos p
        LEFT JOIN orders o ON o.pre_pedido_id = p.id
        ${whereClause} ORDER BY p.numero DESC, p.created_at DESC`;
      const [rows] = await pool.execute(sql, ids);
      return (rows as any[]).map(mapRow);
    } catch {
      const whereLegacy = ids.length > 0 ? ` WHERE retailer_id IN (${ids.map(() => "?").join(",")})` : "";
      const [rows] = await pool.execute(
        `SELECT ${COLS_LEGACY} FROM pre_pedidos${whereLegacy} ORDER BY numero DESC, created_at DESC`,
        ids
      );
      return (rows as any[]).map((r) => ({ ...mapRow(r), order_id: null, order_numero: null }));
    }
  }

  async findById(id: string): Promise<PrePedidoRecord | null> {
    try {
      const [rows] = await pool.execute(
        `SELECT ${COLS_BASE}, o.id as order_id, o.numero as order_numero
         FROM pre_pedidos p
         LEFT JOIN orders o ON o.pre_pedido_id = p.id
         WHERE p.id = ?`,
        [id]
      );
      const row = (rows as any[])[0];
      return row ? mapRow(row) : null;
    } catch {
      const [rows] = await pool.execute(`SELECT ${COLS_LEGACY} FROM pre_pedidos WHERE id = ?`, [id]);
      const row = (rows as any[])[0];
      return row ? { ...mapRow(row), order_id: null, order_numero: null } : null;
    }
  }

  async create(
    id: string,
    items: PrePedidoItem[],
    sessionId?: string,
    opts?: PrePedidoCreateOpts
  ): Promise<PrePedidoRecord> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [lockRows] = await connection.execute("SELECT GET_LOCK('pre_pedido_numero', 10) AS l");
      const lockOk = (lockRows as any[])[0]?.l === 1;
      if (!lockOk) {
        await connection.rollback();
        throw new Error("Não foi possível obter bloqueio para gerar número do pré-pedido");
      }
      const [maxRows] = await connection.execute("SELECT COALESCE(MAX(numero), 0) AS m FROM pre_pedidos");
      const next = ((maxRows as any[])[0]?.m ?? 0) + 1;
      await connection.execute(
        `INSERT INTO pre_pedidos (id, numero, session_id, items_json, contact_name, contact_company, contact_phone, contact_email, notes, need_by, is_urgent, retailer_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          next,
          sessionId || null,
          JSON.stringify(items),
          opts?.contact_name ?? null,
          opts?.contact_company ?? null,
          opts?.contact_phone ?? null,
          opts?.contact_email ?? null,
          opts?.notes ?? null,
          opts?.need_by ?? null,
          opts?.is_urgent ? 1 : 0,
          opts?.retailer_id ?? null,
        ]
      );
      await connection.commit();
      await connection.execute("SELECT RELEASE_LOCK('pre_pedido_numero')");
      const [rows] = await connection.execute(`SELECT ${COLS_LEGACY} FROM pre_pedidos WHERE id = ?`, [id]);
      return mapRow((rows as any[])[0]);
    } catch (e) {
      await connection.execute("SELECT RELEASE_LOCK('pre_pedido_numero')").catch(() => {});
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
  }
}

export default new PrePedidoModel();
