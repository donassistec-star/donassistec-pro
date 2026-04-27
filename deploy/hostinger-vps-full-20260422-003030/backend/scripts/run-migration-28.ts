/**
 * Aplica a migration 28_order_items.sql (tabela order_items).
 * Uso: cd backend && npx tsx scripts/run-migration-28.ts
 * ou: npm run migrate:order-items
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import pool from "../src/config/database";

const IGNORE_ERROS = [
  "Duplicate column name",
  "Duplicate key name",
  "duplicate column name",
  "duplicate key name",
];

async function run() {
  const filePath = path.join(process.cwd(), "database", "migrations", "28_order_items.sql");
  const sql = fs.readFileSync(filePath, "utf-8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const st of statements) {
    try {
      await pool.query(st + ";");
    } catch (e: any) {
      const msg = String(e?.message || e);
      if (IGNORE_ERROS.some((x) => msg.includes(x))) {
        console.warn("⚠️ Ignorado (já aplicado):", msg.slice(0, 80) + (msg.length > 80 ? "…" : ""));
      } else {
        throw e;
      }
    }
  }
  console.log("✅ Migration 28_order_items aplicada com sucesso.");
  await pool.end();
  process.exit(0);
}

run().catch(async (err) => {
  console.error("❌ Erro ao aplicar migration:", err.message);
  await pool.end().catch(() => {});
  process.exit(1);
});
