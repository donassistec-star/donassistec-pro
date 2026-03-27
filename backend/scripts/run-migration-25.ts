/**
 * Aplica a migration 25_pre_pedidos_need_by.sql (campo need_by em pre_pedidos).
 * Uso: cd backend && npx tsx scripts/run-migration-25.ts
 * ou: npm run migrate:pre-pedidos-need-by
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pool from "../src/config/database";

async function run() {
  const filePath = path.join(process.cwd(), "database", "migrations", "25_pre_pedidos_need_by.sql");
  const sql = fs.readFileSync(filePath, "utf-8");
  await pool.query(sql);
  console.log("✅ Migration 25_pre_pedidos_need_by aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
