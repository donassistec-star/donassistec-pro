/**
 * Aplica a migration 24_pre_pedidos_contact.sql (campos de contato em pre_pedidos).
 * Uso: cd backend && npx tsx scripts/run-migration-24.ts
 * ou: npm run migrate:pre-pedidos-contact
 * Se as colunas já existirem (Duplicate column name), trata como já aplicada.
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pool from "../src/config/database";

const IGNORE_ERROS = ["Duplicate column name", "duplicate column name"];

async function run() {
  const filePath = path.join(process.cwd(), "database", "migrations", "24_pre_pedidos_contact.sql");
  const sql = fs.readFileSync(filePath, "utf-8");
  try {
    await pool.query(sql);
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (IGNORE_ERROS.some((x) => msg.includes(x))) {
      console.warn("⚠️ Ignorado (já aplicado):", msg.slice(0, 80) + (msg.length > 80 ? "…" : ""));
    } else {
      throw e;
    }
  }
  console.log("✅ Migration 24_pre_pedidos_contact aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
