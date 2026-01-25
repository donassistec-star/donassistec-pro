/**
 * Aplica a migration 23_pre_pedidos.sql (tabela pre_pedidos).
 * Uso: cd backend && npx tsx scripts/run-migration-23.ts
 * ou: npm run migrate:pre-pedidos
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pool from "../src/config/database";

async function run() {
  const filePath = path.join(process.cwd(), "database", "migrations", "23_pre_pedidos.sql");
  const sql = fs.readFileSync(filePath, "utf-8");
  await pool.query(sql);
  console.log("✅ Migration 23_pre_pedidos aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
