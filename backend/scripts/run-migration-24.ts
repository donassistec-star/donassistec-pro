/**
 * Aplica a migration 24_pre_pedidos_contact.sql (campos de contato em pre_pedidos).
 * Uso: cd backend && npx tsx scripts/run-migration-24.ts
 * ou: npm run migrate:pre-pedidos-contact
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pool from "../src/config/database";

async function run() {
  const filePath = path.join(process.cwd(), "database", "migrations", "24_pre_pedidos_contact.sql");
  const sql = fs.readFileSync(filePath, "utf-8");
  await pool.query(sql);
  console.log("✅ Migration 24_pre_pedidos_contact aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
